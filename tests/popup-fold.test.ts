import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { popupActorsAtRest, popupFoldAngle } from "../src/popup-fold";
import { FOLD_LAYER_GAP } from "../src/popup-fold-surface";
import { stageDirections } from "../src/stage-direction";
import { bookPose } from "../src/choreography";

function panel(
  x: number,
  y: number,
  layer: number,
  width: number,
  height: number,
  open: number,
) {
  const matrix = new THREE.Matrix4().makeRotationX(popupFoldAngle(open));
  matrix.setPosition(x, y, 0.075 + layer * FOLD_LAYER_GAP * (1 - open));
  return [
    [-width / 2, 0, 0],
    [width / 2, 0, 0],
    [width / 2, height, 0],
    [-width / 2, height, 0],
  ].map((p) => new THREE.Vector3(...p).applyMatrix4(matrix));
}
test("no actor panel straddles the backdrop plane anywhere in the shared folding path", () => {
  const casts = Object.values(stageDirections).map((direction) => [
    ...direction.actors.map((actor) => ({
      x: actor.x,
      y: actor.depth,
      width: 1.4,
      height: 1.95,
    })),
    ...(direction.family
      ? [{ x: 0.75, y: -0.05, width: 3.25, height: 2.5 }]
      : []),
  ]);
  for (let step = 0; step <= 1000; step++) {
    const open = step / 1000;
    const back = panel(0, 1.22, 0, 5.8, 2.7, open);
    const plane = new THREE.Plane().setFromCoplanarPoints(
      back[0],
      back[1],
      back[2],
    );
    for (const cast of casts)
      for (const [i, actor] of cast.entries()) {
        const vertices = panel(
          actor.x,
          actor.y,
          i + 1,
          actor.width,
          actor.height,
          open,
        );
        const distances = vertices.map((v) => plane.distanceToPoint(v));
        assert.ok(vertices.every((v) => v.toArray().every(Number.isFinite)));
        const min = Math.min(...distances),
          max = Math.max(...distances);
        assert.ok(
          !(min < -1e-9 && max > 1e-9),
          "a rear plane must never slice across an actor's body",
        );
        assert.ok(
          max - min < 1e-9,
          "the entire printed actor remains parallel, including its head and feet",
        );
        if (open >= 0.04)
          assert.ok(
            min > 0.05,
            "standing/intermediate actor sheets have positive rear-plane clearance",
          );
        if (open === 0)
          assert.ok(Math.abs(min) > 0, "flat paper layers remain distinct");
      }
  }
  // Positive flat layer offsets change ordering extremely close to flat. This
  // test intentionally does not claim infinite positive normal clearance there:
  // sheets can be coplanar at the ordering swap, but cannot cross a torso obliquely.
});
test("forward fold preserves authored upright positions and original page-clearance timing", () => {
  assert.equal(popupFoldAngle(0), Math.PI);
  assert.equal(popupFoldAngle(1), Math.PI / 2);
  const [foot, , head] = panel(0.8, -0.25, 2, 1.2, 1.95, 1);
  assert.ok(Math.abs(foot.y + 0.25) < 1e-12);
  assert.ok(Math.abs(foot.z - 0.075) < 1e-12);
  assert.ok(Math.abs(head.z - 2.025) < 1e-12);
  for (let ms = 0; ms <= 2100; ms += 5) {
    const pose = bookPose(ms / 1000, false);
    if (ms < 600) assert.equal(popupFoldAngle(pose.popups), Math.PI);
  }
  assert.equal(popupFoldAngle(bookPose(1.1, false).popups), Math.PI / 2);
  assert.equal(popupFoldAngle(bookPose(2.1, true).popups), Math.PI / 2);
});
test("paper acting stays flat during collapse/erection and resumes at the upright endpoint", () => {
  for (let i = 0; i < 100; i++)
    assert.equal(popupActorsAtRest(i / 100, false), true);
  assert.equal(popupActorsAtRest(1, false), false);
  assert.equal(popupActorsAtRest(1, true), true);
});
