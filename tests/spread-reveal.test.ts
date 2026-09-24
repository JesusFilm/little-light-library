import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { spreadReveal } from "../src/spread-reveal";
import { LeafPrintStore } from "../src/leaf-print";
import { createTurningLeaf } from "../src/turning-leaf";

test("loading never exposes a partial stage, including opening and reduced motion", () => {
  for (const opening of [true, false])
    for (const reduced of [true, false])
      for (const age of [0, 0.2, 1, 30]) {
        const state = spreadReveal(true, age, opening, reduced, true, false);
        assert.equal(state.stage, false);
        assert.equal(state.waitingPaper, true);
        assert.equal(state.stationarySource, false);
        assert.equal(state.destinationPaper, false);
        assert.equal(
          spreadReveal(true, age, opening, reduced, false, false).waitingPaper,
          false,
        );
      }
});
test("stationary old and new halves coexist only until leaf clearance, then complete popups reveal", () => {
  for (let ms = 0; ms < 580; ms += 5)
    assert.deepEqual(spreadReveal(false, ms / 1000, false, false, true, true), {
      stage: false,
      waitingPaper: false,
      stationarySource: true,
      destinationPaper: true,
    });
  assert.deepEqual(spreadReveal(false, 0.58, false, false, true, true), {
    stage: true,
    waitingPaper: false,
    stationarySource: false,
    destinationPaper: false,
  });
  assert.equal(spreadReveal(false, 0, false, true, false, false).stage, true);
  for (const age of [0, 0.85, 1, 1.54])
    assert.equal(
      spreadReveal(false, age, true, false, false, false).stage,
      false,
    );
  assert.equal(
    spreadReveal(false, 1.55, true, false, false, false).stage,
    true,
  );
});
test("front and back sample the correct full-spread halves without changing shared GPU textures", () => {
  const material = new THREE.MeshStandardMaterial(),
    leaf = createTurningLeaf(3.02, 3.43, material);
  const source = new THREE.Texture(),
    destination = new THREE.Texture();
  let disposed = 0;
  source.addEventListener("dispose", () => disposed++);
  destination.addEventListener("dispose", () => disposed++);
  const [front, back] = leaf.mesh.material;
  for (const direction of ["forward", "backward"] as const) {
    leaf.setSpreadPrint(source, destination, direction);
    assert.equal(front.map, direction === "forward" ? source : destination);
    assert.equal(back.map, direction === "forward" ? destination : source);
    assert.deepEqual(front.userData.printUvCrop.toArray(), [0.5, 0.5]);
    assert.deepEqual(back.userData.printUvCrop.toArray(), [-0.5, 0.5]);
    assert.deepEqual(source.repeat.toArray(), [1, 1]);
    assert.deepEqual(destination.offset.toArray(), [0, 0]);
  }
  leaf.setSpreadPrint(null, null, "forward");
  front.dispose();
  back.dispose();
  leaf.mesh.geometry.dispose();
  material.dispose();
  assert.equal(
    disposed,
    0,
    "material sampling views do not own shared target textures",
  );
  source.dispose();
  destination.dispose();
});
test("a completed snapshot transfers into the next outgoing slot without double disposal or identity drift", () => {
  const outgoing = new LeafPrintStore<{ dispose(): void }>(),
    incoming = new LeafPrintStore<{ dispose(): void }>();
  let old = 0,
    current = 0,
    next = 0;
  outgoing.replace(
    {
      dispose() {
        old++;
      },
    },
    { story: "noah", index: 1 },
    "forward",
  );
  incoming.replace(
    {
      dispose() {
        current++;
      },
    },
    { story: "noah", index: 2 },
    "forward",
  );
  const completed = incoming.take()!;
  outgoing.replace(completed.resource, completed.page, "backward");
  assert.equal(old, 1);
  assert.equal(current, 0);
  assert.equal(incoming.resource, undefined);
  assert.deepEqual(outgoing.page, { story: "noah", index: 2 });
  // A superseded partial load does not replace this source or invent a new identity.
  incoming.clear();
  assert.deepEqual(outgoing.page, { story: "noah", index: 2 });
  incoming.replace(
    {
      dispose() {
        next++;
      },
    },
    { story: "noah", index: 1 },
    "backward",
  );
  assert.equal(
    Number(Boolean(outgoing.resource)) + Number(Boolean(incoming.resource)),
    2,
  );
  outgoing.clear();
  incoming.clear();
  outgoing.clear();
  incoming.clear();
  assert.deepEqual([old, current, next], [1, 1, 1]);
});
