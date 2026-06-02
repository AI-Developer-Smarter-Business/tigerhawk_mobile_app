-- PP2 driver document UPLOAD — what Supabase RLS does and does not need
-- Run in SQL Editor for reference / verification only (no policy changes required for TMS upload path).

-- 1) Mobile lists documents via Supabase directly (SELECT + RLS).
--    Policies: "Drivers read documents on assigned loads" (see 20260518120000_pp2_driver_scoped_load_messages_documents.sql)

SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'load_documents'
ORDER BY policyname;

-- 2) Mobile UPLOAD goes through TMS API (POST /api/dispatcher/loads/:id/documents), NOT direct INSERT.
--    TMS uses SUPABASE_SERVICE_ROLE_KEY for storage + load_documents INSERT.
--    Drivers do NOT need INSERT on load_documents or storage policies for that flow.

-- 3) If upload returns 401 "Session expired" / Bearer message:
--    Fix TMS middleware + getUserFromRequest (docs/TMS_PATCH_MOBILE_BEARER_AUTH.md), NOT RLS here.

-- 4) If upload returns 403 after TMS auth works:
--    Check user_profiles.role = 'driver' and loads.driver_id = auth.uid() for that load.

-- Example check (replace email):
-- SELECT u.id, p.role, l.reference_number, l.driver_id = u.id AS is_assigned
-- FROM auth.users u
-- LEFT JOIN user_profiles p ON p.id = u.id
-- LEFT JOIN loads l ON l.driver_id = u.id
-- WHERE u.email = 'driver_test@test.com';
