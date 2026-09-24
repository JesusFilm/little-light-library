# 06: Prepare authored spreads before commit

**What to build:** As a reader of the authored book, I keep seeing the last completed paper scene while the next one loads or if its artwork fails. A successful current scene replaces it through the existing page-turn reveal.

**Blocked by:** 04: Control playback and recover failures.

**Status:** ready-for-agent

- [ ] Authored visual preparation owns its textures and scene objects until the current successful result commits; failed or superseded work disposes them.
- [ ] The last completed artwork remains visible during a pending authored load and after an artwork failure, while requested text and the existing artwork retry remain available.
- [ ] Narration failure leaves committed artwork and text usable; retry remains paused.
- [ ] A newer page or book choice cannot be overwritten by an older authored result or error.
- [ ] Authored interactions, reduced motion, page-turn reveal, and autoplay timing retain their existing behavior.
