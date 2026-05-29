-- Enable Supabase Realtime for PP2 driver sync (loads + documents). Idempotent.
-- Run in Supabase Dashboard → SQL Editor on the TMS production project.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'loads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.loads;
    RAISE NOTICE 'Added public.loads to supabase_realtime';
  ELSE
    RAISE NOTICE 'public.loads already in supabase_realtime';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'load_documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.load_documents;
    RAISE NOTICE 'Added public.load_documents to supabase_realtime';
  ELSE
    RAISE NOTICE 'public.load_documents already in supabase_realtime';
  END IF;
END $$;

-- Verify (expect 2 rows: loads, load_documents)
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename IN ('loads', 'load_documents')
ORDER BY tablename;
