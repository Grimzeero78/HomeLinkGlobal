// For each language: write scripts/tr/_todo_{lang}.json with ONLY the keys still missing
import { readFileSync, writeFileSync } from 'fs';
const src = readFileSync('/home/z/my-project/HuntInGlobal/public/js/i18n.js', 'utf8');
const { STR, I18N } = new Function(src + ';return {STR,I18N};')();
const en = JSON.parse(readFileSync('/home/z/my-project/HuntInGlobal/scripts/tr/en.json', 'utf8'));
for (const lang of Object.keys(I18N)) {
  const have = I18N[lang];
  const todo = {};
  for (const [k, v] of Object.entries(en)) if (have[k] == null) todo[k] = v;
  writeFileSync(`/home/z/my-project/HuntInGlobal/scripts/tr/_todo_${lang}.json`, JSON.stringify(todo, null, 1));
  console.log(lang, 'missing', Object.keys(todo).length, '/', Object.keys(en).length);
}
