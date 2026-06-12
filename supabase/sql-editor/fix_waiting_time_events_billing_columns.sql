-- Align waiting_time_events with the TMS / mobile wait-time API schema.
-- Run in Supabase SQL Editor when POST/PATCH /wait-time fails with schema cache errors, e.g.:
--   "Could not find the 'billable' column ..."
--   "Could not find the 'duration_minutes' column ..."
--   "violates check constraint waiting_time_events_event_name_check"
--
-- Idempotent — safe to run more than once (re-run after any new missing-column error).

DO $$
BEGIN
  -- Core event fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'event_name'
  ) THEN
    ALTER TABLE public.waiting_time_events ADD COLUMN event_name TEXT NOT NULL DEFAULT 'other';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN event_date TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE public.waiting_time_events ADD COLUMN start_time TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE public.waiting_time_events ADD COLUMN end_time TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN duration_minutes INT NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.waiting_time_events ADD COLUMN location TEXT;
  END IF;

  -- Billing (A/R)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'billable'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN billable BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'rate_per_hour'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN rate_per_hour NUMERIC(10,2) DEFAULT 75.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'charge_amount'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN charge_amount NUMERIC(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'free_time_minutes'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN free_time_minutes INT DEFAULT 60;
  END IF;

  -- Driver pay (A/P)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'driver_payable'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN driver_payable BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'driver_rate_per_hour'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN driver_rate_per_hour NUMERIC(10,2) DEFAULT 75.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'driver_pay_amount'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN driver_pay_amount NUMERIC(12,2) DEFAULT 0;
  END IF;

  -- Metadata
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.waiting_time_events ADD COLUMN notes TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'logged_by'
  ) THEN
    ALTER TABLE public.waiting_time_events ADD COLUMN logged_by TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waiting_time_events' AND column_name = 'driver_id'
  ) THEN
    ALTER TABLE public.waiting_time_events
      ADD COLUMN driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wait_events_load ON public.waiting_time_events(load_id);
CREATE INDEX IF NOT EXISTS idx_wait_events_driver ON public.waiting_time_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_wait_events_event_date ON public.waiting_time_events(event_date);
CREATE INDEX IF NOT EXISTS idx_wait_events_billable
  ON public.waiting_time_events(billable)
  WHERE billable = true;

CREATE OR REPLACE FUNCTION public.compute_wait_time_charges()
RETURNS TRIGGER AS $$
DECLARE
  billable_minutes INT;
  driver_payable_minutes INT;
BEGIN
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;

  billable_minutes := GREATEST(
    COALESCE(NEW.duration_minutes, 0) - COALESCE(NEW.free_time_minutes, 60),
    0
  );
  IF NEW.billable AND billable_minutes > 0 THEN
    NEW.charge_amount := ROUND(
      (billable_minutes / 60.0) * COALESCE(NEW.rate_per_hour, 75),
      2
    );
  ELSE
    NEW.charge_amount := COALESCE(NEW.charge_amount, 0);
  END IF;

  driver_payable_minutes := COALESCE(NEW.duration_minutes, 0);
  IF NEW.driver_payable AND driver_payable_minutes > 0 THEN
    NEW.driver_pay_amount := ROUND(
      (driver_payable_minutes / 60.0) * COALESCE(NEW.driver_rate_per_hour, 75),
      2
    );
  ELSE
    NEW.driver_pay_amount := COALESCE(NEW.driver_pay_amount, 0);
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_wait_charges ON public.waiting_time_events;
CREATE TRIGGER trg_compute_wait_charges
  BEFORE INSERT OR UPDATE ON public.waiting_time_events
  FOR EACH ROW EXECUTE FUNCTION public.compute_wait_time_charges();

-- Legacy table CHECK only allowed TMS audit labels ("Deliver Container", etc.).
-- Wait-time API uses snake_case codes (delivery_wait, pickup_wait, …).
ALTER TABLE public.waiting_time_events
  DROP CONSTRAINT IF EXISTS waiting_time_events_event_name_check;

ALTER TABLE public.waiting_time_events
  ADD CONSTRAINT waiting_time_events_event_name_check
  CHECK (event_name IN (
    'pickup_wait',
    'delivery_wait',
    'return_wait',
    'customs_hold',
    'yard_wait',
    'other',
    'Pick Up Container',
    'Deliver Container',
    'Return Container'
  ));

ALTER TABLE public.waiting_time_events
  DROP CONSTRAINT IF EXISTS waiting_time_events_logged_by_check;

ALTER TABLE public.waiting_time_events
  ADD CONSTRAINT waiting_time_events_logged_by_check
  CHECK (logged_by IS NULL OR logged_by IN ('driver', 'dispatcher', 'system'));

NOTIFY pgrst, 'reload schema';

-- Verify (run separately if needed):
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'waiting_time_events'
-- ORDER BY ordinal_position;
