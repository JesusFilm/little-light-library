# 05: Change reading language through the session

**What to build:** As a reader, I can change language while reading or browsing the shelf and keep my book and page. The room, text, controls, and toy labels update together through the reading session.

**Blocked by:** 04: Control playback and recover failures.

**Status:** ready-for-human

- [x] All nine supported language choices remain available, and the chosen language persists as before.
- [x] Changing language while reading preserves the book and page, refreshes the spread and narration, and leaves playback paused until its normal start.
- [x] Changing language while browsing preserves the page, refreshes shelf titles and toy labels, and keeps Library/Continue working.
- [x] A stale language fetch cannot overwrite a newer choice; failures use the current error behavior.
- [x] The reader UI uses session actions and one snapshot for shelf, reading, language, playback, and loading state; existing debug observations remain compatible.
