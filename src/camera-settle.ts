/** Frame-rate independent camera damping; long render gaps advance by real time. */
export function cameraBlendForElapsed(
  elapsedSeconds: number,
  reducedMotion = false,
) {
  return reducedMotion ? 1 : 1 - Math.exp(-Math.max(0, elapsedSeconds) * 3.4);
}
