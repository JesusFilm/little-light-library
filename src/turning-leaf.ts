import * as THREE from "three";
import { setPrintCrop } from "./print-crop";

export type TurnDirection = "forward" | "backward";
export interface PresentedPage {
  story: string;
  index: number;
}
export function pageTurnDirection(
  previous: PresentedPage | undefined,
  next: PresentedPage,
): TurnDirection {
  return previous?.story === next.story &&
    next.index >= 0 &&
    next.index < previous.index
    ? "backward"
    : "forward";
}

/** Curved paper cross-section: each segment keeps its rest length, the spine stays fixed. */
export function leafSection(
  width: number,
  segments: number,
  progress: number,
  direction: TurnDirection,
) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const angle = -Math.PI * (direction === "forward" ? p : 1 - p);
  const bend =
    (direction === "forward" ? 1 : -1) * 0.72 * Math.sin(Math.PI * p);
  const points = [{ x: 0, z: 0 }];
  let x = 0,
    z = 0;
  for (let i = 0; i < segments; i++) {
    // Flat at the binding and the free edge; the middle of the sheet carries the curl.
    const tangent = bend * Math.sin((Math.PI * (i + 0.5)) / segments);
    x += (Math.cos(tangent) * width) / segments;
    z += (Math.sin(tangent) * width) / segments;
    points.push({ x, z });
  }
  return { points, angle, curvature: bend };
}

export function createTurningLeaf(
  width: number,
  depth: number,
  material: THREE.MeshStandardMaterial,
) {
  const across = 48,
    along = 10;
  const geometry = new THREE.PlaneGeometry(width, depth, across, along);
  geometry.translate(width / 2, 0, 0);
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  positions.setUsage(THREE.DynamicDrawUsage);
  // Curvature changes orientation but never exceeds the original paper's reach.
  geometry.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(),
    Math.hypot(width, depth / 2),
  );
  const front = material.clone(),
    back = material.clone();
  front.side = THREE.FrontSide;
  back.side = THREE.BackSide;
  geometry.clearGroups();
  geometry.addGroup(0, geometry.index!.count, 0);
  geometry.addGroup(0, geometry.index!.count, 1);
  const mesh = new THREE.Mesh(geometry, [front, back]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = "flexible-turning-leaf";
  let curvature = 0;
  let lastProgress = -1;
  let lastDirection: TurnDirection | undefined;
  return {
    mesh,
    setPrint(texture: THREE.Texture | null, direction: TurnDirection) {
      setPrintCrop(front, direction === "forward" ? texture : null);
      setPrintCrop(back, direction === "backward" ? texture : null, -1, 1);
    },
    setSpreadPrint(
      source: THREE.Texture | null,
      destination: THREE.Texture | null,
      direction: TurnDirection,
    ) {
      // Front always corresponds to the right page; back corresponds to left,
      // with U reversed because the resting left leaf is rotated by PI.
      setPrintCrop(
        front,
        direction === "forward" ? source : destination,
        0.5,
        0.5,
      );
      setPrintCrop(
        back,
        direction === "forward" ? destination : source,
        -0.5,
        0.5,
      );
    },
    get curvature() {
      return curvature;
    },
    update(progress: number, direction: TurnDirection) {
      const p = THREE.MathUtils.clamp(progress, 0, 1);
      if (p === lastProgress && direction === lastDirection) return;
      lastProgress = p;
      lastDirection = direction;
      const section = leafSection(width, across, p, direction);
      curvature = section.curvature;
      for (let row = 0; row <= along; row++)
        for (let col = 0; col <= across; col++) {
          const i = row * (across + 1) + col;
          positions.setX(i, section.points[col].x);
          positions.setZ(i, section.points[col].z);
        }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    },
  };
}
