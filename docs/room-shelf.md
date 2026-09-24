# Books and toys in the room

The room loads its ordered collection from
[`public/books/catalog.json`](../public/books/catalog.json). The current three
entries are Eden, Noah and Jonah. All three appear for a fresh
visitor; browser author drafts and old saved shelf membership do not determine
the collection. There is no Add to room / Remove from room authoring UI.

The two inner shelves hold **15 spine-facing books each (30 total)**. Each
occupied shelf with fewer than 13 books has a book stop; shelves with 13–15 books
do not. Book-specific toys stand on top of the cabinet, separate from book slots.

Each book's appearance palette sets its cover cloth, spine and trim. The shelf
preview and physical book share one generated cover texture, so its artwork,
title and colors travel with it from the shelf to the table and stay attached
while the book is open.

## Reading and transfers

On each fresh page visit, a small pointing hand invites the visitor to select a
spine after 15 seconds without selecting a book. Pointer movement, unrelated
clicks and keyboard activity do not reset or interrupt it. It appears
for four seconds, then rests for ten seconds before repeating. Selecting any
book fades it out over 600 milliseconds and dismisses it for the rest of that
visit, including after returning to the shelf. Dialogs allow an existing cue to
finish; hidden tabs pause the invitation and restart the idle wait.
Reduced motion uses a stationary hand.

Turning pages show plain warm paper using the same material as the open pages.
The entire story stage, including ground artwork, stays hidden until the cover
has opened. Cards then rotate upward on their hinges, retaining their proportions.
The folded stage is fitted to the page bounds on initial opening and page turns.
Cards fold down before the next page turns.
Narration waits for a fully unfolded rendered frame before starting, including
autoplay and manual Play/Pause. Play starts the current page again after its
narration ends. Leaving the page cancels a pending start.
Any visible reverse uses the page's warm paper color.

Select a titled spine with pointer or keyboard controls. It slides clear of the
shelf and turns its cover toward the reader. **Read** brings it to the table and
opens it. **Return** or Escape puts a previewed book back. Inspecting another
cover leaves the current table book and toys unchanged.

While reading, **Library** returns to the room with the current book closed on
the table, cover up. Clicking or tapping that closed book, or choosing
**Continue reading**, reopens the same page at its paused
narration position. Reading another book performs this sequence:

1. Stop narration and old toy audio; move the previous toys away.
2. Fold the current scene, close its book and return it to its reserved shelf slot.
3. Reset the selected book's position, rotation and scale, place it level above
   the tabletop, then unfold its reading scene.
4. Display the new table book's toys on the cabinet top.

Only one copy of a book is visible. Its shelf slot remains reserved while it is
previewed or on the table. Inputs are locked during transfers to prevent competing
moves. Reduced motion preserves these state changes without travel. Repeated
swaps must not accumulate yaw/tilt or put the book below the tabletop.

## Book-defined toys

A generic JSON book can define up to four `toys`, each with an ID, short label,
registered image, optional atlas pose, click animation and optional registered
audio. Supported animations are rock, float, sway, pulse and spin. A click plays
one 1.4-second response and returns to rest; another activation restarts it.
Reduced motion uses static feedback. Toys are painted standees, not inferred
sculpted models or anatomical rigs.

Edit toys in the book file and preview from its shelf entry. They appear only
for the current table book, including its closed state in Library. A book without
toy definitions simply leaves this optional cabinet display empty. Eden's
compatibility toys are Adam, Eve and a tree; Noah's are Noah, the ark and a dove.
See the [Jonah index](books/jonah-and-the-whale.md) for its current character and
stage assets. The shared shelf book-stop behavior is part of shelf capacity,
independent of any book-specific decoration.

Generic toy labels currently remain in the source language. Optional audio obeys
reader mute/volume and stops on book changes or tab hiding. Keep referenced art
and audio available, and include toys in visual/listening review.

## Implementation and regression checks

`book-catalog.ts` validates ordered registrations. `room-library.ts` resolves
their committed content without IndexedDB; legacy keys are `builtin:eden` /
`builtin:noah` and JSON keys are `book:<id>`. `room-shelf.ts` owns physical
slots/transfers, `scene.ts` owns table folding/toys, and `main.ts` serializes
the workflow. `room-toys.ts` adapts content; `shelf-toy-audio.ts` isolates
click effects from narration.

Use `npm run verify` and `npm run test:room` for current reader checks.
`npm run verify:all` runs those followed by `npm run test:recovery` and `npm run test:failures`.
`test:browser` also runs the current room suite.
The older footer-control browser/acceptance scripts are historical and are not
the recommended current suite.

Inspect actual desktop and phone rendering after structural changes: all three
spines visible, both shelf rows correct at capacity, stops at the threshold,
toys on top, cover preview/Return, repeated transfers above the table, and
Library/Continue with paused-position preservation. Test keyboard, touch, mute,
speed and reduced motion. Automated assertions alone cannot judge physical
placement or perceived motion. Project history records
executed checks; older results are not evidence for the current revision.

For valuable content left in the retired browser author database, use the
separate [draft-recovery procedure](draft-recovery.md). Recovery does not add a
hidden editor or change public shelf membership.
