// Dump STR (English source) to scripts/tr/en.json for the translation pipeline
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
const src = readFileSync('/home/z/my-project/HuntInGlobal/public/js/i18n.js', 'utf8');
const { STR } = new Function(src + ';return {STR};')();
mkdirSync('/home/z/my-project/HuntInGlobal/scripts/tr', { recursive: true });
writeFileSync('/home/z/my-project/HuntInGlobal/scripts/tr/en.json', JSON.stringify(STR, null, 1));
console.log('STR keys:', Object.keys(STR).length);
