import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium, devices } from "playwright";

// Run after `npm run build`; MOBILE_PROFILE_DIST can point to an earlier build.
const root = path.resolve(process.env.MOBILE_PROFILE_DIST || "dist");
const prefix = "/acceptance/little-light-library/";
const mime = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".webp": "image/webp",
  ".png": "image/png",
};
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (!pathname.startsWith(prefix)) return response.writeHead(404).end();
  const file = path.resolve(
    root,
    pathname.slice(prefix.length) || "index.html",
  );
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Content-Length": bytes.length,
      "Cache-Control": "no-store",
    });
    response.end(bytes);
  });
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ ...devices["Pixel 5"] });
await context.addInitScript(() => {
  Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
  Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: 200_000,
  uploadThroughput: 100_000,
});
const audio = [];
page.on("response", (response) => {
  if (/\.(wav|mp3|ogg)$/.test(new URL(response.url()).pathname))
    audio.push({
      url: new URL(response.url()).pathname.slice(prefix.length),
      bytes: Number(response.headers()["content-length"] || 0),
      status: response.status(),
    });
});
try {
  const started = performance.now();
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.libraryDebug?.().ready, null, {
    timeout: 60_000,
  });
  const shelfMs = Math.round(performance.now() - started);
  await page.locator('[data-shelf-key="book:jonah-and-the-whale"]').click();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().shelf.inspected === "book:jonah-and-the-whale",
  );
  const readingStarted = performance.now();
  await page.locator("#shelf-read").click();
  await page.locator(".reader h1").waitFor({ timeout: 30_000 });
  const textMs = Math.round(performance.now() - readingStarted);
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().scene.loadedPage?.story === "jonah-and-the-whale",
    null,
    { timeout: 120_000 },
  );
  const artMs = Math.round(performance.now() - readingStarted);
  await page.waitForFunction(
    () => {
      const state = window.libraryDebug?.();
      return (
        state?.shelf.table === "book:jonah-and-the-whale" &&
        !state.shelf.browsing &&
        state.ready &&
        !state.pagePending
      );
    },
    null,
    {
      timeout: 120_000,
    },
  );
  const firstPageMs = Math.round(performance.now() - readingStarted);
  assert.match(await page.locator(".reader h1").textContent(), /Jonah|God/i);
  const firstPageAudio = audio.filter((entry) => entry.status === 200);
  console.log(JSON.stringify({ shelfMs, textMs, artMs, firstPageMs }));
  if (await page.evaluate(() => window.libraryDebug().playing)) {
    await page.locator("#play").click();
    await page.waitForFunction(() => !window.libraryDebug?.().playing);
  }
  await page.locator("#play").click();
  await page.waitForFunction(() => window.libraryDebug?.().playing, null, {
    timeout: 20_000,
  });
  await page.locator("#play").click();
  const result = {
    device: "Pixel 5 emulation",
    profile: "4x CPU slowdown, 150 ms latency, 1.6 Mbps download",
    reportedDeviceMemoryGB: 2,
    reportedCPUCount: 2,
    shelfMs,
    textMs,
    artMs,
    firstPageMs,
    firstPageAudioCount: firstPageAudio.length,
    firstPageAudioBytes: firstPageAudio.reduce(
      (sum, entry) => sum + entry.bytes,
      0,
    ),
    firstPageAudio: firstPageAudio.map((entry) => entry.url),
    canvas: await page
      .locator("#scene canvas")
      .evaluate((canvas) => ({ width: canvas.width, height: canvas.height })),
    scene: await page.evaluate(() => ({
      drawCalls: window.libraryDebug().scene.drawCalls,
      triangles: window.libraryDebug().scene.triangles,
    })),
  };
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
