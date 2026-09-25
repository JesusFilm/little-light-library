import * as THREE from "three";

/** A small alpha mask makes cutout taps follow paint without retaining full image pixels. */
export function installCompactHitMask(texture: THREE.Texture) {
  const image = texture.image as CanvasImageSource & {
    naturalWidth?: number;
    naturalHeight?: number;
    width?: number;
    height?: number;
  };
  const width = image?.naturalWidth ?? image?.width ?? 0;
  const height = image?.naturalHeight ?? image?.height ?? 0;
  if (!width || !height || typeof document === "undefined") return;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(128, width);
    canvas.height = Math.min(128, height);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const alpha = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = pixels[i * 4 + 3];
    texture.userData.hitMask = {
      alpha,
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    // A non-image test texture remains selectable by its card bounds.
  }
}

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
