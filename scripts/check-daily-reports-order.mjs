#!/usr/bin/env node
/**
 * Ensures REPORTES_DIARIOS.md and DAILY_REPORTS.md date sections (##) are
 * in ascending chronological order. Skips non-date headings (Directiva, etc.).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const SPANISH_MONTHS = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const ENGLISH_MONTHS = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function parseSpanishDate(line) {
  const m = line.match(/^##\s+(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})\s*$/u);
  if (!m) return null;
  const month = SPANISH_MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return { y: Number(m[3]), m: month, d: Number(m[1]), raw: line.trim() };
}

function parseEnglishDate(line) {
  let m = line.match(/^##\s+(\d{1,2})\s+(\p{L}+)\s+(\d{4})\s*$/u);
  if (m) {
    const month = ENGLISH_MONTHS[m[2].toLowerCase()];
    if (!month) return null;
    return { y: Number(m[3]), m: month, d: Number(m[1]), raw: line.trim() };
  }
  m = line.match(/^##\s+(\p{L}+)\s+(\d{1,2}),\s+(\d{4})\s*$/u);
  if (m) {
    const month = ENGLISH_MONTHS[m[1].toLowerCase()];
    if (!month) return null;
    return { y: Number(m[3]), m: month, d: Number(m[2]), raw: line.trim() };
  }
  return null;
}

function toSortKey({ y, m, d }) {
  return y * 10000 + m * 100 + d;
}

function extractDates(content, parseFn) {
  return content
    .split('\n')
    .filter((line) => line.startsWith('## ') && !line.startsWith('### '))
    .map(parseFn)
    .filter(Boolean);
}

function checkFile(relativePath, parseFn) {
  const filePath = path.join(ROOT, relativePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const dates = extractDates(content, parseFn);
  const errors = [];

  for (let i = 1; i < dates.length; i += 1) {
    const prev = dates[i - 1];
    const curr = dates[i];
    if (toSortKey(curr) < toSortKey(prev)) {
      errors.push(
        `${relativePath}: out-of-order dates — "${curr.raw}" appears after "${prev.raw}"`,
      );
    }
  }

  return errors;
}

const allErrors = [
  ...checkFile('REPORTES_DIARIOS.md', parseSpanishDate),
  ...checkFile('DAILY_REPORTS.md', parseEnglishDate),
];

if (allErrors.length > 0) {
  console.error('Daily reports chronological order check failed:\n');
  for (const err of allErrors) {
    console.error(`  - ${err}`);
  }
  console.error(
    '\nFix: move ## [date] sections so oldest is first, newest last. Use the actual work date.',
  );
  process.exit(1);
}

console.log('Daily reports date order OK (REPORTES_DIARIOS.md + DAILY_REPORTS.md).');
