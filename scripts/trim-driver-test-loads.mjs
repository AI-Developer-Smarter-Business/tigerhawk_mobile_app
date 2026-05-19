/**
 * Keeps only N loads assigned to driver_test@test.com; unassigns the rest.
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *
 * Usage:
 *   node scripts/trim-driver-test-loads.mjs           # keep 21 (pagination QA: 20 + 1)
 *   node scripts/trim-driver-test-loads.mjs --keep=3
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const DRIVER_EMAIL = 'driver_test@test.com';
const DEFAULT_KEEP = 21;
const UNASSIGN_STATUS = 'Available';

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

function parseKeepCount(argv) {
  const keepArg = argv.find((a) => a.startsWith('--keep='));
  if (keepArg) {
    const n = Number.parseInt(keepArg.split('=')[1], 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return DEFAULT_KEEP;
}

async function main() {
  loadEnvLocal();
  const keepCount = parseKeepCount(process.argv.slice(2));

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
    .select('id, email')
    .eq('email', DRIVER_EMAIL)
    .maybeSingle();

  if (profileErr || !profile) {
    console.error('Driver profile not found:', profileErr?.message ?? DRIVER_EMAIL);
    process.exit(1);
  }

  const { data: assigned, error: listErr } = await admin
    .from('loads')
    .select('id, reference_number, created_at')
    .eq('driver_id', profile.id)
    .order('created_at', { ascending: false });

  if (listErr) {
    console.error('List loads failed:', listErr.message);
    process.exit(1);
  }

  const rows = assigned ?? [];
  if (rows.length <= keepCount) {
    console.log(
      `${DRIVER_EMAIL} already has ${rows.length} load(s) (target: ${keepCount}). Nothing to trim.`,
    );
    return;
  }

  const keep = rows.slice(0, keepCount);
  const remove = rows.slice(keepCount);
  const removeIds = remove.map((r) => r.id);

  const { error: updateErr } = await admin
    .from('loads')
    .update({ driver_id: null, status: UNASSIGN_STATUS })
    .in('id', removeIds);

  if (updateErr) {
    console.error('Unassign loads failed:', updateErr.message);
    process.exit(1);
  }

  console.log(`Trimmed ${DRIVER_EMAIL}: kept ${keep.length}, unassigned ${remove.length}.`);
  console.log('\nKept:');
  for (const row of keep) {
    console.log(`  - ${row.reference_number}`);
  }
  console.log('\nPull to refresh in the app to see the updated list.');
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
