# Little Light book contract

Version 1 is a small, declarative format for paper-stage books. A creator and a local agent edit the same committed JSON, run shared validation and preview through the reader. The format supports bounded behavior rather than executable scripts or arbitrary character rigs. There is no browser editor or import workflow.

The current generic-book example is [`public/books/jonah-and-the-whale.book.json`](../public/books/jonah-and-the-whale.book.json), a 13-spread illustrated retelling. Its generated [book index](books/jonah-and-the-whale.md) catalogs its text, locale files, narration, ambience and stage assets. Types are in [`src/authored-book.ts`](../src/authored-book.ts); executable schema and reference rules are in [`src/book-validation.ts`](../src/book-validation.ts). [`scripts/book.schema.json`](../scripts/book.schema.json) is generated from those rules with `npm run book:schema`. Update types, validation and the generated schema together when changing the contract.

The separate [catalog](../public/books/catalog.json) registers ordered entries as
`{ "id": "jonah-and-the-whale", "path": "jonah-and-the-whale.book.json" }` or the retained
`{ "id": "eden", "legacyStory": "eden", "appearance": { "coverColor": "#536C45", "spineColor": "#344831", "accentColor": "#D5B46A" } }` / Noah equivalent. Legacy entries may specify their physical cover appearance here; generic entries use the appearance in their book JSON. It accepts 1–30
entries, rejects duplicates/unknown settings, and requires a JSON entry's ID to
match its document. Catalog paths are plain filenames relative to `public/books/`;
asset paths are relative to `public/`. Legacy Eden/Noah content is not a v1 JSON
book; the [architecture](architecture.md) documents that deliberate exception.

## Creator glossary

- **Book:** the metadata, asset registry and ordered spreads in one JSON document.
- **Spread:** one open-book scene with its own text and stage direction.
- **Backdrop:** the upright scenic image behind the elements.
- **Ground print:** optional artwork laid on the horizontal page surface. It is independent of the backdrop.
- **Element:** a separately placed actor or prop.
- **Actor:** a named story subject. Version 1 can select a cell from a horizontal pose atlas, but it does not create an anatomical rig.
- **Prop:** an independently placed scenic or story object.
- **Cutout:** a flat illustrated card used for either an actor or a prop.
- **Pose:** one illustrated stance; v1 selects a cell in a horizontal atlas.
- **Rig:** movable parts and their pivots. Existing books have artwork-specific rigs; v1 does not infer or author them.
- **Placement:** an element's position, displayed size, anchor, elevation and rotation.
- **Anchor:** the point kept on the support surface. `bottom` plants the bottom center; `center` places the image around its center.
- **Motion cue:** one preset per placed image on each spread, with trigger, duration and loop controls. It transforms the whole paper card, not individual limbs.
- **Interaction:** labeled pointer or keyboard activation with visible text feedback and an optional built-in `tap` sound.
- **Narration cue:** a measured audio asset tied to one text segment. `recordedText` records exactly which words are in that file.
- **Stage direction:** the authored composition and behavior of one spread. It is an interpretation and should not be presented as biblical source text.

## Top-level fields

Every document has `format: "little-light-book"`, `version: 1`, a stable slug `id`, display `title` and `subtitle`, one BCP-47-like `locale`, and `status: "draft"`. The top-level locale is the source language. Optional language versions, soundtracks and review records extend v1 without changing older documents; see the production fields below. `eden` and `noah` are reserved for the legacy books. `draft` is currently the only status; registration is not a publication/approval state.

`source` describes the biblical or other source material. `retellingNote` identifies what kind of adaptation the words are. `cover` references an image in `assets`. Optional `appearance` gives the physical cover, spine and trim colors as six-digit `#RRGGBB` values; new books should set all three explicitly. Old v1 files use the shared warm-green default. `spreads` is the reading order; array position, not an ID naming pattern, controls that order.

The reader composes one localized title-and-art cover texture and shares it between the shelf and the closed or open table book. The same appearance values color the cloth boards, spine and accent trim, so a book keeps one identity as it moves. Legacy Eden and Noah palettes live on their catalog entries; a generic book's palette lives in its JSON document.

IDs are stable references, not display text. Keep book, spread, segment and element IDs unchanged when revising their labels or words. IDs must be unique within their scope.

## Assets and portability

`assets` maps an asset ID to `{ kind, src, attribution }`. `kind` is `image` or `audio`. In an editable repository book, `src` is relative to the reader's `public` root, such as `assets/art/theatre/garden.webp`; do not add a leading slash. External URLs, absolute file paths and `..` traversal are unsupported.

The schema retains supported image/audio data URIs for compatibility with old
portable drafts. The committed catalog rejects embedded media: extract it into
local files beneath `public/`, preserving attribution, and update the registry
before registration. This keeps runtime media independently inspectable and avoids
base64-heavy books. The former browser exporter is retired; a committed book and
its files are the durable package. See [draft recovery](draft-recovery.md) for old
browser-only work.

Each asset needs nonempty attribution. The validator also checks that references have the right kind: covers, backdrops, grounds and element artwork use images; narration uses audio.

## Spread text and staging

Each spread has a stable `id`, visible `title`, `source`, and `stagingNote`. Keep these boundaries explicit:

- `source` points to the underlying passage or source material.
- segment `text` is the authored retelling shown and narrated by the reader.
- `stagingNote` describes invented composition, movement and interaction.

`segments` contains one or more stable segment IDs and readable text. Segment IDs are also used by narration-triggered motion. `backdrop.asset` references the upright image. Optional `ground` references a horizontal image and supplies its own placement, rotation and opacity.

The stage uses reader page units. `x` moves left (negative) and right (positive). `depth` moves across the horizontal page stage: positive values move toward the upright backdrop and negative values toward the reader. `width` and `height` are displayed page-unit dimensions rather than source pixels. The page is about 6 units wide by 3 units deep; validation bounds individual coordinate and size values; it does not guarantee that arbitrary combinations fit inside the page or avoid overlap. `elevation` lifts an element above its support. `rotation` is in degrees. Start with moderate values within these bounds before making large changes, then judge them in preview at phone, tablet and desktop sizes.

For element placement, `anchor` defaults to `bottom`, `elevation` to `0`, and `rotation` to `0`. Ground `rotation` defaults to `0` degrees and `opacity` defaults to `1`. Omitted optional values retain their omission in editable JSON while playback applies these defaults.

## Poses, motion and interaction

An element may select `{ "index": 0, "columns": 3 }` from a horizontal image atlas. `index` is zero-based and must be smaller than `columns`. Omitting `pose` uses the complete image. A new image does not acquire movable limbs: motion presets transform the complete card around its placement anchor. Optional `flipX` and `flipY` booleans on elements, ground and backdrop mirror the image within its rectangle; both default to false. Flips preserve position, anchor and selected atlas cell, and do not alter shared cover art.

`motion.preset` is `rock`, `float`, `sway`, `pulse`, or `spin`. Each element has at most one motion per spread. Its trigger is `open`, `interaction`, or `narration`. A narration trigger also names a segment in the same spread. `duration` is seconds per cycle. `strength` means peak degrees for rock, percent of image height for float, percent of width for sway, and percent size increase for pulse. Spin makes one full turn and ignores strength. Optional `delay` is seconds and defaults to `0`. `loop: true` repeats until the page closes; `loop: false` plays once and stops at the original placement. If `loop` is omitted, legacy `repeat` defaults to `1` and permits 1–10 cycles. Explicit `loop` overrides `repeat`. Float and pulse rise and return; sway and rock move to both sides and return; spin ends at the equivalent original orientation. Scrubbing derives transforms from absolute time, so repeated cycles cannot drift. An `open` motion starts when the stage is upright and visible. Narration motions use the reader’s decoded audio durations and playback position, so rounding in declared durations does not accumulate drift. Reduced-motion playback keeps a stable final presentation and does not depend on repeated movement to communicate meaning.

Authored books use their explicit soundtrack layers; procedural library ambience is paused while they are open. The reader master mute/volume and playback rate apply to narration and soundtrack together. Use reader playback for authoring review.

Actors respond to a tap or click on their visible cutout with a short pulse and visible name. Named buttons below the text provide the same feedback through Tab and Enter or Space; authored props need an explicit `interaction` to respond. `interaction` supplies a concise accessible `label`, a visible `response`, and optionally `sound: "tap"`. The optional `effect: "hop"` adds one brief upward movement on activation. `effect: "hold-rock"` deepens an existing rock motion while the cutout or named button is held, then restores its baseline on release, cancellation, page turn, or backgrounding. Both effects are bounded, and reduced-motion mode retains the visible response without the movement. Do not hide story-critical information exclusively inside an interaction.

## Narration and stale recordings

A segment's optional `narration` references an audio asset and records its measured `duration` in seconds, descriptive `voice` provenance, and exact `recordedText`. The cue is current only when `recordedText` exactly equals the segment's `text`. Editing text therefore produces a focused stale-narration issue instead of silently playing mismatched words; unrelated cues remain reusable. If one cue is missing or stale, preview suppresses narration for that spread so phrases cannot skip or play out of order.

Use the targeted replacement command after recording or supplying a new public-root WAV:

```sh
npm run book:replace-audio -- public/books/jonah-and-the-whale.book.json jonah-called segment-1 assets/books/jonah-and-the-whale/audio/en-US/jonah-call.wav af_heart
```

The command measures the WAV, changes only that segment's narration and its asset registration, and snapshots its current text as `recordedText`. It does not synthesize speech. Missing narration still permits text reading but is reported so a finished narrated spread cannot pass unnoticed. The runtime can decode browser-supported WAV, MP3 or Ogg audio. Local validation measures PCM WAV directly and MP3/Ogg through optional local `ffmpeg`; targeted replacement expects PCM WAV. See [audio and languages](audio-language-authoring.md) for selective local synthesis.

## Validation and reader behavior

Validate a file before previewing it:

```sh
npm run book:validate -- public/books/jonah-and-the-whale.book.json
```

Shared validation covers format/version, IDs, references, supported presets and
triggers, numeric ranges, safe asset locations and narration freshness. The CLI
checks local image headers and measured audio (PCM WAV directly, MP3/Ogg through
optional local `ffmpeg`). Shared asset validation reports
a narration duration mismatch exceeding 0.04 seconds. Runtime image/audio decoding
provides an additional playback check; header validation alone cannot guarantee
a complete image decodes correctly.

Structural, invalid-reference and missing/invalid-media failures are errors.
Missing or stale narration and incomplete translation/review are draft warnings;
read warnings even if the command exits successfully. Messages identify the JSON
path, for example `/spreads/0/segments/0/narration`. A validator passing is not a
claim that every spread has narration or creator approval.

The reader validates catalog/book structure before constructing its collection.
It fetches local registered media and reports failures through loading/error
status. There is no browser import transaction or undo history: edit the local
file, revalidate and refresh the reader. Git provides version history. See
[audio and languages](audio-language-authoring.md) for source-language fallback
and the difference between draft warnings and a complete narrated experience.

Version 1 does not promise a general rig editor, arbitrary scripts, remote assets, accounts, collaboration or publishing. Unknown fields and unsupported behavior are errors rather than silently ignored instructions.

## Bounds, defaults and rendering rules

| Field                      | Supported range / rule                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| IDs                        | Lowercase letter first, then letters/digits/hyphens; maximum 64 characters    |
| Book size                  | 1–40 spreads; 1–12 text segments and 0–16 elements per spread; 1–1,024 assets |
| Element x / depth          | −2.8…2.8 / −1.575…1.2 page units                                              |
| Element width / height     | 0.1…5.6 / 0.1…3.6 page units                                                  |
| Elevation / rotation       | 0…2 page units / −45…45 degrees; defaults 0 / 0                               |
| Anchor                     | `bottom` (default) or `center`; center at elevation 0 extends below the page  |
| Ground x / depth           | −3.05…3.05 / −1.575…1.575 page units; center placement                        |
| Ground width / height      | 0.1…6.1 / 0.1…3.15 page units                                                 |
| Ground rotation / opacity  | −180…180 degrees (default 0) / 0…1 (default 1)                                |
| Motion duration / strength | 0.2…30 seconds per cycle / 0…20 degrees or percent (see presets)              |
| Motion delay / repeat      | 0…60 seconds (default 0) / integer 1…10 cycles (default 1)                    |
| Narration duration         | 0.05…180 seconds per cue, measured from the file                              |
| Media                      | PNG, JPEG, WebP images; browser-supported WAV, MP3, Ogg audio                 |

The fixed backdrop is 5.8 × 2.7 units at depth 1.22. Artwork stretches to the authored
rectangle; pre-crop it if a different framing is needed. An atlas pose trims transparent
borders inside the selected cell; a non-atlas image uses its full rectangle including alpha.
The floor stays horizontal; ground rotation turns its print within that plane, and cutouts rise perpendicular to it. There is no automatic layout,
occlusion correction or camera adjustment. Check your composition in preview.

Local media validation enforces 32 MiB per asset and 96 MiB of registered media
bytes (after decoding base64 where present), plus the 1,024-asset contract limit.
These are package ceilings, not a browser decoded-texture/audio memory budget.
Validate the complete registry, including unused entries; keep media modest for
phone memory. The old browser JSON import/export controls are retired.
Unsupported versions need an explicit migration before the reader can use them.

## Production fields (optional v1 extension)

- `languages`: requested release locales, including the source `locale` (source is
  always included by the reader even when omitted here).
- `translations[locale]`: source-text fingerprint, localized `title`, `subtitle`,
  `source`, `retellingNote`, and `spreads` identified by source IDs. Each translated
  spread has `id`, `title`, `source`, `segments` (same cue format) and `elements`
  (`id`, `label`, optional interaction label/response). Visual geometry and sounds
  stay in the source definition. Outdated/incomplete translations are draft warnings,
  and cannot silently replace a requested reader language.
- `spreads[].seconds`: minimum page duration, 1–600 seconds, default 8. Narration
  extends this minimum.
- `soundtracks[]`: up to 64 layers, each with `id`, `label`, audio `asset`, inclusive
  `startPage`/`endPage` IDs, `startOffset`/`endOffset` seconds removed from the page
  range, `volume` 0–1, `fadeIn`/`fadeOut` 0–60 seconds, and boolean `loop`. Offsets
  must leave positive time in every complete requested-language timeline.
- `narrationVolume`: 0–1, default 1.
- `narrationSettings[locale]`: `voice` and `speed` 0.5–2 for local generation.
  These are generation preferences, not proof that existing recordings used
  those settings. Cue `voice` records descriptive provenance; exact text and
  measured duration remain mandatory on each recording.
- `reviews[]`: `locale`, `pageId`, `fingerprint`, `reviewedAt` ISO timestamp. These
  retain explicit creator attestations; they are not security signatures or automated
  editorial approval. The review auditor distinguishes current, missing and stale
  records. The retired reviewed-export button is not part of the file workflow.
  Never fabricate an attestation to silence a warning.

See [the production guide](audio-language-authoring.md) for timing, generation,
credential handling, limits and review semantics. The generated JSON Schema remains
the exact source for field bounds and required/optional properties.

## Shelf toys

A book may include `toys`, an array of up to four objects. Each requires a unique `id`,
short `label` (1–60 characters), image `asset`, and `animation` from `rock`, `float`,
`sway`, `pulse`, `spin`. Optional `pose: {index, columns}` selects an atlas cell with
the same bounds as an element. Optional `sound` references an audio asset. Toys belong
to the whole book and appear only while it is the table book. They play one 1.4-second
click response; reduced motion uses static visual feedback. They retain their authored
short labels across reading languages. See [the room guide](room-shelf.md).
