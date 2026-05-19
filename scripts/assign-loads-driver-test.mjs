/**
 * Assigns loads to driver_test@test.com for PP2 real-data testing.
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *
 * Usage:
 *   node scripts/assign-loads-driver-test.mjs           # default: 3 loads
 *   node scripts/assign-loads-driver-test.mjs --max=50  # pagination QA (2+ pages at size 20)
 *   node scripts/assign-loads-driver-test.mjs --max=21  # pagination QA (2 pages at size 20)
 *   node scripts/assign-loads-driver-test.mjs --all     # up to 200 (use trim script after if needed)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const DRIVER_EMAIL = 'driver_test@test.com';
const TARGET_STATUS = 'Dispatched';
const DEFAULT_MAX_LOADS = 3;
const ALL_LOADS_CAP = 200;

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const hash = value.indexOf(' #');
    if (hash !== -1) value = value.slice(0, hash).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function parseMaxLoads(argv) {
  if (argv.includes('--all')) return ALL_LOADS_CAP;
  const maxArg = argv.find((a) => a.startsWith('--max='));
  if (maxArg) {
    const n = Number.parseInt(maxArg.split('=')[1], 10);
    if (Number.isFinite(n) && n > 0) return Math.min(n, ALL_LOADS_CAP);
  }
  return DEFAULT_MAX_LOADS;
}

async function main() {
  loadEnvLocal();
  const maxLoads = parseMaxLoads(process.argv.slice(2));

  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile, error: profileErr } = await admin
    .from('user_profiles')
    .select('id, email, role')
    .eq('email', DRIVER_EMAIL)
    .maybeSingle();

  if (profileErr || !profile) {
    console.error('Driver profile not found:', profileErr?.message ?? DRIVER_EMAIL);
    process.exit(1);
  }

  if (profile.role !== 'driver') {
    console.error('User is not role=driver:', profile.role);
    process.exit(1);
  }

  const { data: driverRow, error: driverErr } = await admin
    .from('drivers')
    .select('id')
    .eq('id', profile.id)
    .maybeSingle();

  if (driverErr || !driverRow) {
    console.error(
      'No drivers row for this user. Run: npm run db:seed-driver-test (loads.driver_id FK → drivers.id)',
    );
    process.exit(1);
  }

  const { count: existingCount } = await admin
    .from('loads')
    .select('id', { count: 'exact', head: true })
    .eq('driver_id', profile.id);

  const { data: candidates, error: listErr } = await admin
    .from('loads')
    .select('id, reference_number, status, driver_id')
    .is('driver_id', null)
    .order('created_at', { ascending: false })
    .limit(maxLoads);

  if (listErr) {
    console.error('List loads failed:', listErr.message);
    process.exit(1);
  }

  if (!candidates?.length) {
    console.error(
      'No unassigned loads found (driver_id IS NULL). Add loads in TMS or lower filters.',
    );
    process.exit(1);
  }

  const ids = candidates.map((l) => l.id);
  const { error: updateErr } = await admin
    .from('loads')
    .update({ driver_id: profile.id, status: TARGET_STATUS })
    .in('id', ids);

  if (updateErr) {
    console.error('Update loads failed:', updateErr.message);
    process.exit(1);
  }

  const { count: totalAssigned } = await admin
    .from('loads')
    .select('id', { count: 'exact', head: true })
    .eq('driver_id', profile.id);

  console.log(
    `Assigned ${ids.length} load(s) to ${DRIVER_EMAIL} (max requested: ${maxLoads}).`,
  );
  console.log(`Total loads now assigned to this driver: ${totalAssigned ?? '?'}`);
  if ((totalAssigned ?? 0) > 20) {
    console.log('Pagination: scroll the Loads list — page size is 20 (infinite scroll).');
  } else if ((totalAssigned ?? 0) <= 20) {
    console.log(
      `Pagination: need >20 assigned loads for a second page (currently ${totalAssigned ?? 0}).`,
    );
  }
  for (const row of candidates) {
    console.log(`  - ${row.reference_number} (${row.status}) → ${TARGET_STATUS}`);
  }
  console.log('\nSign in on PP2 with driver_test@test.com / Driver01*');
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
