-- Pegar en Supabase Dashboard → SQL Editor → Run
-- Proyecto: sqkzamyopzxinwkshqgw
-- Copia de: supabase/migrations/20260518120000_pp2_driver_scoped_load_messages_documents.sql

BEGIN;

DROP POLICY IF EXISTS "Authenticated read load_messages" ON public.load_messages;

CREATE POLICY "Staff read load_messages"
  ON public.load_messages
  FOR SELECT
  TO authenticated
  USING ((SELECT get_user_role()) IN ('admin', 'dispatcher', 'accounting'));

CREATE POLICY "Drivers read messages on assigned loads"
  ON public.load_messages
  FOR SELECT
  TO authenticated
  USING (
    (SELECT get_user_role()) = 'driver'
    AND EXISTS (
      SELECT 1
      FROM public.loads l
      WHERE l.id = load_messages.load_id
        AND l.driver_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated read load_documents" ON public.load_documents;

CREATE POLICY "Staff read load_documents"
  ON public.load_documents
  FOR SELECT
  TO authenticated
  USING ((SELECT get_user_role()) IN ('admin', 'dispatcher', 'accounting'));

CREATE POLICY "Drivers read documents on assigned loads"
  ON public.load_documents
  FOR SELECT
  TO authenticated
  USING (
    (SELECT get_user_role()) = 'driver'
    AND EXISTS (
      SELECT 1
      FROM public.loads l
      WHERE l.id = load_documents.load_id
        AND l.driver_id = (SELECT auth.uid())
    )
  );

COMMIT;
