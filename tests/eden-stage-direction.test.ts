import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { inflateSync } from "node:zlib";
import { edenStageDirections } from "../src/eden-stage-direction";

const publicRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public",
);
const edenSourceRoot = path.resolve(publicRoot, "../assets/books/eden");
const theatrePath = (asset: string) =>
  asset.startsWith("assets/")
    ? path.resolve(publicRoot, asset)
    : path.resolve(publicRoot, "assets/art/theatre", `${asset}.webp`);
const edenSourcePath = (asset: string) =>
  path.resolve(publicRoot, `../assets/books/eden/source-art/${asset}`);
const pageIds = Array.from(
  { length: 8 },
  (_, index) => `eden-${String(index + 1).padStart(2, "0")}`,
);

/** Decode the local RGBA PNG's alpha bounds, matching scene.ts's >32 crop. */
function paintedPngSize(filename: string) {
  const png = readFileSync(filename);
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const imageData: Buffer[] = [];
  for (let offset = 8; offset < png.length; ) {
    const length = png.readUInt32BE(offset);
    const kind = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (kind === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      assert.equal(data[12], 0, "source PNG is not interlaced");
    } else if (kind === "IDAT") imageData.push(data);
    offset += length + 12;
    if (kind === "IEND") break;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6, "source cutout retains RGBA pixels");
  const stride = width * 4;
  const decoded = inflateSync(Buffer.concat(imageData));
  let prior = Buffer.alloc(stride);
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;
  let transparentPixels = 0;
  let cursor = 0;
  for (let y = 0; y < height; y++) {
    const filter = decoded[cursor++];
    const row = Buffer.from(decoded.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= 4 ? row[i - 4] : 0;
      const up = prior[i];
      const upperLeft = i >= 4 ? prior[i - 4] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const base = left + up - upperLeft;
        const leftDistance = Math.abs(base - left);
        const upDistance = Math.abs(base - up);
        const upperLeftDistance = Math.abs(base - upperLeft);
        predictor =
          leftDistance <= upDistance && leftDistance <= upperLeftDistance
            ? left
            : upDistance <= upperLeftDistance
              ? up
              : upperLeft;
      } else assert.equal(filter, 0, "source PNG uses a supported row filter");
      row[i] = (row[i] + predictor) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      if (row[x * 4 + 3] <= 32) {
        transparentPixels++;
        continue;
      }
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    prior = row;
  }
  assert.ok(maxX >= minX && maxY >= minY, "source has painted pixels");
  return {
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    transparentPixels,
  };
}

test("Eden has explicit staging for all eight pages with matching ground assets", () => {
  assert.deepEqual(Object.keys(edenStageDirections).sort(), pageIds);

  for (const stem of [
    "continuous-garden-ground",
    "fig-leaf-hiding-screen",
    "eden-guarded-way-backcloth",
    "exile-earth-ground",
    "fieldwork-tools",
  ]) {
    assert.ok(
      existsSync(path.resolve(edenSourceRoot, `source-art/${stem}.png`)),
      `${stem} source image is cataloged`,
    );
    assert.ok(
      existsSync(path.resolve(edenSourceRoot, `prompts/${stem}.txt`)),
      `${stem} prompt note is cataloged`,
    );
  }

  for (const id of pageIds) {
    const direction = edenStageDirections[id];
    assert.ok(direction.ground, `${id} must name its horizontal print`);
    assert.ok(existsSync(theatrePath(direction.ground)), `${id} ground exists`);
    assert.ok(
      existsSync(theatrePath(direction.background)),
      `${id} backdrop exists`,
    );
    for (const prop of direction.props || [])
      assert.ok(
        existsSync(theatrePath(prop.file)),
        `${id} prop ${prop.file} exists`,
      );
  }

  for (const id of pageIds.slice(0, 5))
    assert.equal(
      edenStageDirections[id].ground,
      "assets/art/theatre/continuous-garden-ground.webp",
      `${id} keeps the continuous garden print`,
    );
  for (const id of pageIds.slice(5))
    assert.equal(
      edenStageDirections[id].ground,
      "assets/art/theatre/exile-earth-ground.webp",
      `${id} moves to the dry-earth print`,
    );
});

test("Eden scene beats stay distinct and the actors remain readable", () => {
  const companion = edenStageDirections["eden-02"].actors.find(
    (actor) => actor.kind === "eve",
  );
  assert.equal(
    companion?.flipX,
    true,
    "the new Eve bush portrait is mirrored to face Adam on the companion page",
  );

  assert.equal(
    edenStageDirections["eden-03"].props?.find(
      (prop) => prop.file === "serpent-branch",
    )?.creature,
    "serpent",
    "the serpent retains its localized interactive character rig",
  );

  const hiding = edenStageDirections["eden-04"];
  assert.ok(
    hiding.actors.every((actor) => !!actor.image),
    "shame-and-hiding uses separately selectable leaf-clothed actors",
  );
  assert.equal(
    hiding.props?.some((prop) =>
      prop.file.includes("fig-leaf-hiding-screen"),
    ) ?? false,
    false,
    "clothing replaces the earlier broad foreground screen",
  );

  const guardedWay = edenStageDirections["eden-06"];
  assert.equal(
    guardedWay.background,
    "assets/art/theatre/eden-guarded-way-backcloth.webp",
    "the expulsion page has its natural guarded threshold backcloth",
  );
  assert.deepEqual(
    guardedWay.actors.map((actor) => actor.kind).sort(),
    ["adam", "eve"],
    "the guarded-way illustration adds no human divine figure",
  );

  const work = edenStageDirections["eden-07"];
  assert.ok(
    work.actors.every((actor) => !!actor.image && actor.mood === "work"),
    "fieldwork retains individual selectable hide-garment actors",
  );

  const promise = edenStageDirections["eden-08"];
  assert.equal(
    promise.tree,
    undefined,
    "the exile page does not reuse Eden's fruit tree",
  );
});

test("Eden modesty follows the story using individually selectable transparent actors", () => {
  const pages = {
    "eden-01": { mood: "welcome", actors: { adam: "adam-behind-garden-bush" } },
    "eden-02": {
      mood: "welcome",
      actors: {
        adam: "adam-behind-garden-bush",
        eve: "eve-behind-garden-bush",
      },
    },
    "eden-03": {
      mood: "warn",
      actors: {
        adam: "adam-fruit-receiving-behind-garden-bush",
        eve: "eve-fruit-behind-garden-bush",
      },
    },
    "eden-04": {
      mood: "sad",
      actors: { adam: "adam-leaf-shame", eve: "eve-leaf-shame" },
    },
    "eden-05": {
      mood: "sad",
      actors: {
        adam: "adam-leaf-consequences",
        eve: "eve-leaf-consequences",
      },
    },
    "eden-06": {
      mood: "sad",
      actors: { adam: "adam-hide-walking", eve: "eve-hide-walking" },
    },
    "eden-07": {
      mood: "work",
      actors: { adam: "adam-hide-work", eve: "eve-hide-work" },
    },
    "eden-08": {
      mood: "hope",
      actors: { adam: "adam-hide-hope", eve: "eve-hide-hope" },
    },
  } as const;

  for (const [id, expected] of Object.entries(pages)) {
    const stage = edenStageDirections[id];
    assert.deepEqual(
      stage.actors.map((actor) => actor.kind).sort(),
      Object.keys(expected.actors).sort(),
      `${id} keeps the intended individual actors`,
    );
    for (const [kind, stem] of Object.entries(expected.actors)) {
      const actor = stage.actors.find((candidate) => candidate.kind === kind);
      assert.ok(actor?.image, `${id}/${kind} uses its modesty-card image`);
      if (!actor?.image) continue;
      assert.equal(actor.pose, undefined, `${id}/${kind} avoids the old atlas`);
      assert.equal(actor.mood, expected.mood, `${id}/${kind} keeps its beat`);
      assert.ok(actor.width > 0, `${id}/${kind} declares visible width`);
      assert.equal(
        theatrePath(actor.image),
        path.resolve(publicRoot, `assets/art/theatre/eden-${stem}.webp`),
        `${id}/${kind} uses the intended art for this story state`,
      );

      const sourceStem = stem;
      const source = edenSourcePath(`${sourceStem}.png`);
      const prompt = path.resolve(edenSourceRoot, `prompts/${sourceStem}.txt`);
      assert.ok(existsSync(source), `${id}/${kind} editable PNG source`);
      assert.ok(existsSync(prompt), `${id}/${kind} image prompt`);
      const alpha = paintedPngSize(source);
      assert.ok(
        alpha.transparentPixels > 0,
        `${id}/${kind} source retains transparent cutout pixels`,
      );
      const visibleHeight = actor.width * (alpha.height / alpha.width);
      assert.ok(
        visibleHeight <= 2.2,
        `${id}/${kind} painted silhouette stays below 2.2 page units (${visibleHeight.toFixed(2)})`,
      );
      assert.ok(
        Math.abs(visibleHeight - 1.95) <= 0.25,
        `${id}/${kind} standing-adult silhouette stays near the 1.95-unit common height (${visibleHeight.toFixed(2)})`,
      );
    }
  }
});
