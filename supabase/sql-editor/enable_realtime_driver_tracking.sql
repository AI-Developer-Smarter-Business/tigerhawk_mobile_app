-- Task 8.6 — idempotent Realtime for live location (UPDATE on loads).
-- Usually already applied via enable_realtime_pp2_driver_sync.sql or enable_realtime_loads.sql.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'loads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.loads;
    RAISE NOTICE 'Added public.loads to supabase_realtime';
  ELSE
    RAISE NOTICE 'public.loads already in supabase_realtime';
  END IF;
END $$;

SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'loads';
