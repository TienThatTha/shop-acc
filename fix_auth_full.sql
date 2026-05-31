UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb),
  is_super_admin = COALESCE(is_super_admin, false),
  is_sso_user = COALESCE(is_sso_user, false);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  id, 
  jsonb_build_object('sub', id, 'email', email), 
  'email', 
  id::text, 
  COALESCE(last_sign_in_at, created_at), 
  created_at, 
  updated_at
FROM auth.users
WHERE email IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM auth.identities WHERE auth.identities.user_id = auth.users.id
);
