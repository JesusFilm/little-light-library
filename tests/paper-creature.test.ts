import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createPaperCreature } from "../src/paper-creature";

for (const kind of ["serpent", "dove"] as const) {
  test(`${kind} preserves printed geometry and aspect ratio throughout motion and touch`, () => {
    const texture = new THREE.Texture();
    texture.image = { width: 1024, height: 1536 };
    const creature = createPaperCreature(kind, texture, 1.5);
    creature.mesh.position.set(0.2, 1.6, 0.1);
    creature.mesh.scale.x = -1;
    const positions = creature.mesh.geometry.getAttribute("position");
    const rest = Array.from(positions.array);
    let moved = false;
    for (let t = 0; t < 12; t += 0.1) {
      creature.update(t, {
        reduced: false,
        folded: false,
        touch: Math.max(0, Math.sin(t)),
      });
      assert.deepEqual(
        Array.from(positions.array),
        rest,
        "No stretching of the illustration",
      );
      assert.equal(
        Math.abs(creature.mesh.scale.x),
        creature.mesh.scale.y,
        "Uniform scale preserves aspect and mirroring",
      );
      assert.deepEqual(creature.mesh.position.toArray(), [0.2, 1.6, 0.1]);
      moved ||= Math.abs(creature.mesh.rotation.y) > 0.01;
    }
    assert.ok(moved, "The rigid cutout still responds visibly");
    creature.update(2, { reduced: true, folded: false, touch: 1 });
    assert.equal(creature.mesh.rotation.y, 0);
    assert.deepEqual(creature.mesh.scale.toArray(), [-1, 1, 1]);
    assert.ok(creature.mesh.material.emissiveIntensity > 0);
    creature.update(2, { reduced: false, folded: true, touch: 1 });
    assert.equal(creature.mesh.material.emissiveIntensity, 0);
    let disposed = 0,
      mapDisposed = 0;
    creature.mesh.geometry.addEventListener("dispose", () => disposed++);
    texture.addEventListener("dispose", () => mapDisposed++);
    creature.dispose();
    creature.dispose();
    assert.equal(disposed, 1);
    assert.equal(mapDisposed, 0);
    texture.dispose();
  });
}
