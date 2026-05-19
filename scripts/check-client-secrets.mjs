/**
 * CI guard: privileged secrets / admin Supabase must not appear in mobile client code.
 * Scans app/, lib/, hooks/, components/, context/ (excludes scripts/, PROYECTO_MUESTRA/).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SCAN_DIRS = ['app', 'lib', 'hooks', 'components', 'context'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Lines matching these fail CI (code references, not docs). */
const FORBIDDEN = [
  { id: 'service-role-env', pattern: /process\.env\.(EXPO_PUBLIC_)?SUPABASE_SERVICE_ROLE/i },
  { id: 'admin-client', pattern: /\bcreateAdminClient\b/ },
  { id: 'resend', pattern: /RESEND_API_KEY/ },
  { id: 'port-houston-secret', pattern: /PORT_HOUSTON_CLIENT_SECRET/ },
];

const ALLOWLIST_FILES = new Set([
  'lib/supabase/assert-anon-key.ts',
  'lib/config/env.ts',
  'lib/supabase/__tests__/assert-anon-key.test.ts',
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    if (name === 'node_modules' || name === '__tests__' && rel.includes('PROYECTO')) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (EXTENSIONS.has(path.extname(name))) {
      files.push(rel);
    }
  }
  return files;
}

function isCommentOnly(line) {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const rel of walk(path.join(root, dir))) {
    if (ALLOWLIST_FILES.has(rel)) continue;

    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isCommentOnly(line)) continue;

      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(line)) {
          violations.push({ file: rel, line: i + 1, rule: rule.id, text: line.trim() });
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Client secret guard failed:\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.rule}] ${v.text}`);
  }
  console.error(`\n${violations.length} violation(s). See docs/SECRETS_AND_BFF.md`);
  process.exit(1);
}

console.log('Client secret guard: OK (no privileged keys in app/lib/hooks/components/context)');
