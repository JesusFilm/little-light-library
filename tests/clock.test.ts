import { test } from "node:test";
import assert from "node:assert/strict";
import { PlaybackClock } from "../src/clock.ts";
test("clock uses measured segment boundaries across all speeds without cumulative drift", () => {
  for (const speed of [0.75, 1, 1.25, 1.5]) {
    let now = 100;
    const c = new PlaybackClock(() => now);
    c.load([1.37, 2.91, 0.83]);
    c.setSpeed(speed);
    c.play();
    now += 1.38 / speed;
    assert.equal(c.segment, 1);
    assert.ok(Math.abs(c.position - 1.38) < 1e-9);
    c.pause();
    now += 80;
    assert.ok(Math.abs(c.position - 1.38) < 1e-9);
    c.play();
    now += 2.91 / speed;
    assert.equal(c.segment, 2);
    assert.ok(Math.abs(c.position - 4.29) < 1e-9);
  }
});
test("rate changes preserve cursor, Play restarts an ended page, ending never advances", () => {
  let now = 0;
  const c = new PlaybackClock(() => now);
  c.load([2, 3]);
  c.play();
  now = 1;
  c.setSpeed(1.5);
  now = 2;
  assert.equal(c.position, 2.5);
  c.pause();
  now = 9;
  assert.equal(c.position, 2.5);
  c.replay();
  assert.equal(c.position, 0);
  now = 20;
  assert.equal(c.position, 5);
  assert.equal(c.ended, true);
  c.play();
  assert.equal(c.position, 0);
  assert.equal(c.playing, true);
  now = 21;
  assert.equal(c.position, 1.5);
  c.load([4]);
  assert.equal(c.position, 0);
  assert.equal(c.playing, false);
});
