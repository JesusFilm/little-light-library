import assert from "node:assert/strict";
import test from "node:test";
import { mobileImageUrl, shelfCoverUrl } from "../src/mobile-images";

test("known phone media use derivatives; new book and fixture art retain their paths", () => {
  const previous = globalThis.window;
  try {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { matchMedia: () => ({ matches: true }) },
    });
    assert.equal(
      mobileImageUrl("./assets/art/theatre/garden.webp"),
      "./assets/art/theatre/garden.mobile.webp",
    );
    assert.equal(
      mobileImageUrl("./assets/art/jonah/whale-cutout.png"),
      "./assets/art/jonah/whale-cutout.mobile.webp",
    );
    assert.equal(
      shelfCoverUrl("./assets/art/eden-01.webp"),
      "./assets/art/eden-01.cover.webp",
    );
    assert.equal(
      mobileImageUrl("./assets/books/new-story/art/cover.webp"),
      "./assets/books/new-story/art/cover.webp",
    );
    assert.equal(
      shelfCoverUrl("./assets/books/new-story/art/cover.webp"),
      "./assets/books/new-story/art/cover.webp",
    );
  } finally {
    if (previous === undefined) Reflect.deleteProperty(globalThis, "window");
    else
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previous,
      });
  }
});

test("wide screens keep full-size artwork and covers", () => {
  const previous = globalThis.window;
  try {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { matchMedia: () => ({ matches: false }) },
    });
    assert.equal(
      mobileImageUrl("./assets/art/theatre/garden.webp"),
      "./assets/art/theatre/garden.webp",
    );
    assert.equal(
      shelfCoverUrl("./assets/art/eden-01.webp"),
      "./assets/art/eden-01.webp",
    );
  } finally {
    if (previous === undefined) Reflect.deleteProperty(globalThis, "window");
    else
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previous,
      });
  }
});
