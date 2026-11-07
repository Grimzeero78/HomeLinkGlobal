#!/usr/bin/env node
// VISUAL REGRESSION — flags + country picker + language picker (owner's 2 bugs):
//   1) emoji flags showed as bare 'KE' on Windows  → real /flags/*.svg images now
//   2) language change reloaded the page → picker vanished → now switches in place
// Runs against local wrangler dev :8794. Seeds 2 LOCAL listings (KE + IN) so the
// cards show real flags. Nothing touches production D1.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8794';
const OUT = '/tmp/ui_test';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
};

// ---- seed 2 listings via the local API (landlord session) ----
const reg = await fetch(BASE + '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'LANDLORD', name: 'Flag Tester', phone: '+254713000111', username: 'flagtest', password: 'Str0ngPass1', confirm: 'Str0ngPass1', hint: 'n' }) }).then(r => r.json());
if (!reg.ok) { // already exists from a previous run — sign in instead
  const li = await fetch(BASE + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'flagtest', password: 'Str0ngPass1' }) }).then(r => r.json());
  reg.token = li.token; reg.ok = li.ok;
}
if (!reg.ok) { console.log('SEED FAILED', JSON.stringify(reg)); process.exit(1); }
const TOK = reg.token;
const PH = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const mk = (country, town, rent) => fetch(BASE + '/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOK }, body: JSON.stringify({ title: 'Flag test ' + country, ptype: 'Studio', country, town, rent, area: 'Test', landmark: '', photos: [PH, PH, PH], thumbs: [PH, PH, PH] }) }).then(r => r.json());
const l1 = await mk('Kenya', 'Nairobi', 12000);
const l2 = await mk('India', 'Mumbai', 18000);
console.log('seeded:', l1.ok, l2.ok);

const browser = await chromium.launch();
const VP = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const flag404 = [];
const ctx = await browser.newContext(VP);
const page = await ctx.newPage();
page.on('response', r => { if (r.url().includes('/flags/') && r.status() !== 200) flag404.push(r.status() + ' ' + r.url()); });
await page.addInitScript(t => localStorage.setItem('hl_token', t), TOK);

// ---- 1. HOME — cards + hero chips show real flag images, all load ----
await page.goto(BASE + '/#/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2200);
const imgs = await page.$$eval('img.fimg', els => els.map(e => ({ src: e.getAttribute('src'), w: e.naturalWidth })));
ok('home renders flag <img> elements', imgs.length >= 3, 'got ' + imgs.length);
ok('all flag SVGs actually load (naturalWidth>0)', imgs.every(i => i.w > 0), JSON.stringify(imgs.slice(0, 4)));
ok('no /flags/ 404s', flag404.length === 0, flag404.join(' | '));
ok('flags are SVG paths', imgs.every(i => i.src && i.src.startsWith('/flags/') && i.src.endsWith('.svg')), imgs[0] && imgs[0].src);
await page.screenshot({ path: OUT + '/1-home-flags.png' });

// ---- 2. COUNTRY PICKER in the create wizard ----
await page.goto(BASE + '/#/new', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1400);
const cp = await page.$('#cp-btn');
ok('wizard shows country picker button (no emoji <select>)', !!cp);
await page.click('#cp-btn');
await page.waitForTimeout(500);
let rows = await page.$$eval('.cprow', els => els.length);
ok('country picker lists all countries', rows >= 190, 'got ' + rows);
const keImg = await page.$eval('.cprow[data-n="Kenya"] .fimg', e => e.getAttribute('src')).catch(() => null);
ok('Kenya row has real flag img', keImg === '/flags/ke.svg', String(keImg));
await page.fill('#cp-q', 'ken');
await page.waitForTimeout(350);
rows = await page.$$eval('.cprow', els => els.length);
ok('search "ken" narrows the list', rows >= 1 && rows <= 5, 'got ' + rows);
await page.click('.cprow[data-n="Kenya"]');
await page.waitForTimeout(700);
const btnTxt = await page.$eval('#cp-btn', e => e.textContent);
const btnFlag = await page.$eval('#cp-btn .fimg', e => e.getAttribute('src')).catch(() => null);
ok('picked country shows flag + name on the button', btnTxt.includes('Kenya') && btnFlag === '/flags/ke.svg', btnTxt.trim());
await page.screenshot({ path: OUT + '/2-country-picked.png' });

// ---- 3. LANGUAGE PICKER — switch must NOT close/vanish the options ----
await page.goto(BASE + '/#/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);
await page.click('#lang-btn');
await page.waitForTimeout(500);
const h3en = await page.$eval('.modal h3', e => e.textContent);
ok('language picker opens with translated title', h3en.length > 0, h3en);
rows = await page.$$eval('#lp-list .lrow', els => els.length);
ok('all 22 languages listed', rows === 22, 'got ' + rows);
await page.screenshot({ path: OUT + '/3-lang-picker-en.png' });
await page.click('#lp-list [data-lang="es"]');
await page.waitForTimeout(900);
const modalGone = await page.$('.modal') === null;
ok('picker STILL OPEN after switching (no reload)', !modalGone);
rows = await page.$$eval('#lp-list .lrow', els => els.length);
ok('all 22 options STILL VISIBLE after switching', rows === 22, 'got ' + rows);
const h3es = await page.$eval('.modal h3', e => e.textContent);
ok('picker title re-translated to Spanish', h3es === 'Idioma', h3es);
const esChecked = await page.$eval('#lp-list [data-lang="es"] .l-check', e => e.innerHTML.includes('svg')).catch(() => false);
ok('check mark moved to Español', !!esChecked);
const ls = await page.evaluate(() => localStorage.getItem('hl_lang'));
ok('preference saved (hl_lang=es)', ls === 'es', String(ls));
await page.screenshot({ path: OUT + '/4-lang-picker-es.png' });
// close and confirm the page behind is really Spanish
await page.click('.modal-ov', { position: { x: 10, y: 10 } }).catch(() => {});
await page.waitForTimeout(700);
const heroPh = await page.$eval('#hero-q', e => e.placeholder).catch(() => '');
ok('page behind re-rendered in Spanish', /casa|ciudad|busca/i.test(heroPh), heroPh);
await page.screenshot({ path: OUT + '/5-home-spanish.png' });

// ---- 4. RTL sanity: switch to Arabic while picker open ----
await page.click('#lang-btn');
await page.waitForTimeout(400);
await page.click('#lp-list [data-lang="ar"]');
await page.waitForTimeout(900);
const stillOpen = await page.$('.modal') !== null;
const dir = await page.evaluate(() => document.documentElement.dir);
ok('Arabic applies RTL and picker stays open', stillOpen && dir === 'rtl', 'dir=' + dir);
await page.screenshot({ path: OUT + '/6-lang-picker-ar.png' });
// back to English for a clean end state
await page.click('[data-lang="en"]');
await page.waitForTimeout(700);

await browser.close();
console.log(`\n========================\n  ${pass} passed, ${fail} failed\n========================`);
process.exit(fail ? 1 : 0);
