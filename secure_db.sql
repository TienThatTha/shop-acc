-- 1. TRIGGER BẢO VỆ BẢNG USERS CHỐNG HACKER TỰ UPDATE SỐ DƯ
CREATE OR REPLACE FUNCTION check_user_update()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_uid text;
BEGIN
  -- Cho phép các tác vụ từ hệ thống (Postgres/Supabase Admin)
  IF current_user = 'postgres' OR current_user = 'supabase_admin' THEN
    RETURN NEW;
  END IF;

  -- Cho phép các tác vụ từ Edge Functions (Service Role)
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Chỉ kiểm tra nếu các cột nhạy cảm bị thay đổi
  IF NEW.balance IS DISTINCT FROM OLD.balance 
     OR NEW.spins IS DISTINCT FROM OLD.spins 
     OR NEW.rentFund IS DISTINCT FROM OLD.rentFund 
     OR NEW.role IS DISTINCT FROM OLD.role THEN
     
    -- Lấy ID người đang gọi API
    v_uid := current_setting('request.jwt.claims', true)::jsonb->>'sub';
    
    -- Lấy role thực tế trong Database
    SELECT role INTO v_role FROM users WHERE id = v_uid;
    
    -- Nếu không phải admin thì chặn ngay lập tức
    IF v_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Access Denied: Hacker detect! Hành vi tự cộng tiền hoặc đổi role đã bị chặn.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn Trigger vào bảng users
DROP TRIGGER IF EXISTS trg_check_user_update ON users;
CREATE TRIGGER trg_check_user_update
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_user_update();

-- 2. RPC: HÀM TRỪ TIỀN VÀ GHI LỊCH SỬ AN TOÀN CHO KHÁCH HÀNG (Mua nick, Thuê nick, Cày thuê)
CREATE OR REPLACE FUNCTION rpc_client_spend(
    p_amount float,
    p_fund_amount float,
    p_tx_data jsonb
) RETURNS jsonb AS $$
DECLARE
  v_uid text;
  v_user record;
BEGIN
  -- Lấy ID khách hàng
  v_uid := current_setting('request.jwt.claims', true)::jsonb->>'sub';
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập!');
  END IF;

  -- Chống hack truyền số âm để tự cộng tiền
  IF p_amount < 0 OR p_fund_amount < 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số tiền không hợp lệ!');
  END IF;

  -- Khóa dòng dữ liệu để tránh lỗi bất đồng bộ (Race condition)
  SELECT * INTO v_user FROM users WHERE id = v_uid FOR UPDATE;
  
  IF v_user.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ!');
  END IF;

  IF COALESCE(v_user."rentFund", 0) < p_fund_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Quỹ bảo lưu không đủ!');
  END IF;

  -- Tiến hành trừ tiền
  UPDATE users 
  SET balance = balance - p_amount, 
      "rentFund" = COALESCE("rentFund", 0) - p_fund_amount
  WHERE id = v_uid;

  -- Ghi lịch sử giao dịch
  IF jsonb_typeof(p_tx_data) = 'array' THEN
    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost", "accDetails")
    SELECT 
      x->>'id', x->>'user', x->>'action', (x->>'amount')::float, x->>'date', x->>'status', x->>'type', COALESCE((x->>'isSpinCost')::boolean, false), x->'accDetails'
    FROM jsonb_array_elements(p_tx_data) x;
  ELSE
    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost", "accDetails")
    VALUES (
      p_tx_data->>'id', p_tx_data->>'user', p_tx_data->>'action', (p_tx_data->>'amount')::float, p_tx_data->>'date', p_tx_data->>'status', p_tx_data->>'type', COALESCE((p_tx_data->>'isSpinCost')::boolean, false), p_tx_data->'accDetails'
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC: HÀM CHUYỂN TIỀN GIỮA 2 NGƯỜI AN TOÀN
CREATE OR REPLACE FUNCTION rpc_transfer_money(
    p_receiver_phone text,
    p_amount float,
    p_fee float,
    p_tx_sender jsonb,
    p_tx_receiver jsonb
) RETURNS jsonb AS $$
DECLARE
  v_uid text;
  v_sender record;
  v_receiver record;
  v_total float;
BEGIN
  v_uid := current_setting('request.jwt.claims', true)::jsonb->>'sub';
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập!');
  END IF;

  IF p_amount <= 0 OR p_fee < 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số tiền không hợp lệ!');
  END IF;

  v_total := p_amount + p_fee;

  SELECT * INTO v_sender FROM users WHERE id = v_uid FOR UPDATE;
  IF v_sender.balance < v_total THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ!');
  END IF;

  SELECT * INTO v_receiver FROM users WHERE phone = p_receiver_phone FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Người nhận không tồn tại!');
  END IF;

  IF v_sender.id = v_receiver.id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không thể chuyển cho chính mình!');
  END IF;

  -- Tiến hành trừ và cộng tiền
  UPDATE users SET balance = balance - v_total WHERE id = v_sender.id;
  UPDATE users SET balance = balance + p_amount WHERE id = v_receiver.id;

  -- Ghi lịch sử giao dịch
  INSERT INTO transactions (id, "user", action, amount, date, status, type, "accDetails")
  VALUES 
    (p_tx_sender->>'id', p_tx_sender->>'user', p_tx_sender->>'action', (p_tx_sender->>'amount')::float, p_tx_sender->>'date', p_tx_sender->>'status', p_tx_sender->>'type', p_tx_sender->'accDetails'),
    (p_tx_receiver->>'id', p_tx_receiver->>'user', p_tx_receiver->>'action', (p_tx_receiver->>'amount')::float, p_tx_receiver->>'date', p_tx_receiver->>'status', p_tx_receiver->>'type', p_tx_receiver->'accDetails');

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: HÀM VÒNG QUAY AN TOÀN (Fixed: xử lý rate dạng "85%" hoặc "0,1%")
CREATE OR REPLACE FUNCTION public.m_spin_wheel(
    khach_id text,
    p_wheel_type text,
    p_cost numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
    v_total_rate numeric := 0;
    v_rand numeric;
    v_cumulative numeric := 0;
    v_winner record;
    v_new_balance numeric;
    v_new_spins numeric;
    v_new_fund numeric;
    v_tx_id text;
    v_now text;
    v_item_rate numeric;
    v_item record;
BEGIN
    -- 1. Lấy thông tin người dùng và khóa dòng
    SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    -- 2. Kiểm tra số dư / lượt quay
    IF p_wheel_type = 'money' THEN
        IF v_user.balance < p_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ để quay!');
        END IF;
        IF p_cost <= 0 THEN
            RETURN jsonb_build_object('success', false, 'message', 'Chi phí quay không hợp lệ!');
        END IF;
    ELSE
        IF COALESCE(v_user.spins, 0) < p_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Bạn không có đủ lượt quay!');
        END IF;
    END IF;

    -- 3. Tính tổng tỉ lệ
    -- FIX: REPLACE('%','') để xử lý "85%", REPLACE(',','.') để xử lý "0,5%"
    SELECT SUM(CAST(REPLACE(REPLACE(rate::text, '%', ''), ',', '.') AS numeric))
    INTO v_total_rate
    FROM wheel_items
    WHERE wheel_type = p_wheel_type
      AND (quantity IS NULL OR quantity > 0);

    IF v_total_rate IS NULL OR v_total_rate <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không có phần thưởng nào khả dụng!');
    END IF;

    -- 4. Quay số ngẫu nhiên
    v_rand := random() * v_total_rate;

    -- 5. Tìm phần thưởng trúng thưởng theo xác suất tích lũy
    FOR v_item IN
        SELECT * FROM wheel_items
        WHERE wheel_type = p_wheel_type
          AND (quantity IS NULL OR quantity > 0)
        ORDER BY id
    LOOP
        v_item_rate := CAST(REPLACE(REPLACE(v_item.rate::text, '%', ''), ',', '.') AS numeric);
        v_cumulative := v_cumulative + v_item_rate;
        IF v_rand <= v_cumulative THEN
            v_winner := v_item;
            EXIT;
        END IF;
    END LOOP;

    -- Fallback: nếu không tìm được, lấy item cuối
    IF v_winner IS NULL THEN
        SELECT * INTO v_winner FROM wheel_items
        WHERE wheel_type = p_wheel_type
          AND (quantity IS NULL OR quantity > 0)
        ORDER BY id DESC LIMIT 1;
    END IF;

    -- 6. Tính số dư mới
    v_new_balance := v_user.balance;
    v_new_spins := COALESCE(v_user.spins, 0);
    v_new_fund := COALESCE(v_user."rentFund", 0);

    -- 7. Trừ chi phí quay
    IF p_wheel_type = 'money' THEN
        v_new_balance := v_new_balance - p_cost;
    ELSE
        v_new_spins := v_new_spins - p_cost;
    END IF;

    -- 8. Phát thưởng
    IF v_winner.type = 'money' THEN
        v_new_balance := v_new_balance + COALESCE(v_winner.value, 0);
    ELSIF v_winner.type = 'spin' THEN
        v_new_spins := v_new_spins + COALESCE(v_winner.value, 0);
    ELSIF v_winner.type = 'fund' THEN
        v_new_fund := v_new_fund + COALESCE(v_winner.value, 0);
    END IF;

    -- 9. Giảm số lượng phần thưởng
    IF v_winner.quantity IS NOT NULL THEN
        UPDATE wheel_items SET quantity = quantity - 1 WHERE id = v_winner.id;
    END IF;

    -- 10. Cập nhật số dư người dùng
    UPDATE users
    SET balance = v_new_balance,
        spins = v_new_spins,
        "rentFund" = v_new_fund
    WHERE id = khach_id;

    -- 11. Ghi lịch sử giao dịch
    v_now := to_char(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');
    v_tx_id := gen_random_uuid()::text;

    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
    VALUES (
        v_tx_id,
        v_user.name,
        CASE
            WHEN v_winner.type = 'none' THEN 'Chúc may mắn lần sau'
            ELSE 'Trúng phần thưởng: ' || v_winner.name
        END,
        COALESCE(v_winner.value, 0),
        v_now,
        'Thành công',
        'spin_win',
        CASE WHEN v_winner.type = 'spin' THEN true ELSE false END
    );

    -- 12. Trả về kết quả cho Frontend
    RETURN jsonb_build_object(
        'success', true,
        'item_id', v_winner.id,
        'item_name', v_winner.name,
        'item_type', v_winner.type,
        'item_value', v_winner.value,
        'new_balance', v_new_balance,
        'new_spins', v_new_spins,
        'new_fund', v_new_fund
    );
END;
$$;
