-- =============================================================================
-- FIX CÀI ĐẶT KHUYẾN MÃI & DUYỆT / XOÁ ĐƠN NẠP TRÊN PANEL ADMIN SHOP TIEN GAMING
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào mục SQL Editor trên Supabase Dashboard và bấm RUN
-- =============================================================================

-- 1. Đảm bảo bảng site_config tồn tại
CREATE TABLE IF NOT EXISTS public.site_config (
    id text PRIMARY KEY,
    value jsonb,
    updated_at timestamptz DEFAULT now()
);

-- Khởi tạo mốc nạp khuyến mãi mặc định nếu chưa có
INSERT INTO public.site_config (id, value)
VALUES (
    'deposit_bonus',
    '{"minAmount": 50000, "bonusSpins": 1}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Bật Row Level Security (RLS) cho bảng site_config
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả mọi người đọc cấu hình công khai
DROP POLICY IF EXISTS "Public Read Site Config" ON public.site_config;
CREATE POLICY "Public Read Site Config" ON public.site_config 
FOR SELECT TO public USING (true);

-- Cho phép cập nhật / thêm cấu hình cho toàn bộ người dùng hợp lệ / Admin
DROP POLICY IF EXISTS "Auth Manage Site Config" ON public.site_config;
CREATE POLICY "Auth Manage Site Config" ON public.site_config 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- 3. Cập nhật phân quyền cho bảng deposit_requests để đảm bảo Admin có thể Xoá & Duyệt đơn
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- Cho phép Admin và người dùng thực hiện SELECT, INSERT, UPDATE, DELETE đơn nạp
DROP POLICY IF EXISTS "Auth Deposit" ON public.deposit_requests;
DROP POLICY IF EXISTS "Enable All for deposit_requests" ON public.deposit_requests;

CREATE POLICY "Enable All for deposit_requests" ON public.deposit_requests 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- 4. Đảm bảo Realtime nhận sự kiện thay đổi của deposit_requests và site_config
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'deposit_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_requests;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_config'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_config;
    END IF;
END $$;
