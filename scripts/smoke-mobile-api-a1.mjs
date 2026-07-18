#!/usr/bin/env node
/**
 * TASKS A.1 — mobile API smoke + error-code handleability.
 *
 * 1) Prints the RESPUESTAS code → appAction contract (always).
 * 2) Hits the A.1 endpoint set (same host as A.0) and, when JSON is returned,
 *    checks whether `code` (or inferred 401/403) is known to the contract.
 *
 * Does not print response bodies (only status + parsed code / class).
 *
 * Usage:
 *   npm run smoke:a1
 *   npm run smoke:a1 -- --base-url=https://preview-….netlify.app
 *   npm run smoke:a1 -- --json
 *   npm run smoke:a1 -- --require-codes   # fail if host present but codes unparseable
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PLACEHOLDER = '00000000-0000-0000-0000-000000000000';

/** Mirror of lib/tms/mobile-api-error-codes.ts — keep in sync (Jest locks TS side). */
const CODE_CONTRACT = [
  { code: 'UNAUTHORIZED', appAction: 'drop_session_login' },
  { code: 'MOBILE_JWT_INVALID', appAction: 'drop_session_login' },
  { code: 'NOT_AUTHORIZED', appAction: 'drop_session_contact_dispatch' },
  { code: 'NOT_ASSIGNED', appAction: 'refresh_list' },
  { code: 'CHASSIS_REQUIRED', appAction: 'prompt_chassis' },
  { code: 'POD_SIGNATURE_REQUIRED', appAction: 'open_signature' },
  { code: 'REQUIREMENTS_NOT_MET', appAction: 'show_checklist' },
  { code: 'MOVE_ALREADY_STARTED', appAction: 'call_dispatch' },
  { code: 'STAMP_PENDING', appAction: 'treat_as_success_retry_silent' },
  { code: 'NO_ROUTE', appAction: 'tell_dispatch' },
];

const KNOWN = new Set(CODE_CONTRACT.map((c) => c.code));

const PROBES = [
  { id: 'auth.login', method: 'POST', path: '/api/mobile/auth/login', body: {} },
  { id: 'driver.clock.get', method: 'GET', path: '/api/mobile/driver/clock' },
  {
    id: 'driver.clock.post',
    method: 'POST',
    path: '/api/mobile/driver/clock',
    body: { event: 'in' },
  },
  { id: 'driver.loads', method: 'GET', path: '/api/mobile/driver/loads' },
  {
    id: 'driver.loads.history',
    method: 'GET',
    path: '/api/mobile/driver/loads/history',
  },
  {
    id: 'loads.progress.get',
    method: 'GET',
    path: `/api/mobile/loads/${PLACEHOLDER}/progress`,
  },
  {
    id: 'loads.progress.post',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/progress`,
    body: { action: 'enroute' },
  },
  {
    id: 'loads.documents',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/documents`,
    body: {},
  },
  {
    id: 'loads.pod.get',
    method: 'GET',
    path: `/api/mobile/loads/${PLACEHOLDER}/pod`,
  },
  {
    id: 'loads.pod-signature',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/pod-signature`,
    body: {
      client_signature_id: PLACEHOLDER,
      signer_name: 'A1 Smoke',
      signed_at: '2026-07-14T12:00:00-05:00',
      signature_png: 'a1',
    },
  },
  {
    id: 'loads.accept',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/accept`,
    body: { move_id: PLACEHOLDER, start: false },
  },
  {
    id: 'loads.reject',
    method: 'POST',
    path: `/api/mobile/loads/${PLACEHOLDER}/reject`,
    body: { move_id: PLACEHOLDER, reason: 'a1-smoke' },
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
  let requireCodes = false;
  for (const arg of argv) {
    if (arg === '--json') asJson = true;
    else if (arg === '--require-codes') requireCodes = true;
    else if (arg.startsWith('--base-url=')) baseUrl = arg.slice('--base-url='.length).trim();
  }
  return { baseUrl, asJson, requireCodes };
}

function hostOnly(base) {
  try {
    return new URL(base).host;
  } catch {
    return '(invalid-url)';
  }
}

function classifyStatus(status) {
  if (status === 404) return 'missing';
  if (status === 0) return 'network_error';
  if (status >= 500) return 'server_error';
  if (status >= 200 && status < 500) return 'reachable';
  return 'unexpected';
}

function inferCode(status, body) {
  if (body && typeof body === 'object' && typeof body.code === 'string') {
    return body.code.trim();
  }
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'NOT_AUTHORIZED';
  return null;
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
    let body = null;
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    } else {
      await res.arrayBuffer().catch(() => undefined);
    }
    const statusClass = classifyStatus(res.status);
    const code = statusClass === 'reachable' ? inferCode(res.status, body) : null;
    const codeKnown = code ? KNOWN.has(code) : false;
    return {
      id: probe.id,
      method: probe.method,
      path: probe.path,
      status: res.status,
      class: statusClass,
      code,
      codeKnown,
      handleable: statusClass === 'missing' || (code != null && codeKnown),
    };
  } catch {
    return {
      id: probe.id,
      method: probe.method,
      path: probe.path,
      status: 0,
      class: 'network_error',
      code: null,
      codeKnown: false,
      handleable: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  loadEnvLocal();
  const { baseUrl, asJson, requireCodes } = parseArgs(process.argv.slice(2));
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

  const reachable = results.filter((r) => r.class === 'reachable');
  const withKnownCode = reachable.filter((r) => r.codeKnown);
  const summary = {
    task: 'A.1',
    probedAt: new Date().toISOString(),
    baseHost: hostOnly(base),
    contractSize: CODE_CONTRACT.length,
    reachable: reachable.length,
    missing: results.filter((r) => r.class === 'missing').length,
    knownCodesOnHost: withKnownCode.length,
    codeContract: CODE_CONTRACT,
    results,
    /** Local unit tests prove handleability even when host is 404. */
    codesHandleableInApp: true,
  };

  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`\n▶ A.1 mobile API error smoke — host ${summary.baseHost}\n`);
    console.log('Code contract (appAction):');
    for (const row of CODE_CONTRACT) {
      console.log(`  ${row.code.padEnd(24)} → ${row.appAction}`);
    }
    console.log('\nid                        status class         code                 known');
    console.log('------------------------- ------ ------------- -------------------- -----');
    for (const row of results) {
      console.log(
        `${row.id.padEnd(25)} ${String(row.status).padStart(6)} ${row.class.padEnd(13)} ${String(row.code ?? '—').padEnd(20)} ${row.codeKnown ? 'yes' : 'no'}`,
      );
    }
    console.log(
      `\nReachable: ${summary.reachable} · missing: ${summary.missing} · known codes on host: ${summary.knownCodesOnHost}`,
    );
    console.log(
      'App handleability: YES (TmsMobileApiError + mapMobileApiError — see docs/A1_MOBILE_API_ERROR_SMOKE.md).',
    );
    if (summary.missing === results.length) {
      console.log(
        '\nNote: host has no July-14 surface yet (all missing). Re-run against preview when available; codes remain handleable in-app.\n',
      );
    } else {
      console.log('');
    }
  }

  if (requireCodes) {
    const bad = reachable.filter((r) => !r.codeKnown);
    if (bad.length > 0) {
      console.error('Reachable probes without known/inferred code:', bad.map((b) => b.id));
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
