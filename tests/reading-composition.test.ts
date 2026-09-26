import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { fitReadingComposition } from "../src/reading-composition";

test("paper, tall subjects and wide ensembles fit the reserved art frustum", () => {
  for (const aspect of [0.7, 1, 1.4, 2.6]) {
    for (const bounds of [
      new THREE.Box3(
        new THREE.Vector3(-3.2, 1.5, -0.5),
        new THREE.Vector3(3.2, 4.5, 2.8),
      ),
      new THREE.Box3(new THREE.Vector3(-2, 1.5, 0), new THREE.Vector3(2, 7, 2)),
    ]) {
      const fit = fitReadingComposition(bounds, aspect);
      const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 70);
      camera.position.copy(fit.camera);
      camera.lookAt(fit.look);
      camera.updateMatrixWorld(true);
      for (const x of [bounds.min.x, bounds.max.x])
        for (const y of [bounds.min.y, bounds.max.y])
          for (const z of [bounds.min.z, bounds.max.z]) {
            const p = new THREE.Vector3(x, y, z).project(camera);
            assert.ok(
              Math.abs(p.x) < 1 && Math.abs(p.y) < 1,
              "No subject corner clips",
            );
          }
      assert.deepEqual(
        fitReadingComposition(bounds, aspect),
        fit,
        "Returning to a spread cannot accumulate framing drift",
      );
    }
  }
});

test("runtime geometry points fit when the full canvas extends beyond the art region", () => {
  const points = [
    new THREE.Vector3(-3, 1.5, 2.8),
    new THREE.Vector3(3, 1.5, 2.8),
    new THREE.Vector3(-3, 4.4, -0.5),
    new THREE.Vector3(3, 4.4, -0.5),
  ];
  const bounds = new THREE.Box3().setFromPoints(points);
  const art = { x: 12, y: 68, width: 336, height: 254 };
  const fit = fitReadingComposition(bounds, art.width / art.height, points);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 70);
  camera.setViewOffset(art.width, art.height, -art.x, -art.y, 360, 660);
  camera.position.copy(fit.camera);
  camera.lookAt(fit.look);
  camera.updateMatrixWorld(true);
  for (const point of points) {
    const p = point.clone().project(camera);
    const x = (p.x + 1) * 180,
      y = (1 - p.y) * 330;
    assert.ok(
      x >= art.x &&
        x <= art.x + art.width &&
        y >= art.y &&
        y <= art.y + art.height,
    );
  }
});
