ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS oldPrice numeric;
ALTER TABLE public.boosting ADD COLUMN IF NOT EXISTS oldPrice numeric;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS oldRentPrice numeric;
