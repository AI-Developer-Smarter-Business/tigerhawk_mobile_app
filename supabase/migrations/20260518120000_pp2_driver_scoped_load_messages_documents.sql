-- PP2 móvil: acotar SELECT de conductor en load_messages y load_documents
-- Reemplaza "Authenticated read *" (cualquier driver veía todas las filas).
-- Staff y portal cliente mantienen sus políticas existentes (OR en RLS).

BEGIN;

-- ---------------------------------------------------------------------------
-- load_messages
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- load_documents (la política "Customers read own load documents" no se toca)
-- ---------------------------------------------------------------------------
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
