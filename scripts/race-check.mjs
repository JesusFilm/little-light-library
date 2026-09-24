import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const url = process.env.LIBRARY_URL || "http://127.0.0.1:8771/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = { browser: browser.version(), url, checks: [] };
const debug = (page) => page.evaluate(() => window.libraryDebug());
const ready = (page) => page.waitForFunction(() => window.libraryDebug().ready);
const enter = async (page) => {
  await page.goto(url);
  await page.locator("#enter").click();
  await ready(page);
};
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const check = async (name, fn) => {
  const context = await browser.newContext({
    viewport: { width: 960, height: 800 },
    reducedMotion: "reduce",
  });
  try {
    const detail = await fn(await context.newPage(), context);
    results.checks.push({ name, passed: true, detail });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.checks.push({ name, passed: false, detail: String(error) });
    console.log(`FAIL ${name}: ${error}`);
  } finally {
    await context.close();
  }
};
try {
  await check(
    "Stale rejected image cannot replace current narration",
    async (page) => {
      await enter(page);
      const held = deferred();
      let first = true;
      await page.route("**/theatre/garden.webp", async (route) => {
        if (first) {
          first = false;
          held.resolve(route);
        } else await route.continue();
      });
      await page.route("**/eden-01.webp", (route) => route.abort());
      await page.locator('[data-book="eden"]').click();
      const route = await Promise.race([
        held.promise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(Error("Initial garden request was not intercepted")),
            10000,
          ),
        ),
      ]);
      // Different image URL avoids browser coalescing of the held garden.
      for (let i = 0; i < 5; i++) await page.locator("#next").click();
      await ready(page);
      await page.waitForFunction(() => window.libraryDebug().playing);
      const before = await debug(page);
      assert.equal(before.state.page, 5);
      await route.abort();
      await page.waitForTimeout(650);
      const after = await debug(page);
      assert.equal(after.state.page, 5);
      assert.equal(after.playing, true);
      assert.ok(
        after.position > before.position + 0.3,
        `Current clock stopped/replaced: ${before.position} → ${after.position}`,
      );
      assert.equal(await page.locator("#notice").innerText(), "");
      return {
        beforePosition: before.position,
        afterPosition: after.position,
        currentPage: after.state.page,
      };
    },
  );
  await check(
    "Pending figurine name cannot start after tab is hidden",
    async (page, context) => {
      await enter(page);
      const held = deferred();
      await page.route("**/*.wav", (route) => held.resolve(route));
      await page.locator('[data-character="adam"]').click();
      const route = await Promise.race([
        held.promise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(Error("Name audio was not intercepted")),
            10000,
          ),
        ),
      ]);
      // Headless Chrome keeps both tabs visible on this host. Exercise the real
      // visibility handler with a deterministic hidden-state transition instead.
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          get: () => true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await route.continue();
      await page.waitForTimeout(750);
      assert.equal((await debug(page)).playing, false);
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForTimeout(250);
      assert.equal((await debug(page)).playing, false);
      return "Released pending name after simulated visibilitychange; actual application handler prevented playback and stayed paused after restoring visibility.";
    },
  );
  await check(
    "Failed stale family request cannot append to current stage",
    async (page) => {
      await enter(page);
      await page.locator('[data-book="noah"]').click();
      await ready(page);
      for (let i = 0; i < 6; i++) {
        await page.locator("#next").click();
        await ready(page);
      }
      assert.equal((await debug(page)).state.page, 6);
      const held = deferred();
      await page.route("**/theatre/family-seven.webp", (route) =>
        held.resolve(route),
      );
      await page.locator("#next").click();
      const route = await Promise.race([
        held.promise,
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(Error("Final-spread family request was not intercepted")),
            10000,
          ),
        ),
      ]);
      await page.locator("#previous").click();
      await ready(page);
      const before = await debug(page);
      await route.abort();
      await page.waitForTimeout(500);
      const after = await debug(page);
      assert.equal(after.state.page, 6);
      assert.equal(after.scene.popups.length, before.scene.popups.length);
      assert.equal(after.scene.actorCount, before.scene.actorCount);
      assert.equal(after.playing, true);
      return {
        currentPage: after.state.page,
        popupCountBefore: before.scene.popups.length,
        popupCountAfter: after.scene.popups.length,
      };
    },
  );
  await check(
    "Repeated startup Enter creates one AudioContext",
    async (page) => {
      await page.addInitScript(() => {
        const Original = window.AudioContext;
        window.__audioContextCount = 0;
        window.AudioContext = class extends Original {
          constructor(...args) {
            super(...args);
            window.__audioContextCount++;
          }
          resume() {
            const unlocked = super.resume();
            return Promise.all([
              unlocked,
              new Promise((resolve) => setTimeout(resolve, 250)),
            ]).then(() => undefined);
          }
        };
      });
      await page.goto(url);
      await page.locator("#enter").click();
      await page.evaluate(() => {
        document.querySelector("#enter").click();
        document.querySelector("#enter").click();
      });
      await ready(page);
      await page.locator('[data-book="eden"]').waitFor({ state: "visible" });
      const contexts = await page.evaluate(() => window.__audioContextCount);
      assert.equal(contexts, 1);
      return { enterInvocations: 3, contexts };
    },
  );
} finally {
  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(
    "docs/race-results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
if (results.checks.some((check) => !check.passed)) process.exitCode = 1;
