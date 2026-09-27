# Little Light Library

**Throwaway portrait prototype — `codex/portrait-story-prototype`.** This branch experiments with a dimensional cover carousel and close, scripted story cameras instead of the bedroom. See the [prototype brief and review notes](.scratch/portrait-story-prototype/spec.md).

A standalone, static picture-book reader. The shelf has **Adam, Eve, and the Garden**, **Noah and the Great Flood**, and **Jonah and the Whale**. The reader supports nine languages. Eden and Noah have eight spreads each; Jonah has thirteen. The bundled artwork, narration, models, fonts, and loading screen live in this repository.

## Run

```sh
npm ci
npm run dev
```

Open the URL Vite prints. Choose a language and enter the library. Swipe or use the arrows to choose a cover, tap the centered cover to read, and use Previous/Next to turn pages. Each spread has its own close camera sequence. On a phone in portrait, drag the artwork to pan across the page; the position holds until the page changes. In Settings, choose **Enable phone tilt**, allow motion access if asked, and hold the phone comfortably for calibration. Tilting then adds depth independently of panning. Desktop retains mouse-controlled depth without panning. The globe changes language. Settings control speed, mute, and volume. **Library** and **Continue reading** preserve the current book and page. Keyboard, touch, and reduced-motion input are supported.

## Validate and build

Install Node.js 22 or newer and local `ffmpeg` (included with FFmpeg) for media
validation. Browser checks use installed Chrome locally; CI installs Chromium.

```sh
npm run verify:all
```

The production build is `dist/` and uses relative URLs, so it can be served from a nested static path. The catalog is [`public/books/catalog.json`](public/books/catalog.json). The runtime reads only local static assets; optional local narration synthesis is an authoring tool, not a reader dependency.

## GitHub Pages

On this experimental branch, `prototype-pages.yml` validates and publishes the prototype to the existing Pages URL whenever this branch is pushed. This temporarily replaces the public reader for mobile testing. The main branch remains unchanged; its normal Pages workflow can restore the main experience.

The workflows in [`.github/workflows/verify.yml`](.github/workflows/verify.yml) and [`.github/workflows/pages.yml`](.github/workflows/pages.yml) verify the reader and deploy the exact passing build when `main` changes. The required **Reader and mobile acceptance** check protects `main`, including administrator merges. See the [mobile budgets and review process](review/mobile-acceptance.md). In the GitHub repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source. The project site is [jesusfilm.github.io/little-light-library/](https://jesusfilm.github.io/little-light-library/).

## Edit books

Read the [creator guide](docs/creator-guide.md), [book contract](docs/book-contract.md), and [audio/language guide](docs/audio-language-authoring.md). The [book indexes](docs/books/README.md) point to each book's text, art, audio, and source files. Original art and prompts are under `assets/`; browser-ready media is under `public/assets/`. See [AGENTS.md](AGENTS.md) for project conventions.
