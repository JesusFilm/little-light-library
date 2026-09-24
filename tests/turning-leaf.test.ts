import assert from "node:assert/strict";
import test from "node:test";
import { leafSection, pageTurnDirection } from "../src/turning-leaf";

test("flexible leaf keeps its spine fixed, preserves paper length, and stays above the book", () => {
  const width = 3.02,
    segments = 48;
  for (const direction of ["forward", "backward"] as const) {
    for (let step = 0; step <= 100; step++) {
      const section = leafSection(width, segments, step / 100, direction);
      assert.deepEqual(section.points[0], { x: 0, z: 0 });
      let length = 0;
      for (let i = 0; i < section.points.length; i++) {
        const { x, z } = section.points[i];
        assert.ok(Number.isFinite(x) && Number.isFinite(z));
        const worldHeight =
          -Math.sin(section.angle) * x + Math.cos(section.angle) * z;
        assert.ok(
          worldHeight >= -1e-10,
          "paper may not cut below its support plane",
        );
        assert.ok(Math.hypot(x, z) <= width + 1e-10);
        if (i)
          length += Math.hypot(
            x - section.points[i - 1].x,
            z - section.points[i - 1].z,
          );
      }
      assert.ok(
        Math.abs(length - width) < 1e-10,
        "bending must not stretch the paper",
      );
    }
  }
});

test("Next turns right to left; Previous follows the mirrored left-to-right path", () => {
  const forwardStart = leafSection(3, 48, 0, "forward"),
    forwardEnd = leafSection(3, 48, 1, "forward");
  const reverseStart = leafSection(3, 48, 0, "backward"),
    reverseEnd = leafSection(3, 48, 1, "backward");
  const side = (s: ReturnType<typeof leafSection>) =>
    Math.cos(s.angle) * s.points.at(-1)!.x +
    Math.sin(s.angle) * s.points.at(-1)!.z;
  assert.ok(side(forwardStart) > 2.99 && side(forwardEnd) < -2.99);
  assert.ok(side(reverseStart) < -2.99 && side(reverseEnd) > 2.99);
  for (const p of [0.15, 0.4, 0.65, 0.85]) {
    const f = leafSection(3, 48, p, "forward"),
      b = leafSection(3, 48, p, "backward");
    assert.ok(Math.abs(side(f) + side(b)) < 1e-10);
    assert.ok(
      Math.abs(f.curvature) > 0.1,
      "intermediate leaf must visibly bend",
    );
  }
});

test("only navigation to an earlier page in the same story reverses the leaf", () => {
  const previous = { story: "eden", index: 3 };
  assert.equal(
    pageTurnDirection(previous, { story: "eden", index: 2 }),
    "backward",
  );
  assert.equal(
    pageTurnDirection(previous, { story: "eden", index: 4 }),
    "forward",
  );
  assert.equal(
    pageTurnDirection(previous, { story: "eden", index: 3 }),
    "forward",
  );
  assert.equal(
    pageTurnDirection(previous, { story: "noah", index: 0 }),
    "forward",
  );
  assert.equal(
    pageTurnDirection(undefined, { story: "eden", index: 0 }),
    "forward",
  );
});
