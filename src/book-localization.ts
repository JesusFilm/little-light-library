import {
  narrationIssues,
  type AuthoredBook,
  type BookIssue,
  type BookTranslation,
} from "./authored-book";

const pointer = (value: string) =>
  value.replaceAll("~", "~0").replaceAll("/", "~1");

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
    );
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

const fingerprint = (value: unknown, version = "v1") => {
  let hash = 0x811c9dc5;
  for (const character of stableJson(value)) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${version}-${hash.toString(16).padStart(8, "0")}`;
};

const sourceShape = (book: AuthoredBook) => ({
  locale: book.locale,
  title: book.title,
  subtitle: book.subtitle,
  source: book.source,
  retellingNote: book.retellingNote,
  spreads: book.spreads.map((spread) => ({
    id: spread.id,
    title: spread.title,
    source: spread.source,
    segments: spread.segments.map(({ id, text }) => ({ id, text })),
    elements: spread.elements.map(({ id, label, interaction }) => ({
      id,
      label,
      ...(interaction
        ? {
            interaction: {
              label: interaction.label,
              response: interaction.response,
            },
          }
        : {}),
    })),
  })),
});

export function sourceFingerprint(book: AuthoredBook): string {
  return fingerprint(sourceShape(book));
}

export function sourceTranslation(book: AuthoredBook): BookTranslation {
  const { locale: _locale, ...translation } = sourceShape(book);
  return {
    sourceFingerprint: sourceFingerprint(book),
    ...structuredClone(translation),
  };
}

export function productionLanguages(book: AuthoredBook): string[] {
  return [
    book.locale,
    ...new Set(
      (book.languages ?? []).filter((locale) => locale !== book.locale),
    ),
  ];
}

export function translationIssues(
  book: AuthoredBook,
  locale: string,
): BookIssue[] {
  if (locale === book.locale) return [];
  const path = `/translations/${pointer(locale)}`;
  const translation = book.translations?.[locale];
  if (!translation)
    return [{ path, message: `MISSING_TRANSLATION: Add ${locale} text.` }];

  const issues: BookIssue[] = [];
  const issue = (suffix: string, message: string) =>
    issues.push({ path: `${path}${suffix}`, message });
  if (translation.sourceFingerprint !== sourceFingerprint(book))
    issue(
      "/sourceFingerprint",
      "STALE_TRANSLATION: Source-language text changed after this translation was made.",
    );

  const matchIds = <T extends { id: string }>(
    source: T[],
    translated: T[],
    suffix: string,
  ) => {
    const wanted = new Set(source.map(({ id }) => id));
    const actual = new Set(translated.map(({ id }) => id));
    for (const id of wanted)
      if (!actual.has(id))
        issue(
          suffix,
          `INCOMPLETE_TRANSLATION: Missing '${id}' from the source structure.`,
        );
    for (const id of actual)
      if (!wanted.has(id))
        issue(
          suffix,
          `OUTDATED_TRANSLATION: '${id}' is not in the source structure.`,
        );
  };

  matchIds(book.spreads, translation.spreads, "/spreads");
  for (const spread of book.spreads) {
    const translated = translation.spreads.find(({ id }) => id === spread.id);
    if (!translated) continue;
    const spreadIndex = translation.spreads.indexOf(translated);
    matchIds(
      spread.segments,
      translated.segments,
      `/spreads/${spreadIndex}/segments`,
    );
    matchIds(
      spread.elements,
      translated.elements,
      `/spreads/${spreadIndex}/elements`,
    );
    for (const element of spread.elements) {
      const localized = translated.elements.find(({ id }) => id === element.id);
      if (element.interaction && !localized?.interaction)
        issue(
          `/spreads/${spreadIndex}/elements`,
          `INCOMPLETE_TRANSLATION: Interaction text is missing for '${element.id}'.`,
        );
      if (!element.interaction && localized?.interaction)
        issue(
          `/spreads/${spreadIndex}/elements`,
          `OUTDATED_TRANSLATION: '${element.id}' has interaction text without a source interaction.`,
        );
    }
  }
  return issues;
}

export function resolveBook(book: AuthoredBook, locale: string): AuthoredBook {
  const resolved = structuredClone(book);
  if (locale === book.locale) return resolved;
  const issues = translationIssues(book, locale);
  if (issues.length)
    throw new Error(
      issues.map(({ path, message }) => `${path}: ${message}`).join("\n"),
    );
  const translation = book.translations![locale];
  resolved.locale = locale;
  resolved.title = translation.title;
  resolved.subtitle = translation.subtitle;
  resolved.source = translation.source;
  resolved.retellingNote = translation.retellingNote;
  for (const spread of resolved.spreads) {
    const localized = translation.spreads.find(({ id }) => id === spread.id)!;
    spread.title = localized.title;
    spread.source = localized.source;
    spread.segments = spread.segments.map((segment) =>
      structuredClone(localized.segments.find(({ id }) => id === segment.id)!),
    );
    for (const element of spread.elements) {
      const text = localized.elements.find(({ id }) => id === element.id)!;
      element.label = text.label;
      if (element.interaction && text.interaction)
        element.interaction = {
          ...text.interaction,
          ...(element.interaction.sound
            ? { sound: element.interaction.sound }
            : {}),
          ...(element.interaction.effect
            ? { effect: element.interaction.effect }
            : {}),
        };
    }
  }
  return resolved;
}

const pageSeconds = (book: AuthoredBook) =>
  book.spreads.map((spread) =>
    Math.max(
      spread.seconds ?? 8,
      spread.segments.reduce(
        (total, segment) => total + (segment.narration?.duration ?? 0),
        0,
      ),
    ),
  );

const soundtrackTouches = (
  book: AuthoredBook,
  pageIndex: number,
  startPage: string,
  endPage: string,
) => {
  const start = book.spreads.findIndex(({ id }) => id === startPage);
  const end = book.spreads.findIndex(({ id }) => id === endPage);
  return start >= 0 && end >= start && pageIndex >= start && pageIndex <= end;
};

const assetDigests = (book: AuthoredBook) => {
  const digests = new Map<string, string>();
  return (id: string) => {
    let digest = digests.get(id);
    if (!digest) {
      digest = fingerprint(book.assets[id] ?? null);
      digests.set(id, digest);
    }
    return digest;
  };
};

const resolvedReviewFingerprint = (
  resolved: AuthoredBook,
  locale: string,
  pageIndex: number,
  digestAsset: (id: string) => string,
  timelineSeconds: number[],
) => {
  const page = resolved.spreads[pageIndex];
  const soundtracks = (resolved.soundtracks ?? []).filter((track) =>
    soundtrackTouches(resolved, pageIndex, track.startPage, track.endPage),
  );
  const assetIds = new Set<string>([resolved.cover, page.backdrop.asset]);
  if (page.ground) assetIds.add(page.ground.asset);
  page.elements.forEach(({ asset }) => assetIds.add(asset));
  page.segments.forEach(({ narration }) => {
    if (narration) assetIds.add(narration.asset);
  });
  soundtracks.forEach(({ asset }) => assetIds.add(asset));
  resolved.toys?.forEach(({ asset, sound }) => {
    assetIds.add(asset);
    if (sound) assetIds.add(sound);
  });
  const assets = Object.fromEntries(
    [...assetIds].sort().map((id) => [id, digestAsset(id)]),
  );
  return fingerprint(
    {
      locale,
      book: {
        title: resolved.title,
        subtitle: resolved.subtitle,
        source: resolved.source,
        retellingNote: resolved.retellingNote,
        cover: resolved.cover,
        narrationVolume: resolved.narrationVolume ?? 1,
        ...(resolved.toys?.length ? { toys: resolved.toys } : {}),
      },
      pageIndex,
      page,
      timeline: resolved.spreads.map(({ id }, index) => ({
        id,
        seconds: timelineSeconds[index],
      })),
      soundtracks,
      assets,
    },
    "v2",
  );
};

export function reviewFingerprint(
  book: AuthoredBook,
  locale: string,
  pageId: string,
): string {
  const resolved = resolveBook(book, locale);
  const pageIndex = resolved.spreads.findIndex(({ id }) => id === pageId);
  if (pageIndex < 0) throw new Error(`Unknown page '${pageId}'.`);
  return resolvedReviewFingerprint(
    resolved,
    locale,
    pageIndex,
    assetDigests(book),
    pageSeconds(resolved),
  );
}

export interface BookAuditPage {
  id: string;
  index: number;
  fingerprint: string;
  issues: BookIssue[];
  reviewed: boolean;
}

export interface BookAuditLanguage {
  locale: string;
  issues: BookIssue[];
  pages: BookAuditPage[];
}

export function auditBook(book: AuthoredBook): BookAuditLanguage[] {
  const digestAsset = assetDigests(book);
  const audit: BookAuditLanguage[] = [];
  for (const locale of productionLanguages(book)) {
    const translation = translationIssues(book, locale);
    const resolved = translation.length ? undefined : resolveBook(book, locale);
    const timelineSeconds = resolved ? pageSeconds(resolved) : [];
    const pages = book.spreads.map((spread, index) => {
      const issues: BookIssue[] = [];
      let pageFingerprint = "";
      if (resolved) {
        pageFingerprint = resolvedReviewFingerprint(
          resolved,
          locale,
          index,
          digestAsset,
          timelineSeconds,
        );
        for (const narration of narrationIssues({
          ...resolved,
          spreads: [resolved.spreads[index]],
        }))
          issues.push({
            path: `${locale === book.locale ? "" : `/translations/${pointer(locale)}`}${narration.path.replace("/spreads/0", `/spreads/${index}`)}`,
            message: narration.message,
          });
      }
      const reviewPath = `/reviews/${pointer(locale)}/${pointer(spread.id)}`;
      const reviews = (book.reviews ?? []).filter(
        (review) => review.locale === locale && review.pageId === spread.id,
      );
      if (!reviews.length) {
        issues.push({
          path: reviewPath,
          message: "MISSING_REVIEW: Review this rendered page explicitly.",
        });
      } else if (resolved && reviews[0].fingerprint !== pageFingerprint)
        issues.push({
          path: reviewPath,
          message:
            "STALE_REVIEW: Rendered page content, media, or timeline changed after review.",
        });
      return {
        id: spread.id,
        index,
        fingerprint: pageFingerprint,
        issues,
        reviewed:
          Boolean(pageFingerprint) &&
          reviews.some((review) => review.fingerprint === pageFingerprint),
      };
    });
    audit.push({ locale, issues: translation, pages });
  }
  return audit;
}

export function reviewIssues(book: AuthoredBook): BookIssue[] {
  return auditBook(book).flatMap((language) => [
    ...language.issues,
    ...language.pages.flatMap((page) => page.issues),
  ]);
}

export function isAssetUsed(book: AuthoredBook, id: string): boolean {
  if (book.cover === id) return true;
  if (
    (book.toys ?? []).some(({ asset, sound }) => asset === id || sound === id)
  )
    return true;
  for (const spread of book.spreads) {
    if (spread.backdrop.asset === id || spread.ground?.asset === id)
      return true;
    if (spread.elements.some(({ asset }) => asset === id)) return true;
    if (spread.segments.some(({ narration }) => narration?.asset === id))
      return true;
  }
  for (const translation of Object.values(book.translations ?? {}))
    for (const spread of translation.spreads)
      if (spread.segments.some(({ narration }) => narration?.asset === id))
        return true;
  return (book.soundtracks ?? []).some(({ asset }) => asset === id);
}
