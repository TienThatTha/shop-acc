-- =============================================================================
-- BẢNG ĐỒNG BỘ ĐƠN NẠP GAME MỘNG THIÊN HUYỄN (TIẾN GAMING)
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào mục SQL Editor trên Supabase Dashboard và bấm RUN
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.game_orders (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  nickname text,
  web_user text,
  package_id text,
  package_name text,
  price bigint,
  rewards jsonb,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  result jsonb
);

-- Bật Row Level Security (RLS) và cấp quyền truy cập an toàn cho Client & Bot Game
ALTER TABLE public.game_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on game_orders" ON public.game_orders;
CREATE POLICY "Allow all on game_orders" 
ON public.game_orders 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Bật thông báo Realtime nếu cần
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_orders;
