import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { noahStageDirections } from "../src/noah-stage-direction";

const ids = Array.from(
  { length: 8 },
  (_, index) => `noah-${String(index + 1).padStart(2, "0")}`,
);

test("Noah has one explicitly authored direction per retained spread", () => {
  assert.deepEqual(Object.keys(noahStageDirections).sort(), ids);
  for (const id of ids) {
    const { background, ground, actors } = noahStageDirections[id];
    assert.ok(background, `${id} has a backdrop`);
    assert.ok(ground, `${id} has a floor print`);
    assert.ok(Array.isArray(actors), `${id} has an actor list`);
  }
});

test("the worksite stays continuous through the ark boarding page", () => {
  const called = noahStageDirections["noah-01"];
  const building = noahStageDirections["noah-02"];
  const boarding = noahStageDirections["noah-03"];
  assert.equal(called.background, "shipyard");
  assert.equal(building.background, called.background);
  assert.equal(boarding.ground, called.ground);
  assert.ok(building.props?.some((prop) => prop.file === "timber-bench"));
  assert.equal(
    boarding.actors.filter((actor) => actor.kind === "noah").length,
    1,
  );
  assert.equal(boarding.family, true);
  const animals = boarding.props?.find((prop) => prop.file === "animal-pairs");
  assert.equal(animals?.flipX, true, "the pairs face toward the ark entrance");
  const landingAnimals = noahStageDirections["noah-06"].props?.find(
    (prop) => prop.file === "animal-pairs",
  );
  assert.equal(
    landingAnimals?.width,
    animals?.width,
    "the same animal cutout keeps its painted scale when leaving the ark",
  );
  assert.equal(
    landingAnimals?.flipX,
    undefined,
    "the animals face away from the ark",
  );
});

test("the storm layers are independent and include a foreground waterline", () => {
  const storm = noahStageDirections["noah-04"];
  assert.equal(storm.background, "storm-open-water");
  assert.ok(storm.ark && typeof storm.ark === "object");
  if (storm.ark && typeof storm.ark === "object") {
    assert.equal(storm.ark.file, "ark.webp");
    assert.equal(storm.ark.motion?.kind, "float");
  }
  assert.ok(Array.isArray(storm.waves));
  assert.equal(storm.waves.length, 3);
  assert.equal(
    new Set(storm.waves.map((wave) => wave.depth)).size,
    3,
    "layers use different depth planes",
  );
  assert.equal(
    new Set(storm.waves.map((wave) => wave.motion?.phaseRadians)).size,
    3,
    "layers move out of phase",
  );
  assert.equal(
    new Set(storm.waves.map((wave) => wave.motion?.periodSeconds)).size,
    3,
    "layers do not share one synchronized cycle",
  );
  assert.ok(
    new Set(storm.waves.map((wave) => wave.width)).size > 1,
    "layers have different horizontal extents",
  );
  assert.ok(storm.waves.some((wave) => wave.depth < 0.35));
});

test("the dove scene is a cabin rather than a freestanding frame over water", () => {
  const cabin = noahStageDirections["noah-05"];
  assert.match(cabin.background, /noah-ark-interior-backdrop\.webp$/);
  assert.match(cabin.ground, /noah-ark-interior-plank-floor\.webp$/);
  assert.notEqual(cabin.interior, true);
  assert.equal(cabin.dove && typeof cabin.dove, "object");
  if (cabin.dove && typeof cabin.dove === "object") {
    assert.equal(cabin.dove.creature, "dove");
    assert.equal(cabin.dove.flipX, true, "the olive-bearing dove faces Noah");
    assert.ok(
      cabin.dove.width < 0.7,
      "the bird is smaller than the human actor",
    );
  }
});

test("the shore stages hold the changed-world mood and covenant art", () => {
  const exit = noahStageDirections["noah-06"];
  const covenant = noahStageDirections["noah-07"];
  const remembrance = noahStageDirections["noah-08"];
  assert.equal(exit.actors[0]?.pose, 1);
  assert.equal(exit.actors[0]?.mood, "sad");
  assert.ok(
    typeof exit.family === "object" &&
      /family-seven-sober/.test(exit.family.file),
  );
  assert.ok(exit.props?.some((prop) => prop.file === "animal-pairs"));
  assert.equal(covenant.background, remembrance.background);
  assert.equal(covenant.ground, remembrance.ground);
  assert.ok(covenant.props?.some((prop) => /stone-altar/.test(prop.file)));
  assert.equal(covenant.rainbow, undefined);
  assert.equal(remembrance.rainbow, undefined);
});

test("Noah actor directions preserve their authored motion moods", () => {
  for (const [id, pose, mood] of [
    ["noah-03", 2, "welcome"],
    ["noah-07", 2, "hope"],
    ["noah-08", 2, "hope"],
  ] as const) {
    const actor = noahStageDirections[id].actors.find(
      (direction) => direction.kind === "noah",
    );
    assert.equal(actor?.pose, pose, `${id} keeps its authored atlas pose`);
    assert.equal(actor?.mood, mood, `${id} keeps its authored motion mood`);
  }
});

test("every Noah-owned stage print has a source PNG and a reader WebP", () => {
  const root = "assets/books/noah-and-the-great-flood";
  const stems = [
    "noah-ark-interior-backdrop",
    "noah-ark-interior-plank-floor",
    "noah-covenant-shore-backdrop",
    "noah-family-seven-sober",
    "noah-shore-stone-ground",
    "noah-stone-altar",
    "noah-storm-water-ground",
    "noah-storm-wave-crest",
    "noah-worksite-earth-ground",
  ];
  for (const stem of stems) {
    const source = `${root}/source-art/${stem}.png`;
    assert.ok(fs.existsSync(source), `${stem} source`);
    assert.ok(fs.statSync(source).size > 1000, `${stem} source is not empty`);
    assert.ok(
      fs.existsSync(`public/${root}/art/${stem}.webp`),
      `${stem} reader art`,
    );
  }
});
