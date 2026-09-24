import { smooth } from "./choreography";

/** Align live folded geometry with the print projection, then restore its full upright size. */
export function foldedStagePose(
  frame: { scale: number; centerY: number } | undefined,
  unfolded: number,
) {
  const blend = smooth(unfolded);
  if (!frame || blend === 1) return { scale: 1, y: 0, z: 0 };
  const scale = frame.scale + (1 - frame.scale) * blend;
  return {
    scale,
    z: 0.075 * (1 - scale),
    y: -frame.centerY * frame.scale * (1 - blend),
  };
}
