// i18n audit — find translation gaps (bug③ "translations aren't translating everything")
// 1) every t('key') used in code must exist in STR (English source)
// 2) every language dict should cover every key that code actually uses
// 3) hunt hardcoded English in templates: placeholder=, title=, aria-label=, >Text<
import { readFileSync, readdirSync } from 'fs';

const JS = '/home/z/my-project/HuntInGlobal/public/js';
const files = readdirSync(JS).filter(f => f.endsWith('.js'));
const src = {};
for (const f of files) src[f] = readFileSync(`${JS}/${f}`, 'utf8');

// ---- parse i18n.js dictionaries ----
const i18nSrc = src['i18n.js'];
const strBlock = i18nSrc.match(/const STR = \{([\s\S]*?)\n\};/)[1];
const strKeys = new Set();
for (const m of strBlock.matchAll(/(?:^|[,{\s])([a-z0-9_]+):(?:'|")/g)) strKeys.add(m[1]);

const i18nBlock = i18nSrc.match(/const I18N = \{([\s\S]*?)\n\};/)[1];
// split top-level lang entries: "xx:{ ... }," — dicts have no nested braces
const langKeys = {}; // lang -> Set(keys)
for (const m of i18nBlock.matchAll(/(?:^|[,{]\s*)([a-z]{2,3}):\{/gm)) {
  const lang = m[1];
  const start = m.index + m[0].length;
  // find matching close brace (no nesting in these dicts)
  let depth = 1, i = start;
  while (depth > 0 && i < i18nBlock.length) {
    if (i18nBlock[i] === '{') depth++;
    else if (i18nBlock[i] === '}') depth--;
    i++;
  }
  const body = i18nBlock.slice(start, i - 1);
  const keys = new Set();
  for (const k of body.matchAll(/(?:^|[,\s])([a-z0-9_]+):(?:'|")/g)) keys.add(k[1]);
  langKeys[lang] = keys;
}

// ---- collect t('key') usage across all files ----
const used = new Map(); // key -> [files]
for (const [f, s] of Object.entries(src)) {
  if (f === 'i18n.js') continue;
  for (const m of s.matchAll(/\bt\(\s*'([^']+)'/g)) {
    if (!used.has(m[1])) used.set(m[1], []);
    used.get(m[1]).push(f);
  }
  for (const m of s.matchAll(/\bt\(\s*"([^"]+)"/g)) {
    if (!used.has(m[1])) used.set(m[1], []);
    used.get(m[1]).push(f);
  }
}
// dynamic keys like t('nav_'+x) — expand from NAV patterns
for (const base of ['nav_home','nav_search','nav_map','nav_chats','nav_post','nav_profile','nav_admin'])
  if (!used.has(base)) used.set(base, ['app.js (dynamic)']);

console.log(`=== 1) t() keys NOT in STR (would render raw key) ===`);
let missing = 0;
for (const [k, fs] of [...used].sort()) {
  if (!strKeys.has(k)) { console.log(`  MISSING STR: ${k}  <- ${[...new Set(fs)].join(', ')}`); missing++; }
}
if (!missing) console.log('  none ✓');

console.log(`\n=== 2) coverage of USED keys per language (fallback=English hides gaps) ===`);
const langs = Object.keys(langKeys);
console.log(`  STR keys: ${strKeys.size}, languages: ${langs.length}`);
for (const lang of langs) {
  const miss = [...used.keys()].filter(k => !langKeys[lang].has(k));
  console.log(`  ${lang.padEnd(4)} missing ${miss.length}/${used.size} used keys${miss.length && miss.length <= 25 ? ': ' + miss.join(',') : ''}`);
}

// full-dict comparison too (STR keys not in lang)
console.log(`\n=== 3) STR keys missing per language (full dict, incl. unused) ===`);
for (const lang of langs) {
  const miss = [...strKeys].filter(k => !langKeys[lang].has(k));
  if (miss.length) console.log(`  ${lang.padEnd(4)} ${miss.length}: ${miss.slice(0, 12).join(',')}${miss.length > 12 ? '…' : ''}`);
}

// ---- hardcoded English hunt ----
console.log(`\n=== 4) suspicious hardcoded English in templates (not via t()) ===`);
const patterns = [
  [/placeholder=(["'])([^"'{]{3,}?)\1/g, 'placeholder'],
  [/title=(["'])([^"'{]{3,}?)\1/g, 'title'],
  [/aria-label=(["'])([^"'{]{3,}?)\1/g, 'aria-label'],
  [/>\s*([A-Z][a-z]+(?: [a-z']+){1,6})\s*</g, 'text-node'],
];
const skipWords = /^(svg|path|circle|rect|line|polyline|img|input|div|span|button|http|data:)/i;
for (const [f, s] of Object.entries(src)) {
  if (f === 'i18n.js' || f === 'world.js') continue;
  for (const [re, kind] of patterns) {
    for (const m of s.matchAll(re)) {
      const txt = m[2] || m[1];
      if (!txt || skipWords.test(txt)) continue;
      // ignore pure numbers/currency/codes
      if (/^[\d\s.,+%$€£-]+$/.test(txt)) continue;
      console.log(`  ${f} [${kind}]: "${txt}"`);
    }
  }
}
console.log('\n(audit done)');
