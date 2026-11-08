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
const mk = (country, town, rent, geo) => fetch(BASE + '/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOK }, body: JSON.stringify({ title: 'Flag test ' + country, ptype: 'Studio', country, town, rent, area: 'Test', landmark: '', photos: [PH, PH, PH], thumbs: [PH, PH, PH], ...(geo || {}) }) }).then(r => r.json());
const l1 = await mk('Kenya', 'Nairobi', 12000, { lat: -1.2864, lng: 36.8172, title: 'Near test Kenya' });
const l2 = await mk('India', 'Mumbai', 18000, { lat: 19.076, lng: 72.8777, title: 'Near test India' });
console.log('seeded:', l1.ok, l2.ok, l1.error || '', l2.error || '');

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
await ctx.close();

// ---- 5. LOGGED OUT — globe beside the theme toggle + BOTH account options ----
const ctx2 = await browser.newContext(VP);
const p2 = await ctx2.newPage();
await p2.goto(BASE + '/#/home', { waitUntil: 'domcontentloaded' });
await p2.waitForTimeout(1600);
// the globe must be a STATIC topbar button right beside the theme toggle
const themeBtn = await p2.$('.topbar .theme-btn[data-theme-toggle]');
const langBtn = await p2.$('.topbar #lang-btn');
ok('theme toggle present in topbar', !!themeBtn);
ok('language globe ALWAYS visible in topbar (logged out too)', !!langBtn);
if (themeBtn && langBtn) {
  const adjacent = await p2.evaluate(() => {
    const th = document.querySelector('.topbar .theme-btn[data-theme-toggle]');
    const lg = document.getElementById('lang-btn');
    return Math.abs(th.getBoundingClientRect().left - lg.getBoundingClientRect().left) < 60;
  });
  ok('globe sits right beside the light/dark button', adjacent);
}
await p2.click('#lang-btn');
await p2.waitForTimeout(500);
ok('globe (logged out) opens the language picker', await p2.$('.modal') !== null);
await p2.keyboard.press('Escape').catch(() => {});
await p2.click('.modal-ov', { position: { x: 8, y: 8 } }).catch(() => {});
const pills = await p2.$$eval('.top-acts a', els => els.map(e => e.textContent.trim()));
ok('logged-out topbar shows Sign in AND Create account', pills.some(t => /sign in/i.test(t)) && pills.some(t => /create/i.test(t)), pills.join('|'));
await p2.setViewportSize({ width: 1280, height: 860 });
await p2.waitForTimeout(800);
const footTxt = await p2.$eval('#sidenav-foot', e => e.textContent).catch(() => '');
const footLinks = await p2.$$eval('#sidenav-foot a', els => els.map(e => e.getAttribute('href'))).catch(() => []);
ok('logged-out "Signed in as" spot shows BOTH Sign in + Create account', footLinks.includes('#/login') && footLinks.includes('#/register'), footTxt.slice(0, 90).replace(/\s+/g, ' '));
const langBtnIn = await p2.$('.topbar #lang-btn') !== null;
ok('globe still in topbar on desktop', langBtnIn);
await p2.screenshot({ path: OUT + '/7-logged-out-desktop.png' });
await ctx2.close();

// ---- 6. REGISTER — phone dial pre-set + searchable code picker, 4 pw rules, eye ----
const ctx3 = await browser.newContext(VP);
const p3 = await ctx3.newPage();
await p3.goto(BASE + '/#/register', { waitUntil: 'domcontentloaded' });
await p3.waitForTimeout(1600);
const dialBtn = await p3.$('#rg-dial');
ok('register shows a country-code button beside the phone field', !!dialBtn);
const dialTxt = await p3.$eval('#rg-dial .dial-code', e => e.textContent).catch(() => '');
const dialSet = /^\+\d{1,6}$/.test(dialTxt);
ok('dial code pre-set from detected country (or settable)', dialSet || /set|code/i.test(dialTxt), dialTxt);
const dialFlag = await p3.$eval('#rg-dial .fimg', e => e.getAttribute('src')).catch(() => null);
if (dialSet) ok('pre-set dial button shows a real flag', !!dialFlag && dialFlag.startsWith('/flags/'), String(dialFlag));
await p3.click('#rg-dial');
await p3.waitForTimeout(500);
await p3.fill('#cp-q', 'ken');
await p3.waitForTimeout(350);
let drows = await p3.$$eval('#cp-list .cprow', els => els.map(e => e.dataset.n));
ok('dial picker search "ken" narrows to Kenya', drows.length === 1 && drows[0] === 'Kenya', drows.join(','));
const kenyaRow = await p3.$('#cp-list .cprow[data-n="Kenya"]');
ok('dial picker search "ken" finds Kenya', !!kenyaRow);
const kenyaDial = await p3.$eval('#cp-list .cprow[data-n="Kenya"] .dial-code', e => e.textContent).catch(() => '');
ok('Kenya row shows +254', kenyaDial === '+254', kenyaDial);
await p3.screenshot({ path: OUT + '/8-dial-picker.png' });
await p3.click('#cp-list .cprow[data-n="Kenya"]');
await p3.waitForTimeout(600);
const dialAfter = await p3.$eval('#rg-dial .dial-code', e => e.textContent);
ok('picked Kenya → button now shows +254', dialAfter === '+254', dialAfter);
const reqs = await p3.$$eval('.pw-meter .pw-reqs span', els => els.map(e => e.dataset.r));
ok('password meter shows the 4 requirements', reqs.length === 4 && ['len', 'case', 'digit', 'common'].every((r, i) => reqs[i] === r), reqs.join(','));
const needsTxt = await p3.$eval('.pw-meter .pw-needs', e => e.textContent).catch(() => '');
ok('meter says the password needs 4 things', /4/.test(needsTxt), needsTxt);
const eye = await p3.$('#rg-p + .pw-eye, .pw-wrap .pw-eye');
ok('eye button present in the password field', !!eye);
const eyeCount = await p3.$$eval('.pw-eye', els => els.length);
ok('confirm-password field ALSO has its own eye (owner bug: it was missing)', eyeCount === 2, 'pw-eye buttons on register form: ' + eyeCount);
if (eye) {
  const t0 = await p3.$eval('#rg-p', e => e.type);
  await p3.click('.pw-wrap .pw-eye');
  await p3.waitForTimeout(250);
  const t1 = await p3.$eval('#rg-p', e => e.type);
  await p3.click('.pw-wrap .pw-eye');
  await p3.waitForTimeout(250);
  const t2 = await p3.$eval('#rg-p', e => e.type);
  ok('eye toggles password visibility on and off', t0 === 'password' && t1 === 'text' && t2 === 'password', t0 + '→' + t1 + '→' + t2);
}
await p3.screenshot({ path: OUT + '/9-register-flags-pw.png' });
await ctx3.close();

// ---- 7. NEAR YOU — 7 km radius: a Kenya renter NEVER sees the India pin ----
const NAIROBI = { lat: -1.2864, lng: 36.8172 }, KISUMU = { lat: -0.0917, lng: 34.768 };
const ctx4 = await browser.newContext(VP);
const p4 = await ctx4.newPage();
const setPos = async pos => { await p4.evaluate(p => localStorage.setItem('hl_pos', JSON.stringify({ ...p, at: Date.now() })), pos); };
await p4.goto(BASE + '/#/home', { waitUntil: 'domcontentloaded' });
await p4.waitForTimeout(1200);
await setPos(NAIROBI);
await p4.reload({ waitUntil: 'domcontentloaded' }); // real reload — goto to the same hash URL would not re-render
await p4.waitForTimeout(2200);
const nearHead = await p4.$eval('#home-nearby h2', e => e.textContent).catch(() => '');
ok('near-you header says within 7 km', /7/.test(nearHead), nearHead);
const nearTxt = await p4.$eval('#home-nearby', e => e.textContent).catch(() => '');
ok('GPS in Nairobi shows the Nairobi pin in near-you', nearTxt.includes('Near test Kenya'), '');
ok('GPS in Nairobi does NOT show the India home in near-you (owner bug)', !nearTxt.includes('Near test India'), nearTxt.slice(0, 120).replace(/\s+/g, ' '));
await p4.screenshot({ path: OUT + '/10-nearby-nairobi.png' });
await setPos(KISUMU);
await p4.reload({ waitUntil: 'domcontentloaded' });
await p4.waitForTimeout(2200);
const farTxt = await p4.$eval('#home-nearby', e => e.textContent).catch(() => '');
ok('GPS in Kisumu (>7km from pins) shows the empty state, not far houses', /7/.test(farTxt) && farTxt.includes('km') && !farTxt.includes('Near test India') && !farTxt.includes('Near test Kenya'), farTxt.slice(0, 140).replace(/\s+/g, ' '));
await p4.screenshot({ path: OUT + '/11-nearby-empty.png' });
await ctx4.close();

await browser.close();
console.log(`\n========================\n  ${pass} passed, ${fail} failed\n========================`);
process.exit(fail ? 1 : 0);
