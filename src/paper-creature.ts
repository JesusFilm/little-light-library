import * as THREE from "three";

export type PaperCreatureKind = "serpent" | "dove";
export interface PaperCreatureState {
  reduced: boolean;
  folded: boolean;
  touch?: number;
  hover?: boolean;
}
export interface PaperCreature {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  update(time: number, state: PaperCreatureState): void;
  dispose(): void;
}
/** Rigid illustrated cutouts: animate transforms, never stretch printed pixels. */
export function createPaperCreature(
  kind: PaperCreatureKind,
  texture: THREE.Texture,
  width: number,
): PaperCreature {
  const image = texture.image as { width: number; height: number } | undefined;
  const imageWidth = image?.width || (kind === "serpent" ? 1024 : 1254);
  const imageHeight = image?.height || (kind === "serpent" ? 1536 : 1254);
  const aspect =
    Number(texture.userData.aspect) ||
    (imageWidth * texture.repeat.x) / (imageHeight * texture.repeat.y);
  const height = width / aspect;
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.3,
    roughness: 1,
    emissive: 0x9d642b,
    emissiveIntensity: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `paper-creature-${kind}`;
  mesh.castShadow = true;
  mesh.userData.creatureDeformation = 0;
  let disposed = false;
  let baseScale: THREE.Vector3 | undefined;
  let baseYaw = 0;
  return {
    mesh,
    update(time, state) {
      if (disposed) return;
      const touch = Number.isFinite(state.touch)
        ? THREE.MathUtils.clamp(state.touch!, 0, 1)
        : 0;
      material.emissiveIntensity = state.folded
        ? 0
        : touch * 0.16 + (state.hover ? 0.035 : 0);
      if (!baseScale) {
        baseScale = mesh.scale.clone();
        baseYaw = mesh.rotation.y;
      }
      const active = !state.folded && !state.reduced;
      const t = Number.isFinite(time) ? time : 0;
      mesh.rotation.y =
        baseYaw +
        (active
          ? Math.sin(t * (kind === "serpent" ? 0.8 : 1.7)) * 0.055 +
            touch * 0.06
          : 0);
      mesh.scale.copy(baseScale).multiplyScalar(active ? 1 + touch * 0.025 : 1);
      mesh.userData.creatureDeformation = 0;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      material.dispose();
    },
  };
}
