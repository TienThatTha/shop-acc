-- =============================================================================
-- BẬT TÍNH NĂNG TÙY CHỌN THÔNG BÁO VÒNG QUAY (NOTIFY ON WIN)
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào Supabase Dashboard -> SQL Editor và bấm RUN
-- =============================================================================

-- 1. Thêm cột notify_on_win vào bảng wheel_items (mặc định false: không tích thì không thông báo)
ALTER TABLE public.wheel_items 
ADD COLUMN IF NOT EXISTS notify_on_win boolean DEFAULT false;

-- 2. Thêm cột notify vào bảng game_orders nếu chưa có
ALTER TABLE public.game_orders 
ADD COLUMN IF NOT EXISTS notify boolean DEFAULT true;

-- 3. Cập nhật mặc định:
-- Chỉ bật thông báo cho Giày Huyền Thoại (trang bị hiếm nhất để vinh danh người chơi)
UPDATE public.wheel_items 
SET notify_on_win = true 
WHERE type = 'game_shoes_legendary' OR name ILIKE '%giày thần tốc%';

-- Các phần thưởng thường khác (lượt đánh, hòm boss, xu, đá...) mặc định tắt thông báo để tránh spam Discord
UPDATE public.wheel_items 
SET notify_on_win = false 
WHERE (type != 'game_shoes_legendary' AND name NOT ILIKE '%giày thần tốc%') 
   OR notify_on_win IS NULL;

-- Xác nhận hoàn tất
SELECT id, name, type, notify_on_win, wheel_type FROM public.wheel_items ORDER BY wheel_type, name;
