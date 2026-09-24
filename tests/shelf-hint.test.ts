import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { ShelfHint } from "../src/shelf-hint";

test("shelf invitation waits for inactivity, repeats, and ends for this visit on selection", (t) => {
  let now = 0;
  t.mock.method(performance, "now", () => now);
  const document = Object.assign(new EventTarget(), { hidden: false });
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "document", previous);
    else Reflect.deleteProperty(globalThis, "document");
  });
  const hint = new ShelfHint();
  const initialChildren = hint.root.children.length;
  for (let i = 0; i < 30; i++) document.dispatchEvent(new Event("pointermove"));
  assert.equal(
    hint.root.children.length,
    initialChildren,
    "activity must not accumulate glow meshes",
  );
  const target = new THREE.Group();
  const sample = (time: number, active = true) => {
    now = time;
    hint.update(now, target, active, false);
    return hint.root.visible;
  };
  assert.equal(sample(14999), false);
  assert.equal(sample(16000), true);
  const border = target.getObjectByName("shelf-hint-spine-border")!;
  assert.ok(border);
  assert.equal(border.visible, true);
  assert.equal(sample(20000), false);
  assert.equal(border.visible, false);
  assert.equal(sample(30000), true);
  document.dispatchEvent(new Event("pointermove"));
  document.dispatchEvent(new Event("pointerdown"));
  document.dispatchEvent(new Event("keydown"));
  assert.equal(sample(31000), true);
  assert.equal(sample(46000), true);
  document.hidden = true;
  assert.equal(sample(47000), false);
  document.hidden = false;
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(sample(48000), false);
  assert.equal(sample(63000), true);
  hint.complete();
  assert.equal(border.visible, true);
  assert.equal(sample(63300), true);
  assert.equal(sample(63601), false);
  assert.equal(border.visible, false);
  assert.equal(sample(77000), false);
  hint.dispose();
  assert.equal(border.parent, null);
});
