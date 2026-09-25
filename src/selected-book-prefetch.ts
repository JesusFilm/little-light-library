import type { AudioManifest, LocaleData } from "./contracts";
import type { ResolvedRoomEntry } from "./room-library";
import { stageDirections } from "./stage-direction";
import { legacyStageImageSources, stageAssetUrl } from "./legacy-stage-media";
import { mobileImageUrl } from "./mobile-images";
import {
  productionLanguages,
  resolveBook,
  translationIssues,
} from "./book-localization";
import { buildBookTimeline } from "./book-audio";

const unique = (urls: string[]) => [...new Set(urls)];
const bookAssetUrl = (src: string) =>
  src.startsWith("/") ? `.${src}` : src.startsWith("./") ? src : `./${src}`;

/** URLs the reader itself needs for page one in the selected locale. */
export function firstPageMedia(
  entry: ResolvedRoomEntry,
  locale: LocaleData,
  manifest: AudioManifest,
): { images: string[]; audio: string[] } {
  if (entry.book) {
    const language =
      productionLanguages(entry.book).includes(locale.id) &&
      !translationIssues(entry.book, locale.id).length
        ? locale.id
        : entry.book.locale;
    const book = resolveBook(entry.book, language);
    const spread = book.spreads[0];
    const imageIds = [
      book.cover,
      spread.backdrop.asset,
      ...(spread.ground ? [spread.ground.asset] : []),
      ...spread.elements.map((element) => element.asset),
    ];
    const timeline = buildBookTimeline(book);
    const first = timeline.pages[0];
    const audioIds = timeline.clips
      .filter((clip) => clip.start < first.end && clip.end > first.start)
      .map((clip) => clip.asset);
    return {
      images: unique(
        imageIds.map((id) => mobileImageUrl(bookAssetUrl(book.assets[id].src))),
      ),
      audio: unique(audioIds.map((id) => bookAssetUrl(book.assets[id].src))),
    };
  }

  const story = locale.stories.find(({ id }) => id === entry.storyId);
  const first = story?.pages[0];
  if (!story || !first) return { images: [], audio: [] };
  const direction = stageDirections[first.id];
  return {
    images: direction
      ? unique(
          legacyStageImageSources(direction).map((source) =>
            mobileImageUrl(stageAssetUrl(source)),
          ),
        )
      : [mobileImageUrl(bookAssetUrl(first.image))],
    audio: unique(
      first.segments
        .map(
          (segment) =>
            manifest[`${locale.id}/${story.id}/${first.id}/${segment.id}`],
        )
        .filter((cue) => Boolean(cue?.src))
        .map((cue) => bookAssetUrl(cue.src)),
    ),
  };
}

/** Warm only the inspected book's encoded HTTP cache; never decode page art. */
export class SelectedBookPrefetch {
  private controller?: AbortController;

  constructor(
    private readonly fetcher: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  cancel() {
    this.controller?.abort();
    this.controller = undefined;
  }

  /** Let inspection's synchronous pause run before beginning network work. */
  async inspectSelected(
    entry: ResolvedRoomEntry,
    locale: LocaleData,
    manifest: AudioManifest,
    beginInspection: () => Promise<boolean>,
  ): Promise<boolean> {
    const inspection = beginInspection();
    void this.prepare(entry, locale, manifest).catch(() => {});
    try {
      const accepted = await inspection;
      if (!accepted) this.cancel();
      return accepted;
    } catch (error) {
      this.cancel();
      throw error;
    }
  }

  async prepare(
    entry: ResolvedRoomEntry,
    locale: LocaleData,
    manifest: AudioManifest,
  ): Promise<void> {
    this.cancel();
    if (
      typeof window === "undefined" ||
      !window.matchMedia?.("(max-width: 900px)").matches ||
      (typeof navigator !== "undefined" &&
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData)
    )
      return;

    const media = firstPageMedia(entry, locale, manifest);
    // New unoptimized books keep their original image paths and remain fully
    // readable. Only known right-sized derivatives and compressed cues are
    // speculatively transferred on constrained connections.
    const images = media.images
      .filter((src) => src.endsWith(".mobile.webp"))
      .slice(0, 8);
    const audio = media.audio.filter((src) => src.endsWith(".mp3")).slice(0, 3);
    const controller = new AbortController();
    this.controller = controller;
    const warm = async (urls: string[], parallel: number) => {
      let next = 0;
      await Promise.all(
        Array.from({ length: Math.min(parallel, urls.length) }, async () => {
          while (!controller.signal.aborted && next < urls.length) {
            const url = urls[next++];
            try {
              const response = await this.fetcher(url, {
                signal: controller.signal,
              });
              if (response.ok) await response.arrayBuffer();
            } catch {
              // Inspection remains usable; the reader performs its normal retry.
            }
          }
        }),
      );
    };
    await Promise.all([warm(images, 3), warm(audio, 1)]);
    if (this.controller === controller) this.controller = undefined;
  }
}
