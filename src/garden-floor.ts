import * as THREE from "three";

/**
 * Two matching printed page surfaces. The atlas is shared across the gutter and
 * vertically oriented as viewed by the reader. Texture ownership stays with
 * the caller's stage.
 */
export function createPageGround(texture: THREE.Texture, assetPath = "") {
  const root = new THREE.Group();
  root.name = "stage-ground";
  root.userData.assetPath = assetPath;
  root.userData.gardenGround = assetPath.includes("continuous-garden-ground");
  root.userData.staticPageSurface = true;
  root.position.z = 0.045;
  const halfWidth = 2.86,
    gutter = 0.045,
    depth = 3;
  for (const side of [-1, 1]) {
    const width = halfWidth - gutter;
    const geometry = new THREE.PlaneGeometry(width, depth);
    const center = (side * (halfWidth + gutter)) / 2;
    geometry.translate(center, 0, 0);
    const position = geometry.getAttribute("position");
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < position.count; i++) {
      uv.setXY(
        i,
        (position.getX(i) + halfWidth) / (halfWidth * 2),
        position.getY(i) / depth + 0.5,
      );
    }
    // Independent materials let the existing stage traversal release each exactly once.
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 1,
    });
    const panel = new THREE.Mesh(geometry, material);
    panel.name = side < 0 ? "stage-ground-left" : "stage-ground-right";
    panel.receiveShadow = true;
    root.add(panel);
  }
  return root;
}

/** Kept as a source-compatible alias for the earlier one-ground implementation. */
export const createGardenFloor = (texture: THREE.Texture) =>
  createPageGround(texture, "assets/art/theatre/continuous-garden-ground.webp");
