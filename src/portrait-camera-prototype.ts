/** Invented cinematic staging for this throwaway branch, not biblical source text.
 * Coordinates refer to the existing paper stage. Keep broad ensemble scenes wider;
 * give story props (the serpent, dove, plant and city) their own shots. */
export type PortraitShot = { x: number; zoom: number; lift?: number };
const pair = (first: number, second: number, zoom = 0.48): PortraitShot[] => [
  { x: first, zoom },
  { x: second, zoom },
];
const directions: Record<string, PortraitShot[]> = {
  "eden-01": pair(-0.4, -1.5, 0.52),
  "eden-02": pair(-0.65, 0.65),
  "eden-03": pair(1.55, 0.1, 0.54),
  "eden-04": pair(-0.65, 0.65),
  "eden-05": pair(0.6, -0.7),
  "eden-06": pair(-0.85, 0.8, 0.56),
  "eden-07": pair(-0.75, 0.75),
  "eden-08": pair(-0.75, 0.65, 0.54),
  "noah-01": pair(-0.3, 0.2, 0.53),
  "noah-02": pair(-0.35, -0.45, 0.53),
  "noah-03": pair(-1.1, 1.05, 0.64),
  "noah-04": pair(-0.55, 0.65, 0.7),
  "noah-05": [
    { x: -1.05, zoom: 0.5 },
    { x: 0.9, zoom: 0.48, lift: 0.5 },
  ],
  "noah-06": pair(-1.5, 0.55, 0.64),
  "noah-07": pair(-0.95, 1.45, 0.6),
  "noah-08": pair(-1.25, 0.6, 0.65),
  "jonah-called": pair(-0.95, 0.2, 0.5),
  "jonah-boards-ship": pair(-0.6, 0.5, 0.68),
  "storm-at-sea": pair(-0.5, 0.6, 0.72),
  "jonah-overboard": pair(-0.9, 1.2, 0.62),
  "jonah-rescued": pair(-0.45, 1.4, 0.65),
  "jonah-prays": pair(-0.3, 0.5, 0.66),
  "jonah-ashore": pair(-0.6, 1.35, 0.64),
  "nineveh-warning": pair(-1.38, 1.1, 0.58),
  "nineveh-turns": pair(-0.45, 1.2, 0.64),
  "jonah-angry": pair(0.8, 0.8, 0.5),
  "shade-for-jonah": [
    { x: 0.55, zoom: 0.52 },
    { x: 0.32, zoom: 0.56, lift: 0.55 },
  ],
  "plant-withers": pair(1.12, -0.6, 0.55),
  "jonah-mercy": pair(-1.18, -0.05, 0.6),
};
export function portraitShots(pageId: string): PortraitShot[] {
  return directions[pageId] ?? pair(-0.7, 0.7, 0.6);
}
