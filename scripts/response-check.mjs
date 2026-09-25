import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium, devices } from "playwright";

const root = path.resolve(process.env.READER_DIST || "dist");
const prefix = "/acceptance/little-light-library/";
assert.ok(fs.existsSync(path.join(root, "index.html")), "Build first.");
const book = JSON.parse(
  fs.readFileSync(path.join(root, "books/jonah-and-the-whale.book.json")),
);
const [first, next, latest] = book.spreads;
const phoneImage = (src) => {
  const candidate = src.replace(/\.(?:png|webp)$/i, ".mobile.webp");
  return fs.existsSync(path.join(root, candidate)) ? candidate : src;
};
const firstArt = phoneImage(book.assets[first.ground.asset].src);
const nextArt = phoneImage(book.assets[next.ground.asset].src);
assert.notEqual(firstArt, nextArt, "Adjacent art must use distinct URLs");
assert.notEqual(nextArt, book.assets[latest.ground.asset].src);
const mime = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".webp": "image/webp",
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
const browser = await chromium.launch({
  ...(process.env.CI ? {} : { channel: "chrome" }),
  headless: true,
});
const context = await browser.newContext({
  ...devices["Pixel 5"],
  reducedMotion: "no-preference",
  serviceWorkers: "block",
});
const page = await context.newPage();
page.setDefaultTimeout(30_000);
const url = `http://127.0.0.1:${server.address().port}${prefix}`;
const pendingRoutes = new Map();
const artworkRequests = new Map();
const hold = (asset) => {
  let seen;
  const requested = new Promise((resolve) => (seen = resolve));
  artworkRequests.set(asset, requested);
  return page.route(`**/${asset}`, (route) => {
    pendingRoutes.set(asset, route);
    seen();
  });
};
const waitForRoute = async (asset) => {
  let timer;
  try {
    await Promise.race([
      artworkRequests.get(asset),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(Error(`Artwork request was not seen: ${asset}`)),
          30_000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};
const snapshot = () => page.evaluate(() => window.libraryDebug());
const assertPending = async (expectedPage) => {
  const state = await snapshot();
  assert.equal(state.state.page, expectedPage);
  assert.equal(state.pagePending, true);
  assert.equal(await page.locator("#panel").getAttribute("aria-busy"), "true");
  const notice = (await page.locator("#notice").innerText()).trim();
  assert.ok(notice.includes(String(expectedPage + 1)) && notice.length > 10);
  assert.equal(await page.locator("#next").isEnabled(), true);
  const title = page.locator(".reader h1");
  const shownTitle = (await title.count())
    ? await title.first().textContent()
    : "";
  if (shownTitle) {
    assert.notEqual(
      shownTitle,
      book.spreads[expectedPage].title,
      `Title appeared before visible art: ${JSON.stringify({ stageVisible: state.scene.stageVisible, loadedPage: state.scene.loadedPage, pending: state.pagePending, hidden: await page.evaluate(() => document.hidden), opening: state.scene.opening, coverMoving: state.scene.shelfCoverMoving, transitionWaiting: state.scene.transitionWaiting, mode: state.scene.mode, pageAngle: state.scene.pageAngle, pageVisible: state.scene.pageVisible, revision: state.session })}`,
    );
    assert.equal(
      state.scene.loadedPage?.index,
      book.spreads.findIndex((spread) => spread.title === shownTitle),
      "Old visible text must still match old completed art",
    );
  }
};
let result;
try {
  await hold(firstArt);
  await hold(nextArt);
  await page.goto(url);
  await page.locator("#enter").tap();
  await page.waitForFunction(() => window.libraryDebug?.().ready);
  await page.locator('[data-shelf-key="book:jonah-and-the-whale"]').tap();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().shelf.inspected === "book:jonah-and-the-whale" &&
      !window.libraryDebug?.().shelf.busy,
  );
  await page.locator("#shelf-read").tap();
  await page.waitForFunction(
    () =>
      window.libraryDebug().pagePending && !window.libraryDebug().shelf.busy,
  );
  await waitForRoute(firstArt);
  await assertPending(0);
  assert.equal((await snapshot()).session.playback.requested, true);
  await page.locator("#play").tap();
  assert.equal((await snapshot()).session.playback.requested, false);
  assert.equal(
    await page.locator("#play").getAttribute("aria-pressed"),
    "false",
  );
  await page.locator("#play").tap();
  assert.equal((await snapshot()).session.playback.requested, true);
  await page.locator("#next").tap();
  await waitForRoute(nextArt);
  await assertPending(1);
  await page.locator("#next").tap();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().scene.loadedPage?.index === 2 &&
      !window.libraryDebug?.().scene.stageVisible,
  );
  await assertPending(2);
  await page.waitForFunction((id) => {
    const state = window.libraryDebug?.();
    return (
      state?.state.page === 2 &&
      state.scene.loadedPage?.index === 2 &&
      state.scene.stageVisible &&
      !state.pagePending &&
      document.querySelector(".reader h1")?.textContent === id
    );
  }, latest.title);
  assert.equal(await page.locator("#panel").getAttribute("aria-busy"), "false");
  await page.waitForFunction(() => window.libraryDebug?.().playing, null, {
    timeout: 30_000,
  });
  const before = await snapshot();
  // These aborted old requests must not change the newest page or its narration.
  await Promise.all([
    pendingRoutes.get(firstArt).abort(),
    pendingRoutes.get(nextArt).abort(),
  ]);
  await page.waitForFunction(
    (position) => window.libraryDebug?.().position > position + 0.3,
    before.position,
  );
  const after = await snapshot();
  assert.equal(after.state.page, 2);
  assert.equal(after.scene.loadedPage?.index, 2);
  assert.equal(after.playing, true);
  assert.equal(after.session.failure, null);
  assert.equal((await page.locator("#notice").innerText()).trim(), "");
  assert.equal(await page.locator(".reader h1").innerText(), latest.title);
  result = {
    passed: true,
    touch: true,
    heldArtwork: [firstArt, nextArt],
    latestSpread: latest.id,
    positionBefore: before.position,
    positionAfter: after.position,
  };
  const failedContext = await browser.newContext({
    ...devices["Pixel 5"],
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  try {
    const failedPage = await failedContext.newPage();
    await failedPage.route(`**/${firstArt}`, (route) => route.abort());
    await failedPage.goto(url);
    await failedPage.locator("#enter").tap();
    await failedPage.waitForFunction(() => window.libraryDebug?.().ready);
    await failedPage
      .locator('[data-shelf-key="book:jonah-and-the-whale"]')
      .tap();
    await failedPage.waitForFunction(
      () =>
        window.libraryDebug?.().shelf.inspected ===
          "book:jonah-and-the-whale" && !window.libraryDebug?.().shelf.busy,
    );
    await failedPage.locator("#shelf-read").tap();
    await failedPage.waitForFunction(
      () => window.libraryDebug?.().session.failure === "artwork",
    );
    assert.equal(
      await failedPage.locator(".reader h1").innerText(),
      first.title,
    );
    assert.deepEqual(
      await failedPage.locator(".story-text [data-segment]").allTextContents(),
      first.segments.map((segment) => segment.text),
    );
    assert.equal(
      await failedPage.locator("#panel").getAttribute("aria-busy"),
      "false",
    );
    assert.equal(await failedPage.locator("#notice button").isVisible(), true);
    result.firstArtworkFailureReadable = true;
  } finally {
    await failedContext.close();
  }
} finally {
  await context.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log(JSON.stringify(result, null, 2));
