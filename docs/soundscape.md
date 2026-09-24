# Procedural atmosphere and tactile sound

The prototype now has an original Web Audio sound layer, with no downloaded samples or network requests. It is deliberately quiet and leaves narration in front. This is an implementation and signal-level review; no claim of an auditory listening review is made.

The room uses soft, sparse sine-tone chimes over a slowly decaying open-fifth bed. Eden adds filtered leaf-like noise and occasional two-part birdsong. Storm scenes remove the bright melody and use lower tones, rain-like noise and a soft low rumble. Hope restores the melody and adds a higher chime and bird. A six-second phrase advances through four roots; tones overlap at the phrase boundary without restarting every animation frame.

Opening a book combines a low cover thump, paper texture and three ascending chimes. Turning a page uses two short paper swishes. Closing uses a shorter thump/rustle. Figurines respond with a wooden tap and three small bell notes. Ordinary controls have a very short soft tick. These are stylized synthesized sounds, not recordings of literal objects.

## Integration

Create `new Soundscape(narration.context)` once. The shared context remains owned by narration; this class never suspends or closes it. Existing user-gesture unlocking starts the score via the context's state event.

- `settings(volume, enabled)` mirrors the existing volume and audio preference.
- `scene("room" | "eden" | "storm" | "hope")` changes the environment; unchanged calls do not restart it.
- `cue("open" | "page" | "close" | "figure" | "tap")` responds to accepted interactions, preferably at the matching visual action.
- `narration(narration.clock.playing)` may run in the existing animation update; unchanged values are ignored. It reduces the atmosphere gain from 0.1 to 0.032, approximately 9.9 dB, with a smooth 180 ms transition. Foley is also reduced.
- `pause(document.hidden)` stops scheduling and fades active sources when hidden. Returning can restore quiet ambience while narration retains its explicit-resume policy.
- `dispose()` removes the context listener, clears the scheduler and disconnects output.

Choose storm for judgment/flood scenes, including the serious Fall consequence scenes if appropriate. Choose hope for the final Noah promise. Keep the music below speech rather than raising it to compensate for a quiet speaker.

## Objective review

TypeScript strict checking passes. Chrome's `OfflineAudioContext` rendered seven-second samples at 48 kHz. An offline-only context wrapper exposed the running state so the first bar could be scheduled before rendering; this verifies actual Web Audio synthesis, not real-time timer cadence. All nine scene/cue variants produced finite, nonzero samples. Every scheduled voice had ended and removed itself by seven seconds. Master mute produced exact digital silence.

| Render                | Peak absolute amplitude |     RMS |
| --------------------- | ----------------------: | ------: |
| Room                  |                 0.06212 | 0.00807 |
| Eden                  |                 0.06163 | 0.00808 |
| Storm                 |                 0.05115 | 0.00748 |
| Hope                  |                 0.06212 | 0.00825 |
| Open, with room bed   |                 0.07718 | 0.01022 |
| Page, with room bed   |                 0.06212 | 0.00816 |
| Close, with room bed  |                 0.06212 | 0.00822 |
| Figure, with room bed |                 0.06473 | 0.00902 |
| Tap, with room bed    |                 0.06212 | 0.00808 |

The highest measured sample is approximately −22.3 dBFS, leaving substantial headroom for narration. This does not prove the subjective mix, emotional quality or speech intelligibility. Those need listening in the integrated reader, especially on small speakers. Offline tests found an immediate scene-switch scheduling delay; restarting the phrase scheduler on a scene change corrected it before these final measurements.
