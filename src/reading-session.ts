export interface ShelfEntry {
  key: string;
}

export interface ShelfSnapshot<T extends ShelfEntry> {
  browsing: boolean;
  busy: boolean;
  inspected: T | null;
  status: string;
  table: string | null;
  reading: { book: string | null; page: number; toys: string[] };
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

export class ReadingSession<T extends ShelfEntry> {
  private current = {
    browsing: true,
    busy: false,
    inspected: null as T | null,
    status: "",
  };
  private table: string | null = null;

  constructor(
    private readonly scene: ShelfScene,
    private readonly pauseForBrowsing: () => void,
    private readonly changed: () => void,
    private readonly failed: (error: unknown) => void,
    private readonly transfer?: ReadingTransfer<T>,
  ) {}

  get snapshot(): ShelfSnapshot<T> {
    return {
      ...this.current,
      table: this.table,
      reading: this.transfer?.reading() ?? { book: null, page: 0, toys: [] },
    };
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
