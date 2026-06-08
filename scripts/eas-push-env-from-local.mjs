#!/usr/bin/env node
/**
 * Push EXPO_PUBLIC_* from .env.local to EAS (preview + production).
 * Run after: npx eas-cli login && npx eas-cli init
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env.local');

const REQUIRED = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_TMS_API_URL',
];

function parseDotenv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

// EXPO_PUBLIC_* is bundled into the app — EAS rejects visibility "secret" for these names.
function visibilityFor(name) {
  return name.includes('ANON_KEY') ? 'sensitive' : 'plaintext';
}

let vars;
try {
  vars = parseDotenv(fs.readFileSync(envPath, 'utf8'));
} catch {
  console.error('Missing .env.local — copy .env.example and fill the EXPO_PUBLIC_* values.');
  process.exit(1);
}

for (const name of REQUIRED) {
  const value = vars[name]?.trim();
  if (!value || value.includes('your-') || value.includes('your-project')) {
    console.error(`Set a real value for ${name} in .env.local`);
    process.exit(1);
  }
}

for (const name of REQUIRED) {
  console.log(`\n→ EAS env: ${name} (preview + production)`);
  const result = spawnSync(
    'npx',
    [
      'eas-cli',
      'env:create',
      '--name',
      name,
      '--value',
      vars[name],
      '--environment',
      'preview',
      '--environment',
      'production',
      '--visibility',
      visibilityFor(name),
      '--force',
      '--non-interactive',
    ],
    { cwd: root, stdio: 'inherit', shell: true },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\n✓ EAS environment variables set. Verify: npx eas-cli env:list --environment preview');
console.log('  Next: npm run build:android:preview');
