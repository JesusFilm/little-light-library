/** Paper cards rotate together from flat on the page to upright. */
export function popupFoldAngle(unfolded: number) {
  const open = Math.max(0, Math.min(1, unfolded));
  return Math.PI - (Math.PI / 2) * open;
}
/** Depth deformations resume only when the paper has finished erecting. */
export function popupActorsAtRest(unfolded: number, reduced: boolean) {
  return reduced || unfolded < 1;
}
