/**
 * Creates driver_test@test.com in Supabase Auth + user_profiles (role driver).
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local — run locally only.
 *
 * Usage: node scripts/create-driver-test-user.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

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

const EMAIL = 'driver_test@test.com';
const PASSWORD = 'Driver01*';
const FULL_NAME = 'Driver Test';

async function main() {
  loadEnvLocal();

  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users?.find(
    (u) => u.email?.toLowerCase() === EMAIL.toLowerCase(),
  );

  let userId = existing?.id;

  if (existing) {
    console.log('Auth user already exists:', EMAIL);
    const { error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      email_confirm: true,
    });
    if (updateErr) {
      console.error('Could not update password:', updateErr.message);
      process.exit(1);
    }
    console.log('Password updated and email confirmed.');
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME },
    });
    if (error) {
      console.error('createUser failed:', error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log('Auth user created:', EMAIL, 'id:', userId);
  }

  const { error: profileErr } = await admin.from('user_profiles').upsert(
    {
      id: userId,
      email: EMAIL,
      full_name: FULL_NAME,
      role: 'driver',
      password_set: true,
    },
    { onConflict: 'id' },
  );

  if (profileErr) {
    console.error('user_profiles upsert failed:', profileErr.message);
    process.exit(1);
  }

  console.log('user_profiles: role=driver OK');

  const { error: driverErr } = await admin.from('drivers').upsert(
    {
      id: userId,
      name: FULL_NAME,
      email: EMAIL,
      status: 'Available',
      enabled: true,
    },
    { onConflict: 'id' },
  );

  if (driverErr) {
    console.error('drivers upsert failed:', driverErr.message);
    process.exit(1);
  }

  console.log('drivers: row with same id as auth user (required for loads.driver_id FK)');
  console.log('\nSign in on PP2 with:');
  console.log('  Email:   ', EMAIL);
  console.log('  Password:', PASSWORD);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
