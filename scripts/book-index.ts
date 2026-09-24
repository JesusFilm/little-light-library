import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AuthoredBook, BookSegment } from "../src/authored-book";
import { stageDirections } from "../src/stage-direction";

const prototypeRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicRoot = path.join(prototypeRoot, "public");
const indexRoot = path.join(prototypeRoot, "docs", "books");
const readJson = async <T>(file: string) =>
  JSON.parse(await fs.readFile(file, "utf8")) as T;
const link = (target: string, label = target) => {
  const relative = path
    .relative(indexRoot, path.join(prototypeRoot, target))
    .split(path.sep)
    .join("/");
  return `[${label}](${relative})`;
};
const mediaLink = (src: string) => link(`public/${src}`, src);
const legacyAssetPath = (source: string) => {
  if (source.startsWith("assets/")) return source;
  if (source.startsWith("./assets/")) return source.slice(2);
  if (source.startsWith("/assets/")) return source.slice(1);
  const file = /\.[a-z0-9]+$/i.test(source) ? source : `${source}.webp`;
  return `assets/art/theatre/${file}`;
};
const legacySpecialProp = (
  value: true | import("../src/stage-direction-types").StageProp,
  fallback: import("../src/stage-direction-types").StageProp,
) => (value === true ? fallback : value);
const listFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs
    .readdir(directory, { withFileTypes: true })
    .catch(() => []);
  const children = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory()
        ? listFiles(absolute)
        : [path.relative(prototypeRoot, absolute).split(path.sep).join("/")];
    }),
  );
  return children.flat().sort();
};
const locales = (await fs.readdir(path.join(publicRoot, "content")))
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.replace(/\.json$/, ""))
  .sort();
const english = await readJson<{ stories: LegacyStory[] }>(
  path.join(publicRoot, "content", "en-US.json"),
);
const audioManifest = await readJson<
  Record<string, { src: string; duration: number }>
>(path.join(publicRoot, "audio-manifest.json"));
const catalog = await readJson<CatalogEntry[]>(
  path.join(publicRoot, "books", "catalog.json"),
);
type CatalogEntry =
  | { id: string; legacyStory: "eden" | "noah" }
  | { id: string; path: string };
type LegacyPage = {
  id: string;
  title: string;
  passage: string;
  image: string;
  segments: { id: string; text: string }[];
};
type LegacyStory = {
  id: string;
  title: string;
  subtitle: string;
  pages: LegacyPage[];
};

const legacyStagePage = (page: LegacyPage) => {
  const stage = stageDirections[page.id];
  if (!stage)
    return `No page-specific stage direction is registered for \`${page.id}\`.`;
  const lines = [
    `- Painted backdrop: ${mediaLink(legacyAssetPath(stage.background))}`,
    `- Full-page ground print: ${mediaLink(legacyAssetPath(stage.ground))}`,
    ...stage.actors.map((actor) => {
      const image = actor.image
        ? legacyAssetPath(actor.image)
        : `assets/art/theatre/${actor.kind}-poses.webp`;
      const pose = actor.pose === undefined ? "" : `pose ${actor.pose}, `;
      const width =
        actor.width === undefined ? "" : `, visible width ${actor.width}`;
      const motion = actor.motion
        ? `, ${actor.motion.kind} motion (${actor.motion.strength}${actor.motion.kind === "sway" ? "°" : " page units"}, ${actor.motion.periodSeconds ?? 3.4}s cycle)`
        : "";
      return `- ${actor.kind} actor: ${pose}mood \`${actor.mood}\`, position (${actor.x}, ${actor.depth})${width}${actor.flipX ? ", mirrored horizontally" : ""}${motion}; artwork ${mediaLink(image)}.`;
    }),
    ...(stage.props ?? []).map(
      (prop) =>
        `- ${prop.file} prop: visible width ${prop.width}, position (${prop.x}, ${prop.depth})${prop.flipX ? ", mirrored horizontally" : ""}${prop.motion ? `, ${prop.motion.kind} motion (${prop.motion.strength}${prop.motion.kind === "sway" ? "°" : " page units"}, ${prop.motion.periodSeconds ?? 3.4}s cycle)` : ""}; artwork ${mediaLink(legacyAssetPath(prop.file))}.`,
    ),
  ];
  const addSpecialProp = (
    label: string,
    value: boolean | import("../src/stage-direction-types").StageProp,
    fallback: import("../src/stage-direction-types").StageProp,
  ) => {
    if (!value) return;
    const prop = legacySpecialProp(value, fallback);
    lines.push(
      `- ${label}: visible width ${prop.width}, position (${prop.x}, ${prop.depth}); artwork ${mediaLink(legacyAssetPath(prop.file))}.`,
    );
  };
  addSpecialProp("floating ark", stage.ark, {
    file: "ark.webp",
    width: 4.4,
    x: 0.15,
    depth: 0.35,
  });
  addSpecialProp("family group", stage.family, {
    file: "family-seven.webp",
    width: 3.25,
    x: 0.75,
    depth: -0.05,
  });
  addSpecialProp("dove", stage.dove, {
    file: "dove-olive.webp",
    width: 1.15,
    x: 1.45,
    depth: 0.55,
    creature: "dove",
  });
  const flags = [
    stage.tree !== undefined ? `tree at ${stage.tree}` : "",
    stage.waves
      ? Array.isArray(stage.waves)
        ? `${stage.waves.length} independently layered animated waves`
        : `${typeof stage.waves === "number" ? stage.waves : 2} animated waves`
      : "",
    stage.interior ? "ark interior" : "",
    stage.rainbow ? "rainbow" : "",
  ].filter(Boolean);
  if (Array.isArray(stage.waves))
    lines.push(
      ...stage.waves.map(
        (wave, index) =>
          `- Wave layer ${index + 1}: visible width ${wave.width}, depth ${wave.depth}${wave.motion ? `, phase ${wave.motion.phaseRadians ?? 0} rad` : ""}; artwork ${mediaLink(legacyAssetPath(wave.file))}.`,
      ),
    );
  else if (stage.waves)
    lines.push(
      `- Wave layers use ${mediaLink("assets/books/jonah-and-the-whale/art/storm-wave-layer.webp")} with distinct depth and phase offsets.`,
    );
  if (stage.tree !== undefined)
    lines.push(
      `- Eden tree cutout: ${mediaLink("assets/art/eden-tree.webp")}.`,
    );
  if (flags.length) lines.push(`- Scene elements: ${flags.join(", ")}.`);
  return lines.join("\n");
};

const legacyIndex = async (id: "eden" | "noah") => {
  const story = english.stories.find(({ id: storyId }) => storyId === id);
  if (!story) throw Error(`Missing ${id} in en-US content.`);
  const assetBookId = id === "noah" ? "noah-and-the-great-flood" : id;
  const sourceArtFiles = await listFiles(
    path.join(prototypeRoot, "assets", "books", assetBookId),
  );
  const bookRuntimeFiles = await listFiles(
    path.join(publicRoot, "assets", "books", assetBookId),
  );
  const lines = [
    `# ${story.title}`,
    "",
    `Generated per-book review index. Source text stays in locale files; page staging stays in TypeScript. Regenerate with \`npm run book:index\`.`,
    "",
    "## Source files",
    "",
    `- Shelf entry and palette: ${link("public/books/catalog.json")}`,
    `- Base story, title, and page text: ${link("public/content/en-US.json")}`,
    `- Localized titles and page text: ${locales.map((locale) => link(`public/content/${locale}.json`, locale)).join(", ")}`,
    `- Measured narration manifest: ${link("public/audio-manifest.json")}`,
    `- Shared page staging contract and composition: ${link("src/stage-direction.ts")}, ${link(`src/${id}-stage-direction.ts`)}, ${link("src/stage-direction-types.ts")}`,
    `- Shared stage surfaces and alpha-aware cutout geometry: ${link("src/garden-floor.ts")}, ${link("src/stage-prop-geometry.ts")}, ${link("src/alpha-bounds.ts")}`,
    `- Shared legacy scene renderer and motion: ${link("src/scene.ts")}, ${link("src/stage-motion.ts")}`,
    `- Shared actor transitions: ${link("src/paper-actor.ts")}`,
    `- Shared narration transport and page-range audio: ${link("src/book-reader-audio.ts")}, ${link("src/book-audio.ts")}`,
    `- Shared room ambience: ${link("src/soundscape.ts")}`,
    "",
    `The cover artwork begins with page one, ${mediaLink(story.pages[0].image)}. Eden and Noah retain their established localized voice and character rigs.`,
    "",
    `- Book-specific art notes and source inventory: ${
      sourceArtFiles
        .filter((file) => file.endsWith("README.md"))
        .map((file) => link(file))
        .join(", ") || "none"
    }.`,
    `- Editable source art and prompts: ${
      sourceArtFiles
        .filter((file) => !file.endsWith("README.md"))
        .map((file) => link(file))
        .join(", ") || "none"
    }.`,
    `- Book-local runtime art: ${bookRuntimeFiles.map((file) => mediaLink(file.replace(/^public\//, ""))).join(", ") || "shared theatre paths listed per page"}.`,
    "",
    "## Page sequence, text, art, and scene direction",
    "",
  ];
  for (const [index, page] of story.pages.entries()) {
    lines.push(
      `### ${String(index + 1).padStart(2, "0")}. ${page.title} (\`${page.id}\`)`,
      "",
      `**Passage:** ${page.passage}`,
      "",
      `**Page art:** ${mediaLink(page.image)}`,
      "",
      "**Read-aloud text (en-US):**",
      "",
      ...page.segments.map((segment) => `- \`${segment.id}\`: ${segment.text}`),
      "",
      "**Scene write-up and animation:**",
      "",
      legacyStagePage(page),
      "",
    );
  }
  lines.push(
    "## Narration files by locale",
    "",
    "The audio manifest records the measured duration for every file. Keys follow `locale/book/page/segment`; visible words are in the linked locale JSON above.",
    "",
  );
  for (const locale of locales) {
    const cues = Object.entries(audioManifest)
      .filter(([key]) => key.startsWith(`${locale}/${id}/`))
      .sort(([a], [b]) => a.localeCompare(b));
    lines.push(`### ${locale} (${cues.length} cues)`, "");
    lines.push(
      ...cues.map(
        ([key, cue]) =>
          `- \`${key}\` — ${mediaLink(cue.src)} (${cue.duration.toFixed(2)} s)`,
      ),
      "",
    );
  }
  return lines.join("\n");
};

const segmentText = (segments: BookSegment[]) =>
  segments.map((segment) => `- \`${segment.id}\`: ${segment.text}`);

const authoredIndex = async (
  catalogEntry: Extract<CatalogEntry, { path: string }>,
) => {
  const book = await readJson<AuthoredBook>(
    path.join(publicRoot, "books", catalogEntry.path),
  );
  const lines = [
    `# ${book.title}`,
    "",
    `Generated per-book review index. Edit the book JSON and media sources, then regenerate with \`npm run book:index\`. This file is a discovery aid and contains no parallel authored source.`,
    "",
    "## Book record",
    "",
    `- Shelf entry: ${link("public/books/catalog.json")}`,
    `- Authoritative book text, stage notes, asset registry, audio, and motion: ${link(`public/books/${catalogEntry.path}`)}`,
    `- Shared page renderer and character transitions: ${link("src/authored-stage.ts")}`,
    `- Shared card motion presets: ${link("src/book-animation.ts")}`,
    `- Shared narration and soundtrack orchestration: ${link("src/book-reader-audio.ts")}, ${link("src/book-audio.ts")}`,
    `- Source passage: ${book.source}`,
    `- Retelling note: ${book.retellingNote}`,
    `- Source locale: ${book.locale}`,
    `- Release locales: ${(book.languages ?? [book.locale]).join(", ")}`,
    `- Cover palette: cover \`${book.appearance?.coverColor ?? "default"}\`, spine \`${book.appearance?.spineColor ?? "default"}\`, accent \`${book.appearance?.accentColor ?? "default"}\`.`,
    "",
    "## Reading order and page scene write-ups",
    "",
  ];
  for (const [index, spread] of book.spreads.entries()) {
    lines.push(
      `### ${String(index + 1).padStart(2, "0")}. ${spread.title} (\`${spread.id}\`)`,
      "",
      `**Source:** ${spread.source}`,
      "",
      `**Staging note:** ${spread.stagingNote}`,
      "",
      "**Text (source locale):**",
      "",
      ...segmentText(spread.segments),
      "",
      `**Backdrop:** ${mediaLink(book.assets[spread.backdrop.asset].src)}`,
    );
    if (spread.ground)
      lines.push(
        `**Ground print:** ${mediaLink(book.assets[spread.ground.asset].src)}`,
      );
    lines.push("", "**Characters, props, and motion:**", "");
    if (!spread.elements.length) lines.push("- No separate stage elements.");
    for (const element of spread.elements) {
      const motion = element.motion
        ? `; ${element.motion.preset} motion on ${element.motion.trigger}${element.motion.segment ? ` at segment \`${element.motion.segment}\`` : ""}, ${element.motion.loop ? "loops" : "plays once"}`
        : "; static pose";
      const interaction = element.interaction
        ? `; interaction: “${element.interaction.label}” → “${element.interaction.response}”`
        : "";
      lines.push(
        `- ${element.kind} \`${element.id}\` (${element.label}): ${mediaLink(book.assets[element.asset].src)}${motion}${interaction}.`,
      );
    }
    lines.push("", "**Narration:**", "");
    for (const segment of spread.segments) {
      if (!segment.narration) {
        lines.push(`- \`${segment.id}\`: recording not present.`);
        continue;
      }
      const cue = segment.narration;
      const current = cue.recordedText === segment.text ? "current" : "stale";
      lines.push(
        `- \`${segment.id}\`: ${mediaLink(book.assets[cue.asset].src)} (${cue.duration.toFixed(2)} s, ${cue.voice}, ${current}).`,
      );
    }
    const pageSoundtracks = (book.soundtracks ?? []).filter(
      (track) =>
        book.spreads.findIndex(({ id }) => id === track.startPage) <= index &&
        book.spreads.findIndex(({ id }) => id === track.endPage) >= index,
    );
    if (pageSoundtracks.length) {
      lines.push("", "**Soundtracks spanning this page:**", "");
      lines.push(
        ...pageSoundtracks.map(
          (track) =>
            `- \`${track.id}\` ${track.loop ? "loops" : "plays once"} from \`${track.startPage}\` to \`${track.endPage}\`, with ${track.fadeIn}s fade in and ${track.fadeOut}s fade out: ${mediaLink(book.assets[track.asset].src)}.`,
        ),
      );
    }
    lines.push("");
  }
  lines.push(
    "## Localized text and voice files",
    "",
    "Source-language text is shown in the page sections above. Every translation and its matching recorded text lives in the authoritative JSON. Audio links below resolve through that book's asset registry.",
    "",
  );
  for (const locale of [
    book.locale,
    ...Object.keys(book.translations ?? {}).sort(),
  ]) {
    const translation = book.translations?.[locale];
    const localizedTitle = translation?.title ?? book.title;
    lines.push(
      `### ${locale}: ${localizedTitle}`,
      "",
      `Subtitle: ${translation?.subtitle ?? book.subtitle}`,
      "",
      `Book source: ${translation?.source ?? book.source}`,
      "",
      `Retelling note: ${translation?.retellingNote ?? book.retellingNote}`,
      "",
    );
    for (const spread of book.spreads) {
      const localized = translation?.spreads.find(({ id }) => id === spread.id);
      lines.push(
        `**${localized?.title ?? spread.title}** (\`${spread.id}\`)`,
        "",
        `Source: ${localized?.source ?? spread.source}`,
      );
      lines.push("");
      lines.push(...segmentText(localized?.segments ?? spread.segments), "");
      for (const segment of localized?.segments ?? spread.segments)
        if (segment.narration)
          lines.push(
            `- Voice file for \`${segment.id}\`: ${mediaLink(book.assets[segment.narration.asset].src)} (${segment.narration.duration.toFixed(2)} s, ${segment.narration.voice}).`,
          );
      lines.push("");
    }
  }
  lines.push(
    "## Registered assets",
    "",
    "Each runtime path is public-root-relative in the book JSON. This table includes reused images as well as page art and recorded audio.",
    "",
    "| Asset ID | Kind | Runtime file | Attribution |",
    "| --- | --- | --- | --- |",
    ...Object.entries(book.assets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([id, asset]) =>
          `| \`${id}\` | ${asset.kind} | ${mediaLink(asset.src)} | ${asset.attribution.replaceAll("|", "\\|")} |`,
      ),
    "",
  );
  const originalSources = await listFiles(
    path.join(prototypeRoot, "assets", "books", book.id),
  );
  if (originalSources.length)
    lines.push(
      "## Original art, prompts, and source tools",
      "",
      "Editable artwork, useful prompts, and generation/source tools are kept outside `public/`; the registered files above are their runtime derivatives.",
      "",
      ...originalSources.map((file) => `- ${link(file, file)}`),
      "",
    );
  return lines.join("\n");
};

const summaries: string[] = [];
const outputs = new Map<string, string>();
for (const entry of catalog) {
  const contents =
    "legacyStory" in entry
      ? await legacyIndex(entry.legacyStory)
      : await authoredIndex(entry);
  const file = path.join(indexRoot, `${entry.id}.md`);
  outputs.set(file, `${contents.trimEnd()}\n`);
  const title =
    "legacyStory" in entry
      ? english.stories.find(({ id }) => id === entry.id)!.title
      : (
          await readJson<AuthoredBook>(
            path.join(publicRoot, "books", entry.path),
          )
        ).title;
  summaries.push(
    `- ${link(`docs/books/${entry.id}.md`, title)} — \`${entry.id}\`.`,
  );
}
const readme = [
  "# Little Light book index",
  "",
  "Generated from the committed shelf records and content files with `npm run book:index`. Edit each book's source files; do not edit these indexes by hand.",
  "",
  ...summaries,
  "",
  "The per-book index points to the authoritative text, artwork, narration, soundtrack, scene directions, and animation code used by the reader.",
  "",
].join("\n");
outputs.set(path.join(indexRoot, "README.md"), readme);
if (process.argv.includes("--check")) {
  const stale = [];
  for (const [file, expected] of outputs) {
    const actual = await fs.readFile(file, "utf8").catch(() => "");
    if (actual !== expected) stale.push(path.relative(prototypeRoot, file));
  }
  if (stale.length)
    throw Error(
      `Generated book indexes are stale: ${stale.join(", ")}. Run npm run book:index.`,
    );
  console.log(`Checked ${catalog.length} current per-book indexes.`);
} else {
  await fs.mkdir(indexRoot, { recursive: true });
  await Promise.all(
    [...outputs].map(([file, contents]) => fs.writeFile(file, contents)),
  );
  console.log(`Wrote ${catalog.length} per-book indexes to docs/books/.`);
}
