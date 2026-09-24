# Reader architecture improvement plan

Status: design agreed; implementation pending.

## 1. Deepen the reading session

Introduce one reading-session module as the seam for shelf, reading, and language actions. Its interface presents one snapshot of the current book, page, shelf, playback, and loading state, plus actions that change that state. `src/main.ts` sends user actions through this interface and renders the snapshot. It retains DOM rendering, dialogs, and the existing retry controls.

The session owns transition order and cancellation, and coordinates `LibraryScene`, narration, soundscape, and shelf toys. It reports typed failures for the UI to display. Its implementation may use existing scene and audio modules internally; their detailed state and ordering rules should not leak through the session interface.

Preserve current language selection, three-book shelf, Library/Continue flow, page position, playback, loading, retry, and the `window.libraryDebug` observations used by browser checks.

## 2. Prepare visual spreads before committing them

Deepen the spread-loading seam used by `LibraryScene.spread`. Both authored and legacy paths prepare an owned visual result. The scene commits the current successful result or disposes a failed or superseded result. Resource ownership, cancellation, and disposal are local to this preparation module; the reading session decides which page request is current.

Keep the last completed spread visible while new artwork loads and if that load fails. This is the agreed visual change from today's early clearing. Text for the requested page remains readable immediately. Artwork commits independently of narration: an audio failure leaves text and artwork available, with the current audio error and retry behavior. Preserve the existing page-turn reveal and autoplay gate after a successful load.

## Implementation order

1. Introduce the reading-session interface and move transition coordination out of `src/main.ts`.
2. Move visual preparation and resource ownership out of the large `LibraryScene.spread` path, using authored and legacy adapters behind one seam.
3. Integrate spread outcomes with the session's cancellation and typed failure handling. Keep DOM rendering in `src/main.ts`.
4. Test observable behavior through the new interfaces, then run the existing unit, build, and browser checks.

## Acceptance checks

- A superseded visual load cannot commit its stage, leak textures, or alter the current narration.
- Missing artwork leaves text readable, keeps the last completed spread visible, and offers a paused retry. Missing audio leaves text and artwork usable and offers the existing paused retry.
- Rapid page turn followed by Library preserves the page and paused position. Language changes while browsing the shelf preserve the page and update labels. Switching books returns the old book to the shelf.
- Page-turn visuals, authored interactions, narration continuity, and `window.libraryDebug` remain compatible with existing checks.
- `npm run verify`, `npm run test:races`, `npm run test:failures`, `npm run test:room`, and `npm run test:audio-continuity` pass.
