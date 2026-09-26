# Little Light Library architecture

This documents the committed-book reader after editor retirement. It describes
implemented runtime responsibilities and the retained legacy exception. Proposed
showcase content and optional capabilities are separately labeled in the
project plans. For commands, use the
[creator guide](creator-guide.md); for checks actually executed and unresolved
integration issues, use the main project documentation.

## Three boundaries

| Boundary              | Owns                                                                                                                 | Does not require                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Book content          | Committed catalog, book definitions, localized text, artwork, recordings, attribution                                | Browser drafts, an author account or runtime generation |
| Reader runtime        | Room/shelf, book transfer, folding stage, navigation, language selection, accessible controls, playback, preferences | Local Python, Kokoro, provider keys or an agent         |
| Local authoring tools | File creation/editing, validation, registration, selective media generation and preparation for review               | An authoring application in the hosted site             |

The implementation uses TypeScript, Vite, Three.js and DOM controls. Keep it small:
explicit content plus reusable rendering, without a plugin framework or executable
scripts inside books. The initial HTML includes the copied loader before
the 3D module downloads. Real loading/error state controls its lifecycle; animation
does not invent progress or impose a minimum wait.

## Catalog and sources of truth

[`public/books/catalog.json`](../public/books/catalog.json) is the single ordered
collection for every visitor:

```json
[
  { "id": "eden", "legacyStory": "eden" },
  { "id": "noah", "legacyStory": "noah" },
  { "id": "jonah-and-the-whale", "path": "jonah-and-the-whale.book.json" }
]
```

[`book-catalog.ts`](../src/book-catalog.ts) validates 1–30 entries, unique IDs
and file paths, permitted fields and the two explicit legacy IDs. An entry has
either `legacyStory` or `path`, not both. JSON paths are plain
`*.book.json` filenames inside `public/books/`. A JSON book's `id` must match
its catalog registration. The room's 30-book capacity is a current physical
constraint, not a pagination feature.

[`RoomLibrary`](../src/room-library.ts) fetches this file and resolves its entries
in catalog order. It uses no author database or saved room membership. Legacy
entries receive keys `builtin:eden` / `builtin:noah`; JSON books receive
`book:<id>`. Those keys identify shelf/table entries, while the document's own
IDs identify content. Do not write browser database keys into book definitions.

| Book path     | Authoritative content                                                                                                | Why it remains                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Eden and Noah | `public/content/<locale>.json`, `public/audio-manifest.json`, referenced media and existing stage direction/rig code | Preserves the existing eight-spread stories, nine locales, specialized motion and recordings without rewriting them |
| Jonah         | `public/books/jonah-and-the-whale.book.json` plus its registered media                                               | Thirteen authored spreads use the generic contract; all nine locale editions are listed in the generated book index |

The JSON book is the authoritative description of its spreads, text, placement,
motion and media references. Its files are authoritative media bytes. Legacy
content has deliberately separate responsibilities: locale manifests supply
words, the audio manifest supplies measured cues, and specialized code supplies
staging. Do not create a second editable JSON representation of those same
legacy books while the original remains active.

## From registration to a playable spread

```text
public/books/catalog.json
  └─ parseCatalog → RoomLibrary.resolve(selected UI locale)
       ├─ legacyStory → localized Story + retained rig/stage/audio manifest
       └─ path → validated AuthoredBook + local asset registry
            └─ resolveBook(content locale) → Story/Page with page.authored
       ↓
main.ts + reader state → shelf preview → transfer to table
       ↓
scene.ts → legacy stage or AuthoredStage → unfold and render
       ↓
Narration or BookNarration → measured clock → highlight and motion
```

1. Startup loads reader preferences, the selected locale and static audio index,
   then resolves the catalog. HTTP, catalog and structural book failures surface
   as loading errors that can be retried, rather than silently hiding a book.
2. `RoomLibrary` resolves legacy titles/covers from the locale manifest and JSON
   titles/covers from validated book data. Committed JSON books reject data URIs;
   old portable drafts must first be extracted into public-relative files.
3. Selecting a spine changes the physical shelf state to a cover preview.
   **Return** restores that shelf book. **Read** serializes any prior table-book
   return, the selected book's arrival, and its unfolding.
4. For JSON content, `main.ts` adapts each spread to the existing `Story` /
   `Page` interface and attaches `page.authored = { book, spread }`.
   `scene.ts` selects `AuthoredStage` at that boundary. Generic books need no
   new story-ID branches.
5. The stage loads local images, builds backdrop/ground/cutouts, and joins the
   same folding, turning and disposal lifecycle as legacy scenes. An obsolete
   page/language operation must not replace the active scene after a delayed load.
6. The appropriate audio transport schedules decoded clips, exposes measured
   position for phrase highlighting, and drives supported narration-triggered
   motion. Missing/stale JSON narration leaves readable text and interactions,
   with a warning; it is not silently replaced by another phrase or language.

The global language control sets the interface language and selects a JSON book's
translation when a valid translation exists; translations resolve by stable IDs.
If the selected language is unavailable or stale when opening a book, the reader
uses its source locale. Changing the global language later to an unavailable
translation keeps the already selected book language. The reader dialog contains
the page title and story text without extra book-language or retelling metadata.
No translation is generated. Eden/Noah retain all nine locale
manifests: en-US, en-GB, es, fr, hi, it, ja, pt-BR and zh-CN.

## Runtime responsibilities

| Module                                                                         | Responsibility                                                                                                  |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `main.ts`, `state.ts`                                                          | UI/state transitions, selected story/page, cancellation of obsolete operations, language/playback orchestration |
| `book-catalog.ts`, `room-library.ts`                                           | Catalog validation and loading committed entries; no author storage                                             |
| `contracts.ts`                                                                 | Reader-facing locale, story, page and legacy audio interfaces; `page.authored` bridge                           |
| `authored-book.ts`, `book-validation.ts`                                       | Generic content types, schema, reference/range/path rules and draft diagnostics                                 |
| `book-localization.ts`                                                         | Translation resolution, source/review fingerprints and review diagnostics                                       |
| `scene.ts`                                                                     | Room/table scene, stage lifecycle, book folding/turning and shelf/toy integration                               |
| `room-shelf.ts`, `room-interaction.ts`, `room-orbit.ts`                        | Physical slots/transfers and room interaction/camera behavior                                                   |
| `authored-stage.ts`, `book-animation.ts`                                       | Declarative stage composition and absolute-time whole-card motion                                               |
| `stage-direction.ts`, `paper-actor.ts`, `paper-creature.ts`, `garden-floor.ts` | Retained legacy staging and artwork-specific behavior                                                           |
| `turning-leaf.ts`, `leaf-print.ts`, folding/reveal modules                     | Physical page surfaces and scene transition continuity                                                          |
| `playback.ts`, `clock.ts`                                                      | Legacy measured-phrase transport and highlighting clock                                                         |
| `book-audio.ts`, `book-reader-audio.ts`                                        | Generic timeline/mixer and per-page reader transport                                                            |
| `soundscape.ts`                                                                | Existing procedural ambience/effects; procedural ambience pauses for authored books                             |
| `room-toys.ts`, `shelf-toy-audio.ts`                                           | Generic and compatibility toy definitions, isolated click audio                                                 |
| `preferences.ts`                                                               | Reader language/audio/speed preferences, independent of public catalog membership                               |

The old visual editor, browser author library, production preview, toy inspector,
browser generation/credential controls and Vite generation proxy are removed.
Useful shared playback/validation behavior remains because the reader consumes it.

## What book data can express

Read the [contract](book-contract.md) for exact types, defaults and numeric limits.

- **Meaning and words:** book/spread source references, retelling/staging notes,
  ordered segments and stable IDs. These distinguish Scripture references from
  authored interpretation.
- **Artwork:** attributed image/audio registry, cover, fixed upright backdrop,
  optional horizontal ground, actor/prop cutouts and static horizontal atlas poses.
- **Layout:** bounded page-unit coordinates, width/height, bottom/center anchor,
  elevation and rotation. Optional flips affect UVs, not shared cover orientation.
  Validation cannot guarantee good composition or prevent all occlusion.
- **Animation:** one whole-card preset per element—rock, float, sway, pulse or
  spin—with open, interaction or narration trigger; duration, strength, delay and
  loop/repeat control. Absolute-time sampling avoids accumulated drift.
- **Interaction:** accessible button label, visible response and optional built-in
  tap sound. Generic cards do not infer anatomical rigs or arbitrary click scripts.
- **Narration:** exact recorded text, registered audio asset, measured seconds and
  voice provenance per segment. Changed text invalidates its recording.
- **Soundtrack:** explicit audio layers across inclusive page-ID ranges with
  offsets, gain, loop and fades; narration gain is separate from master volume.
- **Toys:** up to four book-level standees with labels, image/pose, click animation
  and optional audio. Authored labels currently stay in the source language.

The visual guide's expressive limb acting describes the retained legacy work and
a possible future art goal. The generic contract currently moves whole cards.
Do not imply that an arbitrary image receives Eden's character rig automatically.

## Audio and time

Legacy narration loads a page's phrase recordings from `audio-manifest.json`.
Its Web Audio clock supplies both playback position and phrase highlighting.
The generator measures actual WAV frames; it does not estimate word timestamps.

Generic `BookAudio` creates a continuous content-time timeline. A spread lasts
the greater of `seconds` (default 8) and its narration total. Narration uses
decoded media duration; declared measurements are validated rather than trusted
as guessed timings. Soundtracks span the chosen page range after offsets and
fades. `BookNarration` exposes the current page range to the reader, so a
full-book timeline does not itself imply automatic page turning or gapless audio
through physical transitions.

A spread's narration plays only when all its segments have current recordings.
Soundtrack playback can still be meaningful for an otherwise text-only spread.
Narration-triggered acting cannot stand in for missing speech. Rate changes
reanchor playback; mute adjusts gain without stopping the clock. Language changes
and tab hiding pause/cancel playback appropriately.

Generic audio currently loads referenced narration/soundtrack buffers for the
resolved book, rather than streaming every page on demand. Large books and many
languages need memory/performance review. Keep new assets modest; lazy decoding
is a possible future optimization, not a promised current feature.

## The room is a preserved runtime contract

Two inner shelves each accommodate 15 spines. Each occupied shelf below 13 books
gets a stop. Toys occupy the cabinet top and belong only to the current table
book. The three-entry catalog uses the existing room; no room redesign is needed.

Selecting another cover must not disturb the table book until **Read**. A swap
stops old audio/toys, folds and returns the old book, resets full transforms,
then places and opens the next. Books must remain level and above the tabletop
through repeated swaps. A shelf slot stays reserved while its book is away.

**Library** shows the current book closed on the table with its cover up.
**Continue reading** restores its page and paused narration position. Reduced
motion follows the same state changes without travel. Touch/keyboard access and
readable phone framing are part of regression acceptance. See [room-shelf.md](room-shelf.md).

## Local production, validation and packaging

Local tools produce JSON and static media. The core CLI shares the book schema
and reference checks; the local Kokoro workflow supplies measured WAV files.
Artwork tools may supply reviewed images, but no generation service ships with
the reader. Available commands and selective replacement steps are documented
in [creator guide](creator-guide.md) and [audio/languages](audio-language-authoring.md).

Validation has distinct layers:

1. Catalog shape, uniqueness and document ID matching.
2. Book schema, supported settings, references, safe paths, translation freshness
   and missing/stale narration diagnostics.
3. Local asset existence, image-header checks and PCM WAV measurements. A header
   check cannot establish visual quality or even full decoder success. MP3/Ogg
   measurement uses optional local `ffmpeg`.
4. Browser image/audio decoding, rendered scene/transition inspection and actual
   playback at desktop/phone sizes.
5. Creator editorial, visual and listening review. No automated gate substitutes
   for these judgments.

Keep the asset registry and physical bytes together in the prototype. New media
uses `public/assets/books/<id>/` with `art/` and `audio/<locale>/` as needed;
preserve existing paths. Local validation enforces 32 MiB per asset and 96 MiB
of registered media bytes, in addition to 1,024 assets. These ceilings do not
measure decoded browser memory. A runtime
`src` such as `assets/art/jonah/jonah-shore.png` resolves from `public/`,
not the JSON's directory. Never use a leading slash, `..`, a machine path,
remote media URL or credentials. A file copied from another project's assets becomes
this prototype's independent runtime copy. Preserve useful originals outside
`public/`; everything under `public/` is a potential build output.

`npm run build` uses a relative base and produces `dist/`. Serve that output
beneath a nested path, such as `/little-light-library/`,
without a development proxy or generation server. Check a fresh visitor receives
all three shelf books, then exercise media loads and failures, page navigation,
repeated swaps, Return, Library/Continue, toys, language, mute/volume, keyboard,
touch and reduced motion. Inspect the network for missing resources and requests
to localhost/generation endpoints. Include fonts, loader files, JSON, images,
audio and scripts in static-output review.

## Legacy compatibility, recovery and deferred limits

The compatibility adapter is retained for a concrete preservation benefit:
Eden/Noah's specialized rigs, stage directions, procedural sound and all existing
locales remain playable. A generic migration would need data capable of
representing those behaviors plus matched visual/audio regression evidence.
That migration is not necessary for adding new books and is deferred.

Reader preferences remain useful browser state. The former author IndexedDB
does not affect the shelf, and retirement does not delete it. The separate
[read-only recovery procedure](draft-recovery.md) exports old browser drafts
through DevTools without shipping another editor. Recovery is origin/profile
specific; an empty test profile cannot establish that every user's work is safe.

Current limits include fixed backdrop geometry, bounded layouts without an
automatic solver, static atlas poses, whole-card motion, source-language toy
labels, an optional `ffmpeg` dependency for compressed audio measurement,
and no proof of review from metadata.
Review fingerprints cover book data/asset references, not every externally
modified file byte; changing bytes at the same path requires fresh review.
There is no author account, collaboration, live translation, publishing service
or arbitrary scripting. These limits keep cleanup bounded. Genuine feature
blockers and optional improvements belong in the project plans.

## Reading composition

The wide reading layout reserves `.reading-art-region` beside the reading panel.
In portrait, the panel docks to the viewport bottom and sizes to its content,
capped at 38% of viewport height (240px on phones). `LibraryScene` observes both
the panel and art region; the panel's measured height plus its 48px upward fade
defines the space available for art. The camera fits that measured rectangle.
The gradient belongs to the dock, with transparency above and solid color below;
it cannot expand independently into a viewport-sized reader overlay.
The room still renders across the full canvas;
a view offset positions the art frustum without scaling or replacing the scene.

Once a spread is prepared, a detached upright copy supplies geometry points for
`fitReadingComposition`. It shares existing geometry/materials and does not
allocate GPU resources. The fit includes the physical page and movement clearance;
interaction focus is constrained to the same art region. Revisiting or resizing
recomputes the fit from the stored spread points, so zoom cannot accumulate.

The title and complete story share a keyboard-focusable scroll region. Transport
stays outside that region, and status/retry messages live in the reading footer.
Phone body/title sizes are 16px/22px. Inline transport labels and icons retain
44px touch targets while avoiding the taller stacked controls.
Authored actors and interactive props have named spatial keyboard targets; the
canvas handles pointer/touch picking. Both paths share activation and hold cleanup.
A movement gesture cancels a scene discovery, and reduced-motion changes release
holds and clear camera focus immediately.

The room browser journey includes all 29 spreads at phone and desktop sizes,
harbor/storm captures at six sizes, nine-locale first-spread captures per book,
and enlarged-copy checks. These are functional/layout checks; physical-device,
listening and creator review remain separate evidence.
