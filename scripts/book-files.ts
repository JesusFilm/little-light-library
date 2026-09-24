/** Node-only authoring helpers; not part of the hosted reader. */
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  safeAssetSource,
  validateBook,
  validateBookAssets,
} from "../src/book-validation";
import type { AuthoredBook, BookAsset, BookIssue } from "../src/authored-book";

export const prototypeRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const defaultPublicRoot = path.join(prototypeRoot, "public");
const execute = promisify(execFile);
const assetLimit = 32 * 1024 * 1024;
export const issuesText = (issues: BookIssue[]) =>
  issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n");

export async function loadBook(file: string) {
  const original = await fs.readFile(file, "utf8");
  const result = validateBook(JSON.parse(original));
  if (!result.book) throw Error(`${file}\n${issuesText(result.errors)}`);
  return { book: result.book, original };
}

export async function mediaBytes(
  asset: BookAsset,
  publicRoot = defaultPublicRoot,
) {
  if (!safeAssetSource(asset.src, asset.kind))
    throw Error("Unsafe public-relative asset path or unsupported data URI");
  let buffer: Buffer;
  if (asset.src.startsWith("data:")) {
    if (asset.src.length > (assetLimit * 4) / 3 + 128)
      throw Error("Asset exceeds 32 MiB");
    buffer = Buffer.from(asset.src.slice(asset.src.indexOf(",") + 1), "base64");
  } else {
    const root = await fs.realpath(publicRoot);
    const file = await fs.realpath(path.join(root, asset.src));
    if (!file.startsWith(root + path.sep))
      throw Error("Asset escapes public root (including symbolic links)");
    const stat = await fs.stat(file);
    if (!stat.isFile() || stat.size > assetLimit)
      throw Error("Asset is not a file or exceeds 32 MiB");
    buffer = await fs.readFile(file);
  }
  if (buffer.length > assetLimit) throw Error("Asset exceeds 32 MiB");
  return buffer;
}

export function measureWav(buffer: Buffer) {
  if (
    buffer.length < 12 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE"
  )
    throw Error("Recording must be a PCM WAV file.");
  const end = buffer.readUInt32LE(4) + 8;
  if (end !== buffer.length)
    throw Error("Truncated or inconsistent WAV RIFF length");
  let rate = 0,
    block = 0,
    length = 0,
    position = 12;
  for (; position + 8 <= end; ) {
    const kind = buffer.toString("ascii", position, position + 4);
    const size = buffer.readUInt32LE(position + 4);
    const start = position + 8;
    if (start + size + (size % 2) > end) throw Error("Truncated WAV chunk");
    if (kind === "fmt ") {
      if (rate || size < 16 || buffer.readUInt16LE(start) !== 1)
        throw Error("Only a single PCM WAV format chunk is supported");
      const channels = buffer.readUInt16LE(start + 2);
      const sampleRate = buffer.readUInt32LE(start + 4);
      rate = buffer.readUInt32LE(start + 8);
      block = buffer.readUInt16LE(start + 12);
      const bits = buffer.readUInt16LE(start + 14);
      if (
        !channels ||
        !sampleRate ||
        ![8, 16, 24, 32].includes(bits) ||
        block !== (channels * bits) / 8 ||
        rate !== sampleRate * block
      )
        throw Error("Invalid PCM WAV sample rate, channels or frame size");
    }
    if (kind === "data") {
      if (!block || size % block)
        throw Error("WAV data does not contain complete PCM frames");
      length += size;
    }
    position = start + size + (size % 2);
  }
  if (position !== end || !rate || !length) throw Error("Empty/invalid WAV");
  return length / rate;
}

async function compressedDuration(buffer: Buffer) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "little-light-probe-"));
  try {
    const file = path.join(dir, "audio");
    await fs.writeFile(file, buffer);
    const { stdout } = await execute(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "json", file],
      { timeout: 30000 },
    );
    const duration = Number(JSON.parse(stdout).format?.duration);
    if (!Number.isFinite(duration) || duration <= 0)
      throw Error("No positive measured audio duration");
    return duration;
  } catch (error) {
    throw Error(
      `Cannot measure MP3/Ogg; install local ffprobe or supply PCM WAV. ${String(error)}`,
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

export async function probeMedia(
  asset: BookAsset,
  publicRoot = defaultPublicRoot,
) {
  const buffer = await mediaBytes(asset, publicRoot);
  if (asset.kind === "audio") {
    const wav =
      buffer.toString("ascii", 0, 4) === "RIFF" ||
      /(?:\.wav$|^data:audio\/(?:x-)?wav;)/i.test(asset.src);
    return {
      duration: wav ? measureWav(buffer) : await compressedDuration(buffer),
    };
  }
  const png =
    buffer.length >= 33 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    buffer.toString("ascii", 12, 16) === "IHDR" &&
    buffer.readUInt32BE(16) > 0 &&
    buffer.readUInt32BE(20) > 0;
  const jpeg =
    buffer.length > 4 &&
    buffer[0] === 255 &&
    buffer[1] === 216 &&
    buffer[2] === 255 &&
    buffer[buffer.length - 2] === 255 &&
    buffer[buffer.length - 1] === 217;
  const webp =
    buffer.length >= 20 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP" &&
    buffer.readUInt32LE(4) + 8 === buffer.length;
  if (!(png || jpeg || webp)) throw Error("Invalid PNG/JPEG/WebP header");
  return {};
}

export async function checkBook(
  book: AuthoredBook,
  publicRoot = defaultPublicRoot,
  strict = false,
) {
  const checked = validateBook(book);
  if (!checked.book) throw Error(issuesText(checked.errors));
  let total = 0;
  const errors = await validateBookAssets(book, async (asset) => {
    total += (await mediaBytes(asset, publicRoot)).length;
    if (total > 96 * 1024 * 1024)
      throw Error("Book exceeds 96 MiB decoded media");
    return probeMedia(asset, publicRoot);
  });
  if (errors.length) throw Error(issuesText(errors));
  if (strict && checked.warnings.length)
    throw Error(`Strict validation failed:\n${issuesText(checked.warnings)}`);
  return checked.warnings;
}

/** Same-directory staging keeps failed writes from truncating existing JSON. */
export async function atomicJson(
  file: string,
  value: unknown,
  expected?: string,
) {
  const target = path.resolve(file);
  const info = await fs.lstat(target).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
    return undefined;
  });
  if (info?.isSymbolicLink())
    throw Error("Refusing to replace a symbolic-link JSON file");
  const dir = await fs.mkdtemp(path.join(path.dirname(target), ".book-write-"));
  try {
    const pending = path.join(dir, "pending.json");
    await fs.writeFile(pending, JSON.stringify(value, null, 2) + "\n", {
      mode: info?.mode,
    });
    if (
      expected !== undefined &&
      (await fs.readFile(target, "utf8")) !== expected
    )
      throw Error(`File changed while authoring; reload and retry: ${file}`);
    await fs.rename(pending, target);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
