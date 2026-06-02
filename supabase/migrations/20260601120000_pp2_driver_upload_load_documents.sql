-- PP2: allow assigned drivers to INSERT load_documents + upload to load-documents bucket
-- (Same rows TMS creates via service role; enables mobile upload without TMS Bearer.)

BEGIN;

-- load_documents: driver INSERT on assigned loads only, type Driver
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

-- storage.objects: bucket load-documents, path {load_id}/...
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
