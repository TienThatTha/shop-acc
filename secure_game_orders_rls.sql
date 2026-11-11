-- =============================================================================
-- KHÓA BẢNG game_orders: client KHÔNG được tạo đơn gói nạp pack_* (chỉ qua rpc_buy_boss_package),
-- KHÔNG được UPDATE/DELETE. Server game dùng service_role nên không bị ảnh hưởng.
-- CHỈ CHẠY SAU KHI: (1) server đã đổi sang service_role key, (2) web mới đã deploy.
-- =============================================================================
DROP POLICY IF EXISTS "Allow all on game_orders" ON public.game_orders;
DROP POLICY IF EXISTS "game_orders_select_all" ON public.game_orders;
DROP POLICY IF EXISTS "game_orders_insert_non_pack" ON public.game_orders;

CREATE POLICY "game_orders_select_all"
ON public.game_orders FOR SELECT TO public
USING (true);

CREATE POLICY "game_orders_insert_non_pack"
ON public.game_orders FOR INSERT TO public
WITH CHECK (status = 'pending' AND COALESCE(package_id, '') NOT LIKE 'pack\_%');

-- (Không tạo policy UPDATE/DELETE => client bị chặn hoàn toàn)

