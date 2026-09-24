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
