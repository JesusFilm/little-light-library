/** Invented camera staging, not biblical source text. Each spread owns its pacing.
 * Most shots start and finish close; holds, reveals, lifts and push-ins replace a
 * shared left/right/overview cycle. `at` is a fraction of the narration timeline. */
export type PortraitShot = {
  at: number;
  x: number;
  zoom: number;
  lift: number;
  yaw: number;
};
const shot = (
  at: number,
  x: number,
  zoom = 0.43,
  lift = 0.25,
  yaw = 0,
): PortraitShot => ({ at, x, zoom, lift, yaw });
const directions: Record<string, PortraitShot[]> = {
  "eden-01": [
    shot(0, -0.4, 0.46),
    shot(0.7, -0.4, 0.39, 0.32, 0.045),
    shot(1, -0.55, 0.4, 0.32, 0.045),
  ],
  "eden-02": [
    shot(0, 0.65, 0.42),
    shot(0.28, 0.65, 0.4),
    shot(0.61, -0.55, 0.43, 0.25, -0.04),
    shot(1, 0.05, 0.52),
  ],
  "eden-03": [
    shot(0, 1.35, 0.43, 0.5),
    shot(0.38, 1.35, 0.39, 0.5),
    shot(0.68, 0.65, 0.43),
    shot(1, -0.55, 0.43),
  ],
  "eden-04": [
    shot(0, 0, 0.5),
    shot(0.5, 0, 0.43, 0.15, -0.045),
    shot(1, -0.2, 0.41, 0.15, -0.045),
  ],
  "eden-05": [
    shot(0, 0.6, 0.42),
    shot(0.55, 0.6, 0.39),
    shot(0.83, -0.7, 0.43),
    shot(1, -0.7, 0.41),
  ],
  "eden-06": [
    shot(0, 0.3, 0.54, 0.65),
    shot(0.35, 0.3, 0.51, 0.65),
    shot(0.8, -0.25, 0.44, 0.18, 0.06),
    shot(1, -0.25, 0.44, 0.18, 0.06),
  ],
  "eden-07": [
    shot(0, -0.75, 0.42, 0.1),
    shot(0.62, -0.75, 0.39, 0.1),
    shot(0.88, 0.75, 0.43),
    shot(1, 0.75, 0.43),
  ],
  "eden-08": [shot(0, 0.05, 0.51), shot(1, 0.05, 0.43, 0.3, -0.065)],
  "noah-01": [shot(0, -0.3, 0.43), shot(1, -0.3, 0.38, 0.35, 0.05)],
  "noah-02": [
    shot(0, -0.45, 0.43, 0.05, -0.04),
    shot(0.65, -0.35, 0.39, 0.25),
    shot(1, -0.35, 0.39, 0.25),
  ],
  "noah-03": [
    shot(0, 1.05, 0.51, 0.05),
    shot(0.3, 1.05, 0.48, 0.05),
    shot(0.72, -1.4, 0.45),
    shot(1, -0.25, 0.54),
  ],
  "noah-04": [
    shot(0, 0.15, 0.56, 0.4, -0.04),
    shot(0.8, 0.15, 0.48, 0.4, 0.06),
    shot(1, 0.15, 0.48, 0.4, 0.06),
  ],
  "noah-05": [
    shot(0, -1.05, 0.43),
    shot(0.52, -1.05, 0.4),
    shot(0.72, 0.9, 0.4, 0.7),
    shot(1, 0.9, 0.38, 0.7),
  ],
  "noah-06": [
    shot(0, 0.55, 0.54),
    shot(0.58, 0.55, 0.5),
    shot(0.85, -1.5, 0.43),
    shot(1, -1.5, 0.43),
  ],
  "noah-07": [
    shot(0, 1.3, 0.43, 0.05),
    shot(0.4, 1.3, 0.43, 0.05),
    shot(0.8, -0.95, 0.42, 0.4),
    shot(1, -0.95, 0.4, 0.4),
  ],
  "noah-08": [shot(0, -0.4, 0.53, 0.3), shot(1, -0.25, 0.49, 0.75, -0.05)],
  "jonah-called": [
    shot(0, -0.95, 0.42),
    shot(0.75, -0.95, 0.36, 0.25, 0.045),
    shot(1, -0.95, 0.36, 0.25, 0.045),
  ],
  "jonah-boards-ship": [
    shot(0, -0.7, 0.52, 0.15, -0.06),
    shot(1, 0.55, 0.48, 0.3, 0.04),
  ],
  "storm-at-sea": [
    shot(0, -0.15, 0.55, 0.2),
    shot(0.3, -0.15, 0.55, 0.2),
    shot(1, -0.15, 0.45, 0.4, -0.07),
  ],
  "jonah-overboard": [
    shot(0, -0.9, 0.5, 0.3),
    shot(0.4, -0.9, 0.48, 0.3),
    shot(0.64, 1.2, 0.41, 0.1),
    shot(1, 1.2, 0.39, 0.1),
  ],
  "jonah-rescued": [
    shot(0, 1.4, 0.44, 0.1),
    shot(0.32, 1.4, 0.44, 0.1),
    shot(0.62, -0.45, 0.5, 0.2),
    shot(1, -0.45, 0.46, 0.2),
  ],
  "jonah-prays": [shot(0, 0.12, 0.53, 0.2), shot(1, 0.12, 0.42, 0.3, 0.075)],
  "jonah-ashore": [
    shot(0, -0.65, 0.5, 0.35),
    shot(0.34, -0.65, 0.5, 0.35),
    shot(0.55, 1.35, 0.43, 0.05),
    shot(1, 1.35, 0.4, 0.05),
  ],
  "nineveh-warning": [
    shot(0, -1.38, 0.42),
    shot(0.48, -1.38, 0.42),
    shot(0.7, 1.1, 0.5),
    shot(1, 1.1, 0.47),
  ],
  "nineveh-turns": [shot(0, -0.45, 0.51), shot(1, -0.25, 0.43, 0.15, -0.05)],
  "jonah-angry": [
    shot(0, 0.8, 0.41, 0.2, 0.04),
    shot(1, 0.8, 0.35, 0.3, -0.035),
  ],
  "shade-for-jonah": [
    shot(0, 0.55, 0.42, 0.1),
    shot(0.38, 0.55, 0.42, 0.1),
    shot(0.82, 0.32, 0.45, 0.8),
    shot(1, 0.32, 0.43, 0.8),
  ],
  "plant-withers": [
    shot(0, 1.12, 0.43, 0.6),
    shot(0.43, 1.12, 0.39, 0.5),
    shot(0.67, -0.6, 0.42, 0.2),
    shot(1, -0.6, 0.4, 0.2),
  ],
  "jonah-mercy": [
    shot(0, -1.18, 0.42),
    shot(0.5, -1.18, 0.4),
    shot(0.85, -0.05, 0.49, 0.6),
    shot(1, -0.05, 0.49, 0.6),
  ],
};
export function portraitShots(pageId: string): PortraitShot[] {
  return directions[pageId] ?? [shot(0, 0, 0.5), shot(1, 0, 0.43)];
}
