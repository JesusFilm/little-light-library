import assert from "node:assert/strict";
import test from "node:test";
import type { AuthoredBook, BookTranslation } from "../src/authored-book";
import {
  auditBook,
  isAssetUsed,
  productionLanguages,
  resolveBook,
  reviewFingerprint,
  reviewIssues,
  sourceFingerprint,
  sourceTranslation,
  translationIssues,
} from "../src/book-localization";
import { validateBook, validateBookAssets } from "../src/book-validation";

import { readerFixture as fixture } from "../scripts/reader-fixture";

const translatedBook = () => {
  const book = fixture();
  const translation = sourceTranslation(book);
  translation.title = "Jardin tranquille";
  translation.subtitle = "Une histoire de lumière";
  translation.source = "Genèse 1–2";
  translation.retellingNote = "Adaptation française de test.";
  for (const spread of translation.spreads) {
    spread.title = `FR ${spread.title}`;
    spread.source = `FR ${spread.source}`;
    spread.segments.forEach((segment) => {
      segment.text = `FR ${segment.text}`;
      const original = book.spreads
        .find(({ id }) => id === spread.id)!
        .segments.find(({ id }) => id === segment.id)!;
      segment.narration = original.narration
        ? {
            ...original.narration,
            recordedText: segment.text,
            voice: "fr-test",
          }
        : undefined;
    });
    spread.elements.forEach((element) => {
      element.label = `FR ${element.label}`;
      if (element.interaction)
        element.interaction = {
          label: `FR ${element.interaction.label}`,
          response: `FR ${element.interaction.response}`,
        };
    });
  }
  book.languages = ["en-US", "fr-FR"];
  book.translations = { "fr-FR": translation };
  book.narrationSettings = {
    "en-US": { voice: "source-voice", speed: 1 },
    "fr-FR": { voice: "fr-voice", speed: 0.9 },
  };
  return book;
};

const addSoundtrack = (book: AuthoredBook) => {
  book.assets.music = {
    kind: "audio",
    src: "assets/audio/garden-made.wav",
    attribution: "Test soundtrack",
  };
  book.soundtracks = [
    {
      id: "garden-score",
      label: "Garden score",
      asset: "music",
      startPage: book.spreads[0].id,
      endPage: book.spreads[1].id,
      startOffset: 0.5,
      endOffset: 0.5,
      volume: 0.4,
      fadeIn: 1,
      fadeOut: 1,
      loop: true,
    },
  ];
};

test("source translation and fingerprint cover source text with stable ordering", () => {
  const book = fixture();
  const translation = sourceTranslation(book);
  assert.equal(translation.sourceFingerprint, sourceFingerprint(book));
  assert.equal(translation.spreads[0].segments[0].narration, undefined);
  assert.equal(
    translation.spreads[0].elements[1].interaction?.response,
    book.spreads[0].elements[1].interaction?.response,
  );
  const insertionOrder = { ...book, assets: { ...book.assets } };
  assert.equal(sourceFingerprint(insertionOrder), sourceFingerprint(book));
  book.spreads[0].segments[0].text += " Changed.";
  assert.notEqual(sourceFingerprint(book), translation.sourceFingerprint);
  const localeChanged = fixture();
  localeChanged.locale = "en-GB";
  assert.notEqual(
    sourceFingerprint(localeChanged),
    sourceFingerprint(fixture()),
  );
});

test("production languages put the source first and localized resolution preserves visuals and sound behavior", () => {
  const book = translatedBook();
  book.languages = ["fr-FR", "en-US", "fr-FR"];
  assert.deepEqual(productionLanguages(book), ["en-US", "fr-FR"]);
  const resolved = resolveBook(book, "fr-FR");
  assert.equal(resolved.locale, "fr-FR");
  assert.equal(resolved.title, "Jardin tranquille");
  assert.match(resolved.spreads[0].segments[0].text, /^FR /);
  assert.equal(resolved.spreads[0].elements[0].asset, "actor");
  assert.equal(resolved.spreads[0].elements[1].interaction?.sound, "tap");
  assert.equal(
    resolved.spreads[0].elements[1].interaction?.label.startsWith("FR "),
    true,
  );
  assert.equal(book.spreads[0].segments[0].text.startsWith("FR "), false);
  assert.notEqual(resolved, book);

  const reorderedSegments = translatedBook();
  reorderedSegments.translations!["fr-FR"].spreads[0].segments.reverse();
  assert.deepEqual(
    resolveBook(reorderedSegments, "fr-FR").spreads[0].segments.map(
      ({ id }) => id,
    ),
    reorderedSegments.spreads[0].segments.map(({ id }) => id),
  );

  const incomplete = translatedBook();
  incomplete.translations!["fr-FR"].spreads[0].segments.pop();
  assert.throws(
    () => resolveBook(incomplete, "fr-FR"),
    /INCOMPLETE_TRANSLATION/,
  );
  assert.throws(() => resolveBook(book, "ja"), /MISSING_TRANSLATION/);
});

test("translation freshness and completeness are draft warnings rather than save errors", () => {
  const book = translatedBook();
  book.title += " revised";
  book.translations!["fr-FR"].spreads[0].elements.pop();
  const issues = translationIssues(book, "fr-FR");
  assert.ok(
    issues.some(({ message }) => message.startsWith("STALE_TRANSLATION")),
  );
  assert.ok(
    issues.some(({ message }) => message.startsWith("INCOMPLETE_TRANSLATION")),
  );
  const validation = validateBook(book);
  assert.ok(validation.book);
  assert.deepEqual(validation.errors, []);
  assert.ok(
    validation.warnings.some(({ path }) =>
      path.startsWith("/translations/fr-FR"),
    ),
  );
  assert.equal(
    validation.warnings.filter(({ message }) =>
      message.startsWith("MISSING_REVIEW"),
    ).length,
    4,
  );
});

test("page review fingerprints cover rendered media and soundtrack timing but exclude reviews and generation preferences", () => {
  const book = translatedBook();
  addSoundtrack(book);
  const page = book.spreads[0].id;
  const original = reviewFingerprint(book, "fr-FR", page);
  book.reviews = [
    {
      locale: "fr-FR",
      pageId: page,
      fingerprint: "unrelated",
      reviewedAt: "2026-09-20T00:00:00.000Z",
    },
  ];
  book.narrationSettings!["fr-FR"].voice = "another-generator-voice";
  assert.equal(reviewFingerprint(book, "fr-FR", page), original);

  const changedMedia = structuredClone(book);
  changedMedia.assets[changedMedia.spreads[0].backdrop.asset].src =
    "assets/art/theatre/changed.webp";
  assert.notEqual(reviewFingerprint(changedMedia, "fr-FR", page), original);

  const changedTiming = structuredClone(book);
  changedTiming.spreads[1].seconds = 30;
  assert.notEqual(reviewFingerprint(changedTiming, "fr-FR", page), original);
  const reordered = structuredClone(book);
  reordered.spreads.reverse();
  reordered.translations!["fr-FR"].spreads.reverse();
  reordered.translations!["fr-FR"].sourceFingerprint =
    sourceFingerprint(reordered);
  assert.notEqual(reviewFingerprint(reordered, "fr-FR", page), original);
});

test("all requested locale pages require explicit current reviews", () => {
  const book = translatedBook();
  addSoundtrack(book);
  const initialAudit = auditBook(book);
  assert.deepEqual(
    initialAudit.map(({ locale }) => locale),
    productionLanguages(book),
  );
  for (const language of initialAudit)
    for (const page of language.pages)
      assert.equal(
        page.fingerprint,
        reviewFingerprint(book, language.locale, page.id),
      );
  assert.equal(
    reviewIssues(book).filter(({ message }) =>
      message.startsWith("MISSING_REVIEW"),
    ).length,
    4,
  );
  book.reviews = initialAudit.flatMap((language) =>
    language.pages.map((page) => ({
      locale: language.locale,
      pageId: page.id,
      fingerprint: page.fingerprint,
      reviewedAt: "2026-09-20T00:00:00.000Z",
    })),
  );
  assert.deepEqual(reviewIssues(book), []);
  assert.ok(
    auditBook(book).every((language) =>
      language.pages.every((page) => page.reviewed && !page.issues.length),
    ),
  );
  book.spreads[1].ground!.rotation = 12;
  const stale = reviewIssues(book).filter(({ message }) =>
    message.startsWith("STALE_REVIEW"),
  );
  assert.equal(stale.length, 2);
  assert.ok(stale.every(({ path }) => path.endsWith("/page-2")));
});

test("audit reports incomplete locales without resolving partial pages", () => {
  const book = translatedBook();
  book.translations!["fr-FR"].spreads[0].segments.pop();
  const french = auditBook(book).find(({ locale }) => locale === "fr-FR")!;
  assert.ok(
    french.issues.some(({ message }) =>
      message.startsWith("INCOMPLETE_TRANSLATION"),
    ),
  );
  assert.ok(french.pages.every((page) => page.fingerprint === ""));
  assert.ok(
    french.pages.every((page) =>
      page.issues.some(({ message }) => message.startsWith("MISSING_REVIEW")),
    ),
  );
});

test("audit resolves a complete book only once per requested locale", () => {
  const book = translatedBook();
  const nativeClone = structuredClone;
  let bookClones = 0;
  Object.defineProperty(globalThis, "structuredClone", {
    configurable: true,
    value: <T>(value: T) => {
      if (value === book) bookClones++;
      return nativeClone(value);
    },
  });
  try {
    const audit = auditBook(book);
    assert.equal(audit.length, 2);
    assert.equal(bookClones, 2);
  } finally {
    Object.defineProperty(globalThis, "structuredClone", {
      configurable: true,
      value: nativeClone,
    });
  }
});

test("asset usage includes source, localized narration and soundtrack references", () => {
  const book = translatedBook();
  book.assets["fr-only"] = {
    kind: "audio",
    src: "assets/audio/garden-made.wav",
    attribution: "French test",
  };
  book.translations!["fr-FR"].spreads[0].segments[0].narration!.asset =
    "fr-only";
  addSoundtrack(book);
  assert.equal(isAssetUsed(book, "cover-art"), true);
  assert.equal(isAssetUsed(book, "fr-only"), true);
  assert.equal(isAssetUsed(book, "music"), true);
  book.assets.unused = {
    kind: "image",
    src: "assets/art/theatre/unused.webp",
    attribution: "Unused test",
  };
  assert.equal(isAssetUsed(book, "unused"), false);
});

test("production schema and semantic validation enforce references, uniqueness, ranges and expanded asset capacity", () => {
  const valid = translatedBook();
  addSoundtrack(valid);
  for (let i = 0; i < 130; i++)
    valid.assets[`unused-${i}`] = {
      kind: "image",
      src: `assets/art/unused-${i}.webp`,
      attribution: "Capacity test",
    };
  assert.deepEqual(validateBook(valid).errors, []);

  const mutations: [(book: AuthoredBook) => void, RegExp][] = [
    [
      (book) => {
        book.languages = ["fr-FR"];
      },
      /SOURCE_LOCALE/,
    ],
    [
      (book) => {
        book.soundtracks![0].asset = "missing";
      },
      /ASSET_REFERENCE/,
    ],
    [
      (book) => {
        book.soundtracks![0].startPage = book.spreads[1].id;
        book.soundtracks![0].endPage = book.spreads[0].id;
      },
      /TRACK_RANGE/,
    ],
    [
      (book) => {
        book.soundtracks![0].startOffset = 1_000;
      },
      /TRACK_OFFSETS/,
    ],
    [
      (book) => {
        book.soundtracks!.push({ ...book.soundtracks![0] });
      },
      /DUPLICATE_ID/,
    ],
    [
      (book) => {
        book.translations!["fr-FR"].spreads[0].segments[0].narration!.asset =
          "missing";
      },
      /ASSET_REFERENCE/,
    ],
  ];
  for (const [mutate, expected] of mutations) {
    const book = translatedBook();
    addSoundtrack(book);
    mutate(book);
    assert.match(
      validateBook(book)
        .errors.map(({ message }) => message)
        .join("\n"),
      expected,
    );
  }

  const retained = translatedBook();
  retained.languages = [retained.locale];
  retained.narrationSettings!.de = { voice: "de-test", speed: 0.75 };
  retained.reviews = [
    {
      locale: "fr-FR",
      pageId: retained.spreads[0].id,
      fingerprint: "v1-old",
      reviewedAt: "2026-09-20T00:00:00.000Z",
    },
  ];
  assert.deepEqual(validateBook(retained).errors, []);

  const obsolete = translatedBook();
  obsolete.reviews = [
    {
      locale: "de",
      pageId: "deleted-page",
      fingerprint: "v1-old",
      reviewedAt: "2026-09-20T00:00:00.000Z",
    },
  ];
  const obsoleteResult = validateBook(obsolete);
  assert.ok(obsoleteResult.book);
  assert.equal(
    obsoleteResult.warnings.filter(({ message }) =>
      message.startsWith("OBSOLETE_REVIEW"),
    ).length,
    2,
  );

  const malformed = translatedBook() as AuthoredBook & {
    translations: Record<string, BookTranslation & { extra?: boolean }>;
  };
  malformed.translations["fr-FR"].extra = true;
  assert.equal(validateBook(malformed).book, undefined);
});

test("media validation measures localized narration definitions", async () => {
  const book = translatedBook();
  const localized = book.translations!["fr-FR"].spreads[0].segments[0];
  localized.narration = {
    ...localized.narration!,
    duration: localized.narration!.duration + 1,
  };
  const errors = await validateBookAssets(book, async (asset) => {
    const sourceCue = book.spreads
      .flatMap(({ segments }) => segments)
      .find(({ narration }) => narration?.asset === localized.narration!.asset);
    return asset.kind === "audio"
      ? { duration: sourceCue?.narration?.duration ?? 1 }
      : {};
  });
  assert.ok(
    errors.some(({ path }) =>
      path.startsWith("/translations/fr-FR/spreads/0/segments/0/narration"),
    ),
  );
});

test("toy artwork, labels, motion and sound invalidate author review", () => {
  const book = fixture();
  const page = book.spreads[0].id;
  const before = reviewFingerprint(book, book.locale, page);
  book.toys = [
    {
      id: "tree",
      label: "Tree",
      asset: book.spreads[0].elements[0].asset,
      animation: "rock",
      sound: book.spreads[0].segments[0].narration!.asset,
    },
  ];
  const withToy = reviewFingerprint(book, book.locale, page);
  assert.notEqual(withToy, before);
  book.toys[0].animation = "spin";
  assert.notEqual(reviewFingerprint(book, book.locale, page), withToy);
  const beforeSound = reviewFingerprint(book, book.locale, page);
  book.assets[book.toys[0].sound!].src = "audio/changed.wav";
  assert.notEqual(reviewFingerprint(book, book.locale, page), beforeSound);
});
