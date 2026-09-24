import { alphaBoundsAspect, visibleCutoutSize } from "./alpha-bounds";

export { alphaBounds, alphaBoundsAspect } from "./alpha-bounds";
export { visibleCutoutSize } from "./alpha-bounds";

/** Mirrors the cutout while preserving its authored visible width. */
export function mirroredScaleX(scale: number, flipX = false) {
  return Math.abs(scale) * (flipX ? -1 : 1);
}

/** Centre a trimmed cutout so its visible bottom rests on the stage baseline. */
export function visibleBottomAnchorY(height: number, lift = 0) {
  return height / 2 + lift;
}

export function alphaTrimmedPlane(
  width: number,
  bounds: Parameters<typeof alphaBoundsAspect>[0],
) {
  return visibleCutoutSize(width, alphaBoundsAspect(bounds));
}
