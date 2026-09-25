import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";
import { tsImport } from "tsx/esm/api";

const { translationIssues } = await tsImport(
  "../src/book-localization.ts",
  import.meta.url,
);

// These are product budgets, not calibrated measurements of a Samsung GPU.
// All navigation uses the same touch controls as a reader; debug data observes
// completion and never advances the story or bypasses loading/animation.
const { profile, limits } = JSON.parse(
  fs.readFileSync("review/mobile-budgets.json", "utf8"),
);
const root = path.resolve(process.env.READER_DIST || "dist");
const output = path.resolve(
  process.env.MOBILE_CHECK_OUTPUT || ".test-output/mobile-acceptance",
);
fs.mkdirSync(output, { recursive: true });
const prefix = "/acceptance/little-light-library/";
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "books/catalog.json"), "utf8"),
);
assert.deepEqual(
  catalog.map(({ id }) => id),
  ["eden", "noah", "jonah-and-the-whale"],
);
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
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".woff2": "font/woff2",
};
const files = new Map();
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (!pathname.startsWith(prefix)) return response.writeHead(404).end();
  const file = path.resolve(
    root,
    decodeURIComponent(pathname.slice(prefix.length)) || "index.html",
  );
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  try {
    if (!files.has(file)) {
      const bytes = fs.readFileSync(file);
      const compressed = /\.(html|js|css|json)$/.test(file);
      files.set(file, {
        bytes: compressed ? gzipSync(bytes) : bytes,
        compressed,
      });
    }
    const { bytes, compressed } = files.get(file);
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Content-Length": bytes.length,
      ...(compressed ? { "Content-Encoding": "gzip" } : {}),
      "Cache-Control": /\.(html|json)$/.test(file)
        ? "no-cache"
        : "public, max-age=600",
    });
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({
  ...(process.env.READER_BROWSER_CHANNEL
    ? { channel: process.env.READER_BROWSER_CHANNEL }
    : process.env.CI
      ? {}
      : { channel: "chrome" }),
  headless: true,
});
const browserSession = await browser.newBrowserCDPSession();
const { gpu } = await browserSession.send("SystemInfo.getInfo");
await browserSession.detach();
const report = {
  generatedAt: new Date().toISOString(),
  browser: browser.version(),
  renderer: gpu,
  profile,
  limits,
  method:
    "Fresh touch browser contexts, real catalog, nested production path, compressed HTTP and normal browser caching. CPU/network emulation does not simulate the A50 GPU, thermals or actual process RAM.",
  scenarios: [],
  failures: [],
};
const budget = (scenario, name, value, limit, minimum = false) => {
  scenario.measurements.push({ name, value, limit, minimum });
  if (minimum ? value < limit : value > limit)
    report.failures.push(
      `${scenario.book}: ${name} ${value} ${minimum ? "below" : "exceeds"} ${limit}`,
    );
};
const content = new Map(
  locales.map((id) => [
    id,
    JSON.parse(fs.readFileSync(path.join(root, `content/${id}.json`), "utf8")),
  ]),
);
const authored = JSON.parse(
  fs.readFileSync(
    path.join(root, "books/jonah-and-the-whale.book.json"),
    "utf8",
  ),
);
assert.deepEqual(
  new Set(authored.languages),
  new Set(locales),
  "Jonah must publish every supported reader locale",
);
for (const locale of locales) {
  assert.deepEqual(
    translationIssues(authored, locale),
    [],
    `Jonah ${locale} translation must match the source structure and fingerprint`,
  );
}
const titleFor = (book, locale, index) =>
  book === authored.id
    ? locale === authored.locale
      ? authored.spreads[index].title
      : authored.translations[locale].spreads.find(
          ({ id }) => id === authored.spreads[index].id,
        ).title
    : content.get(locale).stories.find(({ id }) => id === book).pages[index]
        .title;
const countFor = (book) =>
  book === authored.id
    ? authored.spreads.length
    : content.get("en-US").stories.find(({ id }) => id === book).pages.length;

async function ready(page, book, index) {
  await page.waitForFunction(
    ({ book, index }) => {
      const d = window.libraryDebug?.();
      return (
        d?.scene.loadedPage?.story === book &&
        d.scene.loadedPage.index === index &&
        d.ready &&
        !d.pagePending &&
        !d.shelf.busy
      );
    },
    { book, index },
    { timeout: 45000 },
  );
}
async function tapClock(page, locator) {
  // Playwright waits for a button's CSS animation to settle before tapping.
  // Measure the reader's response from the actual pointer event, excluding
  // automation-only actionability waiting that a person's finger does not do.
  await page.evaluate(() => {
    window.mobileInputAt = undefined;
    document.addEventListener(
      "pointerdown",
      () => {
        window.mobileInputAt = performance.now();
      },
      { once: true, capture: true },
    );
  });
  await locator.tap();
  const sinceInput = await page.evaluate(
    () => performance.now() - window.mobileInputAt,
  );
  assert.ok(Number.isFinite(sinceInput), "Touch produced a pointer event");
  return performance.now() - sinceInput;
}
async function tapUntil(page, locator, predicate, arg) {
  const start = await tapClock(page, locator);
  await page.waitForFunction(predicate, arg);
  return Math.round(performance.now() - start);
}
async function inspectLayout(page, scenario, name) {
  // ResizeObserver updates the drawing buffer on the next render opportunity.
  // Wait for that real resize rather than measuring the old portrait buffer.
  await page
    .waitForFunction(
      (minimum) => {
        const canvas = document.querySelector("#scene canvas");
        const bounds = canvas?.getBoundingClientRect();
        return (
          bounds &&
          canvas.width / bounds.width >= minimum - 0.01 &&
          canvas.height / bounds.height >= minimum - 0.01
        );
      },
      limits.minimumPixelRatio,
      { timeout: 5000 },
    )
    .catch(() => {});
  const layout = await page.evaluate(() => {
    const canvas = document.querySelector("#scene canvas");
    const bounds = canvas.getBoundingClientRect();
    const appStyle = getComputedStyle(document.querySelector("#app"));
    const sceneStyle = getComputedStyle(document.querySelector("#scene"));
    return {
      width: innerWidth,
      height: innerHeight,
      canvas: {
        top: bounds.top,
        bottom: bounds.bottom,
        left: bounds.left,
        right: bounds.right,
      },
      mask: sceneStyle.maskImage,
      webkitMask: sceneStyle.webkitMaskImage,
      scrollWidth: document.documentElement.scrollWidth,
      pixelRatio: canvas.width / bounds.width,
      background: appStyle.backgroundImage,
      buttons: [...document.querySelectorAll(".reader-controls button")].map(
        (b) => {
          const r = b.getBoundingClientRect();
          return { width: r.width, height: r.height };
        },
      ),
    };
  });
  assert.ok(
    layout.scrollWidth <= layout.width + 1,
    `${name}: no horizontal overflow`,
  );
  assert.ok(
    layout.canvas.top <= 1 &&
      layout.canvas.bottom >= layout.height - 1 &&
      layout.canvas.left <= 1 &&
      layout.canvas.right >= layout.width - 1,
    `${name}: actual scene covers the viewport behind the reader`,
  );
  assert.ok(
    [layout.mask, layout.webkitMask].every((mask) => !mask || mask === "none"),
    `${name}: scene has no fade mask replacing the continuous room`,
  );
  assert.ok(
    !layout.background.includes("url("),
    `${name}: reading area reveals the actual room, without an unrelated image`,
  );
  assert.ok(
    layout.buttons.every((b) => b.width >= 44 && b.height >= 44),
    `${name}: transport touch targets are at least 44 CSS pixels`,
  );
  budget(
    scenario,
    `${name}.pixelRatio`,
    layout.pixelRatio,
    limits.minimumPixelRatio,
    true,
  );
  await page.screenshot({
    path: path.join(output, `${scenario.book}-${name}.png`),
    fullPage: false,
  });
}

try {
  for (const entry of catalog) {
    const scenario = {
      book: entry.id,
      measurements: [],
      pages: [],
      locales: [],
      errors: [],
    };
    report.scenarios.push(scenario);
    console.log(`Mobile journey: ${entry.id}`);
    const context = await browser.newContext({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "no-preference",
    });
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
    await context.addInitScript(
      ({ memory, cores }) => {
        Object.defineProperty(navigator, "deviceMemory", { get: () => memory });
        Object.defineProperty(navigator, "hardwareConcurrency", {
          get: () => cores,
        });
        window.mobileAudioProbe = [];
        const start = AudioBufferSourceNode.prototype.start;
        AudioBufferSourceNode.prototype.start = function (...args) {
          if (this.buffer) {
            const samples = this.buffer.getChannelData(0);
            let peak = 0;
            for (let i = 0; i < samples.length; i += 97)
              peak = Math.max(peak, Math.abs(samples[i]));
            window.mobileAudioProbe.push({
              duration: this.buffer.duration,
              state: this.context.state,
              peak,
              loop: this.loop,
            });
          }
          return start.apply(this, args);
        };
      },
      { memory: profile.deviceMemoryGB, cores: profile.hardwareConcurrency },
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => scenario.errors.push(error.message));
    page.on("request", (request) => {
      const requested = new URL(request.url());
      if (
        ["http:", "https:"].includes(requested.protocol) &&
        requested.origin !== new URL(url).origin
      )
        scenario.errors.push(
          `External runtime request: ${requested.origin}${requested.pathname}`,
        );
    });
    page.on("response", (response) => {
      if (response.status() >= 400)
        scenario.errors.push(
          `HTTP ${response.status()} ${new URL(response.url()).pathname}`,
        );
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Emulation.setCPUThrottlingRate", {
      rate: profile.cpuSlowdown,
    });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latencyMs,
      downloadThroughput: profile.downloadBytesPerSecond,
      uploadThroughput: profile.uploadBytesPerSecond,
    });
    let transferred = 0;
    cdp.on("Network.loadingFinished", ({ encodedDataLength }) => {
      transferred += encodedDataLength;
    });
    try {
      const bootAt = performance.now();
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.locator("#enter").tap();
      await page.waitForFunction(
        () =>
          window.libraryDebug?.().shelf.books.length === 3 &&
          !window.libraryDebug().shelf.busy &&
          !document.querySelector("#loading")?.checkVisibility(),
      );
      budget(
        scenario,
        "coldShelfMs",
        Math.round(performance.now() - bootAt),
        limits.coldShelfMs,
      );
      const key = entry.legacyStory
        ? `builtin:${entry.id}`
        : `book:${entry.id}`;
      budget(
        scenario,
        "inspectionMs",
        await tapUntil(
          page,
          page.locator(`[data-shelf-key="${key}"]`),
          (key) =>
            window.libraryDebug?.().shelf.inspected === key &&
            !window.libraryDebug().shelf.busy,
          key,
        ),
        limits.inspectionMs,
      );
      const beforeBytes = transferred;
      const readAt = await tapClock(page, page.locator("#shelf-read"));
      await page.waitForFunction(
        () =>
          document.querySelector(".reader") ||
          /Moving|Returning/.test(
            document.querySelector(".shelf-preview [role=status]")
              ?.textContent || "",
          ),
      );
      budget(
        scenario,
        "readFeedbackMs",
        Math.round(performance.now() - readAt),
        limits.feedbackMs,
      );
      await page.waitForFunction(
        (book) =>
          window.libraryDebug?.().scene.loadedPage?.story === book &&
          window.libraryDebug().scene.loadedPage.index === 0 &&
          window.libraryDebug().scene.stageVisible,
        entry.id,
        { timeout: 45000 },
      );
      budget(
        scenario,
        "firstArtMs",
        Math.round(performance.now() - readAt),
        limits.pageArtMs,
      );
      await ready(page, entry.id, 0);
      budget(
        scenario,
        "firstReadyMs",
        Math.round(performance.now() - readAt),
        limits.pageReadyMs,
      );
      budget(
        scenario,
        "firstTransferBytes",
        transferred - beforeBytes,
        limits.pageTransferBytes,
      );
      assert.equal(
        await page.locator(".reader h1").textContent(),
        titleFor(entry.id, "en-US", 0),
      );
      await inspectLayout(page, scenario, "portrait-first");
      const initialGpu = await page.evaluate(() => {
        const scene = window.libraryDebug().scene;
        return { textures: scene.gpuTextures, geometries: scene.gpuGeometries };
      });

      if (entry.id === "jonah-and-the-whale") {
        await page
          .locator(".authored-interactions [data-element]")
          .first()
          .tap();
        await page.waitForFunction(() =>
          Boolean(document.querySelector("#notice")?.textContent?.trim()),
        );
        scenario.characterFeedback = "authored response shown after touch";
      } else {
        // Paper-target buttons supply keyboard access; the canvas owns touch
        // raycasting. Tap the rendered character position through the canvas.
        const character = await page
          .locator(".paper-target")
          .first()
          .boundingBox();
        assert.ok(character, "Character has a visible projected target");
        const tapX = character.x + character.width / 2;
        const tapY = character.y + character.height / 2;
        await page.evaluate(() => {
          const canvas = document.querySelector("#scene canvas");
          const armedAt = performance.now();
          const observation = { armedAt, event: null };
          const onPointerUp = (event) => {
            if (event.target !== canvas || observation.event) return;
            const scene = window.libraryDebug().scene;
            observation.event = {
              timeStamp: event.timeStamp,
              observedAt: performance.now(),
              x: event.clientX,
              y: event.clientY,
              pointerType: event.pointerType,
              trusted: event.isTrusted,
              reacting: scene.reacting,
              touchedActor: scene.touchedActor,
            };
          };
          document.addEventListener("pointerup", onPointerUp);
          window.mobileCharacterTouch = {
            observation,
            cleanup: () =>
              document.removeEventListener("pointerup", onPointerUp),
          };
        });
        let touch;
        try {
          await page.touchscreen.tap(tapX, tapY);
          touch = await page.evaluate(
            () => window.mobileCharacterTouch.observation,
          );
        } finally {
          await page.evaluate(() => {
            window.mobileCharacterTouch?.cleanup();
            delete window.mobileCharacterTouch;
          });
        }
        assert.ok(touch.event, "Canvas received the character touch");
        assert.ok(
          touch.event.timeStamp >= touch.armedAt &&
            touch.event.observedAt >= touch.armedAt,
          "Reaction was observed for this touch",
        );
        assert.equal(touch.event.pointerType, "touch");
        assert.equal(touch.event.trusted, true);
        assert.ok(
          Math.abs(touch.event.x - tapX) <= 1 &&
            Math.abs(touch.event.y - tapY) <= 1,
          "Reaction came from the character tap coordinates",
        );
        assert.ok(
          touch.event.reacting && touch.event.touchedActor >= 0,
          "Paper character reacted during the touch event",
        );
        scenario.characterFeedback = "paper character reacted to touch";
      }

      if (!(await page.evaluate(() => window.libraryDebug().playing)))
        await page.locator("#play").tap();
      await page.waitForFunction(
        () =>
          window.libraryDebug().playing &&
          window.mobileAudioProbe.some(
            (s) =>
              !s.loop &&
              s.duration > 0.5 &&
              s.peak > 0.001 &&
              s.state === "running",
          ),
      );
      budget(
        scenario,
        "pauseMs",
        await tapUntil(
          page,
          page.locator("#play"),
          () => !window.libraryDebug().playing,
        ),
        limits.controlMs,
      );
      budget(
        scenario,
        "playMs",
        await tapUntil(
          page,
          page.locator("#play"),
          () => window.libraryDebug().playing,
        ),
        limits.controlMs,
      );
      budget(
        scenario,
        "settingsMs",
        await tapUntil(
          page,
          page.locator("#settings"),
          () => document.querySelector("#settings-dialog").open,
        ),
        limits.controlMs,
      );
      await page.locator("#audio").uncheck();
      await page.waitForFunction(() => window.libraryDebug().audio === false);
      await page.locator("#volume").press("Home");
      for (let step = 0; step < 7; step++)
        await page.locator("#volume").press("ArrowRight");
      await page.waitForFunction(() => window.libraryDebug().volume === 0.35);
      await page.locator("#audio").check();
      await page.locator("#settings-close").tap();

      for (let index = 1; index < countFor(entry.id); index++) {
        const bytes = transferred;
        const start = await tapClock(page, page.locator("#next"));
        await page.waitForFunction(
          (index) =>
            window.libraryDebug().state.page === index ||
            window.libraryDebug().pagePending,
          index,
        );
        budget(
          scenario,
          `page${index + 1}.feedbackMs`,
          Math.round(performance.now() - start),
          limits.feedbackMs,
        );
        await ready(page, entry.id, index);
        const elapsed = Math.round(performance.now() - start);
        scenario.pages.push({
          index,
          readyMs: elapsed,
          transferredBytes: transferred - bytes,
        });
        budget(
          scenario,
          `page${index + 1}.readyMs`,
          elapsed,
          limits.pageReadyMs,
        );
        budget(
          scenario,
          `page${index + 1}.transferBytes`,
          transferred - bytes,
          limits.pageTransferBytes,
        );
        assert.equal(
          await page.locator(".reader h1").textContent(),
          titleFor(entry.id, "en-US", index),
        );
        if (index === 2 || index === countFor(entry.id) - 1)
          await inspectLayout(page, scenario, `portrait-page-${index + 1}`);
      }
      assert.equal(
        await page.locator("#next").isDisabled(),
        true,
        "last page cannot go forward",
      );
      for (let index = countFor(entry.id) - 2; index >= 0; index--) {
        const start = await tapClock(page, page.locator("#previous"));
        await ready(page, entry.id, index);
        budget(
          scenario,
          `back${index + 1}.readyMs`,
          Math.round(performance.now() - start),
          limits.warmPageMs,
        );
      }
      assert.equal(
        await page.locator("#previous").isDisabled(),
        true,
        "first page cannot go backward",
      );
      for (const locale of locales.slice(1)) {
        await page.locator("#language").tap();
        const start = await tapClock(
          page,
          page.locator(`[data-locale="${locale}"]`),
        );
        await page.waitForFunction(
          (locale) =>
            window.libraryDebug().state.language === locale &&
            window.libraryDebug().ready &&
            !window.libraryDebug().pagePending,
          locale,
        );
        await page.locator("#enter").tap();
        budget(
          scenario,
          `locale.${locale}.readyMs`,
          Math.round(performance.now() - start),
          limits.languageMs,
        );
        assert.equal(
          await page.locator(".reader h1").textContent(),
          titleFor(entry.id, locale, 0),
        );
        scenario.locales.push(locale);
      }
      await page.setViewportSize({ width: 740, height: 360 });
      await inspectLayout(page, scenario, "landscape");
      await page.setViewportSize(profile.viewport);
      const cadence = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const callbacks = [],
              renders = [];
            let previous = performance.now(),
              frameCount = -1;
            function frame(now) {
              callbacks.push(now - previous);
              previous = now;
              const scene = window.libraryDebug().scene;
              if (
                scene.renderedFrames !== frameCount &&
                scene.renderFrameIntervalMs > 0
              ) {
                renders.push(scene.renderFrameIntervalMs);
                frameCount = scene.renderedFrames;
              }
              if (callbacks.length < 120) requestAnimationFrame(frame);
              else
                resolve({
                  callbacks: callbacks.slice(5),
                  renders: renders.slice(3),
                });
            }
            requestAnimationFrame(frame);
          }),
      );
      assert.ok(
        cadence.renders.length >= 20,
        "Scene continues rendering during reading",
      );
      for (const [name, values] of Object.entries(cadence)) {
        values.sort((a, b) => a - b);
        budget(
          scenario,
          `${name}.frameP95Ms`,
          Math.round(values[Math.floor(values.length * 0.95)]),
          limits.frameP95Ms,
        );
      }
      // Return/continue must retain the book and requested page after real transfer.
      await page.locator("#shelf").tap();
      await page.waitForFunction(
        () =>
          window.libraryDebug().shelf.browsing &&
          !window.libraryDebug().shelf.busy,
      );
      await page.locator("#shelf").tap();
      await ready(page, entry.id, 0);
      assert.equal(
        await page.locator(".reader h1").textContent(),
        titleFor(entry.id, locales.at(-1), 0),
      );
      const finalGpu = await page.evaluate(() => {
        const scene = window.libraryDebug().scene;
        return { textures: scene.gpuTextures, geometries: scene.gpuGeometries };
      });
      scenario.gpuResources = { initial: initialGpu, final: finalGpu };
      assert.ok(
        Number.isFinite(finalGpu.textures) &&
          Number.isFinite(finalGpu.geometries),
        "GPU resource counts are observable",
      );
      assert.ok(
        finalGpu.textures <= initialGpu.textures + limits.textureGrowth,
        "Repeated transfers do not accumulate page textures",
      );
      assert.ok(
        finalGpu.geometries <= initialGpu.geometries + limits.geometryGrowth,
        "Repeated transfers do not accumulate page geometry",
      );
      assert.deepEqual(
        scenario.errors,
        [],
        "No console errors or failed runtime responses",
      );
    } catch (error) {
      scenario.failure = String(error);
      scenario.failureStack = error.stack;
      scenario.failureState = await page
        .evaluate(() => {
          const d = window.libraryDebug?.();
          return {
            state: d?.state,
            ready: d?.ready,
            pending: d?.pagePending,
            session: d?.session,
            loadedPage: d?.scene.loadedPage,
            stageVisible: d?.scene.stageVisible,
            notice: document.querySelector("#notice")?.textContent,
          };
        })
        .catch(() => null);
      report.failures.push(`${entry.id}: ${error}`);
      await page
        .screenshot({
          path: path.join(output, `${entry.id}-failure.png`),
          fullPage: false,
        })
        .catch(() => {});
    } finally {
      await context.tracing.stop({
        path: path.join(output, `${entry.id}-trace.zip`),
      });
      await context.close();
      fs.writeFileSync(
        path.join(output, "report.json"),
        JSON.stringify(report, null, 2),
      );
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log(
  JSON.stringify(
    { scenarios: report.scenarios.length, failures: report.failures },
    null,
    2,
  ),
);
assert.equal(
  report.failures.length,
  0,
  `Phone acceptance failed; inspect ${output}/report.json and trace/screenshots.`,
);
