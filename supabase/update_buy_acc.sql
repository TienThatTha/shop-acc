-- 1. Thêm cột 'stock' vào bảng 'accounts' (nếu chưa có)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS stock integer DEFAULT 1;

-- 2. Xóa hàm cũ nếu cần thiết (Tùy chọn)
-- DROP FUNCTION IF EXISTS public.m_buy_acc_v2;

-- 3. Tạo hàm RPC mới có hỗ trợ mua nhiều nick cùng lúc (soluong)
CREATE OR REPLACE FUNCTION public.m_buy_acc_v2(nick_id uuid, khach_id uuid, soluong integer DEFAULT 1)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_acc record;
  v_user record;
  v_total_price bigint;
  v_current_stock integer;
BEGIN
  -- 1. Lock nick để chống mua trùng lúc (Concurrency)
  SELECT * INTO v_acc FROM accounts WHERE id = nick_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Nick không tồn tại!');
  END IF;

  IF v_acc.is_sold = true THEN
    RETURN json_build_object('success', false, 'message', 'Nick này đã bị mua!');
  END IF;

  -- 2. Kiểm tra tồn kho
  v_current_stock := COALESCE(v_acc.stock, 1);
  IF v_current_stock < soluong THEN
    RETURN json_build_object('success', false, 'message', 'Không đủ số lượng tồn kho!');
  END IF;

  -- 3. Tính toán tổng tiền
  v_total_price := v_acc.price * soluong;

  -- 4. Kiểm tra số dư người mua
  SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Tài khoản không tồn tại!');
  END IF;

  IF COALESCE(v_user.balance, 0) < v_total_price THEN
    RETURN json_build_object('success', false, 'message', 'Số dư không đủ để thanh toán!');
  END IF;

  -- 5. Trừ tiền người mua
  UPDATE users 
  SET balance = balance - v_total_price 
  WHERE id = khach_id;

  -- 6. Cập nhật tồn kho hoặc đánh dấu đã bán
  IF v_current_stock - soluong <= 0 THEN
    UPDATE accounts 
    SET is_sold = true, stock = 0 
    WHERE id = nick_id;
  ELSE
    UPDATE accounts 
    SET stock = v_current_stock - soluong 
    WHERE id = nick_id;
  END IF;

  -- 7. Ghi lại lịch sử giao dịch
  INSERT INTO transactions ("user", action, amount, created_at)
  VALUES (v_user.name, 'Mua đứt nick ' || v_acc.code || ' (x' || soluong || ')', -v_total_price, NOW());

  RETURN json_build_object('success', true, 'message', 'Mua nick thành công!');
END;
$function$;

-- 8. BẬT REALTIME CHO CÁC BẢNG QUAN TRỌNG ĐỂ GIAO DIỆN TỰ ĐỘNG CẬP NHẬT
ALTER PUBLICATION supabase_realtime ADD TABLE deposit_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
