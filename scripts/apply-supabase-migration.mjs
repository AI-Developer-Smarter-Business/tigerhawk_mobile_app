/**
 * Aplica un archivo SQL en el Postgres remoto de Supabase.
 * Requiere en .env.local (o entorno):
 *   SUPABASE_DB_URL  — connection string completo, o
 *   SUPABASE_DB_PASSWORD — contraseña de Database Settings (usuario postgres)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
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
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres:${encoded}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
}

async function main() {
  loadEnvLocal();

  const migrationFile =
    process.argv[2] ??
    'supabase/migrations/20260518120000_pp2_driver_scoped_load_messages_documents.sql';
  const sqlPath = path.resolve(root, migrationFile);

  if (!fs.existsSync(sqlPath)) {
    console.error(`No existe: ${sqlPath}`);
    process.exit(1);
  }

  const dbUrl = resolveDbUrl();
  if (!dbUrl) {
    console.error(
      'Falta SUPABASE_DB_URL o SUPABASE_DB_PASSWORD en .env.local\n' +
        'Dashboard → Project Settings → Database → Database password',
    );
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  try {
    await client.query(sql);
    const { rows } = await client.query(`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename IN ('load_messages', 'load_documents')
      ORDER BY tablename, policyname
    `);
    console.log('Migración aplicada:', migrationFile);
    console.log('Políticas actuales:');
    for (const row of rows) {
      console.log(`  ${row.tablename}: ${row.policyname}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
