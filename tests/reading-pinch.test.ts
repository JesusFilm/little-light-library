import assert from "node:assert/strict";
import test from "node:test";
import { ReadingPinch, type PinchView } from "../src/reading-pinch";
const view: PinchView = {
  x: 0,
  y: 0,
  zoom: 1,
  worldPerPixel: 0.01,
  centerX: 200,
  centerY: 200,
};
const near = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9);

test("pinch follows the finger distance and preserves its focal point", () => {
  const pinch = new ReadingPinch();
  pinch.down(1, 200, 150, view);
  pinch.down(2, 300, 150, view);
  const moved = pinch.move(2, 400, 150)!;
  assert.equal(moved.zoom, 2);
  // The original midpoint corresponds to world (0.5, 0.5).
  near(moved.x + (300 - view.centerX) * 0.005, 0.5);
  near(moved.y - (150 - view.centerY) * 0.005, 0.5);
});

test("zoom bounds respond immediately when the gesture reverses", () => {
  const pinch = new ReadingPinch();
  pinch.down(1, 100, 200, view);
  pinch.down(2, 200, 200, view);
  assert.equal(pinch.move(2, 1000, 200)!.zoom, 2.5);
  near(pinch.move(2, 820, 200)!.zoom, 2);
  assert.equal(pinch.move(2, 110, 200)!.zoom, 1);
  near(pinch.move(2, 120, 200)!.zoom, 2);
});

test("pinch releases are consumed and retain the surviving finger for pan", () => {
  const pinch = new ReadingPinch();
  pinch.down(1, 100, 200, view);
  pinch.down(2, 200, 200, view);
  const first = pinch.up(1, view);
  assert.equal(first.consumed, true);
  assert.equal(first.remaining?.id, 2);
  assert.equal(pinch.active, false);
  assert.equal(pinch.up(2, view).consumed, true);
  pinch.down(3, 100, 200, view);
  assert.equal(pinch.up(3, view).consumed, false);
});

test("third fingers suspend zoom and releasing one resumes from the current view", () => {
  const pinch = new ReadingPinch();
  pinch.down(1, 100, 200, view);
  pinch.down(2, 200, 200, view);
  pinch.down(3, 300, 200, view);
  assert.equal(pinch.move(1, 80, 200), undefined);
  pinch.up(3, { ...view, zoom: 2 });
  assert.equal(pinch.move(2, 200, 200)!.zoom, 2);
  pinch.clear();
  assert.equal(pinch.move(2, 400, 200), undefined);
  assert.deepEqual(pinch.ids, []);
});

test("coincident touch points stay finite and cannot escape zoom bounds", () => {
  const pinch = new ReadingPinch();
  pinch.down(1, 100, 200, view);
  pinch.down(2, 100, 200, view);
  const result = pinch.move(2, 400, 200)!;
  assert.equal(result.zoom, 2.5);
  assert.ok(Number.isFinite(result.x) && Number.isFinite(result.y));
});
