import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  validateBook,
  validateBookAssets,
  bookSchema,
} from "../src/book-validation";
import type { AuthoredBook } from "../src/authored-book";
import { ReaderState } from "../src/state";
import { readerFixture as fixture } from "../scripts/reader-fixture";

test("fixture and generated schema agree with the live versioned contract", () => {
  const result = validateBook(fixture());
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(
    JSON.parse(fs.readFileSync("scripts/book.schema.json", "utf8")),
    bookSchema,
  );
});
test("expanded paper-stage bounds validate and survive a JSON round trip", () => {
  const book = fixture();
  Object.assign(book.spreads[0].elements[0].placement, {
    depth: -1.575,
    width: 5.6,
    height: 3.6,
  });
  Object.assign(book.spreads[0].ground!, {
    x: 3.05,
    depth: 1.575,
    width: 6.1,
    height: 3.15,
    rotation: -180,
  });
  const roundTrip = JSON.parse(JSON.stringify(book));
  const result = validateBook(roundTrip);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.book, book);

  for (const mutate of [
    (candidate: AuthoredBook) =>
      (candidate.spreads[0].elements[0].placement.depth = -1.576),
    (candidate: AuthoredBook) =>
      (candidate.spreads[0].elements[0].placement.height = 3.601),
    (candidate: AuthoredBook) => (candidate.spreads[0].ground!.x = 3.051),
    (candidate: AuthoredBook) => (candidate.spreads[0].ground!.depth = -1.576),
    (candidate: AuthoredBook) => (candidate.spreads[0].ground!.width = 6.101),
    (candidate: AuthoredBook) => (candidate.spreads[0].ground!.height = 3.151),
    (candidate: AuthoredBook) =>
      (candidate.spreads[0].ground!.rotation = 180.001),
  ]) {
    const candidate = fixture();
    mutate(candidate);
    assert.equal(validateBook(candidate).book, undefined);
  }
});
test("invalid versions, unsupported behavior, duplicate IDs, unsafe sources and broken references give paths", () => {
  const cases: [(b: AuthoredBook) => void, string][] = [
    [
      (b) => {
        b.version = 9 as 1;
      },
      "/version",
    ],
    [
      (b) => {
        b.id = "eden";
      },
      "/id",
    ],
    [
      (b) => {
        b.spreads[1].id = b.spreads[0].id;
      },
      "/spreads/1/id",
    ],
    [
      (b) => {
        b.spreads[0].backdrop.asset = "missing";
      },
      "/spreads/0/backdrop/asset",
    ],
    [
      (b) => {
        b.assets["cover-art"].src = "../secret.png";
      },
      "/assets/cover-art/src",
    ],
    [
      (b) => {
        b.assets["cover-art"].src = "https://example.com/a.png";
      },
      "/assets/cover-art/src",
    ],
    [
      (b) => {
        b.spreads[0].elements[0].motion!.segment = "bad";
      },
      "/spreads/0/elements/0/motion/segment",
    ],
    [
      (b) => {
        b.spreads[0].elements[0].motion!.preset = "fly" as "rock";
      },
      "/spreads/0/elements/0/motion/preset",
    ],
    [
      (b) => {
        b.spreads[0].elements[0].placement.x = Infinity;
      },
      "/spreads/0/elements/0/placement/x",
    ],
    [
      (b) => {
        b.spreads[0].elements[0].pose!.index = 3;
      },
      "/spreads/0/elements/0/pose/index",
    ],
    [
      (b) => {
        Object.assign(b.spreads[0].elements[0].placement, { depthh: 1 });
      },
      "/spreads/0/elements/0/placement",
    ],
  ];
  for (const [mutate, at] of cases) {
    const book = fixture();
    mutate(book);
    const result = validateBook(book);
    assert.equal(result.book, undefined);
    assert.ok(
      result.errors.some((e) => e.path === at),
      JSON.stringify(result.errors),
    );
  }
});
test("text changes identify exactly one stale cue; targeted WAV replacement preserves other recordings", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "light-book-"));
  const recordingDirectory = fs.mkdtempSync(
    path.join("public", "assets", "audio", "__authoring-test-"),
  );
  try {
    const book = fixture(),
      original = fixture();
    const replacement = book.spreads[1].segments[0];
    book.spreads[0].segments[0].text = replacement.text;
    const result = validateBook(book);
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0].message, /Stale/);
    const runtimeSrc = book.assets[replacement.narration!.asset].src;
    const sourceWav = path.join(
      "assets",
      "source-recordings",
      runtimeSrc.replace(/^assets\//, "").replace(/\.mp3$/, ".wav"),
    );
    const recordingFile = path.join(
      recordingDirectory,
      path.basename(sourceWav),
    );
    fs.copyFileSync(sourceWav, recordingFile);
    const recordingSrc = path
      .relative("public", recordingFile)
      .split(path.sep)
      .join("/");
    const file = path.join(directory, "book.json");
    fs.writeFileSync(file, JSON.stringify(book));
    execFileSync(process.execPath, [
      "--import",
      "tsx",
      "scripts/book-cli.ts",
      "replace-audio",
      file,
      book.spreads[0].id,
      book.spreads[0].segments[0].id,
      recordingSrc,
      replacement.narration!.voice,
    ]);
    const updated = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.equal(validateBook(updated).warnings.length, 0);
    assert.deepEqual(
      updated.spreads[0].segments[1],
      original.spreads[0].segments[1],
    );
    assert.deepEqual(updated.spreads[1], original.spreads[1]);
    for (const [id, asset] of Object.entries(original.assets))
      assert.deepEqual(updated.assets[id], asset);
    assert.equal(
      updated.spreads[0].segments[0].narration.duration,
      replacement.narration!.duration,
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.rmSync(recordingDirectory, { recursive: true, force: true });
  }
});
test("media validation rejects missing assets and mismatched measured durations", async () => {
  const book = fixture();
  const errors = await validateBookAssets(book, async (asset) => {
    if (asset.kind === "image") throw Error("not found");
    return { duration: 1 };
  });
  assert.ok(errors.some((e) => e.path === "/assets/cover-art/src"));
  assert.equal(
    errors.filter((e) => e.message.startsWith("AUDIO_DURATION")).length,
    4,
  );
});
test("reader navigation uses imported count while preserving eight-spread default", () => {
  const state = new ReaderState();
  state.open("arbitrary-book", 2);
  state.turn(12);
  assert.equal(state.page, 1);
  state.open("eden");
  state.turn(12);
  assert.equal(state.page, 7);
});

test("animation presets and flip booleans round-trip while invalid values report their paths", () => {
  for (const preset of ["rock", "float", "sway", "pulse", "spin"] as const) {
    const book = fixture();
    const spread = book.spreads[0];
    Object.assign(spread.elements[0], { flipX: true, flipY: true });
    Object.assign(spread.elements[0].motion!, {
      preset,
      loop: true,
      duration: 0.2,
    });
    spread.backdrop.flipX = true;
    spread.ground!.flipY = true;
    assert.deepEqual(validateBook(JSON.parse(JSON.stringify(book))).book, book);
  }
  for (const [field, value] of [
    ["loop", "true"],
    ["duration", 0.1],
    ["preset", "fly"],
  ]) {
    const book = fixture();
    Object.assign(book.spreads[0].elements[0].motion!, {
      [field as string]: value,
    });
    assert.ok(
      validateBook(book).errors.some(
        (error) => error.path === `/spreads/0/elements/0/motion/${field}`,
      ),
    );
  }
  const book = fixture();
  Object.assign(book.spreads[0].backdrop, { flipX: 1 });
  assert.ok(
    validateBook(book).errors.some(
      (error) => error.path === "/spreads/0/backdrop/flipX",
    ),
  );
});
