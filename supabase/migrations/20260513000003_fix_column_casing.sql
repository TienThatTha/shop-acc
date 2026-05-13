DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boosting' AND column_name = 'discountpercent') THEN
        ALTER TABLE public.boosting RENAME COLUMN discountpercent TO "discountPercent";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boosting' AND column_name = 'oldprice') THEN
        ALTER TABLE public.boosting RENAME COLUMN oldprice TO "oldPrice";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'oldprice') THEN
        ALTER TABLE public.accounts RENAME COLUMN oldprice TO "oldPrice";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'oldrentprice') THEN
        ALTER TABLE public.accounts RENAME COLUMN oldrentprice TO "oldRentPrice";
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
