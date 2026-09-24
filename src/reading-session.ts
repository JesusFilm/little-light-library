export interface ShelfEntry {
  key: string;
}

export interface ShelfSnapshot<T extends ShelfEntry> {
  browsing: boolean;
  busy: boolean;
  inspected: T | null;
  status: string;
}

export interface ShelfScene {
  inspectShelfBook(key: string): Promise<void>;
  returnShelfPreview(): Promise<void>;
}

export class ReadingSession<T extends ShelfEntry> {
  private current: ShelfSnapshot<T> = {
    browsing: true,
    busy: false,
    inspected: null,
    status: "",
  };

  constructor(
    private readonly scene: ShelfScene,
    private readonly pauseForBrowsing: () => void,
    private readonly changed: () => void,
    private readonly failed: (error: unknown) => void,
  ) {}

  get snapshot(): ShelfSnapshot<T> {
    return { ...this.current };
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
}
