import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { tsImport } from "tsx/esm/api";

const root = path.resolve("dist");
const prefix = "/acceptance/little-light-library/";
assert.ok(
  fs.existsSync(path.join(root, "index.html")),
  "Build first with npm run build.",
);
const { readerFixture } = await tsImport(
  "./reader-fixture.ts",
  import.meta.url,
);
const makeTone = () => {
  const sampleRate = 8000;
  const frames = sampleRate / 4;
  const wav = Buffer.alloc(44 + frames * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(frames * 2, 40);
  for (let frame = 0; frame < frames; frame++)
    wav.writeInt16LE(
      Math.round(Math.sin((frame / sampleRate) * Math.PI * 440) * 900),
      44 + frame * 2,
    );
  return wav;
};
const tonePath = path.join(root, "assets/books/__audio-continuity.wav");
fs.mkdirSync(path.dirname(tonePath), { recursive: true });
fs.writeFileSync(tonePath, makeTone());
const book = readerFixture(root);
for (const spread of book.spreads) {
  spread.seconds = 1;
  spread.elements = spread.elements.filter((element) => !element.interaction);
  for (const segment of spread.segments) delete segment.narration;
}
book.spreads.push({
  ...book.spreads[1],
  id: "page-3",
  title: "Fixture page 3",
});
book.assets["continuity-bed"] = {
  kind: "audio",
  src: "assets/books/__audio-continuity.wav",
  attribution:
    "Generated one-quarter-second test tone for the browser transport check.",
};
book.soundtracks = [
  {
    id: "continuity-bed",
    label: "Continuity test bed",
    asset: "continuity-bed",
    startPage: book.spreads[0].id,
    endPage: book.spreads[1].id,
    startOffset: 0,
    endOffset: 0,
    volume: 0.08,
    fadeIn: 0.1,
    fadeOut: 0.2,
    loop: true,
  },
];
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "books/catalog.json"), "utf8"),
);
const testCatalog = [
  ...catalog.filter(({ id }) => id !== book.id),
  { id: book.id, path: `${book.id}.book.json` },
];
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
const origin = "http://little-light-library.test";
const url = `${origin}${prefix}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1024, height: 768 },
  reducedMotion: "reduce",
});
await context.route(`${origin}${prefix}**`, async (route) => {
  const requestUrl = new URL(route.request().url());
  if (requestUrl.pathname === `${prefix}books/catalog.json`) {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(testCatalog),
    });
    return;
  }
  if (requestUrl.pathname === `${prefix}books/${book.id}.book.json`) {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(book),
    });
    return;
  }
  const file = path.resolve(
    root,
    decodeURIComponent(requestUrl.pathname.slice(prefix.length)) ||
      "index.html",
  );
  if (!file.startsWith(root + path.sep)) {
    await route.fulfill({ status: 403 });
    return;
  }
  try {
    await route.fulfill({
      status: 200,
      contentType: mime[path.extname(file)] || "application/octet-stream",
      headers: { "Cache-Control": "no-store" },
      body: fs.readFileSync(file),
    });
  } catch {
    await route.fulfill({ status: 404 });
  }
});
const page = await context.newPage();
await page.addInitScript(() => {
  const sources = [];
  const stops = [];
  const originalStart = AudioBufferSourceNode.prototype.start;
  const originalStop = AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start = function (...args) {
    this.__readerAudioId ||= sources.length + 1;
    sources.push({
      id: this.__readerAudioId,
      source: this,
      loop: this.loop,
      duration: this.buffer?.duration,
    });
    return originalStart.apply(this, args);
  };
  AudioBufferSourceNode.prototype.stop = function (...args) {
    stops.push({
      id: this.__readerAudioId,
      when: args[0] ?? null,
      at: this.context.currentTime,
    });
    return originalStop.apply(this, args);
  };
  window.readerAudioTransportProbe = () => ({
    sources: sources.map(({ id, loop, duration }) => ({ id, loop, duration })),
    stops: [...stops],
  });
});

try {
  await page.goto(url);
  await page.locator('[data-locale="en-US"]').waitFor();
  await page.locator('[data-locale="en-US"]').click({ timeout: 5000 });
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.libraryDebug?.().ready);
  await page.locator(`[data-shelf-key="book:${book.id}"]`).click();
  await page.waitForFunction(() => window.libraryDebug?.().shelf.inspected);
  await page.locator("#shelf-read").click();
  await page.waitForFunction(
    () => window.libraryDebug?.().ready && window.libraryDebug?.().playing,
  );
  assert.equal(
    await page.locator(".reader h1").textContent(),
    "Fixture page 1",
  );
  assert.match(
    await page.locator(".reader-meta").textContent(),
    /^Page 1 of 3$/,
  );
  assert.equal(await page.locator(".reader-footer small").count(), 0);
  assert.equal(
    await page
      .locator(".book-note, .book-context, .reader-book-language")
      .count(),
    0,
    "reader metadata and the content-language selector are omitted",
  );
  assert.equal(await page.locator(".reader-controls button").count(), 3);
  assert.equal(await page.locator("#replay").count(), 0);
  assert.equal(await page.locator("#language").count(), 1);
  assert.equal(
    await page.locator(".authored-interactions").count(),
    0,
    "pages without interactive elements do not render an empty region",
  );

  const firstLoop = await page.evaluate(() =>
    window
      .readerAudioTransportProbe()
      .sources.filter(({ loop, duration }) => loop && duration === 0.25),
  );
  assert.equal(
    firstLoop.length,
    1,
    "the book starts one looping soundtrack source",
  );
  const sourceId = firstLoop[0].id;
  await page.waitForTimeout(1400);
  const lingerState = await page.evaluate(() => ({
    reader: window.libraryDebug(),
    audio: window.readerAudioTransportProbe(),
  }));
  assert.equal(
    lingerState.reader.state.page,
    0,
    "the reader stays on the first page after its clock ends",
  );
  assert.equal(
    lingerState.reader.playing,
    true,
    "the looping soundtrack remains active after page time ends",
  );
  assert.ok(lingerState.audio.sources.some(({ id }) => id === sourceId));
  assert.ok(!lingerState.audio.stops.some(({ id }) => id === sourceId));

  await page.locator("#next").click();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().ready && window.libraryDebug?.().state.page === 1,
  );
  const afterTurn = await page.evaluate(() =>
    window.readerAudioTransportProbe(),
  );
  assert.deepEqual(
    afterTurn.sources
      .filter(({ loop, duration }) => loop && duration === 0.25)
      .map(({ id }) => id),
    [sourceId],
    "the same Web Audio source spans the physical turn while the layer remains in range",
  );
  assert.ok(!afterTurn.stops.some(({ id }) => id === sourceId));

  await page.waitForTimeout(1400);
  const finalPageLinger = await page.evaluate(() => ({
    reader: window.libraryDebug(),
    audio: window.readerAudioTransportProbe(),
  }));
  assert.equal(
    finalPageLinger.reader.playing,
    true,
    "an untrimmed loop remains audible while a child lingers on the final included page",
  );
  assert.ok(!finalPageLinger.audio.stops.some(({ id }) => id === sourceId));

  await page.locator("#next").click();
  await page.waitForFunction(
    () =>
      window.libraryDebug?.().ready && window.libraryDebug?.().state.page === 2,
  );
  const leavingRange = await page.evaluate(() =>
    window.readerAudioTransportProbe(),
  );
  assert.ok(
    leavingRange.stops.some(
      ({ id, when, at }) => id === sourceId && when !== null && when > at,
    ),
    "leaving the authored page range schedules the outgoing bed fade",
  );

  await page.locator("#play").click();
  await page.waitForFunction(() => !window.libraryDebug?.().playing);
  const paused = await page.evaluate(() => window.readerAudioTransportProbe());
  assert.ok(
    paused.stops.some(({ id, when }) => id === sourceId && when === null),
  );
  console.log(JSON.stringify({ passed: true, loopSource: sourceId, pages: 3 }));
} finally {
  await context.close();
  await browser.close();
  fs.rmSync(tonePath, { force: true });
}
