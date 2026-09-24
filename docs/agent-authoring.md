# Agent-assisted book work

Read [the creator guide](creator-guide.md), [book contract](book-contract.md),
[architecture](architecture.md), the actual target document and referenced assets.
Use the established visual style and [editorial record](editorial.md) for art or story changes. This is file-based
authoring with reader preview; the retired editor is recoverable from git only.

## Practical working sequence

1. Inspect git state and identify the requested book, IDs and smallest coherent
   change. Preserve unrelated content and other agents' work. Determine whether
   this is a generic JSON book or the retained Eden/Noah path before editing.
2. For a new story, turn the brief into source-linked story beats and readable
   spread text before media production. Keep Scripture references, retelling and
   invented staging explicit. Do not invent quotations, rights or asset provenance.
3. Edit the existing JSON contract directly. Keep IDs stable and use actual
   registered assets. Supported placement, atlas poses, card motion, soundtrack
   and toy settings belong in data, not a new story-specific renderer branch.
4. Use local tools only when available and relevant. Inspect tool help/setup
   before generation; do not assume a remote service or credential exists.
   Preserve useful originals and commit only runtime-ready derivatives beneath
   the prototype's `public/` root.
5. Regenerate only affected media. Text edits leave `recordedText` untouched
   until matching narration is supplied. Never mark old audio current by copying
   new text into its metadata. Voice/speed changes require corresponding audio
   regeneration; position/ground/animation edits do not.
6. Run `npm run book:validate -- BOOK_FILE`; fix structural/reference/media
   errors and report draft warnings. A zero exit status with warnings is not
   completion of a fully narrated release. Use
   `npm run book:replace-audio -- BOOK_FILE SPREAD_ID SEGMENT_ID PUBLIC_RELATIVE_WAV VOICE`
   for a measured, supplied PCM WAV. See [audio guidance](audio-language-authoring.md).
7. Register a new JSON book in `public/books/catalog.json` with matching
   `id` and `path`. Start the reader using `npm run dev` and its printed URL.
   Preview from the shelf. There is no Author/import/export workflow.
8. Inspect the affected spreads plus adjacent transitions on desktop and phone.
   Check keyboard interaction, reduced motion, mute and shelf toys where relevant.
   Listen to changed cues and mix transitions. If listening was unavailable,
   state that limitation; waveforms and successful decoding are not aural judgment.
9. Check the production build at a nested static path without synthesis services.
   Verify referenced media and catalog entries, and review all bundled files before publishing.
10. Report changed files and stable IDs, commands actually run, observed behavior,
    remaining warnings and creator decisions. Keep automated evidence, your
    visual/listening observations and explicit creator approvals distinct.

## Concrete edit requests

- **Placement:** Move an existing element on a chosen spread 0.25 page units left,
  preserving depth, scale and motion. Report the field changed and check phone framing.
- **Ground:** Change only `ground.opacity` on a chosen spread and inspect the
  horizontal print; keep the upright backdrop.
- **Motion:** Reduce an existing rock's strength while preserving trigger and
  timing. Describe it as whole-card motion, not a new arm rig.
- **Narration:** Replace one segment's sentence with supplied text, keep the old
  recording metadata as stale, then replace that cue only after matching audio exists.
- **New book:** Create a source-linked beat sequence and a JSON document using
  supported capabilities; register it, validate and preview before fine art work.

Use `book:create` for an unregistered scaffold with supplied artwork,
`book:register` to append validated content, `book:catalog` to validate the
complete collection, and `book:narrate` for selective local synthesis.
Exact syntax and limits are in the [creator guide](creator-guide.md) and
[audio guide](audio-language-authoring.md). New media uses
`public/assets/books/<id>/`; preserve existing paths. Normal validation reports
draft warnings; `--strict` fails on all shared warnings without certifying
human approval.

## Boundaries

No editor replacement, arbitrary scripting, cloud storage, accounts or autonomous
quality-scoring loop. Eden and Noah retain their specialized rigs and nine
locales; a storage migration requires its own content-preserving feature plan.
The three books are the current collection.

Do not write review attestations merely because checks passed. Review metadata
cannot verify who listened, theological fidelity or spoken pronunciation.
