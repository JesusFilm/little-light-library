# 01: Inspect and return a shelf book

**What to build:** As a reader browsing the shelf, I can inspect a book, return it, and inspect another with the same preview, focus, and busy behavior. These actions and the visible shelf state are driven through the reading-session interface.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

- [x] Inspecting a shelf book shows its current preview; returning it restores the shelf and keyboard focus.
- [x] Escape returns an inspected book when safe, and simultaneous shelf actions cannot overlap or leave controls stuck disabled.
- [x] The session snapshot exposes browsing, busy, and inspected-book outcomes used by the reader UI; shelf action coordination is local to the session.
- [x] Existing shelf interaction behavior and relevant tests pass for all three catalog books.

## Comments

Implemented a reading-session shelf snapshot and shared action lock. The reader UI now sends inspect and return actions to the session. Focus remains with the UI, and failed inspection restores the shelf before the busy state clears.

Automated checks: `npm run verify` and `npm run test:room` pass, including nested static serving, the three-book catalog, rapid shelf taps, Escape, reduced motion, and phone controls. Visually inspected the phone preview screenshot. Audible playback and creator approval were not performed for this ticket.
