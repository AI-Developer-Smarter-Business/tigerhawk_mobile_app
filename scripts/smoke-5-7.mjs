#!/usr/bin/env node
/**
 * Task 5.7 — full CI smoke (lint + secrets + all tests).
 */
import { execSync } from 'node:child_process';

console.log('\n▶ PP2 smoke 5.7 — full CI\n');
execSync('npm run ci', { stdio: 'inherit' });
console.log('\n✓ Smoke 5.7 passed. Manual path: docs/QA_SMOKE_E2E_5_7.md\n');
