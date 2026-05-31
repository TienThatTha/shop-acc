INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  id, 
  jsonb_build_object('sub', id, 'email', email), 
  'email', 
  id::text, 
  last_sign_in_at, 
  created_at, 
  updated_at
FROM auth.users
WHERE email IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM auth.identities WHERE auth.identities.user_id = auth.users.id
);
