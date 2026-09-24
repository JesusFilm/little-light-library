# 02: Open, switch, and continue reading

**What to build:** As a reader, I can open a shelf book, return to the Library, continue at my paused page, or switch books while the room, table, shelf, and toys stay in sync through the reading session.

**Blocked by:** 01: Inspect and return a shelf book.

**Status:** ready-for-human

- [x] Read lands the selected book on the table and opens its first spread; switching books returns the previous book to the shelf.
- [x] Library and Continue preserve the current page and paused playback position, including when a page load is pending.
- [x] Shelf toys, room view, table-book identity, and the session snapshot agree after each transfer.
- [x] Eden, Noah, and the authored book retain their existing shelf and reading behavior in relevant browser checks.

## Comments

Opening, switching, Library, and Continue now enter through the reading session. It owns the table-book key and transition order; its snapshot also exposes the current book, page, and toy IDs. The reader keeps its existing scene, narration, and toy implementations behind transfer operations.

Automated checks: `npm run verify`, `npm run test:room` (9 checks), and `npm run test:audio-continuity` pass. The room check verifies that Library interrupts a pending page load and that Continue retains its page and paused position. Visually inspected the Library room and Noah phone screenshots. Audible listening and creator approval were not performed for this ticket.
