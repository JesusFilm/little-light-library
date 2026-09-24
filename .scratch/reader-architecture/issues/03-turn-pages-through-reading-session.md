# 03: Turn pages through the reading session

**What to build:** As a reader, I can turn to the previous or next spread while text appears immediately, the requested page loads, and an older request cannot replace a newer choice. Page actions and loading state pass through the session.

**Blocked by:** 02: Open, switch, and continue reading.

**Status:** ready-for-agent

- [ ] Previous and Next respect the book's page limits and retain their existing labels, disabled states, and page-turn cue.
- [ ] Requested text and controls appear before artwork and narration finish loading; a successful spread keeps the existing reveal and autoplay gate.
- [ ] A superseded page load cannot change the current page, artwork, narration, or visible error state.
- [ ] A rapid page turn followed by Library preserves the right page and paused position; the session snapshot and reader debug observations agree.
