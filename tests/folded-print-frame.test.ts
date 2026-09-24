import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import {
  foldedPrintFrame,
  visibleFoldedBounds,
} from "../src/folded-print-frame";

test("folded figures extending past the paper remain whole within a single undistorted spread projection", () => {
  for (const bounds of [
    new THREE.Box3(
      new THREE.Vector3(-2.9, -1.48, 0),
      new THREE.Vector3(2.9, 2.2, 0.1),
    ),
    new THREE.Box3(
      new THREE.Vector3(-3.6, -2.4, 0),
      new THREE.Vector3(2.7, 3.8, 0.2),
    ),
    new THREE.Box3(new THREE.Vector3(-2, -1, 0), new THREE.Vector3(2, 1, 0.1)),
  ]) {
    const frame = foldedPrintFrame(bounds);
    assert.ok(frame.contained);
    assert.ok(bounds.min.x - frame.left >= frame.margin - 1e-10);
    assert.ok(frame.right - bounds.max.x >= frame.margin - 1e-10);
    assert.ok(bounds.min.y - frame.bottom >= frame.margin - 1e-10);
    assert.ok(frame.top - bounds.max.y >= frame.margin - 1e-10);
    assert.ok(
      Math.abs(
        (frame.right - frame.left) / (frame.top - frame.bottom) - 6.04 / 3.43,
      ) < 1e-10,
    );
    assert.equal(
      frame.left,
      -frame.right,
      "gutter stays exactly at shared texture U=.5",
    );
    assert.ok(frame.scale > 0 && frame.scale <= 1);
    assert.ok(
      [frame.left, frame.right, frame.top, frame.bottom].every(Number.isFinite),
    );
  }
});
test("bounds include current visible vertices and exclude hidden alternate geometry without mutating the live stage", () => {
  const root = new THREE.Group();
  const material = new THREE.MeshBasicMaterial();
  const geometry = new THREE.PlaneGeometry(2, 2);
  geometry.translate(0, 2, 0);
  const visible = new THREE.Mesh(geometry, material);
  root.add(visible);
  const hiddenGroup = new THREE.Group();
  hiddenGroup.visible = false;
  const oversized = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material);
  hiddenGroup.add(oversized);
  root.add(hiddenGroup);
  let geometryDisposed = 0;
  geometry.addEventListener("dispose", () => geometryDisposed++);
  geometry.computeBoundingBox();
  const positions = geometry.getAttribute("position");
  positions.setY(0, 4);
  const bounds = visibleFoldedBounds(root);
  assert.equal(
    bounds.max.y,
    4,
    "bounds track deformed vertices, not a stale cached box",
  );
  assert.equal(bounds.min.x, -1);
  assert.equal(bounds.max.x, 1);
  assert.equal(hiddenGroup.visible, false);
  assert.equal(positions.getY(0), 4);
  assert.equal(geometryDisposed, 0);
  geometry.dispose();
  oversized.geometry.dispose();
  material.dispose();
});
test("empty captures keep the original paper rectangle and do not invent a zoom", () => {
  const frame = foldedPrintFrame(new THREE.Box3());
  assert.equal(frame.left, -3.02);
  assert.equal(frame.right, 3.02);
  assert.equal(frame.top, 1.715);
  assert.equal(frame.bottom, -1.715);
  assert.equal(frame.scale, 1);
  assert.equal(frame.bounds, null);
});
