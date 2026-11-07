#!/usr/bin/env node
// Remaining video shots: wizard (landlord form), chat thread, my-listings boost view.
import { chromium } from 'playwright';
import fs from 'node:fs';

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

// 1) landlord wizard — step 0 (country, city, free floor field)
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  await loginAs(page, 'videodemo_amina', 'HuntGlobal7Kx');
  await page.goto(BASE + '/#/new'); await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/wizard.png` });
  // step 2-ish: pricing + floor? just grab step 0 for the video
  await ctx.close(); console.log('shot wizard');
}

// 2) chat thread — seeker messages the Nairobi landlord
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  await page.goto(BASE + '/#/register'); await page.waitForTimeout(900);
  await page.fill('#rg-name', 'Brian O.');
  await page.fill('#rg-phone', '+254733000777');
  await page.fill('#rg-u', 'videodemo_seeker');
  await page.fill('#rg-p', 'RentHunt8Zq');
  await page.fill('#rg-p2', 'RentHunt8Zq');
  await page.fill('#rg-hint', 'video hint 26');
  await page.click('#rg-go'); await page.waitForTimeout(2000);
  await page.goto(BASE + '/#/listing/1'); await page.waitForTimeout(2000);
  await page.click('#btn-msg'); await page.waitForTimeout(1000);
  const box = page.locator('textarea, input[type="text"]').last();
  await box.fill('Hello! Is this house still available for a viewing this weekend?').catch(() => {});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/chat.png` });
  await ctx.close(); console.log('shot chat');
}

// 3) my listings — FREE boost state (landlord)
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  await loginAs(page, 'videodemo_amina', 'HuntGlobal7Kx');
  await page.goto(BASE + '/#/mylistings'); await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/mylistings.png` });
  await ctx.close(); console.log('shot mylistings');
}

await browser.close();
console.log('REST_DONE');
