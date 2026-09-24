import * as THREE from "three";
import type { PresentedPage } from "./turning-leaf";

/** Owns the previous complete stage while a replacement is built offscreen. */
export class RetainedStage {
  private held?: {
    root: THREE.Group;
    page: PresentedPage;
    release: (root: THREE.Group) => void;
  };
  get page() {
    return this.held?.page;
  }
  get visible() {
    return Boolean(this.held?.root.visible && this.held.root.parent);
  }
  retain(
    source: THREE.Group,
    page: PresentedPage,
    release: (root: THREE.Group) => void,
  ) {
    this.clear();
    const root = new THREE.Group();
    root.name = "retained-complete-stage";
    root.position.copy(source.position);
    root.quaternion.copy(source.quaternion);
    root.scale.copy(source.scale);
    root.add(...source.children);
    source.parent?.add(root);
    this.held = { root, page: { ...page }, release };
  }
  clear() {
    const held = this.held;
    this.held = undefined;
    if (!held) return;
    held.root.removeFromParent();
    held.release(held.root);
  }
}
