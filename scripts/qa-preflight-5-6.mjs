#!/usr/bin/env node
/**
 * Task 5.6 — automated preflight before production manual QA.
 * Runs lint, secret guard, and Jest suites for documents, actions, and network.
 */
import { execSync } from 'node:child_process';

const jestPatterns = [
  'document-load-association',
  'fetch-load-documents',
  'merge-tms-documents',
  'document-view-url',
  'open-load-document',
  'upload-load-document',
  'web-driver-panel-parity',
  'driver-actions',
  'network-state',
  'reconnect-recovery',
  'route-params',
  'apply-profile-fetch-result',
  'load-detail-routes',
].join('|');

function run(command, label) {
  console.log(`\n▶ ${label}\n`);
  execSync(command, { stdio: 'inherit' });
}

run('npm run lint', 'TypeScript (tsc --noEmit)');
run('npm run check:secrets', 'Client secret guard');
run(`npm test -- --ci --testPathPattern="${jestPatterns}"`, `Jest (5.6 focus)`);

console.log('\n✓ QA 5.6 preflight passed. Run manual matrix: docs/QA_PRODUCTION_SIGNOFF_5_6.md\n');
