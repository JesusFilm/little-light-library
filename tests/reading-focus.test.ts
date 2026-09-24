import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  ReadingFocus,
  readingFocusTarget,
  constrainReadingFocus,
} from "../src/reading-focus";

test("reading focus is finite, restrained for phone, returns exactly, and never compounds on repeated activation", () => {
  const camera = new THREE.Vector3(2.5, 9, 14),
    look = new THREE.Vector3(0, 2.45, 0.4);
  const actor = new THREE.Vector3(1, 2.8, 0.4);
  const normal = readingFocusTarget(camera, look, actor, false);
  const phone = readingFocusTarget(camera, look, actor, true);
  assert.ok(phone.camera.length() < normal.camera.length());
  assert.ok(phone.camera.length() < camera.distanceTo(look) * 0.06);
  assert.ok(phone.look.length() < 0.3);
  const focus = new ReadingFocus();
  focus.start(0, phone);
  assert.equal(focus.sample(0).amount, 0);
  assert.ok(focus.sample(0.7).amount > 0.99);
  for (let i = 0; i < 100; i++) {
    const sample = focus.sample(i / 40);
    for (const value of [...sample.camera, ...sample.look, sample.amount])
      assert.ok(Number.isFinite(value));
  }
  const settled = focus.sample(2.5);
  assert.deepEqual(settled.camera.toArray(), [0, 0, 0]);
  assert.deepEqual(settled.look.toArray(), [0, 0, 0]);
  focus.start(3, normal);
  const before = focus.sample(3.5);
  focus.start(3.5, phone);
  const after = focus.sample(3.5);
  assert.ok(
    before.camera.distanceTo(after.camera) < 1e-12,
    "rapid tap starts at current view without a jump",
  );
  for (let i = 0; i < 20; i++) {
    focus.start(4 + i * 0.1, phone);
    assert.ok(
      focus.sample(4 + i * 0.1).camera.length() <=
        normal.camera.length() + 1e-9,
    );
  }
  focus.clear();
  assert.equal(focus.sample(20).amount, 0);
  assert.deepEqual(camera.toArray(), [2.5, 9, 14]);
  assert.deepEqual(look.toArray(), [0, 2.45, 0.4]);
});

test("family spreads reserve opposite-edge clearance on phone without weakening ordinary or desktop focus", () => {
  const camera = new THREE.Vector3(2.5, 9, 14),
    look = new THREE.Vector3(0, 2.45, 0.4);
  for (const x of [-2, 2]) {
    const actor = new THREE.Vector3(x, 2.8, 0.4);
    const ordinary = readingFocusTarget(camera, look, actor, true);
    const family = readingFocusTarget(camera, look, actor, true, true);
    assert.equal(Math.abs(family.look.x), 0.08);
    assert.ok(Math.abs(family.look.x) < Math.abs(ordinary.look.x) / 2);
    assert.ok(family.camera.length() < ordinary.camera.length() * 0.7);
    assert.deepEqual(
      readingFocusTarget(camera, look, actor, false, true),
      readingFocusTarget(camera, look, actor, false),
    );
  }
});

test("projected family bounds retain both tight screen edges at every response strength", () => {
  for (const aspect of [0.45, 1.7]) {
    const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 70);
    camera.position.set(0, 2, 10);
    const look = new THREE.Vector3(0, 2, 0);
    camera.lookAt(look);
    camera.updateMatrixWorld(true);
    const points = [
      new THREE.Vector3(-0.97, -0.3, 0.9),
      new THREE.Vector3(0.98, 0.4, 0.9),
    ].map((p) => p.unproject(camera));
    const target = readingFocusTarget(
      camera.position,
      look,
      new THREE.Vector3(-2, 2, 0),
      aspect < 0.8,
      true,
    );
    const guarded = constrainReadingFocus(camera, look, target, points);
    assert.ok(guarded.scale < 1, "the unsafe full response is reduced");
    for (const amount of [0, 0.25, 0.5, 1]) {
      const view = camera.clone();
      view.position.addScaledVector(guarded.camera, amount);
      view.lookAt(look.clone().addScaledVector(guarded.look, amount));
      view.updateMatrixWorld(true);
      for (const point of points) {
        const base = point.clone().project(camera),
          p = point.clone().project(view);
        assert.ok(
          p.x >= Math.min(-0.94, base.x) - 2e-7 &&
            p.x <= Math.max(0.94, base.x) + 2e-7,
        );
      }
    }
  }
});
