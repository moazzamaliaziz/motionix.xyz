#!/usr/bin/env node
/**
 * fix-mojibake.mjs
 * Finds and fixes "mojibake" corrupted text — the classic
 * "Ã¢â‚¬â€" style garbage that shows up when UTF-8 content gets
 * mis-decoded (usually as Latin-1/Windows-1252) one or more times,
 * often during CMS export/import, copy-paste from Word/Google Docs,
 * or a bad charset header somewhere in the pipeline.
 *
 * TWO MODES (can run both):
 *
 * 1) Local source scan + auto-fix:
 *    node fix-mojibake.mjs --dir ./ [--fix] [--ext .js,.jsx,.ts,.tsx,.md,.mdx,.json,.html]
 *
 * 2) Live site scan (report only — can't write back, tells you which
 *    pages are affected so you can trace it to the CMS/DB/content file):
 *    node fix-mojibake.mjs --url https://motionix.xyz
 *
 * Output: mojibake-report.json (structured, agent-readable)
 *
 * Install deps first:
 *   npm i axios cheerio p-limit fast-glob
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}
const DIR = getArg('--dir');
const SITE_URL = getArg('--url');
const DO_FIX = args.includes('--fix');
const EXT_ARG = getArg('--ext');
const EXTS = (EXT_ARG ? EXT_ARG.split(',') : ['.js', '.jsx', '.ts', '.tsx', '.md', '.mdx', '.json', '.html', '.txt']);

if (!DIR && !SITE_URL) {
  console.error('Usage:\n  node fix-mojibake.mjs --dir ./ [--fix]\n  node fix-mojibake.mjs --url https://yoursite.com');
  process.exit(1);
}

// --- known stubborn mojibake sequences (fast-path exact replacements) ---
const KNOWN_MAP = {
  'Ã¢â‚¬â€': '—',   // em dash
  'Ã¢â‚¬â€œ': '–',  // en dash
  'Ã¢â‚¬â„¢': '’',  // right single quote / apostrophe
  'Ã¢â‚¬Ëœ': '‘',  // left single quote
  'Ã¢â‚¬Å“': '“',  // left double quote
  'Ã¢â‚¬\u009d': '”', // right double quote
  'Ã¢â‚¬Â¦': '…',  // ellipsis
  'Ã¢â‚¬Â¢': '•',  // bullet
  'Â ': ' ',       // non-breaking space artifact
  'Ã©': 'é', 'Ã¨': 'è', 'Ã ': 'à', 'Ã¢': 'â', 'Ã®': 'î', 'Ã´': 'ô',
  'Ã»': 'û', 'Ã§': 'ç', 'Ã‰': 'É', 'Ã€': 'À', 'Ã‡': 'Ç',
  'Ã¼': 'ü', 'Ã¶': 'ö', 'Ã„': 'Ä', 'Ã–': 'Ö', 'Ãœ': 'Ü', 'ÃŸ': 'ß',
  'Ã±': 'ñ', 'Ã‘': 'Ñ',
};

// --- heuristic: how "corrupted-looking" is this string? lower = better ---
const SUSPECTS = [/Ã./g, /Â./g, /â€./g, /â‚¬/g, /Å“/g, /Ëœ/g];
function suspiciousScore(s) {
  let score = 0;
  for (const re of SUSPECTS) {
    const m = s.match(re);
    if (m) score += m.length;
  }
  return score;
}

// iterative "decode as if it was mis-read one extra layer" fixer
// (this is the same principle libraries like ftfy use)
function fixMojibake(input) {
  let result = input;

  // fast-path known exact sequences first
  for (const [bad, good] of Object.entries(KNOWN_MAP)) {
    if (result.includes(bad)) result = result.split(bad).join(good);
  }

  let iterations = 0;
  let prevScore = suspiciousScore(result);
  while (iterations < 4 && prevScore > 0) {
    let attempt;
    try {
      attempt = Buffer.from(result, 'latin1').toString('utf8');
    } catch {
      break;
    }
    const newScore = suspiciousScore(attempt);
    const introducedReplacementChar = attempt.includes('\uFFFD') && !result.includes('\uFFFD');
    if (newScore < prevScore && !introducedReplacementChar) {
      result = attempt;
      prevScore = newScore;
    } else {
      break;
    }
    iterations++;
  }
  return result;
}

function findMatches(text) {
  const matches = [];
  const re = /(Ã.|Â.|â€.|â‚¬|Å“|Ëœ){1,}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const start = Math.max(0, m.index - 20);
    const end = Math.min(text.length, m.index + m[0].length + 20);
    matches.push({ match: m[0], context: text.slice(start, end) });
  }
  return matches;
}

// ---------- MODE 1: local source scan ----------
async function scanLocal() {
  const patterns = EXTS.map((e) => `**/*${e}`);
  const files = await fg(patterns, {
    cwd: DIR,
    ignore: ['**/node_modules/**', '**/.next/**', '**/.git/**', '**/dist/**', '**/build/**'],
    absolute: true,
  });

  console.log(`Scanning ${files.length} files under ${DIR}...\n`);

  const findings = [];

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const matches = findMatches(content);
    if (matches.length === 0) continue;

    const fixed = fixMojibake(content);
    const stillBroken = findMatches(fixed).length > 0;

    findings.push({
      file: path.relative(DIR, file),
      occurrences: matches.length,
      samples: matches.slice(0, 5),
      autoFixable: !stillBroken,
    });

    if (DO_FIX && !stillBroken) {
      fs.writeFileSync(file + '.bak', content, 'utf8'); // backup
      fs.writeFileSync(file, fixed, 'utf8');
    }
  }

  const report = {
    mode: 'local',
    dir: DIR,
    scannedAt: new Date().toISOString(),
    filesScanned: files.length,
    filesWithIssues: findings.length,
    fixApplied: DO_FIX,
    findings,
  };

  fs.writeFileSync('mojibake-report.json', JSON.stringify(report, null, 2));

  console.log(`Files with mojibake: ${findings.length}`);
  if (findings.length) {
    console.table(findings.map((f) => ({
      File: f.file,
      Occurrences: f.occurrences,
      AutoFixable: f.autoFixable,
      Sample: f.samples[0]?.match || '',
    })));
  }
  if (DO_FIX) {
    console.log('\nFixes applied in place. Originals backed up as *.bak — review with `git diff`, then delete .bak files once confirmed.');
  } else {
    console.log('\nDry run only (no --fix passed). Re-run with --fix to apply changes (backups are written automatically).');
  }
  console.log('Full report: mojibake-report.json');
}

// ---------- MODE 2: live site scan ----------
async function scanLive() {
  const baseOrigin = new URL(SITE_URL).origin;
  const visited = new Set();
  const toVisit = new Set([SITE_URL]);
  const limit = pLimit(8);
  const findings = [];

  async function tryFetchSitemap() {
    for (const p of ['/sitemap.xml', '/sitemap-0.xml', '/sitemap_index.xml']) {
      try {
        const res = await axios.get(baseOrigin + p, { timeout: 10000 });
        const $ = cheerio.load(res.data, { xmlMode: true });
        const urls = [];
        $('loc').each((_, el) => urls.push($(el).text().trim()));
        if (urls.length) return urls;
      } catch {}
    }
    return null;
  }

  function isInternal(url) {
    try { return new URL(url).origin === baseOrigin; } catch { return false; }
  }

  async function crawlPage(pageUrl) {
    if (visited.has(pageUrl)) return;
    visited.add(pageUrl);
    let res;
    try {
      res = await axios.get(pageUrl, { timeout: 10000, validateStatus: () => true });
    } catch {
      return;
    }
    if (res.status >= 400) return;
    const contentType = res.headers['content-type'] || '';
    if (!contentType.includes('text/html')) return;

    const bodyText = res.data;
    const matches = findMatches(bodyText);
    if (matches.length) {
      findings.push({ url: pageUrl, occurrences: matches.length, samples: matches.slice(0, 5) });
    }

    const $ = cheerio.load(bodyText);
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || /^(mailto:|tel:|javascript:|#)/.test(href)) return;
      try {
        const abs = new URL(href, pageUrl).href;
        if (isInternal(abs) && !visited.has(abs)) toVisit.add(abs);
      } catch {}
    });
  }

  console.log(`Crawling ${baseOrigin} for corrupted characters...\n`);
  const sitemapUrls = await tryFetchSitemap();
  if (sitemapUrls) sitemapUrls.forEach((u) => toVisit.add(u));

  while (toVisit.size > 0) {
    const batch = [...toVisit].filter((u) => isInternal(u) && !visited.has(u));
    toVisit.clear();
    if (batch.length === 0) break;
    await Promise.all(batch.map((u) => limit(() => crawlPage(u))));
  }

  const report = {
    mode: 'live',
    site: baseOrigin,
    scannedAt: new Date().toISOString(),
    pagesCrawled: visited.size,
    pagesWithIssues: findings.length,
    findings,
  };

  fs.writeFileSync('mojibake-report.json', JSON.stringify(report, null, 2));

  console.log(`Pages crawled: ${visited.size}`);
  console.log(`Pages with mojibake: ${findings.length}\n`);
  if (findings.length) {
    console.table(findings.map((f) => ({ URL: f.url, Occurrences: f.occurrences, Sample: f.samples[0]?.match || '' })));
    console.log('\nThese come from your CMS/DB/content source, not static files — trace each URL to its data source and re-save/re-encode as UTF-8 there.');
  }
  console.log('\nFull report: mojibake-report.json');
}

async function main() {
  if (DIR) await scanLocal();
  if (SITE_URL) await scanLive();
}

main().catch((e) => { console.error('Fatal error:', e); process.exit(1); });
