import type { LegacyStageMotion } from "./stage-direction-types";

export function sampleStageMotion(
  motion: LegacyStageMotion,
  timeSeconds: number,
) {
  const period = Math.max(0.2, motion.periodSeconds ?? 3.4);
  const phase = motion.phaseRadians ?? 0;
  const wave = Math.sin((timeSeconds / period) * Math.PI * 2 + phase);
  return motion.kind === "sway"
    ? (wave * motion.strength * Math.PI) / 180
    : wave * motion.strength;
}

export interface WaveLayerLayout {
  depth: number;
  phaseRadians: number;
  widthScale: number;
  floatStrength: number;
}

/** Stable, nested water ribbons. Each layer has its own depth and cycle phase. */
export function waveLayerLayout(count: number): WaveLayerLayout[] {
  const safeCount = Math.max(0, Math.min(5, Math.floor(count)));
  return Array.from({ length: safeCount }, (_, index) => ({
    depth: -0.82 + index * 0.43,
    phaseRadians: (index * Math.PI * 2) / safeCount,
    widthScale: 1 - Math.max(0, index - 1) * 0.04,
    floatStrength: 0.025 + index * 0.008,
  }));
}
