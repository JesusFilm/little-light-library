import assert from "node:assert/strict";
import test from "node:test";
import {
  BOOKS_PER_SHELF,
  ROOM_BOOK_CAPACITY,
  SHELF_BOOK_SIZE,
  SHELF_BOOK_YAW,
  roomShelfLayout,
  roomToyLayout,
  shelfTransferPose,
} from "../src/room-shelf";

test("thirty spine-out books fill two packed rows of fifteen", () => {
  const layout = roomShelfLayout(ROOM_BOOK_CAPACITY);
  assert.equal(BOOKS_PER_SHELF, 15);
  assert.equal(layout.slots.length, 30);
  assert.equal(layout.endStops.length, 0);
  assert.equal(SHELF_BOOK_YAW, Math.PI / 2);
  assert.deepEqual(layout.slots[0], { x: -2.62, y: 3.7, z: -3 });
  assert.deepEqual(layout.slots[15], { x: -2.62, y: 1.98, z: -3 });
  assert.equal(Number(layout.slots[14].x.toFixed(3)), 2.616);
  assert.equal(Number(layout.slots[29].x.toFixed(3)), 2.616);
  assert.equal(roomShelfLayout(40).slots.length, ROOM_BOOK_CAPACITY);
});

test("each occupied row has a bookstop through twelve books only", () => {
  const expectedStops = new Map([
    [0, []],
    [1, [{ row: 0, occupied: 1 }]],
    [12, [{ row: 0, occupied: 12 }]],
    [13, []],
    [15, []],
    [16, [{ row: 1, occupied: 1 }]],
    [27, [{ row: 1, occupied: 12 }]],
    [28, []],
    [30, []],
  ]);
  for (const [count, expected] of expectedStops) {
    const layout = roomShelfLayout(count);
    assert.equal(layout.endStops.length, expected.length, `count ${count}`);
    expected.forEach(({ row, occupied }, index) => {
      const stop = layout.endStops[index];
      const last = layout.slots[row * BOOKS_PER_SHELF + occupied - 1];
      assert.deepEqual(
        { x: Number(stop.x.toFixed(3)), y: stop.y, z: stop.z },
        {
          x: Number((last.x + SHELF_BOOK_SIZE.thickness / 2 + 0.05).toFixed(3)),
          y: row === 0 ? 2.99 : 1.27,
          z: -3,
        },
        `count ${count} row ${row}`,
      );
    });
  }
});

test("the landing proxy matches the closed table book footprint and pose", () => {
  const pose = shelfTransferPose();
  assert.equal(Number((SHELF_BOOK_SIZE.width * pose.scale.x).toFixed(3)), 3.13);
  assert.equal(Number((SHELF_BOOK_SIZE.height * pose.scale.y).toFixed(3)), 3.6);
  assert.equal(
    Number((SHELF_BOOK_SIZE.thickness * pose.scale.z).toFixed(3)),
    0.4,
  );
  assert.deepEqual(pose.position, { x: 1.56, y: 1.495, z: 1.1 });
  assert.equal(
    Number((pose.position.y - 0.195 - 1.295).toFixed(3)),
    0.005,
    "the closed cover clears the tabletop by five millimetres",
  );
  assert.equal(pose.rotationX, -Math.PI / 2);
});

test("generic toys occupy the top display surface above both book rows", () => {
  const toys = roomToyLayout(9);
  assert.equal(toys.length, 4);
  assert.deepEqual(
    toys.map((toy) => Number(toy.x.toFixed(2))),
    [-1.08, -0.36, 0.36, 1.08],
  );
  assert.ok(toys.every((toy) => toy.y === 4.78 && toy.z === -2.69));
  assert.ok(
    toys.every((toy) => toy.y > roomShelfLayout(ROOM_BOOK_CAPACITY).slots[0].y),
  );
});
