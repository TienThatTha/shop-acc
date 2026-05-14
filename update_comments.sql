ALTER TABLE public.comments ADD COLUMN reported_by text[] DEFAULT '{}'::text[];
