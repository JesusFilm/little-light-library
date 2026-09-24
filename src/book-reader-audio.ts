import type { AuthoredBook } from "./authored-book";
import { BookAudio } from "./book-audio";

/** Reader pages and the production timeline share the same mixer and decoded timing. */
export class BookNarration {
  readonly player: BookAudio;
  private page = 0;
  private book?: AuthoredBook;
  private generation = 0;
  private pending = false;
  get narrationCurrent() {
    return !!this.book?.spreads[this.page]?.segments.every(
      (segment) => segment.narration?.recordedText === segment.text,
    );
  }
  get narrationActive() {
    return (
      this.narrationCurrent &&
      this.player.playing &&
      this.clock.position <
        this.clock.durations.reduce((sum, value) => sum + value, 0)
    );
  }
  readonly clock;
  constructor(readonly context: AudioContext) {
    this.player = new BookAudio(context);
    const self = this;
    this.clock = {
      get durations() {
        return self.player.timeline.pages[self.page]?.segmentDurations ?? [];
      },
      get total() {
        return self.player.timeline.pages[self.page]?.duration ?? 0;
      },
      get position() {
        return Math.max(
          0,
          self.player.position -
            (self.player.timeline.pages[self.page]?.start ?? 0),
        );
      },
      get playing() {
        return self.player.playing;
      },
      get ended() {
        return this.total > 0 && this.position >= this.total;
      },
      get segment() {
        if (!self.narrationCurrent) return -1;
        let end = 0;
        for (const [index, duration] of this.durations.entries()) {
          end += duration;
          if (this.position < end) return index;
        }
        return Math.max(0, this.durations.length - 1);
      },
    };
  }
  async loadBook(
    book: AuthoredBook,
    page: number,
    options: { preserveSoundtracks?: boolean } = {},
  ) {
    const token = ++this.generation;
    this.pending = true;
    try {
      if (this.book !== book) {
        this.book = undefined;
        if (!(await this.player.load(book)) || token !== this.generation)
          return false;
        this.book = book;
      }
      if (token !== this.generation) return false;
      this.page = page;
      const range = this.player.timeline.pages[page];
      this.player.setPageRange(
        range.start,
        range.end,
        options.preserveSoundtracks ?? false,
      );
      return true;
    } finally {
      if (token === this.generation) this.pending = false;
    }
  }
  unlock() {
    return this.context.resume();
  }
  play() {
    return this.player.play();
  }
  pause() {
    this.player.pause();
  }
  preparePageTurn() {
    this.generation++;
    this.pending = false;
    this.player.preparePageTurn();
  }
  stop() {
    this.generation++;
    if (this.pending) {
      this.player.stop();
      this.book = undefined;
      this.pending = false;
    } else {
      this.player.pause();
      this.player.seek(this.player.timeline.pages[this.page]?.start ?? 0);
    }
  }
  async replay() {
    this.player.pause();
    this.player.seek(this.player.timeline.pages[this.page]?.start ?? 0);
    await this.player.play();
  }
  speed(value: number) {
    this.player.speed(value);
  }
  volume(value: number, enabled: boolean) {
    this.player.volume(value, enabled);
  }
}
