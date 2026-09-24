/** Local Kokoro Voice Lab client. No reader proxy, paid provider or credentials. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import type { AuthoredBook } from "../src/authored-book";
import { translationIssues } from "../src/book-localization";
import {
  atomicJson,
  checkBook,
  defaultPublicRoot,
  issuesText,
  loadBook,
  measureWav,
  mediaBytes,
} from "./book-files";

export const narrationHelp = `Local narration for existing v1 book text:
  npm run book:narrate -- FILE [--dry-run] [--locale en-US]
    [--voice af_heart] [--speed 1] [--spread ID] [--segment ID] [--force]
    [--server http://127.0.0.1:8770] [--public-root DIR]

Start projects/kokoro-voice-lab/server.py separately; this tool never starts or installs models.
Dry run validates local media and lists affected cues without network calls or writes.
Only one existing locale is processed; no translations or story text are created.
Current text/voice/speed recordings are skipped; --force explicitly regenerates selected cues.
Each completed cue is measured from PCM frames and saved atomically, so interrupted batches resume.
New files live under public/assets/books/BOOK_ID/audio/LOCALE/. Old assets and review records are preserved.
Listen to every replacement in the reader; generation does not confer editorial or listening approval.`;

const languages: Record<string, [string, string]> = {
  "en-US": ["a", "af_heart"],
  "en-GB": ["b", "bf_emma"],
  es: ["e", "ef_dora"],
  fr: ["f", "ff_siwis"],
  hi: ["h", "hf_alpha"],
  it: ["i", "if_sara"],
  ja: ["j", "jf_alpha"],
  "pt-BR": ["p", "pf_dora"],
  "zh-CN": ["z", "zf_xiaoxiao"],
};
export interface NarrationOptions {
  locale?: string;
  voice?: string;
  speed?: number;
  spread?: string;
  segment?: string;
  force?: boolean;
  dryRun?: boolean;
  server?: string;
  publicRoot?: string;
  signal?: AbortSignal;
}

export function narrationPlan(book: AuthoredBook, options: NarrationOptions) {
  const locale = options.locale ?? book.locale;
  const language = languages[locale];
  if (!language)
    throw Error(
      `No local Kokoro voice mapping for '${locale}'; supply recorded WAV using book:replace-audio.`,
    );
  const issues = translationIssues(book, locale);
  if (issues.length) throw Error(issuesText(issues));
  const voice =
    options.voice ?? book.narrationSettings?.[locale]?.voice ?? language[1];
  const speed = options.speed ?? book.narrationSettings?.[locale]?.speed ?? 1;
  if (!new RegExp(`^${language[0]}[fm]_[a-z0-9_]+$`).test(voice))
    throw Error(`Voice '${voice}' does not match ${locale}.`);
  if (!Number.isFinite(speed) || speed < 0.5 || speed > 2)
    throw Error("Speed must be between 0.5 and 2.");
  if (options.segment && !options.spread)
    throw Error("--segment requires --spread to identify a single cue.");
  const pages =
    locale === book.locale ? book.spreads : book.translations![locale].spreads;
  if (options.spread && !pages.some((page) => page.id === options.spread))
    throw Error(`Unknown spread '${options.spread}'.`);
  if (
    options.segment &&
    !pages
      .find((page) => page.id === options.spread)
      ?.segments.some((cue) => cue.id === options.segment)
  )
    throw Error(`Unknown segment '${options.segment}'.`);
  const provenance = `Kokoro ${voice} · ${speed}×`;
  const selected = pages
    .filter((page) => !options.spread || page.id === options.spread)
    .flatMap((page) =>
      page.segments
        .filter((cue) => !options.segment || cue.id === options.segment)
        .map((cue) => ({ page, cue })),
    );
  const jobs = selected.filter(
    ({ cue }) =>
      options.force ||
      cue.narration?.recordedText !== cue.text ||
      (cue.narration.voice !== provenance &&
        !(speed === 1 && cue.narration.voice === voice)),
  );
  for (const { cue } of jobs)
    if (!cue.text.trim()) throw Error(`Empty narration text: ${cue.id}`);
  return {
    locale,
    voice,
    speed,
    provenance,
    jobs,
    skipped: selected.length - jobs.length,
  };
}

export function localServer(value = "http://127.0.0.1:8770") {
  const url = new URL(value);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw Error(
      "Kokoro server must be a plain loopback HTTP origin (for example http://127.0.0.1:8770).",
    );
  return url.origin;
}

async function request(
  server: string,
  endpoint: string,
  signal: AbortSignal | undefined,
  init?: RequestInit,
) {
  let response: Response;
  try {
    response = await fetch(`${server}/api/${endpoint}`, {
      ...init,
      redirect: "error",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(180000)])
        : AbortSignal.timeout(180000),
    });
  } catch (error) {
    throw Error(
      `Local Kokoro request failed; start the Voice Lab and wait until ready. ${String(error)}`,
    );
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw Error(
      `Local Kokoro HTTP ${response.status}; wait until the Voice Lab is ready. Completed cues were preserved.`,
    );
  }
  return response;
}

async function boundedAudio(response: Response) {
  if (!response.headers.get("content-type")?.startsWith("audio/")) {
    await response.body?.cancel();
    throw Error("Kokoro did not return audio.");
  }
  const limit = 32 * 1024 * 1024;
  if (Number(response.headers.get("content-length")) > limit) {
    await response.body?.cancel();
    throw Error("Recording exceeds 32 MiB.");
  }
  const reader = response.body?.getReader();
  if (!reader) throw Error("Kokoro returned no recording.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw Error("Recording exceeds 32 MiB.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, size);
}

async function audioDirectory(publicRoot: string, relative: string) {
  const root = await fs.realpath(publicRoot);
  let directory = root;
  for (const component of relative.split("/")) {
    directory = path.join(directory, component);
    await fs.mkdir(directory).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
    });
    const stat = await fs.lstat(directory);
    if (stat.isSymbolicLink() || !stat.isDirectory())
      throw Error(
        `Audio output directory must not contain symbolic links: ${directory}`,
      );
  }
  return directory;
}

export async function narrateBook(
  file: string,
  options: NarrationOptions = {},
) {
  const publicRoot = path.resolve(options.publicRoot ?? defaultPublicRoot);
  const server = localServer(options.server);
  let { book, original } = await loadBook(file);
  const plan = narrationPlan(book, options);
  await checkBook(book, publicRoot);
  console.log(
    `${plan.locale}: ${plan.jobs.length} cues need narration; ${plan.skipped} current cues skipped (${plan.voice}, ${plan.speed}×).`,
  );
  for (const { page, cue } of plan.jobs) console.log(`  ${page.id}/${cue.id}`);
  if (options.dryRun || !plan.jobs.length)
    return { generated: 0, planned: plan.jobs.length, skipped: plan.skipped };
  options.signal?.throwIfAborted();
  const voicesResponse = await request(server, "voices", options.signal);
  if (
    !voicesResponse.headers.get("content-type")?.includes("application/json")
  ) {
    await voicesResponse.body?.cancel();
    throw Error("Kokoro did not return a JSON voice list.");
  }
  const voices = (await voicesResponse.json()).voices;
  if (
    !Array.isArray(voices) ||
    !voices.every((voice) => typeof voice === "string") ||
    !voices.includes(plan.voice)
  )
    throw Error(
      `Voice '${plan.voice}' is unavailable in the running Voice Lab.`,
    );
  let total = 0;
  for (const asset of Object.values(book.assets))
    total += (await mediaBytes(asset, publicRoot)).length;
  let generated = 0;
  for (const { page, cue } of plan.jobs) {
    options.signal?.throwIfAborted();
    if ((await fs.readFile(file, "utf8")) !== original)
      throw Error(
        "Book changed while narrating; reload and retry. Completed cues were preserved.",
      );
    if (Object.keys(book.assets).length >= 1024)
      throw Error(
        "Book has 1,024 assets; review unused media before continuing. Completed cues were preserved.",
      );
    const audio = await boundedAudio(
      await request(server, "synthesize", options.signal, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cue.text,
          voice: plan.voice,
          speed: plan.speed,
        }),
      }),
    );
    const duration = measureWav(audio);
    if (duration < 0.05 || duration > 180)
      throw Error("Recording must measure 0.05–180 seconds.");
    if (total + audio.length > 96 * 1024 * 1024)
      throw Error(
        "Book exceeds 96 MiB decoded media; completed cues were preserved.",
      );
    options.signal?.throwIfAborted();
    const digest = createHash("sha256")
      .update(
        JSON.stringify([
          plan.locale,
          page.id,
          cue.id,
          cue.text,
          plan.voice,
          plan.speed,
        ]),
      )
      .update(audio)
      .digest("hex")
      .slice(0, 20);
    const relative = `assets/books/${book.id}/audio/${plan.locale}`;
    const directory = await audioDirectory(publicRoot, relative);
    const filename = `${page.id.slice(0, 32)}-${cue.id.slice(0, 32)}-${digest}.wav`;
    const output = path.join(directory, filename);
    try {
      await fs.writeFile(output, audio, { flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (
        (await fs.lstat(output)).isSymbolicLink() ||
        !(await fs.readFile(output)).equals(audio)
      )
        throw Error(`Refusing to overwrite existing audio: ${output}`);
    }
    const next = structuredClone(book);
    let assetId = `narration-${digest}`;
    for (let i = 2; Object.hasOwn(next.assets, assetId); i++)
      assetId = `narration-${digest}-${i}`;
    next.assets[assetId] = {
      kind: "audio",
      src: `${relative}/${filename}`,
      attribution: `Generated locally with ${plan.provenance}; Kokoro-82M (Apache-2.0).`,
    };
    const pages =
      plan.locale === next.locale
        ? next.spreads
        : next.translations![plan.locale].spreads;
    pages
      .find((item) => item.id === page.id)!
      .segments.find((item) => item.id === cue.id)!.narration = {
      asset: assetId,
      recordedText: cue.text,
      duration,
      voice: plan.provenance,
    };
    (next.narrationSettings ??= {})[plan.locale] = {
      voice: plan.voice,
      speed: plan.speed,
    };
    await checkBook(next, publicRoot);
    await atomicJson(file, next, original);
    book = next;
    original = JSON.stringify(book, null, 2) + "\n";
    total += audio.length;
    generated++;
    console.log(
      `Saved ${page.id}/${cue.id}: ${duration.toFixed(4)} s. Listen and review in the reader.`,
    );
  }
  return { generated, planned: plan.jobs.length, skipped: plan.skipped };
}

export async function runNarrationCli(args: string[], signal?: AbortSignal) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      "dry-run": { type: "boolean" },
      force: { type: "boolean" },
      locale: { type: "string" },
      voice: { type: "string" },
      speed: { type: "string" },
      spread: { type: "string" },
      segment: { type: "string" },
      server: { type: "string" },
      "public-root": { type: "string" },
    },
  });
  if (values.help) {
    console.log(narrationHelp);
    return;
  }
  if (positionals.length !== 1) throw Error(narrationHelp);
  return narrateBook(positionals[0], {
    locale: values.locale,
    voice: values.voice,
    speed: values.speed === undefined ? undefined : Number(values.speed),
    spread: values.spread,
    segment: values.segment,
    server: values.server,
    publicRoot: values["public-root"],
    force: values.force,
    dryRun: values["dry-run"],
    signal,
  });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const controller = new AbortController();
  const cancel = () =>
    controller.abort(
      Error("Narration cancelled; completed cues were preserved."),
    );
  process.once("SIGINT", cancel);
  process.once("SIGTERM", cancel);
  runNarrationCli(process.argv.slice(2), controller.signal)
    .catch((error) => {
      console.error(String(error));
      process.exitCode = 1;
    })
    .finally(() => {
      process.removeListener("SIGINT", cancel);
      process.removeListener("SIGTERM", cancel);
    });
}
