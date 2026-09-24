# 01: Inspect and return a shelf book

**What to build:** As a reader browsing the shelf, I can inspect a book, return it, and inspect another with the same preview, focus, and busy behavior. These actions and the visible shelf state are driven through the reading-session interface.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Inspecting a shelf book shows its current preview; returning it restores the shelf and keyboard focus.
- [ ] Escape returns an inspected book when safe, and simultaneous shelf actions cannot overlap or leave controls stuck disabled.
- [ ] The session snapshot exposes browsing, busy, and inspected-book outcomes used by the reader UI; shelf action coordination is local to the session.
- [ ] Existing shelf interaction behavior and relevant tests pass for all three catalog books.
