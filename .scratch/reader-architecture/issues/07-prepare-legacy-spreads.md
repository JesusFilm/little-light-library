# 07: Prepare legacy spreads through the same seam

**What to build:** As a reader of Eden or Noah, I get the same complete-scene loading and recovery behavior as the authored book: the previous artwork remains until a current new spread is ready, and failures keep it visible.

**Blocked by:** 06: Prepare authored spreads before commit.

**Status:** ready-for-human

- [x] Legacy visual preparation uses the same owned-result commit and disposal seam as authored spreads, including backdrop, actors, props, and ground.
- [x] A failed or superseded legacy load cannot append stale actors, controls, or textures, replace the current scene, or alter current narration.
- [x] The last completed artwork remains visible during legacy loads and failures; requested text, distinct media errors, and paused retry remain usable.
- [x] Eden and Noah retain page-turn prints, artwork placement, interactions, reduced motion, and autoplay timing.
- [x] All three books, nine languages, room transfers, race recovery, media failure recovery, and audio continuity pass the relevant checks.
