import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import { tsImport } from "tsx/esm/api";
const { readerFixture } = await tsImport(
  "./reader-fixture.ts",
  import.meta.url,
);

const root = path.resolve(process.env.READER_DIST || "dist");
const prefix = "/acceptance/little-light-library/";
const phoneImage = (src, cover = false) => {
  const candidate = src.replace(
    /\.(?:png|webp)$/i,
    cover ? ".cover.webp" : ".mobile.webp",
  );
  return fs.existsSync(path.join(root, candidate)) ? candidate : src;
};
const output = path.resolve(".test-output/room/failure-results.json");
assert.ok(
  fs.existsSync(path.join(root, "index.html")),
  "Build first with npm run build.",
);
const book = readerFixture(root);
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "books/catalog.json"), "utf8"),
);
let expectedBooks = catalog.length;
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
};
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (!pathname.startsWith(prefix)) return response.writeHead(404).end();
  const file = path.resolve(
    root,
    decodeURIComponent(pathname.slice(prefix.length)) || "index.html",
  );
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(bytes);
  });
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const origin = `http://127.0.0.1:${server.address().port}`;
const url = origin + prefix;
const sanitize = (text) =>
  String(text)
    .replaceAll(origin, "<static-origin>")
    .replaceAll(process.cwd(), "<prototype>")
    .replace(/\/(?:Users|home|private|tmp)\/[^\s"'<>]+/g, "<local-path>");
const results = {
  generatedAt: new Date().toISOString(),
  method:
    "Fresh isolated browser contexts against a production build at a nested static URL; failures injected only with Playwright routes.",
  urlPath: prefix,
  checks: [],
  pageErrors: [],
  unexpectedRequests: [],
};
let browser;

const enter = async (page, navigate = true) => {
  if (navigate) await page.goto(url);
  await page.locator("#enter").tap();
  await page.waitForFunction(
    (count) =>
      window.libraryDebug?.().ready &&
      window.libraryDebug?.().shelf.books.length === count &&
      !window.libraryDebug?.().shelf.busy,
    expectedBooks,
  );
  assert.equal(
    await page.locator("#loading").isVisible(),
    false,
    "Startup loader must clear when the catalog is usable",
  );
};
const openBook = async (page) => {
  await page.locator('[data-shelf-key="book:fixture-book"]').tap();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().shelf.inspected === "book:fixture-book" &&
      !window.libraryDebug?.().shelf.busy,
  );
  await page.locator("#shelf-read").tap();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().shelf.table === "book:fixture-book" &&
      !window.libraryDebug?.().shelf.busy &&
      !window.libraryDebug?.().pagePending &&
      (window.libraryDebug?.().ready ||
        window.libraryDebug?.().session.failure),
  );
};
const startupFailure = async (page, pattern) => {
  await page.locator(".loading-retry").waitFor({ state: "visible" });
  assert.equal(await page.locator("#loading").isVisible(), true);
  assert.ok(
    (await page.locator("#loading-text").innerText()).trim().length > 0,
  );
  const message = await page.locator("#notice").innerText();
  assert.match(
    message,
    pattern,
    "Startup error must identify the failed catalog or definition",
  );
  return sanitize(message);
};
const recoverStartup = async (page, route) => {
  await page.unroute(route);
  if (route.endsWith("/fixture-book.book.json"))
    await page.route(route, (request) => request.fulfill({ json: book }));
  await page.locator(".loading-retry").tap();
  await enter(page, false);
  assert.equal((await page.locator("#notice").innerText()).trim(), "");
};
const readable = async (page) => {
  assert.deepEqual(
    await page.locator(".story-text [data-segment]").allTextContents(),
    book.spreads[0].segments.map(({ text }) => text),
  );
  assert.equal(
    await page.locator("#loading").isVisible(),
    false,
    "Media failure must not trap the reader behind the startup loader",
  );
  assert.equal(await page.locator("#next").isEnabled(), true);
};
const check = async (name, run) => {
  console.log(`Running: ${name}`);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  page.on("pageerror", (error) =>
    results.pageErrors.push({ check: name, message: sanitize(error.message) }),
  );
  await context.route("**/*", async (route) => {
    const request = new URL(route.request().url());
    if (
      ["http:", "https:"].includes(request.protocol) &&
      (request.origin !== origin || !request.pathname.startsWith(prefix))
    ) {
      results.unexpectedRequests.push({
        check: name,
        url: sanitize(request.href),
      });
      return route.abort();
    }
    return route.continue();
  });
  expectedBooks = catalog.length;
  if (/generic|definition/i.test(name)) {
    expectedBooks++;
    await page.route("**/books/catalog.json", (route) =>
      route.fulfill({
        json: [...catalog, { id: book.id, path: book.id + ".book.json" }],
      }),
    );
    await page.route("**/books/fixture-book.book.json", (route) =>
      route.fulfill({ json: book }),
    );
  }
  try {
    const detail = await run(page);
    results.checks.push({ name, passed: true, detail });
  } catch (error) {
    const notice = await page
      .locator("#notice")
      .textContent()
      .catch(() => "");
    results.checks.push({
      name,
      passed: false,
      detail: { error: sanitize(error.message), notice: sanitize(notice) },
    });
    console.error(`Failed: ${name}: ${sanitize(error.message)}`);
  } finally {
    await context.close();
  }
};

try {
  browser = await chromium.launch({
    ...(process.env.READER_BROWSER_CHANNEL
      ? { channel: process.env.READER_BROWSER_CHANNEL }
      : process.env.CI
        ? {}
        : { channel: "chrome" }),
    headless: true,
  });
  results.browser = browser.version();
  await check(
    "Cold missing catalog shows loader error and Retry restores committed shelf",
    async (page) => {
      const route = url + "books/catalog.json";
      let fail;
      let requested;
      const pending = new Promise((resolve) => {
        fail = resolve;
      });
      const reached = new Promise((resolve) => {
        requested = resolve;
      });
      await page.route(route, async (request) => {
        requested();
        await pending;
        await request.fulfill({
          status: 503,
          contentType: "application/json",
          body: "{}",
        });
      });
      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await reached;
        assert.equal(
          await page.locator("#loading").isVisible(),
          true,
          "Cold loader is visible while catalog is pending",
        );
      } finally {
        fail();
      }
      const error = await startupFailure(page, /books\/catalog\.json.*503/i);
      await recoverStartup(page, route);
      return {
        pendingLoaderVisible: true,
        error,
        recoveredBooks: expectedBooks,
        loaderCleared: true,
      };
    },
  );

  await check(
    "Invalid catalog path identifies the entry and recovers after correction",
    async (page) => {
      const route = url + "books/catalog.json";
      await page.route(route, (request) =>
        request.fulfill({
          json: [{ id: "fixture-book", path: "../fixture-book.book.json" }],
        }),
      );
      await page.goto(url);
      const error = await startupFailure(
        page,
        /catalog\.json\[0\].*relative.*book\.json/i,
      );
      await recoverStartup(page, route);
      return { error, recoveredBooks: expectedBooks, loaderCleared: true };
    },
  );

  await check(
    "Invalid generic definition identifies its field and recovers after correction",
    async (page) => {
      const route = url + "books/fixture-book.book.json";
      const invalid = structuredClone(book);
      invalid.spreads[0].backdrop.asset = "missing-artwork";
      await page.route(route, (request) => request.fulfill({ json: invalid }));
      await page.goto(url);
      const error = await startupFailure(
        page,
        /fixture-book\.book\.json.*backdrop.*ASSET_REFERENCE/i,
      );
      await recoverStartup(page, route);
      return { error, recoveredBooks: expectedBooks, loaderCleared: true };
    },
  );

  await check(
    "A failed shelf cover leaves titled books selectable and reload restores the artwork",
    async (page) => {
      const cover = url + phoneImage("assets/art/jonah/jonah-shore.webp", true);
      await page.route(cover, (route) =>
        route.fulfill({ status: 503, body: "Injected cover failure" }),
      );
      const failedCover = page.waitForResponse(
        (response) => response.url() === cover && response.status() === 503,
      );
      await enter(page);
      await failedCover;
      assert.equal(
        await page
          .locator('[data-shelf-key="book:jonah-and-the-whale"]')
          .count(),
        1,
      );
      await page.locator('[data-shelf-key="book:jonah-and-the-whale"]').tap();
      await page.waitForFunction(
        () =>
          window.libraryDebug?.().shelf.inspected ===
          "book:jonah-and-the-whale",
      );
      assert.match(
        await page.locator(".shelf-preview h1").textContent(),
        /Jonah/,
      );
      await page.unroute(cover);
      const restored = page.waitForResponse(
        (response) => response.url() === cover && response.ok(),
      );
      await page.reload();
      await enter(page, false);
      await restored;
      return {
        coverFailed: true,
        titleAndSelectionUsable: true,
        reloadRestoredCover: true,
      };
    },
  );

  for (const kind of ["artwork", "audio"]) {
    await check(
      `Missing generic ${kind} keeps text readable and visible Retry restores playback`,
      async (page) => {
        const asset =
          kind === "artwork"
            ? book.spreads[0].backdrop.asset
            : book.spreads[0].segments[0].narration.asset;
        const relativePath = book.assets[asset].src;
        const route =
          url + (kind === "artwork" ? phoneImage(relativePath) : relativePath);
        let injected = 0;
        await page.route(route, (request) => {
          injected++;
          return request.fulfill({
            status: 503,
            body: "Injected media failure",
          });
        });
        await enter(page);
        await openBook(page);
        await page.locator("#notice button").waitFor({ state: "visible" });
        await readable(page);
        assert.ok(
          injected > 0,
          "The unavailable media must actually be requested",
        );
        const error = await page.locator("#notice").innerText();
        assert.match(
          error,
          kind === "artwork"
            ? /art|image|picture|illustration/i
            : /audio|sound|narration/i,
        );
        if (kind === "audio")
          assert.equal(
            await page.evaluate(() => window.libraryDebug().ready),
            false,
          );
        await page.unroute(route);
        const restored = page.waitForResponse(
          (response) => response.url() === route && response.ok(),
        );
        await page.locator("#notice button").tap();
        await restored;
        await page.waitForFunction(
          () =>
            window.libraryDebug?.().ready &&
            !window.libraryDebug?.().shelf.busy &&
            !!window.libraryDebug?.().scene.authored,
        );
        await readable(page);
        assert.equal(
          (await page.locator("#notice").innerText()).trim(),
          "",
          "Successful Retry clears the failure message",
        );
        assert.equal(
          await page.evaluate(() => window.libraryDebug().playing),
          false,
          "Retry recovers paused",
        );
        const ids = await page.evaluate(() =>
          window.libraryDebug().scene.authored.elements.map(({ id }) => id),
        );
        assert.deepEqual(
          ids,
          book.spreads[0].elements.map(({ id }) => id),
        );
        await page.locator("#play").tap();
        await page.waitForFunction(
          () =>
            window.libraryDebug?.().playing &&
            window.libraryDebug?.().position > 0.1,
        );
        return {
          failedResource: relativePath,
          error: sanitize(error),
          textPreserved: true,
          retryFetchedMedia: true,
          restoredStage: true,
          resumedPlayback: true,
          loaderCleared: true,
        };
      },
    );
  }

  book.assets["later-backdrop"] = {
    kind: "image",
    src: "assets/art/theatre/boarding.webp",
    attribution: "Existing local artwork reused for a disposable test fixture.",
  };
  book.spreads[1].backdrop.asset = "later-backdrop";
  await check(
    "Pending and failed generic artwork keep the completed spread until Retry",
    async (page) => {
      await enter(page);
      await openBook(page);
      const before = await page.evaluate(() => window.libraryDebug().scene);
      assert.equal(before.loadedPage?.index, 0);
      assert.equal(before.stageVisible, true);
      const route =
        url + phoneImage(book.assets[book.spreads[1].backdrop.asset].src);
      let reached;
      let release;
      const requested = new Promise((resolve) => (reached = resolve));
      const pending = new Promise((resolve) => (release = resolve));
      await page.route(route, async (request) => {
        reached();
        await pending;
        await request.fulfill({
          status: 503,
          body: "Injected artwork failure",
        });
      });
      await page.locator("#next").tap();
      await Promise.race([
        requested,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(Error("Second backdrop was not requested")),
            12000,
          ),
        ),
      ]);
      const whileLoading = await page.evaluate(
        () => window.libraryDebug().scene,
      );
      assert.equal(whileLoading.loadedPage?.index, 0);
      assert.equal(whileLoading.stageVisible, true);
      await page.screenshot({
        path: path.join(path.dirname(output), "authored-pending.png"),
      });
      release();
      await page.locator("#notice button").waitFor({ state: "visible" });
      const afterFailure = await page.evaluate(
        () => window.libraryDebug().scene,
      );
      assert.equal(afterFailure.loadedPage?.index, 0);
      assert.equal(afterFailure.stageVisible, true);
      await page.screenshot({
        path: path.join(path.dirname(output), "authored-failure.png"),
      });
      assert.deepEqual(
        await page.locator(".story-text [data-segment]").allTextContents(),
        book.spreads[0].segments.map(({ text }) => text),
        "Failed turns retain text paired with the previous artwork",
      );
      await page.unroute(route);
      await page.locator("#notice button").tap();
      await page.waitForFunction(
        () => window.libraryDebug().scene.loadedPage?.index === 1,
      );
      assert.equal(
        await page.evaluate(() => window.libraryDebug().playing),
        false,
      );
      return {
        previousArtVisibleDuringLoad: true,
        previousArtVisibleAfterFailure: true,
        retryPaused: true,
      };
    },
  );
  for (const { story, asset } of [
    {
      story: "eden",
      asset: "assets/art/theatre/eden-eve-behind-garden-bush.webp",
    },
    { story: "noah", asset: "assets/art/theatre/timber-bench.webp" },
  ]) {
    await check(
      `Pending and failed legacy ${story} artwork keep the completed spread until Retry`,
      async (page) => {
        await enter(page);
        const key = `builtin:${story}`;
        await page.locator(`[data-shelf-key="${key}"]`).tap();
        await page.waitForFunction(
          (selected) =>
            window.libraryDebug().shelf.inspected === selected &&
            !window.libraryDebug().shelf.busy,
          key,
        );
        await page.locator("#shelf-read").tap();
        await page.waitForFunction(
          (selected) =>
            window.libraryDebug().shelf.table === selected &&
            window.libraryDebug().scene.loadedPage?.index === 0 &&
            !window.libraryDebug().shelf.busy,
          key,
        );
        const route = url + phoneImage(asset);
        let reached;
        let release;
        const requested = new Promise((resolve) => (reached = resolve));
        const pending = new Promise((resolve) => (release = resolve));
        await page.route(route, async (request) => {
          reached();
          await pending;
          await request.fulfill({
            status: 503,
            body: "Injected legacy art failure",
          });
        });
        await page.locator("#next").tap();
        await Promise.race([
          requested,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(Error(`${story} asset was not requested`)),
              12000,
            ),
          ),
        ]);
        const during = await page.evaluate(() => window.libraryDebug().scene);
        assert.equal(during.loadedPage?.index, 0);
        assert.equal(during.stageVisible, true);
        release();
        await page.locator("#notice button").waitFor({ state: "visible" });
        const failed = await page.evaluate(() => window.libraryDebug().scene);
        assert.equal(failed.loadedPage?.index, 0);
        assert.equal(failed.stageVisible, true);
        assert.match(await page.locator(".reader-meta").innerText(), /Page 1/);
        assert.match(await page.locator("#notice").innerText(), /Page 2/);
        await page.unroute(route);
        await page.locator("#notice button").tap();
        await page.waitForFunction(
          () => window.libraryDebug().scene.loadedPage?.index === 1,
        );
        assert.equal(
          await page.evaluate(() => window.libraryDebug().playing),
          false,
        );
        return {
          previousArtVisibleDuringLoad: true,
          previousArtVisibleAfterFailure: true,
          retryPaused: true,
        };
      },
    );
  }
  await check(
    "Leaving during a legacy load cannot commit stale actors or artwork",
    async (page) => {
      await enter(page);
      await page.locator('[data-shelf-key="builtin:eden"]').tap();
      await page.waitForFunction(
        () =>
          window.libraryDebug().shelf.inspected === "builtin:eden" &&
          !window.libraryDebug().shelf.busy,
      );
      await page.locator("#shelf-read").tap();
      await page.waitForFunction(
        () =>
          window.libraryDebug().scene.loadedPage?.index === 0 &&
          !window.libraryDebug().shelf.busy,
      );
      const route =
        url + phoneImage("assets/art/theatre/eden-eve-behind-garden-bush.webp");
      let reached;
      let release;
      const requested = new Promise((resolve) => (reached = resolve));
      const pending = new Promise((resolve) => (release = resolve));
      await page.route(route, async (request) => {
        reached();
        await pending;
        await request.continue();
      });
      await page.locator("#next").tap();
      await Promise.race([
        requested,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(Error("Eden second-page art was not requested")),
            12000,
          ),
        ),
      ]);
      await page.locator("#shelf").tap();
      release();
      await page.waitForFunction(
        () =>
          window.libraryDebug().shelf.browsing &&
          !window.libraryDebug().shelf.busy,
      );
      const onShelf = await page.evaluate(() => window.libraryDebug());
      assert.equal(onShelf.scene.mode, "room");
      assert.equal(onShelf.scene.loadedPage?.index, 0);
      assert.equal(onShelf.session.failure, null);
      await page.unroute(route);
      await page.locator("#shelf").tap();
      await page.waitForFunction(
        () =>
          !window.libraryDebug().shelf.browsing &&
          window.libraryDebug().scene.loadedPage?.index === 1 &&
          !window.libraryDebug().shelf.busy,
      );
      return { staleResultDiscarded: true, continueLoadedRequestedPage: true };
    },
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  results.passed =
    results.checks.length === 10 &&
    results.checks.every(({ passed }) => passed) &&
    !results.pageErrors.length &&
    !results.unexpectedRequests.length;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(results, null, 2) + "\n");
}
console.log(JSON.stringify(results, null, 2));
if (!results.passed) process.exitCode = 1;
