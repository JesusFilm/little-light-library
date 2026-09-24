import assert from "node:assert/strict";
import test from "node:test";
import { alphaBounds } from "../src/alpha-bounds";
import {
  alphaTrimmedPlane,
  mirroredScaleX,
  visibleBottomAnchorY,
} from "../src/stage-prop-geometry";

test("alpha-trimmed standees preserve visible source ratio and bottom anchoring", () => {
  const width = 6;
  const height = 5;
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 1; y <= 3; y++)
    for (let x = 2; x <= 4; x++) rgba[(y * width + x) * 4 + 3] = 255;

  const bounds = alphaBounds(width, height, rgba);
  assert.deepEqual(bounds, { minX: 2, maxX: 4, minY: 1, maxY: 3 });
  const plane = alphaTrimmedPlane(2.4, bounds!);
  assert.equal(plane.width, 2.4);
  assert.equal(
    plane.height,
    2.4,
    "geometry uses the visible 1:1 painted region",
  );

  const lift = 0.18;
  const centerY = visibleBottomAnchorY(plane.height, lift);
  assert.ok(Math.abs(centerY - plane.height / 2 - lift) < 1e-12);
  assert.ok(
    Math.abs(centerY + plane.height / 2 - (plane.height + lift)) < 1e-12,
  );
});

test("atlas alpha bounds stay inside the selected cell", () => {
  const width = 8;
  const height = 4;
  const rgba = new Uint8Array(width * height * 4);
  rgba[(1 * width + 1) * 4 + 3] = 255;
  rgba[(2 * width + 6) * 4 + 3] = 255;
  assert.deepEqual(alphaBounds(width, height, rgba, { xStart: 4, xEnd: 8 }), {
    minX: 6,
    maxX: 6,
    minY: 2,
    maxY: 2,
  });
});

test("mirroring changes direction while keeping the authored width", () => {
  assert.equal(mirroredScaleX(1.25, true), -1.25);
  assert.equal(mirroredScaleX(-1.25, false), 1.25);
});
