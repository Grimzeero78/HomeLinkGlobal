// Assemble: merge scripts/tr/{lang}.json into public/js/i18n.js (regenerates the I18N block)
import { readFileSync, writeFileSync, existsSync } from 'fs';
const P = '/home/z/my-project/HuntInGlobal';
const src = readFileSync(`${P}/public/js/i18n.js`, 'utf8');
const { STR, I18N } = new Function(src + ';return {STR,I18N};')();
const strOrder = Object.keys(STR);

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

let total = 0, filled = 0;
const bodies = [];
for (const lang of Object.keys(I18N)) {
  const f = `${P}/scripts/tr/${lang}.json`;
  const dict = { ...I18N[lang] };
  if (existsSync(f)) {
    const tr = JSON.parse(readFileSync(f, 'utf8'));
    for (const [k, v] of Object.entries(tr)) {
      if (STR[k] == null && dict[k] == null) { console.log(`  ! ${lang}: key not in STR: ${k} (kept anyway)`); }
      if (dict[k] == null) filled++;
      dict[k] = v; total++;
    }
  }
  // canonical order: STR order first, then extras
  const keys = [...strOrder.filter(k => dict[k] != null), ...Object.keys(dict).filter(k => !strOrder.includes(k))];
  const missing = strOrder.filter(k => dict[k] == null);
  if (missing.length) console.log(`  ! ${lang}: STILL MISSING ${missing.length}: ${missing.slice(0, 10).join(',')}`);
  // emit lines of ~3 key-values for readability
  const parts = keys.map(k => `${k}:'${esc(dict[k])}'`);
  const lines = [];
  for (let i = 0; i < parts.length; i += 3) lines.push('  ' + parts.slice(i, i + 3).join(', ') + (i + 3 < parts.length ? ',' : ''));
  bodies.push(`${lang}:{\n${lines.join('\n')}\n}`);
}
const out = src.replace(/const I18N = \{[\s\S]*?\n\};/, 'const I18N = {\n' + bodies.join(',\n') + '\n};');
if (!out.includes('const I18N = {')) throw new Error('I18N block replace failed');
writeFileSync(`${P}/public/js/i18n.js`, out);
console.log(`merged ${total} translations, ${filled} were missing; languages: ${Object.keys(I18N).length}`);
