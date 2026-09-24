import assert from "node:assert/strict";
import fs from "node:fs";
import { stageDirections } from "../src/stage-direction";
import { waveLayerLayout } from "../src/stage-motion";

const content = JSON.parse(
  fs.readFileSync("public/content/en-US.json", "utf8"),
);
const pageIds: string[] = content.stories.flatMap(
  (story: { pages: { id: string }[] }) => story.pages.map((page) => page.id),
);
assert.deepEqual(
  Object.keys(stageDirections).sort(),
  pageIds.sort(),
  "Every Eden and Noah spread needs one explicit stage direction",
);

function localAsset(ref: string, defaultDirectory = "assets/art/theatre") {
  if (ref.startsWith("assets/")) return `public/${ref}`;
  if (ref.startsWith("./assets/")) return `public/${ref.slice(2)}`;
  if (ref.startsWith("/assets/")) return `public/${ref.slice(1)}`;
  const file = /\.[a-z0-9]+$/i.test(ref) ? ref : `${ref}.webp`;
  return `public/${defaultDirectory}/${file}`;
}

const usedAssets = new Set<string>();
const addAsset = (ref: string, id: string, defaultDirectory?: string) => {
  assert.ok(ref.trim(), `${id}: asset path is required`);
  const file = localAsset(ref, defaultDirectory);
  assert.ok(fs.existsSync(file), `${id}: missing stage asset ${file}`);
  assert.ok(
    fs.statSync(file).size > 1000,
    `${id}: stage asset is unexpectedly small`,
  );
  usedAssets.add(file);
};
const addProp = (
  prop: {
    file: string;
    width: number;
    x: number;
    scale?: number;
  },
  id: string,
) => {
  const width = prop.width * (prop.scale ?? 1);
  assert.ok(
    prop.width > 0 && (prop.scale ?? 1) > 0,
    `${id}: prop dimensions must be positive`,
  );
  assert.ok(width < 5.8, `${id}: prop fits the open spread`);
  assert.ok(
    Math.abs(prop.x) + width / 2 < 3.1,
    `${id}: prop remains inside the pages`,
  );
  addAsset(prop.file, id);
};

for (const [id, direction] of Object.entries(stageDirections)) {
  addAsset(direction.background, `${id} backdrop`);
  addAsset(direction.ground, `${id} required full-page ground`);
  for (const actor of direction.actors) {
    assert.ok(Math.abs(actor.x) < 2.5, `${id}: actor stays on page`);
    if (actor.image) {
      addAsset(actor.image, `${id} ${actor.kind} artwork`);
      assert.ok(
        actor.width > 0,
        `${id}: image-backed actor width must be positive`,
      );
      assert.ok(
        Math.abs(actor.x) + actor.width / 2 < 3.1,
        `${id}: image-backed actor stays inside the pages`,
      );
    } else {
      addAsset(`${actor.kind}-poses.webp`, `${id} ${actor.kind} pose atlas`);
      assert.ok(actor.pose >= 0 && actor.pose < 3, `${id}: pose is supported`);
    }
    assert.ok(actor.flipX === undefined || typeof actor.flipX === "boolean");
  }
  for (const prop of direction.props ?? []) addProp(prop, `${id} ${prop.file}`);
  for (const [name, value] of [
    ["family", direction.family],
    ["ark", direction.ark],
    ["dove", direction.dove],
  ] as const)
    if (value && typeof value === "object") addProp(value, `${id} ${name}`);
  if (direction.family === true) addAsset("family-seven.webp", `${id} family`);
  if (direction.ark === true) addAsset("ark.webp", `${id} ark`);
  if (direction.dove === true) addAsset("dove-olive.webp", `${id} dove`);
  if (direction.tree !== undefined)
    addAsset("eden-tree.webp", `${id} tree`, "assets/art");
  if (Array.isArray(direction.waves))
    for (const [index, wave] of direction.waves.entries())
      addProp(wave, `${id} wave ${index + 1}`);
  else if (direction.waves) {
    for (const _layer of waveLayerLayout(
      typeof direction.waves === "number" ? direction.waves : 2,
    ))
      addAsset(
        "assets/books/jonah-and-the-whale/art/storm-wave-layer.webp",
        `${id} wave layer`,
      );
  }
}

const eden = Object.fromEntries(
  Object.entries(stageDirections).filter(([id]) => id.startsWith("eden-")),
);
for (const id of ["eden-06", "eden-07", "eden-08"])
  assert.equal(
    eden[id].tree,
    undefined,
    `${id}: garden tree does not follow exile`,
  );

const flood = Object.fromEntries(
  Object.entries(stageDirections).filter(([id]) => id.startsWith("noah-")),
);
const storm = flood["noah-04"];
assert.ok(storm.ark, "Noah p4 includes the floating ark");
assert.ok(
  Array.isArray(storm.waves),
  "Noah p4 authors its waves as independent layers",
);
assert.equal(storm.waves.length, 3, "Noah p4 has three wave layers");
const waveDepths = storm.waves.map((wave) => wave.depth);
const wavePhases = storm.waves.map((wave) => wave.motion?.phaseRadians);
assert.equal(
  new Set(waveDepths).size,
  3,
  "Noah p4 wave layers have distinct depths",
);
assert.equal(
  new Set(wavePhases).size,
  3,
  "Noah p4 wave layers have distinct phases",
);
assert.ok(wavePhases.every((phase) => typeof phase === "number"));
assert.ok(
  flood["noah-05"].interior !== true,
  "Noah p5 uses its authored cabin art instead of the old procedural frame",
);
assert.match(flood["noah-05"].background, /interior/);
assert.match(flood["noah-05"].ground, /plank/);
assert.ok(
  (flood["noah-07"].props ?? []).some((prop) => /altar/i.test(prop.file)),
  "Noah p7 includes a distinct altar prop",
);

console.log(
  `Validated ${pageIds.length} legacy spreads, ${usedAssets.size} local stage assets, explicit grounds, post-exile tree removal, three independent storm waves, cabin art and altar.`,
);
