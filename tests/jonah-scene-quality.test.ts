import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";
import { sourceFingerprint } from "../src/book-localization";

const projectRoot = path.resolve(import.meta.dirname, "..");
const book = JSON.parse(
  readFileSync(
    path.join(projectRoot, "public/books/jonah-and-the-whale.book.json"),
    "utf8",
  ),
);
const spread = (id: string) => {
  const result = book.spreads.find((page: { id: string }) => page.id === id);
  assert.ok(result, `Missing Jonah spread '${id}'.`);
  return result;
};

const imageMetrics = new Map<
  string,
  { width: number; height: number; alphaTop: number; alphaBottom: number }
>();
const sourceImageMetrics = (assetId: string) => {
  const cached = imageMetrics.get(assetId);
  if (cached) return cached;
  const bytes = readFileSync(
    path.join(
      projectRoot,
      "assets/books/jonah-and-the-whale/source-art",
      `${assetId}.png`,
    ),
  );
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8, `${assetId} uses 8-bit channels`);
  assert.equal(bytes[25], 6, `${assetId} source keeps an RGBA alpha channel`);
  const chunks: Buffer[] = [];
  for (let offset = 8; offset < bytes.length; ) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    if (type === "IDAT")
      chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
    if (type === "IEND") break;
  }
  const compressed = inflateSync(Buffer.concat(chunks));
  const rowBytes = width * 4;
  const previous = Buffer.alloc(rowBytes);
  const current = Buffer.alloc(rowBytes);
  let alphaTop = height;
  let alphaBottom = 0;
  let sourceOffset = 0;
  const paeth = (left: number, up: number, upperLeft: number) => {
    const p = left + up - upperLeft;
    const leftDistance = Math.abs(p - left);
    const upDistance = Math.abs(p - up);
    const upperLeftDistance = Math.abs(p - upperLeft);
    if (leftDistance <= upDistance && leftDistance <= upperLeftDistance)
      return left;
    return upDistance <= upperLeftDistance ? up : upperLeft;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = compressed[sourceOffset++];
    for (let x = 0; x < rowBytes; x += 1) {
      const raw = compressed[sourceOffset++];
      const left = x >= 4 ? current[x - 4] : 0;
      const up = previous[x];
      const upperLeft = x >= 4 ? previous[x - 4] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) predictor = paeth(left, up, upperLeft);
      else assert.equal(filter, 0, `${assetId} uses a supported PNG filter`);
      current[x] = (raw + predictor) & 255;
    }
    let hasVisiblePixel = false;
    for (let x = 3; x < rowBytes; x += 4) {
      if (current[x] > 32) {
        hasVisiblePixel = true;
        break;
      }
    }
    if (hasVisiblePixel) {
      alphaTop = Math.min(alphaTop, y);
      alphaBottom = y + 1;
    }
    current.copy(previous);
  }
  assert.ok(alphaTop < alphaBottom, `${assetId} has visible alpha`);
  const metrics = { width, height, alphaTop, alphaBottom };
  imageMetrics.set(assetId, metrics);
  return metrics;
};
const assertNativeAspect = (element: {
  asset: string;
  placement: { width: number; height: number };
}) => {
  const image = sourceImageMetrics(element.asset);
  const authoredAspect = element.placement.width / element.placement.height;
  const sourceAspect = image.width / image.height;
  assert.ok(
    Math.abs(authoredAspect - sourceAspect) < 0.01,
    `${element.asset} keeps source aspect ${sourceAspect.toFixed(3)} (authored ${authoredAspect.toFixed(3)})`,
  );
};
const visibleHeight = (element: {
  asset: string;
  placement: { height: number };
}) => {
  const image = sourceImageMetrics(element.asset);
  return (
    element.placement.height *
    ((image.alphaBottom - image.alphaTop) / image.height)
  );
};

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

test("p1 Joppa uses a broad matching quay with no detached wave", () => {
  const page = spread("jonah-called");
  assert.equal(page.backdrop.asset, "joppa-harbor-backdrop");
  assert.equal(page.ground.asset, "joppa-quay-ground");
  assert.deepEqual(
    [page.ground.x, page.ground.depth, page.ground.width, page.ground.height],
    [0, -0.15, 5.85, 2.74],
  );
  assert.equal(page.ground.opacity, 1);
  assert.ok(
    Math.abs(page.ground.depth - page.ground.height / 2 + 1.52) < 0.001,
    "quay print reaches the front edge of the stage with a narrow margin",
  );
  assert.ok(
    Math.abs(page.ground.depth + page.ground.height / 2 - 1.22) < 0.001,
    "quay print meets the upright backdrop at its rear edge",
  );
  assert.equal(
    page.elements.filter((element: { id: string }) => element.id === "jonah")
      .length,
    1,
  );
  assert.ok(
    !page.elements.some(
      (element: { id: string }) => element.id === "shore-wave",
    ),
    "the calm harbor scene has no separate wave card crossing the quay",
  );
});

test("each spread's horizontal print reaches the front edge and meets its backdrop", () => {
  assert.equal(book.spreads.length, 13);
  for (const page of book.spreads) {
    assert.ok(page.ground, `${page.id} has a horizontal floor or water print`);
    assert.deepEqual(
      [page.ground.x, page.ground.depth, page.ground.width, page.ground.height],
      [0, -0.15, 5.85, 2.74],
      `${page.id} keeps consistent ground coverage and seam placement`,
    );
    assert.equal(page.ground.opacity, 1, `${page.id} has a solid ground print`);
    assert.ok(
      Math.abs(page.ground.depth - page.ground.height / 2 + 1.52) < 0.001,
      `${page.id} reaches the stage front with a narrow margin`,
    );
    assert.ok(
      Math.abs(page.ground.depth + page.ground.height / 2 - 1.22) < 0.001,
      `${page.id} meets the upright backdrop at the rear edge`,
    );
  }
});

test("p2 boat, p3 storm and p4 swimmer use layered, continuous water layouts", () => {
  const p2 = spread("jonah-boards-ship");
  assert.equal(p2.backdrop.asset, "joppa-harbor-backdrop");
  assert.equal(p2.ground.asset, "calm-harbor-water-ground");
  assert.deepEqual(
    [p2.ground.x, p2.ground.depth, p2.ground.width, p2.ground.height],
    [0, -0.15, 5.85, 2.74],
  );
  const boat = p2.elements.find(
    (element: { id: string }) => element.id === "ship",
  );
  assert.ok(boat);
  assert.equal(boat.asset, "ship-jonah-boarding");
  assert.deepEqual(
    p2.elements.map((element: { id: string }) => element.id),
    ["ship", "small-fish"],
    "Jonah stays painted aboard the boat while a small optional fish appears at the waterline",
  );
  const fish = p2.elements[1];
  assert.equal(fish.asset, "small-fish-school");
  assert.equal(fish.interaction.effect, "hop");
  assertNativeAspect(fish);
  assertNativeAspect(boat);
  assert.ok(boat.placement.width >= 4);

  const p3 = spread("storm-at-sea");
  assert.equal(p3.ground.asset, "storm-water-ground");
  const embeddedJonahShip = p3.elements.find(
    (element: { id: string }) => element.id === "ship",
  );
  const p3Waves = p3.elements.filter((element: { id: string }) =>
    element.id.startsWith("storm-wave"),
  );
  assert.equal(embeddedJonahShip.asset, "storm-deck-jonah");
  assert.equal(
    p3.elements.filter((element: { id: string }) => element.id === "jonah")
      .length,
    0,
  );
  assert.equal(p3Waves.length, 3);
  assert.equal(
    new Set(
      p3Waves.map(
        (wave: { placement: { depth: number } }) => wave.placement.depth,
      ),
    ).size,
    3,
  );
  assert.equal(
    new Set(
      p3Waves.map(
        (wave: { motion: { duration: number } }) => wave.motion.duration,
      ),
    ).size,
    3,
    "storm waves move at separate rates rather than in sync",
  );
  assert.equal(
    new Set(
      p3Waves.map(
        (wave: { motion: { strength: number } }) => wave.motion.strength,
      ),
    ).size,
    3,
  );
  assert.equal(
    new Set(
      p3Waves.map((wave: { placement: { x: number } }) => wave.placement.x),
    ).size,
    3,
  );
  const p3Front = p3Waves.find(
    (wave: { id: string }) => wave.id === "storm-wave-front",
  );
  assert.ok(p3Front.placement.depth < embeddedJonahShip.placement.depth);
  assert.equal(p3Front.placement.anchor, "bottom");
  assert.equal(p3Front.placement.elevation, 0);

  const p4 = spread("jonah-overboard");
  const swimmer = p4.elements.find(
    (element: { id: string }) => element.id === "jonah",
  );
  const shipWithoutJonah = p4.elements.find(
    (element: { id: string }) => element.id === "ship",
  );
  const frontWave = p4.elements.find(
    (element: { id: string }) => element.id === "calming-wave",
  );
  assert.equal(shipWithoutJonah.asset, "storm-ship-sailors");
  assert.equal(swimmer.asset, "jonah-overboard");
  assert.ok(shipWithoutJonah.placement.depth > swimmer.placement.depth);
  assert.ok(frontWave.placement.depth < swimmer.placement.depth);
  assert.ok(Math.abs(frontWave.placement.x - swimmer.placement.x) <= 0.1);
  assert.equal(frontWave.placement.anchor, "bottom");
  assert.equal(frontWave.placement.elevation, 0);
  assert.equal(
    p4.elements.filter((element: { id: string }) => element.id.includes("wave"))
      .length,
    3,
  );
  const p4Waves = p4.elements.filter((element: { id: string }) =>
    element.id.includes("wave"),
  );
  assert.equal(
    new Set(
      p4Waves.map(
        (wave: { motion: { duration: number } }) => wave.motion.duration,
      ),
    ).size,
    3,
  );
  assert.equal(
    new Set(
      p4Waves.map(
        (wave: { motion: { strength: number } }) => wave.motion.strength,
      ),
    ).size,
    3,
  );
  assert.equal(
    new Set(
      p4Waves.map((wave: { placement: { x: number } }) => wave.placement.x),
    ).size,
    3,
  );
});

test("p5–7 change from deep-water approach to a connected shore landing", () => {
  const p5 = spread("jonah-rescued");
  const fish = p5.elements.find(
    (element: { id: string }) => element.id === "great-fish",
  );
  const floatingJonah = p5.elements.find(
    (element: { id: string }) => element.id === "jonah",
  );
  assert.equal(p5.ground.asset, "deepwater-ground");
  assert.equal(fish.asset, "great-fish-serious-open-mouth");
  assert.equal(floatingJonah.asset, "jonah-floating-fullbody");
  assert.ok(fish.placement.x < floatingJonah.placement.x);
  assert.ok(fish.placement.width >= floatingJonah.placement.width * 3.8);
  assertNativeAspect(fish);
  assertNativeAspect(floatingJonah);
  assert.equal(
    p5.elements.filter((element: { id: string }) => element.id === "jonah")
      .length,
    1,
  );

  const p6 = spread("jonah-prays");
  assert.equal(p6.ground.asset, "deepwater-ground");
  assert.equal(
    p6.elements.find((element: { id: string }) => element.id === "great-fish")
      .asset,
    "great-fish-cutaway",
  );

  const p7 = spread("jonah-ashore");
  assert.equal(p7.backdrop.asset, "beach-coast-backdrop");
  assert.equal(p7.ground.asset, "beach-shore-ground");
  assert.deepEqual(
    [p7.ground.x, p7.ground.depth, p7.ground.width, p7.ground.height],
    [0, -0.15, 5.85, 2.74],
  );
  assert.deepEqual(
    p7.elements.map((element: { id: string }) => element.id),
    ["great-fish"],
  );
  assert.equal(p7.elements[0].asset, "fish-jonah-landing-balanced");
  assertNativeAspect(p7.elements[0]);
  assert.equal(
    book.soundtracks.find(
      (track: { id: string }) => track.id === "deep-water-prayer",
    ).endPage,
    "jonah-prays",
  );
  const shoreTrack = book.soundtracks.find(
    (track: { id: string }) => track.id === "shore-surf",
  );
  assert.equal(
    shoreTrack.asset,
    book.soundtracks.find(
      (track: { id: string }) => track.id === "harbor-calm-surf",
    ).asset,
  );
  assert.equal(shoreTrack.startPage, "jonah-ashore");
  assert.equal(shoreTrack.endPage, "jonah-ashore");
  assert.equal(shoreTrack.loop, true);
});

test("Nineveh pages share environments and stage the listening and mercy beats distinctly", () => {
  const p8 = spread("nineveh-warning");
  const p9 = spread("nineveh-turns");
  assert.equal(p8.backdrop.asset, "nineveh-citygate-backdrop");
  assert.equal(p9.backdrop.asset, p8.backdrop.asset);
  assert.equal(p8.ground.asset, "joppa-quay-ground");
  assert.equal(p9.ground.asset, p8.ground.asset);
  assert.equal(
    p8.elements.find((element: { id: string }) => element.id === "jonah").asset,
    "jonah-speaking",
  );
  const listeners = p8.elements.find(
    (element: { id: string }) => element.id === "residents",
  );
  assert.equal(listeners.asset, "nineveh-listeners");
  const speaker = p8.elements.find(
    (element: { id: string }) => element.id === "jonah",
  );
  assertNativeAspect(speaker);
  assertNativeAspect(listeners);
  assert.ok(
    Math.abs(visibleHeight(speaker) - visibleHeight(listeners)) < 0.05,
    "Jonah and the adult listeners match in visible head-to-sandal height",
  );
  const livelyChildren = p8.elements.find(
    (element: { id: string }) => element.id === "children",
  );
  const livelyFlock = p8.elements.find(
    (element: { id: string }) => element.id === "flock",
  );
  assert.ok(livelyChildren && livelyFlock);
  assertNativeAspect(livelyChildren);
  assertNativeAspect(livelyFlock);
  assert.ok(visibleHeight(livelyChildren) <= visibleHeight(speaker) * 0.65);
  assert.ok(visibleHeight(livelyFlock) < visibleHeight(livelyChildren));
  assert.ok(livelyChildren.motion.strength >= 4);
  assert.ok(livelyFlock.motion.strength >= 5);
  assert.notEqual(livelyChildren.motion.duration, livelyFlock.motion.duration);
  assert.deepEqual(
    p9.elements.map((element: { id: string }) => element.id),
    ["residents", "children", "flock"],
  );
  const praying = p9.elements.find(
    (element: { id: string }) => element.id === "residents",
  );
  assert.ok(praying);
  assert.equal(praying.asset, "nineveh-remorseful-prayers");
  assertNativeAspect(praying);
  assert.ok(visibleHeight(praying) <= visibleHeight(speaker) * 0.75);
  assert.equal(praying.placement.anchor, "bottom");
  const kneelingChildren = p9.elements.find(
    (element: { id: string }) => element.id === "children",
  );
  const kneelingFlock = p9.elements.find(
    (element: { id: string }) => element.id === "flock",
  );
  assert.ok(kneelingChildren && kneelingFlock);
  assertNativeAspect(kneelingChildren);
  assertNativeAspect(kneelingFlock);
  assert.ok(visibleHeight(kneelingChildren) <= visibleHeight(speaker) * 0.65);
  assert.ok(visibleHeight(kneelingFlock) <= visibleHeight(speaker) * 0.6);
  assert.ok(kneelingChildren.motion.strength > 0);
  assert.ok(kneelingFlock.motion.strength > 0);
  assert.ok(kneelingChildren.motion.strength <= 0.5);
  assert.ok(kneelingFlock.motion.strength <= 0.5);
});

test("p10–13 keep one outskirts floor and vary Jonah, plant and vision staging", () => {
  const pages = [
    "jonah-angry",
    "shade-for-jonah",
    "plant-withers",
    "jonah-mercy",
  ].map(spread);
  for (const page of pages) {
    assert.equal(page.backdrop.asset, "nineveh-outskirts-backdrop");
    assert.equal(page.ground.asset, "dry-earth-ground");
    assert.deepEqual(
      [page.ground.x, page.ground.depth, page.ground.width, page.ground.height],
      [0, -0.15, 5.85, 2.74],
    );
  }
  const p10 = pages[0];
  assert.equal(
    p10.elements.find((element: { id: string }) => element.id === "jonah")
      .asset,
    "jonah-waiting",
  );
  const p11 = pages[1];
  const shade = p11.elements.find(
    (element: { id: string }) => element.id === "shade-plant",
  );
  const happyJonah = p11.elements.find(
    (element: { id: string }) => element.id === "jonah",
  );
  assert.equal(happyJonah.asset, "jonah-happy-seated");
  assert.ok(shade.placement.height > happyJonah.placement.height);
  assert.ok(
    Math.abs(shade.placement.x - happyJonah.placement.x) <
      shade.placement.width / 2,
  );
  assert.ok(shade.placement.depth > happyJonah.placement.depth);
  const p12 = pages[2];
  assert.equal(
    p12.elements.find((element: { id: string }) => element.id === "jonah")
      .asset,
    "jonah-waiting",
  );
  assert.equal(
    p12.elements.find(
      (element: { id: string }) => element.id === "withered-plant",
    ).asset,
    "withered-plant",
  );
  const p13 = pages[3];
  assert.equal(
    p13.elements.find((element: { id: string }) => element.id === "jonah")
      .asset,
    "jonah-happy-seated",
  );
  assert.equal(
    p13.elements.find(
      (element: { id: string }) => element.id === "withered-plant",
    ).asset,
    "withered-plant",
  );
  const thought = p13.elements.find(
    (element: { id: string }) => element.id === "city-thought",
  );
  assert.equal(thought.asset, "jonah-divine-question-sunlight-outline");
  assert.equal(thought.flipX, true);
  assert.ok(
    thought.placement.x >
      p13.elements.find((element: { id: string }) => element.id === "jonah")
        .placement.x,
  );
  assert.equal(thought.placement.anchor, "bottom");
});

test("source and translated scene labels stay structurally aligned", () => {
  const sourceSpreadIds = book.spreads.map((page: { id: string }) => page.id);
  assert.equal(sourceSpreadIds.length, 13);
  for (const locale of book.languages.filter(
    (language: string) => language !== book.locale,
  )) {
    const translation = book.translations[locale];
    assert.equal(
      translation.sourceFingerprint,
      sourceFingerprint(book),
      `${locale} source fingerprint follows the revised element labels`,
    );
    assert.deepEqual(
      translation.spreads.map((page: { id: string }) => page.id),
      sourceSpreadIds,
      `${locale} preserves the ordered spread IDs`,
    );
    for (const sourcePage of book.spreads) {
      const translatedPage = translation.spreads.find(
        (page: { id: string }) => page.id === sourcePage.id,
      );
      assert.deepEqual(
        translatedPage.segments.map((segment: { id: string }) => segment.id),
        sourcePage.segments.map((segment: { id: string }) => segment.id),
        `${locale}/${sourcePage.id} preserves segment IDs`,
      );
      assert.deepEqual(
        translatedPage.elements
          .map((element: { id: string }) => element.id)
          .sort(),
        sourcePage.elements.map((element: { id: string }) => element.id).sort(),
        `${locale}/${sourcePage.id} has translated labels for the current elements`,
      );
    }
  }
});

test("all 117 story segments, translation cues and WAV files stay unchanged", () => {
  const entries: [string, string, unknown, string][] = [];
  const locales = [
    book.locale,
    ...book.languages.filter((locale: string) => locale !== book.locale),
  ];
  for (const locale of locales) {
    const pages =
      locale === book.locale ? book.spreads : book.translations[locale].spreads;
    for (const page of pages) {
      for (const segment of page.segments) {
        const asset = book.assets[segment.narration.asset];
        assert.ok(
          asset,
          `${locale}/${page.id}/${segment.id} audio is registered`,
        );
        // Runtime MP3s are reproducible derivatives; lock the preserved
        // recording bytes so media optimization cannot alter the narration.
        const source = asset.src.endsWith(".mp3")
          ? path.join(
              projectRoot,
              "assets/source-recordings",
              asset.src.replace(/^assets\//, "").replace(/\.mp3$/, ".wav"),
            )
          : path.join(projectRoot, "public", asset.src);
        const bytes = readFileSync(source);
        const audioHash = createHash("sha256").update(bytes).digest("hex");
        entries.push([locale, page.id, segment, audioHash]);
      }
    }
  }
  assert.equal(entries.length, 117);
  const canonical = entries
    .sort(([localeA, pageA, segmentA], [localeB, pageB, segmentB]) =>
      `${localeA}|${pageA}|${(segmentA as { id: string }).id}`.localeCompare(
        `${localeB}|${pageB}|${(segmentB as { id: string }).id}`,
      ),
    )
    .map(stableJson)
    .join(",");
  const digest = createHash("sha256").update(`[${canonical}]`).digest("hex");
  assert.equal(
    digest,
    "6754b210e7d227f9d1d84e9d59d3b7380fd550de2cbf0205762d7349a0f75432",
    "scene revisions preserve every source/translated segment, cue metadata, and recording byte",
  );
});
