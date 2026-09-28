# Portrait story prototype

Status: Awaiting creator review
Branch: `codex/portrait-story-prototype`

Question: Does a cover carousel and close, narrated camera sequence make the existing paper-stage books compelling on a slow phone held in portrait?

This branch is disposable. The requested single direction supersedes the prototype skill's generic recommendation to build three unrelated variants. No content, catalog IDs, recordings, or source artwork are being replaced.

## Experience

- Three dimensional CSS covers with local artwork, cloth palettes, readable localized titles, a gentle cover animation, swipe and arrow navigation. Tap the centered cover to open it directly.
- A paper stage on a softly lit surface with a blurred reading-nook backdrop. Each spread has distinct timed holds, close push-ins, subject reveals, vertical moves or small arcs. Camera time follows narration, including pause and playback speed; shots stay close instead of automatically ending on an overview.
- No whole-page toggle. Reduced motion uses the stable complete composition. Mouse position and touch drag orbit around the active camera subject, including on constrained phones. Drag release eases back; story copy remains independently scrollable.
- Preserve the three books, nine locales, existing audio controls and failure recovery.

## Performance choices

- Do not construct the room, load its wallpaper or load cabinet toys.
- CSS transforms for the carousel; suspend WebGL frames when browsing.
- Reuse the committed mobile WebP derivatives. No new runtime network services.
- Constrained phones: 1× device pixel ratio, no multisample antialiasing, no shadow maps, existing approximately 30 fps cap. Other devices remain capped at 1.5×.
- This intentionally differs from the original mobile acceptance suite's 1.5× minimum; judge legibility against actual performance before promotion.

## First iteration review

Automated: 209 existing unit tests passed; typecheck, Prettier, book indexes, catalog/media validation and production build passed. The production build was served under `/preview/little-light-library/` and walked through all 29 pages, all nine locale selections, four book openings including a return to Eden, desktop/portrait resizing, reduced motion, keyboard opening, mute and volume. No browser page errors were recorded. A separate touch walkthrough verified swipe selection, direct opening, forced artwork failure and retry, pause freezing camera time, and overview switching.

Visual: inspected the carousel, Eden character close-ups, sampled Noah and Jonah spreads, and desktop overview screenshots at 390×844, 360×660 and 1440×900. This is sampled composition review, not approval of every close-up at every instant.

GPU resource snapshots at the first page of Eden → Noah → Jonah → Eden: 29/28/24/29 draw calls, 8/8/8/9 textures, 27/29/26/30 geometries. These are transient browser samples, not a long-duration memory-leak proof.

Performance sample: Chrome with 4× CPU throttling and 2 GB / 2-core device hints rendered the Eden reading view at a sampled 95th-percentile frame interval of 34.1 ms (30 samples), at 1× render resolution and 29 draw calls. This is not a calibrated handset benchmark.

Audible playback: not reviewed. Creator approval: pending. Physical slow-phone performance: not verified. The old room-specific browser acceptance harness is not a certification of this intentionally different prototype.

Verdict: the experiment is ready to compare with main; whether it is a better reading experience remains a creator decision. Automated checks are not audible listening or editorial approval. Browser phone emulation does not establish performance on physical low-end hardware.

Run with `npm run dev` on this branch.


## Second iteration: creator feedback

Creator liked the closer view but rejected the solid background, repetitive left/right/zoom-out pattern, excessive wide framing, whole-page button and missing mobile parallax.

Changes: removed the button; reduced portrait shot distances and camera elevation; replaced shared two-target choreography with per-spread timed keyframes; added a table, blurred reading-nook plane and soft contact shadow (two 512×256 textures and one 128×128 texture, no external media or postprocessing); bound mouse and touch movement to the current story subject. Canvas pointer capture and `touch-action: none` prevent document dragging. Movement beyond the tap threshold cancels character taps/holds. Touch release, pointer cancellation, blur and page changes clear the gesture. Reduced motion suppresses camera movement.

Verification: 209 existing tests, typecheck, formatting and production build passed. The nested static-build walkthrough opened all 29 pages, returned to Eden, switched through all nine locales, and exercised keyboard opening, mute/volume, reduced motion, touch cancellation and independently scrollable story text. Direct touch testing confirmed that dragging changes the camera without scrolling the document or activating a character; release returns parallax to zero. Mouse movement changed the camera around the current shot, including with constrained-phone graphics enabled. Narration time stayed frozen during paused drag inspection. No browser page errors were recorded.

Visual inspection: 390×844 close views of Eden, Eve, touch-dragged perspective; 360×660 Noah and Jonah ending scenes; desktop and reduced-motion composition. Cropped scene edges are intentional in close shots; this is still sampled review, not every-frame approval.

Performance sample: 4× Chrome CPU throttling with 2 GB / 2-core hints gave a 34 ms sampled p95 frame interval (30 samples), 31 draw calls and 11 textures at 1× render resolution for Eden. This remains a desktop emulation sample, not physical-handset evidence.

Audible and physical-handset review remain outstanding; this feedback does not constitute approval of the revised implementation.


## Third iteration: pan, sensors and rigid artwork

Mobile portrait drag now pans the close view within bounds derived from the page and current view size. Position holds for inspection, resets on page change, and is ignored in desktop/landscape views. Phone tilt is a separate Settings opt-in, requests iOS permission from the button gesture, calibrates from the first valid reading and re-calibrates after orientation/visibility changes. Sensor values stay in memory. Denied permission or unavailable readings retain drag access. Reduced motion suppresses tilt and scripted camera motion. Desktop retains mouse parallax and has no manual pan.

Confirmed the stretching in the actual creature update with a deterministic repro: maximum serpent vertex movement was 0.167 page units without any camera. This isolated vertex deformation as the cause, so broader camera/shader hypotheses were unnecessary. Replaced masked vertex deformation in serpent/dove with small whole-cutout rotation and uniform tap scale, preserving mirrored art, placement, reduced-motion feedback and texture ownership. The same repro now reports zero distortion. Updated the two creature tests to check rigid geometry throughout full animation/touch cycles.

Publication requested by the creator: use the existing GitHub Pages URL for this branch. `prototype-pages.yml` runs standard validation plus the branch-specific nested-path browser acceptance test before uploading/deploying the site. This deliberately uses carousel/mobile assertions instead of main's room-oriented acceptance selectors. Main's workflow remains intact.

## Fourth iteration: carousel activation and phone landscape

Creator screenshots exposed side-cover activation and a transform override: the global `button:hover` translation replaced the cover's positioning transform. Side covers are now disabled and ignore pointer events; only the centered cover opens. Arrows, swipes and keyboard arrows still change focus. The explicit cover hover transform preserves its placement. Removed both marketing slogans and gave the covers the released space.

Close framing now applies to coarse-pointer phones in either orientation; a landscape phone no longer receives the wider desktop camera. Desktop fine-pointer framing and portrait-only pan behavior remain unchanged.

The prototype browser acceptance now checks a real side-cover tap, disabled side controls, stable cover geometry during hover, absence of the intro block, and close framing after rotating a phone viewport to 844×390, alongside the existing 29-page checks.
