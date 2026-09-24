import assert from "node:assert/strict";
import test from "node:test";
import {
  animationPresets,
  authoredMotionTransform,
} from "../src/book-animation";
import type { BookMotion } from "../src/authored-book";

const rest = { rotation: 0, x: 0, y: 0, scale: 1 };
for (const [preset] of animationPresets) {
  test(`${preset}: delayed once stops, loop repeats, and seeking does not accumulate`, () => {
    const motion: BookMotion = {
      preset,
      trigger: "open",
      duration: 2,
      strength: 10,
      delay: 1,
      loop: false,
      repeat: 3,
    };
    for (const time of [0, 0.9, 3, 10, Infinity, NaN])
      assert.deepEqual(authoredMotionTransform(motion, time), rest);
    const moving = authoredMotionTransform(motion, 1.5);
    assert.notDeepEqual(moving, rest);
    const looping = { ...motion, loop: true };
    assert.deepEqual(authoredMotionTransform(looping, 101.5), moving);
    assert.deepEqual(authoredMotionTransform(looping, 1.5), moving);
    assert.notDeepEqual(
      authoredMotionTransform({ ...motion, loop: undefined }, 3.5),
      rest,
    );
    assert.deepEqual(
      authoredMotionTransform({ ...motion, loop: undefined }, 7),
      rest,
    );
  });
}

test("motion units are degrees for rock, proportions for float/sway/pulse and a full turn for spin", () => {
  const base: BookMotion = {
    preset: "rock",
    trigger: "open",
    duration: 2,
    strength: 10,
  };
  assert.equal(authoredMotionTransform(base, 0.5).rotation, Math.PI / 18);
  assert.equal(authoredMotionTransform({ ...base, preset: "float" }, 1).y, 0.1);
  assert.equal(
    authoredMotionTransform({ ...base, preset: "sway" }, 0.5).x,
    0.1,
  );
  assert.equal(
    authoredMotionTransform({ ...base, preset: "pulse" }, 1).scale,
    1.1,
  );
  assert.equal(
    authoredMotionTransform({ ...base, preset: "spin" }, 1).rotation,
    Math.PI,
  );
});
