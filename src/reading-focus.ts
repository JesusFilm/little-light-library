import * as THREE from "three";

type FocusTarget = { camera: THREE.Vector3; look: THREE.Vector3 };
const smooth = (value: number) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
const empty = () => ({
  camera: new THREE.Vector3(),
  look: new THREE.Vector3(),
  amount: 0,
});

export function readingFocusTarget(
  camera: THREE.Vector3,
  look: THREE.Vector3,
  actor: THREE.Vector3,
  narrow: boolean,
  wideEnsemble = false,
): FocusTarget {
  // Noah's family fills the phone spread: reserve its opposite-edge clearance.
  const familyPhone = narrow && wideEnsemble;
  const horizontalLimit = familyPhone ? 0.08 : narrow ? 0.22 : 0.36;
  const shift = new THREE.Vector3(
    THREE.MathUtils.clamp(
      (actor.x - look.x) * 0.3,
      -horizontalLimit,
      horizontalLimit,
    ),
    THREE.MathUtils.clamp((actor.y - look.y) * 0.15, -0.08, 0.08),
    0,
  );
  return {
    camera: look
      .clone()
      .sub(camera)
      .multiplyScalar(familyPhone ? 0.02 : narrow ? 0.035 : 0.05)
      .addScaledVector(shift, 0.45),
    look: shift,
  };
}

/** Additive offsets around the authored camera, never a new zoom baseline. */
export class ReadingFocus {
  private startTime?: number;
  private target?: FocusTarget;
  private origin = empty();
  start(time: number, target: FocusTarget) {
    this.origin = this.sample(time);
    this.target = { camera: target.camera.clone(), look: target.look.clone() };
    this.startTime = time;
  }
  clear() {
    this.startTime = undefined;
    this.target = undefined;
    this.origin = empty();
  }
  sample(time: number, fixedAge?: number) {
    if (this.startTime === undefined || !this.target) return empty();
    const age = fixedAge ?? time - this.startTime;
    if (!Number.isFinite(age) || age >= 2.4) return empty();
    const enter = smooth(Math.max(0, age) / 0.35);
    const amount = enter * (1 - smooth((age - 0.95) / 1.45));
    return {
      camera: this.target.camera
        .clone()
        .multiplyScalar(amount)
        .addScaledVector(this.origin.camera, 1 - enter),
      look: this.target.look
        .clone()
        .multiplyScalar(amount)
        .addScaledVector(this.origin.look, 1 - enter),
      amount: amount + this.origin.amount * (1 - enter),
    };
  }
}

/** Preserve an already tightly framed ensemble instead of spending its edge clearance on zoom. */
export function constrainReadingFocus(
  camera: THREE.PerspectiveCamera,
  look: THREE.Vector3,
  target: FocusTarget,
  points: THREE.Vector3[],
) {
  if (!points.length) return { ...target, scale: 1 };
  const view = camera.clone();
  view.lookAt(look);
  view.updateMatrixWorld(true);
  const limits = points.map((point) => {
    const p = point.clone().project(view);
    return {
      left: Math.min(-0.94, p.x),
      right: Math.max(0.94, p.x),
      bottom: Math.min(-0.94, p.y),
      top: Math.max(0.94, p.y),
    };
  });
  const fits = (scale: number) => {
    view.position.copy(camera.position).addScaledVector(target.camera, scale);
    view.lookAt(look.clone().addScaledVector(target.look, scale));
    view.updateMatrixWorld(true);
    return points.every((point, i) => {
      const p = point.clone().project(view),
        limit = limits[i];
      return (
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= limit.left - 1e-7 &&
        p.x <= limit.right + 1e-7 &&
        p.y >= limit.bottom - 1e-7 &&
        p.y <= limit.top + 1e-7
      );
    });
  };
  let low = 0,
    high = 1;
  if (fits(1)) low = 1;
  else
    for (let i = 0; i < 16; i++) {
      const mid = (low + high) / 2;
      if (fits(mid)) low = mid;
      else high = mid;
    }
  return {
    camera: target.camera.clone().multiplyScalar(low),
    look: target.look.clone().multiplyScalar(low),
    scale: low,
  };
}
