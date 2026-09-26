# Reader composition corrective review — 26 September 2026

Status: draft for visual/device review; **not release approval**.

The reported full-page darkening was a real regression. An absolutely positioned
reader pseudo-element measured 1344px high around a 225.9px reader at 854×1316.
The contrast background now belongs to the reader card itself. A measured art
rectangle drives the camera; text and transport occupy a separate region.

## Matched visual comparisons

Baseline: shipped `main`, `b69d74a4bc326634a1621e6e73b4ad65ad40e13b`.
Candidate: runtime changes in this PR, based on
`f048f3535a156dc90cf22fe8f85461255cd5cb93` (the branch merged by that baseline).
Chrome 154.0.8037.57, Apple M4 Pro / ANGLE Metal, DPR 1, English (en-US),
reduced motion, paused narration, scroll at top, no simulated browser toolbar or
safe-area inset. Captures use built local static assets under `/nested/`.

| Scenario | Before | After | Review observation |
| --- | --- | --- | --- |
| Noah, opening spread, 360×660 | [Before](before-noah-0-360x660.png) | [After](after-noah-0-360x660.png) | Noah and the paper base are clear of the text. Long copy scrolls above fixed transport. Smaller character than the old cropped composition. |
| Jonah, storm, 360×660 | [Before](before-jonah-and-the-whale-2-360x660.png) | [After](after-jonah-and-the-whale-2-360x660.png) | Hull and waves are visible without the gradient. Full book fits; ship is appreciably smaller. |
| Jonah, storm, 1440×900 | [Before](before-jonah-and-the-whale-2-1440x900.png) | [After](after-jonah-and-the-whale-2-1440x900.png) | Larger book and ship; less floor. The solid reading card is clearly separate from the illustration. |

### Draft measurements, with trade-offs

[Coordinates/results](measurements.json), [reproduction script](measure.py), and
[phone before](phone-before-annotation.svg) / [phone after](phone-after-annotation.svg) /
[desktop before](desktop-before-annotation.svg) / [desktop after](desktop-after-annotation.svg)
annotations retain the originals. Green outlines manually trace the outer book/story
region, including standing art and paper base. Red marks the baseline gradient's
0.10-alpha boundary, interpolated from its CSS stops at 31svh and 46svh.
Coordinate tolerance is approximately 3px; ship width tolerance is 5px.

- Phone visible book region obscured by alpha >0.10: **50.63% → 0%**.
- Phone ship width: **263px → 151px** (about **43% smaller**). This is an important
  review trade-off; zero overlap alone does not establish acceptable subject size.
- Desktop book occupancy of the same available art rectangle: **33.97% → 44.26%**,
  a **30.3% relative increase**. Ship width: **350px → 405px**.

These outer outlines are a reproducible framing proxy, **not approved
critical-subject masks**. They support the direction of improvement but do not
complete the spec's polygon/maximum-excursion acceptance gate.

## All-book sanity check

- All **29 spreads** traversed forward and backward at **360×660** and **1440×900**.
  [Phone contact sheet](contact-360x660.jpg), [desktop contact sheet](contact-1440x900.jpg).
  All rendered spreads were visually inspected by the agent. No further text/art
  overlap or clipped transport was found in these settled captures.
- Harbor and storm additionally checked at 360×560, 390×844, 740×360, and 900×1440:
  **66 spread/viewport captures** total. Geometry and stable spread IDs are in
  [report.json](report.json); raw captures remain in the ignored local test output.
- **All nine locales** captured for each book's first spread:
  [27-image contact sheet](contact-locales.jpg). This is not every translated spread.
- Largest opening-spread wrapping, selected by measured scrollHeight: Spanish
  for Eden and Noah (ties resolved by locale order), Brazilian Portuguese for
  Jonah. [Eden](eden-wrapping.json), [Noah](noah-wrapping.json), [Jonah](jonah-and-the-whale-wrapping.json).
- Doubled title/body/metadata at 360×560, scrolled to the end, with transport visible:
  [Eden](eden-200-percent.png), [Noah](noah-200-percent.png),
  [Jonah](jonah-and-the-whale-200-percent.png). This is CSS text enlargement,
  not a browser-zoom or enlarged-control-label test.

The browser assertions also require no reader pseudo-element scrim, no horizontal
overflow, separated art/card rectangles, transport targets ≥44px in the viewport,
a usable text scroll region, and scene-target centers inside the art region.
Target centers do not prove every animated silhouette stays inside that region.

## Verification and review boundaries

- Repository verification: formatting, typecheck, generated book index, catalog,
  production build, and **209 unit tests passed**.
- Browser suites: mobile, response, room, recovery, failure, and audio continuity.
  Mobile passes all three books with unchanged budgets, actual scene touches,
  fish activation and ship hold/release/touch-cancel.
- [Mobile report](mobile-report.json): 4× CPU throttle, 150ms latency, 1.6Mbps,
  two cores / 2GB reported memory, DPR 3 viewport and ≥1.5 raster ratio. Desktop
  hardware emulation is **not a physical Samsung A50 result**.
### Standards review

No blocking findings in the final review of composition fitting, input cleanup,
authored target accessibility or notice placement.

### Spec review

No blocking functional findings. The evidence limits below remain; implementation
review does not establish full visual acceptance.

Pending before release: agreed critical-subject masks and full animation-excursion
review; transitions/rotation clips; browser zoom and real toolbar/safe-area behavior;
physical A50 smoke; audible listening; creator approval; exact-head required CI and
verified-artifact deployment/live smoke. No permanent runner was installed.
Automated audio continuity proves state/source behavior, not listening quality.

## Failed checks retained

The first integrated run failed the new ship-hold test: its bounding-box center
falls in transparent space between sail and hull. A real touch on the painted hull
started the hold. The test now uses 75% of target height; runtime alpha picking and
performance budgets were preserved. The corrected mobile run passed all three books.

Early enlarged-text captures were taken before Chrome repainted a resized/scrolled
layer. Settled captures and DOM bounds showed valid transport placement; the check
now waits for repaint. Locale selection now waits for the selected language before
closing the dialog, so comparisons cannot silently inherit the previous locale.

### Recorded mobile results

| Book | Cold shelf | Max page ready | Max warm turn | Render p95 | Max page transfer | Texture / geometry growth |
| --- | --- | --- | --- | --- | --- | --- |
| eden | 3914ms | 2282ms | 621ms | 34ms | 460,737 bytes | 3 / 3 |
| noah | 3774ms | 2536ms | 604ms | 34ms | 364,270 bytes | 3 / 3 |
| jonah-and-the-whale | 3782ms | 2797ms | 637ms | 34ms | 477,793 bytes | 0 / -3 |

Budgets are unchanged; the JSON includes every reading, language and input measurement.
These are candidate absolute measurements; no matched performance-delta claim is made.
