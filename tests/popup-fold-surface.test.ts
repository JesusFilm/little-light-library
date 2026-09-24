import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { popupFoldSurface, FOLD_LAYER_GAP } from "../src/popup-fold-surface";

test("flat paper layers separate without cumulative drift and restore their upright bases", () => {
  const groups = Array.from({ length: 6 }, () => {
    const group = new THREE.Group();
    group.position.z = 0.075;
    return group;
  });
  for (let repeat = 0; repeat < 10; repeat++) {
    groups.forEach((g, i) => popupFoldSurface(g, i, 0));
    assert.ok(groups.every((g) => g.scale.y === 1));
    for (let i = 1; i < groups.length; i++)
      assert.ok(
        Math.abs(
          groups[i].position.z - groups[i - 1].position.z - FOLD_LAYER_GAP,
        ) < 1e-10,
      );
    groups.forEach((g, i) => popupFoldSurface(g, i, 1));
    assert.ok(groups.every((g) => g.scale.y === 1));
    assert.ok(groups.every((g) => g.position.z === 0.075));
  }
});
test("folded supports and self shadows stay hidden, restoring only original upright shadow flags", () => {
  const group = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(1, 1),
    material = new THREE.MeshBasicMaterial();
  const actor = new THREE.Mesh(geometry, material),
    support = new THREE.Mesh(geometry, material),
    alternate = new THREE.Mesh(geometry, material);
  actor.castShadow = true;
  actor.receiveShadow = true;
  support.userData.foldSupport = true;
  alternate.visible = false;
  group.add(actor, support, alternate);
  for (let i = 0; i < 3; i++) {
    popupFoldSurface(group, 1, 0);
    assert.equal(actor.castShadow, false);
    assert.equal(actor.receiveShadow, false);
    assert.equal(support.visible, false);
    assert.equal(alternate.visible, false);
    popupFoldSurface(group, 1, 1);
    assert.equal(actor.castShadow, true);
    assert.equal(actor.receiveShadow, true);
    assert.equal(support.visible, true);
    assert.equal(support.castShadow, false);
    assert.equal(alternate.visible, false);
  }
  geometry.dispose();
  material.dispose();
});
