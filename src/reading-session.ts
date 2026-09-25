export interface ShelfEntry {
  key: string;
}

export interface ShelfSnapshot<T extends ShelfEntry> {
  language: string;
  browsing: boolean;
  busy: boolean;
  inspected: T | null;
  status: string;
  table: string | null;
  loading: boolean;
  failure: "artwork" | "narration" | null;
  playback: {
    ready: boolean;
    requested: boolean;
    playing: boolean;
    position: number;
    speed: number;
    audio: boolean;
    volume: number;
  };
  reading: {
    book: string | null;
    page: number;
    pageCount: number;
    toys: string[];
  };
}

export interface ShelfScene {
  inspectShelfBook(key: string): Promise<void>;
  returnShelfPreview(): Promise<void>;
}

export interface ReadingTransfer<T extends ShelfEntry> {
  reading(): ShelfSnapshot<T>["reading"];
  validate(entry: T): void;
  stop(): void;
  clearToys(): Promise<void>;
  closeBook(): Promise<void>;
  landBook(entry: T): Promise<void>;
  activateBook(entry: T): void;
  showFirstPage(): Promise<void>;
  loadToys(): Promise<void>;
  suspendPage(): Promise<void>;
  prepareLibrary(): Promise<void>;
  resumePage(): Promise<void>;
}

export interface PagePort {
  cancel(): void;
  commitTurn(target: number): void;
  render(request: {
    shouldAutoplay: () => boolean;
    resume: boolean;
    pageTurn: boolean;
    current: () => boolean;
  }): Promise<void>;
}

export interface MediaPort {
  snapshot(): Omit<
    ShelfSnapshot<ShelfEntry>["playback"],
    "ready" | "requested"
  >;
  play(current: () => boolean): Promise<boolean>;
  pause(): void;
  setSpeed(value: number): void;
  setAudio(value: boolean): void;
  setVolume(value: number): void;
  visibility(hidden: boolean): void;
}

export interface LanguagePort {
  current(): LocaleId;
  fetch(id: LocaleId): Promise<LocaleData>;
  pause(): void;
  commit(id: LocaleId, data: LocaleData): void;
  refresh(reading: boolean, current: () => boolean): Promise<void>;
  recover(): Promise<void>;
  error(): void;
}

export class ReadingSession<T extends ShelfEntry> {
  private current = {
    browsing: true,
    busy: false,
    inspected: null as T | null,
    status: "",
  };
  private table: string | null = null;
  private pageGeneration = 0;
  private pendingPage?: Promise<void>;
  private mediaReady = false;
  private autoplayRequested = false;
  private mediaFailure: ShelfSnapshot<T>["failure"] = null;
  private languageGeneration = 0;
  private changingLanguage = false;

  constructor(
    private readonly scene: ShelfScene,
    private readonly pauseForBrowsing: () => void,
    private readonly changed: () => void,
    private readonly failed: (error: unknown) => void,
    private readonly transfer?: ReadingTransfer<T>,
    private readonly pages?: PagePort,
    private readonly media?: MediaPort,
    private readonly language?: LanguagePort,
  ) {}

  get snapshot(): ShelfSnapshot<T> {
    return {
      ...this.current,
      language: this.language?.current() ?? "",
      table: this.table,
      loading: Boolean(this.pendingPage),
      failure: this.mediaFailure,
      playback: {
        ready: this.mediaReady,
        requested: this.autoplayRequested,
        ...(this.media?.snapshot() ?? {
          playing: false,
          position: 0,
          speed: 1,
          audio: true,
          volume: 0.8,
        }),
      },
      reading: this.transfer?.reading() ?? {
        book: null,
        page: 0,
        pageCount: 0,
        toys: [],
      },
    };
  }

  get revision() {
    return this.pageGeneration;
  }

  setReady(ready: boolean) {
    this.mediaReady = ready;
    this.changed();
  }

  reportFailure(kind: "artwork" | "narration", current: () => boolean) {
    if (!current()) return;
    this.mediaFailure = kind;
    this.mediaReady = false;
    this.changed();
  }

  async retryMedia(): Promise<boolean> {
    if (!this.mediaFailure || !this.snapshot.reading.book) return false;
    this.media?.pause();
    await this.loadPage(false);
    return true;
  }

  async togglePlayback(current: () => boolean): Promise<boolean> {
    if (!this.media || !this.snapshot.reading.book) return false;
    if (this.pendingPage && (!this.current.busy || this.changingLanguage)) {
      this.autoplayRequested = !this.autoplayRequested;
      if (!this.autoplayRequested) this.media.pause();
      this.changed();
      return true;
    }
    if (this.current.busy) return false;
    if (!this.mediaReady) {
      await this.loadPage(true);
      return true;
    }
    try {
      if (this.media.snapshot().playing) {
        this.autoplayRequested = false;
        this.media.pause();
      } else {
        this.autoplayRequested = true;
        if (!(await this.media.play(current))) {
          this.autoplayRequested = false;
          return false;
        }
      }
    } catch {
      if (current()) {
        this.autoplayRequested = false;
        this.media.pause();
        this.reportFailure("narration", current);
      }
      return false;
    }
    this.changed();
    return true;
  }

  setSpeed(value: number) {
    this.media?.setSpeed(value);
    this.changed();
  }

  setAudio(value: boolean) {
    this.media?.setAudio(value);
    this.changed();
  }

  setVolume(value: number) {
    this.media?.setVolume(value);
    this.changed();
  }

  visibilityChanged(hidden: boolean) {
    if (hidden) this.autoplayRequested = false;
    this.media?.visibility(hidden);
    this.changed();
  }

  async changeLanguage(id: LocaleId): Promise<boolean> {
    const port = this.language;
    if (!port || (this.current.busy && !this.changingLanguage)) return false;
    const generation = ++this.languageGeneration;
    const current = () => generation === this.languageGeneration;
    this.changingLanguage = true;
    this.current.busy = true;
    this.changed();
    let committed = false;
    try {
      const data = await port.fetch(id);
      if (!current()) return false;
      this.invalidatePage();
      port.pause();
      this.mediaReady = false;
      this.mediaFailure = null;
      port.commit(id, data);
      committed = true;
      this.changed();
      await port.refresh(
        Boolean(this.snapshot.reading.book && !this.current.browsing),
        current,
      );
      return current();
    } catch {
      if (!current()) return false;
      if (committed) await port.recover();
      port.error();
      return false;
    } finally {
      if (current()) {
        this.changingLanguage = false;
        this.current.busy = false;
        this.changed();
      }
    }
  }

  invalidatePage() {
    const generation = ++this.pageGeneration;
    this.autoplayRequested = false;
    this.pages?.cancel();
    return generation;
  }

  async waitForPage() {
    await this.pendingPage;
  }

  loadPage(autoplay: boolean, resume = false, pageTurn = false) {
    const pages = this.pages;
    if (!pages) return Promise.resolve();
    if (this.pendingPage) this.pages?.cancel();
    this.mediaFailure = null;
    this.autoplayRequested = autoplay;
    const generation = ++this.pageGeneration;
    const current = () => generation === this.pageGeneration;
    const shouldAutoplay = () => current() && this.autoplayRequested;
    let rendering: Promise<void>;
    try {
      rendering = pages.render({
        shouldAutoplay,
        resume,
        pageTurn,
        current,
      });
    } catch (error) {
      rendering = Promise.reject(error);
    }
    const loading = rendering.finally(() => {
      if (this.pendingPage !== loading) return;
      this.pendingPage = undefined;
      this.changed();
    });
    this.pendingPage = loading;
    this.changed();
    return loading;
  }

  async turnPage(delta: -1 | 1): Promise<boolean> {
    if (
      !this.pages ||
      this.current.busy ||
      this.current.browsing ||
      !this.snapshot.reading.book
    )
      return false;
    const { page, pageCount } = this.snapshot.reading;
    const target = page + delta;
    if (target < 0 || target >= pageCount) return false;
    this.pages.commitTurn(target);
    await this.loadPage(true, false, true);
    return true;
  }

  clearTable() {
    this.table = null;
    this.changed();
  }

  setBrowsing(browsing: boolean) {
    this.current.browsing = browsing;
    this.changed();
  }

  clearInspection() {
    this.current.inspected = null;
    this.changed();
  }

  setStatus(status: string) {
    this.current.status = status;
    this.changed();
  }

  async run(action: () => Promise<void>): Promise<boolean> {
    if (this.current.busy) return false;
    this.current.busy = true;
    this.changed();
    try {
      await action();
      return true;
    } catch (error) {
      this.failed(error);
      return false;
    } finally {
      this.current.busy = false;
      this.current.status = "";
      this.changed();
    }
  }

  async inspect(entry: T): Promise<boolean> {
    if (this.current.inspected?.key === entry.key) return false;
    return this.run(async () => {
      this.pauseForBrowsing();
      await this.scene.returnShelfPreview();
      this.current.inspected = entry;
      this.setStatus("Taking the book from the shelf…");
      try {
        await this.scene.inspectShelfBook(entry.key);
      } catch (error) {
        try {
          await this.scene.returnShelfPreview();
        } finally {
          this.clearInspection();
        }
        throw error;
      }
    });
  }

  async returnInspected(): Promise<boolean> {
    if (!this.current.inspected) return false;
    return this.run(async () => {
      this.setStatus("Returning the book to its place…");
      await this.scene.returnShelfPreview();
      this.clearInspection();
    });
  }

  async openInspected(): Promise<boolean> {
    const entry = this.current.inspected;
    const transfer = this.transfer;
    if (!entry || !transfer) return false;
    return this.run(async () => {
      transfer.validate(entry);
      this.invalidatePage();
      transfer.stop();
      this.setStatus(
        this.snapshot.reading.book
          ? "Returning the open book to the shelf…"
          : "Moving your book to the table…",
      );
      await transfer.clearToys();
      await transfer.closeBook();
      this.clearTable();
      this.setStatus("Moving your book to the table…");
      await transfer.landBook(entry);
      this.table = entry.key;
      transfer.activateBook(entry);
      this.clearInspection();
      this.setBrowsing(false);
      // The book is on the table. Page media and cabinet toys may continue
      // loading while navigation is already available.
      const firstPage = transfer.showFirstPage();
      const pageGeneration = this.pageGeneration;
      void firstPage.catch((error) => {
        if (
          this.table === entry.key &&
          pageGeneration === this.pageGeneration &&
          !this.current.browsing
        )
          this.failed(error);
      });
      void transfer.loadToys().catch((error) => {
        if (this.table === entry.key && !this.current.browsing)
          this.failed(error);
      });
      this.changed();
    });
  }

  async browseLibrary(): Promise<boolean> {
    const transfer = this.transfer;
    if (!transfer) return false;
    return this.run(async () => {
      this.invalidatePage();
      await transfer.suspendPage();
      this.setBrowsing(true);
      await transfer.prepareLibrary();
    });
  }

  async continueReading(): Promise<boolean> {
    const transfer = this.transfer;
    if (!transfer || !this.snapshot.reading.book) return false;
    return this.run(async () => {
      await this.scene.returnShelfPreview();
      this.clearInspection();
      this.setBrowsing(false);
      const resumed = transfer.resumePage();
      const pageGeneration = this.pageGeneration;
      void resumed.catch((error) => {
        if (!this.current.browsing && pageGeneration === this.pageGeneration)
          this.failed(error);
      });
    });
  }
}
import type { LocaleData, LocaleId } from "./contracts";
