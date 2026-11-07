#!/usr/bin/env node
// Final re-shoots: chat with sent bubble (local currency now fixed server-side)
// + search framed on results (India chip on, filters collapsed).
import { chromium } from 'playwright';

const OUT = '/home/z/my-project/promo_global/ui';
const BASE = 'http://127.0.0.1:8794';
const geoMock = (cc) => (route) => route.fulfill({ status: 200, 'content-type': 'application/json', body: JSON.stringify({ ok: true, country: cc }) });
const VP = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const browser = await chromium.launch();

// chat — login as the seeker2 (conv already exists), send a message, wait for bubble
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('KE'));
  await page.goto(BASE + '/#/login'); await page.waitForTimeout(900);
  await page.fill('#li-u', 'videodemo_seeker2'); await page.fill('#li-p', 'RentHunt8Zq');
  await page.click('#li-go'); await page.waitForTimeout(1900);
  await page.goto(BASE + '/#/listing/1'); await page.waitForTimeout(2000);
  await page.getByRole('button').filter({ hasText: /I understand/i }).first().click({ timeout: 2000 }).catch(() => {});
  await page.waitForTimeout(300);
  await page.click('#btn-msg').catch((e) => console.log('btn-msg fail', String(e).slice(0, 80)));
  await page.waitForTimeout(1300);
  await page.fill('#th-input, textarea, input[type="text"]', 'Is this house still available? I can view it Saturday morning.').catch(() => {});
  await page.click('#th-send').catch(() => page.keyboard.press('Enter'));
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/chat.png` });
  await ctx.close(); console.log('shot chat');
}

// search — India selected, filters closed, results on top
{
  const ctx = await browser.newContext(VP);
  const page = await ctx.newPage();
  await page.route('**/api/geo', geoMock('IN'));
  await page.goto(BASE + '/#/search'); await page.waitForTimeout(1400);
  await page.click('#s-toggle').catch(() => {});
  await page.waitForTimeout(400);
  await page.click('#f-country .chip[data-v="India"]').catch((e) => console.log('india fail', String(e).slice(0, 80)));
  await page.waitForTimeout(1500);
  await page.click('#s-toggle').catch(() => {}); // collapse filters
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/search_in.png` });
  await ctx.close(); console.log('shot search_in');
}

await browser.close();
console.log('FINAL_DONE');
