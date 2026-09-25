import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import type { AuthoredBook } from "../src/authored-book";
import type { AudioManifest, LocaleData } from "../src/contracts";
import type { ResolvedRoomEntry } from "../src/room-library";
import {
  firstPageMedia,
  SelectedBookPrefetch,
} from "../src/selected-book-prefetch";

const readJson = <T>(file: string): T =>
  JSON.parse(fs.readFileSync(file, "utf8")) as T;
const manifest = readJson<AudioManifest>("public/audio-manifest.json");
const jonah = readJson<AuthoredBook>(
  "public/books/jonah-and-the-whale.book.json",
);
const entry = (id: "eden" | "noah"): ResolvedRoomEntry => ({
  key: `builtin:${id}`,
  storyId: id,
  title: id,
  cover: `./assets/art/${id}-01.webp`,
  appearance: {
    coverColor: "#000000",
    spineColor: "#000000",
    accentColor: "#000000",
  },
});
const jonahEntry: ResolvedRoomEntry = {
  ...entry("eden"),
  key: "book:jonah-and-the-whale",
  book: jonah,
  storyId: undefined,
};
const phoneWindow = { matchMedia: () => ({ matches: true }) };

test("one selected first page resolves local right-sized art and locale audio for all three books", () => {
  const previous = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: phoneWindow,
  });
  try {
    for (const localeId of [
      "en-US",
      "en-GB",
      "es",
      "fr",
      "hi",
      "it",
      "ja",
      "pt-BR",
      "zh-CN",
    ]) {
      const locale = readJson<LocaleData>(`public/content/${localeId}.json`);
      for (const book of [entry("eden"), entry("noah"), jonahEntry]) {
        const media = firstPageMedia(book, locale, manifest);
        assert.ok(media.images.length > 0, `${localeId}/${book.key} art`);
        assert.ok(media.audio.length > 0, `${localeId}/${book.key} audio`);
        assert.ok(media.images.length <= 8, `${book.key} bounded art`);
        assert.ok(media.audio.length <= 3, `${book.key} bounded audio`);
        assert.ok(media.images.every((url) => url.endsWith(".mobile.webp")));
        assert.ok(media.audio.every((url) => url.endsWith(".mp3")));
        for (const url of [...media.images, ...media.audio]) {
          assert.ok(url.startsWith("./assets/"), url);
          assert.ok(fs.existsSync(path.join("public", url.slice(2))), url);
        }
        const encodedBytes = [...media.images, ...media.audio].reduce(
          (bytes, url) =>
            bytes + fs.statSync(path.join("public", url.slice(2))).size,
          0,
        );
        assert.ok(
          encodedBytes <= 650_000,
          `${localeId}/${book.key} first-page prefetch is ${encodedBytes} bytes`,
        );
      }
    }
  } finally {
    if (previous === undefined) Reflect.deleteProperty(globalThis, "window");
    else
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previous,
      });
  }
});

test("changing inspection and returning abort only the selected book's requests", async () => {
  const previous = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: phoneWindow,
  });
  const requested: string[] = [];
  const aborted: string[] = [];
  const fetcher = ((url: string, init: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      requested.push(url);
      init.signal!.addEventListener("abort", () => {
        aborted.push(url);
        reject(new DOMException("Aborted", "AbortError"));
      });
    })) as typeof fetch;
  const prefetch = new SelectedBookPrefetch(fetcher);
  try {
    const locale = readJson<LocaleData>("public/content/en-US.json");
    const first = prefetch.prepare(entry("eden"), locale, manifest);
    assert.equal(
      requested.length,
      4,
      "three art requests and one audio request",
    );
    const second = prefetch.prepare(entry("noah"), locale, manifest);
    assert.ok(aborted.length >= 4, "selection change aborts the old book");
    prefetch.cancel();
    await Promise.all([first, second]);
    assert.equal(aborted.length, requested.length);
    assert.ok(requested.length <= 8, "only two inspected books were requested");
  } finally {
    prefetch.cancel();
    if (previous === undefined) Reflect.deleteProperty(globalThis, "window");
    else
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previous,
      });
  }
});

test("inspection pause runs before prefetch and cannot cancel the new request", async () => {
  const previous = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: phoneWindow,
  });
  const events: string[] = [];
  let aborted = 0;
  const fetcher = ((url: string, init: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      events.push(`fetch:${url}`);
      init.signal!.addEventListener("abort", () => {
        aborted++;
        reject(new DOMException("Aborted", "AbortError"));
      });
    })) as typeof fetch;
  const prefetch = new SelectedBookPrefetch(fetcher);
  try {
    const locale = readJson<LocaleData>("public/content/en-US.json");
    assert.equal(
      await prefetch.inspectSelected(entry("eden"), locale, manifest, () => {
        events.push("pause");
        prefetch.cancel(); // Matches the session's synchronous pause callback.
        return Promise.resolve(true);
      }),
      true,
    );
    assert.equal(events[0], "pause");
    assert.equal(aborted, 0, "inspection pause did not cancel new prefetch");
    assert.ok(events.length > 1, "first-page requests began during inspection");
    prefetch.cancel();
    assert.equal(aborted, events.length - 1);
  } finally {
    prefetch.cancel();
    if (previous === undefined) Reflect.deleteProperty(globalThis, "window");
    else
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previous,
      });
  }
});
