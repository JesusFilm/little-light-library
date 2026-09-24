import * as THREE from "three";
import type { BookAppearance } from "./authored-book";

/** Safe palette for older v1 files that predate authored cover identity. */
export const DEFAULT_BOOK_APPEARANCE: Readonly<BookAppearance> = {
  coverColor: "#315954",
  spineColor: "#244642",
  accentColor: "#caa96b",
};

export function resolveBookAppearance(
  appearance?: Partial<BookAppearance>,
): BookAppearance {
  const color = (value: unknown, fallback: string) =>
    typeof value === "string" && /^#[\da-f]{6}$/i.test(value)
      ? value.toLowerCase()
      : fallback;
  return {
    coverColor: color(
      appearance?.coverColor,
      DEFAULT_BOOK_APPEARANCE.coverColor,
    ),
    spineColor: color(
      appearance?.spineColor,
      DEFAULT_BOOK_APPEARANCE.spineColor,
    ),
    accentColor: color(
      appearance?.accentColor,
      DEFAULT_BOOK_APPEARANCE.accentColor,
    ),
  };
}

function coverTitle(context: CanvasRenderingContext2D, title: string) {
  context.fillStyle = "#fff0d1";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const layout = layoutCoverTitle(title, (value, size) => {
    context.font = `600 ${size}px Georgia, serif`;
    return context.measureText(value).width;
  });
  context.font = `600 ${layout.fontSize}px Georgia, serif`;
  const lineHeight = layout.fontSize + 6;
  layout.lines.forEach((text, index, all) =>
    context.fillText(
      text,
      192,
      474 + (index - (all.length - 1) / 2) * lineHeight,
      310,
    ),
  );
}

function graphemes(value: string) {
  const IntlWithSegmenter = Intl as unknown as {
    Segmenter?: new (
      locales?: string | string[],
      options?: { granularity: "grapheme" },
    ) => { segment(input: string): Iterable<{ segment: string }> };
  };
  const segmenter = IntlWithSegmenter.Segmenter
    ? new IntlWithSegmenter.Segmenter(undefined, { granularity: "grapheme" })
    : undefined;
  return segmenter
    ? Array.from(segmenter.segment(value), ({ segment }) => segment)
    : Array.from(value);
}

/** Wraps word-separated scripts and grapheme-heavy scripts within the cover width. */
export function wrapCoverTitle(
  title: string,
  measure: (text: string) => number,
  maxWidth = 310,
) {
  const lines: string[] = [];
  let line = "";
  for (const word of title.trim().split(/\s+/u).filter(Boolean)) {
    const joined = line ? `${line} ${word}` : word;
    if (measure(joined) <= maxWidth) {
      line = joined;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    for (const character of graphemes(word)) {
      if (line && measure(line + character) > maxWidth) {
        lines.push(line);
        line = "";
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Shrinks lengthy localized titles until they fit the cover's four-line title area. */
export function layoutCoverTitle(
  title: string,
  measureAtSize: (text: string, fontSize: number) => number,
  maxWidth = 310,
  maxLines = 4,
) {
  let best: { fontSize: number; lines: string[] } | undefined;
  for (let fontSize = 30; fontSize >= 10; fontSize -= 2) {
    const lines = wrapCoverTitle(
      title,
      (text) => measureAtSize(text, fontSize),
      maxWidth,
    );
    best = { fontSize, lines };
    if (lines.length <= maxLines) return best;
  }
  // Keep all words for exceptionally long titles; the narrow font still stays
  // inside the cover width and makes the complete title discoverable.
  return best ?? { fontSize: 10, lines: [] };
}

/** The same finished cover artwork is used by the shelf and the physical table book. */
export function createBookCoverTexture(
  title: string,
  artwork?: THREE.Texture,
  palette?: Partial<BookAppearance>,
) {
  const appearance = resolveBookAppearance(palette);
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 576;
  const context = canvas.getContext("2d")!;
  context.fillStyle = appearance.coverColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = appearance.accentColor;
  context.lineWidth = 10;
  context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  if (artwork?.image) {
    const image = artwork.image as CanvasImageSource & {
      width: number;
      height: number;
    };
    const scale = Math.min(324 / image.width, 355 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.drawImage(
      image,
      30 + (324 - width) / 2,
      30 + (355 - height) / 2,
      width,
      height,
    );
  }
  coverTitle(context, title);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.bookAppearance = appearance;
  return texture;
}

export function createBookSpineTexture(
  title: string,
  palette?: Partial<BookAppearance>,
) {
  const appearance = resolveBookAppearance(palette);
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 768;
  const context = canvas.getContext("2d")!;
  context.fillStyle = appearance.spineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = appearance.accentColor;
  context.lineWidth = 5;
  context.strokeRect(12, 20, 136, 728);
  context.translate(80, 384);
  context.rotate(Math.PI / 2);
  context.fillStyle = "#fff0d1";
  context.font = "600 48px Georgia, serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(title, 0, 0, 660);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.bookAppearance = appearance;
  return texture;
}
