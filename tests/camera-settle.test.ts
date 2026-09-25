import assert from "node:assert/strict";
import test from "node:test";
import { cameraBlendForElapsed } from "../src/camera-settle";

test("camera convergence follows elapsed time at both 2 and 60 rendered fps", () => {
  const residual = (frames: number, secondsPerFrame: number) => {
    let distance = 5.5;
    for (let frame = 0; frame < frames; frame++)
      distance *= 1 - cameraBlendForElapsed(secondsPerFrame);
    return distance;
  };
  const slow = residual(4, 0.5);
  const fast = residual(120, 1 / 60);
  assert.ok(Math.abs(slow - fast) < 1e-10);
  assert.ok(slow < 0.02, "camera reaches the room-settled tolerance in 2s");
  assert.equal(cameraBlendForElapsed(0.5, true), 1);
});
