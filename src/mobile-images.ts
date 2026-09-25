/** Use bounded WebP derivatives on narrow screens without changing asset IDs. */
import { mobileImages, shelfCovers } from "./generated-media";

const assetKey = (src: string) => src.replace(/^\.?\//, "");

export function mobileImageUrl(src: string): string {
  if (
    typeof window === "undefined" ||
    !window.matchMedia?.("(max-width: 900px)").matches ||
    !mobileImages.has(assetKey(src)) ||
    !/\.(?:png|webp)$/i.test(src)
  )
    return src;
  return src.replace(/\.(?:png|webp)$/i, ".mobile.webp");
}

/** Every shelf book has a 256 px source cover for its titled canvas. */
export function shelfCoverUrl(src: string): string {
  if (!shelfCovers.has(assetKey(src))) return src;
  return src.replace(/\.(?:png|webp)$/i, ".cover.webp");
}
