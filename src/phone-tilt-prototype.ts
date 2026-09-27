import * as THREE from "three";

type PermissionEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};
/** Sensor data stays in memory. Permission is requested only from a settings tap. */
export class PhoneTilt {
  readonly offset = new THREE.Vector2();
  enabled = false;
  status = "Enable phone tilt";
  private origin?: { beta: number; gamma: number; angle: number };
  private timer?: number;
  private changed?: () => void;
  readonly supported =
    typeof DeviceOrientationEvent !== "undefined" && window.isSecureContext;
  private onOrientation = (event: DeviceOrientationEvent) => {
    if (
      !this.enabled ||
      document.hidden ||
      event.beta === null ||
      event.gamma === null ||
      !Number.isFinite(event.beta) ||
      !Number.isFinite(event.gamma)
    )
      return;
    const angle = screen.orientation?.angle ?? 0;
    if (!this.origin || this.origin.angle !== angle)
      this.origin = { beta: event.beta, gamma: event.gamma, angle };
    const radians = (angle * Math.PI) / 180;
    const beta = ((event.beta - this.origin.beta + 540) % 360) - 180;
    const gamma = event.gamma - this.origin.gamma;
    this.offset.set(
      THREE.MathUtils.clamp(
        (gamma * Math.cos(radians) + beta * Math.sin(radians)) / 25,
        -0.7,
        0.7,
      ),
      THREE.MathUtils.clamp(
        (beta * Math.cos(radians) - gamma * Math.sin(radians)) / 25,
        -0.65,
        0.65,
      ),
    );
    if (this.status !== "Phone tilt on") {
      this.status = "Phone tilt on";
      clearTimeout(this.timer);
      this.changed?.();
    }
  };
  private onVisibility = () => {
    this.origin = undefined;
    this.offset.set(0, 0);
  };
  constructor() {
    document.addEventListener("visibilitychange", this.onVisibility);
  }
  async enable(changed?: () => void) {
    this.changed = changed;
    if (!this.supported) {
      this.status = "Phone tilt unavailable";
      changed?.();
      return;
    }
    try {
      const api = DeviceOrientationEvent as PermissionEvent;
      if (
        api.requestPermission &&
        (await api.requestPermission()) !== "granted"
      ) {
        this.status = "Tilt permission denied";
        changed?.();
        return;
      }
      this.enabled = true;
      this.origin = undefined;
      this.status = "Waiting for tilt readings…";
      window.addEventListener("deviceorientation", this.onOrientation);
      this.timer = window.setTimeout(() => {
        if (this.status !== "Phone tilt on") {
          this.status = "No tilt readings · drag still works";
          changed?.();
        }
      }, 4000);
      changed?.();
    } catch {
      this.status = "Phone tilt unavailable · drag still works";
      changed?.();
    }
  }
  disable() {
    this.enabled = false;
    this.offset.set(0, 0);
    this.origin = undefined;
    clearTimeout(this.timer);
    window.removeEventListener("deviceorientation", this.onOrientation);
    this.status = "Enable phone tilt";
    this.changed?.();
  }
  dispose() {
    this.disable();
    document.removeEventListener("visibilitychange", this.onVisibility);
  }
}
