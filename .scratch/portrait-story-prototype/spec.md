# Portrait story prototype

Status: Awaiting creator review
Branch: `codex/portrait-story-prototype`

Question: Does a cover carousel and close, narrated camera sequence make the existing paper-stage books compelling on a slow phone held in portrait?

This branch is disposable. The requested single direction supersedes the prototype skill's generic recommendation to build three unrelated variants. No content, catalog IDs, recordings, or source artwork are being replaced.

## Experience

- Three dimensional CSS covers with local artwork, cloth palettes, readable localized titles, a gentle cover animation, swipe and arrow navigation. Tap the centered cover to open it directly.
- A room-free paper stage, close establishing view, first subject, second subject, and return to the establishing composition. Camera time follows narration, including pause and playback speed.
- Whole-page toggle; reduced motion uses the stable complete composition. Text remains independently scrollable above touch-sized transport controls.
- Preserve the three books, nine locales, existing audio controls and failure recovery.

## Performance choices

- Do not construct the room, load its wallpaper or load cabinet toys.
- CSS transforms for the carousel; suspend WebGL frames when browsing.
- Reuse the committed mobile WebP derivatives. No new runtime network services.
- Constrained phones: 1× device pixel ratio, no multisample antialiasing, no shadow maps, existing approximately 30 fps cap. Other devices remain capped at 1.5×.
- This intentionally differs from the original mobile acceptance suite's 1.5× minimum; judge legibility against actual performance before promotion.

## Review

Automated: 209 existing unit tests passed; typecheck, Prettier, book indexes, catalog/media validation and production build passed. The production build was served under `/preview/little-light-library/` and walked through all 29 pages, all nine locale selections, four book openings including a return to Eden, desktop/portrait resizing, reduced motion, keyboard opening, mute and volume. No browser page errors were recorded. A separate touch walkthrough verified swipe selection, direct opening, forced artwork failure and retry, pause freezing camera time, and overview switching.

Visual: inspected the carousel, Eden character close-ups, sampled Noah and Jonah spreads, and desktop overview screenshots at 390×844, 360×660 and 1440×900. This is sampled composition review, not approval of every close-up at every instant.

GPU resource snapshots at the first page of Eden → Noah → Jonah → Eden: 29/28/24/29 draw calls, 8/8/8/9 textures, 27/29/26/30 geometries. These are transient browser samples, not a long-duration memory-leak proof.

Performance sample: Chrome with 4× CPU throttling and 2 GB / 2-core device hints rendered the Eden reading view at a sampled 95th-percentile frame interval of 34.1 ms (30 samples), at 1× render resolution and 29 draw calls. This is not a calibrated handset benchmark.

Audible playback: not reviewed. Creator approval: pending. Physical slow-phone performance: not verified. The old room-specific browser acceptance harness is not a certification of this intentionally different prototype.

Verdict: the experiment is ready to compare with main; whether it is a better reading experience remains a creator decision. Automated checks are not audible listening or editorial approval. Browser phone emulation does not establish performance on physical low-end hardware.

Run with `npm run dev` on this branch.
