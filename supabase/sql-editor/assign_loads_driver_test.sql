-- Assign up to 3 unassigned loads to driver_test@test.com (run in SQL Editor or use npm run db:assign-driver-test-loads)
-- Driver must exist: npm run db:seed-driver-test

DO $$
DECLARE
  v_driver_id uuid;
  v_load_ids uuid[];
BEGIN
  SELECT id INTO v_driver_id
  FROM public.user_profiles
  WHERE email = 'driver_test@test.com' AND role = 'driver';

  IF v_driver_id IS NULL THEN
    RAISE EXCEPTION 'driver_test@test.com not found or not role driver';
  END IF;

  SELECT array_agg(id) INTO v_load_ids
  FROM (
    SELECT id
    FROM public.loads
    WHERE driver_id IS NULL
      AND status IN ('Available', 'Pending', 'Assigned')
    ORDER BY created_at DESC
    LIMIT 3
  ) sub;

  IF v_load_ids IS NULL OR array_length(v_load_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No unassigned loads available';
  END IF;

  UPDATE public.loads
  SET driver_id = v_driver_id,
      status = 'Dispatched'
  WHERE id = ANY(v_load_ids);

  RAISE NOTICE 'Assigned % load(s) to driver_test@test.com', array_length(v_load_ids, 1);
END $$;

SELECT l.reference_number, l.status, l.driver_id, up.email
FROM public.loads l
JOIN public.user_profiles up ON up.id = l.driver_id
WHERE up.email = 'driver_test@test.com';
