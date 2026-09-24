# 04: Control playback and recover failures

**What to build:** As a reader, I can play or pause, change sound settings, hide and restore the tab, and retry failed artwork or narration without unexpected playback. The session coordinates media and reports failures for the existing reader UI.

**Blocked by:** 03: Turn pages through the reading session.

**Status:** ready-for-human

- [x] Play/Pause, speed, mute, volume, and hidden-tab pause retain their current audible and visible behavior.
- [x] Artwork and narration failures produce distinct session outcomes while requested text remains readable and the reader UI shows the appropriate existing retry control.
- [x] Retry recovers the requested spread or narration in a paused state; a stale failure cannot interrupt the current request.
- [x] Authored interactions, soundscape cues, toy sounds, and reader debug playback observations remain compatible with relevant checks.
