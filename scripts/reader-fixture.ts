import fs from "node:fs";
import path from "node:path";
import type { AuthoredBook } from "../src/authored-book";
import type { LocaleData } from "../src/contracts";

// Test-only adapter: borrow existing Noah recordings without publishing another book.
// Never import this helper from the reader or copy its output into public/.
export function readerFixture(publicRoot = "public"): AuthoredBook {
  const content = JSON.parse(
    fs.readFileSync(path.join(publicRoot, "content/en-US.json"), "utf8"),
  ) as LocaleData;
  const audio = JSON.parse(
    fs.readFileSync(path.join(publicRoot, "audio-manifest.json"), "utf8"),
  ) as Record<string, { src: string; duration: number }>;
  const image = (src: string) => ({
    kind: "image" as const,
    src,
    attribution:
      "Existing library artwork reused by a disposable test fixture.",
  });
  const book: AuthoredBook = {
    format: "little-light-book",
    version: 1,
    id: "fixture-book",
    title: "Disposable reader fixture",
    subtitle: "Not a library book",
    locale: "en-US",
    status: "draft",
    source: "Existing Noah retelling, used only for regression tests.",
    retellingNote:
      "Test-only playback adapter, not a new story or approved staging.",
    cover: "cover-art",
    assets: {
      "cover-art": image("assets/art/noah-01.webp"),
      backdrop: image("assets/art/theatre/shipyard.webp"),
      ground: image("assets/art/theatre/garden-floor.webp"),
      actor: image("assets/art/theatre/noah-poses.webp"),
      prop: image("assets/art/theatre/timber-bench.webp"),
    },
    spreads: [],
  };
  const pages = content.stories
    .find(({ id }) => id === "noah")!
    .pages.slice(0, 2);
  book.spreads = pages.map((page, index) => ({
    id: `page-${index + 1}`,
    title: `Fixture page ${index + 1}`,
    source: page.passage,
    stagingNote:
      "Synthetic regression composition; not intended for the shelf.",
    segments: page.segments.map((segment, cue) => {
      const asset = `cue-${index + 1}-${cue + 1}`;
      const recording = audio[`en-US/noah/${page.id}/${segment.id}`];
      book.assets[asset] = {
        kind: "audio",
        src: recording.src,
        attribution:
          "Existing Kokoro Noah recording reused for regression tests.",
      };
      return {
        ...segment,
        narration: {
          asset,
          recordedText: segment.text,
          duration: recording.duration,
          voice: "af_heart",
        },
      };
    }),
    backdrop: { asset: "backdrop" },
    ground: { asset: "ground", x: 0, depth: 0, width: 5, height: 2 },
    elements: [
      {
        id: "actor",
        label: "Test actor",
        kind: "actor",
        asset: "actor",
        pose: { index: 0, columns: 3 },
        placement: {
          x: -0.7,
          depth: -0.2,
          width: 1.1,
          height: 2,
          anchor: "bottom",
        },
        motion: {
          preset: "rock",
          trigger: "narration",
          segment: page.segments[1].id,
          duration: 1.4,
          strength: 4,
        },
      },
      {
        id: "prop",
        label: "Test prop",
        kind: "prop",
        asset: "prop",
        placement: {
          x: 1.4,
          depth: 0.1,
          width: 1.4,
          height: 1,
          anchor: "bottom",
        },
        interaction: {
          label: "Touch the test prop",
          response: "Fixture interaction received.",
          sound: "tap",
        },
      },
    ],
  }));
  return book;
}
