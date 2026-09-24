import { chromium } from "playwright";
import fs from "node:fs";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const report = {
  method:
    "Actual application first-phrase highlights at ten distributed page starts per locale/rate; recorded WAV onset padding separately verified. AudioContext is the authoritative timeline. This measures scheduling/display onset, not listening quality.",
  samples: [],
  errors: [],
};
page.on("pageerror", (e) => report.errors.push(e.message));
try {
  await page.goto(process.env.LIBRARY_URL || "http://127.0.0.1:8771/");
  await page.locator("#enter").click();
  for (const locale of [
    "en-US",
    "en-GB",
    "es",
    "fr",
    "hi",
    "it",
    "ja",
    "pt-BR",
    "zh-CN",
  ]) {
    await page.locator("#language").click();
    await page.locator(`[data-locale="${locale}"]`).click();
    await page.waitForFunction(
      (l) => document.documentElement.lang === l,
      locale,
    );
    await page.locator("#enter").click();
    for (const speed of [0.75, 1, 1.25, 1.5]) {
      await page.locator("#settings").click();
      await page.locator("#speed").selectOption(String(speed));
      await page.locator("#settings-close").click();
      const start = (await page.evaluate(() => window.libraryDebug()))
        .onsetSamples.length;
      for (const book of ["eden", "noah"]) {
        await page.locator(`[data-book="${book}"]`).click();
        for (let i = 0; i < 5; i++) {
          await page.waitForFunction(
            () => window.libraryDebug().ready && window.libraryDebug().playing,
          );
          await page.waitForTimeout(70);
          if (i < 4) await page.locator("#next").click();
        }
        await page.locator("#shelf").click();
        await page.waitForSelector('[data-book="eden"]');
      }
      const samples = (
        await page.evaluate(() => window.libraryDebug())
      ).onsetSamples
        .slice(start)
        .filter(
          (s) => s.segment === 0 && s.locale === locale && s.speed === speed,
        );
      assert.equal(samples.length, 10, `${locale} ${speed}: sample count`);
      const max = Math.max(...samples.map((s) => s.errorMs));
      assert.ok(max + 26.7 <= 200, `onset bound ${max + 26.7}`);
      report.samples.push({
        locale,
        speed,
        count: samples.length,
        maxSchedulingMs: max,
        conservativeCombinedMs: max + 26.7,
      });
    }
    console.log("timing complete", locale);
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (e) {
  report.passed = false;
  report.failure = e.stack;
  process.exitCode = 1;
  console.error(e);
} finally {
  fs.writeFileSync(
    "docs/timing-results.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  await browser.close();
}
