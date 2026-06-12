-- WT.13 — Enable Realtime on waiting_time_events (idempotent).
-- Apply in Supabase SQL Editor if the table is not already in the publication.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'waiting_time_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.waiting_time_events;
  END IF;
END $$;

-- Verify (optional):
-- SELECT * FROM pg_publication_tables WHERE tablename = 'waiting_time_events';
