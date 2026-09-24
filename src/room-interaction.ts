import * as THREE from "three";

/** Raycaster does not itself reject invisible ancestors or transparent texels. */
export function visiblePaintHit(hit: THREE.Intersection): boolean {
  for (
    let object: THREE.Object3D | null = hit.object;
    object;
    object = object.parent
  )
    if (!object.visible) return false;
  const mesh = hit.object as THREE.Mesh;
  const material = Array.isArray(mesh.material)
    ? mesh.material[hit.face?.materialIndex ?? 0]
    : mesh.material;
  if (!material || !material.visible) return false;
  const map = (material as THREE.MeshBasicMaterial).map;
  if (!map || !hit.uv || !map.userData.hitMask) return true;
  const uv = hit.uv.clone();
  map.updateMatrix();
  map.transformUv(uv);
  const mask = map.userData.hitMask;
  const x = Math.min(
    mask.width - 1,
    Math.max(0, Math.floor(uv.x * mask.width)),
  );
  const y = Math.min(
    mask.height - 1,
    Math.max(0, Math.floor(uv.y * mask.height)),
  );
  return mask.alpha[y * mask.width + x] >= 90;
}

/** Artwork rotates around its planted foot, independently of its brass plinth. */
export function footPivot(
  group: THREE.Group,
  parts: THREE.Object3D[],
  height: number,
) {
  const pivot = new THREE.Group();
  pivot.name = "figurine-foot-pivot";
  pivot.position.y = height;
  group.add(pivot);
  for (const part of parts) {
    part.position.y -= height;
    pivot.add(part);
  }
  return pivot;
}

export function figureTilt(ageSeconds: number, reduced: boolean): number {
  if (reduced || ageSeconds <= 0 || ageSeconds >= 0.8) return 0;
  return -0.13 * Math.sin((ageSeconds / 0.8) * Math.PI);
}

export function updateFigureTilts(
  figures: ReadonlyMap<string, THREE.Group>,
  selected: string,
  ageSeconds: number,
  reduced: boolean,
) {
  for (const [id, group] of figures) {
    const pivot = group.getObjectByName("figurine-foot-pivot");
    if (pivot)
      pivot.rotation.z = id === selected ? figureTilt(ageSeconds, reduced) : 0;
  }
}
