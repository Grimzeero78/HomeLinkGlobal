#!/usr/bin/env node
// Re-shoots: search (India chip), map (scrolled to real Leaflet map), chat (modal dismissed)
import { chromium } from 'playwright';

const OUT = '/home/z/my-project/promo_global/ui';
const BASE = 'http://127.0.0.1:8794';
const geoMock = (cc) => (route) => route.fulfill({ status: 200, 'content-type': 'application/json', body: JSON.stringify({ ok: true, country: cc }) });
const VP = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const browser = await chromium.launch();

// search — open filters, tap India chip, results in ₹
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('IN'));
  await page.goto(BASE + '/#/search'); await page.waitForTimeout(1400);
  await page.click('#s-toggle').catch(() => {});
  await page.waitForTimeout(500);
  await page.click('#f-country .chip[data-v="India"]').catch((e) => console.log('india chip fail', String(e).slice(0, 80)));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/search_in.png` });
  await ctx.close(); console.log('shot search_in');
}

// map — scroll the real map into view, wait for tiles + pins
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  await page.goto(BASE + '/#/map'); await page.waitForTimeout(4500);
  await page.evaluate(() => { const m = document.querySelector('#mapbox'); if (m) m.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/map_ke.png` });
  await ctx.close(); console.log('shot map_ke');
}

// chat — dismiss the safety modal, then Message in app
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  try {
    await page.goto(BASE + '/#/register'); await page.waitForTimeout(900);
    await page.fill('#rg-name', 'Brian O.');
    await page.fill('#rg-phone', '+254733000999');
    await page.fill('#rg-u', 'videodemo_seeker3');
    await page.fill('#rg-p', 'RentHunt8Zq');
    await page.fill('#rg-p2', 'RentHunt8Zq');
    await page.fill('#rg-hint', 'video hint 27');
    await page.click('#rg-go');
    await page.waitForTimeout(2200);
  } catch (e) { console.log('reg fail →', String(e).slice(0, 100)); }
  await page.goto(BASE + '/#/listing/1'); await page.waitForTimeout(2000);
  // dismiss the caution modal if present
  await page.getByRole('button').filter({ hasText: /I understand/i }).first().click({ timeout: 2500 }).catch(() => console.log('no caution modal'));
  await page.waitForTimeout(400);
  await page.click('#btn-msg').catch((e) => console.log('btn-msg fail', String(e).slice(0, 80)));
  await page.waitForTimeout(1400);
  const box = page.locator('textarea, input[type="text"]').last();
  await box.fill('Hello! Is this house still available for a viewing this weekend?').catch(() => {});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/chat.png` });
  await ctx.close(); console.log('shot chat');
}

await browser.close();
console.log('RESHOOT_DONE');
