-- =============================================================================
-- BẢO VỆ & RPC NHẬN LƯỢT QUAY MAY MẮN TỪ GAME (ATOMIC & IDEMPOTENT)
-- 1. Cập nhật policy game_orders_insert_non_pack: CẤM tuyệt đối client (anon/auth)
--    tạo đơn package_id = 'add_spin_tickets'. Chỉ bot game (service_role) mới được tạo.
-- 2. Hàm rpc_claim_spin_tickets: chạy SECURITY DEFINER, kiểm tra auth.uid khớp chủ đơn,
--    khóa dòng FOR UPDATE, chỉ chuyển pending -> completed đúng 1 lần duy nhất,
--    cộng lượt quay vào bảng users và ghi lịch sử transactions trong 1 transaction ACID.
-- Hướng dẫn: Copy toàn bộ file dán vào Supabase SQL Editor và bấm RUN
-- =============================================================================

-- BƯỚC 1: CẬP NHẬT POLICY INSERT TRÊN BẢNG game_orders
-- Chặn kẻ xấu tự tạo đơn add_spin_tickets để tự buff vé quay
DROP POLICY IF EXISTS "game_orders_insert_non_pack" ON public.game_orders;

CREATE POLICY "game_orders_insert_non_pack"
ON public.game_orders FOR INSERT TO public
WITH CHECK (
  status = 'pending'
  AND COALESCE(package_id, '') NOT LIKE 'pack\_%'
  AND COALESCE(package_id, '') <> 'add_spin_tickets'
);

-- BƯỚC 2: TẠO HÀM RPC CLAIM VÉ QUAY AN TOÀN
CREATE OR REPLACE FUNCTION public.rpc_claim_spin_tickets(
  p_order_ids text[]
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid text;
  v_user record;
  v_ord record;
  v_total_spins int := 0;
  v_claimed_ids text[] := '{}'::text[];
  v_new_spins int;
  v_sp_count int;
  v_linked_game_clean text;
  v_tx_id text;
  v_now text;
BEGIN
  -- 1. Xác thực người dùng hiện tại qua JWT claims
  v_uid := current_setting('request.jwt.claims', true)::jsonb->>'sub';
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập!');
  END IF;

  IF p_order_ids IS NULL OR array_length(p_order_ids, 1) IS NULL OR array_length(p_order_ids, 1) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Danh sách đơn hàng trống!');
  END IF;

  -- 2. Khóa dòng và kiểm tra thông tin user
  SELECT * INTO v_user FROM users WHERE id::text = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
  END IF;

  v_linked_game_clean := lower(ltrim(COALESCE(v_user.linked_game_id, ''), '@'));

  -- 3. Duyệt và khóa các đơn hàng pending hợp lệ thuộc sở hữu của user
  -- Khớp chính xác logic client cũ (App.jsx L1636-L1646 & L2013-L2015):
  -- Khớp web_user = v_uid HOẶC game_uid = linked_game_id
  FOR v_ord IN
    SELECT id, rewards, user_id, web_user
    FROM game_orders
    WHERE id = ANY(p_order_ids)
      AND package_id = 'add_spin_tickets'
      AND status = 'pending'
      AND (
        web_user::text = v_uid
        OR (v_linked_game_clean <> '' AND lower(ltrim(COALESCE(user_id, ''), '@')) = v_linked_game_clean)
      )
    FOR UPDATE
  LOOP
    -- Trích xuất số vé từ rewards->>'spins' hoặc rewards->>'tickets' khớp L1652 & L2017
    v_sp_count := COALESCE(
      NULLIF((v_ord.rewards->>'spins'), '')::int,
      NULLIF((v_ord.rewards->>'tickets'), '')::int,
      0
    );
    IF v_sp_count > 0 THEN
      v_total_spins := v_total_spins + v_sp_count;
      v_claimed_ids := array_append(v_claimed_ids, v_ord.id);
    END IF;
  END LOOP;

  -- 4. Nếu không có đơn nào hợp lệ cần nhận (đã nhận trước đó hoặc không khớp chủ sở hữu)
  IF array_length(v_claimed_ids, 1) IS NULL OR array_length(v_claimed_ids, 1) = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'claimed_spins', 0,
      'new_spins', COALESCE(v_user.spins, 0),
      'message', 'Không có đơn nào cần xử lý'
    );
  END IF;

  -- 5. Cập nhật trạng thái các đơn đã nhận sang completed
  UPDATE game_orders
  SET status = 'completed', completed_at = now()
  WHERE id = ANY(v_claimed_ids);

  -- 6. Cộng lượt quay cho user
  v_new_spins := COALESCE(v_user.spins, 0) + v_total_spins;
  UPDATE users
  SET spins = v_new_spins
  WHERE id::text = v_uid;

  -- 7. Ghi nhận giao dịch vào transactions đồng bộ nguyên tử
  v_tx_id := 'tx_spin_claim_' || floor(extract(epoch from now()) * 1000)::text || '_' || upper(substr(md5(random()::text), 1, 4));
  v_now := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');
  INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
  VALUES (
    v_tx_id,
    v_user.name,
    'Nhận +' || v_total_spins || ' Lượt Quay Vòng Quay từ Game',
    0,
    v_now,
    'Đã hoàn tất',
    'spin_ticket_claim',
    false
  );

  RETURN jsonb_build_object(
    'success', true,
    'claimed_spins', v_total_spins,
    'new_spins', v_new_spins,
    'claimed_order_ids', v_claimed_ids
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_claim_spin_tickets(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_claim_spin_tickets(text[]) TO authenticated;
