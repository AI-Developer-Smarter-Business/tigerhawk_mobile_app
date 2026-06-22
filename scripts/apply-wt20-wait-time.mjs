/**
 * WT.20 — Apply waiting_time_events schema fix + Realtime on linked Supabase project.
 *
 * Preferred (Supabase CLI logged in + project linked):
 *   npm run db:apply-wt20
 *
 * Alternative (direct Postgres):
 *   node scripts/apply-wt20-wait-time.mjs --pg
 *   Requires SUPABASE_DB_URL or SUPABASE_DB_PASSWORD in .env.local
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SQL_FILES = [
  'supabase/sql-editor/fix_waiting_time_events_billing_columns.sql',
  'supabase/sql-editor/enable_realtime_waiting_time_events.sql',
];

const VERIFY_FILE = 'supabase/sql-editor/VERIFY_pp2_waiting_time_events.sql';

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

function resolveDbUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) return null;
  const projectRef = 'sqkzamyopzxinwkshqgw';
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
}

function runViaSupabaseCli(file) {
  const rel = path.relative(root, path.resolve(root, file));
  const result = spawnSync('npx', ['supabase', 'db', 'query', '--linked', '-f', rel], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`supabase db query failed for ${rel}`);
  }
}

async function runViaPg(file) {
  const dbUrl = resolveDbUrl();
  if (!dbUrl) {
    throw new Error('Missing SUPABASE_DB_URL or SUPABASE_DB_PASSWORD for --pg mode');
  }
  const sql = fs.readFileSync(path.resolve(root, file), 'utf8');
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function verifyPg() {
  const dbUrl = resolveDbUrl();
  if (!dbUrl) return;
  const verifySql = fs.readFileSync(path.resolve(root, VERIFY_FILE), 'utf8');
  const statements = verifySql
    .split(';')
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter(Boolean);

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  try {
    for (const statement of statements) {
      const { rows } = await client.query(statement);
      console.log(JSON.stringify(rows, null, 2));
    }
  } finally {
    await client.end();
  }
}

async function main() {
  const usePg = process.argv.includes('--pg');
  loadEnvLocal();

  console.log('WT.20 — applying waiting_time_events SQL…');
  for (const file of SQL_FILES) {
    console.log(`→ ${file}`);
    if (usePg) {
      await runViaPg(file);
    } else {
      runViaSupabaseCli(file);
    }
  }

  console.log(`→ verify: ${VERIFY_FILE}`);
  if (usePg) {
    await verifyPg();
  } else {
    runViaSupabaseCli(VERIFY_FILE);
  }

  console.log('WT.20 apply complete.');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
