import * as THREE from "three";
import { FOLD_LAYER_GAP } from "./popup-fold-surface";
import { foldedPrintFrame, visibleFoldedBounds } from "./folded-print-frame";
import type { PresentedPage, TurnDirection } from "./turning-leaf";

export function printLayout(direction: TurnDirection, width = 3.02) {
  return direction === "forward"
    ? { left: 0, right: width, side: "front" as const, flipU: false }
    : { left: -width, right: 0, side: "back" as const, flipU: true };
}
export function canCaptureOutgoing(
  presented: PresentedPage | undefined,
  loaded: PresentedPage | undefined,
) {
  return Boolean(
    presented &&
      loaded &&
      presented.story === loaded.story &&
      presented.index === loaded.index,
  );
}

/** One GPU snapshot owned independently of the source stage and its textures. */
export class LeafPrintStore<T extends { dispose(): void }> {
  resource?: T;
  page?: PresentedPage;
  direction?: TurnDirection;
  replace(resource: T, page: PresentedPage, direction: TurnDirection) {
    this.clear();
    this.resource = resource;
    this.page = { ...page };
    this.direction = direction;
  }
  take() {
    if (!this.resource || !this.page || !this.direction) return undefined;
    const value = {
      resource: this.resource,
      page: this.page,
      direction: this.direction,
    };
    this.resource = undefined;
    this.page = undefined;
    this.direction = undefined;
    return value;
  }
  clear() {
    this.resource?.dispose();
    this.resource = undefined;
    this.page = undefined;
    this.direction = undefined;
  }
}

/** One synchronous offscreen pass, performed before any outgoing resources are disposed. */
export function captureFoldedPage(
  renderer: THREE.WebGLRenderer,
  pageRoot: THREE.Group,
  direction: TurnDirection,
  fullSpread = false,
) {
  const target = new THREE.WebGLRenderTarget(1024, 1024, {
    depthBuffer: true,
    stencilBuffer: false,
  });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  target.texture.name = "outgoing-folded-page-print";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfff0d3);
  const clone = pageRoot.clone(true);
  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  clone.scale.setScalar(1);
  clone.visible = true;
  // Tiny deterministic layer offsets remove coplanar interference in the flat composite.
  clone.children.forEach((popup, i) => {
    if (popup.userData.staticPageSurface) return;
    popup.scale.y = 1;
    popup.rotation.x = Number(popup.userData.foldStart) || 0;
    popup.position.z =
      (popup.userData.foldBaseZ ?? popup.position.z) + i * FOLD_LAYER_GAP;
    popup.visible = true;
  });
  const materials: THREE.Material[] = [];
  clone.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (object.userData.foldSupport) object.visible = false;
    const unlit = (source: THREE.Material) => {
      const original = source as THREE.MeshStandardMaterial;
      const material = new THREE.MeshBasicMaterial({
        map: original.map || null,
        color: original.color || 0xffffff,
        alphaMap: original.alphaMap || null,
        alphaTest: original.alphaTest,
        transparent: original.transparent,
        opacity: original.opacity,
        visible: original.visible,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      materials.push(material);
      return material;
    };
    object.material = Array.isArray(object.material)
      ? object.material.map(unlit)
      : unlit(object.material);
    object.castShadow = false;
    object.receiveShadow = false;
  });
  scene.add(clone);
  const containment = fullSpread
    ? foldedPrintFrame(visibleFoldedBounds(clone))
    : undefined;
  if (containment) target.texture.userData.printContainment = containment;
  // Folded pages show paper, never a flattened, upside-down story illustration.
  clone.visible = false;
  const layout = containment || {
    ...printLayout(direction),
    top: 1.715,
    bottom: -1.715,
  };
  const camera = new THREE.OrthographicCamera(
    layout.left,
    layout.right,
    layout.top,
    layout.bottom,
    0.01,
    30,
  );
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  const previousTarget = renderer.getRenderTarget();
  const viewport = renderer.getViewport(new THREE.Vector4());
  const scissor = renderer.getScissor(new THREE.Vector4());
  const scissorTest = renderer.getScissorTest();
  const toneMapping = renderer.toneMapping;
  const autoClear = renderer.autoClear;
  try {
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.autoClear = true;
    renderer.setRenderTarget(target);
    renderer.setScissorTest(false);
    renderer.render(scene, camera);
  } catch (error) {
    target.dispose();
    throw error;
  } finally {
    renderer.setRenderTarget(previousTarget);
    renderer.setViewport(viewport);
    renderer.setScissor(scissor);
    renderer.setScissorTest(scissorTest);
    renderer.toneMapping = toneMapping;
    renderer.autoClear = autoClear;
    materials.forEach((material) => material.dispose());
    // Cloned geometries and maps are borrowed; the outgoing stage still owns them.
    scene.clear();
  }
  return target;
}
