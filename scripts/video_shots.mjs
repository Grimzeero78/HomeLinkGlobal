#!/usr/bin/env node
// VIDEO shots — real HuntIn Global UI screenshots (local dev server, port 8794).
// /api/geo is route-mocked per shot so the REAL dynamic brand (HuntIn KE/US/IN…)
// shows exactly as it does for visitors of each country. Demo data lives only in
// the local D1 — nothing here touches production.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/home/z/my-project/promo_global/ui';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8794';
const geoMock = (cc) => (route) => route.fulfill({ status: 200, 'content-type': 'application/json', body: JSON.stringify({ ok: true, country: cc }) });

const browser = await chromium.launch();
const VP = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

async function shot(name, { cc = 'KE', url = BASE + '/#/home', wait = 1600, splash = false, actions = null, localStorageSeed = null } = {}) {
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock(cc));
  if (localStorageSeed) await page.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, localStorageSeed);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (splash) { await page.waitForTimeout(420); await page.screenshot({ path: `${OUT}/${name}.png` }); await ctx.close(); console.log('shot', name); return; }
  await page.waitForTimeout(wait);
  if (actions) await actions(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
  console.log('shot', name);
}

// 1) brand montage — the REAL splash with the dynamic country suffix
for (const cc of ['KE', 'UG', 'US', 'IN', 'GB', 'AE']) await shot('splash_' + cc, { cc, splash: true });

// 2) home feeds per country (country-first: each visitor sees their own country)
await shot('home_KE', { cc: 'KE', wait: 2400 });
await shot('home_IN', { cc: 'IN', wait: 2400 });
await shot('home_US', { cc: 'US', wait: 2400 });

// 3) listing details — Nairobi (KSh) + Mumbai (₹)
await shot('listing_ke', { cc: 'KE', url: BASE + '/#/listing/1', wait: 2400 });
await shot('listing_in', { cc: 'IN', url: BASE + '/#/listing/3', wait: 2400 });

// 4) map with pins
await shot('map_ke', { cc: 'KE', url: BASE + '/#/map', wait: 4200 });

// 5) search filtered to India (₹ results) — country filter on
await shot('search_in', { cc: 'IN', url: BASE + '/#/search?country=India', wait: 2600 });

// 6) language picker (globe button) — 22 languages, suggested first
await shot('lang', {
  cc: 'KE', wait: 2200,
  actions: async (p) => { await p.click('#langBtn, [data-lang-btn], .lang-btn, button[title*="lang" i]').catch(async () => { await p.getByRole('button').filter({ hasText: /globe|language|🌍|EN/i }).first().click({ timeout: 2000 }).catch(() => {}); }); await p.waitForTimeout(700); },
});

// 7) landlord wizard (signed in) — step 0 with country + free-floor field
await shot('wizard', {
  cc: 'KE', wait: 2200,
  actions: async (p) => {
    await p.goto(BASE + '/#/login'); await p.waitForTimeout(700);
    await p.fill('input[name="username"], #username', 'videodemo_amina');
    await p.fill('input[name="password"], #password', 'HuntGlobal7Kx');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(1600);
    await p.goto(BASE + '/#/new'); await p.waitForTimeout(1400);
  },
});

// 8) chat with landlord (seeker side) — register + message owner of listing 1
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  await page.goto(BASE + '/#/register'); await page.waitForTimeout(800);
  await page.fill('input[name="name"]', 'Brian O.');
  await page.fill('input[name="username"]', 'videodemo_seeker');
  await page.fill('input[name="phone"]', '+254733000777');
  const pw = page.locator('input[type="password"]');
  await pw.nth(0).fill('RentHunt8Zq');
  const conf = page.locator('input[name="confirm"], input[type="password"]').nth(1);
  if (await conf.count()) await conf.fill('RentHunt8Zq');
  const hint = page.locator('input[name="hint"]');
  if (await hint.count()) await hint.fill('my hint is video');
  await page.click('button[type="submit"], .btn-primary').catch(() => {});
  await page.waitForTimeout(1800);
  await page.goto(BASE + '/#/listing/1'); await page.waitForTimeout(1800);
  // open chat from the listing (message owner button)
  await page.getByRole('button').filter({ hasText: /message|chat/i }).first().click({ timeout: 3000 }).catch(async () => {
    await page.locator('a[href*="#/chat"], .btn').filter({ hasText: /message|chat/i }).first().click({ timeout: 2000 }).catch(() => {});
  });
  await page.waitForTimeout(900);
  const box = page.locator('textarea, input[type="text"]').last();
  if (await box.count()) { await box.fill('Hello! Is this house still available for a viewing this weekend?'); await page.keyboard.press('Enter'); }
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/chat.png` });
  await ctx.close();
  console.log('shot chat');
}

// 9) my listings with FREE boost badge (landlord)
await shot('mylistings', {
  cc: 'KE', wait: 300,
  actions: async (p) => {
    await p.goto(BASE + '/#/login'); await p.waitForTimeout(700);
    await p.fill('input[name="username"], #username', 'videodemo_amina');
    await p.fill('input[name="password"], #password', 'HuntGlobal7Kx');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(1600);
    await p.goto(BASE + '/#/mylistings'); await p.waitForTimeout(1500);
  },
});

await browser.close();
console.log('ALL_SHOTS_DONE');
