import { checkReadingComposition } from "./reading-composition-check.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { tsImport } from "tsx/esm/api";

const { sourceTranslation } = await tsImport(
  "../src/book-localization.ts",
  import.meta.url,
);

const root = path.resolve(process.env.READER_DIST || "dist");
const prefix = "/acceptance/little-light-library/";
const output = path.resolve(
  process.env.ROOM_CHECK_OUTPUT || ".test-output/room",
);
const summaryPath = path.join(output, "room-results.json");
const committedKeys = [
  "builtin:eden",
  "builtin:noah",
  "book:jonah-and-the-whale",
];
const { readerFixture } = await tsImport(
  "./reader-fixture.ts",
  import.meta.url,
);
const bookFixture = (id) =>
  id === "fixture-book"
    ? readerFixture(root)
    : JSON.parse(
        fs.readFileSync(path.join(root, `books/${id}.book.json`), "utf8"),
      );
const fixtureCatalog = () => [
  ...JSON.parse(fs.readFileSync(path.join(root, "books/catalog.json"), "utf8")),
  { id: "fixture-book", path: "fixture-book.book.json" },
];
const installFixture = async (book = readerFixture(root)) => {
  await page.route("**/books/catalog.json", (route) =>
    route.fulfill({ json: fixtureCatalog() }),
  );
  await page.route("**/books/fixture-book.book.json", (route) =>
    route.fulfill({ json: book }),
  );
};
const removeFixture = async () => {
  await page.unroute("**/books/fixture-book.book.json");
  await page.unroute("**/books/catalog.json");
};
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

assert.ok(
  fs.existsSync(path.join(root, "index.html")),
  "Build first with `npm run build`.",
);
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(path.dirname(summaryPath), { recursive: true });

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  if (!requestUrl.pathname.startsWith(prefix)) {
    response.writeHead(404).end();
    return;
  }
  const file = path.resolve(
    root,
    decodeURIComponent(requestUrl.pathname.slice(prefix.length)) ||
      "index.html",
  );
  if (!file.startsWith(root + path.sep)) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, bytes) => {
    if (error) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(bytes);
  });
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
const results = {
  generatedAt: new Date().toISOString(),
  method:
    "Playwright against a production build at a nested static URL, using an isolated browser context, committed catalog, stale authoring-storage fixture, and intercepted dense catalog.",
  browser: browser.version(),
  host: { platform: os.platform(), arch: os.arch() },
  urlPath: prefix,
  checks: [],
  pageErrors: [],
  unexpectedRequests: [],
  failedResponses: [],
  requestFailures: [],
  audioRequests: [],
  transitionCaptures: [],
};

const check = async (name, run) => {
  console.log(`Running: ${name}`);
  const started = Date.now();
  try {
    const detail = await run();
    results.checks.push({
      name,
      passed: true,
      durationMs: Date.now() - started,
      detail,
    });
  } catch (error) {
    console.error(`Failed: ${name}: ${error.message}`);
    const diagnostic = await page
      .evaluate(() => ({
        notice: document.querySelector("#notice")?.textContent,
        debug: window.libraryDebug?.(),
        bodyClasses: document.body.className,
        header: [...document.querySelectorAll("#header button")].map(
          (button) => ({
            id: button.id,
            label: button.textContent?.trim(),
            disabled: button.disabled,
          }),
        ),
        shelfTargets: [
          ...document.querySelectorAll("[data-shelf-key],[data-toy-id]"),
        ].map((button) => ({
          key: button.dataset.shelfKey ?? button.dataset.toyId,
          hidden: button.hidden,
          label: button.getAttribute("aria-label"),
          bounds: button.getBoundingClientRect().toJSON(),
        })),
      }))
      .catch(() => null);
    results.checks.push({
      name,
      passed: false,
      durationMs: Date.now() - started,
      detail: { error: error.stack || String(error), diagnostic },
    });
  }
};

const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  deviceScaleFactor: 1,
  acceptDownloads: false,
});
await context.route("**/*", async (route) => {
  const requestUrl = new URL(route.request().url());
  if (!["http:", "https:"].includes(requestUrl.protocol))
    return route.continue();
  if (
    requestUrl.origin !== new URL(url).origin ||
    !requestUrl.pathname.startsWith(prefix)
  ) {
    results.unexpectedRequests.push(route.request().url());
    return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
await page.addInitScript(() => {
  const connections = new Map();
  const starts = [];
  const automation = new WeakMap();
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (destination, ...args) {
    connections.set(this, destination);
    return connect.call(this, destination, ...args);
  };
  for (const method of ["setValueAtTime", "linearRampToValueAtTime"]) {
    const schedule = AudioParam.prototype[method];
    AudioParam.prototype[method] = function (value, time) {
      const events = automation.get(this) || [];
      events.push({ method, value, time });
      automation.set(this, events);
      return schedule.call(this, value, time);
    };
  }
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    const gains = [];
    let node = this;
    const seen = new Set();
    while (node && !seen.has(node)) {
      seen.add(node);
      if (node instanceof GainNode) gains.push(node.gain);
      node = connections.get(node);
    }
    starts.push({ source: this, gains });
    return start.apply(this, args);
  };
  window.readerAudioProbe = () =>
    starts.map(({ source, gains }) => ({
      loop: source.loop,
      duration: source.buffer?.duration,
      gains: gains.map((gain) => gain.value),
      gainSchedule: gains.map((gain) => ({
        initialValue: gain.value,
        events: automation.get(gain) || [],
      })),
    }));
});
page.on("response", (response) => {
  if (response.status() >= 400)
    results.failedResponses.push({
      url: response.url(),
      status: response.status(),
    });
  if (/\.(wav|mp3|ogg)(?:$|\?)/.test(response.url()))
    results.audioRequests.push(response.url());
});
page.on("requestfailed", (request) => {
  const reason = request.failure()?.errorText;
  // Navigation cancels superseded image/audio loads; other failures are regressions.
  if (reason !== "net::ERR_ABORTED")
    results.requestFailures.push({ url: request.url(), reason });
});
page.setDefaultTimeout(15_000);
page.on("pageerror", (error) => results.pageErrors.push(error.message));

const debug = () => page.evaluate(() => window.libraryDebug());
const enter = async () => {
  await page.goto(url);
  await page.waitForFunction(
    () =>
      document.querySelector('[data-locale="en-US"]') ||
      document.querySelector("#notice button"),
  );
  assert.equal(
    await page.locator("#notice button").count(),
    0,
    await page.locator("#notice").textContent(),
  );
  await page.locator('[data-locale="en-US"]').click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-locale="en-US"]')
        ?.getAttribute("aria-pressed") === "true",
  );
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.libraryDebug?.().ready);
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().shelf.books.length >= 2 &&
      window.libraryDebug?.().shelf.busy === false,
  );
};
const waitShelf = async (predicate, argument) =>
  page.waitForFunction(predicate, argument, { timeout: 30_000 });
const captureTransition = async (key, phase) => {
  await waitShelf(
    ({ key, phase }) => {
      const state = window.libraryDebug?.();
      const book = state?.scene.shelf.books.find((entry) => entry.key === key);
      if (!state?.shelf.busy || !state.scene.shelf.moving || !book?.visible)
        return false;
      return phase === "rotate"
        ? book.rotation[1] > 0.35 && book.rotation[1] < 1.1
        : book.rotation[0] < -0.3 && book.rotation[0] > -1.1;
    },
    { key, phase },
  );
  const state = await debug();
  const file = path.join(output, `swap-${phase}.png`);
  await page.screenshot({ path: file });
  results.transitionCaptures.push({
    file,
    phase,
    observedBeforeCapture: state.scene.shelf.books.find(
      (entry) => entry.key === key,
    ),
    tableTransform: state.scene.bookTransform,
  });
};
const selectBook = async (key, capture = false) => {
  await page.locator(`[data-shelf-key="${key}"]`).click();
  if (capture) await captureTransition(key, "rotate");
  await waitShelf(
    (selected) =>
      window.libraryDebug?.().shelf.inspected === selected &&
      window.libraryDebug?.().shelf.busy === false,
    key,
  );
};
const readSelected = async (key, capture = false) => {
  await page.locator("#shelf-read").click();
  if (capture) await captureTransition(key, "land");
  await waitShelf((selected) => {
    const state = window.libraryDebug?.();
    return (
      state?.shelf.table === selected &&
      state.shelf.browsing === false &&
      state.shelf.busy === false &&
      state.scene?.tableShelfKey === selected &&
      state.ready &&
      !state.pagePending
    );
  }, key);
};
const assertTablePose = (state) => {
  const close = (actual, expected, label) =>
    assert.ok(
      Math.abs(actual - expected) < 1e-6,
      `${label}: expected ${expected}, received ${actual}`,
    );
  const pose = state.scene.bookTransform;
  [0, 1.495, 1.1].forEach((value, index) =>
    close(pose.position[index], value, `table position ${index}`),
  );
  [-Math.PI / 2, 0, 0].forEach((value, index) =>
    close(pose.rotation[index], value, `table rotation ${index}`),
  );
  [1, 1, 1].forEach((value, index) =>
    close(pose.scale[index], value, `table scale ${index}`),
  );
  close(state.scene.hinge, 0, "open table-book hinge");
};
const assertSessionAgreement = (state) => {
  assert.equal(state.session.table, state.scene.tableShelfKey);
  assert.equal(state.session.table, state.shelf.table);
  assert.equal(state.session.browsing, state.shelf.browsing);
  assert.equal(state.session.reading.book, state.state.book);
  assert.equal(state.session.reading.page, state.state.page);
  assert.equal(state.session.loading, state.pagePending);
  assert.deepEqual(
    state.session.reading.toys,
    state.shelf.toys.map(({ id }) => id),
  );
};
const assertCoverContinuity = (state, key) => {
  const shelfBook = state.scene.shelf.books.find((book) => book.key === key);
  assert.ok(shelfBook, `${key} remains represented by its shelf copy`);
  assert.equal(state.scene.tableCoverMatchesShelf, true);
  assert.equal(state.scene.tableCoverTexture, shelfBook.coverTexture);
  assert.deepEqual(state.scene.tableCoverAppearance, shelfBook.appearance);
  assert.deepEqual(state.scene.tableBookMaterials, shelfBook.appearance);
};
const assertCanonicalShelfPose = (state, key) => {
  const shelfBook = state.scene.shelf.books.find((book) => book.key === key);
  assert.ok(shelfBook, `${key} has a registered shelf copy`);
  [0, Math.PI / 2, 0].forEach((value, index) =>
    assert.ok(
      Math.abs(shelfBook.rotation[index] - value) < 1e-6,
      `${key} shelf rotation ${index}: expected ${value}, received ${shelfBook.rotation[index]}`,
    ),
  );
  [1, 1, 1].forEach((value, index) =>
    assert.ok(
      Math.abs(shelfBook.scale[index] - value) < 1e-6,
      `${key} shelf scale ${index}: expected ${value}, received ${shelfBook.scale[index]}`,
    ),
  );
};
const waitForOpenTablePose = () =>
  page.waitForFunction(
    () => {
      const scene = window.libraryDebug?.().scene;
      return (
        scene?.mode === "spread" &&
        Math.abs(scene.hinge) < 1e-6 &&
        Math.abs(scene.bookTransform.rotation[0] + Math.PI / 2) < 1e-6 &&
        Math.abs(scene.bookTransform.rotation[1]) < 1e-6 &&
        Math.abs(scene.bookTransform.rotation[2]) < 1e-6
      );
    },
    undefined,
    { timeout: 15_000 },
  );
const waitForClosedBrowsingTable = () =>
  page.waitForFunction(
    () => {
      const state = window.libraryDebug?.();
      return (
        state?.shelf.browsing === true &&
        state.shelf.busy === false &&
        state.scene.shelfBrowsingTable === true &&
        state.scene.shelfCoverMoving === false &&
        Math.abs(state.scene.hinge - Math.PI) < 1e-6 &&
        state.scene.stageVisible === false &&
        state.scene.camera.every(
          (value, index) =>
            Math.abs(value - state.scene.cameraGoal[index]) < 0.02,
        ) &&
        state.scene.look.every(
          (value, index) =>
            Math.abs(value - state.scene.lookGoal[index]) < 0.02,
        )
      );
    },
    undefined,
    { timeout: 15_000 },
  );
// `opening` identifies the opening sequence and can remain true after it settles.
// Require the rendered stage itself to be upright, visible, and free of turn proxies.
const waitForSettledSpread = async () => {
  // ResizeObserver updates the canvas and camera after the viewport changes.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.waitForFunction(
    () => {
      const scene = window.libraryDebug?.().scene;
      return (
        scene?.mode === "spread" &&
        scene.stageVisible &&
        !scene.transitionWaiting &&
        !scene.pageVisible &&
        !scene.retainedStageVisible &&
        scene.popups.length > 0 &&
        scene.popups.every((angle) => Math.abs(angle - Math.PI / 2) < 0.002) &&
        scene.camera.every(
          (value, index) =>
            Math.abs(
              value -
                scene.cameraGoal[index] -
                scene.readingFocus.cameraOffset[index],
            ) < 0.36,
        ) &&
        scene.look.every(
          (value, index) =>
            Math.abs(
              value -
                scene.lookGoal[index] -
                scene.readingFocus.lookOffset[index],
            ) < 0.03,
        )
      );
    },
    undefined,
    { timeout: 15_000 },
  );
};
const assertToyTargetsInView = async () => {
  const framing = await page.evaluate(() => {
    const headerBottom = document
      .querySelector("#header")
      .getBoundingClientRect().bottom;
    return [...document.querySelectorAll("[data-toy-id]:not([hidden])")].map(
      (target) => {
        const bounds = target.getBoundingClientRect();
        return {
          id: target.dataset.toyId,
          top: bounds.top,
          bottom: bounds.bottom,
          headerBottom,
          viewportHeight: window.innerHeight,
        };
      },
    );
  });
  assert.ok(framing.length > 0, "expected visible shelf toy targets");
  framing.forEach(({ id, top, bottom, headerBottom, viewportHeight }) => {
    assert.ok(top >= headerBottom, `${id} is obscured by the header`);
    assert.ok(bottom <= viewportHeight, `${id} extends below the viewport`);
  });
};

await check(
  "All committed spreads keep art and reading controls separate",
  async () =>
    checkReadingComposition(page, url, path.join(output, "composition")),
);
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.setViewportSize({ width: 1366, height: 768 });

await check(
  "Physical shelf selection, reading, returning and toy lifecycle",
  async () => {
    await enter();
    let state = await debug();
    assert.equal(state.shelf.browsing, true);
    assert.equal(state.shelf.table, null);
    assert.equal(state.shelf.inspected, null);
    assert.equal(
      state.scene.shelf.endStops.length,
      1,
      "Three committed books have one occupied shelf and a book stop",
    );
    assert.deepEqual(
      state.shelf.books.map(({ key }) => key),
      committedKeys,
    );
    for (const key of committedKeys) assertCanonicalShelfPose(state, key);
    for (const key of ["coverColor", "spineColor", "accentColor"])
      assert.equal(
        new Set(state.scene.shelf.books.map((book) => book.appearance[key]))
          .size,
        committedKeys.length,
        `committed books have distinct ${key}`,
      );
    assert.equal(
      await page.locator(".book-choices,.room-footer,#story-choices").count(),
      0,
      "legacy room overlays must not return",
    );

    await selectBook("builtin:eden");
    await page.locator("#shelf-read").waitFor({ state: "visible" });
    await page.locator("#shelf-return").waitFor({ state: "visible" });
    assert.equal((await debug()).scene.shelf.previewKey, "builtin:eden");
    await page.locator("#shelf-return").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.inspected === null &&
        window.libraryDebug?.().shelf.busy === false,
    );
    state = await debug();
    assert.equal(state.shelf.table, null);
    assert.equal(state.scene.shelf.previewKey, null);
    assertCanonicalShelfPose(state, "builtin:eden");

    await selectBook("builtin:eden");
    await readSelected("builtin:eden");
    await page.waitForFunction(
      () => window.libraryDebug().scene.shelfToys.length === 3,
    );
    state = await debug();
    assertSessionAgreement(state);
    assert.equal(state.state.book, "eden");
    assertCoverContinuity(state, "builtin:eden");
    assertCanonicalShelfPose(state, "builtin:eden");
    assert.deepEqual(
      state.shelf.toys.map(({ id }) => id),
      ["adam", "eve", "garden-tree"],
    );
    assert.deepEqual(
      state.scene.shelfToys.map(({ id }) => id),
      ["adam", "eve", "garden-tree"],
    );

    await page.evaluate(() => {
      document.querySelector("#next")?.click();
      if (!window.libraryDebug?.().pagePending)
        throw Error("The page load must still be pending before Library");
      if (
        document.querySelector("#panel")?.getAttribute("aria-busy") !==
          "true" ||
        !document.querySelector("#notice")?.textContent?.includes("2")
      )
        throw Error(
          "Requested page must show explicit pending feedback while text stays paired with artwork",
        );
      document.querySelector("#shelf")?.click();
    });
    await waitShelf(
      () =>
        window.libraryDebug?.().state.page === 1 &&
        window.libraryDebug?.().shelf.browsing === true &&
        window.libraryDebug?.().shelf.busy === false,
    );
    await waitForClosedBrowsingTable();
    state = await debug();
    assertSessionAgreement(state);
    assert.equal(state.state.book, "eden");
    assert.equal(state.state.page, 1);
    assert.equal(state.shelf.table, "builtin:eden");
    assert.equal(state.shelf.toys.length, 3);
    assert.equal(state.scene.stageVisible, false);
    assert.equal(state.scene.shelfBrowsingTable, true);
    assertCoverContinuity(state, "builtin:eden");
    await page.screenshot({ path: path.join(output, "room-browsing.png") });

    const pausedPosition = state.position;
    assert.equal(state.playing, false);
    await page.waitForTimeout(150);
    assert.ok(Math.abs((await debug()).position - pausedPosition) < 0.01);
    await page.locator("#shelf").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.browsing === false &&
        window.libraryDebug?.().shelf.busy === false,
    );
    await waitForOpenTablePose();
    state = await debug();
    assertSessionAgreement(state);
    assert.equal(state.state.page, 1);
    assert.equal(state.playing, false);
    assertCoverContinuity(state, "builtin:eden");
    assert.ok(Math.abs(state.position - pausedPosition) < 0.01);
    await page.locator("#shelf").click();
    await waitForClosedBrowsingTable();
    state = await debug();

    const englishToyLabels = state.shelf.toys.map(({ label }) => label);
    await page.locator("#language").click();
    await page.locator('[data-locale="es"]').click();
    await waitShelf(
      () =>
        window.libraryDebug?.().state.language === "es" &&
        window.libraryDebug?.().state.page === 1 &&
        window.libraryDebug?.().shelf.browsing === true &&
        window.libraryDebug?.().shelf.busy === false &&
        window.libraryDebug?.().scene.mode === "room",
    );
    await page.locator("#enter").click();
    state = await debug();
    assert.notDeepEqual(
      state.shelf.toys.map(({ label }) => label),
      englishToyLabels,
      "browsing language change should refresh toy labels",
    );
    await page.locator("#shelf").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.browsing === false &&
        window.libraryDebug?.().shelf.busy === false &&
        window.libraryDebug?.().state.language === "es" &&
        window.libraryDebug?.().state.page === 1 &&
        window.libraryDebug?.().scene.mode === "spread",
    );
    await page.locator("#shelf").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.browsing === true &&
        window.libraryDebug?.().shelf.busy === false,
    );

    await selectBook("builtin:noah");
    await page.locator("#shelf-return").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.inspected === null &&
        window.libraryDebug?.().shelf.busy === false,
    );
    await waitForClosedBrowsingTable();
    state = await debug();
    assert.equal(state.shelf.table, "builtin:eden");
    assert.equal(state.state.book, "eden");
    assert.equal(state.state.page, 1);
    assertCanonicalShelfPose(state, "builtin:eden");
    assertCanonicalShelfPose(state, "builtin:noah");
    assert.deepEqual(
      state.shelf.toys.map(({ id }) => id),
      ["adam", "eve", "garden-tree"],
    );

    await selectBook("builtin:noah", true);
    await readSelected("builtin:noah", true);
    await waitForOpenTablePose();
    state = await debug();
    assertSessionAgreement(state);
    assertTablePose(state);
    assert.equal(state.state.book, "noah");
    assertCoverContinuity(state, "builtin:noah");
    assert.equal(state.state.page, 0);
    assert.deepEqual(
      state.shelf.toys.map(({ id }) => id),
      ["noah", "ark", "dove"],
    );
    assert.equal(
      state.scene.shelf.books.find(({ key }) => key === "builtin:eden").state,
      "shelf",
    );
    assert.equal(
      state.scene.shelf.books.find(({ key }) => key === "builtin:noah").state,
      "table",
    );
    assertCanonicalShelfPose(state, "builtin:eden");
    assertCanonicalShelfPose(state, "builtin:noah");
    await waitForSettledSpread();
    await page.screenshot({
      path: path.join(output, "second-book-desktop.png"),
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await waitForSettledSpread();
    await page.screenshot({ path: path.join(output, "second-book-phone.png") });
    await page.setViewportSize({ width: 1366, height: 768 });

    await page.locator("#shelf").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.browsing === true &&
        window.libraryDebug?.().shelf.busy === false,
    );
    await selectBook("builtin:eden");
    await readSelected("builtin:eden");
    await waitForOpenTablePose();
    state = await debug();
    assertSessionAgreement(state);
    assertTablePose(state);
    assert.equal(state.state.book, "eden");
    assert.equal(state.scene.shelf.tableKey, "builtin:eden");
    return {
      table: state.shelf.table,
      page: state.state.page,
      toys: state.shelf.toys.map(({ id }) => id),
    };
  },
);

await check("Busy lock rejects rapid shelf taps", async () => {
  await enter();
  const immediate = await page.evaluate(() => {
    document.querySelector('[data-shelf-key="builtin:eden"]')?.click();
    const state = window.libraryDebug?.();
    const locked = {
      busy: state?.shelf.busy,
      settingsDisabled: document.querySelector("#settings")?.disabled,
      languageDisabled: document.querySelector("#language")?.disabled,
    };
    document.querySelector('[data-shelf-key="builtin:noah"]')?.click();
    return locked;
  });
  assert.deepEqual(immediate, {
    busy: true,
    settingsDisabled: true,
    languageDisabled: true,
  });
  await waitShelf(() => window.libraryDebug?.().shelf.busy === false);
  const state = await debug();
  assert.equal(state.shelf.inspected, "builtin:eden");
  assert.equal(state.scene.shelf.previewKey, "builtin:eden");
  await page.locator("#shelf-return").click();
  await waitShelf(() => window.libraryDebug?.().shelf.busy === false);
  return { inspected: state.shelf.inspected, headerLocked: true };
});

await check(
  "Reduced motion and narrow room controls remain usable",
  async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await enter(); // Motion preference is read when the scene is constructed.
    const spine = page.locator('[data-shelf-key="builtin:eden"]');
    await spine.focus();
    await page.keyboard.press("Enter");
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.inspected === "builtin:eden" &&
        !window.libraryDebug?.().shelf.busy,
    );
    assert.equal(
      await page
        .locator("#shelf-read")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    const controls = page.locator(".shelf-preview");
    await controls.waitFor({ state: "visible" });
    const bounds = await controls.boundingBox();
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390.5);
    assert.equal(await page.locator("#shelf-read").isVisible(), true);
    assert.equal(await page.locator("#shelf-return").isVisible(), true);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 2,
      ),
      true,
    );
    assert.equal((await debug()).scene.shelf.moving, false);
    await page.screenshot({ path: path.join(output, "room-phone.png") });
    await page.keyboard.press("Escape");
    await waitShelf(() => window.libraryDebug?.().shelf.busy === false);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    return { width: 390, controlsVisible: true, horizontalOverflow: false };
  },
);

await check(
  "Committed catalog ignores and preserves stale browser authoring storage",
  async () => {
    await enter();
    assert.deepEqual(
      (await debug()).shelf.books.map(({ key }) => key),
      committedKeys,
    );
    assert.equal(
      await page
        .locator("#author,#author-dialog,[data-author-tab],#author-file")
        .count(),
      0,
    );
    const staleBook = bookFixture("jonah-and-the-whale");
    await page.evaluate(async (book) => {
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open("little-light-author-books", 1);
        request.onupgradeneeded = () => {
          request.result.createObjectStore("books", { keyPath: "key" });
          request.result.createObjectStore("settings");
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(
          ["books", "settings"],
          "readwrite",
        );
        transaction.objectStore("books").put({
          key: "included-fixture-book",
          updatedAt: 1,
          book: { ...book, title: "Stale browser-only title" },
        });
        transaction
          .objectStore("settings")
          .put(["included-fixture-book", "missing-book"], "room-shelf-v1");
        transaction.oncomplete = resolve;
        transaction.onerror = transaction.onabort = () =>
          reject(transaction.error);
      });
      database.close();
    }, staleBook);
    // Fail immediately if runtime starts depending on author storage again.
    await page.addInitScript(() => {
      indexedDB.open = () => {
        throw Error("Runtime attempted to open authoring storage");
      };
      indexedDB.deleteDatabase = () => {
        throw Error("Runtime attempted to erase authoring storage");
      };
    });
    await enter();
    const state = await debug();
    assert.deepEqual(
      state.shelf.books.map(({ key }) => key),
      committedKeys,
    );
    assert.equal(
      state.shelf.books.find(({ key }) => key === "book:jonah-and-the-whale")
        .title,
      staleBook.title,
    );
    // Inspect through a separate document so the runtime guard remains installed.
    const inspector = await context.newPage();
    try {
      await inspector.goto(url + "books/catalog.json");
      const saved = await inspector.evaluate(async () => {
        const database = await new Promise((resolve, reject) => {
          const request = indexedDB.open("little-light-author-books", 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const transaction = database.transaction(
          ["books", "settings"],
          "readonly",
        );
        const read = (request) =>
          new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        const [book, keys] = await Promise.all([
          read(transaction.objectStore("books").get("included-fixture-book")),
          read(transaction.objectStore("settings").get("room-shelf-v1")),
        ]);
        database.close();
        return { title: book.book.title, keys };
      });
      assert.deepEqual(saved, {
        title: "Stale browser-only title",
        keys: ["included-fixture-book", "missing-book"],
      });
    } finally {
      await inspector.close();
    }
    await page.screenshot({ path: path.join(output, "committed-catalog.png") });
    return {
      keys: committedKeys,
      staleDraftPreserved: true,
      runtimeStorageAccess: false,
    };
  },
);

await check(
  "Committed Jonah and disposable narrated fixture retain navigation and interactions",
  async () => {
    await installFixture();
    await enter();
    for (const id of ["fixture-book", "jonah-and-the-whale"]) {
      const book = bookFixture(id);
      await selectBook("book:" + id);
      await readSelected("book:" + id);
      await waitForOpenTablePose();
      const opened = await debug();
      assertTablePose(opened);
      if (id === "jonah-and-the-whale")
        assertCoverContinuity(opened, `book:${id}`);
      for (const [index, spread] of book.spreads.entries()) {
        await page.waitForFunction(
          (pageNumber) =>
            window.libraryDebug?.().state.page === pageNumber &&
            (window.libraryDebug?.().ready ||
              document.querySelector("#play")?.disabled),
          index,
        );
        assert.equal(
          await page.locator(".reader h1").textContent(),
          spread.title,
        );
        assert.deepEqual(
          await page.locator(".story-text [data-segment]").allTextContents(),
          spread.segments.map(({ text }) => text),
        );
        assert.equal(await page.locator("#previous").isDisabled(), index === 0);
        assert.equal(
          await page.locator("#next").isDisabled(),
          index === book.spreads.length - 1,
          "Next is disabled on the last page instead of changing its action",
        );
        assert.equal(await page.locator(".reader-controls button").count(), 3);
        assert.equal(await page.locator("#replay").count(), 0);
        for (const element of spread.elements.filter(
          ({ interaction }) => interaction,
        )) {
          await page.locator(`[data-element="${element.id}"]`).focus();
          await page.keyboard.press("Enter");
          assert.equal(
            await page.locator("#notice").textContent(),
            element.interaction.response,
          );
        }
        if (id === "fixture-book" && index === 0) {
          const play = page.locator("#play");
          await play.focus();
          if (!(await debug()).playing) await page.keyboard.press("Enter");
          await page.waitForFunction(
            () =>
              window.libraryDebug?.().playing &&
              window.libraryDebug?.().position > 0.15,
          );
          assert.equal(
            await play.locator(".transport-label").textContent(),
            "Pause",
          );
          await page.keyboard.press("Enter");
          await page.waitForFunction(() => !window.libraryDebug?.().playing);
          assert.equal(
            await play.locator(".transport-label").textContent(),
            "Play",
          );
          await page.keyboard.press("Enter");
          await page.waitForFunction(() => window.libraryDebug?.().playing);
          await page.waitForFunction(
            () => {
              const playback = window.libraryDebug?.();
              const active = [
                ...document.querySelectorAll(
                  ".story-text [data-segment].active",
                ),
              ];
              return (
                playback?.playing &&
                playback.segment >= 0 &&
                active.length === 1 &&
                Number(active[0].dataset.segment) === playback.segment
              );
            },
            undefined,
            { timeout: 15_000 },
          );
          await page.locator("#play").click();
          const paused = (await debug()).position;
          await page.locator("#shelf").click();
          await waitForClosedBrowsingTable();
          await page.locator("#shelf").click();
          await waitForOpenTablePose();
          assert.equal((await debug()).playing, false);
          assert.ok(
            Math.abs((await debug()).position - paused) < 0.03,
            "Continue preserves paused narration",
          );
        }
        if (id === "jonah-and-the-whale") {
          assert.equal(
            await page.locator("#play").isDisabled(),
            false,
            "completed Jonah pages expose their recorded narration",
          );
        }
        if (index === 0) {
          await waitForSettledSpread();
          await page.screenshot({
            path: path.join(output, `${id}-reader.png`),
          });
          await page.setViewportSize({ width: 390, height: 844 });
          await waitForSettledSpread();
          await page.screenshot({
            path: path.join(output, `${id}-reader-phone.png`),
          });
          await page.setViewportSize({ width: 1366, height: 768 });
        }
        if (index < book.spreads.length - 1) {
          await page.locator("#next").click();
        }
      }
      await page.locator("#previous").click();
      await page.waitForFunction(
        (pageNumber) =>
          (window.libraryDebug?.().ready ||
            document.querySelector("#play")?.disabled) &&
          window.libraryDebug?.().state.page === pageNumber,
        book.spreads.length - 2,
      );
      await page.locator("#shelf").click();
      await waitForClosedBrowsingTable();
      if (id === "jonah-and-the-whale")
        assertCanonicalShelfPose(await debug(), `book:${id}`);
      if (id === "jonah-and-the-whale")
        assertCoverContinuity(await debug(), `book:${id}`);
    }
    await removeFixture();
    return {
      committedBooks: 1,
      fixtureBooks: 1,
      spreads:
        bookFixture("jonah-and-the-whale").spreads.length +
        readerFixture(root).spreads.length,
      fixtureNarration: true,
      jonahNarrationComplete: true,
    };
  },
);

await check(
  "Reader settings persist mute and volume and remain keyboard accessible",
  async () => {
    await enter();
    await page.locator("#settings").focus();
    await page.keyboard.press("Enter");
    await page.locator("#audio").uncheck();
    await page.locator("#volume").fill("0.35");
    await page.locator("#speed").selectOption("1.25");
    await page.locator("#settings-close").focus();
    await page.keyboard.press("Enter");
    await enter();
    const state = await debug();
    assert.equal(state.audio, false);
    assert.equal(state.volume, 0.35);
    assert.equal(state.speed, 1.25);
    await selectBook("builtin:eden");
    await readSelected("builtin:eden");
    if ((await debug()).playing) await page.locator("#play").click();
    await page.waitForFunction(() => !window.libraryDebug?.().playing);
    const previousStarts = await page.evaluate(
      () => window.readerAudioProbe().length,
    );
    await page.locator("#play").click();
    await page.waitForFunction(
      () =>
        window.libraryDebug?.().playing &&
        window.libraryDebug?.().position > 0.1,
    );
    assert.equal(
      (await debug()).audio,
      false,
      "Mute retains the narration clock",
    );
    const mutedSources = await page.evaluate(
      (offset) => window.readerAudioProbe().slice(offset),
      previousStarts,
    );
    assert.ok(
      mutedSources.length > 0,
      "Narration schedules decoded Web Audio sources",
    );
    assert.ok(
      mutedSources.every(({ gains }) => gains.some((value) => value === 0)),
      "Every scheduled source passes through a muted gain",
    );
    await page.locator("#play").click();
    await page.locator("#settings").click();
    await page.locator("#audio").check();
    await page.locator("#volume").fill("0.8");
    await page.locator("#speed").selectOption("1");
    await page.locator("#settings-close").click();
    return { persistedMute: true, persistedVolume: 0.35, keyboardDialog: true };
  },
);

await check(
  "Reader stays concise with global language access and a looping soundtrack",
  async () => {
    const book = bookFixture("fixture-book");
    book.languages = ["en-US", "fr"];
    const translation = sourceTranslation(book);
    translation.title = "Fixture French title";
    translation.spreads[0].title = "Fixture translated page";
    book.translations = { fr: translation };
    book.soundtracks = [
      {
        id: "fixture-bed",
        label: "Disposable soundtrack fixture",
        asset: "cue-1-1",
        startPage: book.spreads[0].id,
        endPage: book.spreads.at(-1).id,
        startOffset: 0,
        endOffset: 0,
        volume: 0.15,
        fadeIn: 0.1,
        fadeOut: 0.1,
        loop: true,
      },
    ];
    await installFixture(book);
    try {
      await page.setViewportSize({ width: 390, height: 844 });
      await enter();
      await selectBook("book:fixture-book");
      await readSelected("book:fixture-book");
      await waitForSettledSpread();
      assert.equal(await page.locator("#language").count(), 1);
      assert.equal(
        await page.locator("#language").getAttribute("aria-label"),
        "Language",
      );
      assert.equal(
        await page.locator(".reader h1").textContent(),
        book.spreads[0].title,
      );
      assert.equal(
        await page.locator(".reader-meta").textContent(),
        `Page 1 of ${book.spreads.length}`,
      );
      assert.equal(await page.locator(".reader-footer small").count(), 0);
      assert.equal(
        await page
          .locator(".book-note, .book-context, .reader-book-language")
          .count(),
        0,
      );
      assert.equal(await page.locator(".reader-controls button").count(), 3);
      assert.equal(await page.locator("#replay").count(), 0);
      const controlWidths = await page
        .locator(".reader-controls button")
        .evaluateAll((buttons) =>
          buttons.map((button) => button.getBoundingClientRect().width),
        );
      assert.ok(Math.max(...controlWidths) - Math.min(...controlWidths) < 1);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 2,
        ),
        true,
      );
      // Audio now starts after the fold, so let the scheduled fade finish.
      await page.waitForFunction(
        () =>
          window.libraryDebug?.().playing &&
          window.libraryDebug?.().position > 0.15,
      );
      const audio = await page.evaluate(() => window.readerAudioProbe());
      assert.ok(
        audio.some(
          ({ loop, duration, gainSchedule }) =>
            loop &&
            duration > 1 &&
            gainSchedule.some(
              ({ events }) =>
                events.some(
                  ({ method, value }) =>
                    method === "setValueAtTime" && value === 0,
                ) &&
                events.some(
                  ({ method, value }) =>
                    method === "linearRampToValueAtTime" &&
                    Math.abs(value - 0.15) < 0.01,
                ),
            ),
        ),
        "Fixture soundtrack schedules a decoded looping source at its authored gain",
      );
      await page.screenshot({
        path: path.join(output, "fixture-reader-phone.png"),
      });
      if ((await debug()).playing) await page.locator("#play").click();
      await page.waitForFunction(() => !window.libraryDebug?.().playing);
      for (const language of [
        "en-US",
        "en-GB",
        "es",
        "fr",
        "hi",
        "it",
        "ja",
        "pt-BR",
        "zh-CN",
      ]) {
        if ((await debug()).state.language !== language) {
          await page.locator("#language").click();
          await page.locator(`[data-locale="${language}"]`).click();
          await page.waitForFunction(
            (id) =>
              window.libraryDebug?.().state.language === id &&
              window.libraryDebug?.().ready,
            language,
          );
          await page.locator("#enter").click();
        }
        const ui = JSON.parse(
          fs.readFileSync(path.join(root, `content/${language}.json`), "utf8"),
        ).ui;
        assert.deepEqual(
          await page
            .locator(".reader-controls .transport-label")
            .allTextContents(),
          [ui.previous, ui.play, ui.next],
          `${language} transport text is visible and localized`,
        );
        assert.deepEqual(
          await page
            .locator(".reader-controls button")
            .evaluateAll((buttons) =>
              buttons.map((button) => button.getAttribute("aria-label")),
            ),
          [ui.previous, ui.play, ui.next],
          `${language} transport actions have localized accessible names`,
        );
        const controlMetrics = await page
          .locator(".reader-controls button")
          .evaluateAll((buttons) =>
            buttons.map((button) => {
              const rect = button.getBoundingClientRect();
              const label = button.querySelector(".transport-label");
              return {
                x: rect.x,
                right: rect.right,
                width: rect.width,
                height: rect.height,
                labelWidth: label?.clientWidth ?? 0,
                labelScrollWidth: label?.scrollWidth ?? 0,
                weight: Number(getComputedStyle(label).fontWeight),
              };
            }),
          );
        assert.ok(
          Math.max(...controlMetrics.map(({ width }) => width)) -
            Math.min(...controlMetrics.map(({ width }) => width)) <
            1,
          `${language} transport buttons have equal width`,
        );
        assert.ok(
          controlMetrics.every(
            ({ x, right, height, labelWidth, labelScrollWidth, weight }) =>
              x >= 0 &&
              right <= 390.5 &&
              height >= 44 &&
              labelScrollWidth <= labelWidth + 1 &&
              weight >= 700,
          ),
          `${language} labels fit the phone controls and use bold text`,
        );
        if ((await debug()).playing) await page.locator("#play").click();
        await page.waitForFunction(() => !window.libraryDebug?.().playing);
        assert.equal(
          await page.locator("#play .transport-label").textContent(),
          ui.play,
        );
        await page.locator("#play").click();
        await page.waitForFunction(() => window.libraryDebug?.().playing);
        assert.equal(
          await page.locator("#play .transport-label").textContent(),
          ui.pause,
        );
        assert.equal(
          await page.locator("#play").getAttribute("aria-pressed"),
          "true",
        );
        await page.locator("#play").click();
        await page.waitForFunction(() => !window.libraryDebug?.().playing);
      }
      if ((await debug()).state.language !== "en-US") {
        await page.locator("#language").click();
        await page.locator('[data-locale="en-US"]').click();
        await page.waitForFunction(
          () =>
            window.libraryDebug?.().state.language === "en-US" &&
            window.libraryDebug?.().ready,
        );
        await page.locator("#enter").click();
      }
      return {
        fixtureOnly: true,
        conciseReader: true,
        globalLanguageSwitch: true,
        equalControls: true,
        decodedSoundtrackLoop: true,
      };
    } finally {
      await removeFixture();
      await page.setViewportSize({ width: 1366, height: 768 });
    }
  },
);

await check(
  "Thirty spine-out books and top toys fit at desktop and phone sizes",
  async () => {
    const denseBook = bookFixture("fixture-book");
    denseBook.toys = [
      {
        id: "little-tree",
        label: "Little tree",
        asset: "prop",
        animation: "pulse",
        sound: "cue-1-1",
      },
    ];
    const fixtureEntries = Array.from({ length: 28 }, (_, index) => {
      const id = `dense-${String(index + 1).padStart(2, "0")}`;
      return { id, path: id + ".book.json" };
    });
    await page.route("**/books/catalog.json", (route) =>
      route.fulfill({
        json: [
          { id: "eden", legacyStory: "eden" },
          { id: "noah", legacyStory: "noah" },
          ...fixtureEntries,
        ],
      }),
    );
    await page.route("**/books/dense-*.book.json", (route) => {
      const id = new URL(route.request().url()).pathname
        .split("/")
        .pop()
        .replace(".book.json", "");
      return route.fulfill({
        json: { ...denseBook, id, title: "Garden volume " + id },
      });
    });

    await enter();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.books.length === 30 &&
        window.libraryDebug?.().scene.shelf.books.length === 30,
    );
    let state = await debug();
    assert.equal(state.scene.shelf.max, 30);
    assert.equal(state.scene.shelf.endStops.length, 0);
    assert.equal(await page.locator("[data-shelf-key]:visible").count(), 30);
    state.scene.shelf.books.forEach(({ rotation }, index) => {
      assert.ok(Math.abs(rotation[0]) < 1e-6, `book ${index} rotation x`);
      assert.ok(
        Math.abs(rotation[1] - Math.PI / 2) < 1e-6,
        `book ${index} spine yaw`,
      );
      assert.ok(Math.abs(rotation[2]) < 1e-6, `book ${index} rotation z`);
    });
    assert.deepEqual(
      [...new Set(state.scene.shelf.books.map(({ position }) => position[1]))],
      [3.7, 1.98],
    );
    for (const key of [
      "builtin:eden",
      "builtin:noah",
      "book:dense-13",
      "book:dense-14",
      "book:dense-15",
      "book:dense-28",
    ]) {
      await selectBook(key);
      assert.equal((await debug()).shelf.inspected, key);
      await page.locator("#shelf-return").click();
      await waitShelf(
        () =>
          window.libraryDebug?.().shelf.inspected === null &&
          window.libraryDebug?.().shelf.busy === false,
      );
    }
    await page.screenshot({ path: path.join(output, "dense-30-desktop.png") });

    await selectBook("builtin:eden");
    await readSelected("builtin:eden");
    await page.locator("#shelf").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.browsing === true &&
        window.libraryDebug?.().shelf.busy === false,
    );
    await waitForClosedBrowsingTable();
    state = await debug();
    assert.deepEqual(
      state.scene.shelfToys.map(({ id }) => id),
      ["adam", "eve", "garden-tree"],
    );
    assert.ok(
      state.scene.shelfToys.every(({ position }) => position[1] === 4.78),
    );
    await assertToyTargetsInView();
    await page.screenshot({
      path: path.join(output, "dense-toys-desktop.png"),
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await enter();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.books.length === 30 &&
        window.libraryDebug?.().scene.shelf.books.length === 30,
    );
    assert.equal(await page.locator("[data-shelf-key]:visible").count(), 30);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 2,
      ),
      true,
    );
    await page.screenshot({ path: path.join(output, "dense-30-phone.png") });
    await selectBook("builtin:eden");
    await readSelected("builtin:eden");
    await page.locator("#shelf").click();
    await waitShelf(
      () =>
        window.libraryDebug?.().shelf.browsing === true &&
        window.libraryDebug?.().shelf.busy === false,
    );
    await waitForClosedBrowsingTable();
    await assertToyTargetsInView();
    await page.screenshot({ path: path.join(output, "dense-toys-phone.png") });
    await page.setViewportSize({ width: 1366, height: 768 });
    await selectBook("book:dense-28");
    await readSelected("book:dense-28");
    await waitForOpenTablePose();
    assertTablePose(await debug());
    assert.deepEqual((await debug()).shelf.toys, [
      { id: "little-tree", label: "Little tree" },
    ]);
    await page.locator("#shelf").click();
    await waitForClosedBrowsingTable();
    await page.locator('[data-toy-id="little-tree"]').click();
    await page.waitForFunction(
      () => window.libraryDebug?.().shelf.toyAudioPlaying === true,
    );
    await page.unroute("**/books/catalog.json");
    await page.unroute("**/books/dense-*.book.json");
    await enter();
    assert.deepEqual(
      (await debug()).shelf.books.map(({ key }) => key),
      committedKeys,
    );
    return {
      books: 30,
      rows: 2,
      toys: 3,
      desktopAndPhone: true,
      fixtureOnly: true,
      genericToyAudio: true,
    };
  },
);

await check(
  "Nested static runtime loads local resources without generation services",
  async () => {
    assert.deepEqual(results.unexpectedRequests, []);
    assert.deepEqual(results.failedResponses, []);
    assert.deepEqual(results.requestFailures, []);
    assert.ok(
      results.audioRequests.length > 0,
      "Existing narration must load from the production build",
    );
    return {
      nestedPath: prefix,
      audioResources: new Set(results.audioRequests).size,
      allRequestsWithinStaticBuild: true,
    };
  },
);

await context.close();
await browser.close();
await new Promise((resolve) => server.close(resolve));
results.passed =
  results.checks.every(({ passed }) => passed) && !results.pageErrors.length;
fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results, null, 2));
if (!results.passed) process.exitCode = 1;
