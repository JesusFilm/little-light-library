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

### Hosted runner limitation (26 September 2026)

The current PR's local GPU run passes the committed budgets. Hosted renderer
probes found SwiftShader on standard Linux and Windows runners (roughly
392–568 ms p95 frames without CPU throttling). The standard hosted Mac's
paravirtual Metal device reached about 98 ms p95, also above the 50 ms budget.
These measurements describe the CI machines, not a Samsung A50. The required
check remains enforced; no performance budget has been relaxed. Verification
now targets a reviewed Mac GPU runner and uses installed Chrome. The mobile
report records the actual GPU backend as well as browser version.
`scripts/renderer-check.mjs` retains the manual diagnostic for checking a proposed
runner. Temporary cross-platform diagnostic workflow jobs have been removed.

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

## Temporary GPU runner operation

The required job targets `[self-hosted, macOS, ARM64, lll-reviewed-gpu]`.
This label does not imply that a runner is always available. Without an approved
runner the job queues and deployment stays blocked. Standard hosted software
rendering cannot provide representative frame-budget evidence.

For this release the owner authorized an ephemeral runner on their Mac. Start it
only for a reviewed workflow run, with an external job-start hook that validates
the exact repository, run ID, event and commit SHA before any workflow steps.
For a pull request, validate both the tested merge SHA and its reviewed head SHA.
Register with `--ephemeral`, use a fresh temporary work directory, and remove
registration credentials after the one job. Never install a persistent service.
Repeat explicit allowlisting for the resulting main commit's Pages verification.
Do not start this runner for unknown PRs or automatically trust new commits.

Prerequisites are Node 22 (provisioned by setup-node), local FFmpeg, and installed
Google Chrome with native GPU access. Future releases need an equivalently
reviewed ephemeral runner or a dedicated isolated GPU CI service. Retain the same
mobile budgets and deploy only the verified artifact.
