import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const out = process.env.TOUCH_REVIEW_OUT || "review/latest-validation/touch";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  for (const width of [1366, 360]) {
    const size = { width, height: width === 360 ? 800 : 768 };
    const context = await browser.newContext({
      viewport: size,
      recordVideo: { dir: `${out}/video`, size },
    });
    const page = await context.newPage();
    const video = page.video();
    await page.goto(process.env.LIBRARY_URL || "http://127.0.0.1:8771");
    await page.locator("#enter").click();
    await page.locator("[data-book=eden]").click();
    await page.waitForFunction(() => window.libraryDebug().ready);
    await page.locator("#next").click();
    await page.waitForFunction(() => window.libraryDebug().ready);
    await page.waitForTimeout(1400);
    if ((await page.evaluate(() => window.libraryDebug())).playing)
      await page.locator("#play").click();
    await page.evaluate(() => window.libraryReview(12));
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${out}/${width}-idle.png` });
    const eve = page.locator(".paper-target").nth(1);
    const bounds = await eve.boundingBox();
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height * 0.5,
    );
    assert.equal(await page.locator(".paper-name").innerText(), "Eve");
    await page.mouse.click(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height * 0.5,
    );
    await page.waitForTimeout(400);
    const tapped = await page.evaluate(() => window.libraryDebug().scene);
    assert.equal(tapped.touchedActor, 1);
    assert.equal(tapped.reacting, true);
    await page.screenshot({ path: `${out}/${width}-eve-tap.png` });
    await page.waitForTimeout(1100);
    await page.mouse.click(8, width === 360 ? 290 : 600);
    assert.equal(
      (await page.evaluate(() => window.libraryDebug().scene)).reacting,
      false,
    );
    await page.locator(".paper-target").nth(0).focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    assert.equal(
      (await page.evaluate(() => window.libraryDebug().scene)).touchedActor,
      0,
    );
    assert.equal(await page.locator(".paper-name").innerText(), "Adam");
    await page.screenshot({ path: `${out}/${width}-keyboard.png` });
    await page.locator("#language").click();
    await page.locator('[data-locale="ja"]').click();
    await page.locator("#enter").click();
    await page.waitForFunction(
      () =>
        window.libraryDebug().ready && document.documentElement.lang === "ja",
    );
    await page.waitForTimeout(1200);
    await page.locator(".paper-target").nth(1).focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    assert.equal(
      await page.locator(".paper-name").innerText(),
      await page.locator(".paper-target").nth(1).getAttribute("aria-label"),
    );
    await page.screenshot({ path: `${out}/${width}-localized.png` });
    results.push({
      width,
      selectedActor: tapped.touchedActor,
      blankSpaceIgnored: true,
      keyboard: true,
      localizedName: await page.locator(".paper-name").innerText(),
    });
    await context.close();
    await video.saveAs(`${out}/${width}-interaction.webm`);
    await video.delete();
  }
} finally {
  await browser.close();
}
fs.writeFileSync(
  `${out}/results.json`,
  JSON.stringify(results, null, 2) + "\n",
);
console.log(results);
