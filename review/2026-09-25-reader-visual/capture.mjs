import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const target = process.argv[2] || 'before';
const output = `review/2026-09-25-reader-visual/${target}`;
fs.mkdirSync(output, { recursive: true });
for (const [name, viewport] of [['desktop', {width: 1440, height: 900}], ['phone', {width: 390, height: 844}]]) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(process.env.READER_URL || 'http://127.0.0.1:8772/');
  await page.locator('[data-locale="en-US"]').click();
  await page.locator('#enter').click();
  await page.waitForFunction(() => window.libraryDebug?.().shelf.books.length >= 2 && !window.libraryDebug?.().shelf.busy);
  await page.locator('[data-shelf-key="book:jonah-and-the-whale"]').click();
  await page.waitForFunction(() => window.libraryDebug?.().shelf.inspected === 'book:jonah-and-the-whale' && !window.libraryDebug?.().shelf.busy);
  await page.locator('#shelf-read').click();
  await page.locator('.reader h1').waitFor();
  await page.waitForFunction(() => window.libraryDebug?.().scene.loadedPage?.index === 0 && window.libraryDebug?.().scene.stageVisible);
  await page.waitForFunction(() => document.querySelector('#play-status')?.textContent === 'Page complete', null, { timeout: 30000 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${output}/${name}-jonah-1.png`, fullPage: true });
  await page.locator('#next').click();
  await page.locator('#next').click();
  await page.locator('.reader h1').waitFor();
  await page.waitForFunction(() => window.libraryDebug?.().scene.loadedPage?.index === 2 && window.libraryDebug?.().scene.stageVisible);
  await page.waitForFunction(() => document.querySelector('#play-status')?.textContent === 'Page complete', null, { timeout: 30000 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${output}/${name}-jonah-storm.png`, fullPage: true });
  console.log(name, await page.locator('.reader h1').textContent(), await page.evaluate(() => ({scrollWidth: document.documentElement.scrollWidth, width: innerWidth, height: document.documentElement.scrollHeight})));
  if (target !== 'baseline') for (const book of ['eden', 'noah']) {
    await page.locator('#shelf').click();
    await page.waitForFunction(() => window.libraryDebug?.().shelf.browsing && !window.libraryDebug?.().shelf.busy);
    await page.locator(`[data-shelf-key="builtin:${book}"]`).click();
    await page.waitForFunction((key) => window.libraryDebug?.().shelf.inspected === key && !window.libraryDebug?.().shelf.busy, `builtin:${book}`);
    await page.locator('#shelf-read').click();
    await page.waitForFunction((id) => window.libraryDebug?.().scene.loadedPage?.story === id && window.libraryDebug?.().scene.stageVisible, book);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${output}/${name}-${book}-1.png`, fullPage: true });
    console.log(name, book, await page.locator('.reader h1').textContent());
  }
  await context.close();
}
await browser.close();
