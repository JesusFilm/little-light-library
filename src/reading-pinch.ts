export const READING_ZOOM = { min: 1, max: 2.5 } as const;
type Point = { id: number; x: number; y: number; pinched: boolean };
export type PinchView = {
  x: number;
  y: number;
  zoom: number;
  worldPerPixel: number;
  centerX: number;
  centerY: number;
};
const bounded = (zoom: number) =>
  Math.max(READING_ZOOM.min, Math.min(READING_ZOOM.max, zoom));

/** Tracks touch ownership and keeps the point between the fingers stationary. */
export class ReadingPinch {
  private pointers = new Map<number, Point>();
  private start?: {
    distance: number;
    zoom: number;
    scale: number;
    anchorX: number;
    anchorY: number;
    centerX: number;
    centerY: number;
  };
  get active() {
    return this.pointers.size > 1;
  }
  get ids() {
    return [...this.pointers.keys()];
  }
  has(id: number) {
    return this.pointers.has(id);
  }
  private rebase(view: PinchView) {
    this.start = undefined;
    if (this.pointers.size !== 2) return;
    const [a, b] = this.pointers.values();
    this.start = {
      distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      zoom: bounded(view.zoom),
      scale: view.worldPerPixel,
      anchorX: view.x + ((a.x + b.x) / 2 - view.centerX) * view.worldPerPixel,
      anchorY: view.y - ((a.y + b.y) / 2 - view.centerY) * view.worldPerPixel,
      centerX: view.centerX,
      centerY: view.centerY,
    };
  }
  down(id: number, x: number, y: number, view: PinchView) {
    this.pointers.set(id, { id, x, y, pinched: false });
    if (this.active) {
      for (const p of this.pointers.values()) p.pinched = true;
      this.rebase(view);
    }
    return this.active;
  }
  move(id: number, x: number, y: number) {
    const point = this.pointers.get(id);
    if (!point) return;
    point.x = x;
    point.y = y;
    if (!this.start || this.pointers.size !== 2) return;
    const [a, b] = this.pointers.values();
    const start = this.start;
    const zoom = bounded(
      (start.zoom * Math.hypot(b.x - a.x, b.y - a.y)) / start.distance,
    );
    const scale = (start.scale * start.zoom) / zoom;
    const view = {
      zoom,
      x: start.anchorX - ((a.x + b.x) / 2 - start.centerX) * scale,
      y: start.anchorY + ((a.y + b.y) / 2 - start.centerY) * scale,
    };
    // Rebase at a bound so reversing direction responds immediately.
    if (zoom === READING_ZOOM.min || zoom === READING_ZOOM.max)
      this.rebase({
        ...view,
        worldPerPixel: scale,
        centerX: start.centerX,
        centerY: start.centerY,
      });
    return view;
  }
  up(id: number, view: PinchView) {
    const consumed = this.pointers.get(id)?.pinched ?? false;
    this.pointers.delete(id);
    this.rebase(view);
    const remaining =
      this.pointers.size === 1 ? [...this.pointers.values()][0] : undefined;
    return { consumed, remaining };
  }
  clear() {
    this.pointers.clear();
    this.start = undefined;
  }
}
