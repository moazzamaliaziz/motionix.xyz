#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const KNOWN_MAP = {
  'Ã¢â‚¬â€': '—',
  'Ã¢â‚¬â€œ': '–',
  'Ã¢â‚¬â„¢': '\u2019',
  'Ã¢â‚¬Ëœ': '\u2018',
  'Ã¢â‚¬Å“': '\u201C',
  'Ã¢â‚¬\u009d': '\u201D',
  'Ã¢â‚¬Â¦': '…',
  'Ã¢â‚¬Â¢': '•',
  'â€': '\u2014',
  'â‚¬': '',
  'Â ': ' ',
  'Ã©': 'é', 'Ã¨': 'è', 'Ã ': 'à', 'Ã¢': 'â', 'Ã®': 'î', 'Ã´': 'ô',
  'Ã»': 'û', 'Ã§': 'ç', 'Ã‰': 'É', 'Ã€': 'À', 'Ã‡': 'Ç',
  'Ã¼': 'ü', 'Ã¶': 'ö', 'Ã„': 'Ä', 'Ã–': 'Ö', 'Ãœ': 'Ü', 'ÃŸ': 'ß',
  'Ã±': 'ñ', 'Ã‘': 'Ñ',
  'â†': '→', 'â€™': '\u2019', 'â€œ': '\u201C', 'â€\u009d': '\u201D',
};

const SUSPECTS = [/Ã./g, /Â./g, /â€./g, /â‚¬/g, /Å"/g, /Ëœ/g];
function suspiciousScore(s) {
  let score = 0;
  for (const re of SUSPECTS) {
    const m = s.match(re);
    if (m) score += m.length;
  }
  return score;
}

function fixMojibake(input) {
  let result = input;
  for (const [bad, good] of Object.entries(KNOWN_MAP)) {
    if (result.includes(bad)) result = result.split(bad).join(good);
  }
  let iterations = 0;
  let prevScore = suspiciousScore(result);
  while (iterations < 4 && prevScore > 0) {
    let attempt;
    try {
      attempt = Buffer.from(result, 'latin1').toString('utf8');
    } catch { break; }
    const newScore = suspiciousScore(attempt);
    const introducedReplacementChar = attempt.includes('\uFFFD') && !result.includes('\uFFFD');
    if (newScore < prevScore && !introducedReplacementChar) {
      result = attempt;
      prevScore = newScore;
    } else { break; }
    iterations++;
  }
  return result;
}

// Scan messages/ and src/ for .json, .ts, .tsx, .md, .mjs files
const TARGETS = ['messages', 'src', 'content'];
const EXTS = ['.json', '.ts', '.tsx', '.md', '.mdx', '.mjs', '.js'];

let totalFixed = 0;
let totalFiles = 0;

for (const dir of TARGETS) {
  const absDir = path.resolve(dir);
  if (!fs.existsSync(absDir)) continue;
  
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (EXTS.includes(path.extname(entry.name))) {
        totalFiles++;
        const content = fs.readFileSync(full, 'utf8');
        if (suspiciousScore(content) === 0) continue;
        const fixed = fixMojibake(content);
        if (fixed !== content && suspiciousScore(fixed) < suspiciousScore(content)) {
          fs.writeFileSync(full + '.bak', content, 'utf8');
          fs.writeFileSync(full, fixed, 'utf8');
          totalFixed++;
          console.log(`FIXED: ${path.relative('.', full)}`);
        }
      }
    }
  }
  walk(absDir);
}

console.log(`\nScanned ${totalFiles} files, fixed ${totalFixed}`);
console.log('Backups saved as *.bak');
