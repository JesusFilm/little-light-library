import {
  createPaperCreature,
  type PaperCreature,
  type PaperCreatureKind,
} from "./paper-creature";
import {
  ReadingFocus,
  readingFocusTarget,
  constrainReadingFocus,
} from "./reading-focus";
import { createPageGround } from "./garden-floor";
import { RoomOrbitGesture, orbitRoomGoal } from "./room-orbit";
import {
  wallPaperUv,
  curtainGeometry,
  quiltPatchGeometry,
  quiltWeaveTexture,
  windowViewTexture,
} from "./room-material";
import { visiblePaintHit } from "./room-interaction";
import * as THREE from "three";
import { createBookCoverTexture, resolveBookAppearance } from "./book-cover";
import type { BookAppearance } from "./authored-book";
import { bookPose } from "./choreography";
import { popupFoldAngle, popupActorsAtRest } from "./popup-fold";
import { setPrintCrop } from "./print-crop";
import { spreadReveal } from "./spread-reveal";
import { RetainedStage } from "./retained-stage";
import { foldedStagePose } from "./folded-stage-pose";
import { popupFoldSurface } from "./popup-fold-surface";
import { ShelfHint } from "./shelf-hint";
import {
  captureFoldedPage,
  canCaptureOutgoing,
  LeafPrintStore,
  printLayout,
} from "./leaf-print";
import {
  createTurningLeaf,
  pageTurnDirection,
  type PresentedPage,
  type TurnDirection,
} from "./turning-leaf";
import { stageDirections } from "./stage-direction";
import { legacyStageImageSources, stageAssetUrl } from "./legacy-stage-media";
import { mobileImageUrl } from "./mobile-images";
import { PageImages } from "./page-images";
import { alphaBounds } from "./alpha-bounds";
import {
  mirroredScaleX,
  visibleBottomAnchorY,
  visibleCutoutSize,
} from "./stage-prop-geometry";
import { sampleStageMotion, waveLayerLayout } from "./stage-motion";
import type { LegacyStageMotion, StageProp } from "./stage-direction-types";
import {
  AuthoredStage,
  type AuthoredInteractionResult,
} from "./authored-stage";
import {
  createPaperActor,
  createRigidPaperActor,
  type PaperActor,
  type PaperActorMood,
} from "./paper-actor";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { LocaleData, Page, Story } from "./contracts";
import {
  RoomShelf,
  roomToyLayout,
  SHELF_BOOK_SIZE,
  SHELF_BOOK_YAW,
  type RoomShelfBook,
  type RoomToy,
} from "./room-shelf";

export type Selection =
  | "table-book"
  | "eden"
  | "noah"
  | "adam"
  | "eve"
  | "figure-noah"
  | `shelf:${string}`
  | `toy:${string}`;
type Pickable = THREE.Object3D & { userData: { pick?: Selection } };
const wood = new THREE.MeshStandardMaterial({
  color: 0x805638,
  roughness: 0.9,
});
const paleWood = new THREE.MeshStandardMaterial({
  color: 0xc79b6d,
  roughness: 0.88,
});
const paper = new THREE.MeshStandardMaterial({
  color: 0xfff0d3,
  roughness: 1,
  side: THREE.DoubleSide,
});
const ivory = new THREE.MeshStandardMaterial({
  color: 0xffe9c7,
  roughness: 0.9,
});
const brass = new THREE.MeshStandardMaterial({
  color: 0xb58a4e,
  metalness: 0.32,
  roughness: 0.45,
});

function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d, 0.16) * 0.22),
    material,
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function disc(
  parent: THREE.Object3D,
  r: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, 0.08, 20),
    material,
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
function labelTexture(text: string, bg: string, fg: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 768);
  ctx.strokeStyle = "#d4b77d";
  ctx.lineWidth = 16;
  ctx.strokeRect(28, 28, 456, 712);
  ctx.fillStyle = fg;
  ctx.font = "bold 48px Georgia, serif";
  ctx.textAlign = "center";
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (ctx.measureText(`${line} ${word}`).width > 390 && line) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  lines.forEach((part, i) =>
    ctx.fillText(part, 256, 420 + (i - (lines.length - 1) / 2) * 58),
  );
  ctx.font = "37px Georgia, serif";
  ctx.fillText("✦", 256, 230);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
// Deterministic material studies: grain belongs to the timber, never to a screen overlay.
function grainTexture(base: string, kind: "wood" | "cloth" | "paper") {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  let seed = 917;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 6000; i++) {
    ctx.strokeStyle = `rgba(${kind === "wood" ? "46,23,9" : "255,243,214"},${random() * (kind === "wood" ? 0.085 : 0.055)})`;
    ctx.lineWidth = random() * 1.8 + 0.3;
    ctx.beginPath();
    const x = random() * 512,
      y = random() * 512;
    ctx.moveTo(x, y);
    if (kind === "wood")
      ctx.bezierCurveTo(x + 55, y - 2, x + 110, y + 3, x + 200, y);
    else
      ctx.lineTo(
        x + (kind === "cloth" ? 3 : 1),
        y + (kind === "cloth" ? 0 : 1),
      );
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function installHitMask(texture: THREE.Texture) {
  const image = texture.image as HTMLImageElement;
  const c = document.createElement("canvas");
  c.width = image.width;
  c.height = image.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const alpha = new Uint8Array(c.width * c.height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
  texture.userData.hitMask = { alpha, width: c.width, height: c.height };
  return { c, data };
}
function fitCutout(texture: THREE.Texture, cell = 0, cells = 1) {
  const { c, data } = installHitMask(texture);
  const cellW = c.width / cells;
  const bounds = alphaBounds(c.width, c.height, data, {
    xStart: Math.ceil(cell * cellW),
    xEnd: Math.floor((cell + 1) * cellW),
  });
  if (!bounds) return;
  const visibleWidth = bounds.maxX - bounds.minX + 1;
  const visibleHeight = bounds.maxY - bounds.minY + 1;
  texture.repeat.set(visibleWidth / c.width, visibleHeight / c.height);
  texture.offset.set(bounds.minX / c.width, 1 - (bounds.maxY + 1) / c.height);
  texture.userData.alphaBounds = bounds;
  texture.userData.aspect =
    (bounds.maxX - bounds.minX + 1) / (bounds.maxY - bounds.minY + 1);
}

const roomTint = new THREE.Color(0xffdc91);
const roomGlow = new THREE.Color(0x251600);
const constrainedPhone = () => {
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    matchMedia("(max-width: 600px)").matches &&
    (device.connection?.saveData === true ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
      (device.hardwareConcurrency !== undefined &&
        device.hardwareConcurrency <= 4))
  );
};
const ease = (x: number) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
type PreparedLegacyStage = {
  root: THREE.Group;
  popups: THREE.Group[];
  actors: PaperActor[];
  actorMoods: PaperActorMood[];
  motions: {
    target: THREE.Object3D;
    motion: LegacyStageMotion;
    baseY: number;
    baseRotationZ: number;
  }[];
  actorButtons: HTMLButtonElement[];
  actorNames: string[];
  propNames: string[];
  creatures: {
    creature: PaperCreature;
    kind: PaperCreatureKind;
    label: string;
    button: HTMLButtonElement;
  }[];
  maps: THREE.Texture[];
  texture: THREE.Texture;
  wideEnsemble: boolean;
  actorMood: PaperActorMood;
};

export class LibraryScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42, 1, 0.1, 70);
  private roomRoot = new THREE.Group();
  private roomShelf = new RoomShelf();
  private bookRoot = new THREE.Group();
  private leftLeaf = new THREE.Group();
  private turningPage = new THREE.Group();
  private turningLeaf?: ReturnType<typeof createTurningLeaf>;
  private turnDirection: TurnDirection = "forward";
  private presentedPage?: PresentedPage;
  private loadedPage?: PresentedPage;
  private leafPrint = new LeafPrintStore<THREE.WebGLRenderTarget>();
  private destinationPrint = new LeafPrintStore<THREE.WebGLRenderTarget>();
  private retainedStage = new RetainedStage();
  private transitionWaiting = false;
  private waitingFromRoom = false;
  private waitingPaper?: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshStandardMaterial
  >;
  private stationarySource?: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshStandardMaterial
  >;
  private destinationPaper?: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshStandardMaterial
  >;
  private coverArt?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private closedMap?: THREE.Texture;
  private tableCoverMaterial?: THREE.MeshStandardMaterial;
  private tableSpineMaterial?: THREE.MeshStandardMaterial;
  private tableAccentMaterial?: THREE.MeshStandardMaterial;
  private foldingOut = 0;
  private closing = 0;
  private reviewTime?: number;
  private reviewAge?: number;
  private reviewFoldProgress?: number;
  private reviewFocusAge?: number;
  private readingFocus = new ReadingFocus();
  private readingFocusIndex = -1;
  private readingWideEnsemble = false;
  private readingFocusScale = 1;
  private readingFocusAmount = 0;
  private readingCameraOffset = new THREE.Vector3();
  private readingLookOffset = new THREE.Vector3();
  private touchUntil = 0;
  private touchedActor = -1;
  private hoveredActor = -1;
  private actorNames: string[] = [];
  private propNames: string[] = [];
  private creatures: {
    creature: PaperCreature;
    kind: PaperCreatureKind;
    label: string;
    button: HTMLButtonElement;
  }[] = [];
  private touchedCreature = -1;
  private hoveredCreature = -1;
  private creatureTouchUntil = 0;
  private pageMotionAge(now: number) {
    if (this.reviewTime !== undefined) return this.reviewAge ?? 5;
    // Keep the cover, leaf, popup, and visible-stage thresholds on one clock.
    // The constrained-phone animation remains legible at ~30 rendered fps,
    // while the next page becomes usable promptly after its art is ready.
    return ((now - this.turnStarted) / 1000) * this.pageMotionRate;
  }
  private creatureUsable() {
    if (
      this.mode !== "spread" ||
      this.transitionWaiting ||
      !this.pageRoot.visible ||
      this.foldingOut ||
      this.closing ||
      (this.reviewFoldProgress ?? 0) > 0
    )
      return false;
    const age = this.pageMotionAge(performance.now());
    return this.reduced || bookPose(age, this.opening, false).popups === 1;
  }
  /** Wait for the destination art to reach the canvas before its text is shown. */
  async waitForVisibleStage(isCurrent: () => boolean): Promise<boolean> {
    const generation = this.loadGeneration;
    while (
      !this.disposed &&
      generation === this.loadGeneration &&
      isCurrent()
    ) {
      if (
        !document.hidden &&
        this.mode === "spread" &&
        this.pageRoot.visible &&
        this.lastRenderedAt >= this.turnStarted &&
        !this.transitionWaiting
      )
        return true;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    }
    return false;
  }
  /** Resolve only after an upright frame, or cancel when the reader moves away. */
  async waitForUnfold(isCurrent: () => boolean): Promise<boolean> {
    const generation = this.loadGeneration;
    while (
      !this.disposed &&
      generation === this.loadGeneration &&
      isCurrent() &&
      !document.hidden
    ) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      if (this.creatureUsable() && !this.shelfCoverMotion)
        return (
          !this.disposed &&
          generation === this.loadGeneration &&
          isCurrent() &&
          !document.hidden
        );
    }
    return false;
  }
  private clearCreatureTargets() {
    this.creatures.forEach(({ button }) => button.remove());
    this.touchedCreature = this.hoveredCreature = -1;
    this.creatureTouchUntil = 0;
  }
  private activateCreature(index: number) {
    if (!this.creatureUsable() || !this.creatures[index]) return;
    this.touchedCreature = index;
    this.creatureTouchUntil = performance.now() + 1400;
    this.touchedActor = this.hoveredActor = -1;
    this.onTouch();
  }
  private hitCreature(event: PointerEvent) {
    if (!this.creatureUsable()) return -1;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((event.clientY - rect.top) / rect.height) * 2,
    );
    this.ray.setFromCamera(this.pointer, this.camera);
    for (const hit of this.ray.intersectObjects(
      this.creatures.map(({ creature }) => creature.mesh),
    )) {
      if (visiblePaintHit(hit))
        return this.creatures.findIndex(
          ({ creature }) => creature.mesh === hit.object,
        );
    }
    return -1;
  }
  private actorButtons: HTMLButtonElement[] = [];
  private actorLabel = document.createElement("span");
  private onLeave = (event: PointerEvent) => {
    if (!this.renderer.domElement.hasPointerCapture(event.pointerId))
      this.roomOrbit.cancel(event.pointerId);
    this.hoveredActor = this.hoveredCreature = -1;
    this.hoveredRoom = null;
    this.renderer.domElement.style.cursor = "";
  };
  private activateActor(index: number) {
    if (this.transitionWaiting || !this.pageRoot.visible) return;
    this.touchedCreature = this.hoveredCreature = -1;
    this.touchedActor = index;
    this.touchUntil = performance.now() + 1400;
    if (this.canFocusActor()) {
      const target = this.actors[index]?.root.localToWorld(
        new THREE.Vector3(0, 1.15, 0),
      );
      if (target) {
        this.readingFocusIndex = index;
        let response = readingFocusTarget(
          this.cameraGoal,
          this.lookGoal,
          target,
          this.renderer.domElement.clientWidth < 600,
          this.readingWideEnsemble,
        );
        this.readingFocusScale = 1;
        if (this.readingWideEnsemble) {
          const roots: THREE.Object3D[] = this.actors.map(
            (actor) => actor.root,
          );
          const family = this.pageRoot.getObjectByName("family-ensemble");
          if (family) roots.push(family);
          const points: THREE.Vector3[] = [];
          roots.forEach((root) => {
            const bounds = new THREE.Box3().setFromObject(root);
            if (bounds.isEmpty()) return;
            for (const x of [bounds.min.x, bounds.max.x])
              for (const y of [bounds.min.y, bounds.max.y])
                for (const z of [bounds.min.z, bounds.max.z])
                  points.push(new THREE.Vector3(x, y, z));
          });
          const base = this.camera.clone();
          base.position.copy(this.cameraGoal);
          const guarded = constrainReadingFocus(
            base,
            this.lookGoal,
            response,
            points,
          );
          response = guarded;
          this.readingFocusScale = guarded.scale;
        }
        this.readingFocus.start(performance.now() / 1000, response);
      }
    }
    this.onTouch();
  }
  private canFocusActor() {
    if (
      this.mode !== "spread" ||
      this.reduced ||
      this.transitionWaiting ||
      !this.pageRoot.visible ||
      this.foldingOut ||
      this.closing ||
      (this.reviewFoldProgress ?? 0) > 0
    )
      return false;
    const age =
      this.reviewTime !== undefined
        ? (this.reviewAge ?? 5)
        : (performance.now() - this.turnStarted) / 1000;
    return bookPose(age, this.opening, false).popups === 1;
  }
  private clearReadingFocus() {
    this.camera.position.sub(this.readingCameraOffset);
    this.look.sub(this.readingLookOffset);
    this.readingCameraOffset.set(0, 0, 0);
    this.readingLookOffset.set(0, 0, 0);
    this.readingFocus.clear();
    this.readingFocusIndex = -1;
    this.readingFocusAmount = 0;
    this.reviewFocusAge = undefined;
  }
  private hitActor(event: PointerEvent): number {
    if (!this.pageRoot.visible || this.transitionWaiting) return -1;
    const b = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - b.left) / b.width) * 2 - 1,
      (-(event.clientY - b.top) / b.height) * 2 + 1,
    );
    this.ray.setFromCamera(this.pointer, this.camera);
    for (const hit of this.ray.intersectObjects(
      this.actors.map((a) => a.root),
      true,
    )) {
      if (!visiblePaintHit(hit)) continue;
      const index = this.actors.findIndex((a) =>
        a.root.children.includes(hit.object),
      );
      if (index >= 0) return index;
    }
    return -1;
  }
  private rightLeaf = new THREE.Group();
  private pageRoot = new THREE.Group();
  private popups: THREE.Group[] = [];
  private actors: PaperActor[] = [];
  private actorMoods: PaperActorMood[] = [];
  private stageMotions: {
    target: THREE.Object3D;
    motion: LegacyStageMotion;
    baseY: number;
    baseRotationZ: number;
  }[] = [];
  private actorMood: PaperActorMood = "welcome";
  private speaking = false;
  private pickables: Pickable[] = [];
  private ray = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private look = new THREE.Vector3(0, 2, -1.5);
  private cameraGoal = new THREE.Vector3();
  private lookGoal = new THREE.Vector3();
  private drift = new THREE.Vector2();
  private roomOrbit = new RoomOrbitGesture();
  private mode: "room" | "spread" = "room";
  private shelfHint = new ShelfHint();
  private currentTexture?: THREE.Texture;
  private pageMaps: THREE.Texture[] = [];
  private roomTextures = new Set<THREE.Texture>();
  private roomWallpaper: "loading" | "loaded" | "fallback" = "loading";
  private loadGeneration = 0;
  private spreadAbort?: AbortController;
  private disposed = false;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private resizeObserver: ResizeObserver;
  private raf = 0;
  private lastFrame = 0;
  private slowFrames = 0;
  private renderedFrames = 0;
  private lastRenderedAt = 0;
  private renderFrameIntervalMs = 0;
  private renderCpuMs = 0;
  private lowQuality = false;
  private turnStarted = 0;
  private pageMotionRate = 1;
  private foldOutDuration = 250;
  private opening = false;
  private focusedRoom: Selection | null = null;
  private hoveredRoom: Selection | null = null;
  private roomNames = new Map<Selection, string>();
  private reviewRoomSelection?: Selection;
  private reviewRoomAge?: number;
  private t0 = performance.now();
  private readTime = 0;
  private authoredStage?: AuthoredStage;
  private authoredPosition = 0;
  private authoredPlaying = false;
  private shelfButtons: HTMLButtonElement[] = [];
  private tableShelfKey?: string;
  private landedShelfBook = false;
  private shelfBrowsingTable = false;
  private shelfCoverMotion?: {
    kind: "close" | "open";
    started: number;
    from: number;
  };
  private shelfToys = new Map<
    string,
    { definition: RoomToy; root: THREE.Group; texture: THREE.Texture }
  >();
  private shelfToyButtons: HTMLButtonElement[] = [];
  private toyGeneration = 0;
  private toyResponseTokens = new Map<string, number>();
  private heldAuthoredPointer?: number;
  private heldAuthoredId?: string;
  private hitAuthored(event: PointerEvent) {
    if (this.mode !== "spread" || !this.authoredStage || !this.pageRoot.visible)
      return;
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    this.ray.setFromCamera(this.pointer, this.camera);
    return this.authoredStage.hit(this.ray);
  }
  private onDown = (event: PointerEvent) => {
    if (this.mode === "spread" && event.button === 0) {
      const id = this.hitAuthored(event);
      if (id && this.authoredStage?.hold(id, true)) {
        this.heldAuthoredPointer = event.pointerId;
        this.heldAuthoredId = id;
        this.renderer.domElement.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (this.mode !== "room" || event.button !== 0) return;
    this.roomOrbit.down(
      event.pointerId,
      event.clientX,
      event.clientY,
      event.isPrimary,
    );
  };
  private onCancel = (event: PointerEvent) => {
    if (event.pointerId === this.heldAuthoredPointer)
      this.releaseAuthoredHolds();
    this.roomOrbit.cancel(event.pointerId);
    this.hoveredRoom = null;
    this.renderer.domElement.style.cursor = "";
  };
  private onMove = (e: PointerEvent) => {
    // Keep canceled ids for late-release safety, but let an unpressed mouse hover again.
    if (this.roomOrbit.has(e.pointerId) && e.buttons !== 0) {
      const intent = this.roomOrbit.move(
        e.pointerId,
        e.clientX,
        e.clientY,
        this.renderer.domElement.clientWidth,
      );
      if (intent === "drag" && this.mode === "room") {
        if (!this.renderer.domElement.hasPointerCapture(e.pointerId))
          this.renderer.domElement.setPointerCapture(e.pointerId);
        this.hoveredRoom = null;
        this.drift.set(0, 0);
        this.renderer.domElement.style.cursor = "grabbing";
        return;
      }
      if (intent === "scroll" || intent === "none") return;
    }
    if (this.mode === "spread") {
      this.hoveredActor = this.hitActor(e);
      this.hoveredCreature = this.hoveredActor < 0 ? this.hitCreature(e) : -1;
      this.renderer.domElement.style.cursor =
        this.hoveredActor >= 0 ||
        this.hoveredCreature >= 0 ||
        Boolean(this.hitAuthored(e))
          ? "pointer"
          : "";
    }
    if (this.mode === "room") {
      this.hoveredRoom = this.hitRoom(e);
      this.renderer.domElement.style.cursor = this.hoveredRoom ? "pointer" : "";
    }
    const r = this.container.getBoundingClientRect();
    this.drift.set(
      (e.clientX - r.left) / r.width - 0.5,
      (e.clientY - r.top) / r.height - 0.5,
    );
  };
  private onPointer = (event: PointerEvent) => {
    const heldId =
      event.pointerId === this.heldAuthoredPointer
        ? this.heldAuthoredId
        : undefined;
    if (heldId) this.releaseAuthoredHolds();
    const tracked = this.roomOrbit.has(event.pointerId);
    const tap = tracked ? this.roomOrbit.up(event.pointerId) : false;
    if (this.renderer.domElement.hasPointerCapture(event.pointerId))
      this.renderer.domElement.releasePointerCapture(event.pointerId);
    if (tracked && (this.mode !== "room" || !tap)) {
      this.renderer.domElement.style.cursor = "";
      return;
    }
    if (this.mode === "room" && !tap) return;
    const b = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - b.left) / b.width) * 2 - 1,
      (-(event.clientY - b.top) / b.height) * 2 + 1,
    );
    this.ray.setFromCamera(this.pointer, this.camera);
    if (this.mode === "spread") {
      const authoredId = heldId ?? this.hitAuthored(event);
      if (authoredId) {
        const result = this.activateAuthored(authoredId);
        if (result) this.onAuthoredInteraction(result);
        return;
      }
      const index = this.hitActor(event);
      if (index >= 0) this.activateActor(index);
      else {
        const creature = this.hitCreature(event);
        if (creature >= 0) this.activateCreature(creature);
      }
      return;
    }
    const selection = this.hitRoom(event);
    if (selection) this.selectRoom(selection);
  };
  private selectRoom(selection: Selection) {
    if (selection.startsWith("toy:")) {
      const id = selection.slice(4);
      void this.animateShelfToy(id);
      this.onSelect(selection);
      return;
    }
    this.onSelect(selection);
  }
  private hitRoom(event: PointerEvent): Selection | null {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    );
    this.ray.setFromCamera(this.pointer, this.camera);
    const targets: THREE.Object3D[] = [...this.pickables];
    if (
      this.shelfBrowsingTable &&
      this.bookRoot.visible &&
      !this.shelfCoverMotion
    )
      targets.push(this.bookRoot);
    for (const hit of this.ray.intersectObjects(targets, true)) {
      if (!visiblePaintHit(hit)) continue;
      let object: THREE.Object3D | null = hit.object;
      while (object && !object.userData.pick && object !== this.bookRoot)
        object = object.parent;
      if (object === this.bookRoot) return "table-book";
      if (object) return object.userData.pick as Selection;
    }
    return null;
  }
  focusSelection(selection: Selection | null) {
    this.focusedRoom = selection;
  }
  reviewRoom(selection?: Selection, age?: number) {
    this.reviewRoomSelection = selection;
    this.reviewRoomAge = age;
  }
  constructor(
    private container: HTMLElement,
    private onSelect: (id: Selection) => void,
    private onTouch: () => void = () => {},
    private onAuthoredInteraction: (
      result: AuthoredInteractionResult,
    ) => void = () => {},
  ) {
    this.lowQuality = constrainedPhone();
    document.documentElement.classList.toggle("low-graphics", this.lowQuality);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = !this.lowQuality;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.append(this.renderer.domElement);
    this.actorLabel.className = "paper-name";
    this.actorLabel.hidden = true;
    this.container.append(this.actorLabel);
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.renderer.domElement.style.cssText =
      "width:100%;height:100%;display:block";
    this.renderer.domElement.addEventListener("pointerdown", this.onDown);
    this.renderer.domElement.addEventListener("pointercancel", this.onCancel);
    this.renderer.domElement.addEventListener(
      "lostpointercapture",
      this.onCancel,
    );
    this.renderer.domElement.addEventListener("pointerup", this.onPointer);
    this.renderer.domElement.addEventListener("pointermove", this.onMove);
    this.renderer.domElement.addEventListener("pointerleave", this.onLeave);
    this.scene.background = new THREE.Color(0x273b3a);
    this.scene.add(this.shelfHint.root);
    this.scene.fog = new THREE.Fog(0x334240, 18, 38);
    this.scene.add(new THREE.HemisphereLight(0xe3edf2, 0x6f4930, 1.65));
    const sun = new THREE.DirectionalLight(0xffdfad, 2.5);
    sun.position.set(-4, 7, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -8,
      right: 8,
      top: 8,
      bottom: -8,
      near: 0.5,
      far: 25,
    });
    sun.shadow.normalBias = 0.035;
    sun.shadow.bias = -0.0002;
    sun.shadow.radius = 3;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9dc4ec, 0.85);
    fill.position.set(-6, 4, -2);
    this.scene.add(fill);
    this.scene.add(this.roomRoot, this.bookRoot);
    this.makeRoom();
    this.batchStaticRoom();
    this.roomRoot.add(this.roomShelf.root);
    this.makeBook();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.camera.position.copy(this.cameraGoal);
    this.look.copy(this.lookGoal);
    this.animate();
  }
  private resize() {
    const w = Math.max(this.container.clientWidth, 1),
      h = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = w / h;
    // Keep the illustrated book at its original pixel scale when the reading
    // canvas extends behind the controls. The taller frustum reveals the same
    // room below the book instead of stretching or replacing it with a bitmap.
    const readingViewportHeight = Math.min(h, Math.min(h * 0.52, w * 0.92));
    this.camera.fov =
      this.mode === "room"
        ? 42
        : THREE.MathUtils.radToDeg(
            2 *
              Math.atan(
                Math.tan(THREE.MathUtils.degToRad(42 / 2)) *
                  (h / readingViewportHeight),
              ),
          );
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    if (this.mode === "room") {
      const narrow = this.camera.aspect < 0.8;
      const scale = Math.max(1, 0.68 / this.camera.aspect);
      this.cameraGoal.set(
        (narrow ? 1.7 : 5.5) * scale,
        (narrow ? 4.25 : 4.9) * scale,
        (narrow ? 9.4 : 12.4) * scale,
      );
      this.lookGoal.set(0, narrow ? 3.05 : 3.15, -1.7);
    } else {
      // Fill portrait reading views with the pop-up scene while the canvas
      // keeps its unscaled DOM bounds for actor hit targets and labels.
      const effectiveAspect = w / readingViewportHeight;
      const framingSpan = THREE.MathUtils.lerp(
        0.95,
        1.25,
        THREE.MathUtils.smoothstep(effectiveAspect, 0.95, 1.25),
      );
      const scale = Math.max(1, framingSpan / effectiveAspect);
      // Bring the illustrated stage forward, allowing peripheral book edges to crop.
      // Extremely narrow views still retain clearance for wide actor groups.
      this.lookGoal.set(0, 0.1, 0.4);
      this.cameraGoal.set(1.1 * scale, 2.45 + 3.4 * scale, 0.4 + 6.05 * scale);
      // Move the book clear of the desktop text column without jumping at a
      // tablet/landscape breakpoint, including when reduced motion is active.
      const desktopShift =
        2 * THREE.MathUtils.smoothstep(effectiveAspect, 1.6, 2.2);
      this.cameraGoal.x += desktopShift;
      this.lookGoal.x += desktopShift;
    }
  }
  private batchStaticRoom() {
    // Room trim, floor seams, quilt patches and decorative pieces never move.
    // Combining equal materials cuts driver submissions without changing art,
    // the interactive shelf, or any book/actor hit target.
    const groups = new Map<string, THREE.Mesh[]>();
    this.roomRoot.updateMatrixWorld(true);
    this.roomRoot.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || Array.isArray(object.material))
        return;
      const geometry = object.geometry as THREE.BufferGeometry;
      const signature = Object.entries(geometry.attributes)
        .map(
          ([name, attribute]) =>
            `${name}:${attribute.itemSize}:${attribute.normalized}`,
        )
        .sort()
        .join(",");
      const key = [
        object.material.uuid,
        object.castShadow,
        object.receiveShadow,
        geometry.index ? "indexed" : "flat",
        signature,
      ].join("|");
      const group = groups.get(key) ?? [];
      group.push(object);
      groups.set(key, group);
    });
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      const transformed = group.map((mesh) =>
        (mesh.geometry as THREE.BufferGeometry)
          .clone()
          .applyMatrix4(mesh.matrixWorld),
      );
      const geometry = mergeGeometries(transformed);
      transformed.forEach((item) => item.dispose());
      if (!geometry) continue;
      const merged = new THREE.Mesh(geometry, group[0].material);
      merged.castShadow = group[0].castShadow;
      merged.receiveShadow = group[0].receiveShadow;
      this.roomRoot.add(merged);
      for (const mesh of group) {
        mesh.parent?.remove(mesh);
        mesh.geometry.dispose();
      }
    }
  }
  private makeRoom() {
    const timber = new THREE.MeshStandardMaterial({
      map: grainTexture("#93613b", "wood"),
      roughness: 0.7,
    });
    const honey = new THREE.MeshStandardMaterial({
      map: grainTexture("#bc8651", "wood"),
      roughness: 0.67,
    });
    wood.map = timber.map;
    wood.color.set(0xa78160);
    wood.needsUpdate = true;
    paleWood.map = honey.map;
    paleWood.color.set(0xd7bd8f);
    paleWood.needsUpdate = true;
    const wall = new THREE.MeshStandardMaterial({
      map: grainTexture("#c9b394", "cloth"),
      roughness: 1,
    });
    this.roomTextures.add(wall.map!);
    wall.map!.wrapS = wall.map!.wrapT = THREE.RepeatWrapping;
    new THREE.TextureLoader()
      .loadAsync("./assets/art/room/botanical-wallpaper.webp")
      .then((texture) => {
        if (this.disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = Math.min(
          4,
          this.renderer.capabilities.getMaxAnisotropy(),
        );
        const fallback = wall.map;
        wall.map = texture;
        this.roomWallpaper = "loaded";
        wall.needsUpdate = true;
        this.roomTextures.add(texture);
        if (fallback) {
          this.roomTextures.delete(fallback);
          fallback.dispose();
        }
      })
      .catch(() => {
        this.roomWallpaper = "fallback";
        /* Existing woven wall remains usable if the optional image fails. */
      });
    const teal = new THREE.MeshStandardMaterial({
      color: 0x3a6260,
      roughness: 0.85,
    });
    box(this.roomRoot, 14, 0.18, 13, timber, 0, -0.1, 0);
    // Side walls and wainscot establish a room, with continuous trim around the corner.
    wallPaperUv(box(this.roomRoot, 14, 7, 0.2, wall, 0, 3.4, -4.5), "back");
    wallPaperUv(box(this.roomRoot, 0.2, 7, 13, wall, -6.9, 3.4, 1.9), "left");
    box(this.roomRoot, 14, 1.7, 0.12, teal, 0, 0.85, -4.32);
    box(this.roomRoot, 0.12, 1.7, 13, teal, -6.75, 0.85, 1.9);
    for (const y of [0.15, 1.65]) {
      box(this.roomRoot, 14, 0.09, 0.15, honey, 0, y, -4.22);
      box(this.roomRoot, 0.15, 0.09, 13, honey, -6.67, y, 1.9);
    }
    for (let x = -6.5; x < 7; x += 0.65)
      box(this.roomRoot, 0.035, 1.4, 0.05, teal, x, 0.85, -4.2);
    const floorSeam = new THREE.MeshStandardMaterial({ color: 0x654631 });
    for (let x = -6.5; x < 7; x += 0.8)
      box(this.roomRoot, 0.018, 0.006, 13, floorSeam, x, 0.004, 0);
    // A substantial recessed cabinet, rounded timber rails, panelled lower doors.
    box(this.roomRoot, 5.9, 3.45, 0.16, teal, 0, 2.87, -3.61);
    for (const y of [1.2, 2.92, 4.55])
      box(this.roomRoot, 6.1, 0.14, 1.28, honey, 0, y, -3.05);
    for (const x of [-2.96, 2.96])
      box(this.roomRoot, 0.2, 4.5, 1.3, timber, x, 2.25, -3.05);
    box(this.roomRoot, 6.3, 0.18, 1.45, honey, 0, 4.69, -3.05);
    box(this.roomRoot, 5.9, 1.05, 1.15, timber, 0, 0.55, -3.08);
    for (const x of [-1.47, 1.47]) {
      box(this.roomRoot, 2.78, 0.86, 0.08, teal, x, 0.6, -2.46);
      disc(this.roomRoot, 0.055, brass, x + 0.6, 0.62, -2.35).rotation.x =
        Math.PI / 2;
    }
    // Window with deep casing, blue glass, sill and soft pleated linen.
    box(this.roomRoot, 2.2, 2.7, 0.15, timber, -4.65, 3.7, -4.19);
    const windowView = windowViewTexture();
    this.roomTextures.add(windowView);
    box(
      this.roomRoot,
      1.97,
      2.46,
      0.04,
      new THREE.MeshBasicMaterial({ map: windowView }),
      -4.65,
      3.7,
      -4.08,
    );
    for (const x of [-5.64, -4.65, -3.66])
      box(this.roomRoot, 0.07, 2.54, 0.14, ivory, x, 3.7, -3.98);
    for (const y of [2.44, 3.7, 4.96])
      box(this.roomRoot, 2.08, 0.07, 0.14, ivory, -4.65, y, -3.98);
    box(this.roomRoot, 2.5, 0.1, 0.55, honey, -4.65, 2.39, -3.89);
    const linen = new THREE.MeshStandardMaterial({
      map: grainTexture("#dfcba8", "cloth"),
      roughness: 1,
    });
    linen.side = THREE.DoubleSide;
    for (const x of [-5.85, -3.42]) {
      const curtain = new THREE.Mesh(curtainGeometry(), linen);
      curtain.position.set(x + 0.135, 3.66, -3.78);
      curtain.castShadow = curtain.receiveShadow = true;
      this.roomRoot.add(curtain);
    }
    // Bed frame, quilt squares, headboard and pillow make scale unmistakable.
    box(this.roomRoot, 2.25, 0.3, 3.4, timber, -4.7, 0.49, -0.3);
    box(this.roomRoot, 2.3, 1.2, 0.16, timber, -4.7, 1, -1.93);
    box(this.roomRoot, 2.05, 0.26, 3.2, ivory, -4.7, 0.75, -0.3);
    const quiltColors = [0x5c7979, 0x8c5860, 0xc5a473, 0x627760];
    const quiltWeave = quiltWeaveTexture();
    this.roomTextures.add(quiltWeave);
    const quiltMaterials = quiltColors.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          map: quiltWeave,
          roughness: 1,
        }),
    );
    for (let x = 0; x < 5; x++)
      for (let z = 0; z < 5; z++) {
        const patch = box(
          this.roomRoot,
          0.405,
          0.07,
          0.46,
          quiltMaterials[(x + z * 3) % 4],
          -5.51 + x * 0.405,
          0.93,
          -0.88 + z * 0.46,
        );
        patch.geometry.dispose();
        patch.geometry = quiltPatchGeometry();
      }
    box(this.roomRoot, 1.5, 0.2, 0.62, linen, -4.7, 0.96, -1.36);
    for (const x of [-5.79, -3.61])
      for (const z of [-1.92, 1.32]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.065, 0.09, 1.15, 12),
          timber,
        );
        post.position.set(x, 0.6, z);
        this.roomRoot.add(post);
        const finial = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 12, 8),
          honey,
        );
        finial.position.set(x, 1.2, z);
        this.roomRoot.add(finial);
      }
    // Central writing table remains visible during reading.
    box(this.roomRoot, 7.8, 0.23, 4.7, honey, 0.1, 1.18, 1.2);
    box(this.roomRoot, 7.1, 0.28, 4, timber, 0.1, 0.97, 1.2);
    for (const x of [-3.1, 3.3])
      for (const z of [-0.55, 2.9]) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.09, 0.94, 16),
          timber,
        );
        leg.position.set(x, 0.47, z);
        leg.castShadow = true;
        this.roomRoot.add(leg);
      }
    const rug = new THREE.MeshStandardMaterial({
      map: grainTexture("#744c44", "cloth"),
      roughness: 1,
    });
    box(this.roomRoot, 8, 0.02, 6, rug, 0, 0.025, 1);
    // Keep the room lamp behind the book rather than overlapping story subjects.
    // One grounded group keeps the shade, fittings and actual light together.
    const lampRoot = new THREE.Group();
    lampRoot.position.set(3.25, 1.295, -0.65);
    lampRoot.scale.setScalar(0.78);
    this.roomRoot.add(lampRoot);
    disc(lampRoot, 0.35, timber, 0, 0.045, 0);
    disc(lampRoot, 0.27, brass, 0, 0.105, 0);
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.055, 1.32, 16),
      brass,
    );
    stem.position.set(0, 0.755, 0);
    lampRoot.add(stem);
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.57, 0.65, 32, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xf0d2a2,
        side: THREE.DoubleSide,
        emissive: 0xffb65c,
        emissiveIntensity: 0.28,
        roughness: 0.9,
      }),
    );
    shade.position.set(0, 1.575, 0);
    lampRoot.add(shade);
    for (const y of [2.54, 3.2]) {
      const r = y < 3 ? 0.57 : 0.23;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.023, 6, 32),
        brass,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, y - 1.295, 0);
      lampRoot.add(ring);
    }
    const lampLight = new THREE.PointLight(0xffbd72, 18, 9, 2);
    lampLight.position.set(0, 1.55, 0);
    lampRoot.add(lampLight);
    // A framed botanical study and star mobile supply small, purposeful room detail.
    box(this.roomRoot, 1.2, 1.55, 0.13, honey, 4.36, 3.85, -4.2);
    box(this.roomRoot, 1.04, 1.38, 0.04, paper, 4.36, 3.85, -4.11);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x66794d });
    box(this.roomRoot, 0.025, 0.9, 0.02, stemMat, 4.36, 3.83, -4.07);
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 6),
        stemMat,
      );
      leaf.scale.set(1.6, 0.5, 0.15);
      leaf.position.set(4.36 + (i % 2 ? -0.12 : 0.12), 3.5 + i * 0.12, -4.05);
      leaf.rotation.z = i % 2 ? -0.5 : 0.5;
      this.roomRoot.add(leaf);
    }
  }
  private makeBook() {
    this.resetBookToTable();
    const appearance = resolveBookAppearance();
    const clothGrain = grainTexture("#ffffff", "cloth");
    this.roomTextures.add(clothGrain);
    const cloth = new THREE.MeshStandardMaterial({
      map: clothGrain,
      color: appearance.coverColor,
      roughness: 0.83,
    });
    const spineCloth = new THREE.MeshStandardMaterial({
      map: clothGrain,
      color: appearance.spineColor,
      roughness: 0.83,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: appearance.accentColor,
      metalness: 0.2,
      roughness: 0.62,
    });
    this.tableCoverMaterial = cloth;
    this.tableSpineMaterial = spineCloth;
    this.tableAccentMaterial = accent;
    paper.map = grainTexture("#f3e1b9", "paper");
    paper.needsUpdate = true;
    for (const [leaf, side] of [
      [this.leftLeaf, -1],
      [this.rightLeaf, 1],
    ] as const) {
      box(leaf, 3.13, 3.6, 0.09, cloth, side * 1.56, 0, -0.15);
      for (let layer = 0; layer < 5; layer++)
        box(
          leaf,
          2.98,
          3.43,
          0.022,
          paper,
          side * 1.53,
          0,
          -0.1 + layer * 0.024,
        );
      box(leaf, 2.98, 3.43, 0.018, paper, side * 1.53, 0, 0.03);
      for (const y of [-1.55, 1.55])
        box(leaf, 2.7, 0.014, 0.009, accent, side * 1.53, y, 0.048);
      this.bookRoot.add(leaf);
    }
    box(this.bookRoot, 0.13, 3.64, 0.16, spineCloth, 0, 0, -0.12);
    this.turningLeaf = createTurningLeaf(3.02, 3.43, paper);
    this.turningPage.position.z = 0.11;
    this.turningPage.add(this.turningLeaf.mesh);
    this.bookRoot.add(this.turningPage);
    this.turningPage.visible = false;
    this.waitingPaper = new THREE.Mesh(
      new THREE.PlaneGeometry(6.04, 3.43),
      paper.clone(),
    );
    this.stationarySource = new THREE.Mesh(
      new THREE.PlaneGeometry(3.02, 3.43),
      paper.clone(),
    );
    this.destinationPaper = new THREE.Mesh(
      new THREE.PlaneGeometry(3.02, 3.43),
      paper.clone(),
    );
    for (const plate of [
      this.waitingPaper,
      this.stationarySource,
      this.destinationPaper,
    ]) {
      plate.position.z = 0.1;
      plate.visible = false;
      this.bookRoot.add(plate);
    }
    this.coverArt = new THREE.Mesh(
      new THREE.PlaneGeometry(2.88, 3.3),
      new THREE.MeshBasicMaterial({
        map: labelTexture("Little Light", "#244c48", "#fff1c9"),
      }),
    );
    this.coverArt.rotation.y = Math.PI;
    this.coverArt.position.set(-1.56, 0, -0.2);
    this.leftLeaf.add(this.coverArt);
    this.bookRoot.add(this.pageRoot);
  }
  private resetBookToTable() {
    this.bookRoot.position.set(0, 1.495, 1.1);
    this.bookRoot.rotation.set(-Math.PI / 2, 0, 0);
    this.bookRoot.scale.set(1, 1, 1);
  }
  private setTableBookAppearance(appearance?: Partial<BookAppearance>) {
    const resolved = resolveBookAppearance(appearance);
    this.tableCoverMaterial?.color.set(resolved.coverColor);
    this.tableSpineMaterial?.color.set(resolved.spineColor);
    this.tableAccentMaterial?.color.set(resolved.accentColor);
  }
  private showSharedCover(texture: THREE.Texture) {
    if (this.closedMap && this.closedMap !== texture) this.closedMap.dispose();
    this.closedMap = undefined;
    if (!this.coverArt) return;
    this.coverArt.material.map = texture;
    this.coverArt.material.needsUpdate = true;
  }
  private showOwnedCover(texture: THREE.Texture) {
    this.closedMap?.dispose();
    this.closedMap = texture;
    if (!this.coverArt) return;
    this.coverArt.material.map = texture;
    this.coverArt.material.needsUpdate = true;
  }
  async room(locale: LocaleData, books: RoomShelfBook[]) {
    this.spreadAbort?.abort();
    this.clearCreatureTargets();
    this.clearReadingFocus();
    this.readingWideEnsemble = false;
    this.roomOrbit.reset();
    this.drift.set(0, 0);
    this.focusedRoom = this.hoveredRoom = null;
    this.reviewRoom();
    this.roomNames = new Map<Selection, string>();
    this.retainedStage.clear();
    this.clearSpreadPrints();
    this.transitionWaiting = false;
    this.loadedPage = undefined;
    this.actorLabel.hidden = true;
    this.actorButtons.forEach((b) => b.remove());
    this.actorButtons = [];
    this.hoveredActor = this.touchedActor = -1;
    const generation = ++this.loadGeneration;
    this.mode = "room";
    this.roomRoot.visible = true;
    this.bookRoot.visible = false;
    this.tableShelfKey = undefined;
    this.landedShelfBook = false;
    this.shelfBrowsingTable = false;
    this.shelfCoverMotion = undefined;
    this.roomShelf.setTableKey();
    this.resetBookToTable();
    this.leftLeaf.rotation.y = Math.PI;
    this.pageRoot.visible = false;

    this.resize();
    await this.setShelfBooks(books);
    if (generation !== this.loadGeneration || this.disposed) return;
  }
  private clearShelfButtons() {
    this.shelfButtons.forEach((button) => button.remove());
    this.shelfButtons = [];
  }
  private rebuildShelfButtons() {
    this.clearShelfButtons();
    for (const book of this.roomShelf.books()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shelf-book-target";
      button.setAttribute("aria-label", `Preview ${book.title}`);
      button.dataset.shelfKey = book.key;
      button.onclick = () => this.onSelect(`shelf:${book.key}`);
      button.onfocus = () => this.focusSelection(`shelf:${book.key}`);
      button.onblur = () => this.focusSelection(null);
      this.container.append(button);
      this.shelfButtons.push(button);
    }
  }
  async setShelfBooks(books: RoomShelfBook[]) {
    await this.roomShelf.setBooks(books);
    if (this.disposed) return;
    this.roomShelf.setTableKey(this.tableShelfKey);
    if (this.tableShelfKey) {
      const cover = this.roomShelf.coverTexture(this.tableShelfKey);
      const definition = this.roomShelf.entry(this.tableShelfKey)?.definition;
      if (cover) this.showSharedCover(cover);
      if (definition) this.setTableBookAppearance(definition.appearance);
    }
    this.pickables = this.pickables.filter(
      (object) => !String(object.userData.pick || "").startsWith("shelf:"),
    );
    this.pickables.push(...(this.roomShelf.pickables() as Pickable[]));
    for (const book of this.roomShelf.books())
      this.roomNames.set(`shelf:${book.key}`, book.title);
    this.rebuildShelfButtons();
  }
  private clearToyButtons() {
    this.shelfToyButtons.forEach((button) => button.remove());
    this.shelfToyButtons = [];
  }
  private disposeToy(toy: { root: THREE.Group; texture: THREE.Texture }) {
    toy.root.removeFromParent();
    toy.root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        material.dispose();
    });
    toy.texture.dispose();
  }
  private async tweenToy(root: THREE.Group, entering: boolean) {
    const baseY = Number(root.userData.baseY);
    const startY = entering ? baseY - 0.18 : root.position.y;
    const endY = entering ? baseY : baseY - 0.2;
    const startScale = entering ? 0.72 : 1;
    const endScale = entering ? 1 : 0.72;
    const started = performance.now();
    const duration = this.reduced ? 0 : 260;
    do {
      const amount = duration
        ? ease((performance.now() - started) / duration)
        : 1;
      root.position.y = THREE.MathUtils.lerp(startY, endY, amount);
      root.scale.setScalar(THREE.MathUtils.lerp(startScale, endScale, amount));
      if (amount >= 1) break;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    } while (!this.disposed);
  }
  async setShelfToys(toys: RoomToy[]) {
    const definitions = toys.slice(0, 4);
    const generation = ++this.toyGeneration;
    this.toyResponseTokens.clear();
    const loader = new THREE.TextureLoader();
    const textures = await Promise.all(
      definitions.map((toy) =>
        loader
          .loadAsync(
            mobileImageUrl(
              /^(?:data:|blob:|https?:)/.test(toy.asset)
                ? toy.asset
                : toy.asset.startsWith("/")
                  ? `.${toy.asset}`
                  : toy.asset.startsWith("./")
                    ? toy.asset
                    : `./${toy.asset}`,
            ),
          )
          .catch(() => undefined),
      ),
    );
    if (generation !== this.toyGeneration || this.disposed) {
      textures.forEach((texture) => texture?.dispose());
      return;
    }
    await Promise.all(
      [...this.shelfToys.values()].map((toy) => this.tweenToy(toy.root, false)),
    );
    if (generation !== this.toyGeneration || this.disposed) {
      textures.forEach((texture) => texture?.dispose());
      return;
    }
    this.pickables = this.pickables.filter(
      (object) => !String(object.userData.pick || "").startsWith("toy:"),
    );
    this.shelfToys.forEach((toy) => this.disposeToy(toy));
    this.shelfToys.clear();
    this.clearToyButtons();
    const toySlots = roomToyLayout(definitions.length);
    for (let index = 0; index < definitions.length; index++) {
      const texture = textures[index];
      if (!texture) continue;
      const definition = definitions[index];
      texture.colorSpace = THREE.SRGBColorSpace;
      const columns = Math.max(1, Math.floor(definition.pose?.columns ?? 1));
      const pose = THREE.MathUtils.clamp(
        Math.floor(definition.pose?.index ?? 0),
        0,
        columns - 1,
      );
      texture.repeat.set(1 / columns, 1);
      texture.offset.set(pose / columns, 0);
      const cellAspect =
        texture.image && texture.image.height
          ? texture.image.width / columns / texture.image.height
          : 0.68 / 0.94;
      const artWidth = Math.min(0.68, 0.94 * cellAspect);
      const artHeight = Math.min(0.94, 0.68 / cellAspect);
      const root = new THREE.Group();
      root.name = `shelf-toy:${definition.id}`;
      root.userData.pick = `toy:${definition.id}`;
      root.position.set(
        toySlots[index].x,
        toySlots[index].y - 0.18,
        toySlots[index].z,
      );
      root.userData.baseX = root.position.x;
      root.userData.baseY = toySlots[index].y;
      root.userData.baseZ = toySlots[index].z;
      root.scale.setScalar(0.72);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.29, 0.08, 16),
        new THREE.MeshStandardMaterial({
          color: 0xb58a4e,
          metalness: 0.25,
          roughness: 0.55,
        }),
      );
      base.position.y = 0.04;
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(artWidth, artHeight),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        }),
      );
      art.position.set(0, 0.08 + artHeight / 2, 0.04);
      root.add(base, art);
      this.roomRoot.add(root);
      const toy = { definition, root, texture };
      this.shelfToys.set(definition.id, toy);
      this.pickables.push(root as Pickable);
      this.roomNames.set(`toy:${definition.id}`, definition.label);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shelf-book-target shelf-toy-target";
      button.dataset.toyId = definition.id;
      button.setAttribute("aria-label", `Play ${definition.label}`);
      button.onclick = () => this.selectRoom(`toy:${definition.id}`);
      button.onfocus = () => this.focusSelection(`toy:${definition.id}`);
      button.onblur = () => this.focusSelection(null);
      this.container.append(button);
      this.shelfToyButtons.push(button);
    }
    await Promise.all(
      [...this.shelfToys.values()].map((toy) => this.tweenToy(toy.root, true)),
    );
  }
  animateShelfToy(id: string) {
    const toy = this.shelfToys.get(id);
    if (!toy) return Promise.resolve();
    const generation = this.toyGeneration;
    const token = (this.toyResponseTokens.get(id) ?? 0) + 1;
    this.toyResponseTokens.set(id, token);
    const root = toy.root;
    const baseX = Number(root.userData.baseX);
    const baseY = Number(root.userData.baseY);
    const baseZ = Number(root.userData.baseZ);
    const current = () =>
      !this.disposed &&
      generation === this.toyGeneration &&
      this.toyResponseTokens.get(id) === token &&
      this.shelfToys.get(id) === toy;
    return (async () => {
      if (this.reduced) {
        const colors: Array<
          [THREE.Material & { color: THREE.Color }, THREE.Color]
        > = [];
        root.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material]) {
            if (
              !("color" in material) ||
              !(material.color instanceof THREE.Color)
            )
              continue;
            const colored = material as THREE.Material & { color: THREE.Color };
            const rest = (material.userData.toyRestColor ??=
              colored.color.clone()) as THREE.Color;
            colored.color.copy(rest);
            colors.push([colored, rest]);
            colored.color.lerp(new THREE.Color(0xffd98a), 0.3);
          }
        });
        await new Promise<void>((resolve) => setTimeout(resolve, 120));
        if (current())
          colors.forEach(([material, color]) => material.color.copy(color));
        return;
      }
      const started = performance.now();
      const duration = 1400;
      do {
        const progress = Math.min(1, (performance.now() - started) / duration);
        const wave = Math.sin(progress * Math.PI * 2) * (1 - progress);
        if (toy.definition.animation === "rock") root.rotation.z = wave * 0.22;
        if (toy.definition.animation === "float")
          root.position.y = baseY + Math.abs(wave) * 0.22;
        if (toy.definition.animation === "sway")
          root.position.x = baseX + wave * 0.18;
        if (toy.definition.animation === "pulse")
          root.scale.setScalar(1 + Math.abs(wave) * 0.13);
        if (toy.definition.animation === "spin")
          root.rotation.y = progress * Math.PI * 2;
        if (progress >= 1) break;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
      } while (current());
      if (!current()) return;
      root.rotation.set(0, 0, 0);
      root.position.set(baseX, baseY, baseZ);
      root.scale.setScalar(1);
    })();
  }
  browseShelf() {
    this.releaseAuthoredHolds();
    if (this.mode === "room" && this.shelfBrowsingTable) return;
    this.clearReadingFocus();
    this.shelfBrowsingTable = this.bookRoot.visible;
    if (this.shelfBrowsingTable) {
      // Keep the current book on the table, close its cover, and remove the
      // raised paper theatre so both book rows and the top-shelf toys stay visible.
      this.pageRoot.visible = false;
      this.turningPage.visible = false;
      if (this.waitingPaper) this.waitingPaper.visible = false;
      if (this.stationarySource) this.stationarySource.visible = false;
      if (this.destinationPaper) this.destinationPaper.visible = false;
      this.actorButtons.forEach((button) => (button.hidden = true));
      this.creatures.forEach(({ button }) => (button.hidden = true));
      this.shelfCoverMotion = {
        kind: "close",
        started: performance.now(),
        from: this.leftLeaf.rotation.y,
      };
    }
    this.mode = "room";
    this.roomRoot.visible = true;
    this.resize();
  }
  resumeTable() {
    if (!this.bookRoot.visible) return;
    if (this.mode === "spread" && !this.shelfBrowsingTable) return;
    this.shelfBrowsingTable = false;
    this.mode = "spread";
    this.waitingFromRoom = false;
    this.pageRoot.visible = false;
    this.shelfCoverMotion = {
      kind: "open",
      started: performance.now(),
      from: this.leftLeaf.rotation.y,
    };
    this.resize();
  }
  async inspectShelfBook(key: string) {
    this.shelfHint.complete();
    this.browseShelf();
    if (!(await this.roomShelf.inspect(key, this.reduced)))
      throw new Error(`Shelf book ${key} is unavailable`);
  }
  async returnShelfPreview() {
    await this.roomShelf.returnPreview(this.reduced);
  }
  private async animateBookTo(
    position: THREE.Vector3,
    scale: THREE.Vector3,
    rotation: THREE.Euler,
  ) {
    const from = this.bookRoot.position.clone();
    const fromScale = this.bookRoot.scale.clone();
    const fromRotation = this.bookRoot.rotation.clone();
    const started = performance.now();
    const duration = this.reduced ? 0 : 520;
    do {
      const amount = duration
        ? ease((performance.now() - started) / duration)
        : 1;
      this.bookRoot.position.lerpVectors(from, position, amount);
      this.bookRoot.scale.lerpVectors(fromScale, scale, amount);
      this.bookRoot.rotation.set(
        THREE.MathUtils.lerp(fromRotation.x, rotation.x, amount),
        THREE.MathUtils.lerp(fromRotation.y, rotation.y, amount),
        THREE.MathUtils.lerp(fromRotation.z, rotation.z, amount),
      );
      if (amount >= 1) break;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    } while (!this.disposed);
  }
  private async foldTableBook() {
    if (!this.bookRoot.visible) return;
    this.clearReadingFocus();
    this.shelfCoverMotion = undefined;
    if (
      this.shelfBrowsingTable &&
      Math.abs(this.leftLeaf.rotation.y - Math.PI) < 0.01
    ) {
      this.pageRoot.visible = false;
      return;
    }
    const started = performance.now();
    const duration = this.reduced ? 0 : 750;
    if (this.mode === "spread") {
      this.opening = false;
      this.closing = started;
      if (duration)
        await new Promise<void>((resolve) => setTimeout(resolve, duration));
      this.closing = 0;
      this.leftLeaf.rotation.y = Math.PI;
      this.pageRoot.visible = false;
      return;
    }
    const fromAngle = this.leftLeaf.rotation.y;
    do {
      const amount = duration
        ? ease((performance.now() - started) / duration)
        : 1;
      this.leftLeaf.rotation.y = THREE.MathUtils.lerp(
        fromAngle,
        Math.PI,
        amount,
      );
      this.popups.forEach((popup, index) => {
        popupFoldSurface(popup, index, 1 - amount);
        popup.rotation.x = popupFoldAngle(1 - amount);
      });
      if (amount >= 1) break;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    } while (!this.disposed);
    this.pageRoot.visible = false;
  }
  private async returnTableBook() {
    if (!this.bookRoot.visible) return;
    await this.foldTableBook();
    const key = this.tableShelfKey;
    const slot = key ? this.roomShelf.slotPosition(key) : undefined;
    if (key && slot) {
      const targetScale = new THREE.Vector3(
        SHELF_BOOK_SIZE.width / 3.13,
        SHELF_BOOK_SIZE.height / 3.6,
        SHELF_BOOK_SIZE.thickness / 0.4,
      );
      const targetAngle = SHELF_BOOK_YAW;
      const centerOffset = 1.56 * targetScale.x;
      const target = slot.clone();
      target.x -= Math.cos(targetAngle) * centerOffset;
      target.z += Math.sin(targetAngle) * centerOffset;
      await this.animateBookTo(
        target,
        targetScale,
        new THREE.Euler(0, targetAngle, 0),
      );
      this.roomShelf.setTableKey();
    }
    this.tableShelfKey = undefined;
    this.shelfBrowsingTable = false;
    this.bookRoot.visible = false;
  }
  async landShelfBook(key: string) {
    this.shelfCoverMotion = undefined;
    if (this.tableShelfKey && this.tableShelfKey !== key)
      await this.returnTableBook();
    if (this.roomShelf.previewKey !== key)
      await this.roomShelf.inspect(key, this.reduced);
    const definition = await this.roomShelf.landPreview(this.reduced);
    if (!definition) throw new Error(`Shelf book ${key} is unavailable`);
    this.tableShelfKey = key;
    this.setTableBookAppearance(definition.appearance);
    this.roomShelf.setTableKey(key);
    this.bookRoot.visible = true;
    this.resetBookToTable();
    this.leftLeaf.rotation.y = Math.PI;
    this.pageRoot.visible = false;
    const cover = this.roomShelf.coverTexture(key);
    if (cover) this.showSharedCover(cover);
    this.landedShelfBook = true;
  }
  cancelPendingSpread() {
    this.spreadAbort?.abort();
    this.loadGeneration++;
    this.foldingOut = 0;
  }
  private async prepareLegacyStage(
    page: Page,
    locale: LocaleData,
    stillCurrent: () => boolean,
    pageImages: PageImages,
  ): Promise<PreparedLegacyStage> {
    const draft = {
      root: new THREE.Group(),
      popups: [] as THREE.Group[],
      actors: [] as PaperActor[],
      actorMoods: [] as PaperActorMood[],
      motions: [] as PreparedLegacyStage["motions"],
      actorButtons: [] as HTMLButtonElement[],
      actorNames: [] as string[],
      propNames: [] as string[],
      creatures: [] as PreparedLegacyStage["creatures"],
      maps: [] as THREE.Texture[],
      wideEnsemble: false,
      actorMood: "listen" as PaperActorMood,
    };
    const stageImage = (source: string) => {
      const url = mobileImageUrl(stageAssetUrl(source));
      return pageImages.image(url);
    };
    const loadStageTexture = async (source: string) => {
      return pageImages.texture(mobileImageUrl(stageAssetUrl(source)));
    };
    const assertCurrent = () => {
      if (!stillCurrent()) throw Error("legacy-stage-superseded");
    };
    let texture!: THREE.Texture;
    try {
      const popup = (x: number, y: number) => {
        const g = new THREE.Group();
        g.userData.foldStart = Math.PI;
        g.position.set(x, y, 0.075);
        draft.root.add(g);
        draft.popups.push(g);
        return g;
      };
      const addCreature = (
        kind: PaperCreatureKind,
        tex: THREE.Texture,
        width: number,
        label: string,
      ) => {
        const creature = createPaperCreature(kind, tex, width);
        const index = draft.creatures.length;
        const button = document.createElement("button");
        button.className = "creature-target";
        button.type = "button";
        button.hidden = true;
        button.setAttribute("aria-label", label);
        button.dataset.creature = kind;
        button.onfocus = () => {
          this.hoveredCreature = index;
          this.hoveredActor = -1;
        };
        button.onblur = () => {
          if (this.hoveredCreature === index) this.hoveredCreature = -1;
        };
        button.onclick = () => this.activateCreature(index);
        draft.creatures.push({ creature, kind, label, button });
        return creature.mesh;
      };
      const addStageProp = async (
        prop: StageProp,
        options: { name?: string; optional?: boolean } = {},
      ) => {
        const request = loadStageTexture(prop.file);
        const tex = options.optional
          ? await request.catch(() => undefined)
          : await request;
        if (!tex) return undefined;
        if (!stillCurrent()) {
          tex.dispose();
          throw Error("legacy-stage-superseded");
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        fitCutout(tex);
        draft.maps.push(tex);
        const width = prop.width * (prop.scale ?? 1);
        const aspect =
          Number(tex.userData.aspect) || tex.image.width / tex.image.height;
        const { height } = visibleCutoutSize(width, aspect);
        const stand = popup(prop.x, prop.depth);
        stand.name = options.name || `stage-prop:${prop.file}`;
        stand.position.z += prop.elevation ?? 0;
        const cutout = prop.creature
          ? addCreature(prop.creature, tex, width, locale.ui[prop.creature])
          : new THREE.Mesh(
              new THREE.PlaneGeometry(width, height),
              new THREE.MeshStandardMaterial({
                map: tex,
                alphaTest: 0.3,
                side: THREE.DoubleSide,
                roughness: 1,
              }),
            );
        cutout.position.y = visibleBottomAnchorY(height, prop.lift);
        cutout.scale.x = mirroredScaleX(cutout.scale.x || 1, prop.flipX);
        cutout.userData.visibleWidth = width;
        cutout.userData.visibleHeight = height;
        cutout.castShadow = true;
        cutout.receiveShadow = true;
        stand.add(cutout);
        if (prop.motion)
          draft.motions.push({
            target: cutout,
            motion: prop.motion,
            baseY: cutout.position.y,
            baseRotationZ: cutout.rotation.z,
          });
        draft.propNames.push(prop.file);
        return cutout;
      };
      const direction = stageDirections[page.id];
      // Begin the current spread's unique image transfers together. Each
      // later use receives its own Texture (atlas offsets may differ), while
      // the decoded image and network request are shared per URL.
      legacyStageImageSources(direction).forEach(stageImage);
      draft.wideEnsemble = Boolean(direction.family);
      const backdrop = direction.background;
      draft.actorMood = direction.actors[0]?.mood || "listen";
      texture = await loadStageTexture(backdrop).catch(() =>
        pageImages.texture(
          mobileImageUrl(
            page.image.startsWith("/") ? `.${page.image}` : `./${page.image}`,
          ),
        ),
      );
      if (!stillCurrent()) {
        texture.dispose();
        throw Error("legacy-stage-superseded");
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      draft.maps.push(texture);

      // An upright painted backcloth hinges from the rear of real horizontal pages.
      const back = popup(0, 1.22);
      back.userData.foldStart = Math.PI;
      const backArt = new THREE.Mesh(
        new THREE.PlaneGeometry(5.8, 2.7),
        new THREE.MeshStandardMaterial({
          map: texture,
          color: direction.tint || 0xffffff,
          side: THREE.DoubleSide,
          roughness: 1,
        }),
      );
      backArt.position.y = 1.35;
      backArt.castShadow = true;
      backArt.receiveShadow = true;
      back.add(backArt);
      // Paper support triangles remain visible from the reading camera.
      for (const x of [-2.55, 2.55]) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.55, 0);
        shape.lineTo(0, 0.6);
        shape.closePath();
        const support = new THREE.Mesh(new THREE.ShapeGeometry(shape), paper);
        support.userData.foldSupport = true;
        support.rotation.y = Math.PI / 2;
        support.position.set(x, 0.05, -0.02);
        back.add(support);
      }
      for (const actorDirection of direction.actors) {
        const kind = actorDirection.kind;
        const imageActor = Boolean(actorDirection.image);
        const tex = imageActor
          ? await loadStageTexture(actorDirection.image!)
          : await loadStageTexture(
              `assets/art/theatre/${kind}-poses.webp`,
            ).catch(() =>
              pageImages.texture(
                mobileImageUrl(`./assets/art/${kind}-figurine.webp`),
              ),
            );
        if (!stillCurrent()) {
          tex.dispose();
          throw Error("legacy-stage-superseded");
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        const atlas = imageActor
          ? false
          : tex.image.width / tex.image.height > 1;
        if (imageActor) fitCutout(tex);
        else fitCutout(tex, atlas ? actorDirection.pose : 0, atlas ? 3 : 1);
        tex.userData.poseAtlas = atlas;
        if (!imageActor) tex.userData.pose = actorDirection.pose;
        draft.maps.push(tex);
        const actor = imageActor
          ? createRigidPaperActor(tex, kind, actorDirection.width!)
          : createPaperActor(tex, kind, 1.95);
        actor.root.scale.x = mirroredScaleX(
          actor.root.scale.x || 1,
          actorDirection.flipX,
        );
        const g = popup(actorDirection.x, actorDirection.depth);
        g.add(actor.root);
        if (actorDirection.motion)
          draft.motions.push({
            target: actor.root,
            motion: actorDirection.motion,
            baseY: actor.root.position.y,
            baseRotationZ: actor.root.rotation.z,
          });
        const index = draft.actors.length;
        const button = document.createElement("button");
        button.className = "paper-target";
        button.hidden = true;
        button.type = "button";
        button.setAttribute("aria-label", locale.characters[kind]);
        button.onfocus = () => {
          this.hoveredCreature = -1;
          this.hoveredActor = index;
        };
        button.onblur = () => {
          if (this.hoveredActor === index) this.hoveredActor = -1;
        };
        button.onclick = () => this.activateActor(index);

        draft.actorButtons.push(button);
        draft.actorNames.push(locale.characters[kind]);
        draft.actors.push(actor);
        draft.actorMoods.push(actorDirection.mood);
      }
      if (direction.family) {
        const family =
          typeof direction.family === "object"
            ? direction.family
            : {
                file: "family-seven.webp",
                width: 3.25,
                x: 0.75,
                depth: -0.05,
              };
        await addStageProp(family, {
          name: "family-ensemble",
          optional: true,
        });
        assertCurrent();
      }
      if (direction.ark) {
        const ark =
          typeof direction.ark === "object"
            ? direction.ark
            : {
                file: "ark.webp",
                width: 4.4,
                x: 0.15,
                depth: 0.35,
                lift: 0.5,
                motion: {
                  kind: "float" as const,
                  strength: 0.07,
                  periodSeconds: 5.3,
                  phaseRadians: 0.4,
                },
              };
        await addStageProp(ark, { name: "floating-ark" });
        assertCurrent();
      }
      for (const prop of direction.props || []) {
        await addStageProp(prop);
        if (!stillCurrent()) {
          throw Error("legacy-stage-superseded");
        }
      }
      if (direction.interior) {
        // A small side opening behind the actor, with a sill and surrounding planks.
        const cabin = popup(1.45, 0.7);
        const oak = new THREE.MeshStandardMaterial({
          map: wood.map,
          color: 0x73513b,
          roughness: 0.9,
        });
        for (const x of [-0.68, 0.68])
          box(cabin, 0.18, 1.65, 0.1, oak, x, 0.825, 0);
        for (const y of [0.35, 1.6]) box(cabin, 1.5, 0.15, 0.14, oak, 0, y, 0);
        for (const y of [0.07, 0.19]) box(cabin, 1.5, 0.11, 0.08, oak, 0, y, 0);
      }
      if (direction.rainbow) {
        // Seven separate matte paper arcs stand in front of the distant clouds.
        const bow = popup(0, 0.98);
        const colours = [
          0xc95c50, 0xe69552, 0xe6c76e, 0x86a477, 0x6a9bb2, 0x7685aa, 0x9b80aa,
        ];
        colours.forEach((colour, i) => {
          const radius = 2.55 - i * 0.105;
          const arc = new THREE.Mesh(
            new THREE.RingGeometry(radius - 0.1, radius, 64, 1, 0, Math.PI),
            new THREE.MeshStandardMaterial({
              color: colour,
              roughness: 1,
              side: THREE.DoubleSide,
            }),
          );
          arc.position.set(0, 0.15, 0.025);
          arc.castShadow = true;
          bow.add(arc);
        });
      }
      if (direction.dove) {
        const dove =
          typeof direction.dove === "object"
            ? direction.dove
            : {
                file: "dove-olive.webp",
                width: 1.15,
                x: 1.45,
                depth: 0.55,
                lift: 1.15,
                creature: "dove" as const,
              };
        await addStageProp(dove, { name: "dove-cutout" });
        assertCurrent();
      }
      if (direction.tree !== undefined) {
        await addStageProp(
          {
            file: "assets/art/eden-tree.webp",
            width: 1.5,
            x: direction.tree,
            depth: 0.3,
          },
          { name: "eden-tree" },
        );
        assertCurrent();
      }
      if (direction.waves) {
        if (Array.isArray(direction.waves)) {
          for (const [index, wave] of direction.waves.entries()) {
            const configured = {
              ...wave,
              motion: wave.motion ?? {
                kind: "sway" as const,
                strength: 1.2,
                periodSeconds: 4.2,
                phaseRadians: (index * Math.PI * 2) / direction.waves.length,
              },
            };
            const mesh = await addStageProp(configured, {
              name: `water-wave-layer-${index + 1}`,
            });
            assertCurrent();
            mesh?.parent &&
              (mesh.parent.userData.motionPhase =
                configured.motion.phaseRadians);
          }
        } else {
          const layerCount =
            typeof direction.waves === "number" ? direction.waves : 2;
          for (const [index, layer] of waveLayerLayout(layerCount).entries()) {
            const mesh = await addStageProp(
              {
                file: "assets/books/jonah-and-the-whale/art/storm-wave-layer.webp",
                width: 5.45 * layer.widthScale,
                x: 0,
                depth: layer.depth,
                motion: {
                  kind: "sway",
                  strength: 1.2,
                  periodSeconds: 4.2,
                  phaseRadians: layer.phaseRadians,
                },
              },
              { name: `water-wave-layer-${index + 1}` },
            );
            assertCurrent();
            mesh?.parent &&
              (mesh.parent.userData.motionPhase = layer.phaseRadians);
          }
        }
      }
      {
        // Complete the explicitly paired page print before releasing the stage.
        const groundPath = direction.ground;
        const floorTexture = await loadStageTexture(groundPath);
        if (!stillCurrent()) {
          floorTexture?.dispose();
          throw Error("legacy-stage-superseded");
        }
        if (floorTexture) {
          floorTexture.colorSpace = THREE.SRGBColorSpace;
          floorTexture.anisotropy = 4;
          draft.maps.push(floorTexture);
          draft.root.add(createPageGround(floorTexture, groundPath));
        }
      }
      assertCurrent();
      return { ...draft, texture };
    } catch (error) {
      this.disposePageContents(draft.root, draft.actors, draft.maps);
      throw error;
    }
  }

  private disposePreparedLegacy(stage: PreparedLegacyStage) {
    this.disposePageContents(stage.root, stage.actors, stage.maps);
    stage.actorButtons.forEach((button) => button.remove());
    stage.creatures.forEach(({ button }) => button.remove());
  }

  async spread(story: Story, page: Page, locale: LocaleData) {
    this.releaseAuthoredHolds();
    this.spreadAbort?.abort();
    const spreadAbort = new AbortController();
    this.spreadAbort = spreadAbort;
    const pageImages = new PageImages(spreadAbort.signal);
    const generation = ++this.loadGeneration;
    const authored = page.authored;
    // Build authored artwork off scene. The previous completed spread stays visible
    // until every asset is ready and this request still owns the commit.
    let preparedAuthored: AuthoredStage | undefined;
    let preparedLegacy: PreparedLegacyStage | undefined;
    if (authored) {
      try {
        preparedAuthored = await AuthoredStage.create(
          authored.book,
          authored.spread,
          new THREE.TextureLoader(),
          () => !this.disposed && generation === this.loadGeneration,
          pageImages,
        );
      } catch (error) {
        if (generation !== this.loadGeneration || this.disposed) return;
        throw error;
      }
      if (generation !== this.loadGeneration || this.disposed) {
        preparedAuthored.dispose();
        return;
      }
    } else {
      try {
        preparedLegacy = await this.prepareLegacyStage(
          page,
          locale,
          () => !this.disposed && generation === this.loadGeneration,
          pageImages,
        );
      } catch (error) {
        if (generation !== this.loadGeneration || this.disposed) return;
        throw error;
      }
      if (generation !== this.loadGeneration || this.disposed) {
        this.disposePreparedLegacy(preparedLegacy);
        return;
      }
    }
    this.shelfCoverMotion = undefined;
    this.clearCreatureTargets();
    this.clearReadingFocus();
    this.roomOrbit.reset();
    this.drift.set(0, 0);
    const wasRoom = this.mode === "room";
    const landedShelfBook = wasRoom && this.landedShelfBook;
    this.landedShelfBook = false;
    if (wasRoom && !this.tableShelfKey && this.roomShelf.entry(story.id)) {
      this.tableShelfKey = story.id;
      this.roomShelf.setTableKey(story.id);
    }
    this.focusedRoom = this.hoveredRoom = null;
    this.actorLabel.classList.remove("room-name");
    this.actorLabel.style.maxWidth = "";
    this.actorLabel.style.width = "";
    const presentedPage = {
      story: story.id,
      index: story.pages.findIndex((p) => p.id === page.id),
    };
    const turnDirection = pageTurnDirection(
      wasRoom ? undefined : this.presentedPage,
      presentedPage,
    );
    if (wasRoom || !this.reduced) this.retainedStage.clear();
    // Preserve the last completed image through superseded/partial destination loads.
    if (wasRoom || this.reduced) {
      this.clearSpreadPrints();
    } else if (canCaptureOutgoing(this.presentedPage, this.loadedPage)) {
      // The completed incoming snapshot from the preceding turn is already a full
      // folded image of this page. Transfer ownership rather than allocating a third target.
      if (canCaptureOutgoing(this.presentedPage, this.destinationPrint.page)) {
        const completed = this.destinationPrint.take()!;
        this.leafPrint.replace(
          completed.resource,
          completed.page,
          turnDirection,
        );
      } else {
        this.destinationPrint.clear();
        try {
          // The printed fold and live collapse must share the same planar pose.
          // A first turn has no cached destination print and may begin mid-gesture.
          const actorTime = this.reviewTime ?? this.readTime;
          this.authoredStage?.rest();
          this.actors.forEach((actor, i) =>
            actor.update(
              actorTime + i * 0.8,
              this.actorMoods[i] || this.actorMood,
              false,
              true,
            ),
          );
          this.creatures.forEach(({ creature }) =>
            creature.update(0, { reduced: this.reduced, folded: true }),
          );
          const target = captureFoldedPage(
            this.renderer,
            this.pageRoot,
            turnDirection,
            true,
          );
          this.leafPrint.replace(target, this.presentedPage!, turnDirection);
        } catch {
          // Printing is optional: never expose an incomplete stage when GPU capture fails.
        }
      }
    }
    this.destinationPrint.clear();
    this.configureSpreadPrints(turnDirection);
    this.reviewTime = undefined;
    this.reviewFoldProgress = undefined;
    this.closing = 0;
    if (!wasRoom && !this.reduced && this.popups.length && this.loadedPage) {
      this.foldingOut = performance.now();
      this.foldOutDuration = this.lowQuality ? 110 : 250;
      await new Promise((resolve) =>
        setTimeout(resolve, this.foldOutDuration + 10),
      );
      if (generation !== this.loadGeneration) {
        preparedAuthored?.dispose();
        if (preparedLegacy) this.disposePreparedLegacy(preparedLegacy);
        return;
      }
    }
    this.foldingOut = 0;
    this.mode = "spread";
    this.resize();
    this.roomRoot.visible = true;
    this.bookRoot.visible = true;
    this.transitionWaiting = true;
    this.waitingFromRoom = wasRoom && !landedShelfBook;
    this.pageRoot.visible = false;
    this.turningPage.visible = false;
    if (this.waitingPaper)
      this.waitingPaper.visible = Boolean(this.leafPrint.resource);
    const outgoingActors = this.actors;
    const outgoingMaps = this.pageMaps;
    if (
      !wasRoom &&
      this.reduced &&
      canCaptureOutgoing(this.presentedPage, this.loadedPage)
    ) {
      this.retainedStage.retain(this.pageRoot, this.presentedPage!, (root) =>
        this.disposePageContents(root, outgoingActors, outgoingMaps),
      );
    } else {
      this.disposePageContents(this.pageRoot, outgoingActors, outgoingMaps);
    }
    this.loadedPage = undefined;
    this.actors = [];
    this.creatures = [];
    this.pageMaps = [];
    this.actorButtons.forEach((b) => b.remove());
    this.actorButtons = [];
    this.actorNames = [];
    this.propNames = [];
    this.actorLabel.hidden = true;
    this.hoveredActor = this.touchedActor = -1;
    this.actorMoods = [];
    this.popups = [];
    this.stageMotions = [];
    this.authoredStage = undefined;
    this.authoredPosition = 0;
    this.authoredPlaying = false;
    let texture: THREE.Texture;
    if (authored) {
      const stage = preparedAuthored!;
      this.pageRoot.add(stage.root);
      this.authoredStage = stage;
      this.pageMaps.push(...stage.textures);
      this.popups.push(...stage.popups);
      this.propNames.push(
        ...authored.spread.elements.map((element) => element.id),
      );
      texture = stage.backdropTexture;
      this.currentTexture = texture;
    } else {
      const stage = preparedLegacy!;
      this.pageRoot.add(stage.root);
      this.popups = stage.popups;
      this.actors = stage.actors;
      this.actorMoods = stage.actorMoods;
      this.stageMotions = stage.motions;
      this.actorButtons = stage.actorButtons;
      this.actorNames = stage.actorNames;
      this.propNames = stage.propNames;
      this.creatures = stage.creatures;
      this.pageMaps = stage.maps;
      this.readingWideEnsemble = stage.wideEnsemble;
      this.actorMood = stage.actorMood;
      this.actorButtons.forEach((button) => this.container.append(button));
      this.creatures.forEach(({ button }) => this.container.append(button));
      texture = stage.texture;
      this.currentTexture = texture;
    }
    if (generation !== this.loadGeneration) return;
    if (!this.reduced) {
      try {
        const target = captureFoldedPage(
          this.renderer,
          this.pageRoot,
          turnDirection,
          true,
        );
        this.destinationPrint.replace(target, presentedPage, turnDirection);
      } catch {
        // Continue with a blank reverse rather than leaking a partly built stage.
      }
    }
    this.configureSpreadPrints(turnDirection);
    this.retainedStage.clear();
    this.transitionWaiting = false;
    this.opening = wasRoom;
    this.presentedPage = presentedPage;
    this.loadedPage = { ...presentedPage };
    this.turnDirection = turnDirection;
    this.turningLeaf?.update(0, turnDirection);
    this.turningPage.rotation.y = turnDirection === "forward" ? 0 : -Math.PI;
    this.pageMotionRate = this.lowQuality ? 3.2 : 1;
    this.turnStarted = performance.now();
    this.authoredStage?.begin();
    this.bookRoot.userData.story = story.id;
    const shelfPosition = this.tableShelfKey
      ? this.roomShelf.slotPosition(this.tableShelfKey)
      : undefined;
    this.bookRoot.userData.shelfX = shelfPosition?.x ?? 0;
    this.bookRoot.userData.shelfY = shelfPosition?.y ?? 3.61;
    this.bookRoot.userData.shelfZ = shelfPosition?.z ?? -2.7;
    const shelfCover = this.tableShelfKey
      ? this.roomShelf.coverTexture(this.tableShelfKey)
      : undefined;
    const shelfDefinition = this.tableShelfKey
      ? this.roomShelf.entry(this.tableShelfKey)?.definition
      : undefined;
    const appearance = resolveBookAppearance(
      authored?.book.appearance ?? shelfDefinition?.appearance,
    );
    this.setTableBookAppearance(appearance);
    if (shelfCover) this.showSharedCover(shelfCover);
    else {
      this.showOwnedCover(
        createBookCoverTexture(
          story.title,
          authored ? this.authoredStage!.coverTexture : texture,
          appearance,
        ),
      );
    }

    this.leftLeaf.rotation.y = this.reduced || !wasRoom ? 0 : Math.PI;
    this.turningPage.visible = !wasRoom && !this.reduced;
    this.popups.forEach(
      (g) =>
        (g.rotation.x = this.reduced ? Math.PI / 2 : g.userData.foldStart || 0),
    );
    this.resetBookToTable();
  }
  review(
    time?: number,
    age?: number,
    foldProgress?: number,
    focusAge?: number,
  ) {
    this.reviewFocusAge = focusAge;
    this.reviewTime = time;
    this.reviewAge = age;
    this.reviewFoldProgress =
      foldProgress === undefined
        ? undefined
        : THREE.MathUtils.clamp(foldProgress, 0, 1);
  }
  async close() {
    if (!this.bookRoot.visible) {
      this.mode = "room";
      this.resize();
      return;
    }
    await this.returnTableBook();
    this.closing = 0;
    this.opening = false;
    this.mode = "room";
    this.resize();
  }
  playback(playing: boolean) {
    this.speaking = playing;
  }
  authoredPlayback(
    position: number,
    playing: boolean,
    durations: readonly number[] = [],
  ) {
    this.authoredPosition = Number.isFinite(position)
      ? Math.max(0, position)
      : 0;
    this.authoredPlaying = playing;
    this.authoredStage?.narrationDurations(durations);
  }
  activateAuthored(id: string): AuthoredInteractionResult | undefined {
    if (this.mode !== "spread" || this.transitionWaiting) return;
    return this.authoredStage?.activate(id);
  }
  holdAuthored(id: string, active: boolean) {
    if (this.mode !== "spread" || this.transitionWaiting) return;
    this.authoredStage?.hold(id, active);
  }
  releaseAuthoredHolds() {
    const pointer = this.heldAuthoredPointer;
    this.heldAuthoredPointer = undefined;
    this.heldAuthoredId = undefined;
    this.authoredStage?.releaseHolds();
    if (
      pointer !== undefined &&
      this.renderer.domElement.hasPointerCapture(pointer)
    )
      this.renderer.domElement.releasePointerCapture(pointer);
  }
  private projectedBounds(object: THREE.Object3D) {
    object.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(object);
    const rect = this.renderer.domElement.getBoundingClientRect();
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new THREE.Vector3(x, y, z).project(this.camera);
          const screenX = ((point.x + 1) * rect.width) / 2;
          const screenY = ((1 - point.y) * rect.height) / 2;
          left = Math.min(left, screenX);
          right = Math.max(right, screenX);
          top = Math.min(top, screenY);
          bottom = Math.max(bottom, screenY);
        }
    return { left, right, top, bottom };
  }
  private projectedShelfSpine(object: THREE.Object3D) {
    object.updateWorldMatrix(true, true);
    const rect = this.renderer.domElement.getBoundingClientRect();
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const y of [-SHELF_BOOK_SIZE.height / 2, SHELF_BOOK_SIZE.height / 2])
      for (const z of [
        -SHELF_BOOK_SIZE.thickness / 2,
        SHELF_BOOK_SIZE.thickness / 2,
      ]) {
        const point = object
          .localToWorld(new THREE.Vector3(-SHELF_BOOK_SIZE.width / 2, y, z))
          .project(this.camera);
        const screenX = ((point.x + 1) * rect.width) / 2;
        const screenY = ((1 - point.y) * rect.height) / 2;
        left = Math.min(left, screenX);
        right = Math.max(right, screenX);
        top = Math.min(top, screenY);
        bottom = Math.max(bottom, screenY);
      }
    return { left, right, top, bottom };
  }
  debug() {
    const materialColor = (material?: THREE.MeshStandardMaterial) =>
      material ? `#${material.color.getHexString()}` : null;
    return {
      shelfHint: this.shelfHint.debug(),
      mode: this.mode,
      roomOrbitYaw: this.roomOrbit.yaw,
      roomDragging: this.roomOrbit.dragging,
      roomWallpaper: this.roomWallpaper,
      camera: this.camera.position.toArray(),
      cameraGoal: this.cameraGoal.toArray(),
      readingFocus: {
        index: this.readingFocusIndex,
        wideEnsemble: this.readingWideEnsemble,
        clearanceScale: this.readingFocusScale,
        amount: this.readingFocusAmount,
        cameraOffset: this.readingCameraOffset.toArray(),
        lookOffset: this.readingLookOffset.toArray(),
      },
      look: this.look.toArray(),
      lookGoal: this.lookGoal.toArray(),
      opening: this.opening,
      bookTransform: {
        position: this.bookRoot.position.toArray(),
        rotation: [
          this.bookRoot.rotation.x,
          this.bookRoot.rotation.y,
          this.bookRoot.rotation.z,
        ],
        scale: this.bookRoot.scale.toArray(),
      },
      hinge: this.leftLeaf.rotation.y,
      pageAngle: this.turningPage.rotation.y,
      pageVisible: this.turningPage.visible,
      turnDirection: this.turnDirection,
      pageCurvature: this.turningLeaf?.curvature || 0,
      printedPage: this.leafPrint.page || null,
      destinationPrintPage: this.destinationPrint.page || null,
      sourcePrintContainment:
        this.leafPrint.resource?.texture.userData.printContainment || null,
      destinationPrintContainment:
        this.destinationPrint.resource?.texture.userData.printContainment ||
        null,
      printTargetCount:
        Number(Boolean(this.leafPrint.resource)) +
        Number(Boolean(this.destinationPrint.resource)),
      stageGround: Boolean(this.pageRoot.getObjectByName("stage-ground")),
      stageGroundAsset:
        this.pageRoot.getObjectByName("stage-ground")?.userData.assetPath ||
        null,
      gardenFloor: Boolean(
        this.pageRoot.getObjectByName("stage-ground")?.userData.gardenGround,
      ),
      stageVisible: this.pageRoot.visible,
      loadedPage: this.loadedPage ?? null,
      stageScale: this.pageRoot.scale.x,
      stageOffsetY: this.pageRoot.position.y,
      stageOffsetZ: this.pageRoot.position.z,
      transitionWaiting: this.transitionWaiting,
      retainedStagePage: this.retainedStage.page || null,
      retainedStageVisible: this.retainedStage.visible,
      stationarySourceVisible: Boolean(this.stationarySource?.visible),
      destinationPaperVisible: Boolean(this.destinationPaper?.visible),
      waitingPaperVisible: Boolean(this.waitingPaper?.visible),
      printedSide: this.leafPrint.direction
        ? printLayout(this.leafPrint.direction).side
        : null,
      printUvFlip: this.leafPrint.direction
        ? printLayout(this.leafPrint.direction).flipU
        : false,
      outgoingFoldProgress:
        this.reviewFoldProgress ??
        (this.foldingOut
          ? ease((performance.now() - this.foldingOut) / 250)
          : null),
      popups: this.popups.map((g) => g.rotation.x),
      actorCount: this.actors.length,
      props: this.propNames,
      authored: this.authoredStage?.debug() ?? null,
      shelf: this.roomShelf.debug(),
      tableShelfKey: this.tableShelfKey ?? null,
      tableCoverTexture: this.coverArt?.material.map?.uuid ?? null,
      tableCoverMatchesShelf: Boolean(
        this.tableShelfKey &&
          this.roomShelf.coverTexture(this.tableShelfKey) ===
            this.coverArt?.material.map,
      ),
      tableCoverAppearance:
        this.coverArt?.material.map?.userData.bookAppearance ?? null,
      tableBookMaterials: {
        coverColor: materialColor(this.tableCoverMaterial),
        spineColor: materialColor(this.tableSpineMaterial),
        accentColor: materialColor(this.tableAccentMaterial),
      },
      shelfBrowsingTable: this.shelfBrowsingTable,
      closedBookBounds:
        this.shelfBrowsingTable && this.coverArt
          ? this.projectedBounds(this.coverArt)
          : null,
      shelfCoverMoving: Boolean(this.shelfCoverMotion),
      shelfToys: [...this.shelfToys].map(([id, toy]) => ({
        id,
        animation: toy.definition.animation,
        position: toy.root.position.toArray(),
        rotation: toy.root.rotation.toArray().slice(0, 3),
      })),
      touchedCreature: this.touchedCreature,
      creatures: this.creatures.map(({ creature, kind }) => ({
        kind,
        position: creature.mesh.position.toArray(),
        deformation: creature.mesh.userData.creatureDeformation ?? 0,
      })),
      touchedActor: this.touchedActor,
      reacting: performance.now() < this.touchUntil,
      hoveredActor: this.hoveredActor,
      roomSelection:
        this.reviewRoomSelection ??
        this.hoveredRoom ??
        this.focusedRoom ??
        null,
      roomLabel:
        this.mode === "room" && !this.actorLabel.hidden
          ? this.actorLabel.textContent
          : null,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      gpuGeometries: this.renderer.info.memory.geometries,
      gpuTextures: this.renderer.info.memory.textures,
      renderedFrames: this.renderedFrames,
      renderFrameIntervalMs: this.renderFrameIntervalMs,
      renderCpuMs: this.renderCpuMs,
    };
  }
  private animate = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.animate);
    if (document.hidden) {
      this.lastFrame = 0;
      return;
    }
    const now = performance.now();
    if (this.lowQuality && this.lastFrame && now - this.lastFrame < 30) return;
    this.roomShelf.update(now);
    this.shelfHint.update(
      now,
      this.roomShelf.pickables()[0],
      this.mode === "room" &&
        !document.querySelector("dialog[open]") &&
        !document.querySelector("#loading:not([hidden])"),
      this.reduced,
    );
    const dt = this.lastFrame
      ? Math.min(0.05, (now - this.lastFrame) / 1000)
      : 0.016;
    if (this.lastFrame && now - this.lastFrame > 28) this.slowFrames++;
    else this.slowFrames = Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 45 && !this.lowQuality) {
      this.lowQuality = true;
      document.documentElement.classList.add("low-graphics");
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = false;
    }
    this.lastFrame = now;
    this.readTime += this.reduced ? 0 : dt;
    const time = (now - this.t0) / 1000;
    // Remove last frame's response before interpolating the authored base camera.
    this.camera.position.sub(this.readingCameraOffset);
    this.look.sub(this.readingLookOffset);
    this.readingCameraOffset.set(0, 0, 0);
    this.readingLookOffset.set(0, 0, 0);
    const orbitGoal =
      this.mode === "room"
        ? orbitRoomGoal(this.cameraGoal, this.lookGoal, this.roomOrbit.yaw)
        : this.cameraGoal;
    const goal = orbitGoal.clone();
    if (!this.reduced && !this.lowQuality && !this.roomOrbit.dragging) {
      goal.x += this.drift.x * 0.32;
      goal.y -= this.drift.y * 0.15;
    }
    this.camera.position.lerp(goal, this.reduced ? 1 : 1 - Math.exp(-dt * 3.4));
    this.look.lerp(this.lookGoal, this.reduced ? 1 : 1 - Math.exp(-dt * 3.4));
    this.camera.lookAt(this.look);
    if (this.reviewTime !== undefined) {
      this.camera.position.copy(orbitGoal);
      this.look.copy(this.lookGoal);
      this.camera.lookAt(this.look);
    }
    const focusEnabled =
      this.canFocusActor() &&
      (this.reviewTime === undefined || this.reviewFocusAge !== undefined);
    const focus = focusEnabled
      ? this.readingFocus.sample(now / 1000, this.reviewFocusAge)
      : undefined;
    this.readingFocusAmount = focus?.amount ?? 0;
    if (focus) {
      this.readingCameraOffset.copy(focus.camera);
      this.readingLookOffset.copy(focus.look);
      this.camera.position.add(focus.camera);
      this.look.add(focus.look);
      this.camera.lookAt(this.look);
    }
    if (this.mode === "spread") {
      const age = this.pageMotionAge(now);
      const pose = bookPose(age, this.opening, this.reduced);
      const progress = this.opening
        ? 1 - pose.cover / Math.PI
        : -pose.page / Math.PI;
      const closingProgress = this.closing
        ? ease((now - this.closing) / 750)
        : 0;
      this.leftLeaf.rotation.y = this.closing
        ? Math.PI * ease((closingProgress - 0.3) / 0.7)
        : this.opening
          ? pose.cover
          : 0;
      this.turningPage.rotation.y =
        this.turnDirection === "forward" ? pose.page : -Math.PI - pose.page;
      this.turningLeaf?.update(-pose.page / Math.PI, this.turnDirection);
      this.turningPage.visible =
        !this.transitionWaiting &&
        !this.opening &&
        progress < 1 &&
        !this.reduced;
      const reveal = spreadReveal(
        this.transitionWaiting,
        age,
        this.opening,
        this.reduced,
        Boolean(this.leafPrint.resource),
        Boolean(this.destinationPrint.resource),
      );
      this.pageRoot.visible = reveal.stage;
      if (this.waitingPaper) this.waitingPaper.visible = reveal.waitingPaper;
      if (this.stationarySource)
        this.stationarySource.visible = reveal.stationarySource;
      if (this.destinationPaper)
        this.destinationPaper.visible = reveal.destinationPaper;
      const outgoingUnfold =
        this.reviewFoldProgress !== undefined
          ? 1 - this.reviewFoldProgress
          : this.foldingOut
            ? 1 - ease((now - this.foldingOut) / this.foldOutDuration)
            : undefined;
      const foldFrame = (
        this.foldingOut ? this.leafPrint : this.destinationPrint
      ).resource?.texture.userData.printContainment;
      const stagePose = foldedStagePose(
        this.reduced ? undefined : foldFrame,
        outgoingUnfold ?? pose.popups,
      );
      this.pageRoot.scale.setScalar(stagePose.scale);
      this.pageRoot.position.y = stagePose.y;
      this.pageRoot.position.z = stagePose.z;
      let unfold = outgoingUnfold ?? pose.popups;
      if (this.closing) unfold = 1 - ease(closingProgress / 0.55);
      this.popups.forEach((g, i) => {
        popupFoldSurface(g, i, unfold);
        g.rotation.x = popupFoldAngle(unfold);
        g.visible =
          unfold > 0.001 && !(this.opening && !this.reduced && age < 1.55);
      });
      if (this.transitionWaiting && this.waitingFromRoom)
        this.leftLeaf.rotation.y = Math.PI;
      if (this.opening && !this.transitionWaiting && this.waitingFromRoom) {
        const flight = pose.flight;
        const x = Number(this.bookRoot.userData.shelfX) || 0;
        this.bookRoot.position.set(
          x * (1 - flight),
          THREE.MathUtils.lerp(
            Number(this.bookRoot.userData.shelfY) || 3.61,
            1.495,
            flight,
          ) +
            Math.sin(flight * Math.PI) * 0.45,
          THREE.MathUtils.lerp(
            Number(this.bookRoot.userData.shelfZ) || -2.7,
            1.1,
            flight,
          ),
        );
        this.bookRoot.rotation.x = THREE.MathUtils.lerp(
          0,
          -Math.PI / 2,
          flight,
        );
        this.bookRoot.scale.setScalar(THREE.MathUtils.lerp(0.55, 1, flight));
      }
      const actorTime = this.reviewTime ?? this.readTime;
      this.actors.forEach((a, i) =>
        a.update(
          actorTime + i * 0.8,
          this.actorMoods[i] || this.actorMood,
          this.speaking && i === 0,
          popupActorsAtRest(unfold, this.reduced),
          i === this.touchedActor && now < this.touchUntil
            ? Math.sin(Math.PI * (1 - (this.touchUntil - now) / 1400))
            : 0,
          i === this.hoveredActor,
        ),
      );
      this.creatures.forEach(({ creature }, i) =>
        creature.update(actorTime, {
          reduced: this.reduced,
          folded: popupActorsAtRest(unfold, false),
          touch:
            i === this.touchedCreature && now < this.creatureTouchUntil
              ? this.reduced
                ? 1
                : Math.sin(
                    Math.PI * (1 - (this.creatureTouchUntil - now) / 1400),
                  )
              : 0,
          hover: i === this.hoveredCreature,
        }),
      );
      this.authoredStage?.update(
        this.authoredPosition,
        this.authoredPlaying,
        this.reduced,
        !this.pageRoot.visible || popupActorsAtRest(unfold, false),
      );
      for (const track of this.stageMotions) {
        const offset = this.reduced
          ? 0
          : sampleStageMotion(track.motion, actorTime);
        track.target.position.y =
          track.baseY + (track.motion.kind === "float" ? offset : 0);
        track.target.rotation.z =
          track.baseRotationZ + (track.motion.kind === "sway" ? offset : 0);
      }
    }
    if (this.shelfCoverMotion) {
      const motion = this.shelfCoverMotion;
      const duration = this.reduced ? 0 : motion.kind === "close" ? 320 : 380;
      const amount = duration ? ease((now - motion.started) / duration) : 1;
      const target = motion.kind === "close" ? Math.PI : 0;
      this.leftLeaf.rotation.y = THREE.MathUtils.lerp(
        motion.from,
        target,
        amount,
      );
      this.pageRoot.visible = false;
      this.turningPage.visible = false;
      if (this.waitingPaper) this.waitingPaper.visible = false;
      if (this.stationarySource) this.stationarySource.visible = false;
      if (this.destinationPaper) this.destinationPaper.visible = false;
      this.actorButtons.forEach((button) => (button.hidden = true));
      this.creatures.forEach(({ button }) => (button.hidden = true));
      if (amount >= 1) {
        this.leftLeaf.rotation.y = target;
        this.shelfCoverMotion = undefined;
        if (motion.kind === "open" && this.mode === "spread")
          this.pageRoot.visible = !this.transitionWaiting;
      }
    }
    const roomSelection =
      this.reviewRoomSelection ?? this.hoveredRoom ?? this.focusedRoom ?? null;
    this.pickables.forEach((object) => {
      const selected =
        this.mode === "room" && object.userData.pick === roomSelection;
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => {
          if (!material.color) return;
          material.userData.roomRestColor ??= material.color.clone();
          material.color.copy(material.userData.roomRestColor);
          if (selected) material.color.lerp(roomTint, 0.12);
          if (material.emissive) {
            material.userData.roomRestEmissive ??= material.emissive.clone();
            material.emissive.copy(material.userData.roomRestEmissive);
            if (selected) material.emissive.add(roomGlow);
          }
        });
      });
    });
    if (this.mode === "room") {
      const selected = this.pickables.find(
        (object) => object.userData.pick === roomSelection,
      );
      this.actorLabel.classList.add("room-name");
      this.actorLabel.hidden = !selected;
      if (selected) {
        const isBook = String(roomSelection).startsWith("shelf:");
        const point = selected
          .localToWorld(
            new THREE.Vector3(0, isBook ? -0.78 : 1.12, isBook ? 0.12 : 0),
          )
          .project(this.camera);
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.actorLabel.textContent = this.roomNames.get(roomSelection!) || "";
        this.actorLabel.style.maxWidth = `${Math.max(80, Math.min(240, rect.width - 24))}px`;
        this.actorLabel.style.width = "max-content";
        const half = this.actorLabel.offsetWidth / 2;
        const labelHeight = this.actorLabel.offsetHeight;
        this.actorLabel.style.left = `${Math.max(half + 12, Math.min(rect.width - half - 12, ((point.x + 1) * rect.width) / 2))}px`;
        const anchorY = ((1 - point.y) * rect.height) / 2;
        const labelY = isBook ? anchorY + 8 : anchorY - labelHeight - 8;
        this.actorLabel.style.top = `${Math.max(65, Math.min(rect.height - labelHeight - 12, labelY))}px`;
      }
    }
    for (const button of this.shelfButtons) {
      const key = button.dataset.shelfKey!;
      const entry = this.roomShelf.entry(key);
      const shown =
        this.mode === "room" &&
        Boolean(entry?.root.visible) &&
        this.roomShelf.previewKey !== key;
      button.hidden = !shown;
      if (!shown || !entry) continue;
      const bounds = this.projectedShelfSpine(entry.root);
      const inset = Math.min(1, (bounds.right - bounds.left) / 4);
      button.style.left = `${bounds.left + inset}px`;
      button.style.top = `${bounds.top}px`;
      button.style.width = `${Math.max(2, bounds.right - bounds.left - inset * 2)}px`;
      button.style.height = `${Math.max(2, bounds.bottom - bounds.top)}px`;
    }
    for (const button of this.shelfToyButtons) {
      const toy = this.shelfToys.get(button.dataset.toyId!);
      button.hidden = this.mode !== "room" || !toy;
      if (!toy || button.hidden) continue;
      const bounds = this.projectedBounds(toy.root);
      button.style.left = `${bounds.left}px`;
      button.style.top = `${bounds.top}px`;
      button.style.width = `${Math.max(32, bounds.right - bounds.left)}px`;
      button.style.height = `${Math.max(32, bounds.bottom - bounds.top)}px`;
    }
    if (this.mode === "spread") {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const active =
        now < this.touchUntil ? this.touchedActor : this.hoveredActor;
      this.actorLabel.hidden =
        active < 0 ||
        this.foldingOut > 0 ||
        this.closing > 0 ||
        !this.pageRoot.visible;
      this.actors.forEach((actor, i) => {
        const head = actor.root
          .localToWorld(
            new THREE.Vector3(
              0,
              (Number(actor.root.userData.visibleHeight) || 2.08) * 0.96,
              0,
            ),
          )
          .project(this.camera);
        const foot = actor.root
          .localToWorld(new THREE.Vector3(0, 0, 0))
          .project(this.camera);
        const x = ((head.x + 1) * rect.width) / 2,
          y = ((1 - head.y) * rect.height) / 2;
        const bottom = ((1 - foot.y) * rect.height) / 2;
        const button = this.actorButtons[i];
        if (button) {
          button.hidden = !this.pageRoot.visible;
          button.style.left = `${x - 30}px`;
          button.style.top = `${y}px`;
          button.style.height = `${Math.max(44, bottom - y)}px`;
        }
        if (i === active) {
          this.actorLabel.textContent = this.actorNames[i];
          this.actorLabel.style.left = `${Math.max(40, Math.min(rect.width - 40, x))}px`;
          this.actorLabel.style.top = `${Math.max(65, y - 34)}px`;
        }
      });
    }
    if (this.mode === "spread") {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const usable = this.creatureUsable();
      const active =
        now < this.creatureTouchUntil
          ? this.touchedCreature
          : this.hoveredCreature;
      this.creatures.forEach(({ creature, kind, label, button }, i) => {
        const width = creature.mesh.geometry.parameters.width;
        const height = creature.mesh.geometry.parameters.height;
        const anchor = creature.mesh
          .localToWorld(
            new THREE.Vector3(
              width * (kind === "serpent" ? -0.28 : 0.15),
              height * (kind === "serpent" ? 0.22 : -0.1),
              0,
            ),
          )
          .project(this.camera);
        const x = ((anchor.x + 1) * rect.width) / 2;
        const y = ((1 - anchor.y) * rect.height) / 2;
        button.hidden = !usable;
        button.style.left = `${x - 30}px`;
        button.style.top = `${y - 22}px`;
        button.style.height = "44px";
        if (usable && i === active) {
          this.actorLabel.hidden = false;
          this.actorLabel.textContent = label;
          this.actorLabel.style.left = `${Math.max(40, Math.min(rect.width - 40, x))}px`;
          this.actorLabel.style.top = `${Math.max(65, y - 56)}px`;
        }
      });
    }
    const renderStartedAt = performance.now();
    this.renderFrameIntervalMs = this.lastRenderedAt
      ? renderStartedAt - this.lastRenderedAt
      : 0;
    this.lastRenderedAt = renderStartedAt;
    this.renderer.render(this.scene, this.camera);
    this.renderCpuMs = performance.now() - renderStartedAt;
    this.renderedFrames++;
  };
  private disposePageContents(
    root: THREE.Group,
    actors: PaperActor[],
    maps: THREE.Texture[],
  ) {
    // Actors own their meshes; remove those subtrees before releasing the other props.
    for (const actor of actors) {
      actor.root.removeFromParent();
      actor.dispose();
    }
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
    new Set(maps).forEach((texture) => texture.dispose());
    root.clear();
  }
  private configureSpreadPrints(direction: TurnDirection) {
    if (this.leafPrint.resource) this.leafPrint.direction = direction;
    // Use the exact page material throughout the turn. Captures retain layout
    // metadata only; tinting paper with a paper-colored texture changes its color.
    const source = null;
    const destination = null;
    this.turningLeaf?.setSpreadPrint(source, destination, direction);
    if (this.waitingPaper) setPrintCrop(this.waitingPaper.material, source);
    const landingLeft = direction === "forward";
    if (this.stationarySource) {
      this.stationarySource.position.x = landingLeft ? -1.51 : 1.51;
      setPrintCrop(
        this.stationarySource.material,
        source,
        0.5,
        landingLeft ? 0 : 0.5,
      );
    }
    if (this.destinationPaper) {
      this.destinationPaper.position.x = landingLeft ? 1.51 : -1.51;
      setPrintCrop(
        this.destinationPaper.material,
        destination,
        0.5,
        landingLeft ? 0.5 : 0,
      );
    }
  }
  private clearSpreadPrints() {
    this.turningLeaf?.setSpreadPrint(null, null, "forward");
    for (const plate of [
      this.waitingPaper,
      this.stationarySource,
      this.destinationPaper,
    ]) {
      if (plate) {
        setPrintCrop(plate.material, null);
        plate.visible = false;
      }
    }
    this.leafPrint.clear();
    this.destinationPrint.clear();
  }
  dispose() {
    this.spreadAbort?.abort();
    this.shelfHint.dispose();
    this.clearCreatureTargets();
    this.retainedStage.clear();
    this.clearSpreadPrints();
    this.disposed = true;
    this.loadGeneration++;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener("pointerdown", this.onDown);
    this.renderer.domElement.removeEventListener(
      "pointercancel",
      this.onCancel,
    );
    this.renderer.domElement.removeEventListener(
      "lostpointercapture",
      this.onCancel,
    );
    this.renderer.domElement.removeEventListener("pointerup", this.onPointer);
    this.renderer.domElement.removeEventListener("pointermove", this.onMove);
    this.renderer.domElement.removeEventListener("pointerleave", this.onLeave);
    this.actorLabel.remove();
    this.clearShelfButtons();
    this.clearToyButtons();
    this.actorButtons.forEach((b) => b.remove());
    this.actors.forEach((a) => a.dispose());
    this.pageMaps.forEach((t) => t.dispose());
    this.roomTextures.forEach((t) => t.dispose());
    this.closedMap?.dispose();
    this.roomTextures.clear();
    this.roomShelf.dispose();
    this.shelfToys.forEach((toy) => this.disposeToy(toy));
    this.shelfToys.clear();
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const materials = Array.isArray(o.material) ? o.material : [o.material];
        materials.forEach((m) => m.dispose());
      }
    });
    this.tableCoverMaterial = undefined;
    this.tableSpineMaterial = undefined;
    this.tableAccentMaterial = undefined;
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
