#!/usr/bin/env node
// Retry: chat thread + mylistings (defensive selectors, tolerant of prior partial state)
import { chromium } from 'playwright';

const OUT = '/home/z/my-project/promo_global/ui';
const BASE = 'http://127.0.0.1:8794';
const geoMock = (cc) => (route) => route.fulfill({ status: 200, 'content-type': 'application/json', body: JSON.stringify({ ok: true, country: cc }) });
const VP = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const browser = await chromium.launch();

async function loginAs(page, u, p) {
  await page.goto(BASE + '/#/login'); await page.waitForTimeout(900);
  await page.fill('#li-u', u); await page.fill('#li-p', p);
  await page.click('#li-go'); await page.waitForTimeout(1800);
}

// chat — try register, fall back to login (seeker may already exist)
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  let ok = false;
  try {
    await page.goto(BASE + '/#/register'); await page.waitForTimeout(900);
    await page.fill('#rg-name', 'Brian O.');
    await page.fill('#rg-phone', '+254733000777');
    await page.fill('#rg-u', 'videodemo_seeker2');
    await page.fill('#rg-p', 'RentHunt8Zq');
    await page.fill('#rg-p2', 'RentHunt8Zq');
    await page.fill('#rg-hint', 'video hint 26');
    await page.click('#rg-go');
    await page.waitForTimeout(2200);
    ok = true;
  } catch (e) { console.log('reg fail →', String(e).slice(0, 120)); }
  if (!ok) await loginAs(page, 'videodemo_seeker2', 'RentHunt8Zq');
  await page.goto(BASE + '/#/listing/1'); await page.waitForTimeout(2200);
  await page.click('#btn-msg').catch((e) => console.log('btn-msg fail', String(e).slice(0, 80)));
  await page.waitForTimeout(1200);
  const box = page.locator('textarea, input[type="text"]').last();
  await box.fill('Hello! Is this house still available for a viewing this weekend?').catch(() => {});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/chat.png` });
  await ctx.close(); console.log('shot chat');
}

// mylistings — FREE boost state
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  await loginAs(page, 'videodemo_amina', 'HuntGlobal7Kx');
  await page.goto(BASE + '/#/mylistings'); await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/mylistings.png` });
  await ctx.close(); console.log('shot mylistings');
}

await browser.close();
console.log('REST_DONE');
