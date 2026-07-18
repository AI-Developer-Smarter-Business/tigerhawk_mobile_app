#!/usr/bin/env node
/**
 * Task 7.1 — release QA preflight (Semanas 5–6 P0/P1 + smoke guards).
 */
import { execSync } from 'node:child_process';

const jestPatterns = [
  'document-load-association',
  'fetch-load-documents',
  'merge-tms-documents',
  'document-view-url',
  'open-load-document',
  'upload-load-document',
  'document-upload-request',
  'validate-driver-upload-file',
  'prepare-driver-upload-image',
  'driver-upload-e2e-contract',
  'load-detail-routes',
  'useLoadDocumentUpload',
  'PodUploadSection',
  'driver-loads-subscription',
  'network-state',
  'reconnect-recovery',
  'driver-progress',
  'web-driver-panel-parity',
  'get-foreground-position',
  'location-permission',
  'gps-v1-policy',
  'foreground-refetch-throttle',
  'app-routes-smoke',
  'release-qa-preflight',
  'release-handoff-docs',
].join('|');

function run(command, label) {
  console.log(`\n▶ ${label}\n`);
  execSync(command, { stdio: 'inherit' });
}

run('npm run lint', 'TypeScript (tsc --noEmit)');
run('npm run check:secrets', 'Client secret guard');
run(`npm test -- --ci --testPathPattern="${jestPatterns}"`, 'Jest (7.1 release focus)');

console.log(
  '\n✓ QA 7.1 preflight passed. Manual sign-off: docs/QA_RELEASE_SIGNOFF_7_1.md\n',
);
