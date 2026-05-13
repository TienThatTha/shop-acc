DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'rentDiscountPercent') THEN
        ALTER TABLE public.accounts ADD COLUMN "rentDiscountPercent" numeric DEFAULT 0;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
