#!/usr/bin/env node
/**
 * TASKS A.0 — unauthenticated TMS `/api/mobile/*` route smoke.
 *
 * Confirms whether a host exposes the 14 Jul API surface (preview vs production).
 * Does not print response bodies (status + classification only).
 *
 * Usage:
 *   npm run smoke:a0
 *   npm run smoke:a0 -- --base-url=https://preview-….netlify.app
 *   npm run smoke:a0 -- --json
 *   npm run smoke:a0 -- --require-preview   # exit 1 if any probe is missing (404)
 *
 * Env: EXPO_PUBLIC_TMS_API_URL or NEXT_PUBLIC_APP_URL (from .env.local)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PLACEHOLDER = '00000000-0000-0000-0000-000000000000';

/** Keep in sync with `lib/tms/mobile-api-routes.ts` + RESPUESTAS_CLIENTE.md */
const PROBES = [
  {
    id: 'auth.login',
    method: 'POST',
    path: '/api/mobile/auth/login',
    body: {},
    expectWithoutAuth: [401, 400],
  },
  {
    id: 'driver.clock.get',
    method: 'GET',
    path: '/api/mobile/driver/clock',
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'driver.clock.post',
    method: 'POST',
    path: '/api/mobile/driver/clock',
    body: { event: 'in' },
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'driver.loads',
    method: 'GET',
    path: '/api/mobile/driver/loads',
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'driver.loads.history',
    method: 'GET',
    path: '/api/mobile/driver/loads/history',
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'loads.progress.get',
    method: 'GET',
    path: `/api/mobile/loads/${PLACEHOLDER}/progress`,
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'loads.progress.post',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/progress`,
    body: { action: 'enroute' },
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'loads.pod.get',
    method: 'GET',
    path: `/api/mobile/loads/${PLACEHOLDER}/pod`,
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'loads.pod-signature',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/pod-signature`,
    body: {
      client_signature_id: PLACEHOLDER,
      signer_name: 'A0 Smoke',
      signed_at: '2026-07-14T12:00:00-05:00',
      signature_png: 'a0',
    },
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'loads.accept',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/accept`,
    body: { move_id: PLACEHOLDER, start: false },
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'loads.reject',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/reject`,
    body: { move_id: PLACEHOLDER, reason: 'a0-smoke' },
    expectWithoutAuth: [401, 403],
  },
  {
    id: 'loads.documents',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/documents`,
    body: {},
    expectWithoutAuth: [401, 403, 400, 415, 422],
  },
];

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
    value = value.replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function parseArgs(argv) {
  let baseUrl = '';
  let asJson = false;
  let requirePreview = false;
  for (const arg of argv) {
    if (arg === '--json') asJson = true;
    else if (arg === '--require-preview') requirePreview = true;
    else if (arg.startsWith('--base-url=')) baseUrl = arg.slice('--base-url='.length).trim();
  }
  return { baseUrl, asJson, requirePreview };
}

function classify(status, expectWithoutAuth) {
  if (status === 404) return 'missing';
  if (expectWithoutAuth.includes(status)) return 'present';
  if (status >= 500) return 'server_error';
  if (status === 0) return 'network_error';
  return 'unexpected';
}

async function probeOne(base, probe) {
  const url = `${base}${probe.path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const init = {
      method: probe.method,
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    };
    if (probe.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(probe.body);
    }
    const res = await fetch(url, init);
    await res.arrayBuffer().catch(() => undefined);
    return {
      id: probe.id,
      method: probe.method,
      path: probe.path,
      status: res.status,
      class: classify(res.status, probe.expectWithoutAuth),
      expectWithoutAuth: probe.expectWithoutAuth,
    };
  } catch {
    return {
      id: probe.id,
      method: probe.method,
      path: probe.path,
      status: 0,
      class: 'network_error',
      expectWithoutAuth: probe.expectWithoutAuth,
    };
  } finally {
    clearTimeout(timer);
  }
}

function hostOnly(base) {
  try {
    return new URL(base).host;
  } catch {
    return '(invalid-url)';
  }
}

async function main() {
  loadEnvLocal();
  const { baseUrl, asJson, requirePreview } = parseArgs(process.argv.slice(2));
  const raw =
    baseUrl ||
    process.env.EXPO_PUBLIC_TMS_API_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    '';
  const base = raw.replace(/\/$/, '').trim();
  if (!base) {
    console.error(
      'Missing TMS base URL. Set EXPO_PUBLIC_TMS_API_URL or pass --base-url=https://…',
    );
    process.exit(2);
  }

  const results = [];
  for (const probe of PROBES) {
    results.push(await probeOne(base, probe));
  }

  const summary = {
    task: 'A.0',
    probedAt: new Date().toISOString(),
    baseHost: hostOnly(base),
    present: results.filter((r) => r.class === 'present').length,
    missing: results.filter((r) => r.class === 'missing').length,
    server_error: results.filter((r) => r.class === 'server_error').length,
    unexpected: results.filter((r) => r.class === 'unexpected').length,
    network_error: results.filter((r) => r.class === 'network_error').length,
    july14SurfaceReady: results.every(
      (r) => r.class === 'present' || (r.id === 'loads.documents' && r.class !== 'missing'),
    ),
    results,
  };

  // documents may already exist on prod; July-14 surface needs login/clock/loads/progress/pod/accept
  const july14Ids = PROBES.filter((p) => p.id !== 'loads.documents').map((p) => p.id);
  summary.july14SurfaceReady = july14Ids.every((id) => {
    const row = results.find((r) => r.id === id);
    return row && row.class === 'present';
  });

  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`\n▶ A.0 mobile API smoke — host ${summary.baseHost}\n`);
    console.log('id                        method status class');
    console.log('------------------------- ------ ------ -------------');
    for (const row of results) {
      const id = row.id.padEnd(25);
      const method = row.method.padEnd(6);
      const status = String(row.status).padStart(6);
      console.log(`${id} ${method} ${status} ${row.class}`);
    }
    console.log('\nCounts:', {
      present: summary.present,
      missing: summary.missing,
      server_error: summary.server_error,
      unexpected: summary.unexpected,
      network_error: summary.network_error,
    });
    console.log(
      summary.july14SurfaceReady
        ? '\n✓ July-14 `/api/mobile/*` surface looks present (unauthenticated expect codes).\n'
        : '\n✗ July-14 surface incomplete on this host — use a Netlify/Vercel preview deploy until main merges (see docs/A0_MOBILE_API_PREVIEW_SMOKE.md).\n',
    );
  }

  if (requirePreview && !summary.july14SurfaceReady) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
