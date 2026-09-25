import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

// Temporary CI comparison of headless WebGL backends. This is an unthrottled
// browser diagnostic, not a Samsung A50 GPU or mobile acceptance benchmark.
const dist = path.resolve("dist");
const output = path.resolve(".test-output/renderer-diagnostic");
const prefix = "/acceptance/little-light-library/";
const variants = [
  { name: "default", launch: {} },
  { name: "new-headless", launch: { channel: "chromium" } },
  {
    name: "swangle",
    launch: {
      args: [
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  {
    name: "new-headless-enable-gpu",
    launch: { channel: "chromium", args: ["--enable-gpu"] },
  },
];
const mime = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const quantile = (sorted, part) =>
  sorted.length ? sorted[Math.ceil(sorted.length * part) - 1] : null;
const summarize = (values) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  return {
    count: sorted.length,
    p50Ms: quantile(sorted, 0.5),
    p95Ms: quantile(sorted, 0.95),
    maxMs: sorted.at(-1) ?? null,
  };
};

await fs.mkdir(output, { recursive: true });
await fs.access(path.join(dist, "index.html"));
const server = http.createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (!pathname.startsWith(prefix)) return response.writeHead(404).end();
    const file = path.resolve(
      dist,
      decodeURIComponent(pathname.slice(prefix.length)) || "index.html",
    );
    if (!file.startsWith(dist + path.sep)) return response.writeHead(403).end();
    const bytes = await fs.readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Content-Length": bytes.length,
      "Cache-Control": "public, max-age=600",
    });
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}${prefix}`;
const report = {
  generatedAt: new Date().toISOString(),
  host: { platform: os.platform(), arch: os.arch() },
  profile: {
    viewport: { width: 360, height: 660 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    deviceMemoryGB: 2,
    hardwareConcurrency: 2,
    cpuSlowdown: 1,
    network: "unthrottled",
  },
  method:
    "Same built local site and fixed shelf-to-Eden page. One browser at a time; 100 scene frames sampled after art appears. Headless software timing is not a physical phone GPU measurement.",
  variants: [],
};
const save = () =>
  fs.writeFile(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );

async function measure(variant) {
  const result = {
    name: variant.name,
    launch: variant.launch,
    startedAt: new Date().toISOString(),
    screenshot: `${variant.name}.png`,
    errors: [],
  };
  let browser;
  let timeout;
  const started = performance.now();
  try {
    browser = await chromium.launch({
      ...variant.launch,
      headless: true,
      timeout: 15_000,
    });
    timeout = setTimeout(
      () => {
        result.errors.push("Variant exceeded 90 seconds");
        void browser.close().catch(() => {});
      },
      Math.max(1, 90_000 - (performance.now() - started)),
    );
    result.browser = browser.version();
    const cdp = await browser.newBrowserCDPSession();
    try {
      const info = await cdp.send("SystemInfo.getInfo");
      result.gpu = {
        devices: info.gpu.devices,
        featureStatus: info.gpu.featureStatus,
        auxAttributes: info.gpu.auxAttributes,
      };
    } catch (error) {
      result.errors.push(`GPU info: ${error.message}`);
    } finally {
      await cdp.detach();
    }
    const context = await browser.newContext({
      viewport: report.profile.viewport,
      deviceScaleFactor: report.profile.deviceScaleFactor,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "no-preference",
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(25_000);
    page.on("pageerror", (error) => result.errors.push(error.message));
    const journey = performance.now();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator("#enter").tap();
    await page.waitForFunction(
      () =>
        window.libraryDebug?.().shelf.books.length === 3 &&
        !window.libraryDebug().shelf.busy,
    );
    result.shelfMs = Math.round(performance.now() - journey);
    await page.locator('[data-shelf-key="builtin:eden"]').tap();
    await page.waitForFunction(
      () =>
        window.libraryDebug?.().shelf.inspected === "builtin:eden" &&
        !window.libraryDebug().shelf.busy,
    );
    const reading = performance.now();
    await page.locator("#shelf-read").tap();
    await page.waitForFunction(() => {
      const scene = window.libraryDebug?.().scene;
      return (
        scene?.loadedPage?.story === "eden" &&
        scene.loadedPage.index === 0 &&
        scene.stageVisible
      );
    });
    result.edenArtMs = Math.round(performance.now() - reading);
    result.shelfToEdenMs = Math.round(performance.now() - journey);
    result.renderer = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const gl = canvas?.getContext("webgl2") || canvas?.getContext("webgl");
      const info = gl?.getExtension("WEBGL_debug_renderer_info");
      return {
        webglVersion: gl?.getParameter(gl.VERSION) ?? null,
        vendor:
          gl?.getParameter(info?.UNMASKED_VENDOR_WEBGL ?? gl.VENDOR) ?? null,
        renderer:
          gl?.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER) ??
          null,
        scene: window.libraryDebug?.().scene,
      };
    });
    await page.screenshot({
      path: path.join(output, result.screenshot),
      fullPage: true,
    });
    const frameBudgetMs = Math.max(
      1_000,
      Math.min(75_000, 87_000 - (performance.now() - started)),
    );
    const sample = await page.evaluate(
      (maxMs) =>
        new Promise((resolve) => {
          const intervals = [];
          const cpu = [];
          let lastFrame = window.libraryDebug?.().scene.renderedFrames ?? 0;
          let done = false;
          const finish = (complete) => {
            if (done) return;
            done = true;
            clearTimeout(limit);
            resolve({ intervals, cpu, complete });
          };
          const limit = setTimeout(() => finish(false), maxMs);
          const sampleFrame = () => {
            if (done) return;
            const scene = window.libraryDebug?.().scene;
            if (scene && scene.renderedFrames !== lastFrame) {
              lastFrame = scene.renderedFrames;
              intervals.push(scene.renderFrameIntervalMs);
              cpu.push(scene.renderCpuMs);
            }
            if (intervals.length >= 100) finish(true);
            else requestAnimationFrame(sampleFrame);
          };
          requestAnimationFrame(sampleFrame);
        }),
      frameBudgetMs,
    );
    result.frames = {
      complete: sample.complete,
      interval: summarize(sample.intervals),
      cpu: summarize(sample.cpu),
    };
    await context.close();
  } catch (error) {
    result.errors.push(error.message);
  } finally {
    clearTimeout(timeout);
    await browser?.close().catch(() => {});
    result.durationMs = Math.round(performance.now() - started);
    result.completedAt = new Date().toISOString();
    report.variants.push(result);
    await save();
    console.log(
      JSON.stringify({
        name: result.name,
        durationMs: result.durationMs,
        renderer: result.renderer?.renderer,
        frameP95Ms: result.frames?.interval.p95Ms,
        frameCount: result.frames?.interval.count,
        shelfToEdenMs: result.shelfToEdenMs,
        errors: result.errors,
      }),
    );
  }
}

try {
  for (const variant of variants) await measure(variant);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
if (report.variants.some((variant) => variant.errors.length))
  process.exitCode = 1;
