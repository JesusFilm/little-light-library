import type { LocaleId, StoryId } from "./contracts";
export class ReaderState {
  book: StoryId | null = null;
  page = 0;
  pageCount = 8;
  language: LocaleId = "en-US";
  playing = false;
  revision = 0;
  open(book: StoryId, pageCount = 8) {
    this.book = book;
    this.pageCount = pageCount;
    this.page = 0;
    this.playing = true;
    this.revision++;
  }
  turn(page: number) {
    this.page = Math.max(0, Math.min(this.pageCount - 1, page));
    this.playing = true;
    this.revision++;
  }
  changeLanguage(language: LocaleId) {
    this.language = language;
    this.playing = false;
    this.revision++;
  }
  play() {
    this.playing = true;
  }
  hide() {
    this.playing = false;
  }
  close() {
    this.book = null;
    this.playing = false;
    this.page = 0;
    this.revision++;
  }
}
