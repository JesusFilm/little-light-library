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

const root = path.resolve("dist");
const prefix = "/acceptance/little-light-library/";
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
  await page.locator("#enter").click();
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
  await page.locator('[data-shelf-key="book:fixture-book"]').click();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().shelf.inspected === "book:fixture-book" &&
      !window.libraryDebug?.().shelf.busy,
  );
  await page.locator("#shelf-read").click();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().shelf.table === "book:fixture-book" &&
      !window.libraryDebug?.().shelf.busy,
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
  await page.locator(".loading-retry").click();
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
  browser = await chromium.launch({ channel: "chrome", headless: true });
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

  for (const kind of ["artwork", "audio"]) {
    await check(
      `Missing generic ${kind} keeps text readable and visible Retry restores playback`,
      async (page) => {
        const asset =
          kind === "artwork"
            ? book.spreads[0].backdrop.asset
            : book.spreads[0].segments[0].narration.asset;
        const relativePath = book.assets[asset].src;
        const route = url + relativePath;
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
        await page.locator("#notice button").click();
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
        await page.locator("#play").click();
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
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  results.passed =
    results.checks.length === 5 &&
    results.checks.every(({ passed }) => passed) &&
    !results.pageErrors.length &&
    !results.unexpectedRequests.length;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(results, null, 2) + "\n");
}
console.log(JSON.stringify(results, null, 2));
if (!results.passed) process.exitCode = 1;
