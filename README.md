# Little Light Library

A standalone, static picture-book reader in a child's dimensional bedroom. The shelf has **Adam, Eve, and the Garden**, **Noah and the Great Flood**, and **Jonah and the Whale**. The reader supports nine languages. Eden and Noah have eight spreads each; Jonah has thirteen. The bundled artwork, narration, models, fonts, and loading screen live in this repository.

## Run

```sh
npm ci
npm run dev
```

Open the URL Vite prints. Choose a language and enter the library. Select a book spine, choose **Read**, and use Previous/Next to turn pages. The globe changes language. Settings control speed, mute, and volume. **Library** and **Continue reading** preserve the current book and page. Keyboard, touch, and reduced-motion input are supported.

## Validate and build

```sh
npm run verify
npm run test:room
npm run test:recovery
npm run test:failures
npm run test:audio-continuity
npm run build
```

The production build is `dist/` and uses relative URLs, so it can be served from a nested static path. The catalog is [`public/books/catalog.json`](public/books/catalog.json). The runtime reads only local static assets; optional local narration synthesis is an authoring tool, not a reader dependency.

## GitHub Pages

The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds and deploys the site when `main` changes. In the GitHub repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source. The project site is [jesusfilm.github.io/little-light-library/](https://jesusfilm.github.io/little-light-library/).

## Edit books

Read the [creator guide](docs/creator-guide.md), [book contract](docs/book-contract.md), and [audio/language guide](docs/audio-language-authoring.md). The [book indexes](docs/books/README.md) point to each book's text, art, audio, and source files. Original art and prompts are under `assets/`; browser-ready media is under `public/assets/`. See [AGENTS.md](AGENTS.md) for project conventions.
