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
    const bytes = fs.readFileSync(file);
    res.setHeader("Content-Length", bytes.length);
    res.setHeader(
      "Cache-Control",
      /\.(html|json)$/.test(file) ? "no-cache" : "public, max-age=600",
    );
    res.end(bytes);
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
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const errors = [];
  const requestedArt = new Set();
  page.on("request", (request) => {
    if (/\.(reader|mobile)\.webp$/.test(request.url()))
      requestedArt.add(request.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
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
  assert.equal(await page.locator(".carousel-intro").count(), 0);
  assert.equal(
    await page.locator(".carousel-book:not(.selected):disabled").count(),
    2,
  );
  const selectedKey = await page
    .locator(".carousel-book.selected")
    .getAttribute("data-shelf-key");
  const trackBounds = await page.locator(".carousel-track").boundingBox();
  await page.touchscreen.tap(380, trackBounds.y + trackBounds.height / 2);
  assert.equal(
    await page
      .locator(".carousel-book.selected")
      .getAttribute("data-shelf-key"),
    selectedKey,
  );
  const restingCover = await page
    .locator(".carousel-book.selected")
    .boundingBox();
  await page.mouse.move(
    restingCover.x + restingCover.width / 2,
    restingCover.y + restingCover.height / 2,
  );
  await page.waitForTimeout(750);
  const hoveredCover = await page
    .locator(".carousel-book.selected")
    .boundingBox();
  assert.ok(
    Math.abs(restingCover.x - hoveredCover.x) < 1 &&
      Math.abs(restingCover.y - hoveredCover.y) < 1,
    "Hover must preserve the 3D cover transform",
  );
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", {
    rate: process.env.CI ? 1 : 4,
  });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: process.env.CI ? 0 : 150,
    downloadThroughput: process.env.CI ? -1 : 200000,
    uploadThroughput: process.env.CI ? -1 : 100000,
  });
  const qualityStarted = Date.now();
  await page.locator(".carousel-book.selected").click();
  const ready = async () => {
    try {
      await page.waitForFunction(() => {
        const d = window.libraryDebug();
        return (
          d.ready && !d.pagePending && !d.session.busy && d.scene.stageVisible
        );
      });
    } catch (error) {
      console.error(
        "Reader readiness failure",
        JSON.stringify(await page.evaluate(() => window.libraryDebug())),
        errors,
      );
      throw error;
    }
  };
  await ready();
  const qualityReadyMs = Date.now() - qualityStarted;
  if (!process.env.CI)
    assert.ok(
      qualityReadyMs <= 4000,
      `Detailed first page took ${qualityReadyMs}ms (budget 4000ms)`,
    );
  const renderP95Ms = process.env.CI
    ? null
    : await page.evaluate(
        () =>
          new Promise((resolve) => {
            const samples = [];
            let count = -1,
              callbacks = 0;
            function frame() {
              const scene = window.libraryDebug().scene;
              if (
                scene.renderedFrames !== count &&
                scene.renderFrameIntervalMs > 0
              ) {
                samples.push(scene.renderFrameIntervalMs);
                count = scene.renderedFrames;
              }
              if (++callbacks < 120) requestAnimationFrame(frame);
              else {
                const values = samples.slice(3).sort((a, b) => a - b);
                resolve(values[Math.floor(values.length * 0.95)]);
              }
            }
            requestAnimationFrame(frame);
          }),
      );
  if (!process.env.CI)
    assert.ok(
      renderP95Ms <= 50,
      `Detailed reader p95 ${renderP95Ms}ms exceeds 50ms`,
    );
  fs.mkdirSync(".test-output/portrait-prototype", { recursive: true });
  fs.writeFileSync(
    ".test-output/portrait-prototype/quality-performance.json",
    JSON.stringify(
      {
        qualityReadyMs,
        renderP95Ms,
        cpuSlowdown: process.env.CI ? 1 : 4,
        deviceScaleFactor: 3,
        constrainedPixelRatio: 1.5,
        hostedSoftwareRenderer: !!process.env.CI,
      },
      null,
      2,
    ),
  );
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  assert.equal(
    (await page.evaluate(() => window.libraryDebug())).scene.prototype
      .pixelRatio,
    1.5,
  );
  assert.ok(
    [...requestedArt].some((url) => url.endsWith("garden.reader.webp")),
    "Active story loads detailed reader artwork",
  );
  assert.ok(
    [...requestedArt].some((url) => url.endsWith("eden-01.mobile.webp")),
    "Carousel keeps lightweight previews",
  );
  fs.mkdirSync(".test-output/portrait-prototype", { recursive: true });
  await page.screenshot({
    path: ".test-output/portrait-prototype/reader-quality.png",
  });
  await page.locator("#play").click();
  await page.waitForTimeout(700);
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
      while (!(await card.evaluate((e) => e.classList.contains("selected"))))
        await page
          .getByRole("button", { name: "Next book", exact: true })
          .click();
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
  await page.locator("#settings").click();
  await page.locator("#phone-tilt").click();
  await page.locator("#settings-close").click();
  if ((await page.evaluate(() => window.libraryDebug())).playing)
    await page.locator("#play").click();
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(1400);
  const landscape = await page.evaluate(() => window.libraryDebug().scene);
  const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
  assert.ok(
    distance(landscape.camera, landscape.look) /
      distance(landscape.cameraGoal, landscape.lookGoal) <
      0.62,
    "Touch landscape must retain the close mobile camera",
  );
  await page.screenshot({
    path: ".test-output/portrait-prototype/mobile-landscape.png",
  });
  await drag(300, 190, 90, 200);
  assert.ok(
    (await page.evaluate(() => window.libraryDebug())).scene.prototype.pan,
    "Landscape touch drag must pan the book",
  );
  await page.locator("#shelf").click();
  await page.waitForTimeout(800);
  const fits = await page.locator(".carousel-book.selected").evaluate((e) => {
    const r = e.getBoundingClientRect();
    return (
      r.top >= 0 && r.bottom <= innerHeight && e.scrollHeight <= e.clientHeight
    );
  });
  assert.ok(fits, "Landscape cover and title must fit the viewport");
  await page.screenshot({
    path: ".test-output/portrait-prototype/landscape-carousel.png",
  });
  for (const viewport of [
    { width: 667, height: 320 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(700);
    const rect = await page.locator(".carousel-book.selected").boundingBox();
    assert.ok(rect.y >= 0 && rect.y + rect.height <= viewport.height);
    await page.screenshot({
      path: `.test-output/portrait-prototype/carousel-${viewport.width}.png`,
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
