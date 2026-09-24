import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keep = new Map([
  ["review", new Set(["README.md", "latest"])],
  [
    "docs/captures",
    new Set([
      "room-1366.png",
      "eden-1366.png",
      "flood-1366.png",
      "aftermath-1366.png",
      "eden-360.png",
      "flood-768.png",
    ]),
  ],
]);
for (const [relative, retained] of keep) {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) continue;
  for (const name of fs.readdirSync(directory)) {
    if (!retained.has(name))
      fs.rmSync(path.join(directory, name), { recursive: true, force: true });
  }
}
for (const relative of ["dist", "dist-static", ".test-output"])
  fs.rmSync(path.join(root, relative), { recursive: true, force: true });
console.log(
  "Removed generated review output, uncurated captures, dist, dist-static and .test-output; retained runtime assets, source files and curated evidence.",
);
