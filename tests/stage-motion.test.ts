import assert from "node:assert/strict";
import test from "node:test";
import { sampleStageMotion, waveLayerLayout } from "../src/stage-motion";

test("wave layers receive distinct depth and phase offsets", () => {
  const layers = waveLayerLayout(3);
  assert.equal(layers.length, 3);
  assert.equal(new Set(layers.map(({ depth }) => depth)).size, 3);
  assert.equal(new Set(layers.map(({ phaseRadians }) => phaseRadians)).size, 3);
  assert.ok(layers.every(({ widthScale }) => widthScale > 0));
});

test("legacy sway and float are periodic with documented units", () => {
  const sway = {
    kind: "sway" as const,
    strength: 3,
    periodSeconds: 4,
    phaseRadians: 0,
  };
  const float = { kind: "float" as const, strength: 0.08, periodSeconds: 4 };
  assert.equal(sampleStageMotion(sway, 0), 0);
  assert.ok(Math.abs(sampleStageMotion(sway, 1) - (3 * Math.PI) / 180) < 1e-10);
  assert.equal(sampleStageMotion(float, 0), 0);
  assert.ok(Math.abs(sampleStageMotion(float, 1) - 0.08) < 1e-10);
  assert.ok(Math.abs(sampleStageMotion(sway, 4)) < 1e-10);
  assert.ok(Math.abs(sampleStageMotion(float, 4)) < 1e-10);
});
