-- =============================================================================
-- RPC MUA GÓI NẠP GAME BOSS AN TOÀN: trừ tiền + ghi giao dịch + tạo đơn trong 1 transaction
-- Giá & tên gói do SERVER tự tra (phải khớp BOSS_GAME_PACKAGES trong App.jsx và WEB_TOPUP_PACKAGES trong game_core.py)
-- Hướng dẫn: Copy toàn bộ file dán vào Supabase SQL Editor và bấm RUN
-- =============================================================================
CREATE OR REPLACE FUNCTION public.rpc_buy_boss_package(
  p_package_id text,
  p_target_uid text,
  p_nickname text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid text;
  v_user record;
  v_price numeric;
  v_name text;
  v_target text;
  v_nick text;
  v_order_id text;
  v_now text;
BEGIN
  v_uid := current_setting('request.jwt.claims', true)::jsonb->>'sub';
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập!');
  END IF;

  v_target := ltrim(btrim(COALESCE(p_target_uid, '')), '@');
  IF v_target = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Thiếu ID nhân vật game!');
  END IF;
  v_nick := COALESCE(NULLIF(btrim(COALESCE(p_nickname, '')), ''), v_target);

  SELECT p.price, p.name INTO v_price, v_name FROM (VALUES
    ('pack_1', 20000,   'Gói 1: Tân Thủ Khởi Đầu'),
    ('pack_2', 50000,   'Gói 2: Dũng Sĩ Chiến Trường'),
    ('pack_3', 100000,  'Gói 3: Chiến Tướng Oai Vệ'),
    ('pack_4', 200000,  'Gói 4: Thần Tướng Trảm Yêu'),
    ('pack_5', 500000,  'Gói 5: Đại Hiệp Xuất Chúng'),
    ('pack_6', 1000000, 'Gói 6: Ma Vương Diệt Thế'),
    ('pack_7', 1500000, 'Gói 7: Cổ Đại Tôn Giả'),
    ('pack_8', 2500000, 'Gói 8: Thượng Cổ Chí Tôn')
  ) AS p(id, price, name)
  WHERE p.id = p_package_id;

  IF v_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Gói nạp không tồn tại!');
  END IF;

  SELECT * INTO v_user FROM users WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Tài khoản không tồn tại!');
  END IF;
  IF COALESCE(v_user.balance, 0) < v_price THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ!');
  END IF;

  UPDATE users SET balance = balance - v_price WHERE id = v_uid;

  v_order_id := 'BG_' || (extract(epoch FROM clock_timestamp()) * 1000)::bigint || '_' || upper(substr(md5(random()::text), 1, 5));
  v_now := to_char(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');

  INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost", "accDetails")
  VALUES (
    v_order_id, v_user.name, 'Nạp ' || v_name || ' [' || v_target || ']', v_price, v_now,
    'Đã hoàn tất', 'boss_game_topup', false,
    jsonb_build_object('order_id', v_order_id, 'user_id', v_target, 'nickname', v_nick,
                       'package_id', p_package_id, 'package_name', v_name, 'price', v_price, 'web_user', v_uid)
  );

  -- rewards để rỗng: server game tự tra phần thưởng từ WEB_TOPUP_PACKAGES (Phần A)
  INSERT INTO game_orders (id, user_id, nickname, web_user, package_id, package_name, price, rewards, status)
  VALUES (v_order_id, v_target, v_nick, v_uid, p_package_id, v_name, v_price, '{}'::jsonb, 'pending');

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'new_balance', COALESCE(v_user.balance, 0) - v_price);
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_buy_boss_package(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_buy_boss_package(text, text, text) TO authenticated;

