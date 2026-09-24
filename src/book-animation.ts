import type { BookMotion } from "./authored-book";

export const animationPresets = [
  ["rock", "Rock"],
  ["float", "Float up and down"],
  ["sway", "Sway left and right"],
  ["pulse", "Pulse"],
  ["spin", "Spin"],
] as const;

/** Absolute offsets prevent drift after looping, scrubbing, edits or pause/resume. */
export function authoredMotionTransform(motion: BookMotion, elapsed: number) {
  const rest = { rotation: 0, x: 0, y: 0, scale: 1 };
  const local = elapsed - (motion.delay ?? 0);
  const repeats =
    motion.loop === false ? 1 : Math.max(1, Math.floor(motion.repeat ?? 1));
  if (
    !Number.isFinite(local) ||
    !(motion.duration > 0) ||
    local < 0 ||
    (!motion.loop && local >= motion.duration * repeats)
  )
    return rest;
  const phase = (local % motion.duration) / motion.duration;
  const wave = Math.sin(phase * Math.PI * 2);
  const rise = Math.sin(phase * Math.PI) ** 2;
  switch (motion.preset) {
    case "rock":
      return { ...rest, rotation: (wave * motion.strength * Math.PI) / 180 };
    case "float":
      return { ...rest, y: (rise * motion.strength) / 100 };
    case "sway":
      return { ...rest, x: (wave * motion.strength) / 100 };
    case "pulse":
      return { ...rest, scale: 1 + (rise * motion.strength) / 100 };
    case "spin":
      return {
        ...rest,
        rotation: 2 * Math.PI * phase * phase * (3 - 2 * phase),
      };
  }
}
