# Little Light Library

This is a standalone static reader and local file-based book authoring project. Keep its three catalog entries (`eden`, `noah`, `jonah-and-the-whale`) and all nine supported reader locales. Do not add a browser authoring UI, account system, or runtime generation service.

Read [README.md](README.md), [creator guide](docs/creator-guide.md), [book contract](docs/book-contract.md), and the target book's [index](docs/books/README.md) before content changes. `public/books/catalog.json` is the ordered shelf registration. New books use the versioned JSON contract and shared validator; Eden and Noah retain their existing legacy adapter, localized manifests, recordings, and artwork-specific rigs.

Keep book, spread, segment, and element IDs stable. Distinguish biblical source references, authored retelling, and invented staging. Runtime media must be local to this repository. Preserve useful source art, prompts, and attribution in `assets/`. Never commit credentials, temporary renders, or provider job state.

For runtime changes, verify all three books, language selection, nested static paths, failure/retry, desktop and phone, keyboard/touch, mute/volume, and reduced motion as relevant. Inspect rendered book placement and repeated transfers. Report automated checks, visual inspection, audible playback, and creator approval separately; tests do not establish editorial or listening approval.
