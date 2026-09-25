import * as THREE from "three";

export type PaperActorMood =
  | "welcome"
  | "listen"
  | "warn"
  | "sad"
  | "work"
  | "hope";
export type PaperActorKind = "adam" | "eve" | "noah";

/** A printed actor whose geometry stays rigid while the anchored root can lean. */
export interface PaperActor {
  root: THREE.Group;
  update(
    time: number,
    mood: PaperActorMood,
    speaking: boolean,
    reduced: boolean,
    reaction?: number,
    hover?: boolean,
  ): void;
  dispose(): void;
}

const smooth = (a: number, b: number, value: number) => {
  const v = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return v * v * (3 - 2 * v);
};

type PaperVertex = { x: number; y: number; u: number; v: number };
/** Exact triangle clipping partitions one texture without duplicate silhouettes. */
function partitionForearm(
  source: THREE.BufferGeometry,
  width: number,
  height: number,
  kind: PaperActorKind = "noah",
) {
  const fruit = kind === "eve",
    presenting = kind === "adam";
  const crop = presenting
    ? [184, 18, 301, 854]
    : fruit
      ? [724, 13, 329, 865]
      : [108, 123, 440, 732];
  // The fruit partition stops at exposed elbow skin, above the stationary cuff.
  const sourcePolygon = presenting
    ? [
        [432, 327],
        [449, 325],
        [461, 330],
        [466, 342],
        [462, 355],
        [450, 370],
        [432, 380],
        [413, 388],
        [395, 389],
        [382, 384],
        [371, 377],
        [374, 370],
        [388, 373],
        [402, 363],
        [412, 351],
        [419, 341],
        [426, 338],
      ]
    : fruit
      ? [
          [996, 20],
          [1100, 20],
          [1100, 247],
          [1018, 247],
          [1000, 203],
        ]
      : [
          // Keep the broad mallet/hand silhouette, then taper the lower edge
          // at the cream cuff so the blue robe sleeve stays in the body.
          [90, 100],
          [265, 100],
          [265, 200],
          [230, 230],
          [198, 260],
          [174, 280],
          [158, 300],
          [154, 320],
          [154, 342],
          [135, 342],
          [130, 322],
          [115, 304],
          [100, 285],
          [90, 264],
          [100, 240],
          [124, 214],
          [99, 190],
        ];
  const polygon = sourcePolygon.map(([x, y]) => ({
    x: (x - crop[0]) / crop[2],
    y: 1 - (y - crop[1]) / crop[3],
  }));
  const elbow = presenting ? [440, 335] : fruit ? [1023, 244] : [150, 340];
  const masks =
    presenting || kind === "noah"
      ? THREE.ShapeUtils.triangulateShape(
          polygon.map((p) => new THREE.Vector2(p.x, p.y)),
          [],
        ).map((indices) => {
          const triangle = indices.map((i) => polygon[i]);
          const [a, b, c] = triangle;
          if ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0)
            triangle.reverse();
          return triangle;
        })
      : [polygon];
  const body: PaperVertex[][] = [],
    arm: PaperVertex[][] = [];
  const uv = source.getAttribute("uv");
  const pos = source.getAttribute("position");
  const split = (
    points: PaperVertex[],
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => {
    const side = (p: PaperVertex) => {
      const cross = (b.x - a.x) * (p.v - a.y) - (b.y - a.y) * (p.u - a.x);
      return Math.abs(cross) < 1e-12 ? 0 : cross;
    };
    const inside: PaperVertex[] = [],
      outside: PaperVertex[] = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i],
        q = points[(i + 1) % points.length],
        d = side(p),
        e = side(q);
      if (d <= 0) inside.push(p);
      if (d >= 0) outside.push(p);
      if ((d < 0 && e > 0) || (d > 0 && e < 0)) {
        const t = d / (d - e),
          v = {
            x: p.x + (q.x - p.x) * t,
            y: p.y + (q.y - p.y) * t,
            u: p.u + (q.u - p.u) * t,
            v: p.v + (q.v - p.v) * t,
          };
        inside.push(v);
        outside.push(v);
      }
    }
    return { inside, outside };
  };
  const index = source.getIndex()!;
  for (let i = 0; i < index.count; i += 3) {
    let pieces = [
      Array.from({ length: 3 }, (_, j) => {
        const k = index.getX(i + j);
        return { x: pos.getX(k), y: pos.getY(k), u: uv.getX(k), v: uv.getY(k) };
      }),
    ];
    // Triangulated skin masks also support a concave palm outline without carrying clothing.
    for (const mask of masks) {
      const next: PaperVertex[][] = [];
      for (const piece of pieces) {
        let remaining = piece;
        for (let e = 0; e < mask.length && remaining.length >= 3; e++) {
          const result = split(remaining, mask[e], mask[(e + 1) % mask.length]);
          if (result.outside.length >= 3) next.push(result.outside);
          remaining = result.inside;
        }
        if (remaining.length >= 3) arm.push(remaining);
      }
      pieces = next;
    }
    body.push(...pieces);
  }
  const make = (pieces: PaperVertex[][]) => {
    const p: number[] = [],
      t: number[] = [];
    for (const polygon of pieces)
      for (let i = 1; i < polygon.length - 1; i++)
        for (const v of [polygon[0], polygon[i], polygon[i + 1]]) {
          p.push(v.x, v.y, 0);
          t.push(v.u, v.v);
        }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(t, 2));
    geometry.computeVertexNormals();
    return geometry;
  };
  return {
    body: make(body),
    arm: make(arm),
    // A small stationary print at Noah's elbow hides the moving edge of the
    // cutout throughout the hammer arc. It samples the same original pixels,
    // so it behaves as a natural overlap rather than a painted-on joint.
    joint:
      kind === "noah"
        ? (() => {
            const [cx, cy] = elbow;
            const segments = 48;
            const innerRadius = [17, 32];
            const outerRadius = [28, 45];
            const coordinates = (rx: number, ry: number, angle: number) => {
              const sourceX = cx + Math.cos(angle) * rx;
              const sourceY = cy + Math.sin(angle) * ry;
              return {
                x: ((sourceX - crop[0]) / crop[2] - 0.5) * width,
                y: (1 - (sourceY - crop[1]) / crop[3]) * height,
                u: (sourceX - crop[0]) / crop[2],
                v: 1 - (sourceY - crop[1]) / crop[3],
              };
            };
            const positions: number[] = [];
            const uvs: number[] = [];
            const colors: number[] = [];
            const triangle = (
              a: PaperVertex,
              alphaA: number,
              b: PaperVertex,
              alphaB: number,
              c: PaperVertex,
              alphaC: number,
            ) => {
              for (const [point, alpha] of [
                [a, alphaA],
                [b, alphaB],
                [c, alphaC],
              ] as const) {
                positions.push(point.x, point.y, 0);
                uvs.push(point.u, point.v);
                colors.push(1, 1, 1, alpha);
              }
            };
            const center = coordinates(0, 0, 0);
            for (let i = 0; i < segments; i++) {
              const a = (i / segments) * Math.PI * 2;
              const b = ((i + 1) / segments) * Math.PI * 2;
              const innerA = coordinates(innerRadius[0], innerRadius[1], a);
              const innerB = coordinates(innerRadius[0], innerRadius[1], b);
              const outerA = coordinates(outerRadius[0], outerRadius[1], a);
              const outerB = coordinates(outerRadius[0], outerRadius[1], b);
              triangle(center, 1, innerA, 1, innerB, 1);
              triangle(innerA, 1, outerA, 0, innerB, 1);
              triangle(innerB, 1, outerA, 0, outerB, 0);
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute(
              "position",
              new THREE.Float32BufferAttribute(positions, 3),
            );
            geometry.setAttribute(
              "uv",
              new THREE.Float32BufferAttribute(uvs, 2),
            );
            geometry.setAttribute(
              "color",
              new THREE.Float32BufferAttribute(colors, 4),
            );
            geometry.computeVertexNormals();
            return geometry;
          })()
        : undefined,
    pivot: new THREE.Vector3(
      ((elbow[0] - crop[0]) / crop[2] - 0.5) * width,
      (1 - (elbow[1] - crop[1]) / crop[3]) * height,
      0.02,
    ),
  };
}

/** A selectable, alpha-trimmed illustration with no articulated geometry. */
export function createRigidPaperActor(
  texture: THREE.Texture,
  kind: PaperActorKind,
  width: number,
): PaperActor {
  const root = new THREE.Group();
  root.name = `paper-actor-${kind}`;
  const image = texture.image as
    | { width?: number; height?: number }
    | undefined;
  const aspect =
    Number(texture.userData.aspect) ||
    (image?.width || 1024) / (image?.height || 1536);
  const height = width / aspect;
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.translate(0, height / 2, 0);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.35,
    roughness: 0.95,
    metalness: 0,
    emissive: 0x9d642b,
    emissiveIntensity: 0,
  });
  const imageCard = new THREE.Mesh(geometry, material);
  imageCard.name = `rigid-cutout-${kind}`;
  imageCard.castShadow = true;
  imageCard.receiveShadow = true;
  imageCard.userData.visibleWidth = width;
  imageCard.userData.visibleHeight = height;
  imageCard.raycast = function (
    this: THREE.Mesh,
    raycaster: THREE.Raycaster,
    hits: THREE.Intersection[],
  ) {
    if (this.visible) THREE.Mesh.prototype.raycast.call(this, raycaster, hits);
  };
  root.userData.visibleHeight = height;
  root.add(imageCard);
  let disposed = false;
  return {
    root,
    update(_time, _mood, _speaking, reduced, reaction = 0, hover = false) {
      if (disposed) return;
      const touch = Number.isFinite(reaction)
        ? THREE.MathUtils.clamp(reaction, 0, 1)
        : 0;
      material.emissiveIntensity = touch * 0.22 + (hover ? 0.035 : 0);
      imageCard.scale.setScalar(1 + (reduced ? 0 : touch * 0.055));
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      material.dispose();
      root.clear();
    },
  };
}

/** Time is elapsed seconds, independent of narration playback rate. Texture stays caller-owned. */
export function createPaperActor(
  texture: THREE.Texture,
  kind: PaperActorKind,
  height: number,
): PaperActor {
  const root = new THREE.Group();
  root.name = `paper-actor-${kind}`;
  const image = texture.image as
    | { width?: number; height?: number }
    | undefined;
  const aspect =
    Number(texture.userData.aspect) ||
    (image?.width || 1024) / (image?.height || 1536);
  const width = height * aspect;
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.translate(0, height / 2, 0);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: false,
    alphaTest: 0.35,
    roughness: 0.95,
    metalness: 0,
    emissive: 0x9d642b,
    emissiveIntensity: 0,
  });
  const puppet = new THREE.Mesh(geometry, material);
  puppet.name = `articulated-${kind}`;
  root.userData.visibleHeight = height;
  puppet.castShadow = true;
  puppet.receiveShadow = true;
  // Keep dynamic head/hand edges inside the culling volume.
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius *= 1.15;
  root.add(puppet);
  const visibleRaycast = function (
    this: THREE.Mesh,
    raycaster: THREE.Raycaster,
    hits: THREE.Intersection[],
  ) {
    if (this.visible) THREE.Mesh.prototype.raycast.call(this, raycaster, hits);
  };
  puppet.raycast = visibleRaycast;

  const fruitPose =
    kind === "eve" && texture.userData.poseAtlas && texture.userData.pose === 1;
  const presentationPose =
    kind === "adam" &&
    texture.userData.poseAtlas &&
    texture.userData.pose === 0;
  const split =
    (kind === "noah" && texture.userData.poseAtlas) ||
    fruitPose ||
    presentationPose
      ? partitionForearm(geometry, width, height, kind)
      : undefined;
  const workBody = split ? new THREE.Mesh(split.body, material) : undefined;
  const forearm = split ? new THREE.Mesh(split.arm, material) : undefined;
  const jointMaterial = split?.joint ? material.clone() : undefined;
  if (jointMaterial) {
    jointMaterial.vertexColors = true;
    jointMaterial.transparent = true;
    jointMaterial.alphaTest = 0;
    jointMaterial.depthWrite = false;
  }
  const joint =
    split?.joint && kind === "noah"
      ? new THREE.Mesh(split.joint, jointMaterial!)
      : undefined;
  const garmentPatch =
    split && presentationPose
      ? new THREE.Mesh(split.arm.clone(), material)
      : undefined;
  if (garmentPatch) {
    garmentPatch.name = "adam-garment-underpatch";
    garmentPatch.position.z = 0.008;
    const uv = garmentPatch.geometry.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) {
      const x = uv.getX(i) * 301 + 184,
        y = (1 - uv.getY(i)) * 854 + 18;
      const garmentX = 400 + THREE.MathUtils.clamp((x - 371) / 95, 0, 1) * 32;
      const garmentY = 440 + THREE.MathUtils.clamp((y - 325) / 64, 0, 1) * 30;
      uv.setXY(i, (garmentX - 184) / 301, 1 - (garmentY - 18) / 854);
    }
    garmentPatch.visible = false;
    garmentPatch.raycast = visibleRaycast;
    root.add(garmentPatch);
  }
  if (split && workBody && forearm) {
    forearm.geometry.translate(-split.pivot.x, -split.pivot.y, 0);
    forearm.position.copy(split.pivot);
    forearm.name = `rigid-${kind}-forearm`;
    workBody.name = `${kind}-body-without-forearm`;
    for (const mesh of [workBody, forearm]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.visible = false;
      mesh.raycast = visibleRaycast;
      root.add(mesh);
    }
  }
  if (joint) {
    joint.name = "noah-hammer-joint-underlap";
    joint.position.z = 0.01;
    joint.visible = false;
    joint.raycast = visibleRaycast;
    root.add(joint);
  }
  let lastTime: number | undefined;
  let currentLean = 0;
  let disposed = false;

  return {
    root,
    update(time, mood, speaking, reduced, reaction = 0, hover = false) {
      if (disposed) return;
      // The caller owns the transient envelope. Character art remains a rigid
      // printed card; only the root leans by a few degrees in response to mood.
      const touch = Number.isFinite(reaction)
        ? THREE.MathUtils.clamp(reaction, 0, 1)
        : 0;
      material.emissiveIntensity = touch * 0.22 + (hover ? 0.035 : 0);
      const hammering = Boolean(
        split && kind === "noah" && mood === "work" && !reduced,
      );
      const consideringFruit = Boolean(
        fruitPose && mood === "warn" && !reduced,
      );
      const presenting = Boolean(
        presentationPose && (mood === "welcome" || mood === "warn") && !reduced,
      );
      const articulated = hammering || consideringFruit || presenting;
      if (garmentPatch) garmentPatch.visible = presenting;
      puppet.visible = !articulated;
      if (workBody && forearm) {
        workBody.visible = forearm.visible = articulated;
      }
      if (joint) joint.visible = hammering;
      if (reduced) {
        root.rotation.z = 0;
        if (forearm) forearm.rotation.z = 0;
        lastTime = time;
        return;
      }
      const dt =
        lastTime === undefined
          ? 1 / 60
          : Math.min(0.08, Math.max(0, time - lastTime));
      lastTime = time;
      const blend = dt === 0 ? 1 : 1 - Math.exp(-dt * 5);
      const leanTarget = {
        welcome: -0.018,
        listen: 0,
        warn: -0.012,
        sad: 0.004,
        work: 0.004,
        hope: -0.008,
      }[mood];
      const reactionLean = touch * (mood === "sad" ? 0.006 : -0.026);
      currentLean += (leanTarget + reactionLean - currentLean) * blend;
      root.rotation.z = currentLean + (speaking ? -0.002 : 0);
      // Pose 0 has the mallet in the raised image-left hand. Pause, strike,
      // briefly hold, then recover: a task beat rather than perpetual waving.
      const hammerPhase = (((time % 2.6) + 2.6) % 2.6) / 2.6;
      const hammerAngle = hammering
        ? -1.9 *
          smooth(0.18, 0.32, hammerPhase) *
          (1 - smooth(0.46, 0.8, hammerPhase))
        : 0;
      // A hesitant outward presentation: pause, move away from the face, hold, return.
      // No eating beat, and no continuously oscillating hand.
      const fruitPhase = ((time % 6.4) + 6.4) % 6.4;
      const fruitAngle = consideringFruit
        ? -0.38 *
          smooth(0.9, 1.8, fruitPhase) *
          (1 - smooth(3, 4.3, fruitPhase))
        : 0;
      const presentationPhase = ((time % 6.4) + 6.4) % 6.4;
      const presentationAngle = presenting
        ? -1.15 *
          smooth(0.8, 1.8, presentationPhase) *
          (1 - smooth(3.2, 4.8, presentationPhase))
        : 0;
      if (forearm)
        forearm.rotation.z =
          (presenting
            ? presentationAngle
            : consideringFruit
              ? fruitAngle
              : hammerAngle) || 0;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      split?.body.dispose();
      split?.arm.dispose();
      split?.joint?.dispose();
      jointMaterial?.dispose();
      garmentPatch?.geometry.dispose();
      material.dispose();
      root.clear();
    },
  };
}
