import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createGardenFloor } from "../src/garden-floor";

test("garden print preserves paper margins and gutter with a single continuous image projection", () => {
  const texture = new THREE.Texture();
  const floor = createGardenFloor(texture);
  assert.equal(floor.userData.staticPageSurface, true);
  assert.equal(floor.rotation.x, 0);
  assert.equal(floor.position.z, 0.045);
  assert.ok(floor.position.z < 0.075, "floor remains below the popup hinges");
  assert.equal(floor.children.length, 2);
  for (const [index, object] of floor.children.entries()) {
    const mesh = object as THREE.Mesh;
    const p = mesh.geometry.getAttribute("position"),
      uv = mesh.geometry.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      assert.ok(Math.abs(x) <= 2.860001 && Math.abs(y) <= 1.500001);
      assert.ok(index === 0 ? x <= -0.044999 : x >= 0.044999);
      assert.equal(p.getZ(i), 0);
      assert.ok(Math.abs(uv.getX(i) - (x + 2.86) / 5.72) < 1e-6);
      assert.ok(Math.abs(uv.getY(i) - (y / 3 + 0.5)) < 1e-6);
    }
  }
  assert.deepEqual(texture.offset.toArray(), [0, 0]);
  assert.deepEqual(
    texture.repeat.toArray(),
    [1, 1],
    "both pages use UVs without mutating the shared map",
  );
});

test("garden geometry/material release never disposes its borrowed shared texture", () => {
  const texture = new THREE.Texture();
  const floor = createGardenFloor(texture);
  let mapDisposals = 0;
  texture.addEventListener("dispose", () => mapDisposals++);
  const materials = new Set<THREE.Material>();
  for (const object of floor.children) {
    const mesh = object as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >;
    assert.equal(mesh.material.map, texture);
    assert.equal(mesh.material.depthWrite, false);
    assert.ok(
      mesh.material.transparent && mesh.receiveShadow && !mesh.castShadow,
    );
    materials.add(mesh.material);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  assert.equal(
    materials.size,
    2,
    "stage traversal owns two distinct materials",
  );
  assert.equal(mapDisposals, 0);
  texture.dispose();
  assert.equal(mapDisposals, 1, "caller releases one shared map");
});
