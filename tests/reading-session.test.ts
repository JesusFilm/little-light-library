import { test } from "node:test";
import assert from "node:assert/strict";
import { ReadingSession } from "../src/reading-session";

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

test("opening, switching, Library and Continue keep the session place and toys together", async () => {
  const pending = deferred();
  let book: string | null = null;
  let page = 0;
  let toys: string[] = [];
  let paused = false;
  let tableScene: string | null = null;
  let roomView = true;
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
      reading: () => ({ book, page, toys }),
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
  );

  await session.inspect(entries[0]);
  assert.equal(await session.openInspected(), true);
  assert.deepEqual(
    { ...session.snapshot.reading, table: session.snapshot.table },
    { book: "eden", page: 0, toys: ["adam", "eve"], table: "builtin:eden" },
  );
  assert.equal(roomView, false);
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
    { book: "noah", page: 0, toys: ["ark", "dove"], table: "builtin:noah" },
  );
  assert.equal(tableScene, "builtin:noah");
});
