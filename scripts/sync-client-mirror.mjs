#!/usr/bin/env node
/**
 * Sync dev repo → client mirror (tigerhawk_mobile folder).
 * Excludes *.png and most *.md; keeps release/CI docs required by Jest (lib/qa).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const defaultDest =
  process.env.PP2_CLIENT_MIRROR ??
  'C:\\Users\\ariel\\OneDrive\\Escritorio\\RECRUITING_SMARTER___BRASIL\\SUBIDAS A GITHUB\\PP2_MOBILE';

/** Markdown files required by CI (release-handoff-docs + release-qa-preflight tests). */
const MD_ALLOWLIST = new Set([
  'CHANGELOG.md',
  'README.md',
  'docs/VERSIONING.md',
  'docs/BUG_REPORTING.md',
  'docs/ROLLBACK_PP2.md',
  'docs/EAS_CREDENTIALS_HANDOFF_7_5.md',
  'docs/MOBILE_SUPPORT_RUNBOOK_7_6.md',
  'docs/GPS_LIVE_TRACKING_ARCHITECTURE.md',
  'docs/TMS_DEV_REPOSITORY.md',
  'docs/BACKLOG_V1_1_7_7.md',
  'docs/QA_RELEASE_SIGNOFF_7_1.md',
  'docs/RELEASE_NOTES_0_1_0.md',
  'docs/MOBILE_BUILDS.md',
]);

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.expo',
  'coverage',
  'dist',
  'web-build',
]);

function shouldCopyFile(relPosix) {
  const ext = path.extname(relPosix).toLowerCase();
  if (ext === '.png') return false;
  if (ext === '.md') return MD_ALLOWLIST.has(relPosix.replace(/\\/g, '/'));
  return true;
}

function syncTree(srcDir, destDir, rel = '') {
  let copied = 0;
  let skipped = 0;

  for (const name of fs.readdirSync(srcDir)) {
    const relChild = rel ? `${rel}/${name}` : name;
    const srcPath = path.join(srcDir, name);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      if (relChild.split('/').some((part) => SKIP_DIRS.has(part))) continue;
      const destPath = path.join(destDir, name);
      fs.mkdirSync(destPath, { recursive: true });
      const sub = syncTree(srcPath, destPath, relChild);
      copied += sub.copied;
      skipped += sub.skipped;
      continue;
    }

    const relPosix = relChild.replace(/\\/g, '/');
    if (!shouldCopyFile(relPosix)) {
      skipped += 1;
      continue;
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPath, path.join(destDir, name));
    copied += 1;
  }

  return { copied, skipped };
}

const dest = path.resolve(defaultDest);
if (!fs.existsSync(dest)) {
  console.error(`Destination not found: ${dest}`);
  process.exit(1);
}

const { copied, skipped } = syncTree(root, dest);
console.log(`Client mirror sync complete → ${dest}`);
console.log(`  Copied: ${copied} files`);
console.log(`  Skipped: ${skipped} files (.png + non-CI .md)`);
console.log(`  CI markdown allowlist: ${MD_ALLOWLIST.size} paths`);
