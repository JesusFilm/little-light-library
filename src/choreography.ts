const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
/** Seconds after assets are ready. Paper figures rise only after the supporting leaf clears. */
export function bookPose(age: number, opening: boolean, reduced = false) {
  if (reduced) return { flight: 1, cover: 0, page: -Math.PI, popups: 1 };
  const flight = opening ? smooth(age / 0.85) : 1;
  const cover = opening ? Math.PI * (1 - smooth((age - 0.85) / 0.7)) : 0;
  const page = opening ? -Math.PI : -Math.PI * smooth(age / 0.58);
  const popups = smooth((age - (opening ? 1.55 : 0.6)) / 0.5);
  return { flight, cover, page, popups };
}
