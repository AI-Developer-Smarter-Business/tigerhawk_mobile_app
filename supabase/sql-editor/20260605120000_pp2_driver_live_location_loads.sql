-- Pegar en Supabase Dashboard → SQL Editor → Run
-- Proyecto compartido TMS producción + Tigerhawk Mobile
-- Copia de: supabase/migrations/20260605120000_pp2_driver_live_location_loads.sql
--
-- ADITIVO: no modifica políticas Staff ni "Drivers read own loads".
-- TMS sin UI GPS sigue igual; columnas nuevas quedan NULL hasta que el móvil envíe pings.
--
-- Tras ejecutar: supabase/sql-editor/VERIFY_pp2_driver_live_location.sql

-- ─── 8.4 Schema (nullable, backward compatible) ───
ALTER TABLE public.loads
  ADD COLUMN IF NOT EXISTS current_latitude double precision,
  ADD COLUMN IF NOT EXISTS current_longitude double precision,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS location_accuracy_m double precision;

COMMENT ON COLUMN public.loads.current_latitude IS 'PP2: last driver GPS latitude (live tracking, Semana 8)';
COMMENT ON COLUMN public.loads.current_longitude IS 'PP2: last driver GPS longitude (live tracking, Semana 8)';
COMMENT ON COLUMN public.loads.last_seen_at IS 'PP2: timestamp of last mobile location ping';
COMMENT ON COLUMN public.loads.location_accuracy_m IS 'PP2: optional GPS accuracy in meters';

CREATE INDEX IF NOT EXISTS idx_loads_last_seen_at
  ON public.loads (last_seen_at DESC NULLS LAST)
  WHERE last_seen_at IS NOT NULL;

-- ─── 8.5 RLS: driver UPDATE on assigned loads (additive) ───
DROP POLICY IF EXISTS "Drivers update live location on assigned loads" ON public.loads;

CREATE POLICY "Drivers update live location on assigned loads"
  ON public.loads
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT get_user_role()) = 'driver'
    AND driver_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT get_user_role()) = 'driver'
    AND driver_id = (SELECT auth.uid())
  );

-- ─── Guard: drivers may only change live-location columns (not status, etc.) ───
CREATE OR REPLACE FUNCTION public.pp2_enforce_driver_location_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  location_changed boolean;
BEGIN
  IF (SELECT get_user_role()) IS DISTINCT FROM 'driver' THEN
    RETURN NEW;
  END IF;

  location_changed := (
    NEW.current_latitude IS DISTINCT FROM OLD.current_latitude
    OR NEW.current_longitude IS DISTINCT FROM OLD.current_longitude
    OR NEW.last_seen_at IS DISTINCT FROM OLD.last_seen_at
    OR NEW.location_accuracy_m IS DISTINCT FROM OLD.location_accuracy_m
  );

  IF NOT location_changed THEN
    RAISE EXCEPTION 'Drivers cannot update load fields directly; use Tigerhawk Mobile status actions (PP2 Semana 8)'
      USING ERRCODE = '42501';
  END IF;

  IF (
    to_jsonb(NEW)
      - 'current_latitude'
      - 'current_longitude'
      - 'last_seen_at'
      - 'location_accuracy_m'
      - 'updated_at'
      - 'last_tracked'
  ) IS DISTINCT FROM (
    to_jsonb(OLD)
      - 'current_latitude'
      - 'current_longitude'
      - 'last_seen_at'
      - 'location_accuracy_m'
      - 'updated_at'
      - 'last_tracked'
  ) THEN
    RAISE EXCEPTION 'Driver may only update live location columns on loads (PP2 Semana 8)'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pp2_enforce_driver_location_update ON public.loads;

CREATE TRIGGER trg_pp2_enforce_driver_location_update
  BEFORE UPDATE ON public.loads
  FOR EACH ROW
  EXECUTE FUNCTION public.pp2_enforce_driver_location_update();
