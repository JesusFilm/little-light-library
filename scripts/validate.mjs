import Ajv from "ajv/dist/2020.js";
import fs from "node:fs";
import path from "node:path";
const locales = [
  "en-US",
  "en-GB",
  "es",
  "fr",
  "hi",
  "it",
  "ja",
  "pt-BR",
  "zh-CN",
];
const schema = new Ajv({ allErrors: true }).compile(
  JSON.parse(fs.readFileSync("scripts/story.schema.json", "utf8")),
);
const errors = [];
const manifest = JSON.parse(
  fs.readFileSync("public/audio-manifest.json", "utf8"),
);
let pages = 0,
  phrases = 0;
let keys;
function requireFile(p) {
  if (!fs.existsSync(path.join("public", p)))
    errors.push(`Missing asset: ${p}`);
}
for (const id of locales) {
  const file = `public/content/${id}.json`;
  if (!fs.existsSync(file)) {
    errors.push(`Missing locale ${id}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!schema(data)) errors.push(`${id}: ${JSON.stringify(schema.errors)}`);
  if (data.id !== id) errors.push(`${id}: ID mismatch`);
  keys ??= Object.keys(data.ui).sort();
  if (JSON.stringify(Object.keys(data.ui).sort()) !== JSON.stringify(keys))
    errors.push(`${id}: UI keys mismatch`);
  for (const [k, v] of Object.entries(data.ui))
    if (typeof v !== "string" || !v.trim())
      errors.push(`${id}: untranslated UI ${k}`);
  if (data.stories.length !== 2) errors.push(`${id}: needs two stories`);
  for (const story of data.stories) {
    if (!["eden", "noah"].includes(story.id) || story.pages.length !== 8)
      errors.push(`${id}/${story.id}: bad story`);
    for (const [i, page] of story.pages.entries()) {
      pages++;
      if (page.id !== `${story.id}-${String(i + 1).padStart(2, "0")}`)
        errors.push(`${id}: unstable page ID`);
      requireFile(page.image);
      if (!page.title || !page.passage)
        errors.push(`${id}/${page.id}: incomplete page`);
      for (const segment of page.segments) {
        phrases++;
        const key = `${id}/${story.id}/${page.id}/${segment.id}`;
        if (!segment.text?.trim()) errors.push(`${key}: untranslated`);
        const cue = manifest[key];
        if (!cue || !(cue.duration > 0)) errors.push(`${key}: missing cue`);
        else requireFile(cue.src);
      }
    }
  }
  for (const c of ["adam", "eve", "noah"]) {
    const cue = manifest[`${id}/names/${c}`];
    if (!data.characters[c] || !cue)
      errors.push(`${id}: missing character ${c}`);
    else requireFile(cue.src);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Validated ${locales.length} locales, ${pages} spreads, ${phrases} phrase cues and 27 names.`,
);
