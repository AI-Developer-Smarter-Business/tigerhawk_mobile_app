-- WT.20 — Verify waiting_time_events schema + Realtime (run after fix + enable_realtime scripts)

-- 1) Billing / API columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'waiting_time_events'
  AND column_name IN (
    'event_name',
    'start_time',
    'end_time',
    'duration_minutes',
    'billable',
    'charge_amount',
    'free_time_minutes',
    'driver_pay_amount',
    'logged_by'
  )
ORDER BY column_name;
-- Expect 9 rows

-- 2) Trigger for charge computation
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.waiting_time_events'::regclass
  AND tgname = 'trg_compute_wait_charges';
-- Expect 1 row

-- 3) event_name allows delivery_wait (API)
SELECT conname
FROM pg_constraint
WHERE conrelid = 'public.waiting_time_events'::regclass
  AND conname = 'waiting_time_events_event_name_check';
-- Expect 1 row

-- 4) Realtime publication (WT.13 / WT.20)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'waiting_time_events';
-- Expect 1 row
