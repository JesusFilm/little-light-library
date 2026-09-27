import * as THREE from "three";

/** A reading nook suggested by three cheap surfaces, not a furnished room.
 * Soft lighting and contact shading are baked once into small local canvases. */
export function createPortraitBackdrop() {
  const root = new THREE.Group();
  const textures: THREE.Texture[] = [];
  function texture(
    width: number,
    height: number,
    paint: (c: CanvasRenderingContext2D) => void,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    paint(canvas.getContext("2d")!);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    textures.push(map);
    return map;
  }
  const wall = texture(512, 256, (c) => {
    const light = c.createRadialGradient(330, 100, 5, 280, 140, 340);
    light.addColorStop(0, "#b99963");
    light.addColorStop(0.35, "#655c48");
    light.addColorStop(1, "#253d3a");
    c.fillStyle = light;
    c.fillRect(0, 0, 512, 256);
    // Defocused vertical silhouettes suggest books and a window, without detail
    // competing with the actual story. This is a one-time canvas blur, no post FX.
    c.filter = "blur(8px)";
    const colors = ["#29473eaa", "#784d3999", "#b0996888", "#233a3a99"];
    for (let i = 0; i < 12; i++) {
      c.fillStyle = colors[i % colors.length];
      c.fillRect(i * 46, 68 + (i % 3) * 17, 22 + (i % 5), 140);
    }
    c.fillStyle = "#e9c98960";
    c.fillRect(322, 20, 75, 143);
    c.fillStyle = "#1e3535a0";
    c.fillRect(0, 185, 512, 12);
  });
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 14),
    new THREE.MeshBasicMaterial({ map: wall }),
  );
  backdrop.position.set(0, 7, -5);
  root.add(backdrop);
  const wood = texture(512, 256, (c) => {
    c.fillStyle = "#6a5842";
    c.fillRect(0, 0, 512, 256);
    for (let y = 0; y < 256; y += 2) {
      c.strokeStyle = `rgba(35,24,14,${0.025 + (y % 7) * 0.012})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(150, y + 4, 330, y - 4, 512, y);
      c.stroke();
    }
    const glow = c.createRadialGradient(256, 90, 5, 256, 128, 280);
    glow.addColorStop(0, "#e0bd7c45");
    glow.addColorStop(1, "#14282655");
    c.fillStyle = glow;
    c.fillRect(0, 0, 512, 256);
  });
  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(48, 48),
    new THREE.MeshBasicMaterial({ map: wood }),
  );
  table.rotation.x = -Math.PI / 2;
  table.position.set(0, 1.23, 2);
  root.add(table);
  const shadow = texture(128, 128, (c) => {
    const gradient = c.createRadialGradient(64, 64, 12, 64, 64, 64);
    gradient.addColorStop(0, "#0b1513aa");
    gradient.addColorStop(0.65, "#0b151360");
    gradient.addColorStop(1, "#0b151300");
    c.fillStyle = gradient;
    c.fillRect(0, 0, 128, 128);
  });
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 6),
    new THREE.MeshBasicMaterial({
      map: shadow,
      transparent: true,
      depthWrite: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, 1.235, 1.1);
  root.add(contact);
  return {
    root,
    dispose() {
      root.removeFromParent();
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      textures.forEach((map) => map.dispose());
    },
  };
}
