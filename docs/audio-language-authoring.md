# Local narration, languages and soundtracks

Generation happens on the author's machine. The static reader plays committed
media and never calls Kokoro, a translation service or an API proxy. Preview all
changes in the reader. The retired audio/language production screen and its
reviewed-export workflow are no longer entrypoints.

Eden and Noah retain their existing nine languages. Jonah now has matching text
and recorded narration for all nine library locales. Those generated cues and
translation fingerprints do not provide native-language or listening approval;
recorded review evidence remains separate and honest.

## Choose the correct content path

Eden and Noah retain `public/content/<locale>.json` and
`public/audio-manifest.json`. Their existing generator and voice inventory are
documented in [legacy audio production](audio.md). Do not apply the generic JSON
CLI to a locale manifest or regenerate all languages to verify a tooling change.

Generic books put exact text and optional narration on each segment in
`public/books/<id>.book.json`. A recording references a registered audio asset
and includes `recordedText`, measured `duration` and descriptive `voice`.
Text and recording must agree exactly. Changing a sentence keeps old
`recordedText` intact until matching audio exists; never relabel old speech.

## Local selective synthesis

Selective synthesis uses a separately installed Kokoro-compatible local service.
Inspect its model and available voices before starting it. The reader and validation
do not require that service. It normally binds loopback port 8770.

From the prototype directory, inspect work before synthesis:

```sh
npm run book:narrate -- public/books/my-book.book.json --dry-run --locale en-US
npm run book:narrate -- public/books/my-book.book.json --locale en-US --voice af_heart --speed 1 --spread river-bank --segment welcome
```

These are templates for an existing authored file and IDs. Do not run an
unfiltered replacement over Jonah's completed nine-locale cues. The script:

- Reads existing text in one selected locale; it does not write a story or translate.
- Skips cues whose text and voice/speed provenance match. Filters `--spread` and
  `--segment` select only affected content; `--force` regenerates that selection.
- Uses `--server http://127.0.0.1:8770` by default, querying the local lab's
  voice/synthesis endpoints directly. Only loopback HTTP is accepted and redirects
  are rejected. It does not start/install the model or call a paid provider.
- Writes measured PCM WAVs and updates each completed cue atomically, so rerunning
  resumes completed work. Old media/assets and review records remain; changed
  data makes relevant review fingerprints stale.
- Makes no network requests or file writes with `--dry-run`. Dry-run describes
  planned work, not model availability or voice quality.

New media belongs beneath `public/assets/books/<id>/`, with `audio/<locale>/`
for narration. The script writes `PAGE-SEGMENT-HASH.wav` there and records the
public-relative path. Run `npm run media:optimize` before publishing; it preserves
the WAV under `assets/source-recordings/`, writes a gapless MP3 runtime derivative,
and updates the asset reference. Do not commit lab caches or
temporary server outputs. Preserve all existing content paths.

Select a same-language voice and listen before accepting it. `narrationSettings`
can hold voice/speed preferences; they are not proof of how old audio was produced.
The cue's voice provenance identifies actual generation choices. Do not erase
provenance solely to make skipping or validation appear successful.

## Supplied recordings and targeted replacement

Copy a matching PCM WAV into the book's owned media directory, then bind it:

```sh
npm run book:replace-audio -- public/books/my-book.book.json river-bank welcome assets/books/my-book/audio/en-US/river-bank-welcome.wav af_heart
npm run book:validate -- public/books/my-book.book.json
```

Use `--locale LOCALE` when replacing a stored translation cue. The command
measures the WAV and updates only the named segment plus a new asset registration.
It preserves other recordings and does not synthesize speech. Replace any default
attribution with truthful rights/provenance. Do not overwrite shared files to
change one cue.

Local validation measures PCM WAV frames directly; MP3/Ogg validation requires
the optional local `ffmpeg` executable and fails with an actionable message
when unavailable. The replacement command expects WAV. Browser decoding is an
additional test, not a substitute for correct metadata.

## Timing, page progression and mix

One cue corresponds to a readable phrase, not guessed word timestamps. Measure
the final encoded file after trimming/editing. Shared asset validation rejects a
declared duration more than 0.04 seconds away from measurement. Text equality
cannot prove that speech says those words; listen for names, dropped/repeated
words, clipping, pauses and pacing.

A generic spread lasts `max(seconds ?? 8, sum(narration durations))`. Its
narration cues follow one another on the measured audio clock. The reader uses
decoded durations for highlighting and narration-triggered motions. The reader
does not turn pages automatically. Narration belongs to the selected spread;
soundtrack layers use their authored page membership across physical turns.

If any segment lacks current narration, narration for the whole spread is
suppressed so phrases cannot skip or mismatch. Text and interactions remain
available. Soundtracks may still play where configured. Jonah has one current
spoken cue per spread in each of its nine locales. Whether the words, audio,
story and scenes have been reviewed still depends on explicit human review; a
matching fingerprint alone cannot establish that.

A `soundtracks[]` layer names an audio asset, inclusive `startPage` and
`endPage`, offsets trimming the range, `volume`, `fadeIn`, `fadeOut` and
`loop`. Offsets must leave positive playable time. A layer starts on its first
included page and keeps the same audio source through turns while the selected
page remains inside its range. A looping layer follows page membership, not the
page's elapsed clock: it can continue after narration ends while a child lingers
on an included page, including the final page when `endOffset` is zero.

A positive `endOffset` deliberately trims the final loop inside its last page;
`fadeOut` runs before that trimmed endpoint and the loop stops there. With zero
`endOffset`, the loop stays audible for the whole final page until the reader
turns beyond the authored range. Leaving the range through a page turn fades an
outgoing layer by its `fadeOut`, or by the shared 0.35-second transition default
when no fade was authored. A continuing layer is not restarted. Non-looping
media also continues across included pages and ends when its file or trimmed
range ends. `fadeIn` and `fadeOut` are measured in content seconds and bounded
by the clip's playable duration. Recheck timing whenever text, audio or page
ordering changes, including any existing translation timeline.

Set a quiet track gain under intelligible narration and verify the complete
mix by ear, including fade boundaries and toy/effect levels. `narrationVolume`
controls narration relative to tracks; reader master volume/mute affects both.
Generic books pause the legacy procedural ambience. No particular numerical
gain guarantees a balanced mix across different recordings or phone speakers.

Test Play/Pause, speed, mute, page turn, Library/Continue, book swap,
language change and tab hiding. Explicit Pause and leaving/changing content stop
both narration and soundtracks. Mute preserves the clock and mix state. A back
turn before a positive end-offset endpoint cancels that pending fade and keeps
the still-in-range layer alive.

## Languages and review records

The source `locale` and text are required. Optional `languages` includes that
source locale. `translations[locale]` reuses spread, segment and element IDs,
with localized text, labels, interaction responses and cue metadata. Geometry
and soundtrack settings stay in the source definition. The source fingerprint
detects translations that became stale after source edits.

The nine UI locales do not imply nine translations for every JSON book.
A valid matching translation is used when available; otherwise the reader uses
the book's source language. The reading card omits a separate per-book language
label, so inspect the book catalog and translation files when verifying content
language. It must not describe a source-language fallback as a translated
edition. Jonah declares all nine locales, including en-GB and
translations for es, fr, hi, it, ja, pt-BR and zh-CN, with current segment audio.
Toy labels remain in their source language.

Existing `reviews[]` entries are explicit historical creator attestations,
not an automated release switch. Changed text, layout, relevant assets, toys or
timeline can invalidate their fingerprints. Same-path external media-byte changes
also need fresh review even if a data fingerprint is unchanged. Neither a CLI
nor a successful synthesis run may assert that somebody listened.

## Validation and completion

```sh
npm run book:validate -- public/books/my-book.book.json
npm run book:catalog
npm run book:validate -- public/books/my-book.book.json --strict
```

Schema, reference and media failures exit unsuccessfully. Normal validation
reports missing/stale narration, translations and review as warnings.
`--strict` turns all shared warnings into failures; it still cannot certify
editorial or listening approval. The present catalog deliberately retains Jonah's
draft review state: its nine editions have text and recorded cues, but page-level
human review evidence has not been recorded. Strict validation therefore remains
a review gate rather than proof that the authored media is correct.

The CLI enforces 1,024 registered assets, 32 MiB per asset and 96 MiB of registered
media bytes (after base64 decoding for recovered embedded documents). These are
package ceilings, not decoded browser-memory or phone performance targets. Split or
reduce a large book rather than assuming the reader streams everything.

A complete narrated future book needs every intended cue current, measured and
actually listened to, all story/art/audio reviewed by the creator, and a production
static-path pass. Record what was heard, what tools measured, who explicitly
approved the result and what remains unknown separately. Keep the final verification
record with the relevant change;
future feature evidence belongs with its own delivery.
