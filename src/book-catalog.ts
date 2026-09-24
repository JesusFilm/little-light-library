import type { BookAppearance } from "./authored-book";

/** The committed shelf order. Legacy entries preserve existing rigs and locales. */
export type CatalogEntry =
  | {
      id: string;
      legacyStory: "eden" | "noah";
      appearance?: BookAppearance;
      path?: never;
    }
  | { id: string; path: string; legacyStory?: never };

export const ROOM_SHELF_LIMIT = 30;
const validAppearance = (value: unknown): value is BookAppearance =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 3 &&
      ["coverColor", "spineColor", "accentColor"].every(
        (key) =>
          typeof (value as Record<string, unknown>)[key] === "string" &&
          /^#[\da-f]{6}$/i.test((value as Record<string, string>)[key]),
      ),
  );

export function parseCatalog(value: unknown): CatalogEntry[] {
  if (!Array.isArray(value) || !value.length || value.length > ROOM_SHELF_LIMIT)
    throw Error("books/catalog.json: expected 1–30 ordered book entries.");
  const ids = new Set<string>();
  const paths = new Set<string>();
  return value.map((entry, index) => {
    const location = `books/catalog.json[${index}]`;
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof entry.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)
    )
      throw Error(`${location}: expected a stable slug id.`);
    if (ids.has(entry.id))
      throw Error(`${location}: duplicate id ${entry.id}.`);
    ids.add(entry.id);
    if (
      Object.keys(entry).some(
        (key) => !["id", "path", "legacyStory", "appearance"].includes(key),
      )
    )
      throw Error(`${location}: unsupported catalog setting.`);
    if (entry.legacyStory !== undefined) {
      if (
        !["eden", "noah"].includes(entry.legacyStory) ||
        entry.id !== entry.legacyStory ||
        entry.path !== undefined
      )
        throw Error(
          `${location}: legacyStory must match eden/noah with no path.`,
        );
      if (entry.appearance !== undefined && !validAppearance(entry.appearance))
        throw Error(
          `${location}: appearance must define valid coverColor, spineColor and accentColor hex colors.`,
        );
      return {
        id: entry.id,
        legacyStory: entry.legacyStory,
        ...(entry.appearance ? { appearance: entry.appearance } : {}),
      };
    }
    if (
      typeof entry.path !== "string" ||
      !/^[a-z0-9-]+\.book\.json$/.test(entry.path) ||
      ["eden", "noah"].includes(entry.id) ||
      entry.appearance !== undefined
    )
      throw Error(
        `${location}: expected a relative .book.json filename and non-reserved id.`,
      );
    if (paths.has(entry.path))
      throw Error(`${location}: duplicate path ${entry.path}.`);
    paths.add(entry.path);
    return { id: entry.id, path: entry.path };
  });
}
