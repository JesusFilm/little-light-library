import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const url = process.env.LIBRARY_URL || "http://127.0.0.1:8788/";
const locales = [
  "en-US",
  "en-GB",
  "es",
  "fr",
  "hi",
  "it",
  "ja",
  "pt-BR",
  "zh-CN",
];
const speeds = [0.75, 1, 1.25, 1.5];
const manifest = JSON.parse(
  fs.readFileSync("public/audio-manifest.json", "utf8"),
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 768, height: 1024 },
});
const page = await context.newPage();
const result = {
  browser: browser.version(),
  url,
  method:
    "Observe real app clock and phrase-2 DOM onset after pause/resume and mute/volume change on Eden page 1. Expected boundary is decoded recording duration in the checked audio manifest. This measures scheduling/display continuity, not listening quality.",
  samples: [],
};

try {
  await page.goto(url);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.libraryDebug().ready);
  await page.locator('[data-book="eden"]').click();
  await page.waitForFunction(() => window.libraryDebug().ready);
  for (const locale of locales) {
    if (locale !== "en-US") {
      await page.locator("#language").click();
      await page.locator(`[data-locale="${locale}"]`).click();
      await page.waitForFunction(
        (id) =>
          window.libraryDebug().ready &&
          window.libraryDebug().state.language === id,
        locale,
      );
      await page.locator("#enter").click();
    }
    for (const speed of speeds) {
      const duration = manifest[`${locale}/eden/eden-01/s1`]?.duration;
      assert.ok(duration > 0, `Missing duration for ${locale}`);
      await page.locator("#next").click();
      await page.waitForFunction(
        () =>
          window.libraryDebug().state.page === 1 && window.libraryDebug().ready,
      );
      await page.locator("#previous").click();
      await page.waitForFunction(
        () =>
          window.libraryDebug().state.page === 0 &&
          window.libraryDebug().ready &&
          window.libraryDebug().playing,
      );
      await page.locator("#settings").click();
      await page.locator("#speed").selectOption(String(speed));
      await page.locator("#audio").check();
      await page.locator("#volume").fill("0.8");
      await page.locator("#settings-close").click();
      await page.waitForFunction(() => window.libraryDebug().position > 0.3);

      await page.locator("#settings").click();
      await page.locator("#audio").uncheck();
      await page.locator("#volume").fill("0.35");
      await page.locator("#settings-close").click();
      const mutedAt = (await page.evaluate(() => window.libraryDebug()))
        .position;
      await page.waitForTimeout(220);
      const mutedAfter = (await page.evaluate(() => window.libraryDebug()))
        .position;
      assert.ok(
        mutedAfter > mutedAt + 0.1 * speed,
        `${locale}/${speed} mute stalled clock`,
      );

      await page.locator("#play").click();
      const pausedAt = (await page.evaluate(() => window.libraryDebug()))
        .position;
      await page.waitForTimeout(220);
      const pausedAfter = (await page.evaluate(() => window.libraryDebug()))
        .position;
      assert.ok(
        Math.abs(pausedAfter - pausedAt) < 0.05,
        `${locale}/${speed} pause drift ${pausedAfter - pausedAt}`,
      );
      await page.locator("#play").click();

      const onset = await page.evaluate(async () => {
        const deadline = performance.now() + 24000;
        return new Promise((resolve, reject) => {
          function sample() {
            const d = window.libraryDebug();
            const active = document
              .querySelector('[data-segment="1"]')
              ?.classList.contains("active");
            if (active && d.segment === 1)
              return resolve({ position: d.position, playing: d.playing });
            if (performance.now() > deadline)
              return reject(
                new Error(
                  `Segment 2 onset timeout; position=${d.position}, segment=${d.segment}`,
                ),
              );
            requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);
        });
      });
      const errorMs = (Math.abs(onset.position - duration) / speed) * 1000;
      const sample = {
        locale,
        speed,
        duration,
        onsetPosition: onset.position,
        errorMs,
        mutedAdvance: mutedAfter - mutedAt,
        pauseDrift: pausedAfter - pausedAt,
      };
      result.samples.push(sample);
      assert.ok(onset.playing, `${locale}/${speed} not playing at boundary`);
      assert.ok(
        errorMs <= 200,
        `${locale}/${speed} boundary error ${errorMs.toFixed(1)} ms`,
      );
      process.stdout.write(`${locale} ${speed}× ${errorMs.toFixed(1)} ms\n`);
    }
  }
  result.passed = true;
} catch (error) {
  result.passed = false;
  result.failure = String(error.stack || error);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    "docs/continuity-results.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  await context.close();
  await browser.close();
}
console.log(
  JSON.stringify(
    {
      passed: result.passed,
      samples: result.samples.length,
      maxErrorMs: Math.max(0, ...result.samples.map((s) => s.errorMs)),
      failure: result.failure,
    },
    null,
    2,
  ),
);
