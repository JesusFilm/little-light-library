import * as THREE from "three";

/** Bounds of rendered geometry only: hidden alternate puppet meshes must not widen the print. */
export function visibleFoldedBounds(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  const visit = (object: THREE.Object3D) => {
    if (!object.visible) return;
    if (object instanceof THREE.Mesh) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const positions = object.geometry.getAttribute("position");
      if (positions && materials.some((material) => material.visible)) {
        // Animated paper vertices can change after a cached geometry bounding box.
        const local = new THREE.Box3()
          .setFromBufferAttribute(positions)
          .applyMatrix4(object.matrixWorld);
        if (
          [...local.min.toArray(), ...local.max.toArray()].every(
            Number.isFinite,
          )
        )
          bounds.union(local);
      }
    }
    object.children.forEach(visit);
  };
  visit(root);
  return bounds;
}

/** One shared projection for both halves; the gutter remains at texture U=.5. */
export function foldedPrintFrame(
  bounds: THREE.Box3,
  width = 6.04,
  depth = 3.43,
  margin = 0.045,
) {
  const aspect = width / depth;
  const empty = bounds.isEmpty();
  const radiusX = empty
    ? width / 2
    : Math.max(
        width / 2,
        Math.abs(bounds.min.x) + margin,
        Math.abs(bounds.max.x) + margin,
      );
  const bottom = empty
    ? -depth / 2
    : Math.min(-depth / 2, bounds.min.y - margin);
  const top = empty ? depth / 2 : Math.max(depth / 2, bounds.max.y + margin);
  const fittedDepth = Math.max(top - bottom, (2 * radiusX) / aspect);
  const fittedWidth = fittedDepth * aspect;
  const centerY = (top + bottom) / 2;
  return {
    left: -fittedWidth / 2,
    right: fittedWidth / 2,
    top: centerY + fittedDepth / 2,
    bottom: centerY - fittedDepth / 2,
    scale: width / fittedWidth,
    centerY,
    margin,
    contained:
      empty ||
      (bounds.min.x >= -fittedWidth / 2 &&
        bounds.max.x <= fittedWidth / 2 &&
        bounds.min.y >= centerY - fittedDepth / 2 &&
        bounds.max.y <= centerY + fittedDepth / 2),
    bounds: empty
      ? null
      : { min: bounds.min.toArray(), max: bounds.max.toArray() },
  };
}
