import * as THREE from "three";

/** Per-material sampling views share the render target itself; no texture/GPU copies. */
export function setPrintCrop(
  material: THREE.MeshStandardMaterial,
  texture: THREE.Texture | null,
  scale = 1,
  offset = 0,
) {
  let crop = material.userData.printUvCrop as THREE.Vector2 | undefined;
  if (!crop) {
    crop = new THREE.Vector2(1, 0);
    material.userData.printUvCrop = crop;
    const uniform = { value: crop };
    material.onBeforeCompile = (shader) => {
      shader.uniforms.paperPrintCrop = uniform;
      shader.fragmentShader =
        "uniform vec2 paperPrintCrop;\n" +
        shader.fragmentShader.replace(
          "#include <map_fragment>",
          THREE.ShaderChunk.map_fragment.replace(
            /vMapUv/g,
            "vec2(vMapUv.x * paperPrintCrop.x + paperPrintCrop.y, vMapUv.y)",
          ),
        );
    };
    material.customProgramCacheKey = () => "paper-print-crop-v1";
  }
  crop.set(scale, offset);
  const changedPresence = Boolean(material.map) !== Boolean(texture);
  material.map = texture;
  if (changedPresence) material.needsUpdate = true;
}
