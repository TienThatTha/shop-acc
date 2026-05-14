ALTER TABLE public.comments DROP COLUMN IF EXISTS parent_id;
ALTER TABLE public.comments ADD COLUMN parent_id uuid DEFAULT NULL;
