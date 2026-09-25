# Mobile media derivatives

The reader serves local static media. `npm run media:optimize` requires local
`ffmpeg`, `ffprobe`, and Python Pillow with WebP support. It creates reproducible
phone images and MP3 audio without changing book, spread, segment, or asset IDs.

- The 436 original 24 kHz WAV recordings live under
  `assets/source-recordings/`, with their original paths below that directory.
  New WAVs from the authoring tools are moved there on the next optimization
  run. The matching runtime MP3s live under `public/assets/` and use 48 kb/s
  mono narration or 80 kb/s mono soundscape encoding with gapless metadata.
  Original recordings, prompt/source notes, and attribution remain available.
- The 114 original runtime images remain under `public/assets/`. The generator
  creates `.mobile.webp` derivatives for narrow screens, at up to 768 px on
  scenery, 640 px on most cutouts, and 1152 px on multi-pose actor atlases.
  Three `.cover.webp` derivatives at up to 256 px serve the shelf. The explicit
  `src/generated-media.ts` list lets new or fixture images use their original
  paths until optimized.
- The reader loads only the current page's decoded audio. At most two encoded
  assets from the next page are prepared after playback starts and a 1.2 s
  delay, capped at
  512,000 bytes total; Data Saver disables preparation. Page changes clear
  prior encoded preparation, and the decoded buffers from prior pages are
  released. `BookAudio.cacheFootprint` reports decoded and encoded residency.
- Inspecting one shelf book begins fetching just that book's first-page phone
  art and localized compressed audio into the browser HTTP cache. It does not
  decode those files or inspect other shelf books. Requests are capped at
  three parallel images and one audio cue; changing selection, returning the
  preview, or changing language aborts in-flight requests. Data Saver skips
  inspection prefetch. The current catalog's largest first-page encoded set is
  under 650 kB across all nine locales.

The conversion script checks source/MP3 container durations within 3 ms, and
the reader uses Web Audio's decoded durations for its segment clock. Run
`python3 scripts/audio_verify.py`, `npm run book:catalog`, and the browser suites
after optimization. Listening approval is separate from duration and onset
checks; a child-facing listen should review phrasing, clipping, and soundscape
transitions on a real device.
