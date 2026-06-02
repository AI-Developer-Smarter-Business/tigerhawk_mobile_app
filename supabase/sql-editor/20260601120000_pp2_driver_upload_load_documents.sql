-- Pegar en Supabase Dashboard → SQL Editor → Run
-- Copia de: supabase/migrations/20260601120000_pp2_driver_upload_load_documents.sql
-- Habilita subida móvil directa (Storage + INSERT load_documents) sin depender del TMS en producción.

BEGIN;

DROP POLICY IF EXISTS "Drivers insert documents on assigned loads" ON public.load_documents;

CREATE POLICY "Drivers insert documents on assigned loads"
  ON public.load_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT get_user_role()) = 'driver'
    AND uploaded_by = (SELECT auth.uid())
    AND document_type = 'Driver'
    AND EXISTS (
      SELECT 1
      FROM public.loads l
      WHERE l.id = load_documents.load_id
        AND l.driver_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Drivers insert load-documents for assigned load" ON storage.objects;
DROP POLICY IF EXISTS "Drivers read load-documents for assigned load" ON storage.objects;

CREATE POLICY "Drivers insert load-documents for assigned load"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'load-documents'
    AND (SELECT get_user_role()) = 'driver'
    AND EXISTS (
      SELECT 1
      FROM public.loads l
      WHERE l.id::text = (storage.foldername(name))[1]
        AND l.driver_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Drivers read load-documents for assigned load"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'load-documents'
    AND (SELECT get_user_role()) = 'driver'
    AND EXISTS (
      SELECT 1
      FROM public.loads l
      WHERE l.id::text = (storage.foldername(name))[1]
        AND l.driver_id = (SELECT auth.uid())
    )
  );

COMMIT;

-- Verificar políticas:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'load_documents' AND policyname ILIKE '%driver%';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname ILIKE '%driver%load-documents%';
