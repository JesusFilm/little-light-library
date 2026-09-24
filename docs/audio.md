# Narration production and timing

The prototype uses Kokoro Voice Lab's local Kokoro-82M model to render each authored text segment and each figurine name as a separate 24 kHz mono WAV. The browser serves these files as static assets; it does not call the lab or a speech service. Segment keys follow `locale/story/page/segment`, and names use `locale/names/character`. The `src` and measured duration for each recording are in `public/audio-manifest.json`.

Run from the repository root, with Mac Metal access:

```sh
projects/kokoro-voice-lab/.venv/bin/python prototypes/little-light-library/scripts/audio_produce.py --dry-run
projects/kokoro-voice-lab/.venv/bin/python prototypes/little-light-library/scripts/audio_produce.py
python3 prototypes/little-light-library/scripts/audio_verify.py
```

The generator reads `public/content/{locale}.json` for all nine locales. It validates two stories, eight pages per story, at least two nonempty segments per page and a matching-language voice. Filenames hash the model, exact text, voice and synthesis speed, so unchanged clips are reused across runs. It writes the index after every completed clip and resumes after interruption. A changed phrase receives a new asset; old files can be reviewed and removed separately.

The intended follow-along unit is a coherent phrase, never a guessed word timestamp. Each phrase is synthesized separately, then leading model silence is trimmed to 20 ms before the detected onset and the trailing gap is capped at 120 ms. Detection scans 10 ms PCM windows at a threshold 40 dB below the clip peak; the WAV frame count after trimming supplies the duration. The browser uses WebAudio's audio clock to schedule phrase buffers contiguously, and the active phrase follows that same clock at each reading speed. Muting uses zero gain while retaining the same timeline. Page and language changes invalidate any prior playback event before a new clip begins.

The verification command checks exact manifest coverage, recording format, measured durations, silent failures and waveform onset padding at the four playback rates. This measures the static files, not browser scheduling jitter or perceived pronunciation. An automated WAV check cannot establish naturalness or whether a child can follow the narration. Those need a real listening review and must not be inferred from synthesis success.

The content manifests select these voices from the 54 installed Kokoro voices:

| Locale | Voice |
| --- | --- |
| en-US | `af_heart` |
| en-GB | `bf_emma` |
| es | `ef_dora` |
| fr | `ff_siwis` |
| hi | `hf_alpha` |
| it | `if_sara` |
| ja | `jf_alpha` |
| pt-BR | `pf_dora` |
| zh-CN | `zf_xiaobei` |

The completed pack has 315 clips (32 phrases and three names per locale), 2,310.92 seconds of recorded audio, and 105.80 MiB of WAV files. Assets are fetched on demand by phrase or spread. A rerun dry check found zero clips requiring synthesis. The static verification checked every cue against content and WAV frames, and ten distributed phrase onsets per locale at each speed. The maximum measured speech-onset padding was 26.7 ms at 0.75×, 20.0 ms at 1×, 16.0 ms at 1.25× and 13.3 ms at 1.5×. This is a recording measurement; an integrated browser clock test is required to substantiate total highlight error and drift.

The selected voices were checked against the model's actual voice inventory and each generated a nonempty recording. I could not hear the clips in this execution environment. Consequently there is **no completed listening review** for pronunciation, names, pacing or suitability, and no credible by-ear comparison of alternative voice samples. The concrete resume step is to listen to representative first, middle and last phrases from both books in each locale, plus all three names, and regenerate any unacceptable phrase after correcting the content or selecting another same-language voice. Do not describe this pack as pronunciation approved before that review.

After independent editorial corrections, eleven changed phrases were regenerated. Audio validation now verifies each filename hash against the current text and voice as well as its measured duration. Browser page-start scheduling evidence is in [timing-results.json](timing-results.json); phrase-continuity evidence is recorded separately. These do not constitute a listening review.
