import Ajv from "ajv";
import {
  narrationIssues,
  type AuthoredBook,
  type BookIssue,
} from "./authored-book";
import { reviewIssues } from "./book-localization";

const text = { type: "string", minLength: 1, maxLength: 4000 };
const id = { type: "string", pattern: "^[a-z][a-z0-9-]{0,63}$" };
const locale = {
  type: "string",
  pattern: "^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$",
};
const hexColor = { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" };
const num = (minimum: number, maximum: number) => ({
  type: "number",
  minimum,
  maximum,
});
const choice = (...values: string[]) => ({ enum: values });
const object = (
  properties: Record<string, unknown>,
  required = Object.keys(properties),
) => ({ type: "object", properties, required, additionalProperties: false });
const list = (items: unknown, maxItems: number, minItems = 0) => ({
  type: "array",
  items,
  minItems,
  maxItems,
});
const motion = object(
  {
    preset: choice("rock", "float", "sway", "pulse", "spin"),
    trigger: choice("open", "interaction", "narration"),
    segment: id,
    delay: num(0, 60),
    duration: num(0.2, 30),
    strength: num(0, 20),
    loop: { type: "boolean" },
    repeat: { type: "integer", minimum: 1, maximum: 10 },
  },
  ["preset", "trigger", "duration", "strength"],
);
const imageFlip = { flipX: { type: "boolean" }, flipY: { type: "boolean" } };
const placement = object(
  {
    x: num(-2.8, 2.8),
    depth: num(-1.575, 1.2),
    width: num(0.1, 5.6),
    height: num(0.1, 3.6),
    anchor: choice("bottom", "center"),
    elevation: num(0, 2),
    rotation: num(-45, 45),
  },
  ["x", "depth", "width", "height"],
);
const narration = object({
  asset: id,
  recordedText: text,
  duration: num(0.05, 180),
  voice: text,
});
const segment = object(
  {
    id,
    text,
    narration,
  },
  ["id", "text"],
);
const translatedElement = object(
  {
    id,
    label: text,
    interaction: object({ label: text, response: text }),
  },
  ["id", "label"],
);
const toy = object(
  {
    id,
    label: { type: "string", minLength: 1, maxLength: 60 },
    asset: id,
    pose: object({
      index: { type: "integer", minimum: 0, maximum: 15 },
      columns: { type: "integer", minimum: 1, maximum: 16 },
    }),
    animation: choice("rock", "float", "sway", "pulse", "spin"),
    sound: id,
  },
  ["id", "label", "asset", "animation"],
);
const translation = object({
  sourceFingerprint: { type: "string", minLength: 1, maxLength: 64 },
  title: text,
  subtitle: text,
  source: text,
  retellingNote: text,
  spreads: list(
    object({
      id,
      title: text,
      source: text,
      segments: list(segment, 12, 1),
      elements: list(translatedElement, 16),
    }),
    40,
    1,
  ),
});
export const bookSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Little Light Library book v1",
  ...object(
    {
      format: { const: "little-light-book" },
      version: { const: 1 },
      id,
      title: text,
      subtitle: text,
      locale,
      status: { const: "draft" },
      source: text,
      retellingNote: text,
      cover: id,
      appearance: object({
        coverColor: hexColor,
        spineColor: hexColor,
        accentColor: hexColor,
      }),
      assets: {
        type: "object",
        minProperties: 1,
        maxProperties: 1024,
        propertyNames: id,
        additionalProperties: object({
          kind: choice("image", "audio"),
          src: { type: "string", minLength: 1 },
          attribution: text,
        }),
      },
      spreads: list(
        object(
          {
            id,
            title: text,
            source: text,
            stagingNote: text,
            seconds: num(1, 600),
            segments: list(segment, 12, 1),
            backdrop: object({ asset: id, ...imageFlip }, ["asset"]),
            ground: object(
              {
                asset: id,
                ...imageFlip,
                x: num(-3.05, 3.05),
                depth: num(-1.575, 1.575),
                width: num(0.1, 6.1),
                height: num(0.1, 3.15),
                rotation: num(-180, 180),
                opacity: num(0, 1),
              },
              ["asset", "x", "depth", "width", "height"],
            ),
            elements: list(
              object(
                {
                  id,
                  label: text,
                  kind: choice("actor", "prop"),
                  asset: id,
                  ...imageFlip,
                  pose: object({
                    index: { type: "integer", minimum: 0, maximum: 15 },
                    columns: { type: "integer", minimum: 1, maximum: 16 },
                  }),
                  placement,
                  motion,
                  interaction: object(
                    {
                      label: text,
                      response: text,
                      sound: choice("tap"),
                      effect: choice("hop", "hold-rock"),
                    },
                    ["label", "response"],
                  ),
                },
                ["id", "label", "kind", "asset", "placement"],
              ),
              16,
            ),
          },
          [
            "id",
            "title",
            "source",
            "stagingNote",
            "segments",
            "backdrop",
            "elements",
          ],
        ),
        40,
        1,
      ),
      languages: {
        type: "array",
        items: locale,
        minItems: 1,
        maxItems: 32,
        uniqueItems: true,
      },
      translations: {
        type: "object",
        maxProperties: 32,
        propertyNames: locale,
        additionalProperties: translation,
      },
      soundtracks: list(
        object({
          id,
          label: text,
          asset: id,
          startPage: id,
          endPage: id,
          startOffset: num(0, 3600),
          endOffset: num(0, 3600),
          volume: num(0, 1),
          fadeIn: num(0, 60),
          fadeOut: num(0, 60),
          loop: { type: "boolean" },
        }),
        64,
      ),
      narrationVolume: num(0, 1),
      narrationSettings: {
        type: "object",
        maxProperties: 32,
        propertyNames: locale,
        additionalProperties: object({ voice: text, speed: num(0.5, 2) }),
      },
      reviews: list(
        object({
          locale,
          pageId: id,
          fingerprint: { type: "string", minLength: 1, maxLength: 64 },
          reviewedAt: { type: "string", minLength: 1, maxLength: 64 },
        }),
        2048,
      ),
      toys: list(toy, 4),
    },
    [
      "format",
      "version",
      "id",
      "title",
      "subtitle",
      "locale",
      "status",
      "source",
      "retellingNote",
      "cover",
      "assets",
      "spreads",
    ],
  ),
};
const schemaValidate = new Ajv({ allErrors: true, strict: false }).compile(
  bookSchema,
);
export function safeAssetSource(src: string, kind: "image" | "audio") {
  const inline =
    kind === "image"
      ? /^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/]+=*$/
      : /^data:audio\/(wav|x-wav|mpeg|ogg);base64,[A-Za-z0-9+/]+=*$/;
  if (src.startsWith("data:")) return inline.test(src);
  return (
    /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)+\.(webp|png|jpe?g|wav|mp3|ogg)$/.test(
      src,
    ) && !src.split("/").some((part) => part === ".." || part === ".")
  );
}
export function validateBook(input: unknown): {
  book?: AuthoredBook;
  errors: BookIssue[];
  warnings: BookIssue[];
} {
  if (!schemaValidate(input))
    return {
      errors: (schemaValidate.errors || []).map((e) => ({
        path: e.instancePath || "/",
        message: `SCHEMA: ${e.message}${e.params.additionalProperty ? ` (${e.params.additionalProperty})` : ""}. Use the v1 contract.`,
      })),
      warnings: [],
    };
  const book = input as unknown as AuthoredBook;
  const errors: BookIssue[] = [];
  const error = (path: string, message: string) =>
    errors.push({ path, message });
  if (["eden", "noah"].includes(book.id))
    error(
      "/id",
      "RESERVED_ID: Choose a new ID; Eden and Noah cannot be replaced.",
    );
  const ref = (asset: string, kind: "image" | "audio", path: string) => {
    if (!Object.hasOwn(book.assets, asset))
      error(path, `ASSET_REFERENCE: '${asset}' is missing from /assets.`);
    else if (book.assets[asset].kind !== kind)
      error(path, `ASSET_KIND: '${asset}' must be ${kind}.`);
  };
  const unique = (values: { id: string }[], path: string) => {
    const seen = new Set<string>();
    values.forEach((value, i) => {
      if (seen.has(value.id))
        error(
          `${path}/${i}/id`,
          `DUPLICATE_ID: '${value.id}' must be unique here.`,
        );
      seen.add(value.id);
    });
  };
  for (const [key, asset] of Object.entries(book.assets))
    if (!safeAssetSource(asset.src, asset.kind))
      error(
        `/assets/${key}/src`,
        "UNSAFE_ASSET: Use a public-root relative media path or supported embedded media; external URLs, traversal and scripts are unsupported.",
      );
  ref(book.cover, "image", "/cover");
  unique(book.toys ?? [], "/toys");
  (book.toys ?? []).forEach((toy, index) => {
    const path = `/toys/${index}`;
    ref(toy.asset, "image", `${path}/asset`);
    if (toy.sound) ref(toy.sound, "audio", `${path}/sound`);
    if (toy.pose && toy.pose.index >= toy.pose.columns)
      error(
        `${path}/pose/index`,
        "POSE: index must be smaller than columns (zero-based).",
      );
  });
  unique(book.spreads, "/spreads");
  book.spreads.forEach((spread, i) => {
    const p = `/spreads/${i}`;
    ref(spread.backdrop.asset, "image", `${p}/backdrop/asset`);
    if (spread.ground) ref(spread.ground.asset, "image", `${p}/ground/asset`);
    unique(spread.segments, `${p}/segments`);
    unique(spread.elements, `${p}/elements`);
    spread.segments.forEach((segment, j) => {
      if (segment.narration)
        ref(
          segment.narration.asset,
          "audio",
          `${p}/segments/${j}/narration/asset`,
        );
    });
    spread.elements.forEach((element, j) => {
      const ep = `${p}/elements/${j}`;
      ref(element.asset, "image", `${ep}/asset`);
      if (element.pose && element.pose.index >= element.pose.columns)
        error(
          `${ep}/pose/index`,
          "POSE: index must be smaller than columns (zero-based).",
        );
      const m = element.motion;
      if (m?.trigger === "interaction" && !element.interaction)
        error(
          `${ep}/motion/trigger`,
          "INTERACTION: Add interaction labels/response for this trigger.",
        );
      if (
        m?.trigger === "narration" &&
        !spread.segments.some((s) => s.id === m.segment)
      )
        error(
          `${ep}/motion/segment`,
          "SEGMENT_REFERENCE: Choose a segment ID on this spread.",
        );
      if (m?.trigger !== "narration" && m?.segment)
        error(
          `${ep}/motion/segment`,
          "SEGMENT_TRIGGER: segment only applies to narration triggers.",
        );
    });
  });

  if (book.languages && !book.languages.includes(book.locale))
    error(
      "/languages",
      `SOURCE_LOCALE: Include the source locale '${book.locale}'.`,
    );
  for (const [locale, translation] of Object.entries(book.translations ?? {})) {
    const tp = `/translations/${locale.replaceAll("~", "~0").replaceAll("/", "~1")}`;
    unique(translation.spreads, `${tp}/spreads`);
    translation.spreads.forEach((spread, i) => {
      unique(spread.segments, `${tp}/spreads/${i}/segments`);
      unique(spread.elements, `${tp}/spreads/${i}/elements`);
      spread.segments.forEach((segment, j) => {
        if (segment.narration)
          ref(
            segment.narration.asset,
            "audio",
            `${tp}/spreads/${i}/segments/${j}/narration/asset`,
          );
      });
    });
    if (locale === book.locale)
      error(
        tp,
        "SOURCE_TRANSLATION: The source locale uses the main book text, not a translation entry.",
      );
  }

  unique(book.soundtracks ?? [], "/soundtracks");
  const pageIndex = new Map(book.spreads.map(({ id }, index) => [id, index]));
  const pageDuration = book.spreads.map((spread) =>
    Math.max(
      spread.seconds ?? 8,
      spread.segments.reduce(
        (total, segment) => total + (segment.narration?.duration ?? 0),
        0,
      ),
    ),
  );
  (book.soundtracks ?? []).forEach((track, i) => {
    const path = `/soundtracks/${i}`;
    ref(track.asset, "audio", `${path}/asset`);
    const start = pageIndex.get(track.startPage);
    const end = pageIndex.get(track.endPage);
    if (start === undefined)
      error(
        `${path}/startPage`,
        `PAGE_REFERENCE: '${track.startPage}' is not a spread.`,
      );
    if (end === undefined)
      error(
        `${path}/endPage`,
        `PAGE_REFERENCE: '${track.endPage}' is not a spread.`,
      );
    if (start !== undefined && end !== undefined) {
      if (start > end)
        error(
          `${path}/endPage`,
          "TRACK_RANGE: endPage must be the same as or later than startPage.",
        );
      else {
        const duration = pageDuration
          .slice(start, end + 1)
          .reduce((total, seconds) => total + seconds, 0);
        if (track.startOffset + track.endOffset >= duration)
          error(
            `${path}/endOffset`,
            `TRACK_OFFSETS: Combined offsets must leave time inside the ${duration}-second page range.`,
          );
      }
    }
  });

  const reviewLocales = new Set([
    book.locale,
    ...Object.keys(book.translations ?? {}),
  ]);
  const obsoleteReviews: BookIssue[] = [];
  const seenReviews = new Set<string>();
  (book.reviews ?? []).forEach((review, i) => {
    const path = `/reviews/${i}`;
    const key = `${review.locale}\u0000${review.pageId}`;
    if (seenReviews.has(key))
      error(
        path,
        `DUPLICATE_REVIEW: '${review.locale}/${review.pageId}' may be reviewed once.`,
      );
    seenReviews.add(key);
    if (!reviewLocales.has(review.locale))
      obsoleteReviews.push({
        path: `${path}/locale`,
        message: `OBSOLETE_REVIEW: '${review.locale}' is no longer the source or a stored translation; this historical review is ignored.`,
      });
    if (!pageIndex.has(review.pageId))
      obsoleteReviews.push({
        path: `${path}/pageId`,
        message: `OBSOLETE_REVIEW: '${review.pageId}' is no longer a spread; this historical review is ignored.`,
      });
  });

  const productionEnabled = Boolean(
    book.languages ||
      book.translations ||
      book.soundtracks ||
      book.narrationSettings ||
      book.reviews,
  );
  return {
    book: errors.length ? undefined : book,
    errors,
    warnings: [
      ...(productionEnabled ? reviewIssues(book) : narrationIssues(book)),
      ...obsoleteReviews,
    ],
  };
}
export type AssetProbe = (
  asset: AuthoredBook["assets"][string],
) => Promise<{ duration?: number }>;
export async function validateBookAssets(
  book: AuthoredBook,
  probe: AssetProbe,
): Promise<BookIssue[]> {
  const errors: BookIssue[] = [];
  // Serial reads bound decoding memory for large embedded packages.
  for (const [id, asset] of Object.entries(book.assets)) {
    try {
      const measured = await probe(asset);
      if (asset.kind === "audio") {
        const check = (duration: number, path: string) => {
          if (
            measured.duration === undefined ||
            Math.abs(measured.duration - duration) > 0.04
          )
            errors.push({
              path,
              message: `AUDIO_DURATION: '${id}' measures ${measured.duration?.toFixed(4) ?? "unknown"} seconds; update its measured duration.`,
            });
        };
        for (const [i, spread] of book.spreads.entries())
          for (const [j, segment] of spread.segments.entries())
            if (segment.narration?.asset === id)
              check(
                segment.narration.duration,
                `/spreads/${i}/segments/${j}/narration/duration`,
              );
        for (const [locale, translation] of Object.entries(
          book.translations ?? {},
        ))
          for (const [i, spread] of translation.spreads.entries())
            for (const [j, segment] of spread.segments.entries())
              if (segment.narration?.asset === id)
                check(
                  segment.narration.duration,
                  `/translations/${locale.replaceAll("~", "~0").replaceAll("/", "~1")}/spreads/${i}/segments/${j}/narration/duration`,
                );
      }
    } catch (e) {
      errors.push({
        path: `/assets/${id}/src`,
        message: `MISSING_OR_INVALID_ASSET: ${String(e)}. Replace the file or fix its src.`,
      });
    }
  }
  return errors;
}
