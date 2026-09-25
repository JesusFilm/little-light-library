import { test } from "node:test";
import assert from "node:assert/strict";
import { ReadingSession } from "../src/reading-session";
import type { LocaleData, LocaleId } from "../src/contracts";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}

test("shelf inspection and return expose a single busy snapshot and reject overlapping actions", async () => {
  const moving = deferred();
  const calls: string[] = [];
  const failures: unknown[] = [];
  const session = new ReadingSession(
    {
      async inspectShelfBook(key) {
        calls.push(`inspect:${key}`);
        await moving.promise;
      },
      async returnShelfPreview() {
        calls.push("return");
      },
    },
    () => calls.push("pause"),
    () => {},
    (error) => failures.push(error),
  );
  const eden = { key: "builtin:eden", title: "Adam, Eve, and the Garden" };
  const noah = { key: "builtin:noah", title: "Noah and the Great Flood" };

  const inspection = session.inspect(eden);
  assert.equal(session.snapshot.busy, true);
  assert.equal(await session.inspect(noah), false);
  assert.equal(await session.returnInspected(), false);
  await Promise.resolve();
  assert.equal(session.snapshot.inspected?.key, eden.key);
  moving.resolve();
  assert.equal(await inspection, true);
  assert.deepEqual(failures, []);
  assert.deepEqual(calls, ["pause", "return", `inspect:${eden.key}`]);
  assert.equal(session.snapshot.busy, false);
  assert.equal(await session.returnInspected(), true);
  assert.equal(session.snapshot.inspected, null);
  assert.equal(session.snapshot.status, "");
  assert.equal(await session.inspect(noah), true);
  assert.deepEqual(session.snapshot.inspected, noah);
});

test("failed shelf inspection restores the shelf and releases the busy state", async () => {
  const failures: unknown[] = [];
  let returns = 0;
  const session = new ReadingSession(
    {
      async inspectShelfBook() {
        throw Error("missing cover");
      },
      async returnShelfPreview() {
        returns++;
      },
    },
    () => {},
    () => {},
    (error) => failures.push(error),
  );

  assert.equal(await session.inspect({ key: "builtin:eden" }), false);
  assert.equal(returns, 2);
  assert.equal(session.snapshot.inspected, null);
  assert.equal(session.snapshot.busy, false);
  assert.match(String(failures[0]), /missing cover/);
});

test("the first page's slow media load does not lock turning or Library", async () => {
  const firstPage = deferred();
  const renderStarted = deferred();
  let book: string | null = null;
  let page = 0;
  let renders = 0;
  let cancellations = 0;
  const autoplayChecks: (() => boolean)[] = [];
  const session: ReadingSession<{ key: string }> = new ReadingSession(
    {
      async inspectShelfBook() {},
      async returnShelfPreview() {},
    },
    () => {},
    () => {},
    (error) => {
      throw error;
    },
    {
      reading: () => ({ book, page, pageCount: 3, toys: [] }),
      validate() {},
      stop() {},
      async clearToys() {},
      async closeBook() {},
      async landBook() {},
      activateBook() {
        book = "jonah-and-the-whale";
        page = 0;
      },
      showFirstPage: (): Promise<void> => session.loadPage(true),
      async loadToys() {},
      async suspendPage() {},
      async prepareLibrary() {},
      async resumePage() {},
    },
    {
      cancel() {
        cancellations++;
      },
      commitTurn(target) {
        page = target;
      },
      async render({ shouldAutoplay }) {
        renders++;
        autoplayChecks.push(shouldAutoplay);
        if (renders === 1) {
          renderStarted.resolve();
          await firstPage.promise;
        }
      },
    },
    {
      snapshot: () => ({
        playing: false,
        position: 0,
        speed: 1,
        audio: true,
        volume: 1,
      }),
      async play() {
        return true;
      },
      pause() {},
      setSpeed() {},
      setAudio() {},
      setVolume() {},
      visibility() {},
    },
  );
  await session.inspect({ key: "book:jonah-and-the-whale" });
  const opening = session.openInspected();
  await renderStarted.promise;
  await Promise.resolve();
  assert.equal(
    session.snapshot.busy,
    false,
    "reader controls unlock while media loads",
  );
  assert.equal(session.snapshot.loading, true);
  assert.equal(autoplayChecks[0](), true);
  assert.equal(await session.togglePlayback(() => true), true);
  assert.equal(autoplayChecks[0](), false, "Pause cancels queued autoplay");
  assert.equal(await session.togglePlayback(() => true), true);
  assert.equal(autoplayChecks[0](), true, "Play restores queued autoplay");
  assert.equal(
    await session.turnPage(1),
    true,
    "Next accepts the tap immediately",
  );
  assert.equal(page, 1);
  assert.equal(renders, 2);
  assert.equal(
    autoplayChecks[0](),
    false,
    "superseded pages cannot start audio",
  );
  assert.equal(autoplayChecks[1](), true);
  assert.ok(cancellations > 0);
  assert.equal(
    await session.browseLibrary(),
    true,
    "Library does not wait on old media",
  );
  assert.equal(session.snapshot.browsing, true);
  assert.equal(autoplayChecks[1](), false, "Library cancels queued autoplay");
  firstPage.resolve();
  await opening;
});

test("opening, switching, Library and Continue keep the session place and toys together", async () => {
  const pending = deferred();
  let book: string | null = null;
  let page = 0;
  let toys: string[] = [];
  let paused = false;
  let tableScene: string | null = null;
  let roomView = true;
  const turning = deferred();
  let committedPage: number | null = null;
  let mediaPlaying = false;
  let rejectPlay = false;
  let speed = 1;
  const entries = [
    { key: "builtin:eden", id: "eden" },
    { key: "builtin:noah", id: "noah" },
  ];
  const session = new ReadingSession<{ key: string; id: string }>(
    {
      async inspectShelfBook() {},
      async returnShelfPreview() {},
    },
    () => {},
    () => {},
    (error) => {
      throw error;
    },
    {
      reading: () => ({ book, page, pageCount: 8, toys }),
      validate: () => {},
      stop: () => {
        paused = true;
      },
      async clearToys() {
        toys = [];
      },
      async closeBook() {
        tableScene = null;
        book = null;
      },
      async landBook(entry) {
        tableScene = entry.key;
      },
      activateBook(entry) {
        book = entry.id;
        page = 0;
      },
      async showFirstPage() {
        roomView = false;
      },
      async loadToys() {
        toys = book === "eden" ? ["adam", "eve"] : ["ark", "dove"];
      },
      async suspendPage() {
        paused = true;
        await pending.promise;
      },
      async prepareLibrary() {
        roomView = true;
      },
      async resumePage() {
        roomView = false;
      },
    },
    {
      cancel() {},
      commitTurn(target) {
        page = target;
      },
      async render({ current }) {
        await turning.promise;
        if (current()) committedPage = page;
      },
    },
    {
      snapshot: () => ({
        playing: mediaPlaying,
        position: 0,
        speed,
        audio: true,
        volume: 0.8,
      }),
      async play() {
        if (rejectPlay) throw Error("audio device unavailable");
        mediaPlaying = true;
        return true;
      },
      pause() {
        mediaPlaying = false;
      },
      setSpeed(value) {
        speed = value;
      },
      setAudio() {},
      setVolume() {},
      visibility(hidden) {
        if (hidden) mediaPlaying = false;
      },
    },
  );

  await session.inspect(entries[0]);
  assert.equal(await session.openInspected(), true);
  assert.deepEqual(
    { ...session.snapshot.reading, table: session.snapshot.table },
    {
      book: "eden",
      page: 0,
      pageCount: 8,
      toys: ["adam", "eve"],
      table: "builtin:eden",
    },
  );
  assert.equal(roomView, false);
  assert.equal(await session.turnPage(-1), false);
  const turn = session.turnPage(1);
  assert.equal(session.snapshot.reading.page, 1);
  assert.equal(session.snapshot.loading, true);
  const secondTurn = session.turnPage(1);
  assert.equal(session.snapshot.reading.page, 2);
  session.invalidatePage();
  turning.resolve();
  assert.equal(await turn, true);
  assert.equal(await secondTurn, true);
  assert.equal(committedPage, null);
  assert.equal(session.snapshot.loading, false);
  session.setReady(true);
  assert.equal(await session.togglePlayback(() => true), true);
  assert.equal(session.snapshot.playback.playing, true);
  session.setSpeed(1.25);
  assert.equal(session.snapshot.playback.speed, 1.25);
  session.visibilityChanged(true);
  assert.equal(session.snapshot.playback.playing, false);
  rejectPlay = true;
  assert.equal(await session.togglePlayback(() => true), false);
  assert.equal(session.snapshot.failure, "narration");
  rejectPlay = false;
  session.reportFailure("artwork", () => true);
  assert.equal(session.snapshot.failure, "artwork");
  assert.equal(await session.retryMedia(), true);
  assert.equal(session.snapshot.failure, null);
  assert.equal(session.snapshot.playback.playing, false);
  page = 3;
  const library = session.browseLibrary();
  assert.equal(session.snapshot.busy, true);
  assert.equal(await session.continueReading(), false);
  pending.resolve();
  assert.equal(await library, true);
  assert.equal(session.snapshot.browsing, true);
  assert.equal(session.snapshot.reading.page, 3);
  assert.equal(paused, true);
  assert.equal(roomView, true);
  assert.equal(await session.continueReading(), true);
  assert.equal(session.snapshot.browsing, false);
  assert.equal(session.snapshot.reading.page, 3);
  assert.equal(roomView, false);

  await session.browseLibrary();
  await session.inspect(entries[1]);
  assert.equal(await session.openInspected(), true);
  assert.deepEqual(
    { ...session.snapshot.reading, table: session.snapshot.table },
    {
      book: "noah",
      page: 0,
      pageCount: 8,
      toys: ["ark", "dove"],
      table: "builtin:noah",
    },
  );
  assert.equal(tableScene, "builtin:noah");
});

test("language changes keep the reading place and only apply the latest fetched choice", async () => {
  let language: LocaleId = "en-US";
  let book: string | null = "eden";
  const page = 3;
  const first = deferred();
  const calls: string[] = [];
  let failRefresh = false;
  const session = new ReadingSession(
    {
      async inspectShelfBook() {},
      async returnShelfPreview() {},
    },
    () => {},
    () => {},
    () => {},
    {
      reading: () => ({ book, page, pageCount: 8, toys: [] }),
      validate() {},
      stop() {},
      async clearToys() {},
      async closeBook() {
        book = null;
      },
      async landBook() {},
      activateBook() {},
      async showFirstPage() {},
      async loadToys() {},
      async suspendPage() {},
      async prepareLibrary() {},
      async resumePage() {},
    },
    undefined,
    undefined,
    {
      current: () => language,
      async fetch(id) {
        if (id === "es") await first.promise;
        return {
          id,
          name: id,
          voice: "",
          ui: {},
          characters: { adam: "", eve: "", noah: "" },
          stories: [],
        } satisfies LocaleData;
      },
      pause: () => calls.push("pause"),
      commit(id) {
        language = id;
        calls.push(`commit:${id}`);
      },
      async refresh(reading) {
        calls.push(reading ? "reading" : "shelf");
        if (failRefresh) throw Error("shelf art failed");
      },
      async recover() {
        calls.push("recover:shelf");
      },
      error() {
        calls.push("error");
      },
    },
  );
  session.setBrowsing(false);
  const stale = session.changeLanguage("es");
  assert.equal(session.snapshot.busy, true);
  assert.equal(await session.changeLanguage("fr"), true);
  first.resolve();
  assert.equal(await stale, false);
  assert.equal(session.snapshot.language, "fr");
  assert.equal(session.snapshot.reading.page, 3);
  assert.equal(session.snapshot.busy, false);
  assert.deepEqual(calls, ["pause", "commit:fr", "reading"]);
  session.setBrowsing(true);
  assert.equal(await session.changeLanguage("ja"), true);
  assert.deepEqual(calls.slice(-3), ["pause", "commit:ja", "shelf"]);
  failRefresh = true;
  assert.equal(await session.changeLanguage("hi"), false);
  assert.equal(session.snapshot.browsing, true);
  assert.deepEqual(calls.slice(-4), [
    "commit:hi",
    "shelf",
    "recover:shelf",
    "error",
  ]);
});
