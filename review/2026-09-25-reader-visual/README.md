# Reader visual improvement, 25 September 2026

## Direction and fixed criteria

Source revision: `699942672619b80bffdaaafecb8ec75132402d45` (clean). The
feedback images in the local issue spec were the references: `1.png` for Jonah
page one on phone, `2.png` for the storm on desktop, and `3.png` for the storm
on phone. This pass changed only the reader's composition and surrounding room.

Before editing, I used these criteria from the feedback spec:

| Criterion | Acceptance check |
| --- | --- |
| Book prominence | Scene occupies the upper phone view and left desktop view; it is not obscured by a card. |
| Visual continuity | No hard cream panel or vertical cut; the lower/right reading area continues the room's colors and depth. |
| Reading clarity | Live selectable text and navigation have clear contrast, touch size, and visible keyboard focus. |
| Physical depth | The open book's page edge, seam, and pop-up artwork remain visible at play size. |
| Cross-book fit | Representative first spreads in Eden and Noah still show the art, text, and controls on phone and desktop. |

## Matched evidence

The `baseline/` and `after/` images use Chrome headless at 1440×900 desktop
and 390×844 phone, device scale 1, English (US), reduced motion, and the same
Jonah spreads. Each Jonah capture waited for the scene to report its page
loaded and visible and for narration to reach “Page complete.” `after/` also
contains Eden and Noah first-spread checks after loading. `capture.mjs`
reproduces the sequence against a local dev server. Small ambient motions were
not clock-frozen; the images support layout comparison rather than pixel
comparison.

| Scenario | Before | After | Observation |
| --- | --- | --- | --- |
| Jonah call, phone | [PNG](baseline/phone-jonah-1.png) | [PNG](after/phone-jonah-1.png) | The paper card is gone. The harbor and character occupy the top, with the text on a blue blurred continuation below. |
| Jonah storm, phone | [PNG](baseline/phone-jonah-storm.png) | [PNG](after/phone-jonah-storm.png) | The open book is clear above the text; controls are translucent and the room fades behind the reading area. |
| Jonah storm, desktop | [PNG](baseline/desktop-jonah-storm.png) | [PNG](after/desktop-jonah-storm.png) | The book is separate from the text, the page edge is visible, and the blurred room replaces the opaque sidebar. |
| Jonah call, desktop | [PNG](baseline/desktop-jonah-1.png) | [PNG](after/desktop-jonah-1.png) | Header and controls use the same compact language across spreads. |

## Rubric outcome

| Criterion | Before | After | Confidence |
| --- | --- | --- | --- |
| Book prominence | Partial: large art, but card competes | Improved: no card and clearer framing | High; paired screenshots |
| Visual continuity | Failed: hard card edge | Improved: fade, color-matched background, no card | High; paired screenshots |
| Reading clarity | Dark text on cream card | White text over dark room, subtle underline during narration, and translucent buttons | Medium; screenshots and browser clicks, no human reading study |
| Physical depth | Book cropped at viewport edge | Page edge and spine visible | Medium; the existing 3D stage still looks flatter than mockup 2 |
| Cross-book fit | Not reassessed here | [Eden desktop](after/desktop-eden-1.png), [Eden phone](after/phone-eden-1.png), [Noah desktop](after/desktop-noah-1.png), [Noah phone](after/phone-noah-1.png) | High for first spreads, unassessed for every spread |

The two highest-impact changes were the removal of the opaque reading card and
the missing visual bridge between the 3D book and text. I kept the existing
authored art and added only a newly generated, locally stored room backdrop.
The storm mockup has deeper pop-up staging than the current scene rig; this pass
improves framing, but does not reproduce that new artwork or geometry exactly.
The Jonah call backdrop's harbor is also farther away within the authored art
than in mockup 1; further camera zoom would crop the actor and book.
The “Page complete” status refers to narration; a soundtrack can continue, so
Pause remains the correct transport label while that audio is playing, as in
Lyuba's storm example.

## Checks and review limit

`npm run typecheck` and `npm run build` passed. The built CSS refers to the
background using a relative bundled asset URL, which works below a nested
static path. The `low-graphics` class replaces the small blurred control
surfaces with a solid low-cost color; the room image is static and 70 KB. I
visually inspected desktop and phone captures for Jonah, Eden, and Noah.
Browser capture exercised selecting each book, turning to the storm, and
returning to the shelf. Audible playback and creator approval are unassessed.
This is the implementing agent's visual judgment.

Next question for the creator: should the storm book's authored paper rig be
restaged to add the stronger page volume and layered wave depth shown in mockup
2? That would require an art and rig review beyond this reader layout pass.
