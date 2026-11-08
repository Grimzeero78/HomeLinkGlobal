#!/usr/bin/env node
// EXTRA video shot: the 22-language picker (S6) — real UI, mocked HK geo.
import { chromium } from 'playwright';

const OUT = '/home/z/my-project/promo_global/ui';
const BASE = 'http://127.0.0.1:8794';
const browser = await chromium.launch();
const VP = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const ctx = await browser.newContext(VP);
const page = await ctx.newPage();
await page.route('**/api/geo', route => route.fulfill({ status: 200, 'content-type': 'application/json', body: JSON.stringify({ ok: true, country: 'HK' }) }));
await page.goto(BASE + '/#/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2200);
await page.click('#lang-btn');
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/lang_picker.png` });
// second frame: search filtered to show the search works
await page.fill('#lp-q', 's');
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/lang_picker_search.png` });
await ctx.close();
await browser.close();
console.log('shot lang_picker');
