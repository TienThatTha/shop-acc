-- RPC: Admin hoàn tiền cho khách khi hủy đơn cày thuê
CREATE OR REPLACE FUNCTION rpc_admin_refund(
    p_target_phone text,
    p_amount float,
    p_tx_data jsonb
) RETURNS jsonb AS $$
DECLARE
  v_uid text;
  v_admin record;
  v_target record;
BEGIN
  -- Xác thực admin
  v_uid := current_setting('request.jwt.claims', true)::jsonb->>'sub';
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập!');
  END IF;

  SELECT * INTO v_admin FROM users WHERE id = v_uid;
  IF v_admin.role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Chỉ Admin mới được hoàn tiền!');
  END IF;

  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số tiền hoàn không hợp lệ!');
  END IF;

  -- Tìm user cần hoàn tiền
  SELECT * INTO v_target FROM users WHERE phone = p_target_phone FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy người dùng!');
  END IF;

  -- Cộng tiền hoàn lại cho khách
  UPDATE users SET balance = balance + p_amount WHERE id = v_target.id;

  -- Ghi lịch sử giao dịch hoàn tiền
  INSERT INTO transactions (id, "user", action, amount, date, status, type, "accDetails")
  VALUES (
    p_tx_data->>'id', p_tx_data->>'user', p_tx_data->>'action', (p_tx_data->>'amount')::float,
    p_tx_data->>'date', p_tx_data->>'status', p_tx_data->>'type', p_tx_data->'accDetails'
  );

  RETURN jsonb_build_object('success', true, 'new_balance', v_target.balance + p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
