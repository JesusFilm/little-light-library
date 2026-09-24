# Reader architecture improvement

Status: ready-for-agent

## Problem Statement

Reading a book, moving between the table and shelf, changing language, and loading a spread depend on coordination scattered across the reader entry point and the scene. A change to one transition requires understanding several state and media paths at once. Visual spread loading also releases the live stage before replacement artwork is ready, so a slow or failed load can expose an empty stage. These seams make race conditions and resource ownership difficult to verify.

## Solution

Give the reading session one small interface for user actions and a snapshot of the current reading state. Keep rendering and dialogs in the reader UI while the session coordinates the shelf, scene, narration, soundscape, toys, and cancellation. Prepare each authored or legacy visual spread as an owned result, then commit only the current successful result and dispose all other prepared work. Keep the last completed artwork visible until replacement artwork is ready or while an artwork failure is shown. Continue displaying requested text immediately and handle narration failures independently.

## User Stories

1. As a reader, I want the three existing books on the shelf, so that I can choose the same stories as before.
2. As a reader, I want to select any of the nine supported languages, so that I can read with the current language choices.
3. As a reader, I want shelf titles and toy labels to update when I change language, so that the room matches my selection.
4. As a reader, I want an opened book to land on the table, so that I can start reading it.
5. As a reader, I want the selected book's first spread to open as before, so that reading starts in the expected place.
6. As a reader, I want to inspect a shelf book and return it without opening it, so that I can keep browsing.
7. As a reader, I want to move from reading to the Library and back with Continue, so that I retain my page and paused playback position.
8. As a reader, I want a rapid page turn followed by Library to leave the right page and paused position, so that the transition does not corrupt my place.
9. As a reader, I want to change language while browsing the shelf and retain my current page, so that I can continue reading in the selected language.
10. As a reader, I want to switch books and see the previous book return to the shelf, so that the room reflects what I am reading.
11. As a reader, I want Previous and Next to respect the book's page limits, so that I do not leave the story.
12. As a reader, I want page text and controls to appear without waiting for artwork or narration, so that I can read during media loading.
13. As a reader, I want the last completed artwork to remain visible while a new spread loads, so that the paper scene does not go empty.
14. As a reader, I want the last completed artwork to remain visible when new artwork fails, so that the failure does not leave an empty stage.
15. As a reader, I want an artwork error and retry control when artwork fails, so that I can try loading the requested spread again.
16. As a reader, I want artwork retry to leave narration paused, so that retry does not unexpectedly play sound.
17. As a reader, I want a successful replacement spread to use the existing page-turn reveal, so that the reading experience remains familiar.
18. As a reader, I want narration to start only after the artwork is ready and the spread has unfolded, so that the current playback timing remains predictable.
19. As a reader, I want text and artwork to remain available if narration fails, so that I can still read the spread.
20. As a reader, I want a narration error and paused retry when audio fails, so that I can recover without unexpected playback.
21. As a reader, I want Play, Pause, speed, mute, and volume to behave as before, so that my controls remain dependable.
22. As a reader, I want playback to pause when the tab is hidden and require my normal resume action, so that sound does not restart unexpectedly.
23. As a reader, I want authored interactions and shelf toys to keep their current responses and sounds, so that the books stay interactive.
24. As a reader, I want reduced-motion reading to retain the same content and controls, so that I can use my motion preference.
25. As a reader, I want a newer page or book choice to win over an older pending load, so that stale artwork or narration never replaces my current choice.
26. As a reader, I want a failed older load to leave the current spread alone, so that an obsolete error cannot interrupt reading.
27. As a maintainer, I want shelf, page, language, and playback transitions behind one reading-session interface, so that changes have locality.
28. As a maintainer, I want visual resources to have one prepare, commit, or dispose path for authored and legacy spreads, so that failures and cancellation are verifiable.
29. As a maintainer, I want tests at observable seams, so that implementation changes do not require rewriting tests of internal steps.
30. As a maintainer, I want the current reader debug observations to remain available, so that existing browser checks can verify behavior during the refactor.

## Implementation Decisions

- The reading session is the external seam for shelf, reading, language, and playback actions. Its interface offers actions and one snapshot of book, page, shelf, playback, and loading state.
- The reader UI sends actions to the session and renders its snapshot. It retains DOM rendering, dialogs, notices, and retry controls.
- The session owns transition order and cancellation and coordinates the existing scene, narration, soundscape, and toy modules. It reports typed failures to the UI.
- The session decides which page request is current. Visual spread preparation owns its scene resources and the commit or disposal decision.
- Authored and legacy spread paths are two adapters behind one preparation seam. Each returns an owned prepared result; only a current successful result may be committed.
- A failed or superseded prepared result is disposed without changing the current completed artwork. A newer request cannot be overwritten by an older success or error.
- The previous completed artwork remains visible while new artwork loads and after an artwork failure. This is the one agreed visual change from early clearing.
- Requested text still appears immediately. Artwork can commit without narration; narration failure retains text and artwork. Keep distinct artwork and narration errors and their paused retry behavior.
- Preserve the existing page-turn reveal and the unfold gate before autoplay. Preserve language selection, the three-book shelf, Library/Continue, settings, authored interactions, toy sounds, and reader debug observations.
- Keep the existing scene and audio internals where they already provide useful depth; move coordination and resource lifecycle rules to the agreed seams rather than adding pass-through layers.

## Testing Decisions

- Test externally observable behavior and outcomes across a module's interface, rather than private fields, helper call order, or exact implementation structure.
- Use the reader UI and its existing debug observations as the highest acceptance seam for complete reading flows. Existing browser checks for room transfers, language, recovery, races, and audio continuity provide prior art.
- Add focused reading-session tests for action-to-snapshot transitions, supersession, typed failures, and paused recovery. Test through the session interface.
- Add focused spread-preparation tests for authored and legacy results: a current result commits once, while failed and superseded results dispose their owned resources and leave the prior completed artwork available. Test through the preparation interface.
- Retain meaningful tests for scene rendering, authored interactions, audio behavior, reduced motion, and resource retention. Migrate tests that only exercise the old shallow state surface when the session interface covers their behavior.
- Run lint, type checking, unit tests, catalog validation, and build, followed by browser checks for room flows, races, media failures, and audio continuity.
- Inspect rendered placement and repeated shelf transfers. Report automated checks, visual inspection, audible playback, and creator approval separately.

## Out of Scope

- New books, languages, content, artwork, or narration.
- A browser authoring UI, account system, runtime generation, or new persistence of the reading session.
- Rewriting the existing narration engines, scene artwork, or authored interaction design beyond what the agreed seams require.
- Changing reader behavior except for retaining completed artwork during a pending or failed artwork load.

## Further Notes

The architecture improvement plan and domain glossary in the repository record the agreed terminology and implementation order. Split this spec into fresh-context, independently verifiable implementation tickets with explicit blocking edges. Preserve a passing build and relevant tests at each ticket boundary.
