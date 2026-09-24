export interface AlphaBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Visible bounds within an RGBA image (or an atlas cell), using inclusive ends. */
export function alphaBounds(
  width: number,
  height: number,
  rgba: ArrayLike<number>,
  options: { threshold?: number; xStart?: number; xEnd?: number } = {},
): AlphaBounds | undefined {
  const threshold = options.threshold ?? 32;
  const xStart = Math.max(0, Math.floor(options.xStart ?? 0));
  const xEnd = Math.min(width, Math.ceil(options.xEnd ?? width));
  let minX = xEnd;
  let maxX = xStart - 1;
  let minY = height;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = xStart; x < xEnd; x++) {
      if (rgba[(y * width + x) * 4 + 3] > threshold) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return maxX < minX || maxY < minY ? undefined : { minX, maxX, minY, maxY };
}

export function alphaBoundsAspect(bounds: AlphaBounds): number {
  return (bounds.maxX - bounds.minX + 1) / (bounds.maxY - bounds.minY + 1);
}

/** Plane geometry dimensions when the requested width means visible painted width. */
export function visibleCutoutSize(width: number, aspect: number) {
  return { width, height: width / aspect };
}
