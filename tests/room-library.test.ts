import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import type { LocaleData } from "../src/contracts";
import { sourceTranslation } from "../src/book-localization";
import { resolveBook } from "../src/book-localization";
import { parseCatalog } from "../src/book-catalog";
import {
  DEFAULT_BOOK_APPEARANCE,
  layoutCoverTitle,
  wrapCoverTitle,
} from "../src/book-cover";
import type { AuthoredBook, BookAppearance } from "../src/authored-book";
import { RoomLibrary } from "../src/room-library";

import { readerFixture as fixture } from "../scripts/reader-fixture";
const locale = (): LocaleData =>
  JSON.parse(fs.readFileSync("public/content/en-US.json", "utf8"));

function repository(
  catalog: unknown,
  books: Record<string, unknown> = { "fixture-book.book.json": fixture() },
) {
  const requests: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    requests.push(url);
    if (url === "./books/catalog.json") return Response.json(catalog);
    const book = books[url.replace(/^\.\/books\//, "")];
    return book === undefined
      ? new Response("Missing committed file", { status: 404 })
      : Response.json(book);
  };
  return { room: new RoomLibrary({ fetch: fetcher }), requests };
}

const approximateCoverWidth = (text: string) =>
  Array.from(text).reduce(
    (width, char) => width + (/\p{Script=Han}/u.test(char) ? 30 : 14),
    0,
  );

test("public catalog contains only the three story books and no extra book files", () => {
  const catalog = JSON.parse(
    fs.readFileSync("public/books/catalog.json", "utf8"),
  );
  assert.deepEqual(
    catalog.map(({ id }: { id: string }) => id),
    ["eden", "noah", "jonah-and-the-whale"],
  );
  assert.deepEqual(
    fs
      .readdirSync("public/books")
      .filter((name) => name.endsWith(".book.json")),
    ["jonah-and-the-whale.book.json"],
  );
});

test("every shelf book has a distinct explicit cover palette", () => {
  const catalog = parseCatalog(
    JSON.parse(fs.readFileSync("public/books/catalog.json", "utf8")),
  );
  const palettes = catalog.map((entry) => {
    if (entry.legacyStory) return entry.appearance ?? DEFAULT_BOOK_APPEARANCE;
    const book = JSON.parse(
      fs.readFileSync(`public/books/${entry.path}`, "utf8"),
    ) as AuthoredBook;
    assert.ok(book.appearance, `${book.id} should declare its cover palette`);
    return book.appearance as BookAppearance;
  });
  for (const key of ["coverColor", "spineColor", "accentColor"] as const) {
    assert.equal(
      new Set(palettes.map((appearance) => appearance[key])).size,
      catalog.length,
      `each book should have its own ${key}`,
    );
  }
});

test("catalog appearances reject missing, unknown, or malformed palette fields", () => {
  for (const appearance of [
    { coverColor: "#fff", spineColor: "#123456", accentColor: "#abcdef" },
    {
      coverColor: "#123456",
      spineColor: "#234567",
      accentColor: "#345678",
      extra: "#456789",
    },
    { coverColor: "#123456", spineColor: "#234567" },
  ])
    assert.throws(
      () => parseCatalog([{ id: "eden", legacyStory: "eden", appearance }]),
      /appearance/i,
    );
});

test("cover-title wrapping keeps long Latin and CJK titles within the print", () => {
  for (const title of [
    "Jonah and the Whale: A Journey through the Storm",
    "约拿与大鱼：在风暴中学习顺服",
  ]) {
    const lines = wrapCoverTitle(title, approximateCoverWidth);
    assert.ok(lines.length > 1, `${title} should use multiple lines`);
    assert.ok(lines.every((line) => approximateCoverWidth(line) <= 310));
    assert.equal(lines.join("").replace(/\s/gu, ""), title.replace(/\s/gu, ""));
  }
});

test("room entries resolve the same appearance contract from legacy and JSON sources", async () => {
  const legacyPalette = {
    coverColor: "#536c45",
    spineColor: "#344831",
    accentColor: "#d5b46a",
  };
  const authoredPalette = {
    coverColor: "#315e78",
    spineColor: "#21445a",
    accentColor: "#d9a94e",
  };
  const book = fixture();
  book.appearance = authoredPalette;
  const { room } = repository(
    [
      { id: "eden", legacyStory: "eden", appearance: legacyPalette },
      { id: book.id, path: "fixture-book.book.json" },
    ],
    { "fixture-book.book.json": book },
  );
  const entries = await room.resolve(locale());
  assert.deepEqual(
    entries.map(({ appearance }) => appearance),
    [legacyPalette, authoredPalette],
  );
});

test("Jonah's authored story and narration cover all nine reader locales", () => {
  const book = JSON.parse(
    fs.readFileSync("public/books/jonah-and-the-whale.book.json", "utf8"),
  ) as AuthoredBook;
  const expected = fs
    .readdirSync("public/content")
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
  assert.equal(expected.length, 9, "the library currently ships nine locales");
  assert.deepEqual([...book.languages!].sort(), expected);
  assert.deepEqual(
    [book.locale, ...Object.keys(book.translations ?? {})].sort(),
    expected,
  );
  for (const localeId of expected) {
    const localized = resolveBook(book, localeId);
    const titleLayout = layoutCoverTitle(
      localized.title,
      (text, fontSize) => approximateCoverWidth(text) * (fontSize / 30),
    );
    assert.ok(titleLayout.lines.length > 0, `${localeId} cover title`);
    assert.ok(
      titleLayout.lines.length <= 4,
      `${localeId} cover title fits the four-line title area`,
    );
    assert.ok(
      titleLayout.lines.every(
        (line) =>
          approximateCoverWidth(line) * (titleLayout.fontSize / 30) <= 310,
      ),
      `${localeId} cover title stays within the cover print`,
    );
    assert.equal(localized.spreads.length, book.spreads.length, localeId);
    localized.spreads.forEach((spread, index) => {
      assert.equal(
        spread.id,
        book.spreads[index].id,
        `${localeId} spread order`,
      );
      assert.equal(spread.segments.length, book.spreads[index].segments.length);
      spread.segments.forEach((segment) => {
        assert.ok(segment.text.trim(), `${localeId}/${spread.id} text`);
        assert.ok(segment.narration, `${localeId}/${spread.id} narration`);
        assert.equal(
          segment.narration?.recordedText,
          segment.text,
          `${localeId}/${spread.id} narration text match`,
        );
        const asset = segment.narration
          ? book.assets[segment.narration.asset]
          : undefined;
        assert.equal(
          asset?.kind,
          "audio",
          `${localeId}/${spread.id} audio asset`,
        );
        assert.ok(
          asset && fs.existsSync(`public/${asset.src}`),
          `${localeId}/${spread.id} audio file exists`,
        );
      });
    });
  }
});

test("committed order mixes legacy stories and generic books without browser storage", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw Error("The injected fetch must serve all catalog requests");
  });
  const stored = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");
  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    get() {
      throw Error("Reader must not access browser authoring storage");
    },
  });
  try {
    const { room, requests } = repository([
      { id: "noah", legacyStory: "noah" },
      { id: "fixture-book", path: "fixture-book.book.json" },
      { id: "eden", legacyStory: "eden" },
    ]);
    const content = locale();
    const resolved = await room.resolve(content);
    assert.deepEqual(
      resolved.map(({ key }) => key),
      ["builtin:noah", "book:fixture-book", "builtin:eden"],
    );
    assert.equal(
      resolved[0].title,
      content.stories.find(({ id }) => id === "noah")!.title,
    );
    assert.equal(resolved[0].storyId, "noah");
    assert.equal(resolved[1].title, fixture().title);
    assert.equal(resolved[1].book!.id, "fixture-book");
    assert.equal(
      resolved[1].cover,
      `./${fixture().assets[fixture().cover].src}`,
    );
    assert.equal(resolved[2].storyId, "eden");
    assert.deepEqual(
      requests.sort(),
      ["./books/catalog.json", "./books/fixture-book.book.json"].sort(),
    );
  } finally {
    if (stored) Object.defineProperty(globalThis, "indexedDB", stored);
    else Reflect.deleteProperty(globalThis, "indexedDB");
  }
});

test("unregistered repository books stay off the shelf", async () => {
  const { room, requests } = repository([{ id: "eden", legacyStory: "eden" }]);
  assert.deepEqual(
    (await room.resolve(locale())).map(({ key }) => key),
    ["builtin:eden"],
  );
  assert.deepEqual(requests, ["./books/catalog.json"]);
});

test("localized shelf titles preserve source text and translations for later reading", async () => {
  const book = fixture();
  const translation = sourceTranslation(book);
  translation.title = "Titre français";
  book.languages = [book.locale, "fr"];
  book.translations = { fr: translation };
  const content = locale();
  content.id = "fr";
  const { room } = repository(
    [{ id: book.id, path: "fixture-book.book.json" }],
    { "fixture-book.book.json": book },
  );
  const [resolved] = await room.resolve(content);
  assert.equal(resolved.title, translation.title);
  assert.deepEqual(resolved.book, book);
  assert.notEqual(resolved.book, book);
});

test("an unavailable book translation retains the source-language shelf title", async () => {
  const content = locale();
  content.id = "fr";
  const { room } = repository([
    { id: "fixture-book", path: "fixture-book.book.json" },
  ]);
  const [resolved] = await room.resolve(content);
  assert.equal(resolved.title, fixture().title);
  assert.equal(resolved.book!.locale, "en-US");
});

test("missing committed book fails visibly instead of silently shrinking the catalog", async () => {
  const { room } = repository([{ id: "missing", path: "missing.book.json" }]);
  await assert.rejects(room.resolve(locale()), /missing|404/i);
});

test("catalog failures can recover on a later resolve", async () => {
  let failing = true;
  const room = new RoomLibrary({
    fetch: async () =>
      failing
        ? new Response("Unavailable", { status: 503 })
        : Response.json([{ id: "eden", legacyStory: "eden" }]),
  });
  await assert.rejects(room.resolve(locale()), /catalog|503/i);
  failing = false;
  assert.deepEqual(
    (await room.resolve(locale())).map(({ key }) => key),
    ["builtin:eden"],
  );
});

test("invalid generic content fails before it becomes a readable room entry", async () => {
  const book = fixture();
  book.spreads[0].backdrop.asset = "missing-art";
  const { room } = repository(
    [{ id: book.id, path: "fixture-book.book.json" }],
    { "fixture-book.book.json": book },
  );
  await assert.rejects(
    room.resolve(locale()),
    /backdrop|missing-art|ASSET_REFERENCE/i,
  );
});
