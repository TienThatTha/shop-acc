ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS edit_history jsonb DEFAULT '[]'::jsonb;
