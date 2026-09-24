import * as THREE from "three";

/** One tile spans the same world distance on either wall, including the corner. */
export function wallPaperUv(
  mesh: THREE.Mesh,
  side: "back" | "left",
  tileSize = 2.6,
) {
  const positions = mesh.geometry.getAttribute("position");
  const uv = mesh.geometry.getAttribute("uv");
  for (let i = 0; i < positions.count; i++) {
    const horizontal =
      side === "back"
        ? positions.getX(i) + mesh.position.x + 6.8
        : -(positions.getZ(i) + mesh.position.z + 4.4);
    uv.setXY(
      i,
      horizontal / tileSize,
      (positions.getY(i) + mesh.position.y) / tileSize,
    );
  }
  uv.needsUpdate = true;
}

export function curtainGeometry(width = 0.42, height = 2.85) {
  const geometry = new THREE.PlaneGeometry(width, height, 48, 20);
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const u = positions.getX(i) / width + 0.5;
    const v = positions.getY(i) / height + 0.5;
    positions.setZ(i, Math.cos(u * Math.PI * 6) * (0.045 + (1 - v) * 0.018));
    // A tiny relaxed hem, without moving the rod line or making a new silhouette.
    positions.setY(
      i,
      positions.getY(i) + (1 - v) * 0.018 * Math.sin(u * Math.PI * 6) ** 2,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function quiltPatchGeometry(width = 0.405, depth = 0.46) {
  const geometry = new THREE.BoxGeometry(width, 0.07, depth, 6, 1, 6);
  puffQuilt(geometry, width, depth);
  return geometry;
}

export function puffQuilt(
  geometry: THREE.BufferGeometry,
  width: number,
  depth: number,
) {
  const p = geometry.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    if (p.getY(i) <= 0) continue;
    const x = Math.max(0, Math.cos((p.getX(i) / width) * Math.PI));
    const z = Math.max(0, Math.cos((p.getZ(i) / depth) * Math.PI));
    p.setY(i, p.getY(i) + 0.018 * x * z);
  }
  geometry.computeVertexNormals();
}

function canvasTexture(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  size: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function quiltWeaveTexture() {
  return canvasTexture((ctx, size) => {
    ctx.fillStyle = "#eee9df";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < size; i += 3) {
      ctx.fillStyle = i % 2 ? "#ffffff24" : "#73695318";
      ctx.fillRect(i, 0, 1, size);
      ctx.fillRect(0, i, size, 1);
    }
    ctx.strokeStyle = "#fcf7e598";
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(9, 9, size - 18, size - 18);
  }, 128);
}

export function windowViewTexture() {
  return canvasTexture((ctx, size) => {
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, "#83a9b8");
    sky.addColorStop(0.65, "#c4d6cd");
    sky.addColorStop(1, "#d6d6b6");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, size, size);
    ctx.filter = "blur(7px)";
    for (let layer = 0; layer < 2; layer++) {
      ctx.fillStyle = layer ? "#67898180" : "#8dada880";
      ctx.beginPath();
      ctx.moveTo(-20, size);
      for (let x = -20; x <= size + 20; x += 5) {
        const y =
          size * (0.73 + layer * 0.1) +
          Math.sin(x * 0.026 + layer) * 17 +
          Math.cos(x * 0.068) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size + 20, size);
      ctx.closePath();
      ctx.fill();
    }
    ctx.filter = "none";
  }, 512);
}
