ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.boosting ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
