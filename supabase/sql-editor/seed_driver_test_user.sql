-- Option A (recommended): skip Dashboard — run locally:
--   node scripts/create-driver-test-user.mjs
--
-- Option B: run this SQL ONLY AFTER the Auth user exists (Dashboard or script above).
--   Email: driver_test@test.com
--
-- Sets role = driver on user_profiles (required for PP2 mobile loads list).

INSERT INTO public.user_profiles (id, email, full_name, role, password_set)
SELECT
  u.id,
  u.email,
  'Driver Test',
  'driver',
  true
FROM auth.users AS u
WHERE u.email = 'driver_test@test.com'
ON CONFLICT (id) DO UPDATE
SET
  role = 'driver',
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  password_set = true;

-- TMS FK: loads.driver_id → drivers.id (same UUID as auth user for mobile drivers)
INSERT INTO public.drivers (id, name, email, status, enabled)
SELECT
  u.id,
  'Driver Test',
  u.email,
  'Available',
  true
FROM auth.users AS u
WHERE u.email = 'driver_test@test.com'
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  enabled = EXCLUDED.enabled;

-- Verify (should return one row, role = driver):
SELECT id, email, full_name, role, password_set
FROM public.user_profiles
WHERE email = 'driver_test@test.com';

SELECT id, name, email, status FROM public.drivers
WHERE email = 'driver_test@test.com';
