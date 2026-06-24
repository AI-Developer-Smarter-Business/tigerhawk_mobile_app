-- Fix GPS ping blocked by pp2_enforce_driver_location_update (22 Jun 2026).
-- Symptom on mobile: banner "Sharing location with dispatch" shows
--   "Driver may only update live location columns on loads (PP2 Semana 8)"
-- Cause: DB auto-updates updated_at (and optionally last_tracked) on any UPDATE;
--        those columns must be excluded from the driver guard comparison.
-- Run in Supabase SQL Editor (idempotent).

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

  -- Status and other fields must go through TMS API (staff/service role), not driver JWT.
  IF NOT location_changed THEN
    RAISE EXCEPTION 'Drivers cannot update load fields directly; use Tigerhawk Mobile status actions (PP2 Semana 8)'
      USING ERRCODE = '42501';
  END IF;

  -- Live GPS ping: only location columns + housekeeping timestamps may change.
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
