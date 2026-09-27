/** Acceptance for the throwaway carousel prototype; main's room selectors differ. */
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
const root = path.resolve("dist"),
  prefix = "/prototype/little-light-library/";
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (!pathname.startsWith(prefix)) return res.writeHead(404).end();
  const file = path.resolve(
    root,
    pathname.slice(prefix.length) || "index.html",
  );
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] || "application/octet-stream",
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch(
  process.env.CI ? {} : { channel: "chrome" },
);
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "deviceMemory", { value: 2 });
    Object.defineProperty(navigator, "hardwareConcurrency", { value: 2 });
    window.tiltRequests = 0;
    DeviceOrientationEvent.requestPermission = async () => {
      window.tiltRequests++;
      return "granted";
    };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`);
  await page.locator("#enter").click();
  await page.locator(".carousel-book.selected").click();
  const ready = () =>
    page.waitForFunction(() => {
      const d = window.libraryDebug();
      return (
        d.ready && !d.pagePending && !d.session.busy && d.scene.stageVisible
      );
    });
  await ready();
  await page.locator("#play").click();
  await page.waitForTimeout(700);
  const cdp = await page.context().newCDPSession(page);
  const drag = async (x1, y1, x2, y2) => {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: x1, y: y1 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x2, y: y2 }],
    });
    await page.waitForTimeout(200);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.waitForTimeout(600);
  };
  const initial = await page.evaluate(() => window.libraryDebug());
  await drag(280, 300, 80, 330);
  const panned = await page.evaluate(() => window.libraryDebug());
  assert.ok(panned.scene.prototype.pan[0] > initial.scene.look[0] + 0.5);
  assert.equal(panned.position, initial.position);
  assert.equal(await page.evaluate(() => scrollY), 0);
  assert.deepEqual(panned.scene.prototype.tilt, [0, 0]);
  for (let i = 0; i < 3; i++) await drag(320, 300, 40, 300);
  let d = await page.evaluate(() => window.libraryDebug());
  assert.ok(
    Math.abs(d.scene.prototype.pan[0] - d.scene.prototype.panLimits.right) <
      0.001,
  );
  for (let i = 0; i < 6; i++) await drag(40, 300, 320, 300);
  d = await page.evaluate(() => window.libraryDebug());
  assert.ok(
    Math.abs(d.scene.prototype.pan[0] - d.scene.prototype.panLimits.left) <
      0.001,
  );
  await page.locator("#settings").click();
  await page.locator("#phone-tilt").click();
  assert.equal(await page.evaluate(() => window.tiltRequests), 1);
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 60, gamma: 0 }),
    ),
  );
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 68, gamma: 12 }),
    ),
  );
  await page.locator("#settings-close").click();
  await page.waitForTimeout(700);
  const tilted = await page.evaluate(() => window.libraryDebug());
  assert.ok(tilted.scene.prototype.tilt[0] > 0.4);
  assert.deepEqual(tilted.scene.prototype.pan, d.scene.prototype.pan);
  assert.ok(Math.abs(tilted.scene.camera[0] - d.scene.camera[0]) > 0.15);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(400);
  const fixed = await page.evaluate(() => window.libraryDebug().scene.camera);
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 50, gamma: -12 }),
    ),
  );
  await page.waitForTimeout(400);
  assert.deepEqual(
    await page.evaluate(() => window.libraryDebug().scene.camera),
    fixed,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("#next").click();
  await ready();
  assert.equal(
    (await page.evaluate(() => window.libraryDebug())).scene.prototype.pan,
    null,
  );
  await page.locator("#next").click();
  await ready();
  await page.waitForTimeout(1800);
  d = await page.evaluate(() => window.libraryDebug());
  assert.equal(
    d.scene.creatures.find((c) => c.kind === "serpent").deformation,
    0,
  );
  fs.mkdirSync(".test-output/portrait-prototype", { recursive: true });
  await page.screenshot({
    path: ".test-output/portrait-prototype/serpent.png",
  });
  for (const [id, count] of [
    ["eden", 8],
    ["noah", 8],
    ["jonah-and-the-whale", 13],
  ]) {
    if (id !== "eden") {
      await page.locator("#shelf").click();
      await page.waitForFunction(
        () =>
          document.querySelector(".carousel-book.selected")?.disabled === false,
      );
      const card = page.locator(
        `.carousel-book[data-shelf-key="${id === "noah" ? "builtin:" : "book:"}${id}"]`,
      );
      if (!(await card.evaluate((e) => e.classList.contains("selected"))))
        await card.click();
      await card.click();
      await ready();
    }
    const current = (await page.evaluate(() => window.libraryDebug())).state
      .page;
    for (let i = current + 1; i < count; i++) {
      await page.locator("#next").click();
      await ready();
      assert.equal(
        (await page.evaluate(() => window.libraryDebug())).state.page,
        i,
      );
    }
    await page.screenshot({
      path: `.test-output/portrait-prototype/${id}.png`,
    });
  }
  // Desktop is a separate fine-pointer context: dragging changes tilt, never pan.
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await desktop.goto(`http://127.0.0.1:${server.address().port}${prefix}`);
  await desktop.locator("#enter").click();
  await desktop.locator(".carousel-book.selected").click();
  await desktop.waitForFunction(
    () => window.libraryDebug().ready && !window.libraryDebug().pagePending,
  );
  await desktop.mouse.move(200, 250);
  await desktop.mouse.down();
  await desktop.mouse.move(450, 350, { steps: 8 });
  await desktop.mouse.up();
  assert.equal(
    (await desktop.evaluate(() => window.libraryDebug())).scene.prototype.pan,
    null,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Prototype accepted: 29 pages, mobile pan boundaries, independent permission-gated tilt, reduced motion, page reset, rigid serpent and desktop without pan.",
  );
} finally {
  await browser.close();
  server.close();
}
