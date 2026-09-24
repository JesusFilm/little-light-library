import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { RetainedStage } from "../src/retained-stage";

test("retained stage keeps original resources alive while a hidden replacement is built", () => {
  const book = new THREE.Group(),
    source = new THREE.Group();
  book.add(source);
  source.position.set(1, 2, 3);
  const geometry = new THREE.PlaneGeometry(1, 2);
  const texture = new THREE.Texture();
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const actor = new THREE.Mesh(geometry, material);
  source.add(actor);
  source.visible = false;
  const disposed = { geometry: 0, material: 0, texture: 0 };
  geometry.addEventListener("dispose", () => disposed.geometry++);
  material.addEventListener("dispose", () => disposed.material++);
  texture.addEventListener("dispose", () => disposed.texture++);
  const hold = new RetainedStage();
  const page = { story: "noah", index: 1 };
  hold.retain(source, page, (root) => {
    assert.equal(root.parent, null);
    geometry.dispose();
    material.dispose();
    texture.dispose();
    root.clear();
  });
  page.index = 2;
  assert.deepEqual(hold.page, { story: "noah", index: 1 });
  assert.equal(hold.visible, true);
  assert.equal(source.children.length, 0);
  assert.deepEqual(actor.parent!.position.toArray(), [1, 2, 3]);
  const partial = new THREE.Group();
  source.add(partial);
  assert.notEqual(actor.parent, source);
  assert.deepEqual(disposed, { geometry: 0, material: 0, texture: 0 });
  hold.clear();
  hold.clear();
  assert.deepEqual(disposed, { geometry: 1, material: 1, texture: 1 });
  assert.equal(hold.visible, false);
  assert.equal(hold.page, undefined);
  assert.equal(source.children[0], partial);
});

test("replacement releases the old retained stage once and room cleanup releases the current one", () => {
  const hold = new RetainedStage(),
    book = new THREE.Group(),
    source = new THREE.Group();
  book.add(source);
  let first = 0,
    second = 0;
  source.add(new THREE.Group());
  hold.retain(source, { story: "eden", index: 1 }, () => first++);
  source.add(new THREE.Group());
  hold.retain(source, { story: "eden", index: 3 }, () => second++);
  assert.equal(first, 1);
  assert.equal(second, 0);
  assert.deepEqual(hold.page, { story: "eden", index: 3 });
  hold.clear();
  hold.clear();
  assert.equal(first, 1);
  assert.equal(second, 1);
  assert.equal(book.children.length, 1);
});
