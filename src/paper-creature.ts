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
const smooth = (a: number, b: number, value: number) => {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** A continuous illustrated sheet; only anatomically masked joints move. Texture remains caller-owned. */
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
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    64,
    kind === "serpent" ? 80 : 64,
  );
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  positions.setUsage(THREE.DynamicDrawUsage);
  const rest = new Float32Array(positions.array);
  const uv = geometry.getAttribute("uv");
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
  const local = (x: number, y: number) =>
    new THREE.Vector2(
      ((x / imageWidth - texture.offset.x) / texture.repeat.x - 0.5) * width,
      ((1 - y / imageHeight - texture.offset.y) / texture.repeat.y - 0.5) *
        height,
    );
  const pivot = kind === "serpent" ? local(580, 615) : local(655, 690);
  const farPivot = local(740, 610);
  const joints = Array.from({ length: positions.count }, (_, i) => {
    // fitCutout sets repeat/offset in image UV coordinates; image Y points down.
    const x = (texture.offset.x + uv.getX(i) * texture.repeat.x) * imageWidth;
    const y =
      (1 - texture.offset.y - uv.getY(i) * texture.repeat.y) * imageHeight;
    if (kind === "serpent") {
      const neckEdge = Math.min(605, 520 + (y - 325) * 0.9);
      return {
        near:
          (1 - smooth(neckEdge - 50, neckEdge, x)) *
          smooth(315, 350, y) *
          (1 - smooth(505, 665, y)),
        far: 0,
      };
    }
    const wingBoundary = 1150 - 0.716 * x;
    return {
      near:
        (1 - smooth(610, 715, x)) *
        smooth(0, 70, wingBoundary - y) *
        (1 - smooth(775, 845, y)),
      far: smooth(620, 720, x) * (1 - smooth(520, 565, y)),
    };
  });
  let disposed = false;
  let atRest = true;
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius *= 1.3;
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
      if (state.folded || state.reduced) {
        if (!atRest) {
          positions.array.set(rest);
          positions.needsUpdate = true;
          geometry.computeVertexNormals();
          atRest = true;
        }
        mesh.userData.creatureDeformation = 0;
        return;
      }
      atRest = false;
      const safeTime = Number.isFinite(time) ? time : 0;
      const phase = ((safeTime % 6.4) + 6.4) % 6.4;
      const lean = smooth(0.7, 1.7, phase) * (1 - smooth(3, 4.8, phase));
      const beatPhase = ((safeTime % 3.2) + 3.2) % 3.2;
      const beats =
        beatPhase < 2.1 ? Math.sin((beatPhase / 2.1) * Math.PI * 2) ** 2 : 0;
      const angle =
        kind === "serpent"
          ? 0.19 * lean + 0.13 * touch
          : 0.4 * beats + 0.13 * touch;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      let maximum = 0;
      for (let i = 0; i < positions.count; i++) {
        const x = rest[i * 3],
          y = rest[i * 3 + 1];
        const joint = joints[i];
        let nx = x,
          ny = y,
          nz = 0;
        if (joint.near > 0) {
          const dx = x - pivot.x,
            dy = y - pivot.y;
          // Serpent leans toward the left-facing head; the broad dove wing closes locally.
          nx += (dx * cos - dy * sin - dx) * joint.near;
          ny += (dx * sin + dy * cos - dy) * joint.near;
          if (kind === "dove") nz += dy * Math.sin(angle) * 0.28 * joint.near;
        }
        if (joint.far > 0) {
          const dx = x - farPivot.x,
            dy = y - farPivot.y;
          nx += (dx * cos + dy * sin - dx) * joint.far;
          ny += (-dx * sin + dy * cos - dy) * joint.far;
          nz += dy * Math.sin(angle) * 0.2 * joint.far;
        }
        positions.setXYZ(i, nx, ny, nz);
        maximum = Math.max(maximum, Math.hypot(nx - x, ny - y, nz));
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      mesh.userData.creatureDeformation = maximum;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      material.dispose();
    },
  };
}
