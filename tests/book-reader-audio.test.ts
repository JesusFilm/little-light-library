import test from "node:test";
import assert from "node:assert/strict";
import { BookNarration } from "../src/book-reader-audio";
import { buildBookTimeline } from "../src/book-audio";

import { readerFixture as book } from "../scripts/reader-fixture";
const context = () =>
  ({
    currentTime: 0,
    destination: {},
    resume: async () => {},
    createGain: () => ({ gain: { value: 1 }, connect() {}, disconnect() {} }),
  }) as unknown as AudioContext;

test("reader reuses decoded audio between pages and reloads a changed language/book", async () => {
  const reader = new BookNarration(context()),
    first = book();
  let loads = 0;
  reader.player.load = async (value) => {
    loads++;
    reader.player.timeline = buildBookTimeline(value);
    return true;
  };
  await reader.loadBook(first, 0);
  reader.stop();
  await reader.loadBook(first, 1);
  assert.equal(loads, 1);
  assert.equal(reader.clock.position, 0);
  const second = structuredClone(first);
  second.locale = "es";
  reader.stop();
  await reader.loadBook(second, 0);
  assert.equal(loads, 2);
});
test("superseded reader loads cannot restore an old book or page", async () => {
  const reader = new BookNarration(context());
  let finish!: (value: boolean) => void;
  reader.player.load = async (value) => {
    reader.player.timeline = buildBookTimeline(value);
    return new Promise<boolean>((resolve) => {
      finish = resolve;
    });
  };
  const pending = reader.loadBook(book(), 1);
  reader.stop();
  finish(true);
  assert.equal(await pending, false);
  assert.equal(reader.narrationCurrent, false);
  assert.equal(reader.player.playing, false);
});
test("soundtrack-only transport does not report an audible narration segment", async () => {
  const reader = new BookNarration(context()),
    value = book();
  value.spreads[0].segments[0].text = "Changed words.";
  reader.player.load = async (value) => {
    reader.player.timeline = buildBookTimeline(value);
    return true;
  };
  await reader.loadBook(value, 0);
  await reader.play();
  assert.equal(reader.player.playing, true);
  assert.equal(reader.narrationCurrent, false);
  assert.equal(reader.narrationActive, false);
  assert.equal(reader.clock.segment, -1);
});
