import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { registerBook, runBookCli, validateCatalog } from "../scripts/book-cli";
import {
  atomicJson,
  checkBook,
  measureWav,
  probeMedia,
  prototypeRoot,
} from "../scripts/book-files";
import {
  fixture,
  fixtureBook,
  pixel,
  readJson,
  wav,
} from "./book-tool-fixtures";

test("create validates supplied media, never overwrites, and leaves registration explicit", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.books, "new.book.json");
  const before = await fs.readFile(f.catalog, "utf8");
  const args = [
    "create",
    file,
    "--id",
    "new-book",
    "--title",
    "New fixture",
    "--cover",
    "art/pixel.png",
    "--public-root",
    f.publicRoot,
  ];
  await runBookCli(args);
  const created = await readJson(file);
  assert.equal(created.id, "new-book");
  assert.equal(created.spreads.length, 1);
  assert.match(created.spreads[0].segments[0].text, /TODO/);
  assert.equal(created.spreads[0].segments[0].narration, undefined);
  const bytes = await fs.readFile(file, "utf8");
  await assert.rejects(runBookCli(args), /EEXIST/);
  assert.equal(await fs.readFile(file, "utf8"), bytes);
  assert.equal(await fs.readFile(f.catalog, "utf8"), before);
  await assert.rejects(
    runBookCli([
      ...args.slice(0, 2),
      "--id",
      "eden",
      "--title",
      "Reserved",
      "--cover",
      "art/pixel.png",
      "--public-root",
      f.publicRoot,
    ]),
    /RESERVED_ID/,
  );
});

test("create fails on missing artwork before writing a file", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.books, "missing.book.json");
  await assert.rejects(
    runBookCli([
      "create",
      file,
      "--id",
      "missing",
      "--title",
      "Missing",
      "--cover",
      "art/missing.png",
      "--public-root",
      f.publicRoot,
    ]),
    /MISSING_OR_INVALID_ASSET/,
  );
  await assert.rejects(fs.stat(file), /ENOENT/);
});

test("registration appends in order, preserves books, and is byte-idempotent", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.books, "second.book.json");
  await fs.writeFile(file, JSON.stringify(fixtureBook("second")));
  const before = await fs.readFile(file, "utf8");
  await registerBook(file, f.catalog, f.publicRoot);
  assert.deepEqual(await readJson(f.catalog), [
    { id: "fixture", path: "fixture.book.json" },
    { id: "second", path: "second.book.json" },
  ]);
  assert.equal(await fs.readFile(file, "utf8"), before);
  const registered = await fs.readFile(f.catalog, "utf8");
  await registerBook(file, f.catalog, f.publicRoot);
  assert.equal(await fs.readFile(f.catalog, "utf8"), registered);
});

test("registration refuses ID/path conflicts and does not rewrite catalog", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.books, "other.book.json");
  await fs.writeFile(file, JSON.stringify(f.book));
  const before = await fs.readFile(f.catalog, "utf8");
  await assert.rejects(registerBook(file, f.catalog, f.publicRoot), /conflict/);
  assert.equal(await fs.readFile(f.catalog, "utf8"), before);
  f.book.id = "different";
  await fs.writeFile(f.file, JSON.stringify(f.book));
  await assert.rejects(
    registerBook(f.file, f.catalog, f.publicRoot),
    /conflict/,
  );
  assert.equal(await fs.readFile(f.catalog, "utf8"), before);
});

test("catalog shares runtime rules for duplicates, traversal, unknown fields and shelf capacity", async (t) => {
  const f = await fixture(t);
  const bad = [
    [],
    [
      { id: "fixture", path: "fixture.book.json" },
      { id: "fixture", path: "other.book.json" },
    ],
    [
      { id: "fixture", path: "fixture.book.json" },
      { id: "other", path: "fixture.book.json" },
    ],
    [{ id: "fixture", path: "../fixture.book.json" }],
    [{ id: "fixture", path: "/fixture.book.json" }],
    [{ id: "fixture", path: "fixture.book.json", enabled: true }],
    [{ id: "eden", legacyStory: "eden", path: "fixture.book.json" }],
    [{ id: "fixture", legacyStory: "eden" }],
    Array.from({ length: 31 }, (_, i) => ({
      id: `book-${i}`,
      path: `book-${i}.book.json`,
    })),
  ];
  for (const input of bad)
    await assert.rejects(
      validateCatalog(input, f.catalog, f.publicRoot),
      /catalog\.json/,
    );
});

test("catalog reports ID mismatch, missing books and media, and embedded assets", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    validateCatalog(
      [{ id: "other", path: "fixture.book.json" }],
      f.catalog,
      f.publicRoot,
    ),
    /does not match/,
  );
  await assert.rejects(
    validateCatalog(
      [{ id: "missing", path: "missing.book.json" }],
      f.catalog,
      f.publicRoot,
    ),
    /ENOENT/,
  );
  f.book.assets.cover.src = "art/missing.png";
  await fs.writeFile(f.file, JSON.stringify(f.book));
  await assert.rejects(
    validateCatalog(await readJson(f.catalog), f.catalog, f.publicRoot),
    /MISSING_OR_INVALID_ASSET/,
  );
  f.book.assets.cover.src = `data:image/png;base64,${pixel.toString("base64")}`;
  await fs.writeFile(f.file, JSON.stringify(f.book));
  await assert.rejects(
    validateCatalog(await readJson(f.catalog), f.catalog, f.publicRoot),
    /embedded data URIs/,
  );
});

test("registration checks previously registered media before any catalog write", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.books, "second.book.json");
  await fs.writeFile(file, JSON.stringify(fixtureBook("second")));
  f.book.assets.cover.src = "art/missing.png";
  await fs.writeFile(f.file, JSON.stringify(f.book));
  const before = await fs.readFile(f.catalog, "utf8");
  await assert.rejects(
    registerBook(file, f.catalog, f.publicRoot),
    /MISSING_OR_INVALID_ASSET/,
  );
  assert.equal(await fs.readFile(f.catalog, "utf8"), before);
});

test("catalog retains legacy entries and invokes compatibility checks once", async (t) => {
  const f = await fixture(t);
  let count = 0;
  const entries = [
    { id: "eden", legacyStory: "eden" },
    { id: "noah", legacyStory: "noah" },
    { id: "fixture", path: "fixture.book.json" },
  ];
  assert.deepEqual(
    await validateCatalog(entries, f.catalog, f.publicRoot, false, async () => {
      count++;
    }),
    entries,
  );
  assert.equal(count, 1);
  await assert.rejects(
    validateCatalog(entries, f.catalog, f.publicRoot, false, async () => {
      throw Error("legacy fixture failure");
    }),
    /legacy fixture failure/,
  );
});

test("public-root confinement includes symlink escapes for media and catalog books", async (t) => {
  const f = await fixture(t);
  await fs.writeFile(path.join(f.dir, "outside.png"), pixel);
  await fs.symlink(
    path.join(f.dir, "outside.png"),
    path.join(f.publicRoot, "art/escape.png"),
  );
  f.book.assets.cover.src = "art/escape.png";
  await assert.rejects(checkBook(f.book, f.publicRoot), /escapes public root/);
  await fs.writeFile(
    path.join(f.dir, "outside.book.json"),
    JSON.stringify(fixtureBook("outside")),
  );
  await fs.symlink(
    path.join(f.dir, "outside.book.json"),
    path.join(f.books, "outside.book.json"),
  );
  await assert.rejects(
    validateCatalog(
      [{ id: "outside", path: "outside.book.json" }],
      f.catalog,
      f.publicRoot,
    ),
    /escapes books directory/,
  );
});

test("strict validation fails warnings but ordinary drafts remain valid", async (t) => {
  const f = await fixture(t);
  assert.equal((await checkBook(f.book, f.publicRoot)).length, 2);
  await assert.rejects(
    checkBook(f.book, f.publicRoot, true),
    /Missing narration/,
  );
  f.book.assets.audio = {
    kind: "audio",
    src: "audio/test.wav",
    attribution: "Fixture",
  };
  f.book.spreads[0].segments[0].narration = {
    asset: "audio",
    recordedText: "Old words",
    duration: 0.1,
    voice: "Fixture voice",
  };
  await assert.rejects(
    checkBook(f.book, f.publicRoot, true),
    /Stale narration/,
  );
  f.book.spreads[0].segments[0].narration.duration = 1;
  await assert.rejects(checkBook(f.book, f.publicRoot), /AUDIO_DURATION/);
});

test("replacement changes only selected cue and new asset, measuring frames", async (t) => {
  const f = await fixture(t);
  const before = structuredClone(f.book);
  await runBookCli([
    "replace-audio",
    f.file,
    "page-one",
    "first",
    "audio/test.wav",
    "Fixture voice",
    "--public-root",
    f.publicRoot,
  ]);
  const next = await readJson(f.file);
  assert.equal(next.spreads[0].segments[0].narration.duration, 0.1);
  assert.equal(
    next.spreads[0].segments[0].narration.recordedText,
    before.spreads[0].segments[0].text,
  );
  const added = next.spreads[0].segments[0].narration.asset;
  delete next.spreads[0].segments[0].narration;
  delete next.assets[added];
  assert.deepEqual(next, before);
  const valid = await fs.readFile(f.file, "utf8");
  await fs.writeFile(
    path.join(f.publicRoot, "audio/bad.wav"),
    Buffer.from("not audio"),
  );
  await assert.rejects(
    runBookCli([
      "replace-audio",
      f.file,
      "page-one",
      "first",
      "audio/bad.wav",
      "Bad",
      "--public-root",
      f.publicRoot,
    ]),
    /PCM WAV/,
  );
  assert.equal(await fs.readFile(f.file, "utf8"), valid);
});

test("PCM measurement rejects truncated containers and inconsistent frame metadata", () => {
  assert.equal(measureWav(wav(0.25)), 0.25);
  assert.throws(() => measureWav(wav().subarray(0, 45)), /Truncated/);
  const corrupt = wav();
  corrupt.writeUInt32LE(1, 28);
  assert.throws(() => measureWav(corrupt), /Invalid PCM WAV/);
  const compressed = wav();
  compressed.writeUInt16LE(3, 20);
  assert.throws(() => measureWav(compressed), /PCM WAV/);
});

test("single-asset media limit is enforced before reading oversized files", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.publicRoot, "art/large.png");
  const handle = await fs.open(file, "w");
  await handle.truncate(32 * 1024 * 1024 + 1);
  await handle.close();
  f.book.assets.cover.src = "art/large.png";
  await assert.rejects(checkBook(f.book, f.publicRoot), /32 MiB/);
});

test("atomic authoring refuses concurrent edits and cleans staging files", async (t) => {
  const f = await fixture(t);
  const original = await fs.readFile(f.file, "utf8");
  await fs.writeFile(f.file, "user edit");
  await assert.rejects(atomicJson(f.file, f.book, original), /File changed/);
  assert.equal(await fs.readFile(f.file, "utf8"), "user edit");
  assert.deepEqual((await fs.readdir(f.books)).sort(), [
    "catalog.json",
    "fixture.book.json",
  ]);
});

test("CLI subprocess reports validation failures with nonzero exit", async (t) => {
  const f = await fixture(t);
  const execute = promisify(execFile);
  const args = [
    "--import",
    "tsx",
    "scripts/book-cli.ts",
    "validate",
    f.file,
    "--public-root",
    f.publicRoot,
  ];
  const valid = await execute(process.execPath, args, { cwd: prototypeRoot });
  assert.match(valid.stdout, /Valid/);
  assert.match(valid.stderr, /Missing narration/);
  await assert.rejects(
    execute(process.execPath, [...args, "--strict"], { cwd: prototypeRoot }),
    (error: unknown) => {
      assert.equal((error as { code: number }).code, 1);
      return true;
    },
  );
});

test("compressed audio is measured locally when ffmpeg/ffprobe are available", async (t) => {
  const execute = promisify(execFile);
  try {
    await execute("ffmpeg", ["-version"]);
    await execute("ffprobe", ["-version"]);
  } catch {
    t.skip(
      "Optional local ffmpeg/ffprobe are not installed; PCM WAV tests still run.",
    );
    return;
  }
  const f = await fixture(t);
  for (const extension of ["mp3", "ogg"]) {
    await execute("ffmpeg", [
      "-v",
      "error",
      "-i",
      path.join(f.publicRoot, "audio/test.wav"),
      path.join(f.publicRoot, `audio/test.${extension}`),
    ]);
    const measured = await probeMedia(
      {
        kind: "audio",
        src: `audio/test.${extension}`,
        attribution: "Disposable test tone",
      },
      f.publicRoot,
    );
    assert.ok(
      measured.duration && measured.duration > 0 && measured.duration < 1,
    );
    const embedded = await fs.readFile(
      path.join(f.publicRoot, `audio/test.${extension}`),
    );
    const inline = await probeMedia(
      {
        kind: "audio",
        src: `data:audio/${extension === "mp3" ? "mpeg" : "ogg"};base64,${embedded.toString("base64")}`,
        attribution: "Disposable test tone",
      },
      f.publicRoot,
    );
    assert.equal(inline.duration, measured.duration);
  }
});
