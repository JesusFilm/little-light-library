# Mobile release acceptance

Mobile is the primary reader experience. Run `npm run verify:all` before release.
GitHub pull requests run the same verification. Pages deploys only the artifact
produced by the successful verification job, without rebuilding it. `main` requires
the **Reader and mobile acceptance** check on an up-to-date pull request, including
administrator merges.

## Automated evidence

`scripts/mobile-check.mjs` uses real touch controls against the built static site
under a nested URL. Each book starts in a fresh browser context. It traverses every
page forwards and backwards, changes through all nine locales, uses playback and
settings controls, rotates the viewport, and returns to the shelf and reader.
The server compresses text resources and permits normal browser media caching.

The committed budgets are in `review/mobile-budgets.json`. The profile uses a
360 × 660 CSS viewport at device scale 3, 4× CPU slowdown, 150 ms latency and
1.6 Mbps download. It reports two logical cores and 2 GB device memory to exercise
resource-constrained feature selection. Budgets distinguish immediate feedback,
completed artwork/audio, warm navigation, transferred bytes and raster resolution.

Input latency starts at the real pointer event; browser-automation waits for
button animations are excluded. Rotation checks wait for ResizeObserver to
resize the drawing buffer. GPU texture/geometry counts must remain bounded
through repeated transfers; these counts do not measure physical device RAM.

The test records screenshots, browser traces, decoded non-silent audio source
observations, failures and measurements under `.test-output/mobile-acceptance`.
GitHub preserves evidence on failure as well as success. Other browser suites
exercise failure/retry, keyboard controls, reduced motion and audio continuity.
Fixture suites use a disposable build copy so synthetic books never enter the
site artifact.

## Required visual and device review

CPU/network emulation does not emulate Samsung A50 GPU performance, thermal
throttling, available RAM or storage pressure. Raster resolution is a measurable
floor, not proof of acceptable artwork or antialiasing. Audio source observations
do not establish audible quality or editorial approval.

Review portrait and landscape captures for readable text, crisp book edges and
characters, large controls, unobscured artwork, and a continuous actual 3D room
behind transparent reader UI. Page text and visible artwork must describe the
same scene throughout loading, or the loading state must clearly hide stale art.
Do not substitute a generated room photograph behind the real scene.

Before declaring the A50 issue resolved, open the proposed build in Chrome on the
Samsung A50 with a cold cache and constrained connection. Open each book, turn
pages, interact with characters, pause/resume narration, change language and
return to the shelf repeatedly. Confirm both audible narration and responsive
input, inspect sharp edges, and note browser/device versions and any failures.
Record automated checks, visual inspection, audible playback and creator/device
approval separately in the pull request. Do not relax a failing budget merely to
make CI green; changes require an explained product decision.
