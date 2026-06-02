-- Verify Supabase prerequisites for driver document upload (TMS POST, not direct INSERT).
-- Project: same as EXPO_PUBLIC_SUPABASE_URL / TMS NEXT_PUBLIC_SUPABASE_URL.

-- 1) Driver role on profile
-- SELECT id, role, full_name, email FROM user_profiles WHERE id = auth.uid();

-- 2) Driver can SELECT assigned load (RLS) — required for TMS POST permission check
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'loads' AND policyname ILIKE '%driver%';

-- Expected policy similar to: "Drivers read own loads" (FOR SELECT, driver_id = auth.uid())

-- 3) Driver can SELECT load_documents on assigned loads (mobile list — already working if you see files)
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'load_documents' AND policyname ILIKE '%driver%';

-- 4) Upload does NOT need driver INSERT on load_documents (TMS uses service role).
-- If TMS returns 401: fix TMS middleware + getUserFromRequest (Bearer), not new INSERT policies.

-- 5) Assignment check for a test load (run as service role or replace UUIDs):
-- SELECT l.id, l.reference_number, l.driver_id, p.role
-- FROM loads l
-- JOIN user_profiles p ON p.id = l.driver_id
-- WHERE l.reference_number ILIKE '%TH-MPEIQ624%';
