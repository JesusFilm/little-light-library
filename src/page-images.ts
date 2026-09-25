import * as THREE from "three";

const aborted = () => new DOMException("Page image superseded", "AbortError");

/** Decode to HTMLImageElement, preserving TextureLoader's UV and alpha behavior. */
async function decodeImage(
  blob: Blob,
  signal: AbortSignal,
): Promise<HTMLImageElement> {
  if (signal.aborted) throw aborted();
  const objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        image.onload = null;
        image.onerror = null;
        signal.removeEventListener("abort", onAbort);
      };
      const onAbort = () => {
        cleanup();
        image.src = "";
        reject(aborted());
      };
      image.onload = () => {
        cleanup();
        resolve();
      };
      image.onerror = () => {
        cleanup();
        reject(new Error("Page image could not decode."));
      };
      signal.addEventListener("abort", onAbort, { once: true });
      image.src = objectUrl;
      if (signal.aborted) onAbort();
    });
    if (signal.aborted) throw aborted();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** One encoded request and decoded image per URL, with distinct mutable textures. */
export class PageImages {
  private readonly images = new Map<string, Promise<HTMLImageElement>>();
  private readonly fetcher: typeof fetch;
  private readonly decoder: typeof decodeImage;

  constructor(
    private readonly signal: AbortSignal,
    options: {
      fetch?: typeof fetch;
      decode?: typeof decodeImage;
    } = {},
  ) {
    this.fetcher = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.decoder = options.decode ?? decodeImage;
  }

  image(url: string): Promise<HTMLImageElement> {
    let pending = this.images.get(url);
    if (!pending) {
      pending = (async () => {
        if (this.signal.aborted) throw aborted();
        const response = await this.fetcher(url, { signal: this.signal });
        if (!response.ok)
          throw new Error(`Page image '${url}' could not load.`);
        return this.decoder(await response.blob(), this.signal);
      })();
      // Eager image requests may reject before construction reaches their use.
      void pending.catch(() => undefined);
      this.images.set(url, pending);
    }
    return pending;
  }

  async texture(url: string): Promise<THREE.Texture> {
    const image = await this.image(url);
    if (this.signal.aborted) throw aborted();
    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    return texture;
  }
}
