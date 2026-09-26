import { authoredMotionTransform } from "./book-animation";
import * as THREE from "three";
import { installCompactHitMask, visiblePaintHit } from "./room-interaction";
import { mobileImageUrl } from "./mobile-images";
import type { PageImages } from "./page-images";
import type {
  AuthoredBook,
  BookElement,
  BookMotion,
  BookSpread,
} from "./authored-book";

export interface AuthoredInteractionResult {
  response: string;
  sound?: "tap";
}

export interface AuthoredStageDebug {
  ground: null | {
    position: number[];
    size: [number, number];
    rotation: number;
    opacity: number;
  };
  elements: {
    id: string;
    kind: "actor" | "prop";
    position: number[];
    anchorPosition: number[];
    meshPosition: number[];
    rotation: number;
    rocking: number;
    held: boolean;
    scale: number[];
    flipX: boolean;
    flipY: boolean;
  }[];
}

type RuntimeElement = {
  definition: BookElement;
  popup: THREE.Group;
  pivot: THREE.Group;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  material: THREE.MeshStandardMaterial;
  baseRotation: number;
  entranceIndex: number;
  interactionStarted?: number;
  held: boolean;
};

type RuntimeGround = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  material: THREE.MeshStandardMaterial;
};

const assetPath = (book: AuthoredBook, id: string, kind: "image" | "audio") => {
  const asset = book.assets[id];
  if (!asset || asset.kind !== kind)
    throw new Error(`Missing ${kind} asset: ${id}`);
  if (asset.src.startsWith("data:")) return asset.src;
  return asset.src.startsWith("/") ? `.${asset.src}` : `./${asset.src}`;
};

const makeMaterial = (texture: THREE.Texture, opacity = 1) =>
  new THREE.MeshStandardMaterial({
    map: texture,
    alphaTest: opacity < 1 ? 0 : 0.03,
    transparent: opacity < 1,
    opacity,
    side: THREE.DoubleSide,
    roughness: 1,
    emissive: 0x9d642b,
    emissiveIntensity: 0,
  });

const transparentVerticalFractions = new WeakMap<
  THREE.Texture,
  { top: number; bottom: number }
>();

/** Return the alpha padding on either vertical edge of a local image texture. */
function transparentVerticalPaddingFraction(
  texture: THREE.Texture,
  useTopEdge: boolean,
) {
  const cached = transparentVerticalFractions.get(texture);
  if (cached) return useTopEdge ? cached.top : cached.bottom;

  const image = texture.image as CanvasImageSource & {
    data?: ArrayLike<number>;
    height?: number;
    naturalHeight?: number;
    naturalWidth?: number;
    videoHeight?: number;
    videoWidth?: number;
    width?: number;
  };
  const width = Number(
    image?.naturalWidth ?? image?.videoWidth ?? image?.width,
  );
  const height = Number(
    image?.naturalHeight ?? image?.videoHeight ?? image?.height,
  );
  if (!(width > 0 && height > 0)) return 0;

  try {
    let pixels: ArrayLike<number> | undefined;
    if (image.data && image.data.length >= width * height * 4) {
      pixels = image.data;
    } else if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(image, 0, 0, width, height);
        pixels = context.getImageData(0, 0, width, height).data;
      }
    }
    if (!pixels) return 0;

    const left = THREE.MathUtils.clamp(
      Math.floor(texture.offset.x * width),
      0,
      width - 1,
    );
    const right = THREE.MathUtils.clamp(
      Math.ceil((texture.offset.x + texture.repeat.x) * width),
      left + 1,
      width,
    );
    const top = THREE.MathUtils.clamp(
      Math.floor((1 - texture.offset.y - texture.repeat.y) * height),
      0,
      height - 1,
    );
    const bottom = THREE.MathUtils.clamp(
      Math.ceil((1 - texture.offset.y) * height),
      top + 1,
      height,
    );
    let firstVisibleRow = bottom;
    let lastVisibleRow = -1;
    for (let y = top; y < bottom; y++) {
      const pixelRow = texture.flipY ? y : height - 1 - y;
      for (let x = left; x < right; x++) {
        if (pixels[(pixelRow * width + x) * 4 + 3] > 32) {
          firstVisibleRow = Math.min(firstVisibleRow, y);
          lastVisibleRow = Math.max(lastVisibleRow, y);
        }
      }
    }
    if (lastVisibleRow < 0) return 0;

    const imageHeight = bottom - top;
    const padding = {
      top: THREE.MathUtils.clamp((firstVisibleRow - top) / imageHeight, 0, 1),
      bottom: THREE.MathUtils.clamp(
        (bottom - 1 - lastVisibleRow) / imageHeight,
        0,
        1,
      ),
    };
    transparentVerticalFractions.set(texture, padding);
    return useTopEdge ? padding.top : padding.bottom;
  } catch {
    // Mock textures, tainted canvases, and unsupported image sources keep the
    // existing edge anchor, so failed alpha inspection never blocks a page.
    return 0;
  }
}

function selectAtlasPose(
  texture: THREE.Texture,
  index: number,
  columns: number,
) {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeIndex = THREE.MathUtils.clamp(
    Math.floor(index),
    0,
    safeColumns - 1,
  );
  texture.repeat.set(1 / safeColumns, 1);
  texture.offset.set(safeIndex / safeColumns, 0);
  const image = texture.image as CanvasImageSource & {
    width?: number;
    height?: number;
  };
  const width = Number(image?.width);
  const height = Number(image?.height);
  if (!(width > 0 && height > 0)) return;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, width, height).data;
    const cellWidth = width / safeColumns;
    const left = Math.ceil(safeIndex * cellWidth);
    const right = Math.floor((safeIndex + 1) * cellWidth);
    let minX = right,
      maxX = left,
      minY = height,
      maxY = 0;
    for (let y = 0; y < height; y++)
      for (let x = left; x < right; x++)
        if (data[(y * width + x) * 4 + 3] > 32) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
    if (maxX >= minX && maxY >= minY) {
      texture.repeat.set((maxX - minX + 1) / width, (maxY - minY + 1) / height);
      texture.offset.set(minX / width, 1 - (maxY + 1) / height);
    }
  } catch {
    // The validated local/data asset remains usable with its whole atlas cell.
  }
}

const disposeDetached = (root: THREE.Object3D, textures: THREE.Texture[]) => {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material])
      materials.add(material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  new Set(textures).forEach((texture) => texture.dispose());
  root.clear();
};

export function authoredRockAngle(motion: BookMotion, elapsed: number) {
  return authoredMotionTransform(motion, elapsed).rotation;
}

export interface CharacterEntrance {
  opacity: number;
  scale: number;
}

/** A quiet settle after the paper unfolds; characters stay readable throughout. */
export function authoredCharacterEntrance(
  elapsed: number,
  reducedMotion = false,
): CharacterEntrance {
  if (reducedMotion) return { opacity: 1, scale: 1 };
  const progress = THREE.MathUtils.clamp(elapsed / 0.32, 0, 1);
  const eased = 1 - (1 - progress) ** 3;
  return {
    opacity: 1,
    scale: 0.985 + 0.015 * eased,
  };
}

/** Flip artwork inside its rectangle, leaving placement and atlas selection unchanged. */
function flipImage(
  mesh: THREE.Mesh<THREE.PlaneGeometry>,
  flipX = false,
  flipY = false,
) {
  const uv = mesh.geometry.getAttribute("uv");
  const original = (mesh.geometry.userData.originalUV ??= Array.from(uv.array));
  for (let i = 0; i < uv.count; i++)
    uv.setXY(
      i,
      flipX ? 1 - original[i * 2] : original[i * 2],
      flipY ? 1 - original[i * 2 + 1] : original[i * 2 + 1],
    );
  uv.needsUpdate = true;
}

/** Runtime for the bounded, versioned paper-stage contract. */
export class AuthoredStage {
  readonly root = new THREE.Group();
  readonly popups: THREE.Group[] = [];
  readonly textures: THREE.Texture[] = [];
  readonly interactiveIds: string[];
  readonly backdropTexture: THREE.Texture;
  readonly coverTexture: THREE.Texture;
  private readonly elements: RuntimeElement[];
  private readonly segmentStarts = new Map<string, number>();
  private decodedDurations?: readonly number[];
  private openedAt: number | undefined;
  private entranceStartedAt = 0;

  private constructor(
    backdropTexture: THREE.Texture,
    coverTexture: THREE.Texture,
    elements: RuntimeElement[],
    spread: BookSpread,
    private readonly ground?: RuntimeGround,
  ) {
    this.backdropTexture = backdropTexture;
    this.coverTexture = coverTexture;
    this.elements = elements;
    this.interactiveIds = elements
      .filter(
        ({ definition }) =>
          definition.kind === "actor" || definition.interaction,
      )
      .map(({ definition }) => definition.id);
    let start = 0;
    for (const segment of spread.segments) {
      this.segmentStarts.set(segment.id, start);
      start += segment.narration?.duration ?? 0;
    }
  }

  static async create(
    book: AuthoredBook,
    spread: BookSpread,
    loader: THREE.TextureLoader,
    stillCurrent: () => boolean,
    pageImages?: PageImages,
  ) {
    const root = new THREE.Group();
    root.name = `authored-stage-${spread.id}`;
    const popups: THREE.Group[] = [];
    const textures: THREE.Texture[] = [];
    const elements: RuntimeElement[] = [];
    const load = async (asset: string) => {
      const url = mobileImageUrl(assetPath(book, asset, "image"));
      const texture = pageImages
        ? await pageImages.texture(url)
        : await loader.loadAsync(url);
      if (!stillCurrent()) {
        texture.dispose();
        throw new Error("authored-stage-superseded");
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      textures.push(texture);
      return texture;
    };
    const popup = (x: number, depth: number) => {
      const group = new THREE.Group();
      group.userData.foldStart = Math.PI;
      group.position.set(x, depth, 0.075);
      root.add(group);
      popups.push(group);
      return group;
    };

    try {
      // Fetch and decode the small set of current-page images together. The
      // previous serial loads multiplied network latency on slow connections.
      // Keep distinct Texture objects for elements because atlas poses mutate
      // repeat/offset on each instance.
      const requested = [
        load(spread.backdrop.asset),
        ...(book.cover === spread.backdrop.asset ? [] : [load(book.cover)]),
        ...(spread.ground ? [load(spread.ground.asset)] : []),
        ...spread.elements.map((definition) => load(definition.asset)),
      ];
      const settled = await Promise.allSettled(requested);
      const failed = settled.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );
      if (failed) throw failed.reason;
      const loaded = settled.map(
        (result) => (result as PromiseFulfilledResult<THREE.Texture>).value,
      );
      const backdropTexture = loaded[0];
      let nextTexture = 1;
      const coverTexture =
        book.cover === spread.backdrop.asset
          ? backdropTexture
          : loaded[nextTexture++];
      const backdrop = popup(0, 1.22);
      const backdropMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.8, 2.7),
        makeMaterial(backdropTexture),
      );
      flipImage(backdropMesh, spread.backdrop.flipX, spread.backdrop.flipY);
      backdropMesh.position.y = 1.35;
      backdropMesh.castShadow = backdropMesh.receiveShadow = true;
      backdrop.add(backdropMesh);

      let runtimeGround: RuntimeGround | undefined;
      if (spread.ground) {
        const definition = spread.ground;
        const texture = loaded[nextTexture++];
        const material = makeMaterial(texture, definition.opacity ?? 1);
        material.depthWrite = false;
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(definition.width, definition.height),
          material,
        );
        flipImage(ground, definition.flipX, definition.flipY);
        ground.name = "authored-ground";
        ground.userData.staticPageSurface = true;
        ground.position.set(definition.x, definition.depth, 0.046);
        ground.rotation.z = THREE.MathUtils.degToRad(definition.rotation ?? 0);
        ground.receiveShadow = true;
        root.add(ground);
        runtimeGround = { mesh: ground, material };
      }

      for (const definition of spread.elements) {
        const texture = loaded[nextTexture++];
        if (definition.kind === "actor" || definition.interaction)
          installCompactHitMask(texture);
        if (definition.pose)
          selectAtlasPose(
            texture,
            definition.pose.index,
            definition.pose.columns,
          );
        const material = makeMaterial(texture);
        const entranceIndex =
          definition.kind === "actor"
            ? elements.filter(
                ({ definition: previous }) => previous.kind === "actor",
              ).length
            : -1;
        if (entranceIndex >= 0) {
          material.transparent = true;
          material.depthWrite = false;
        }
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(
            definition.placement.width,
            definition.placement.height,
          ),
          material,
        );
        flipImage(mesh, definition.flipX, definition.flipY);
        mesh.name = `authored-element-${definition.id}`;
        mesh.castShadow = mesh.receiveShadow = true;
        const stand = popup(definition.placement.x, definition.placement.depth);
        const pivot = new THREE.Group();
        pivot.name = `authored-anchor-${definition.id}`;
        pivot.rotation.z = THREE.MathUtils.degToRad(
          definition.placement.rotation ?? 0,
        );
        const elevation = definition.placement.elevation ?? 0;
        pivot.position.y = elevation;
        mesh.position.y =
          definition.placement.anchor === "center"
            ? 0
            : definition.placement.height / 2 -
              transparentVerticalPaddingFraction(
                texture,
                definition.flipY ?? false,
              ) *
                definition.placement.height;
        pivot.add(mesh);
        stand.add(pivot);
        elements.push({
          definition,
          popup: stand,
          pivot,
          mesh,
          material,
          baseRotation: pivot.rotation.z,
          entranceIndex,
          held: false,
        });
      }
      if (!stillCurrent()) throw new Error("authored-stage-superseded");
      const stage = new AuthoredStage(
        backdropTexture,
        coverTexture,
        elements,
        spread,
        runtimeGround,
      );
      stage.root.add(...root.children);
      stage.popups.push(...popups);
      stage.textures.push(...textures);
      return stage;
    } catch (error) {
      disposeDetached(root, textures);
      throw error;
    }
  }

  narrationDurations(durations: readonly number[]) {
    if (
      durations === this.decodedDurations ||
      durations.length !== this.segmentStarts.size
    )
      return;
    this.decodedDurations = durations;
    let offset = 0;
    [...this.segmentStarts.keys()].forEach((id, index) => {
      this.segmentStarts.set(id, offset);
      offset += durations[index];
    });
  }

  activate(id: string): AuthoredInteractionResult | undefined {
    const element = this.elements.find(
      ({ definition }) =>
        definition.id === id &&
        (definition.kind === "actor" || definition.interaction),
    );
    if (!element) return;
    element.interactionStarted = performance.now() / 1000;
    return {
      response:
        element.definition.interaction?.response ?? element.definition.label,
      sound: element.definition.interaction?.sound,
    };
  }

  hit(ray: THREE.Raycaster): string | undefined {
    const targets = this.elements.filter(
      ({ definition }) => definition.kind === "actor" || definition.interaction,
    );
    for (const hit of ray.intersectObjects(targets.map(({ mesh }) => mesh))) {
      if (!visiblePaintHit(hit)) continue;
      return targets.find(({ mesh }) => mesh === hit.object)?.definition.id;
    }
  }

  hold(id: string, active: boolean) {
    const element = this.elements.find(
      ({ definition }) => definition.id === id,
    );
    if (element?.definition.interaction?.effect !== "hold-rock") return false;
    element.held = active;
    if (active) element.interactionStarted = performance.now() / 1000;
    return true;
  }

  releaseHolds() {
    for (const element of this.elements) element.held = false;
  }

  begin() {
    this.openedAt = undefined;
    // Settle actors while the supporting paper rises, before narration is ready.
    this.entranceStartedAt = performance.now() / 1000;
    this.releaseHolds();
  }

  dispose() {
    disposeDetached(this.root, this.textures);
  }

  rest() {
    this.releaseHolds();
    for (const element of this.elements) {
      element.pivot.position.set(
        0,
        element.definition.placement.elevation ?? 0,
        0,
      );
      element.pivot.scale.set(1, 1, 1);
      element.pivot.rotation.z = element.baseRotation;
      element.pivot.userData.authoredRocking = 0;
      if (element.entranceIndex >= 0) {
        element.material.opacity = 1;
        element.mesh.scale.set(1, 1, 1);
      }
    }
  }

  update(
    position: number,
    playing: boolean,
    reduced: boolean,
    folded = false,
    timeline = false,
    narrationEnabled = true,
  ) {
    const now = performance.now() / 1000;
    if (!folded && this.openedAt === undefined) this.openedAt = now;
    for (const element of this.elements) {
      const { definition, pivot, mesh, material, baseRotation } = element;
      const interactionAge =
        element.interactionStarted === undefined
          ? Infinity
          : now - element.interactionStarted;
      material.emissiveIntensity =
        interactionAge < 1.4 || element.held ? 0.18 : 0;
      const motion = definition.motion;
      let elapsed = -1;
      if (motion && !reduced && !folded) {
        if (motion.trigger === "open")
          elapsed = timeline ? position : now - (this.openedAt ?? now);
        else if (motion.trigger === "interaction") elapsed = interactionAge;
        else if ((playing || timeline) && narrationEnabled) {
          const start = motion.segment
            ? this.segmentStarts.get(motion.segment)
            : 0;
          if (start !== undefined) elapsed = position - start;
        }
      }
      const transform = motion
        ? authoredMotionTransform(motion, elapsed)
        : { rotation: 0, x: 0, y: 0, scale: 1 };
      const entrance =
        element.entranceIndex >= 0
          ? authoredCharacterEntrance(
              now - this.entranceStartedAt - element.entranceIndex * 0.09,
              reduced,
            )
          : { opacity: 1, scale: 1 };
      if (element.entranceIndex >= 0) {
        material.opacity = entrance.opacity;
        mesh.scale.set(entrance.scale, entrance.scale, 1);
      }
      const effect = definition.interaction?.effect;
      const hop =
        effect === "hop" && !reduced && !folded && interactionAge < 0.85
          ? Math.sin((Math.PI * interactionAge) / 0.85) ** 2 * 0.36
          : 0;
      const tapPulse =
        !effect &&
        definition.kind === "actor" &&
        !reduced &&
        !folded &&
        interactionAge < 0.7
          ? Math.sin((Math.PI * interactionAge) / 0.7) ** 2 * 0.055
          : 0;
      const rock =
        effect === "hold-rock" && element.held && !reduced && !folded
          ? THREE.MathUtils.clamp(transform.rotation * 2, -0.087, 0.087)
          : transform.rotation;
      pivot.rotation.z = baseRotation + rock;
      pivot.position.set(
        transform.x * definition.placement.width,
        (definition.placement.elevation ?? 0) +
          transform.y * definition.placement.height +
          hop,
        0,
      );
      pivot.scale.set(
        transform.scale + tapPulse,
        transform.scale + tapPulse,
        1,
      );
      pivot.userData.authoredRocking = rock;
    }
  }

  debug(): AuthoredStageDebug {
    const ground = this.ground;
    return {
      ground: ground
        ? {
            position: ground.mesh.position.toArray(),
            size: [
              ground.mesh.geometry.parameters.width * ground.mesh.scale.x,
              ground.mesh.geometry.parameters.height * ground.mesh.scale.y,
            ],
            rotation: ground.mesh.rotation.z,
            opacity: ground.material.opacity,
          }
        : null,
      elements: this.elements.map(({ definition, popup, pivot, held }) => ({
        id: definition.id,
        kind: definition.kind,
        position: popup.position.toArray(),
        anchorPosition: pivot.position.toArray(),
        meshPosition: (
          pivot.children[0]?.position ?? new THREE.Vector3()
        ).toArray(),
        rotation: pivot.rotation.z,
        rocking: Number(pivot.userData.authoredRocking ?? 0),
        held,
        scale: pivot.scale.toArray(),
        flipX: definition.flipX ?? false,
        flipY: definition.flipY ?? false,
      })),
    };
  }

  interactionTargets() {
    return this.elements
      .filter(
        ({ definition }) =>
          definition.kind === "actor" || definition.interaction,
      )
      .map(({ definition, mesh }) => ({
        id: definition.id,
        label: definition.label,
        interaction: definition.interaction,
        mesh,
      }));
  }
}
