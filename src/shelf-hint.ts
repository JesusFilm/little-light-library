import * as THREE from "three";
import { SHELF_BOOK_SIZE } from "./room-shelf";

/** A visit ends on reload; selecting any spine completes this introduction. */
export class ShelfHint {
  readonly root = new THREE.Group();
  private lastActivity = performance.now();
  private completed = false;
  private fadeStarted?: number;
  private fadeOpacity = 0;
  private spineMaterial = new THREE.ShaderMaterial({
    uniforms: { opacity: { value: 0 } },
    vertexShader: `varying vec2 borderUv;
      void main() { borderUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 borderUv; uniform float opacity;
      void main() {
        vec2 p = (borderUv - 0.5) * vec2(0.44, 1.54);
        vec2 q = abs(p) - vec2(0.16, 0.71);
        float edge = abs(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0));
        float core = 1.0 - smoothstep(0.006, 0.015, edge);
        float halo = exp(-edge * edge / 0.00065) * 0.35;
        gl_FragColor = vec4(1.0, 0.68, 0.15, max(core, halo) * opacity);
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  private spineBorder = new THREE.Mesh(
    new THREE.PlaneGeometry(
      SHELF_BOOK_SIZE.thickness + 0.12,
      SHELF_BOOK_SIZE.height + 0.12,
    ),
    this.spineMaterial,
  );
  private material = new THREE.MeshStandardMaterial({
    color: 0xffe5a0,
    emissive: 0xffb52e,
    emissiveIntensity: 0.65,
    roughness: 0.45,
    transparent: true,
    depthWrite: false,
  });
  private outline = new THREE.MeshBasicMaterial({
    color: 0xffc342,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  private glow = new THREE.ShaderMaterial({
    uniforms: { opacity: { value: 0 } },
    vertexShader: `varying vec2 uvGlow;
      void main() { uvGlow = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 uvGlow; uniform float opacity;
      void main() { float radius = length((uvGlow - 0.5) * 2.0);
        float light = pow(max(0.0, 1.0 - radius), 2.0);
        gl_FragColor = vec4(1.0, 0.58, 0.08, light * opacity); }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  private sparkles: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>[] =
    [];
  private activity = () => {
    this.lastActivity = performance.now();
    this.root.visible = false;
    this.spineBorder.visible = false;
  };
  constructor() {
    this.spineBorder.name = "shelf-hint-spine-border";
    this.spineBorder.visible = false;
    this.spineBorder.position.x = -SHELF_BOOK_SIZE.width / 2 - 0.012;
    this.spineBorder.rotation.y = -Math.PI / 2;
    this.spineBorder.raycast = () => {};
    this.root.name = "shelf-pointing-hint";
    this.root.visible = false;
    this.root.scale.setScalar(1.8);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), this.glow);
    halo.position.set(0, 0.22, -0.1);
    halo.renderOrder = -2;
    this.root.add(halo);
    // A soft mitten hand with an extended index finger, pointing downward.
    const part = (x: number, y: number, sx: number, sy: number) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 12),
        this.material,
      );
      mesh.position.set(x, y, 0);
      mesh.scale.set(sx, sy, 0.07);
      const outline = new THREE.Mesh(mesh.geometry, this.outline);
      outline.scale.set(1.16, 1.1, 1.16);
      outline.renderOrder = -1;
      mesh.add(outline);
      this.root.add(mesh);
    };
    part(0, 0.25, 0.14, 0.16);
    part(-0.075, 0.065, 0.047, 0.19);
    part(0.11, 0.18, 0.065, 0.085);
    part(-0.005, 0.4, 0.095, 0.075);
    const star = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const radius = i % 2 === 0 ? 1 : 0.24;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) star.moveTo(x, y);
      else star.lineTo(x, y);
    }
    star.closePath();
    for (let i = 0; i < 9; i++) {
      const sparkle = new THREE.Mesh(
        new THREE.ShapeGeometry(star),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? 0xffcb48 : 0xfff5ce,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      this.sparkles.push(sparkle);
      this.root.add(sparkle);
    }
    document.addEventListener("visibilitychange", this.activity);
  }
  complete() {
    if (this.completed) return;
    this.completed = true;
    if (this.root.visible) {
      this.fadeStarted = performance.now();
      this.fadeOpacity = this.material.opacity;
    }
  }
  debug() {
    return {
      visible: this.root.visible,
      completed: this.completed,
      idleMs: performance.now() - this.lastActivity,
      position: this.root.position.toArray(),
    };
  }
  update(
    now: number,
    target: THREE.Object3D | undefined,
    active: boolean,
    reduced: boolean,
  ) {
    if ((!active && !this.root.visible) || !target || document.hidden)
      this.activity();
    const elapsed = now - this.lastActivity - 15000;
    const phase = elapsed % 14000;
    const fading =
      this.fadeStarted !== undefined && now - this.fadeStarted < 600;
    this.root.visible =
      !!target &&
      !document.hidden &&
      (this.completed
        ? fading
        : (active || this.root.visible) && elapsed >= 0 && phase < 4000);
    this.spineBorder.visible = this.root.visible;
    if (!this.root.visible || !target) return;
    if (this.spineBorder.parent !== target) target.add(this.spineBorder);
    if (!this.completed) {
      this.root.position.copy(target.position);
      this.root.position.y +=
        0.82 + (reduced ? 0 : 0.065 * Math.sin(phase / 220));
      this.root.position.x += 0.135;
      this.root.position.z += 0.85;
    }
    this.material.opacity = this.completed
      ? this.fadeOpacity * Math.max(0, 1 - (now - this.fadeStarted!) / 600)
      : reduced
        ? 1
        : Math.min(1, phase / 450, (4000 - phase) / 600);
    this.outline.opacity = this.material.opacity;
    this.spineMaterial.uniforms.opacity.value =
      this.material.opacity *
      (reduced ? 0.9 : 0.7 + 0.3 * Math.sin(phase / 400));
    this.glow.uniforms.opacity.value =
      this.material.opacity *
      (reduced ? 0.1 : 0.1 + 0.015 * Math.sin(phase / 400));
    this.sparkles.forEach((sparkle, index) => {
      const age = reduced ? 0.5 : (phase / 1800 + index / 9) % 1;
      const angle = index * 2.4;
      const radius = 0.34 + age * 0.28;
      sparkle.position.set(
        Math.cos(angle) * radius,
        0.22 + Math.sin(angle) * radius + age * 0.15,
        0.12,
      );
      sparkle.scale.setScalar(
        (0.04 + (index % 3) * 0.012) * (reduced ? 1 : Math.sin(age * Math.PI)),
      );
      sparkle.material.opacity =
        this.material.opacity * (reduced ? 0.85 : Math.sin(age * Math.PI));
      sparkle.rotation.z = reduced ? 0 : age * 0.7;
    });
  }
  dispose() {
    this.spineBorder.removeFromParent();
    this.spineBorder.geometry.dispose();
    this.spineMaterial.dispose();
    document.removeEventListener("visibilitychange", this.activity);
    this.root.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
    this.material.dispose();
    this.outline.dispose();
    this.glow.dispose();
    this.sparkles.forEach((sparkle) => sparkle.material.dispose());
    this.root.removeFromParent();
  }
}
