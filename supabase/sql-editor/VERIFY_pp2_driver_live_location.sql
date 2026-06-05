-- Run after 20260605120000_pp2_driver_live_location_loads.sql

-- 1) Columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loads'
  AND column_name IN (
    'current_latitude',
    'current_longitude',
    'last_seen_at',
    'location_accuracy_m'
  )
ORDER BY column_name;
-- Expect 4 rows, is_nullable = YES

-- 2) New policy (additive — staff policies unchanged)
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'loads'
  AND policyname IN (
    'Drivers read own loads',
    'Staff read all shipments',
    'Staff update shipments',
    'Drivers update live location on assigned loads'
  )
ORDER BY policyname;
-- Expect 4 rows if standard TMS + PP2 policies are present

-- 3) Trigger guard
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.loads'::regclass
  AND tgname = 'trg_pp2_enforce_driver_location_update';
-- Expect 1 row

-- 4) Realtime (loads should already be published for PP2)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'loads';
