import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { foldedPrintFrame } from "../src/folded-print-frame";
import { foldedStagePose } from "../src/folded-stage-pose";

test("live folded points coincide with the shared print projection at reveal", () => {
  const frame = foldedPrintFrame(
    new THREE.Box3(
      new THREE.Vector3(-2.9, -1.48, 0),
      new THREE.Vector3(2.9, 2.35, 0),
    ),
  );
  const pose = foldedStagePose(frame, 0);
  for (const [x, y] of [
    [0, 0],
    [-2.9, -1.48],
    [2.4, 2.3],
    [0.75, -0.05],
  ]) {
    const printedX =
      ((x - frame.left) / (frame.right - frame.left)) * 6.04 - 3.02;
    const printedY =
      ((y - frame.bottom) / (frame.top - frame.bottom)) * 3.43 - 1.715;
    assert.ok(Math.abs(0.075 * pose.scale + pose.z - 0.075) < 1e-10);
    assert.ok(Math.abs(x * pose.scale - printedX) < 1e-10);
    assert.ok(Math.abs(y * pose.scale + pose.y - printedY) < 1e-10);
  }
});
test("unfolding restores the unchanged upright composition continuously without overshoot", () => {
  const frame = { scale: 0.84, centerY: 0.28 };
  let previous = frame.scale;
  for (let i = 0; i <= 100; i++) {
    const pose = foldedStagePose(frame, i / 100);
    assert.ok(pose.scale >= previous && pose.scale <= 1);
    assert.ok(pose.y >= -frame.centerY * frame.scale && pose.y <= 0);
    previous = pose.scale;
  }
  assert.deepEqual(foldedStagePose(frame, 1), { scale: 1, y: 0, z: 0 });
  assert.deepEqual(foldedStagePose(undefined, 0), { scale: 1, y: 0, z: 0 });
});
