import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { TestContext } from "node:test";
import type { AuthoredBook } from "../src/authored-book";

export const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
export function wav(seconds = 0.1) {
  const frames = Math.round(seconds * 24000);
  const bytes = Buffer.alloc(44 + frames * 2);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(24000, 24);
  bytes.writeUInt32LE(48000, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(frames * 2, 40);
  for (let frame = 0; frame < frames; frame++)
    bytes.writeInt16LE(Math.round(Math.sin(frame / 20) * 2000), 44 + frame * 2);
  return bytes;
}

export function fixtureBook(id = "fixture"): AuthoredBook {
  return {
    format: "little-light-book",
    version: 1,
    id,
    title: "Disposable fixture",
    subtitle: "Tool tests",
    locale: "en-US",
    status: "draft",
    source: "Synthetic test fixture, not Scripture.",
    retellingNote: "Disposable tooling fixture.",
    cover: "cover",
    assets: {
      cover: { kind: "image", src: "art/pixel.png", attribution: "Test pixel" },
    },
    spreads: [
      {
        id: "page-one",
        title: "Fixture",
        source: "Synthetic",
        stagingNote: "None",
        segments: [
          { id: "first", text: "Local tooling test." },
          { id: "second", text: "Second test cue." },
        ],
        backdrop: { asset: "cover" },
        elements: [],
      },
    ],
  };
}

export async function fixture(t: TestContext) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "little-light-tools-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const publicRoot = path.join(dir, "public");
  const books = path.join(publicRoot, "books");
  await fs.mkdir(books, { recursive: true });
  await fs.mkdir(path.join(publicRoot, "art"));
  await fs.writeFile(path.join(publicRoot, "art/pixel.png"), pixel);
  await fs.mkdir(path.join(publicRoot, "audio"));
  await fs.writeFile(path.join(publicRoot, "audio/test.wav"), wav());
  const file = path.join(books, "fixture.book.json");
  const catalog = path.join(books, "catalog.json");
  const book = fixtureBook();
  await fs.writeFile(file, JSON.stringify(book, null, 2) + "\n");
  await fs.writeFile(
    catalog,
    JSON.stringify([{ id: book.id, path: "fixture.book.json" }], null, 2) +
      "\n",
  );
  return { dir, publicRoot, books, file, catalog, book };
}

export const readJson = async (file: string) =>
  JSON.parse(await fs.readFile(file, "utf8"));
