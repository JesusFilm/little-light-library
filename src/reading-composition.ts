import * as THREE from "three";

/** Fit the complete paper stage, including a small movement allowance, into an
 * art viewport. The UI owns that rectangle; the camera never guesses its size. */
export function fitReadingComposition(
  bounds: THREE.Box3,
  aspect: number,
  points: readonly THREE.Vector3[] = [],
) {
  const look = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  // Taller scenes benefit from a straighter view; ensembles keep paper depth.
  const direction = new THREE.Vector3(
    0.08,
    size.y > size.x * 0.65 ? 0.45 : 0.6,
    1,
  ).normalize();
  const right = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), direction)
    .normalize();
  const up = new THREE.Vector3().crossVectors(direction, right);
  const tanY = Math.tan(THREE.MathUtils.degToRad(21));
  const tanX = tanY * Math.max(0.1, aspect);
  let distance = 1;
  const corners = points.length
    ? points
    : [bounds.min, bounds.max].flatMap((p) =>
        [bounds.min.y, bounds.max.y].flatMap((y) =>
          [bounds.min.z, bounds.max.z].map((z) => new THREE.Vector3(p.x, y, z)),
        ),
      );
  for (const original of corners) {
    const point = original.clone().sub(look);
    distance = Math.max(
      distance,
      point.dot(direction) + (Math.abs(point.dot(right)) + 0.18) / tanX,
      point.dot(direction) + (Math.abs(point.dot(up)) + 0.22) / tanY,
    );
  }
  return {
    look,
    camera: look.clone().addScaledVector(direction, distance * 1.06),
  };
}
