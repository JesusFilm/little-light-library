# Create and revise committed books

A creator and a local coding agent edit the book's JSON and media, then preview
the result in the reader. Git records the durable version. The hosted site reads
the committed catalog; it has no authoring interface or import step.

The local CLI creates a scaffold, validates media, registers a book and selectively
produces narration. It operates on the same files the reader loads. This guide explains the local file workflow.

## Where things live

| File or directory                                | Controls                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `public/books/catalog.json`                      | Ordered books on the shelf; explicit legacy or JSON entries.                                    |
| `public/books/<id>.book.json`                    | New book's metadata, text, source notes, layout, motions, media references, narration and toys. |
| `public/assets/`                                 | Static runtime images, recordings, fonts and models, owned by this prototype.                   |
| `assets/`                                        | Useful original art/editable sources outside the runtime; preserve attribution and licenses.    |
| `public/content/<locale>.json`                   | Existing Eden/Noah localized text and reader UI.                                                |
| `public/audio-manifest.json`                     | Existing Eden/Noah measured narration and character-name clips.                                 |
| `src/authored-book.ts`, `src/book-validation.ts` | Type definitions and executable contract/validation rules.                                      |
| `scripts/book.schema.json`                       | Generated schema for local JSON tooling.                                                        |

For new assets, use `public/assets/books/<id>/`, with descriptive subdirectories
such as `art/river-bank.webp` and `audio/en-US/river-bank-welcome.wav`.
Existing books retain their established paths. A book's asset
`src` is relative to `public/`, even though its JSON lives under `public/books/`.
Shared assets within this prototype are allowed; do not overwrite or remove a
file while another book or locale still references it.

## From a brief to a first reading

1. Establish the story's audience, source passages, intended ending and requested
   scope. Draft a short beat list before generating artwork or narration. Each
   spread should communicate one clear moment; do not copy the legacy eight-page
   limit into a new book by default.
2. Record the biblical references in book/spread `source`. Describe adaptation
   in `retellingNote`, and invented composition/action in `stagingNote`.
   Segment `text` is the visible retelling. If actual quotations are requested,
   identify the translation and its permissions rather than inventing a quotation.
3. Use `book:create` below for a small scaffold and the [contract](book-contract.md)
   for supported fields. Create a unique slug; keep `format`, `version` and
   `status: "draft"`. Never reuse the reserved `eden` or `noah` IDs. Remove
   copied scenes/media that do not belong to the new story; do not disguise Eden
   artwork or narration as newly produced material.
4. Give spreads, elements and text segments meaningful, stable IDs. Write the
   full short reading sequence before fine placement work. The order of the
   `spreads` array is the reading order.
5. Reuse appropriate local art or prepare only the assets needed for this pass.
   Add every image/audio reference to `assets` with a truthful attribution.
   Set a cover image and choose a distinct `appearance` palette for the cloth
   cover, spine and trim; titles and spine labels remain readable rendered text.
6. Validate, register the book locally, and preview it from its shelf spine.
   Iterate on a small, visible change. Missing narration is acceptable during
   composition, but remains an explicit gap until matching recordings exist.

The generated [book indexes](books/README.md) link each committed title's text,
translations, media and source files. They are navigation aids, not duplicate
editable content or creator-review attestations.

To create a scaffold using an existing, reviewed local image:

```sh
npm run book:create -- public/books/my-book.book.json --id my-book --title "My Book" --cover assets/books/my-book/art/cover.webp --locale en-US --attribution "Describe the actual source and rights"
```

The cover file must already exist. The command refuses to overwrite a file and
creates one provisional page with TODO text, a safe default cover palette and
the cover as its backdrop. Change that palette to suit the book and distinguish
it on the shelf. It
does not generate a story/media or register the book. Replace the TODO content
and provisional scene with the requested story before inclusion.

## Art, staging and restrained behavior

Use the established Little Light visual style:
painted paper texture, readable silhouettes, consistent character appearance and
gentle room lighting. Retain source images and useful prompts outside `public/`;
put only reviewed runtime derivatives there. Backgrounds should not duplicate
the separately placed actors. Use true alpha for cutouts and inspect their edges
against light and dark scenery. Avoid baked lettering in cover or scene artwork.

An upright `backdrop` and optional horizontal `ground` are separate surfaces.
Each actor/prop has `placement` in page units, not pixels. Negative `x` is left;
positive `depth` is toward the backdrop. Start with modest values within the
contract bounds. A bottom anchor aligns the visible alpha edge to the page even
when a cutout contains transparent padding; a center anchor keeps the full card
centered. Check feet, knees, hulls and wave crests against the actual surface.

Review each spread against a short visual-logic checklist before calling it
ready:

- The upright backdrop meets the horizontal ground, and the ground covers the
  intended page area with narrow margins.
- Figures and objects make physical contact where expected: planted feet/knees
  touch the ground, boats sit in the water, and floating bodies remain above
  or behind the intended wave layers.
- Character body sizes look consistent, including groups of adults, children
  and figures at different distances.
- Gaze and gesture point toward the intended person, object or action; facial
  expression fits the spoken story beat.
- An actor already included inside a combined illustration is not placed a
  second time as a separate figure.
- Foreground occlusion still reads correctly through a complete animation
  cycle, including the beginning, middle and end of looping motion.
- The image stays readable on desktop and phone, with the reading card open,
  and in reduced-motion mode.

These are visual judgments. Schema and geometry tests can catch missing IDs,
bad page coverage values, misplaced depth ordering and stale translation
structure, but they cannot establish that the artwork tells the right story.
Inspect the rendered art directly rather than treating passing tests as visual
approval.

A horizontal atlas `pose` chooses a fixed cell. A `motion` transforms the whole
card using `rock`, `float`, `sway`, `pulse` or `spin`; it does not create
joints or animate atlas frames. Use a quiet once-only response when that tells
the story. A narration-triggered gesture requires a valid segment and current
recording. Check the cue for the selected locale in the book index and use reader
playback to verify its timing and mix.

Actors respond to taps on their cutouts, and named DOM buttons provide
equivalent keyboard access. Explicit interactions add visible text responses;
`sound: "tap"` is the supported page interaction sound. The optional `hop` and
`hold-rock` effects are short stage gestures layered over existing motion.
Record invented gestures in `stagingNote`; essential story meaning belongs in
the text/art even when audio and motion are off. Optional `toys` provide up to
four book-specific standees on the cabinet with click animation and optional audio.
See the [contract](book-contract.md) for precise limits.

## Revise without unnecessary regeneration

Locate objects by stable ID, then make the requested change in place. For
example, move a spread's first element by changing
`spreads[0].elements[0].placement.x`, or quieten its gesture by changing only
`motion.strength`. Preserve trigger, duration and other settings unless they
are part of the request.

A placement or opacity change needs visual review, not new narration. A text
change makes only its corresponding recording stale; leave `recordedText`
unchanged until replacement. A voice/synthesis-speed change requires recordings
for the affected voice choices, not new artwork. Changing an asset at a shared
path affects every reference, so use a new filename when revising only one book.

For supplied PCM WAV audio, the established targeted command is:

```sh
npm run book:replace-audio -- public/books/my-book.book.json river-bank welcome assets/books/my-book/audio/en-US/river-bank-welcome.wav af_heart
npm run book:validate -- public/books/my-book.book.json
```

This measures a supplied WAV and updates one cue plus its asset registration.
It does not synthesize audio. Replace any placeholder attribution with accurate
recording provenance. Keep unchanged recordings. Follow
[audio and languages](audio-language-authoring.md) for local synthesis, measured
timing, soundtrack fades and listening review.

## Register and preview

The catalog is an array of objects. Its current collection is:

```json
[
  { "id": "eden", "legacyStory": "eden" },
  { "id": "noah", "legacyStory": "noah" },
  { "id": "jonah-and-the-whale", "path": "jonah-and-the-whale.book.json" }
]
```

For a new book, register one entry such as
`{ "id": "my-book", "path": "my-book.book.json" }`. The ID must match the
document; the path is relative to `public/books/`. Do not add `legacyStory`
for a new title or edit renderer code to register it. The room has 30 slots.

From the prototype directory:

```sh
npm run book:validate -- public/books/my-book.book.json
npm run book:register -- public/books/my-book.book.json
npm run book:catalog
npm run dev
```

Registration validates the full candidate catalog and its media before appending.
A matching repeated registration is a no-op; conflicting IDs/paths fail.
Existing entry order is preserved. Committed media must be public-relative files,
not embedded data URIs. To preserve old browser work, use
[draft recovery](draft-recovery.md) before reconciling it with a committed book.

Open Vite's printed URL, select the desired language and read the registered
book from the shelf. Refresh after editing data/assets; no browser draft should
override the file. Review cover, every spread in both directions, text, unfolding
and folding, interactions, toys, Library/Continue and a swap to another book.
Check desktop and phone, keyboard, reduced motion and mute. Listen to each
changed narration cue in its surrounding phrases, not just the isolated WAV.

For publication readiness, run the current verification commands in
[README](../README.md), build, and test the generated output under a nested
static URL. Use a clean browser context to establish catalog independence from
old author storage. Record missing media, draft warnings and any visual/listening
checks that were not performed.

Schema/reference/media errors fail the command. Missing/stale narration,
translation and review issues normally warn; `--strict` on validate, register
or catalog makes all shared warnings fail. It does not establish creator approval.
`book:catalog` also validates the retained legacy content, theatre and audio pack.
Use `--public-root DIR` for disposable generic-book fixtures; legacy validation
requires the actual prototype root. `book:register --catalog PATH` and
`book:catalog -- CATALOG` support an explicit catalog file.

## What belongs in a book's commit

- The book JSON and its explicit catalog entry.
- All required runtime artwork, narration, soundtrack/toy audio and attribution;
  useful original/editable sources and licenses where appropriate.
- Necessary content-specific documentation describing source/adaptation and
  outstanding review, without transcript dumps or fabricated approval records.
- Focused tests only when changing contract/runtime behavior, and the generated
  schema if that contract changed.
- The portal's reviewed file list/fingerprints and static output digest when
  required by its publication gate, after reviewing those actual files/output.

Exclude credentials, local endpoints, caches, provider job metadata, temporary
renders, browser-storage dumps and build output unless the repository explicitly
requires that output. Review the diff for accidental story/translation changes
and cross-book asset changes. Follow the current user's commit/deployment scope;
a local preview or catalog registration is not authorization to publish.

Creator review of story meaning, art and sound remains distinct from mechanical
validation. `status: "draft"` is currently the only supported status, even for
a carefully reviewed book; do not invent `published` or `approved` fields.
