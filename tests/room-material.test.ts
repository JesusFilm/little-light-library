import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  wallPaperUv,
  curtainGeometry,
  quiltPatchGeometry,
} from "../src/room-material";

test("wallpaper keeps world density and vertical registration around the corner", () => {
  const create = (side: "back" | "left") => {
    const geometry = new THREE.BufferGeometry();
    const points =
      side === "back"
        ? [-6.8, 1, -4.4, -4.2, 1, -4.4, -6.8, 3.6, -4.4]
        : [-6.8, 1, -4.4, -6.8, 1, -1.8, -6.8, 3.6, -4.4];
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3),
    );
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(new Float32Array(6), 2),
    );
    const mesh = new THREE.Mesh(geometry);
    wallPaperUv(mesh, side);
    return geometry.getAttribute("uv");
  };
  const back = create("back"),
    left = create("left");
  assert.ok(Math.abs(back.getX(0) - left.getX(0)) < 1e-6);
  assert.equal(back.getY(0), left.getY(0));
  assert.ok(Math.abs(back.getX(1) - back.getX(0) - 1) < 1e-6);
  assert.ok(Math.abs(left.getX(1) - left.getX(0) + 1) < 1e-6);
  assert.ok(Math.abs(back.getY(2) - back.getY(0) - 1) < 1e-6);
});

test("curtain folds and quilt puff are finite and bounded within the existing furniture", () => {
  const curtain = curtainGeometry();
  curtain.computeBoundingBox();
  const bounds = curtain.boundingBox!;
  assert.ok(bounds.min.z >= -0.064 && bounds.max.z <= 0.064);
  assert.ok(Math.abs(bounds.max.y - 1.425) < 1e-6);
  assert.ok(bounds.min.y >= -1.426);
  const normals = curtain.getAttribute("normal");
  for (const value of normals.array) assert.ok(Number.isFinite(value));
  const quilt = quiltPatchGeometry();
  const positions = quilt.getAttribute("position");
  let raisedCenters = 0;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    if (Math.abs(x) < 1e-6 && Math.abs(z) < 1e-6 && y > 0.045) raisedCenters++;
    if (
      Math.abs(Math.abs(x) - 0.405 / 2) < 1e-6 ||
      Math.abs(Math.abs(z) - 0.46 / 2) < 1e-6
    )
      assert.ok(
        Math.abs(Math.abs(y) - 0.035) < 1e-6,
        "patch perimeter stays at its original height",
      );
  }
  assert.ok(
    raisedCenters > 0,
    "actual runtime patch has raised center vertices",
  );
  quilt.computeBoundingBox();
  assert.ok(quilt.boundingBox!.max.y > 0.05);
  assert.ok(quilt.boundingBox!.max.y <= 0.054);
  assert.ok(Math.abs(quilt.boundingBox!.min.y + 0.035) < 1e-6);
  for (const value of quilt.getAttribute("position").array)
    assert.ok(Number.isFinite(value));
});
