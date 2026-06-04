#!/usr/bin/env node
/**
 * Task 7.2 — preflight before EAS Android build (preview / production).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

const errors = [];
const warnings = [];

const pkg = readJson('package.json');
const app = readJson('app.json').expo;
const eas = readJson('eas.json');

if (pkg.version !== app.version) {
  errors.push(`package.json version (${pkg.version}) !== app.json (${app.version})`);
}

for (const profile of ['preview', 'production']) {
  if (!eas.build?.[profile]) {
    errors.push(`eas.json missing build profile: ${profile}`);
  }
}

const previewAndroid = eas.build?.preview?.android;
if (previewAndroid?.buildType !== 'apk') {
  errors.push('eas.json preview.android.buildType must be "apk" for sideload QA');
}

const envKeys = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY', 'EXPO_PUBLIC_TMS_API_URL'];
for (const profile of ['preview', 'production']) {
  const env = eas.build?.[profile]?.env ?? {};
  for (const key of envKeys) {
    if (env[key] !== `$${key}`) {
      warnings.push(`eas.json ${profile}.env.${key} — expected $${key} EAS secret reference`);
    }
  }
}

if (!app.android?.package) {
  errors.push('app.json expo.android.package is required');
}

const requiredPlugins = ['expo-router', 'expo-image-picker', 'expo-location'];
for (const plugin of requiredPlugins) {
  const plugins = app.plugins ?? [];
  const found = plugins.some((p) => (Array.isArray(p) ? p[0] : p) === plugin);
  if (!found) {
    errors.push(`app.json missing plugin: ${plugin}`);
  }
}

const releaseNotesPath = path.join(root, 'docs', 'RELEASE_NOTES_0_1_0.md');
if (!fs.existsSync(releaseNotesPath)) {
  errors.push('Missing docs/RELEASE_NOTES_0_1_0.md');
}

const projectId = app.extra?.eas?.projectId ?? '';
if (!projectId || projectId.includes('REEMPLAZAR')) {
  warnings.push(
    'app.json extra.eas.projectId not set — create Expo project and replace before EAS build',
  );
}

if (!pkg.scripts?.['build:android:preview'] || !pkg.scripts?.['build:android:production']) {
  errors.push('package.json must define build:android:preview and build:android:production');
}

if (warnings.length) {
  console.warn('\n⚠ Warnings:\n');
  warnings.forEach((w) => console.warn(`  - ${w}`));
}

if (errors.length) {
  console.error('\n✗ EAS build preflight failed:\n');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('\n✓ EAS build preflight passed (7.2).');
console.log(`  Version: ${app.version}`);
console.log(`  Android: ${app.android.package}`);
console.log('\n  Next: set EAS secrets, then:');
console.log('    npm run build:android:preview');
console.log('    npm run build:android:production');
console.log('\n  Notes: docs/RELEASE_NOTES_0_1_0.md · docs/MOBILE_BUILDS.md\n');
