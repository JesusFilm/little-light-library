import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify, parseArgs } from "node:util";
import { bookSchema } from "../src/book-validation";
import type { AuthoredBook, BookAsset } from "../src/authored-book";
import { DEFAULT_BOOK_APPEARANCE } from "../src/book-cover";
import { parseCatalog } from "../src/book-catalog";
import {
  atomicJson,
  checkBook,
  defaultPublicRoot,
  loadBook,
  mediaBytes,
  measureWav,
  prototypeRoot,
} from "./book-files";

const execute = promisify(execFile);
export const help = `Local book authoring (run from the prototype directory):
  npm run book:create -- FILE --id SLUG --title TITLE --cover PUBLIC_RELATIVE_IMAGE [--locale en-US] [--attribution TEXT]
  npm run book:validate -- FILE [--strict]
  npm run book:register -- FILE [--catalog public/books/catalog.json] [--strict]
  npm run book:catalog -- [CATALOG] [--strict]
  npm run book:replace-audio -- FILE SPREAD SEGMENT PUBLIC_RELATIVE_WAV VOICE [--locale LOCALE]
  npm run book:schema

Media paths are relative to public/; --public-root DIR supports disposable v1 fixtures.
Create writes an unregistered v1 scaffold using supplied artwork; it never overwrites files or generates content.
Register validates the full catalog and media before appending; repeat registration is a no-op.
Catalog books require public-relative files, with no embedded media.
Missing/stale narration and editorial review are warnings; --strict fails on all warnings.
Validation checks image headers and measured audio, not visual, editorial, or listening quality.
MP3/Ogg measurement requires local ffmpeg; PCM WAV needs no additional tools.`;

function scaffold(
  id: string,
  title: string,
  locale: string,
  cover: string,
  attribution: string,
): AuthoredBook {
  return {
    format: "little-light-book",
    version: 1,
    id,
    title,
    locale,
    status: "draft",
    subtitle: "Draft — replace this subtitle.",
    source: "TODO: identify the biblical passage or other source.",
    retellingNote:
      "TODO: distinguish source quotations, retelling, and invented staging.",
    cover: "cover-art",
    appearance: { ...DEFAULT_BOOK_APPEARANCE },
    assets: { "cover-art": { kind: "image", src: cover, attribution } },
    spreads: [
      {
        id: "page-1",
        title: "Draft page",
        source: "TODO: identify the passage for this page.",
        stagingNote:
          "TODO: describe invented staging separately from the source; replace the provisional cover backdrop.",
        segments: [
          {
            id: "segment-1",
            text: "TODO: write the reviewed retelling for this page.",
          },
        ],
        backdrop: { asset: "cover-art" },
        elements: [],
      },
    ],
  };
}

function report(
  file: string,
  book: AuthoredBook,
  warnings: { path: string; message: string }[],
) {
  console.log(
    `Valid ${file}: ${book.id}, ${book.spreads.length} spreads, ${Object.keys(book.assets).length} assets.`,
  );
  for (const issue of warnings)
    console.warn(`WARNING ${file}${issue.path}: ${issue.message}`);
}

async function legacyChecks(publicRoot: string) {
  // Reuse the fixed books' schema, theatre, phrase-hash and measured audio checks.
  if (
    (await fs.realpath(publicRoot)) !== (await fs.realpath(defaultPublicRoot))
  )
    throw Error(
      "Legacy checks use the prototype's existing validators; run legacy catalog validation with the default public root.",
    );
  for (const [binary, args] of [
    [process.execPath, ["scripts/validate.mjs"]],
    [process.execPath, ["--import", "tsx", "scripts/validate-theatre.ts"]],
    ["python3", ["scripts/audio_verify.py"]],
  ] as const) {
    try {
      const result = await execute(binary, [...args], {
        cwd: prototypeRoot,
        maxBuffer: 2 * 1024 * 1024,
      });
      console.log(result.stdout.trim());
    } catch (error) {
      const result = error as Error & { stdout?: string; stderr?: string };
      throw Error(
        `Legacy content check failed: ${args.join(" ")}\n${result.stdout ?? ""}${result.stderr ?? ""}${result.message}`,
      );
    }
  }
}

export async function validateCatalog(
  input: unknown,
  catalogFile: string,
  publicRoot = defaultPublicRoot,
  strict = false,
  checkLegacy = legacyChecks,
) {
  const entries = parseCatalog(input);
  const booksRoot = await fs.realpath(path.dirname(catalogFile));
  const canonicalPublic = await fs.realpath(publicRoot);
  if (booksRoot !== path.join(canonicalPublic, "books"))
    throw Error(
      "Catalog must live in public/books for reader-relative book paths.",
    );
  for (const entry of entries) {
    if (!entry.path) continue;
    const file = await fs.realpath(path.resolve(booksRoot, entry.path));
    if (!file.startsWith(booksRoot + path.sep))
      throw Error(`Catalog path escapes books directory: ${entry.path}`);
    const { book } = await loadBook(file);
    if (book.id !== entry.id)
      throw Error(
        `${entry.path}: catalog ID '${entry.id}' does not match book.id '${book.id}'.`,
      );
    for (const [id, asset] of Object.entries(book.assets))
      if (asset.src.startsWith("data:"))
        throw Error(
          `${entry.path}/assets/${id}/src: committed catalog books require public-relative media files, not embedded data URIs.`,
        );
    const warnings = await checkBook(book, publicRoot, strict);
    report(entry.path, book, warnings);
  }
  if (entries.some((entry) => entry.legacyStory)) await checkLegacy(publicRoot);
  return entries;
}

export async function registerBook(
  file: string,
  catalogFile: string,
  publicRoot = defaultPublicRoot,
  strict = false,
) {
  const original = await fs.readFile(catalogFile, "utf8");
  const entries = parseCatalog(JSON.parse(original));
  const booksRoot = await fs.realpath(path.dirname(catalogFile));
  const canonicalFile = await fs.realpath(file);
  const relative = path
    .relative(booksRoot, canonicalFile)
    .split(path.sep)
    .join("/");
  const { book } = await loadBook(file);
  const candidate = { id: book.id, path: relative };
  parseCatalog([candidate]);
  if (!canonicalFile.startsWith(booksRoot + path.sep))
    throw Error(
      "Register a committed book file inside the catalog's books directory.",
    );
  const existing = entries.find(
    (entry) => entry.id === book.id || entry.path === relative,
  );
  if (existing && (existing.id !== book.id || existing.path !== relative))
    throw Error(
      `Catalog conflict for '${book.id}' / '${relative}'; existing entries were preserved.`,
    );
  const next = existing ? entries : [...entries, candidate];
  await validateCatalog(next, catalogFile, publicRoot, strict);
  if (existing) {
    console.log(`Already registered: ${book.id}. Catalog unchanged.`);
    return;
  }
  await atomicJson(catalogFile, next, original);
  console.log(
    `Registered ${book.id} as ${relative}. Review book, assets and catalog together before committing.`,
  );
}

export async function runBookCli(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      strict: { type: "boolean" },
      id: { type: "string" },
      title: { type: "string" },
      locale: { type: "string" },
      cover: { type: "string" },
      attribution: { type: "string" },
      catalog: { type: "string" },
      "public-root": { type: "string" },
    },
  });
  if (values.help || positionals.length === 0) {
    console.log(help);
    return;
  }
  const [command, file, spreadId, segmentId, recording, voice] = positionals;
  const publicRoot = path.resolve(values["public-root"] ?? defaultPublicRoot);
  const catalog = path.resolve(
    values.catalog ?? path.join(publicRoot, "books/catalog.json"),
  );
  const expected =
    command === "replace-audio"
      ? 6
      : command === "schema"
        ? 1
        : command === "catalog"
          ? file
            ? 2
            : 1
          : 2;
  if (positionals.length !== expected)
    throw Error(`Incorrect arguments.\n${help}`);
  if (command === "schema") {
    await atomicJson(
      path.join(prototypeRoot, "scripts/book.schema.json"),
      bookSchema,
    );
    return;
  }
  if (command === "catalog") {
    const target = file ? path.resolve(file) : catalog;
    const entries = await validateCatalog(
      JSON.parse(await fs.readFile(target, "utf8")),
      target,
      publicRoot,
      values.strict,
    );
    console.log(`Valid catalog: ${entries.length} entries.`);
    return;
  }
  if (!file) throw Error(help);
  if (command === "create") {
    if (
      !values.id ||
      !values.title ||
      !values.cover ||
      values.cover.startsWith("data:")
    )
      throw Error(
        "Create requires --id SLUG, --title TITLE and --cover PUBLIC_RELATIVE_IMAGE.",
      );
    const book = scaffold(
      values.id,
      values.title,
      values.locale ?? "en-US",
      values.cover,
      values.attribution ?? "TODO: add artwork source, rights and attribution.",
    );
    const warnings = await checkBook(book, publicRoot, values.strict);
    await fs.mkdir(path.dirname(path.resolve(file)), { recursive: true });
    await fs.writeFile(file, JSON.stringify(book, null, 2) + "\n", {
      flag: "wx",
    });
    report(file, book, warnings);
    console.log(
      "Created an unregistered scaffold. Replace TODO fields and provisional backdrop before inclusion.",
    );
    return;
  }
  if (command === "register") {
    await registerBook(file, catalog, publicRoot, values.strict);
    return;
  }
  if (command !== "validate" && command !== "replace-audio")
    throw Error(`Unknown command: ${command}\n${help}`);
  const { book, original } = await loadBook(file);
  if (command === "replace-audio") {
    const locale = values.locale ?? book.locale;
    const pages =
      locale === book.locale
        ? book.spreads
        : book.translations?.[locale]?.spreads;
    const segment = pages
      ?.find((spread) => spread.id === spreadId)
      ?.segments.find((cue) => cue.id === segmentId);
    if (!segment)
      throw Error(
        `Unknown locale/spread/segment: ${locale}/${spreadId}/${segmentId}`,
      );
    const base = `${spreadId}-${segmentId}-recording`.slice(0, 56);
    let id = base;
    for (let n = 2; Object.hasOwn(book.assets, id); n++) id = `${base}-${n}`;
    const asset: BookAsset = {
      kind: "audio",
      src: recording,
      attribution:
        "Creator-supplied recording; creator must provide appropriate attribution.",
    };
    book.assets[id] = asset;
    segment.narration = {
      asset: id,
      recordedText: segment.text,
      duration: measureWav(await mediaBytes(asset, publicRoot)),
      voice,
    };
  }
  const warnings = await checkBook(book, publicRoot, values.strict);
  if (command === "replace-audio") {
    await atomicJson(file, book, original);
    console.log(
      `Replaced only ${spreadId}/${segmentId}; existing assets and other cues preserved.`,
    );
  }
  report(file, book, warnings);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runBookCli(process.argv.slice(2)).catch((error) => {
    console.error(String(error));
    process.exitCode = 1;
  });
}
