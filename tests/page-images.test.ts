import assert from "node:assert/strict";
import test from "node:test";
import { PageImages } from "../src/page-images";

test("page images share one request and decode, but return independent textures", async () => {
  const controller = new AbortController();
  const requests: Array<{ url: string; signal?: AbortSignal }> = [];
  let decodes = 0;
  const image = { width: 300, height: 200 } as HTMLImageElement;
  const images = new PageImages(controller.signal, {
    fetch: (async (url, options) => {
      requests.push({ url: String(url), signal: options?.signal ?? undefined });
      return {
        ok: true,
        blob: async () => new Blob(["image"]),
      } as Response;
    }) as typeof fetch,
    decode: async () => {
      decodes++;
      return image;
    },
  });

  const [first, second] = await Promise.all([
    images.texture("./assets/page.mobile.webp"),
    images.texture("./assets/page.mobile.webp"),
  ]);
  assert.deepEqual(requests, [
    { url: "./assets/page.mobile.webp", signal: controller.signal },
  ]);
  assert.equal(decodes, 1);
  assert.notEqual(first, second, "atlas poses need independent UV settings");
  assert.equal(first.image, image);
  assert.equal(second.image, image);
  assert.equal(first.flipY, true, "match TextureLoader image orientation");
  assert.equal(first.version, 1, "texture is queued for GPU upload");
  first.dispose();
  second.dispose();
});

test("cancelling a superseded spread aborts its image request", async () => {
  const controller = new AbortController();
  let requestSignal: AbortSignal | undefined;
  let decodes = 0;
  const images = new PageImages(controller.signal, {
    fetch: ((_url, options) => {
      requestSignal = options?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener(
          "abort",
          () => reject(new DOMException("aborted", "AbortError")),
          { once: true },
        );
      });
    }) as typeof fetch,
    decode: async () => {
      decodes++;
      return {} as HTMLImageElement;
    },
  });
  const pending = images.texture("./assets/old-spread.webp");
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(requestSignal?.aborted, true);
  assert.equal(decodes, 0);
});

test("cancelling during image decode cannot produce a stale texture", async () => {
  const controller = new AbortController();
  let releaseDecode!: (image: HTMLImageElement) => void;
  const images = new PageImages(controller.signal, {
    fetch: (async () =>
      ({
        ok: true,
        blob: async () => new Blob(["image"]),
      }) as Response) as typeof fetch,
    decode: () =>
      new Promise<HTMLImageElement>((resolve) => {
        releaseDecode = resolve;
      }),
  });
  const pending = images.texture("./assets/old-spread.webp");
  await new Promise((resolve) => setImmediate(resolve));
  controller.abort();
  releaseDecode({ width: 200, height: 100 } as HTMLImageElement);
  await assert.rejects(pending, { name: "AbortError" });
});
