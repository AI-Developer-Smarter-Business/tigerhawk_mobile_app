#!/usr/bin/env node
/**
 * K.1 — Oleada 1 QA preflight (TABLE / accept / POD / offline / Complete).
 * Manual device sign-off: docs/QA_OLEADA1_MATRIX_K1.md
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const jestPatterns = [
  'app-routes-smoke',
  'mobile-api-routes',
  'mobile-api-error',
  'mutate-driver-progress',
  'mutate-pod-signature',
  'parse-driver-progress',
  'missing-requirement-labels',
  'assert-driver-document-type',
  'offline-queue',
  'maps-url',
  'driver-clock',
  'parse-driver-clock',
  'central',
].join('|');

function run(command, label) {
  console.log(`\n▶ ${label}\n`);
  execSync(command, { stdio: 'inherit', cwd: root });
}

const matrixPath = path.join(root, 'docs', 'QA_OLEADA1_MATRIX_K1.md');
if (!fs.existsSync(matrixPath)) {
  console.error('Missing docs/QA_OLEADA1_MATRIX_K1.md');
  process.exit(1);
}

run('npm run lint', 'TypeScript (tsc --noEmit)');
run('npm run check:secrets', 'Client secret guard');
run(`npm test -- --ci --testPathPattern="${jestPatterns}"`, 'Jest (K.1 oleada 1 focus)');

console.log(
  '\n✓ QA K.1 preflight passed. Manual device matrix: docs/QA_OLEADA1_MATRIX_K1.md\n',
);
