import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { RoomOrbitGesture, orbitRoomGoal } from "../src/room-orbit";

test("a shelf tap activates, while drag, vertical scroll, cancel and multitouch never do", () => {
  const gesture = new RoomOrbitGesture();
  gesture.down(1, 100, 100);
  gesture.move(1, 103, 102, 360);
  assert.equal(gesture.up(1), true);
  gesture.down(1, 100, 100);
  assert.equal(gesture.move(1, 130, 102, 360), "drag");
  gesture.move(1, 100, 100, 360);
  assert.equal(
    gesture.up(1),
    false,
    "dragging back to the start is still not a tap",
  );
  gesture.down(1, 100, 100);
  assert.equal(gesture.move(1, 102, 125, 360), "scroll");
  assert.equal(gesture.up(1), false);
  gesture.down(1, 100, 100);
  gesture.cancel(1);
  assert.equal(
    gesture.has(1),
    true,
    "canceled release stays tracked across a scene change",
  );
  assert.equal(gesture.up(1), false);
  gesture.down(1, 100, 100);
  gesture.down(2, 110, 100);
  assert.equal(gesture.up(1), false);
  assert.equal(gesture.up(2), false);
  gesture.down(1, 100, 100);
  gesture.cancel(1);
  gesture.down(1, 100, 100);
  assert.equal(
    gesture.up(1),
    true,
    "a fresh gesture recovers after browser cancellation",
  );
  assert.equal(gesture.up(99), false, "unmatched release is not activation");
});

test("room orbit is bounded, preserves radius and focus, and reset invalidates a late room release", () => {
  const gesture = new RoomOrbitGesture();
  gesture.down(1, 0, 0);
  gesture.move(1, 10000, 0, 360);
  assert.equal(
    gesture.yaw,
    -0.12,
    "dragging right pulls the scene right (camera yaw left)",
  );
  gesture.reset();
  assert.equal(gesture.yaw, 0);
  assert.equal(
    gesture.up(1),
    false,
    "entering reading cannot turn the old drag into activation",
  );
  for (const direction of [-1, 0, 1] as const) {
    gesture.look(direction);
    assert.equal(gesture.yaw, direction * 0.12);
    const base = new THREE.Vector3(5.5, 4.6, 10.8),
      focus = new THREE.Vector3(0, 2, -1.7);
    const goal = orbitRoomGoal(base, focus, gesture.yaw);
    assert.ok(
      Math.abs(goal.distanceTo(focus) - base.distanceTo(focus)) < 1e-10,
    );
    assert.equal(goal.y, base.y);
    assert.deepEqual(focus.toArray(), [0, 2, -1.7]);
    assert.deepEqual(base.toArray(), [5.5, 4.6, 10.8]);
  }
});
