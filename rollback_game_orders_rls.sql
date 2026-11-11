-- =============================================================================
-- ROLLBACK RLS game_orders: Khôi phục quyền truy cập như ban đầu
-- =============================================================================
DROP POLICY IF EXISTS "game_orders_select_all" ON public.game_orders;
DROP POLICY IF EXISTS "game_orders_insert_non_pack" ON public.game_orders;
DROP POLICY IF EXISTS "Allow all on game_orders" ON public.game_orders;

CREATE POLICY "Allow all on game_orders" 
ON public.game_orders 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

