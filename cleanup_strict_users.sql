-- =============================================================================
-- CHUẨN HÓA DỮ LIỆU NGƯỜI DÙNG & KHÓA QUY TẮC SĐT (0...) / EMAIL (@gmail.com)
-- Chạy script này 1 lần trong Supabase Dashboard -> SQL Editor (quyền postgres)
-- =============================================================================

BEGIN;

-- 1. Sửa SĐT bị thiếu số 0 đầu & cắt khoảng trắng thừa
UPDATE public.users
SET phone = '0834007607'
WHERE id = '9bbc4304-ac25-493d-ba42-50204b14d8f7'
  AND phone = '84834007607';

UPDATE public.users
SET phone = '0868868024'
WHERE id = 'e961e3d1-0430-4c44-8dca-bd3af95294da'
  AND phone = '84868868024';

UPDATE public.users
SET phone = '0123456789'
WHERE id = '447bf40d-35c2-403c-a9d5-a16843d2c621'
  AND phone = '1234567891';

UPDATE public.users
SET name = BTRIM(name),
    phone = BTRIM(phone),
    email = LOWER(BTRIM(email));

-- 2. Sửa lỗi gõ nhầm đuôi Gmail (@gmaiil.com, @gnail.com, @gamil.com -> @gmail.com)
UPDATE public.users u
SET email = REGEXP_REPLACE(LOWER(BTRIM(u.email)), '@(gmaiil|gnail|gamil)\.com$', '@gmail.com', 'i')
WHERE u.email ~* '@(gmaiil|gnail|gamil)\.com$'
  AND NOT EXISTS (
      SELECT 1 FROM public.users u2
      WHERE LOWER(BTRIM(u2.email)) = REGEXP_REPLACE(LOWER(BTRIM(u.email)), '@(gmaiil|gnail|gamil)\.com$', '@gmail.com', 'i')
        AND u2.id <> u.id
  );

UPDATE auth.users a
SET email = REGEXP_REPLACE(LOWER(BTRIM(a.email)), '@(gmaiil|gnail|gamil)\.com$', '@gmail.com', 'i'),
    updated_at = NOW()
WHERE a.email ~* '@(gmaiil|gnail|gamil)\.com$'
  AND NOT EXISTS (
      SELECT 1 FROM auth.users a2
      WHERE LOWER(BTRIM(a2.email)) = REGEXP_REPLACE(LOWER(BTRIM(a.email)), '@(gmaiil|gnail|gamil)\.com$', '@gmail.com', 'i')
        AND a2.id <> a.id
  );

UPDATE auth.identities i
SET identity_data = jsonb_set(
        COALESCE(i.identity_data, '{}'::jsonb),
        '{email}',
        to_jsonb(REGEXP_REPLACE(LOWER(BTRIM(i.identity_data->>'email')), '@(gmaiil|gnail|gamil)\.com$', '@gmail.com', 'i'))
    ),
    updated_at = NOW()
WHERE COALESCE(i.identity_data->>'email', '') ~* '@(gmaiil|gnail|gamil)\.com$'
  AND EXISTS (
      SELECT 1 FROM auth.users a
      WHERE a.id = i.user_id
        AND LOWER(a.email) = REGEXP_REPLACE(LOWER(BTRIM(i.identity_data->>'email')), '@(gmaiil|gnail|gamil)\.com$', '@gmail.com', 'i')
  );

-- 3. Xóa tài khoản test & 2 bản ghi phụ trùng SĐT có số dư rỗng (balance = 0, spins = 0)
DELETE FROM public.users
WHERE id IN (
    '1206258b-d2ae-4758-aebf-b86aafc1a87a', -- User1780225676678 (tài khoản test)
    '78baa0a2-feab-4269-9fea-89e8e8eeae94', -- Beetrum (trùng SĐT 0364935657 với Sunnalucy)
    '9dfeae43-b130-4d11-bb5b-f8a6ecf239d6'  -- Nam Lâm (trùng SĐT 0772270078 với Hieu phan)
)
  AND COALESCE(balance, 0) = 0
  AND COALESCE(spins, 0) = 0;

DELETE FROM auth.identities
WHERE user_id IN (
    '1206258b-d2ae-4758-aebf-b86aafc1a87a'::uuid,
    '78baa0a2-feab-4269-9fea-89e8e8eeae94'::uuid,
    '9dfeae43-b130-4d11-bb5b-f8a6ecf239d6'::uuid
)
  AND NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = user_id::text);

DELETE FROM auth.users
WHERE id IN (
    '1206258b-d2ae-4758-aebf-b86aafc1a87a'::uuid,
    '78baa0a2-feab-4269-9fea-89e8e8eeae94'::uuid,
    '9dfeae43-b130-4d11-bb5b-f8a6ecf239d6'::uuid
)
  AND NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = id::text);

-- 4. Khóa quy tắc ngay từ tầng Database khi tạo tài khoản mới (BEFORE INSERT)
CREATE OR REPLACE FUNCTION public.enforce_strict_user_identity()
RETURNS trigger AS $$
BEGIN
    NEW.name := BTRIM(COALESCE(NEW.name, ''));
    NEW.phone := BTRIM(COALESCE(NEW.phone, ''));
    NEW.email := LOWER(BTRIM(COALESCE(NEW.email, '')));

    IF NEW.phone !~ '^0[0-9]{9,10}$' THEN
        RAISE EXCEPTION 'Số điện thoại phải bắt đầu bằng số 0 và gồm 10-11 chữ số!';
    END IF;

    IF NEW.email !~* '^[a-zA-Z0-9._%+-]+@gmail\.com$' THEN
        RAISE EXCEPTION 'Email phải đúng định dạng @gmail.com!';
    END IF;

    IF EXISTS (SELECT 1 FROM public.users WHERE TRIM(phone) = NEW.phone) THEN
        RAISE EXCEPTION 'Số điện thoại này đã được đăng ký! Không được tạo thêm tài khoản trùng SĐT.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(TRIM(email)) = NEW.email) THEN
        RAISE EXCEPTION 'Email này đã được đăng ký! Không được tạo thêm tài khoản trùng Email.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_strict_user_identity ON public.users;
CREATE TRIGGER trg_enforce_strict_user_identity
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.enforce_strict_user_identity();

COMMIT;
