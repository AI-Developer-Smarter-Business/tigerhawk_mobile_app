-- Enable Supabase Realtime on `loads` for PP2 driver list refresh (idempotent)
-- Run in SQL Editor if mobile does not update when TMS assigns loads.

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
