import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createPaperCreature,
  type PaperCreatureKind,
} from "../src/paper-creature";

function fixture(kind: PaperCreatureKind) {
  const texture = new THREE.Texture();
  const [w, h, x, y, cw, ch] =
    kind === "serpent"
      ? [1024, 1536, 38, 11, 954, 1504]
      : [1254, 1254, 53, 37, 1166, 1148];
  texture.image = { width: w, height: h };
  texture.userData.aspect = cw / ch;
  texture.repeat.set(cw / w, ch / h);
  texture.offset.set(x / w, 1 - (y + ch) / h);
  const creature = createPaperCreature(kind, texture, 1.5);
  const positions = creature.mesh.geometry.getAttribute("position");
  const uv = creature.mesh.geometry.getAttribute("uv");
  const rest = Array.from(positions.array);
  const source = (i: number) => ({
    x: (texture.offset.x + uv.getX(i) * texture.repeat.x) * w,
    y: (1 - texture.offset.y - uv.getY(i) * texture.repeat.y) * h,
  });
  return { texture, creature, positions, rest, source };
}

test("serpent head moves locally while branch, leaves and lower coils stay fixed", () => {
  const f = fixture("serpent");
  f.creature.update(2, { reduced: false, folded: false });
  let headMotion = 0;
  for (let i = 0; i < f.positions.count; i++) {
    const { x, y } = f.source(i),
      d = Math.hypot(
        f.positions.getX(i) - f.rest[i * 3],
        f.positions.getY(i) - f.rest[i * 3 + 1],
      );
    if (x > 610 || y < 310 || y > 670) assert.equal(d, 0);
    if (x < 400 && y > 370 && y < 480) headMotion = Math.max(headMotion, d);
  }
  assert.ok(
    headMotion > 0.08,
    "head lean is measurable at the actual cropped scale",
  );
  assert.deepEqual(f.creature.mesh.position.toArray(), [0, 0, 0]);
  f.creature.dispose();
  f.texture.dispose();
});

test("dove wingbeats leave body, head, olive and tail exactly fixed", () => {
  const f = fixture("dove");
  for (const touch of [0, 1]) {
    f.creature.update(0.525, { reduced: false, folded: false, touch });
    let wingMotion = 0;
    for (let i = 0; i < f.positions.count; i++) {
      const { x, y } = f.source(i),
        d = Math.hypot(
          f.positions.getX(i) - f.rest[i * 3],
          f.positions.getY(i) - f.rest[i * 3 + 1],
          f.positions.getZ(i),
        );
      assert.ok(Number.isFinite(d));
      if (y > 850 || (x > 740 && y > 570)) assert.equal(d, 0);
      if (y < 400) wingMotion = Math.max(wingMotion, d);
    }
    assert.ok(
      wingMotion > 0.25 && wingMotion < 0.7,
      "stronger bounded wingbeat, including maximum touch",
    );
    assert.deepEqual(f.creature.mesh.position.toArray(), [0, 0, 0]);
  }
  f.creature.dispose();
  f.texture.dispose();
});

test("touch acts during idle pauses; folded and reduced restore geometry exactly with distinct material feedback", () => {
  for (const kind of ["serpent", "dove"] as const) {
    const f = fixture(kind);
    f.creature.update(6.2, { reduced: false, folded: false, touch: 1 });
    assert.ok(f.creature.mesh.userData.creatureDeformation > 0.04);
    for (const value of f.positions.array) assert.ok(Number.isFinite(value));
    f.creature.update(6.2, {
      reduced: true,
      folded: false,
      touch: 1,
      hover: true,
    });
    assert.deepEqual(Array.from(f.positions.array), f.rest);
    assert.ok(f.creature.mesh.material.emissiveIntensity > 0);
    f.creature.update(6.2, {
      reduced: false,
      folded: true,
      touch: 1,
      hover: true,
    });
    assert.deepEqual(Array.from(f.positions.array), f.rest);
    assert.equal(f.creature.mesh.material.emissiveIntensity, 0);
    let mapDisposals = 0,
      geometryDisposals = 0;
    f.texture.addEventListener("dispose", () => mapDisposals++);
    f.creature.mesh.geometry.addEventListener(
      "dispose",
      () => geometryDisposals++,
    );
    f.creature.dispose();
    f.creature.dispose();
    assert.equal(geometryDisposals, 1);
    assert.equal(mapDisposals, 0);
    f.texture.dispose();
  }
});
