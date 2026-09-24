import { test } from "node:test";
import assert from "node:assert/strict";
import { bookPose } from "../src/choreography";
test("paper figures remain folded until their moving leaf has cleared", () => {
  for (const opening of [true, false])
    for (let ms = 0; ms < 2400; ms += 5) {
      const p = bookPose(ms / 1000, opening);
      if (p.popups > 0)
        assert.ok(
          opening ? p.cover < 0.0001 : Math.abs(p.page + Math.PI) < 0.0001,
        );
      assert.ok(
        p.flight >= 0 && p.flight <= 1 && p.popups >= 0 && p.popups <= 1,
      );
    }
  assert.equal(bookPose(2.1, true).popups, 1);
  assert.equal(bookPose(1.1, false).popups, 1);
});
test("reduced motion presents a fully open, supported paper stage immediately", () => {
  assert.deepEqual(bookPose(0, true, true), {
    flight: 1,
    cover: 0,
    page: -Math.PI,
    popups: 1,
  });
});
