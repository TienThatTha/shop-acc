ALTER TABLE public.boosting ADD COLUMN IF NOT EXISTS allow_quantity boolean DEFAULT false;
ALTER TABLE public.boosting ADD COLUMN IF NOT EXISTS require_login boolean DEFAULT true;
