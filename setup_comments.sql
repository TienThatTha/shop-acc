-- Thêm cột avatar_url vào bảng users (nếu chưa có)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;

-- Tạo bảng comments cho hệ thống Hỏi/Đáp
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    liked_by text[] DEFAULT '{}'::text[],
    disliked_by text[] DEFAULT '{}'::text[],
    is_pinned boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tắt RLS để code từ client có thể thao tác (Shop game này không dùng RLS khắt khe)
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
