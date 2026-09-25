import * as THREE from "three";
import type { BookAppearance } from "./authored-book";
import {
  createBookCoverTexture,
  createBookSpineTexture,
  resolveBookAppearance,
} from "./book-cover";

export interface RoomShelfBook {
  key: string;
  title: string;
  cover: string;
  appearance?: BookAppearance;
}

export interface RoomToy {
  id: string;
  label: string;
  asset: string;
  pose?: { index: number; columns: number };
  animation: "rock" | "float" | "sway" | "pulse" | "spin";
}

export type ShelfBookState = "shelf" | "preview" | "table";

export const BOOKS_PER_SHELF = 15;
export const ROOM_BOOK_CAPACITY = BOOKS_PER_SHELF * 2;
export const SHELF_BOOK_SIZE = { width: 1.02, height: 1.42, thickness: 0.32 };
export const SHELF_BOOK_YAW = Math.PI / 2;
const MAX_BOOKS = ROOM_BOOK_CAPACITY;
const SLOT_START = -2.62;
const SLOT_STEP = 0.374;
const SHELF_BASES = [2.99, 1.27];
const SHELF_Z = -3.0;
const CLOSED_BOOK_CENTER_X = 1.56;
const CLOSED_BOOK_WIDTH = 3.13;
const CLOSED_BOOK_HEIGHT = 3.6;

export function roomShelfLayout(count: number) {
  const total = THREE.MathUtils.clamp(Math.floor(count), 0, MAX_BOOKS);
  return {
    slots: Array.from({ length: total }, (_, index) => ({
      x: SLOT_START + (index % BOOKS_PER_SHELF) * SLOT_STEP,
      y:
        SHELF_BASES[Math.floor(index / BOOKS_PER_SHELF)] +
        SHELF_BOOK_SIZE.height / 2,
      z: SHELF_Z,
    })),
    endStops: SHELF_BASES.flatMap((y, shelf) => {
      const occupied = Math.min(
        BOOKS_PER_SHELF,
        Math.max(0, total - shelf * BOOKS_PER_SHELF),
      );
      return occupied > 0 && occupied < 13
        ? [
            {
              x:
                SLOT_START +
                (occupied - 1) * SLOT_STEP +
                SHELF_BOOK_SIZE.thickness / 2 +
                0.05,
              y,
              z: SHELF_Z,
            },
          ]
        : [];
    }),
  };
}

export function shelfTransferPose() {
  return {
    position: { x: CLOSED_BOOK_CENTER_X, y: 1.495, z: 1.1 },
    scale: {
      x: CLOSED_BOOK_WIDTH / SHELF_BOOK_SIZE.width,
      y: CLOSED_BOOK_HEIGHT / SHELF_BOOK_SIZE.height,
      z: 0.4 / SHELF_BOOK_SIZE.thickness,
    },
    rotationX: -Math.PI / 2,
  };
}

export function roomToyLayout(count: number) {
  const total = THREE.MathUtils.clamp(Math.floor(count), 0, 4);
  return Array.from({ length: total }, (_, index) => ({
    x: -1.08 + index * 0.72,
    y: 4.78,
    z: -2.69,
  }));
}

function smooth(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function coverUrl(src: string) {
  if (/^(?:data:|blob:|https?:)/.test(src)) return src;
  return src.startsWith("/")
    ? `.${src}`
    : src.startsWith("./")
      ? src
      : `./${src}`;
}

interface ShelfEntry {
  definition: RoomShelfBook;
  root: THREE.Group;
  cover: THREE.Texture;
  slot: THREE.Vector3;
}

interface Motion {
  entry: ShelfEntry;
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromRotation: THREE.Euler;
  toRotation: THREE.Euler;
  fromScale: THREE.Vector3;
  toScale: THREE.Vector3;
  started: number;
  duration: number;
  resolve: () => void;
}

export class RoomShelf {
  readonly root = new THREE.Group();
  private entries = new Map<string, ShelfEntry>();
  private order: string[] = [];
  private endStops: THREE.Group[] = [];
  private generation = 0;
  private motion?: Motion;
  previewKey?: string;
  tableKey?: string;

  constructor() {
    this.root.name = "room-book-shelf";
  }

  private slot(index: number) {
    const slot = roomShelfLayout(index + 1).slots[index];
    return new THREE.Vector3(slot.x, slot.y, slot.z);
  }

  private makeBook(
    definition: RoomShelfBook,
    texture: THREE.Texture,
    index: number,
  ) {
    const appearance = resolveBookAppearance(definition.appearance);
    const root = new THREE.Group();
    root.name = `shelf-book:${definition.key}`;
    root.userData.pick = `shelf:${definition.key}`;
    root.position.copy(this.slot(index));
    root.rotation.y = SHELF_BOOK_YAW;
    const { width, height, thickness } = SHELF_BOOK_SIZE;
    const cloth = new THREE.MeshStandardMaterial({
      color: appearance.coverColor,
      roughness: 0.76,
    });
    const spineMaterial = new THREE.MeshStandardMaterial({
      color: appearance.spineColor,
      roughness: 0.76,
    });
    for (const z of [-1, 1]) {
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.025),
        cloth,
      );
      board.position.z = z * (thickness / 2 - 0.0125);
      board.castShadow = board.receiveShadow = true;
      root.add(board);
    }
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.035, height - 0.06, thickness - 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf2dfb8, roughness: 1 }),
    );
    pages.position.x = 0.012;
    root.add(pages);
    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, height, thickness),
      spineMaterial,
    );
    spine.position.x = -width / 2 + 0.02;
    root.add(spine);
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.02, height - 0.02),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    art.position.z = thickness / 2 + 0.001;
    root.add(art);
    const title = new THREE.Mesh(
      new THREE.PlaneGeometry(thickness, height),
      new THREE.MeshBasicMaterial({
        map: createBookSpineTexture(definition.title, appearance),
      }),
    );
    title.position.x = -width / 2 - 0.001;
    title.rotation.y = -Math.PI / 2;
    root.add(title);
    return root;
  }

  private disposeEntry(entry: ShelfEntry) {
    entry.root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        const map = (material as THREE.MeshBasicMaterial).map;
        if (map && map !== entry.cover) map.dispose();
        material.dispose();
      });
    });
    entry.cover.dispose();
    entry.root.removeFromParent();
  }

  private rebuildEndStop(count: number) {
    for (const stop of this.endStops) {
      stop.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      stop.removeFromParent();
    }
    this.endStops = roomShelfLayout(count).endStops.map((position) => {
      const stop = new THREE.Group();
      stop.name = "shelf-bookend";
      stop.position.set(position.x, position.y, position.z);
      const material = new THREE.MeshStandardMaterial({
        color: 0xb58a4e,
        metalness: 0.32,
        roughness: 0.45,
      });
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.035, 0.94),
        material,
      );
      base.position.set(-0.11, 0.0175, 0);
      const upright = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 1.02, 0.94),
        material,
      );
      upright.position.set(0, 0.51, 0);
      stop.add(base, upright);
      this.root.add(stop);
      return stop;
    });
  }

  async setBooks(books: readonly RoomShelfBook[]) {
    const definitions = books.slice(0, MAX_BOOKS);
    const generation = ++this.generation;
    this.cancelMotion();
    this.entries.forEach((entry) => this.disposeEntry(entry));
    this.entries.clear();
    this.previewKey = undefined;
    this.order = definitions.map((book) => book.key);
    definitions.forEach((definition, index) => {
      // A titled cloth cover is usable before slow art requests complete.
      const cover = createBookCoverTexture(
        definition.title,
        undefined,
        definition.appearance,
      );
      const root = this.makeBook(definition, cover, index);
      const entry = {
        definition,
        root,
        cover,
        slot: this.slot(index),
      };
      this.entries.set(definition.key, entry);
      this.root.add(root);
    });
    this.rebuildEndStop(definitions.length);
    this.applyVisibility();
    const loader = new THREE.TextureLoader();
    for (const definition of definitions) {
      const entry = this.entries.get(definition.key)!;
      void loader
        .loadAsync(coverUrl(definition.cover))
        .then((texture) => {
          if (
            generation !== this.generation ||
            this.entries.get(definition.key) !== entry
          ) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          const painted = createBookCoverTexture(
            definition.title,
            texture,
            definition.appearance,
          );
          texture.dispose();
          // Keep the shared texture identity used by shelf and table transfers.
          entry.cover.image = painted.image;
          entry.cover.needsUpdate = true;
          painted.dispose();
        })
        .catch(() => {
          // The titled cover remains readable if artwork is unavailable.
        });
    }
  }

  books() {
    return this.order.map((key) => this.entries.get(key)!.definition);
  }

  pickables() {
    return this.order.map((key) => this.entries.get(key)!.root);
  }

  entry(key: string) {
    return this.entries.get(key);
  }

  slotPosition(key: string) {
    return this.entries.get(key)?.slot.clone();
  }

  coverTexture(key: string) {
    return this.entries.get(key)?.cover;
  }

  setTableKey(key?: string) {
    this.tableKey = key;
    this.applyVisibility();
  }

  private applyVisibility() {
    this.entries.forEach((entry, key) => {
      entry.root.visible = key !== this.tableKey;
    });
  }

  private resetToSlot(entry: ShelfEntry) {
    entry.root.position.copy(entry.slot);
    entry.root.rotation.set(0, SHELF_BOOK_YAW, 0);
    entry.root.scale.set(1, 1, 1);
  }

  private cancelMotion() {
    if (!this.motion) return;
    const resolve = this.motion.resolve;
    this.motion = undefined;
    resolve();
  }

  private move(
    entry: ShelfEntry,
    position: THREE.Vector3,
    rotation: THREE.Euler,
    scale: THREE.Vector3,
    reduced: boolean,
    duration = 330,
  ) {
    this.cancelMotion();
    if (reduced) {
      entry.root.position.copy(position);
      entry.root.rotation.copy(rotation);
      entry.root.scale.copy(scale);
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.motion = {
        entry,
        fromPosition: entry.root.position.clone(),
        toPosition: position,
        fromRotation: entry.root.rotation.clone(),
        toRotation: rotation,
        fromScale: entry.root.scale.clone(),
        toScale: scale,
        started: performance.now(),
        duration,
        resolve,
      };
    });
  }

  async inspect(key: string, reduced: boolean) {
    const entry = this.entries.get(key);
    if (!entry || key === this.tableKey) return false;
    if (this.previewKey && this.previewKey !== key)
      await this.returnPreview(reduced);
    this.previewKey = key;
    entry.root.visible = true;
    // The first beat translates clear of the shelf; the second squares the cover to camera.
    await this.move(
      entry,
      new THREE.Vector3(entry.slot.x, entry.slot.y, -1.35),
      entry.root.rotation.clone(),
      new THREE.Vector3(1.12, 1.12, 1.12),
      reduced,
    );
    await this.move(
      entry,
      new THREE.Vector3(0, 3.28, -0.85),
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(1.42, 1.42, 1.42),
      reduced,
    );
    return true;
  }

  async returnPreview(reduced: boolean) {
    const key = this.previewKey;
    const entry = key ? this.entries.get(key) : undefined;
    this.previewKey = undefined;
    if (!entry) return;
    await this.move(
      entry,
      new THREE.Vector3(entry.slot.x, entry.slot.y, -1.35),
      new THREE.Euler(0, SHELF_BOOK_YAW, 0),
      new THREE.Vector3(1, 1, 1),
      reduced,
      300,
    );
    await this.move(
      entry,
      entry.slot.clone(),
      new THREE.Euler(0, SHELF_BOOK_YAW, 0),
      new THREE.Vector3(1, 1, 1),
      reduced,
      400,
    );
    this.applyVisibility();
  }

  async landPreview(reduced: boolean) {
    const key = this.previewKey;
    const entry = key ? this.entries.get(key) : undefined;
    if (!key || !entry) return undefined;
    const pose = shelfTransferPose();
    await this.move(
      entry,
      new THREE.Vector3(pose.position.x, pose.position.y, pose.position.z),
      new THREE.Euler(pose.rotationX, 0, 0),
      new THREE.Vector3(pose.scale.x, pose.scale.y, pose.scale.z),
      reduced,
      520,
    );
    this.previewKey = undefined;
    this.tableKey = key;
    this.applyVisibility();
    // The proxy is hidden while its full-size table counterpart exists. Reset it
    // immediately so returning the table book reveals the canonical shelf copy.
    this.resetToSlot(entry);
    return entry.definition;
  }

  update(now: number) {
    const motion = this.motion;
    if (!motion) return;
    const amount = smooth((now - motion.started) / motion.duration);
    motion.entry.root.position.lerpVectors(
      motion.fromPosition,
      motion.toPosition,
      amount,
    );
    motion.entry.root.scale.lerpVectors(
      motion.fromScale,
      motion.toScale,
      amount,
    );
    motion.entry.root.rotation.set(
      THREE.MathUtils.lerp(motion.fromRotation.x, motion.toRotation.x, amount),
      THREE.MathUtils.lerp(motion.fromRotation.y, motion.toRotation.y, amount),
      THREE.MathUtils.lerp(motion.fromRotation.z, motion.toRotation.z, amount),
    );
    if (amount >= 1) {
      this.motion = undefined;
      motion.resolve();
    }
  }

  debug() {
    return {
      max: MAX_BOOKS,
      previewKey: this.previewKey ?? null,
      tableKey: this.tableKey ?? null,
      moving: Boolean(this.motion),
      endStops: this.endStops.map((stop) => stop.position.toArray()),
      books: this.order.map((key, index) => {
        const entry = this.entries.get(key)!;
        return {
          key,
          index,
          state: (key === this.tableKey
            ? "table"
            : key === this.previewKey
              ? "preview"
              : "shelf") as ShelfBookState,
          visible: entry.root.visible,
          appearance: resolveBookAppearance(entry.definition.appearance),
          coverTexture: entry.cover.uuid,
          position: entry.root.position.toArray(),
          rotation: entry.root.rotation.toArray().slice(0, 3),
          scale: entry.root.scale.toArray().slice(0, 3),
        };
      }),
    };
  }

  dispose() {
    this.generation++;
    this.cancelMotion();
    this.entries.forEach((entry) => this.disposeEntry(entry));
    this.entries.clear();
    this.rebuildEndStop(0);
    this.root.removeFromParent();
  }
}
