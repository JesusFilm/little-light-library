export interface ShelfEntry {
  key: string;
}

export interface ShelfSnapshot<T extends ShelfEntry> {
  browsing: boolean;
  busy: boolean;
  inspected: T | null;
  status: string;
  table: string | null;
  loading: boolean;
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
    autoplay: boolean;
    resume: boolean;
    pageTurn: boolean;
    current: () => boolean;
  }): Promise<void>;
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

  constructor(
    private readonly scene: ShelfScene,
    private readonly pauseForBrowsing: () => void,
    private readonly changed: () => void,
    private readonly failed: (error: unknown) => void,
    private readonly transfer?: ReadingTransfer<T>,
    private readonly pages?: PagePort,
  ) {}

  get snapshot(): ShelfSnapshot<T> {
    return {
      ...this.current,
      table: this.table,
      loading: Boolean(this.pendingPage),
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

  invalidatePage() {
    const generation = ++this.pageGeneration;
    this.pages?.cancel();
    return generation;
  }

  async waitForPage() {
    await this.pendingPage;
  }

  loadPage(autoplay: boolean, resume = false, pageTurn = false) {
    const pages = this.pages;
    if (!pages) return Promise.resolve();
    const generation = ++this.pageGeneration;
    const current = () => generation === this.pageGeneration;
    let rendering: Promise<void>;
    try {
      rendering = pages.render({ autoplay, resume, pageTurn, current });
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
      this.pendingPage ||
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
      await transfer.showFirstPage();
      await transfer.loadToys();
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
      await transfer.resumePage();
    });
  }
}
