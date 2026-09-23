-- =============================================================================
-- BẢNG LƯU THÔNG TIN NGƯỜI CHƠI GAME MỘNG THIÊN HUYỄN (ĐỒNG BỘ CLOUD)
-- Hướng dẫn: Copy nội dung file này dán vào SQL Editor trên Supabase Dashboard và bấm RUN
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.game_players (
  user_id text PRIMARY KEY,
  nickname text,
  level int DEFAULT 1,
  cp bigint DEFAULT 0,
  bonus_attacks bigint DEFAULT 0,
  royal_chests int DEFAULT 0,
  boss_chests int DEFAULT 0,
  avatar_url text,
  weapon text,
  armor text,
  pants text,
  pet text,
  ring text,
  necklace text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Nếu bảng đã tồn tại sẵn, chạy lệnh sau để bổ sung cột pants:
-- ALTER TABLE public.game_players ADD COLUMN IF NOT EXISTS pants text;

-- Cấp quyền truy cập đọc/ghi an toàn cho Client và Bot
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on game_players" ON public.game_players;
CREATE POLICY "Allow all on game_players" 
ON public.game_players 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Bật Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
