import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  visiblePaintHit,
  footPivot,
  updateFigureTilts,
} from "../src/room-interaction";

test("shelf picking rejects transparent art and hidden fallback geometry", () => {
  const map = new THREE.Texture();
  map.userData.hitMask = {
    width: 2,
    height: 2,
    alpha: new Uint8Array([0, 255, 0, 255]),
  };
  const material = new THREE.MeshBasicMaterial({ map });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material);
  const parent = new THREE.Group();
  parent.add(mesh);
  const hit = (x: number) =>
    ({
      object: mesh,
      distance: 1,
      point: new THREE.Vector3(),
      uv: new THREE.Vector2(x, 0.5),
    }) as THREE.Intersection;
  assert.equal(visiblePaintHit(hit(0.1)), false);
  assert.equal(visiblePaintHit(hit(0.9)), true);
  mesh.visible = false;
  assert.equal(visiblePaintHit(hit(0.9)), false);
  mesh.visible = true;
  parent.visible = false;
  assert.equal(visiblePaintHit(hit(0.9)), false);
  parent.visible = true;
  material.visible = false;
  assert.equal(visiblePaintHit(hit(0.9)), false);
  material.visible = true;
  map.repeat.x = 0.5;
  assert.equal(
    visiblePaintHit(hit(0.9)),
    false,
    "texture transform applies before alpha lookup",
  );
});

test("rapid selection restores the old figure exactly and keeps bases and feet anchored", () => {
  const figures = new Map<string, THREE.Group>();
  for (const id of ["adam", "eve"]) {
    const group = new THREE.Group();
    group.position.set(1, 2.99, -2.95);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    const body = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 1.02),
      new THREE.MeshBasicMaterial(),
    );
    body.position.y = 0.575;
    group.add(base, body);
    const before = body.getWorldPosition(new THREE.Vector3());
    const pivot = footPivot(group, [body], 0.065);
    assert.ok(
      body.getWorldPosition(new THREE.Vector3()).distanceTo(before) < 1e-12,
    );
    const planted = pivot.getWorldPosition(new THREE.Vector3());
    figures.set(id, group);
    for (let t = 0; t <= 0.8; t += 0.01) {
      updateFigureTilts(figures, id, t, false);
      assert.ok(
        pivot.getWorldPosition(new THREE.Vector3()).distanceTo(planted) < 1e-12,
      );
      assert.equal(base.rotation.z, 0);
      assert.equal(group.rotation.z, 0);
    }
  }
  updateFigureTilts(figures, "adam", 0.4, false);
  assert.ok(
    figures.get("adam")!.getObjectByName("figurine-foot-pivot")!.rotation.z <
      -0.1,
  );
  updateFigureTilts(figures, "eve", 0.4, false);
  assert.equal(
    figures.get("adam")!.getObjectByName("figurine-foot-pivot")!.rotation.z,
    0,
  );
  updateFigureTilts(figures, "eve", 0.4, true);
  assert.equal(
    figures.get("eve")!.getObjectByName("figurine-foot-pivot")!.rotation.z,
    0,
  );
  updateFigureTilts(figures, "eve", 0.8, false);
  assert.equal(
    figures.get("eve")!.getObjectByName("figurine-foot-pivot")!.rotation.z,
    0,
  );
});
