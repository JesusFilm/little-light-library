# 03: Turn pages through the reading session

**What to build:** As a reader, I can turn to the previous or next spread while text appears immediately, the requested page loads, and an older request cannot replace a newer choice. Page actions and loading state pass through the session.

**Blocked by:** 02: Open, switch, and continue reading.

**Status:** ready-for-human

- [x] Previous and Next respect the book's page limits and retain their existing labels, disabled states, and page-turn cue.
- [x] Requested text and controls appear before artwork and narration finish loading; a successful spread keeps the existing reveal and autoplay gate.
- [x] A superseded page load cannot change the current page, artwork, narration, or visible error state.
- [x] A rapid page turn followed by Library preserves the right page and paused position; the session snapshot and reader debug observations agree.

## Comments

The reading session now decides page-turn limits, tracks loading, and invalidates superseded requests. The scene receives cancellation before Library waits for a pending load, and the room browser check confirms requested text appears while media is still pending.

Automated checks: `npm run verify` and `npm run test:room` (9 checks) pass. The Standards and Spec reviews found no remaining actionable ticket 03 issues. The room and phone captures were inspected during the transfer checks. Audible listening and creator approval were not performed for this ticket.
