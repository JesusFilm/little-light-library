import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import {
  canCaptureOutgoing,
  captureFoldedPage,
  LeafPrintStore,
  printLayout,
} from "../src/leaf-print";
import { createTurningLeaf } from "../src/turning-leaf";

test("outgoing page identity requires a fully loaded matching stage", () => {
  assert.equal(
    canCaptureOutgoing(
      { story: "noah", index: 2 },
      { story: "noah", index: 2 },
    ),
    true,
  );
  assert.equal(
    canCaptureOutgoing({ story: "noah", index: 2 }, undefined),
    false,
  );
  assert.equal(
    canCaptureOutgoing(
      { story: "noah", index: 2 },
      { story: "noah", index: 1 },
    ),
    false,
  );
  assert.equal(
    canCaptureOutgoing(
      { story: "noah", index: 2 },
      { story: "eden", index: 2 },
    ),
    false,
  );
});
test("Next prints the outgoing right front; Previous prints the outgoing left back with reversed U", () => {
  assert.deepEqual(printLayout("forward"), {
    left: 0,
    right: 3.02,
    side: "front",
    flipU: false,
  });
  assert.deepEqual(printLayout("backward"), {
    left: -3.02,
    right: 0,
    side: "back",
    flipU: true,
  });
  const material = new THREE.MeshStandardMaterial();
  const leaf = createTurningLeaf(3.02, 3.43, material);
  const texture = new THREE.Texture();
  const [front, back] = leaf.mesh.material;
  leaf.setPrint(texture, "forward");
  assert.equal(front.map, texture);
  assert.equal(back.map, null);
  assert.deepEqual(front.userData.printUvCrop.toArray(), [1, 0]);
  leaf.setPrint(texture, "backward");
  assert.equal(back.map, texture);
  assert.equal(front.map, null);
  assert.deepEqual(back.userData.printUvCrop.toArray(), [-1, 1]);
  assert.equal(
    texture.repeat.x,
    1,
    "shared render-target texture transform stays unchanged",
  );
  // At the left resting pose, the spine maps to capture U=1 and outer edge to U=0.
  assert.equal(
    0 * back.userData.printUvCrop.x + back.userData.printUvCrop.y,
    1,
  );
  assert.equal(
    1 * back.userData.printUvCrop.x + back.userData.printUvCrop.y,
    0,
  );
  leaf.setPrint(null, "forward");
  assert.equal(front.map, null);
  assert.equal(back.map, null);
  leaf.mesh.geometry.dispose();
  front.dispose();
  back.dispose();
  material.dispose();
  texture.dispose();
});
test("print targets survive source identity changes and are released exactly once on replacement/exit", () => {
  const store = new LeafPrintStore<{ dispose(): void }>();
  let first = 0,
    second = 0;
  const source = { story: "eden", index: 1 };
  store.replace(
    {
      dispose() {
        first++;
      },
    },
    source,
    "forward",
  );
  source.index = 2;
  assert.deepEqual(store.page, { story: "eden", index: 1 });
  assert.equal(first, 0);
  store.replace(
    {
      dispose() {
        second++;
      },
    },
    { story: "eden", index: 2 },
    "backward",
  );
  assert.equal(first, 1);
  assert.equal(second, 0);
  store.clear();
  store.clear();
  assert.equal(first, 1);
  assert.equal(second, 1);
  assert.equal(store.resource, undefined);
  assert.equal(store.page, undefined);
});

test("a failed print capture restores renderer state and preserves borrowed source resources", () => {
  const source = new THREE.Group();
  const popup = new THREE.Group();
  popup.rotation.x = 0.8;
  popup.userData.foldStart = Math.PI;
  source.add(popup);
  const floor = new THREE.Group();
  floor.name = "printed-ground";
  floor.userData.staticPageSurface = true;
  floor.position.z = 0.045;
  source.add(floor);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const map = new THREE.Texture();
  const material = new THREE.MeshStandardMaterial({ map, visible: false });
  popup.add(new THREE.Mesh(geometry, material));
  const borrowedDisposals = { geometry: 0, map: 0, material: 0 };
  geometry.addEventListener("dispose", () => borrowedDisposals.geometry++);
  map.addEventListener("dispose", () => borrowedDisposals.map++);
  material.addEventListener("dispose", () => borrowedDisposals.material++);
  const originalTarget = new THREE.WebGLRenderTarget(8, 8);
  const originalViewport = new THREE.Vector4(13, 17, 800, 600);
  const originalScissor = new THREE.Vector4(23, 29, 320, 240);
  let target: THREE.WebGLRenderTarget | null = originalTarget;
  let viewport = originalViewport.clone();
  let scissor = originalScissor.clone();
  let scissorTest = true;
  let temporaryTargetDisposals = 0;
  let captureMaterialDisposals = 0;
  let renderCalls = 0;
  const failure = new Error("simulated offscreen rendering failure");
  const renderer = {
    toneMapping: THREE.ACESFilmicToneMapping,
    autoClear: false,
    getRenderTarget: () => target,
    getViewport: (out: THREE.Vector4) => out.copy(viewport),
    getScissor: (out: THREE.Vector4) => out.copy(scissor),
    getScissorTest: () => scissorTest,
    setRenderTarget(next: THREE.WebGLRenderTarget | null) {
      target = next;
      // Real target changes replace viewport state; exercise that restoration path.
      viewport.set(0, 0, next?.width || 0, next?.height || 0);
      scissor.set(0, 0, next?.width || 0, next?.height || 0);
      if (next && next !== originalTarget)
        next.addEventListener("dispose", () => temporaryTargetDisposals++);
    },
    setViewport(next: THREE.Vector4) {
      viewport.copy(next);
    },
    setScissor(next: THREE.Vector4) {
      scissor.copy(next);
    },
    setScissorTest(next: boolean) {
      scissorTest = next;
    },
    render(scene: THREE.Scene) {
      renderCalls++;
      assert.notEqual(target, originalTarget);
      assert.equal(this.toneMapping, THREE.NoToneMapping);
      assert.equal(this.autoClear, true);
      assert.equal(scissorTest, false);
      assert.equal(
        scene.getObjectByName("printed-ground")!.position.z,
        0.045,
        "printed ground stays below folded actors instead of receiving popup layer offsets",
      );
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const captured = object.material as THREE.MeshBasicMaterial;
        assert.notEqual(captured, material);
        assert.equal(captured.map, map);
        assert.equal(captured.visible, false);
        assert.equal(object.geometry, geometry);
        captured.addEventListener("dispose", () => captureMaterialDisposals++);
      });
      throw failure;
    },
  };
  assert.throws(
    () =>
      captureFoldedPage(
        renderer as unknown as THREE.WebGLRenderer,
        source,
        "backward",
      ),
    (error) => error === failure,
  );
  assert.equal(renderCalls, 1);
  assert.equal(target, originalTarget);
  assert.deepEqual(viewport.toArray(), originalViewport.toArray());
  assert.deepEqual(scissor.toArray(), originalScissor.toArray());
  assert.equal(scissorTest, true);
  assert.equal(renderer.toneMapping, THREE.ACESFilmicToneMapping);
  assert.equal(renderer.autoClear, false);
  assert.equal(temporaryTargetDisposals, 1);
  assert.equal(captureMaterialDisposals, 1);
  assert.deepEqual(borrowedDisposals, { geometry: 0, map: 0, material: 0 });
  assert.equal(
    popup.rotation.x,
    0.8,
    "folding the clone does not alter the live stage",
  );
  assert.equal(source.children[0], popup);
  geometry.dispose();
  material.dispose();
  map.dispose();
  originalTarget.dispose();
});
