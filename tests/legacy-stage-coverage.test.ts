import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { stageDirections } from "../src/stage-direction";

const localPath = (ref: string) => {
  if (ref.startsWith("assets/")) return `public/${ref}`;
  if (ref.startsWith("./assets/")) return `public/${ref.slice(2)}`;
  if (ref.startsWith("/assets/")) return `public/${ref.slice(1)}`;
  const file = /\.[a-z0-9]+$/i.test(ref) ? ref : `${ref}.webp`;
  return `public/assets/art/theatre/${file}`;
};

const edenIds = Array.from(
  { length: 8 },
  (_, index) => `eden-${String(index + 1).padStart(2, "0")}`,
);
const noahIds = Array.from(
  { length: 8 },
  (_, index) => `noah-${String(index + 1).padStart(2, "0")}`,
);

test("all sixteen retained pages have local backdrops and explicit matching grounds", () => {
  assert.deepEqual(
    Object.keys(stageDirections).sort(),
    [...edenIds, ...noahIds].sort(),
  );
  for (const id of [...edenIds, ...noahIds]) {
    const direction = stageDirections[id];
    assert.ok(direction.background, `${id} backdrop path`);
    assert.ok(direction.ground, `${id} ground path`);
    assert.ok(
      fs.existsSync(localPath(direction.background)),
      `${id} backdrop exists`,
    );
    assert.ok(
      fs.existsSync(localPath(direction.ground)),
      `${id} ground exists`,
    );
    for (const actor of direction.actors) {
      const artwork =
        actor.image ?? `assets/art/theatre/${actor.kind}-poses.webp`;
      assert.ok(fs.existsSync(localPath(artwork)), `${id} ${actor.kind} art`);
      if (actor.image) {
        assert.ok(actor.width > 0, `${id} image actor has a positive width`);
        assert.ok(
          Math.abs(actor.x) + actor.width / 2 < 3.1,
          `${id} image actor fits the page`,
        );
      } else {
        assert.ok(
          actor.pose === 0 || actor.pose === 1 || actor.pose === 2,
          `${id} legacy actor selects one fixed pose`,
        );
      }
      if (actor.motion) {
        assert.ok(
          Number.isFinite(actor.motion.strength),
          `${id} motion amount`,
        );
        assert.ok(
          (actor.motion.periodSeconds ?? 3.4) > 0,
          `${id} motion cycle is positive`,
        );
      }
    }
    for (const prop of direction.props ?? []) {
      assert.ok(prop.width > 0 && (prop.scale ?? 1) > 0, `${id} prop size`);
      assert.ok(
        Math.abs(prop.x) + (prop.width * (prop.scale ?? 1)) / 2 < 3.1,
        `${id} prop fits page`,
      );
      assert.ok(
        fs.existsSync(localPath(prop.file)),
        `${id} prop asset ${prop.file}`,
      );
      assert.ok(prop.flipX === undefined || typeof prop.flipX === "boolean");
    }
  }

  for (const id of edenIds.slice(0, 5))
    assert.equal(
      stageDirections[id].ground,
      "assets/art/theatre/continuous-garden-ground.webp",
    );
  for (const id of edenIds.slice(5))
    assert.match(
      stageDirections[id].ground,
      /exile-earth-ground|dry-earth-ground/,
    );
  for (const id of noahIds.slice(0, 3))
    assert.match(stageDirections[id].ground, /worksite-earth-ground/);
  assert.match(stageDirections["noah-04"].ground, /storm-water-ground/);
  assert.match(stageDirections["noah-05"].ground, /interior-plank-floor/);
  for (const id of noahIds.slice(5))
    assert.match(stageDirections[id].ground, /shore-stone-ground/);
});

test("legacy page logic preserves Eden exile and Noah's distinct story props", () => {
  for (const id of edenIds.slice(5))
    assert.equal(stageDirections[id].tree, undefined, `${id} has no Eden tree`);

  const storm = stageDirections["noah-04"];
  assert.ok(storm.ark, "the ark remains in the storm scene");
  assert.ok(
    typeof storm.ark === "object",
    "the ark has an explicit motion entry",
  );
  if (storm.ark && typeof storm.ark === "object")
    assert.equal(storm.ark.motion?.kind, "float", "the ark bobs with the sea");
  assert.ok(
    Array.isArray(storm.waves),
    "the storm uses individually staged waves",
  );
  assert.equal(storm.waves.length, 3);
  assert.equal(new Set(storm.waves.map((wave) => wave.depth)).size, 3);
  assert.equal(
    new Set(storm.waves.map((wave) => wave.motion?.phaseRadians)).size,
    3,
    "three wave layers move out of phase",
  );
  assert.ok(storm.waves.every((wave) => wave.motion?.kind === "sway"));

  const cabin = stageDirections["noah-05"];
  assert.notEqual(
    cabin.interior,
    true,
    "p5 does not add the old procedural frame",
  );
  assert.match(cabin.background, /interior-backdrop/);
  assert.ok(
    cabin.dove && typeof cabin.dove === "object",
    "p5 uses the authored small dove cutout",
  );

  assert.ok(
    (stageDirections["noah-07"].props ?? []).some((prop) =>
      /altar/i.test(prop.file),
    ),
    "p7 has an altar prop",
  );
});
