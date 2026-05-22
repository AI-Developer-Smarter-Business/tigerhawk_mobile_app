-- Enable Supabase Realtime on `load_documents` for PP2 driver document list refresh
-- Run in SQL Editor when TMS uploads do not appear on mobile until pull-to-refresh.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
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
