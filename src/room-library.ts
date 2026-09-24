import type { AuthoredBook } from "./authored-book";
import type { BookAppearance } from "./authored-book";
import { resolveBookAppearance } from "./book-cover";
import { parseCatalog } from "./book-catalog";
import { resolveBook } from "./book-localization";
import { validateBook } from "./book-validation";
import type { LocaleData } from "./contracts";
export { ROOM_SHELF_LIMIT } from "./book-catalog";
export interface ResolvedRoomEntry {
  key: string;
  title: string;
  cover: string;
  appearance: BookAppearance;
  book?: AuthoredBook;
  storyId?: string;
}
/** No storage or generation: every visitor reads the same committed catalog. */
export class RoomLibrary {
  private readonly fetcher: typeof globalThis.fetch;
  constructor(options: { fetch?: typeof globalThis.fetch } = {}) {
    this.fetcher = options.fetch ?? globalThis.fetch.bind(globalThis);
  }
  private async json(url: string) {
    const response = await this.fetcher(url);
    if (!response.ok)
      throw Error(`${url}: HTTP ${response.status}. Please retry.`);
    return response.json();
  }
  async resolve(locale: LocaleData): Promise<ResolvedRoomEntry[]> {
    const catalog = parseCatalog(await this.json("./books/catalog.json"));
    return Promise.all(
      catalog.map(async (entry) => {
        if (entry.legacyStory) {
          const story = locale.stories.find(
            ({ id }) => id === entry.legacyStory,
          );
          if (!story)
            throw Error(`Catalog ${entry.id}: missing ${locale.id} story.`);
          return {
            key: `builtin:${entry.id}`,
            storyId: entry.id,
            title: story.title,
            cover: story.pages[0].image,
            appearance: resolveBookAppearance(entry.appearance),
          };
        }
        const result = validateBook(await this.json(`./books/${entry.path}`));
        if (!result.book)
          throw Error(
            `${entry.path}: ${result.errors.map(({ path, message }) => `${path}: ${message}`).join("; ")}`,
          );
        const book = result.book;
        if (book.id !== entry.id)
          throw Error(`${entry.path}: id must match catalog ${entry.id}.`);
        for (const [id, asset] of Object.entries(book.assets)) {
          if (asset.src.startsWith("data:"))
            throw Error(
              `${entry.path} assets.${id}: extract embedded media to public/ before registration.`,
            );
        }
        let title = book.title;
        try {
          title = resolveBook(book, locale.id).title;
        } catch {
          /* Fall back to the book's source language. */
        }
        return {
          key: `book:${entry.id}`,
          title,
          cover: `./${book.assets[book.cover].src}`,
          appearance: resolveBookAppearance(book.appearance),
          book,
        };
      }),
    );
  }
}
