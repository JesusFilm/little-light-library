import type { StageDirection } from "./stage-direction-types";

/** Resolve the two legacy books' authored theatre shorthand to public media. */
export function stageAssetUrl(source: string): string {
  if (source.startsWith("assets/")) return `./${source}`;
  if (source.startsWith("./")) return source;
  if (source.startsWith("/")) return `.${source}`;
  const filename = /\.[a-z0-9]+$/i.test(source) ? source : `${source}.webp`;
  return `./assets/art/theatre/${filename}`;
}

/** Every image requested by a legacy spread, in display priority order. */
export function legacyStageImageSources(direction: StageDirection): string[] {
  return [
    direction.background,
    direction.ground,
    ...direction.actors.map((actor) =>
      actor.image ? actor.image : `assets/art/theatre/${actor.kind}-poses.webp`,
    ),
    ...(direction.props ?? []).map((prop) => prop.file),
    ...(direction.family
      ? [
          typeof direction.family === "object"
            ? direction.family.file
            : "family-seven.webp",
        ]
      : []),
    ...(direction.ark
      ? [typeof direction.ark === "object" ? direction.ark.file : "ark.webp"]
      : []),
    ...(direction.dove
      ? [
          typeof direction.dove === "object"
            ? direction.dove.file
            : "dove-olive.webp",
        ]
      : []),
    ...(direction.tree !== undefined ? ["assets/art/eden-tree.webp"] : []),
    ...(Array.isArray(direction.waves)
      ? direction.waves.map((wave) => wave.file)
      : direction.waves
        ? ["assets/books/jonah-and-the-whale/art/storm-wave-layer.webp"]
        : []),
  ];
}
