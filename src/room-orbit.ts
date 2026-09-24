import * as THREE from "three";

export class RoomOrbitGesture {
  yaw = 0;
  dragging = false;
  private pointers = new Set<number>();
  private canceled = new Set<number>();
  private active?: { id: number; x: number; y: number; yaw: number };
  private rejected = false;
  has(id: number) {
    return this.pointers.has(id) || this.canceled.has(id);
  }
  down(id: number, x: number, y: number, primary = true) {
    this.canceled.delete(id);
    this.pointers.add(id);
    if (this.pointers.size !== 1 || !primary) {
      this.rejected = true;
      this.dragging = false;
      return;
    }
    this.active = { id, x, y, yaw: this.yaw };
    this.rejected = false;
    this.dragging = false;
  }
  move(
    id: number,
    x: number,
    y: number,
    width: number,
  ): "none" | "pending" | "scroll" | "drag" {
    if (!this.active || this.active.id !== id || this.rejected) return "none";
    const dx = x - this.active.x,
      dy = y - this.active.y;
    if (!this.dragging) {
      if (Math.hypot(dx, dy) < 6) return "pending";
      if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy) * 1.1) {
        this.rejected = true;
        return "scroll";
      }
      this.dragging = true;
    }
    this.yaw = THREE.MathUtils.clamp(
      this.active.yaw - (0.65 * dx) / Math.max(1, width),
      -0.12,
      0.12,
    );
    return "drag";
  }
  cancel(id: number) {
    if (this.has(id)) {
      this.rejected = true;
      this.dragging = false;
      this.pointers.delete(id);
      this.canceled.add(id);
      if (this.active?.id === id) this.active = undefined;
    }
  }
  up(id: number) {
    const tap =
      this.pointers.has(id) &&
      this.active?.id === id &&
      !this.rejected &&
      !this.dragging;
    this.pointers.delete(id);
    this.canceled.delete(id);
    if (this.active?.id === id) {
      this.active = undefined;
      this.dragging = false;
    }
    if (!this.pointers.size) this.rejected = false;
    return tap;
  }
  reset() {
    this.yaw = 0;
    this.dragging = false;
    this.rejected = true;
    // Keep tracked ids until release: a late room pointerup must not activate a page.
  }
  look(direction: -1 | 0 | 1) {
    this.yaw = direction * 0.12;
    this.dragging = false;
    this.rejected = true;
  }
}

export function orbitRoomGoal(
  base: THREE.Vector3,
  focus: THREE.Vector3,
  yaw: number,
) {
  return base
    .clone()
    .sub(focus)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
    .add(focus);
}
