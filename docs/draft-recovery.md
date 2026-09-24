# Recover old browser drafts

The reader no longer reads or writes the former `little-light-author-books` IndexedDB
database. Retirement does not clear it. Git is the editor's archive; there is no hidden
editor route. A new catalog entry never overwrites a stored browser book.

If you used the editor, preserve drafts before clearing browser data. Storage belongs
to the exact browser profile and origin (scheme, hostname and port). `localhost` and
`127.0.0.1`, and different ports, are separate origins. A fresh test browser cannot
inspect your everyday browser's drafts.

1. Open that original address and profile. The current static reader can be served at
   the old address; it need not run the retired editor. Keep the original public media
   available at its original path while recovering.
2. Open the browser's developer console. Read and paste the repository's
   [`scripts/recover-browser-drafts.js`](../scripts/recover-browser-drafts.js).
   It first checks whether the database exists, reads it without writes, and downloads
   `little-light-draft-recovery.json`. This includes soft-deleted books, settings and
   embedded copies of reachable media. It never clears or modifies storage.
3. Keep the download outside this public repository. Inspect `books[].value.book`,
   including entries with `deletedAt`, and the `missingMedia` list. A download with
   missing media is still useful but is not a complete portable backup. Preserve the
   original database and resolve those files before clearing anything.
4. Ask the local agent to reconcile each wanted book against the committed catalog.
   Extract embedded images/audio into `public/assets/books/<book-id>/`, replace their
   `src` values with public-relative paths, and save the book under `public/books/`.
   Preserve stable IDs, text, translations, notes and attribution. Resolve duplicate
   IDs explicitly; do not overwrite a committed book merely because its ID matches.
5. Validate and preview through the [creator workflow](creator-guide.md), then commit
   the chosen book and its required media. Never commit the database dump, timestamps,
   saved shelf settings, machine paths or unrelated discarded drafts.

No browser-only work was found in the accessible Chrome origin-directory inventory
during retirement. Other profiles, browsers and devices cannot be certified from that
check. The recovery path remains available without reintroducing an authoring app.
