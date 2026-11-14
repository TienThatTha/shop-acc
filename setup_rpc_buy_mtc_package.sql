-- =============================================================================
-- RPC MUA GÓI NẠP VÍ GAME MỘNG THIÊN CỬU H5 AN TOÀN (TRÊN SHOPTIEINGAMING.COM)
-- Cộng trực tiếp vào Số Dư Ví Nền Tảng (sdk.users.rmb, quy ước 1 rmb = 1.000đ = 4 Linh Ngọc)
-- + Tự động gửi Thư Tặng Kèm (Ngọc Khóa & Đồng) vào nhân vật trong game.
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào Supabase SQL Editor và bấm RUN.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.rpc_buy_mtc_package(
  p_package_id text,
  p_game_username text,
  p_server_id text DEFAULT '1'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid text;
  v_user record;
  v_price numeric;
  v_rmb_add numeric;
  v_bonus_bgold integer;
  v_bonus_coin bigint;
  v_name text;
  v_target text;
  v_server text;
  v_order_id text;
  v_now text;
BEGIN
  v_uid := current_setting('request.jwt.claims', true)::jsonb->>'sub';
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập tài khoản Shop Tiến Gaming!');
  END IF;

  v_target := btrim(COALESCE(p_game_username, ''));
  IF v_target = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vui lòng nhập Tên đăng nhập (hoặc UID) tài khoản Mộng Thiên Cửu!');
  END IF;

  v_server := COALESCE(NULLIF(btrim(COALESCE(p_server_id, '1')), ''), '1');

  SELECT p.price, p.rmb_add, p.bonus_bgold, p.bonus_coin, p.name
  INTO v_price, v_rmb_add, v_bonus_bgold, v_bonus_coin, v_name
  FROM (VALUES
    ('mtc_rmb_20k',   20000,   20,   20,   500000,   'Gói Ví Game 20k (Đổi 80 Linh Ngọc)'),
    ('mtc_rmb_50k',   50000,   50,   50,   1500000,  'Gói Ví Game 50k (Đổi 200 Linh Ngọc)'),
    ('mtc_rmb_100k',  100000,  100,  120,  3000000,  'Gói Ví Game 100k (Đổi 400 Ngọc / Thẻ Tháng)'),
    ('mtc_rmb_200k',  200000,  200,  300,  6000000,  'Gói Ví Game 200k (Đổi 800 Linh Ngọc)'),
    ('mtc_rmb_500k',  500000,  550,  800,  15000000, 'Gói Ví Game 500k (+10% KM = 550k Ví)'),
    ('mtc_rmb_1000k', 1000000, 1150, 2000, 35000000, 'Gói Ví Game 1 Triệu (+15% KM = 1tr15 Ví)'),
    ('mtc_rmb_2000k', 2000000, 2400, 5000, 80000000, 'Gói Ví Game 2 Triệu (+20% KM = 2tr4 Ví)')
  ) AS p(id, price, rmb_add, bonus_bgold, bonus_coin, name)
  WHERE p.id = p_package_id;

  IF v_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Gói nạp Mộng Thiên Cửu không tồn tại!');
  END IF;

  SELECT * INTO v_user FROM users WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy tài khoản web!');
  END IF;
  IF COALESCE(v_user.balance, 0) < v_price THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số dư ví web không đủ! Vui lòng nạp thêm tiền vào ví.');
  END IF;

  UPDATE users SET balance = balance - v_price WHERE id = v_uid;

  v_order_id := 'MTC_' || (extract(epoch FROM clock_timestamp()) * 1000)::bigint || '_' || upper(substr(md5(random()::text), 1, 5));
  v_now := to_char(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');

  INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost", "accDetails")
  VALUES (
    v_order_id,
    v_user.name,
    'Nạp ' || v_name || ' [TK: ' || v_target || ']',
    v_price,
    v_now,
    'Đã hoàn tất',
    'mtc_game_topup',
    false,
    jsonb_build_object(
      'order_id', v_order_id,
      'game', 'mongthiencuu',
      'game_username', v_target,
      'server_id', v_server,
      'package_id', p_package_id,
      'package_name', v_name,
      'price', v_price,
      'rmb_add', v_rmb_add,
      'web_user', v_uid
    )
  );

  INSERT INTO game_orders (id, user_id, nickname, web_user, package_id, package_name, price, rewards, status)
  VALUES (
    v_order_id,
    v_target,
    v_target,
    v_uid,
    p_package_id,
    v_name,
    v_price,
    jsonb_build_object(
      'game', 'mongthiencuu',
      'server_id', v_server,
      'rmb_add', v_rmb_add,
      'bonus_bgold', v_bonus_bgold,
      'bonus_coin', v_bonus_coin,
      'web_user_id', v_uid,
      'web_user_name', v_user.name
    ),
    'pending'
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'rmb_add', v_rmb_add,
    'new_balance', COALESCE(v_user.balance, 0) - v_price
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_buy_mtc_package(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_buy_mtc_package(text, text, text) TO authenticated;


-- =============================================================================
-- RPC DÀNH RIÊNG CHO BRIDGE SERVER MỘNG THIÊN CỬU HOÀN TẤT / HOÀN TIỀN ĐƠN HÀNG
-- (Bảo mật bằng secret, hoạt động ổn định kể cả khi khóa UPDATE bảng game_orders)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.rpc_complete_mtc_order(
  p_bridge_secret text,
  p_order_id text,
  p_status text,
  p_result jsonb,
  p_refund boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_expected_secret text := 'MTC_BRIDGE_2026_S0_SECRET_KEY';
  v_now text;
BEGIN
  IF COALESCE(p_bridge_secret, '') <> v_expected_secret THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized bridge secret');
  END IF;

  SELECT * INTO v_order FROM game_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  IF v_order.status <> 'pending' THEN
    RETURN jsonb_build_object('success', true, 'already_processed', true, 'status', v_order.status);
  END IF;

  UPDATE game_orders
  SET status = p_status,
      completed_at = NOW(),
      nickname = COALESCE(NULLIF(p_result->>'nickname', ''), nickname),
      result = COALESCE(p_result, '{}'::jsonb)
  WHERE id = p_order_id;

  IF p_status = 'failed' AND p_refund = true AND COALESCE(v_order.price, 0) > 0 AND COALESCE(v_order.web_user, '') <> '' THEN
    UPDATE users SET balance = COALESCE(balance, 0) + v_order.price WHERE id = v_order.web_user;
    UPDATE transactions SET status = 'Hoàn tiền (Sai TK game)' WHERE id = p_order_id;

    v_now := to_char(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');
    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost", "accDetails")
    SELECT
      'REFUND_' || p_order_id,
      name,
      'Hoàn tiền nạp Mộng Thiên Cửu (Không tìm thấy TK: ' || v_order.user_id || ')',
      v_order.price,
      v_now,
      'Đã hoàn tiền',
      'refund',
      false,
      jsonb_build_object('refund_for', p_order_id, 'amount', v_order.price)
    FROM users WHERE id = v_order.web_user;
  END IF;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', p_status);
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_complete_mtc_order(text, text, text, jsonb, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_complete_mtc_order(text, text, text, jsonb, boolean) TO anon, authenticated;
