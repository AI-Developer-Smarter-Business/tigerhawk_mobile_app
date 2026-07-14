-- A.0 — Verify driver clock columns + acceptance/POD prerequisites (14 Jul)
-- Run in Supabase SQL Editor against the shared TMS project.
-- Source checklist: z-feedback_cliente/RESPUESTAS_CLIENTE.md (Q10 + migration note)

-- ---------------------------------------------------------------------------
-- 1) Clock / mobile gate columns (20260710_driver_clock.sql — client confirms applied)
-- Expect rows for: clock_status, clocked_in_at, mobile_enabled
-- ---------------------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'drivers'
  AND column_name IN ('clock_status', 'clocked_in_at', 'mobile_enabled')
ORDER BY column_name;

-- Optional one-liner from RESPUESTAS Q10:
-- select column_name from information_schema.columns
-- where table_name = 'drivers'
--   and column_name in ('clock_status','clocked_in_at','mobile_enabled');

-- ---------------------------------------------------------------------------
-- 2) Migration 20260714_driver_acceptance_and_pod.sql
-- Apply Ian's file in SQL Editor if missing. Soft probes below — pass = objects exist.
-- Adjust names if the migration uses different identifiers; document diffs in
-- docs/A0_MOBILE_API_PREVIEW_SMOKE.md § SQL results.
-- ---------------------------------------------------------------------------

-- 2a) Move acceptance / start timestamps (names commonly used on load_moves)
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'load_moves'
  AND column_name IN ('accepted_at', 'started_at', 'rejected_at')
ORDER BY column_name;
-- Expect ≥ accepted_at + started_at after 20260714 migration (confirm vs Ian's SQL)

-- 2b) Idempotent POD signature key (client_signature_id unique)
SELECT
  t.relname AS table_name,
  i.relname AS index_name,
  pg_get_indexdef(ix.indexrelid) AS index_def
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND pg_get_indexdef(ix.indexrelid) ILIKE '%client_signature_id%'
ORDER BY 1, 2;
-- Expect ≥ 1 unique index mentioning client_signature_id after 20260714

-- 2c) Drivers with mobile access (sanity — no PII beyond counts)
SELECT
  COUNT(*) FILTER (WHERE mobile_enabled IS TRUE) AS mobile_enabled_true,
  COUNT(*) FILTER (WHERE mobile_enabled IS NOT TRUE) AS mobile_enabled_false_or_null
FROM public.drivers;

-- ---------------------------------------------------------------------------
-- Interpretation
-- • Section 1 empty → clock SQL not applied; block Clock I.* until fixed.
-- • Section 2a/2b empty → apply 20260714_driver_acceptance_and_pod.sql before Accept/POD/list.
-- • Section 2c: need ≥ 1 mobile_enabled_true for A.6 QA username driver.
-- ---------------------------------------------------------------------------
