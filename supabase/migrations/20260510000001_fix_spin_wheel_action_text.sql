-- Fix: Bỏ "Cộng " dư thừa trong action text, đổi text trượt thành "Chúc may mắn lần sau"
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

    -- 3. Tính tổng tỉ lệ (FIX: xử lý rate dạng "85%" hoặc "0,5%")
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
