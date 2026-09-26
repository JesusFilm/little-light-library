# Bottom-docked reader — revision after layout feedback

This supersedes the solid-card design in the earlier composition review.
The user rejected its oversized typography, floating placement and solid background.

## Changes

- Portrait reading UI is anchored to the viewport bottom and sizes to the content.
- Phone story text is **16px**, headings **22px**, and controls use an inline icon
  and label with **44px** touch targets.
- Longer text scrolls within a panel capped at **38dvh / 240px** on phones.
- A bottom-solid gradient fades upward over 48px. The reader has no solid card.
- The camera uses the actual panel height and fade clearance, so shorter text
  releases space for the scene. The panel's bottom includes safe-area padding.
- Interaction responses use plain footer text instead of a padded notification box.

## Direct comparison: storm, 360×660

| Measure | Previous PR candidate | Revised |
| --- | --- | --- |
| Reader top | 330px | 502.23px |
| Reader bottom | 557.70px | **660px** |
| Reader height | 227.70px | **157.77px** |
| Viewport occupied by reader | 34.5% | **23.9%** |
| Body / title | 18px / 26px | **16px / 22px** |
| Transport height | 50.64px | **44px** |
| Background | Rounded solid card | **Bottom gradient, transparent above** |

[Previous candidate](../2026-09-26-reader-composition/after-jonah-and-the-whale-2-360x660.png)
· [Revised storm](jonah-and-the-whale-2-360x660.png)
· [Revised Noah](noah-0-360x660.png)
· [Revised Eden](eden-0-360x660.png)

Across the 29 English phone spreads, every reader bottom is 660px. Jonah's panels
range from 157.77px to 179.36px; Eden and Noah never exceed 240px. These dimensions
exclude the 48px fade above the panel. [Recorded layout measurements](layout.json).

## Visual review

[All 29 phone spreads](contact-360x660.jpg) ·
[All 29 desktop spreads](contact-1440x900.jpg) ·
[Desktop storm](jonah-and-the-whale-2-1440x900.png).

The agent inspected all spreads and the [opening-spread locale matrix](contact-locales.jpg). Full text
remains available through scrolling on long/enlarged passages; navigation stays
outside the scroll region. The dock no longer floats above an unused bottom gap.

Enlarged phone text at 360×560: [Eden](eden-200-percent.png),
[Noah](noah-200-percent.png), [Jonah](jonah-and-the-whale-200-percent.png).
These double title/body/metadata CSS sizes, not browser zoom or every control label.

Additional rendered checks cover [active narration](state-playing.png),
[page completion](state-complete.png) and [fish feedback](state-feedback.png). A status can change the panel height and slightly reframe the scene;
controls remain docked, and the measured art region stays above the fade.

## Verification results

`npm run verify:all` passed (exit 0): lint, typecheck, index/catalog, build,
209 unit tests, and mobile/response/room/recovery/failure/audio-continuity suites.
The camera-settled mobile test also passed in its separate final rerun; final lint
passed after that test change. [Verification record](verification.json).

## Verification boundaries

The existing browser journey adds explicit regressions for bottom docking,
reader height ≤40% at phone sizes, 16px default body text, a gradient background
and a transparent reader. The docking assertion failed against the prior build.

Coverage remains all 29 spreads forward/back at phone and desktop sizes, harbor
and storm at six viewport sizes, nine opening-spread locales per book, and three
enlarged-text checks. Existing performance budgets are unchanged.

### Standards review

No blocking findings. The resize observer has no sizing cycle: panel height
changes the art region, which does not determine panel height. Disposal covers
the additional observation; the bounded gradient ignores pointer events.

### Spec / feedback review

No blocking findings against the latest feedback. The smaller, bottom-docked
text and upward fade address the identified problems. Full critical-subject
animation acceptance, real browser zoom/toolbars, physical A50 testing, audible
listening, creator approval and required exact-head CI remain release gates.
The previous candidate's numeric occlusion measurements do not describe this
revised framing and are retained only as historical evidence.

## Verification history

The first mobile run timed out on a fish tap whose coordinates were read during
camera movement. The same runtime passed the subsequent mobile run. The check
now explicitly waits for camera/look settling before measuring discovery targets;
all page readiness and performance measurements still happen before that wait.
The corrected `npm run test:mobile` run passed all three books with no failures;
[recorded results](mobile-report.json) retain the unchanged performance budgets.

An overlapping older verification run also timed out in a failure fixture while
the replacement run reset the shared disposable fixture directory. That older
run is not acceptance evidence; the replacement uses a fresh copy of the build.
