# Authoring architecture decisions

Current direction: local agent-assisted files, reader preview, committed catalog
and static hosting. These decisions supersede the earlier manual/visual-editor
experiment. The historical quality program remains parked. See
[architecture](architecture.md) for implementation and
future work for future content work.

## Retire the editor; preserve its useful contract

The editor exposed meaningful controls for text, media, layout, motion, narration,
soundtrack and toys, but an embedded authoring application is too much product
and maintenance scope here. Remove its screens, persistence, generation controls,
proxy and exclusive implementation. Git is the archive. Shared renderer, audio,
validation and localization modules remain because committed books need them.

Creators work with local agents on JSON and media, inspect the actual reader and
use git for durable review/history. This does not require an author account,
cloud storage or another dashboard.

## Make registration explicit and storage-independent

One ordered `public/books/catalog.json` includes all four committed books.
Generic entries name a matching ID and book filename; legacy entries name Eden
or Noah. Validation enforces the shelf's 30-book limit, supported fields and
unique references. No visitor's old browser draft or saved room list silently
changes the public collection.

Reader preferences remain separate. The retired database is not cleared.
[Read-only recovery](draft-recovery.md) preserves browser-only work without
reintroducing an editor or publishing unreviewed storage dumps.

## Keep a bounded legacy adapter

Migrating Eden/Noah now would require representing artwork-specific rigs,
specialized staging, procedural sound and nine locale packs in another format.
That is a substantial content-preservation risk with little cleanup benefit.
Keep their current sources and adapt them into the same shelf/reader lifecycle.

New books use `page.authored` and the generic stage. Do not add a new story-ID
branch or create an alternative editable copy of a legacy book. A future migration
needs explicit scope and visual/audio equivalence evidence.

## Retain the existing declarative v1 vocabulary

Stable IDs, closed schema objects, attributed media, bounded placement, static
atlas poses, five card-motion presets, button interactions, measured narration,
translations, soundtrack layers and toys already support new books. Unknown
fields/settings are errors. No framework, plugin system, rig inference or
arbitrary scripting is needed for editor retirement.

Whole-card animation is not limb animation. The legacy rig quality is not
automatically transferable to new artwork. Document this limitation instead of
promising expressive rigging through unsupported JSON fields.

## Produce local media; validate separately from approving

Exact recorded text plus measured duration detects stale/mismatched cue metadata.
Local commands replace or synthesize only affected cues and retain old media.
The hosted reader plays committed files without generation credentials or a proxy.

Normal validation allows reported draft warnings so existing incomplete Jonah
content stays available. Strict validation fails on those warnings, but neither
mode establishes biblical fidelity, translation quality, pronunciation or creator
approval. Preserve review records honestly; no unattended command may invent them.

## Prefer inspectable static assets

New media uses `public/assets/books/<id>/`; existing paths remain intact.
Catalog books use public-relative files and reject embedded data URIs, while the
schema retains embedded compatibility for recovering old portable documents.
Keep source/editable media and rights information useful to future revisions,
but keep caches, provider metadata, machine paths and secrets out of runtime.

This leaves ordinary static packaging and the portal's reviewed-file/output gates
in control. Local registration is not deployment. Completing/polishing the three
showcase books, optional reader improvements and additional translations remain
future Feature work.
