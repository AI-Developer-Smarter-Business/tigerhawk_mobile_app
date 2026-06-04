#!/usr/bin/env node
/**
 * Task 6.4 — automated preflight before driver upload E2E manual QA.
 * Extends 5.6 focus with upload validation, multipart contract, and route wiring.
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
  'strings-driver-evidence',
  'map-picker-asset',
  'resolve-upload-file-size',
  'assert-driver-document-type',
  'driver-upload-e2e-contract',
  'load-detail-routes',
  'useLoadDocumentUpload',
  'PodUploadSection',
  'driver-loads-subscription',
  'apply-realtime-document-patch',
  'invalidate-loads',
].join('|');

function run(command, label) {
  console.log(`\n▶ ${label}\n`);
  execSync(command, { stdio: 'inherit' });
}

run('npm run lint', 'TypeScript (tsc --noEmit)');
run('npm run check:secrets', 'Client secret guard');
run(`npm test -- --ci --testPathPattern="${jestPatterns}"`, 'Jest (6.4 upload E2E focus)');

console.log(
  '\n✓ QA 6.4 preflight passed. Run manual matrix: docs/QA_DRIVER_UPLOAD_E2E_6_4.md\n',
);
