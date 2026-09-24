# Noah and the Great Flood

Generated per-book review index. Source text stays in locale files; page staging stays in TypeScript. Regenerate with `npm run book:index`.

## Source files

- Shelf entry and palette: [public/books/catalog.json](../../public/books/catalog.json)
- Base story, title, and page text: [public/content/en-US.json](../../public/content/en-US.json)
- Localized titles and page text: [en-GB](../../public/content/en-GB.json), [en-US](../../public/content/en-US.json), [es](../../public/content/es.json), [fr](../../public/content/fr.json), [hi](../../public/content/hi.json), [it](../../public/content/it.json), [ja](../../public/content/ja.json), [pt-BR](../../public/content/pt-BR.json), [zh-CN](../../public/content/zh-CN.json)
- Measured narration manifest: [public/audio-manifest.json](../../public/audio-manifest.json)
- Shared page staging contract and composition: [src/stage-direction.ts](../../src/stage-direction.ts), [src/noah-stage-direction.ts](../../src/noah-stage-direction.ts), [src/stage-direction-types.ts](../../src/stage-direction-types.ts)
- Shared stage surfaces and alpha-aware cutout geometry: [src/garden-floor.ts](../../src/garden-floor.ts), [src/stage-prop-geometry.ts](../../src/stage-prop-geometry.ts), [src/alpha-bounds.ts](../../src/alpha-bounds.ts)
- Shared legacy scene renderer and motion: [src/scene.ts](../../src/scene.ts), [src/stage-motion.ts](../../src/stage-motion.ts)
- Shared actor transitions: [src/paper-actor.ts](../../src/paper-actor.ts)
- Shared narration transport and page-range audio: [src/book-reader-audio.ts](../../src/book-reader-audio.ts), [src/book-audio.ts](../../src/book-audio.ts)
- Shared room ambience: [src/soundscape.ts](../../src/soundscape.ts)

The cover artwork begins with page one, [assets/art/noah-01.webp](../../public/assets/art/noah-01.webp). Eden and Noah retain their established localized voice and character rigs.

- Book-specific art notes and source inventory: [assets/books/noah-and-the-great-flood/README.md](../../assets/books/noah-and-the-great-flood/README.md).
- Editable source art and prompts: [assets/books/noah-and-the-great-flood/prompts/noah-ark-interior-backdrop.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-ark-interior-backdrop.txt), [assets/books/noah-and-the-great-flood/prompts/noah-ark-interior-plank-floor.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-ark-interior-plank-floor.txt), [assets/books/noah-and-the-great-flood/prompts/noah-covenant-shore-backdrop.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-covenant-shore-backdrop.txt), [assets/books/noah-and-the-great-flood/prompts/noah-family-seven-sober.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-family-seven-sober.txt), [assets/books/noah-and-the-great-flood/prompts/noah-shore-stone-ground.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-shore-stone-ground.txt), [assets/books/noah-and-the-great-flood/prompts/noah-stone-altar.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-stone-altar.txt), [assets/books/noah-and-the-great-flood/prompts/noah-storm-water-ground.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-storm-water-ground.txt), [assets/books/noah-and-the-great-flood/prompts/noah-storm-wave-crest.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-storm-wave-crest.txt), [assets/books/noah-and-the-great-flood/prompts/noah-worksite-earth-ground.txt](../../assets/books/noah-and-the-great-flood/prompts/noah-worksite-earth-ground.txt), [assets/books/noah-and-the-great-flood/source-art/noah-ark-interior-backdrop.png](../../assets/books/noah-and-the-great-flood/source-art/noah-ark-interior-backdrop.png), [assets/books/noah-and-the-great-flood/source-art/noah-ark-interior-plank-floor.png](../../assets/books/noah-and-the-great-flood/source-art/noah-ark-interior-plank-floor.png), [assets/books/noah-and-the-great-flood/source-art/noah-covenant-shore-backdrop.png](../../assets/books/noah-and-the-great-flood/source-art/noah-covenant-shore-backdrop.png), [assets/books/noah-and-the-great-flood/source-art/noah-family-seven-sober.png](../../assets/books/noah-and-the-great-flood/source-art/noah-family-seven-sober.png), [assets/books/noah-and-the-great-flood/source-art/noah-shore-stone-ground.png](../../assets/books/noah-and-the-great-flood/source-art/noah-shore-stone-ground.png), [assets/books/noah-and-the-great-flood/source-art/noah-stone-altar.png](../../assets/books/noah-and-the-great-flood/source-art/noah-stone-altar.png), [assets/books/noah-and-the-great-flood/source-art/noah-storm-water-ground.png](../../assets/books/noah-and-the-great-flood/source-art/noah-storm-water-ground.png), [assets/books/noah-and-the-great-flood/source-art/noah-storm-wave-crest.png](../../assets/books/noah-and-the-great-flood/source-art/noah-storm-wave-crest.png), [assets/books/noah-and-the-great-flood/source-art/noah-worksite-earth-ground.png](../../assets/books/noah-and-the-great-flood/source-art/noah-worksite-earth-ground.png).
- Book-local runtime art: [assets/books/noah-and-the-great-flood/art/noah-ark-interior-backdrop.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-ark-interior-backdrop.webp), [assets/books/noah-and-the-great-flood/art/noah-ark-interior-plank-floor.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-ark-interior-plank-floor.webp), [assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp), [assets/books/noah-and-the-great-flood/art/noah-family-seven-sober.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-family-seven-sober.webp), [assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp), [assets/books/noah-and-the-great-flood/art/noah-stone-altar.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-stone-altar.webp), [assets/books/noah-and-the-great-flood/art/noah-storm-water-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-storm-water-ground.webp), [assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp), [assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp).

## Page sequence, text, art, and scene direction

### 01. A world gone wrong (`noah-01`)

**Passage:** Genesis 6:5–22

**Page art:** [assets/art/noah-01.webp](../../public/assets/art/noah-01.webp)

**Read-aloud text (en-US):**

- `s1`: God saw that violence and wickedness had spread across the earth. The world he made good was filled with terrible harm.
- `s2`: Noah walked with God. God told him that a great flood was coming, and gave him a way to protect his family and the animals.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/shipyard.webp](../../public/assets/art/theatre/shipyard.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp)
- noah actor: pose 2, mood `listen`, position (-0.3, -0.5); artwork [assets/art/theatre/noah-poses.webp](../../public/assets/art/theatre/noah-poses.webp).

### 02. Build a great ark (`noah-02`)

**Passage:** Genesis 6:14–22

**Page art:** [assets/art/noah-02.webp](../../public/assets/art/noah-02.webp)

**Read-aloud text (en-US):**

- `s1`: God told Noah to build an enormous ark with rooms inside, strong enough to ride the rising water. Noah followed God's instructions.
- `s2`: He covered the ark so water could not enter. It was no little boat; it was a place of shelter for a family and many creatures.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/shipyard.webp](../../public/assets/art/theatre/shipyard.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp)
- noah actor: pose 0, mood `work`, position (-0.35, 0.1); artwork [assets/art/theatre/noah-poses.webp](../../public/assets/art/theatre/noah-poses.webp).
- timber-bench prop: visible width 2.25, position (-0.45, -0.35); artwork [assets/art/theatre/timber-bench.webp](../../public/assets/art/theatre/timber-bench.webp).

### 03. Into the ark (`noah-03`)

**Passage:** Genesis 7:1–16

**Page art:** [assets/art/noah-03.webp](../../public/assets/art/noah-03.webp)

**Read-aloud text (en-US):**

- `s1`: Animals came to Noah, pairs of every kind, and Noah brought them inside. His wife, his sons, and their wives entered too.
- `s2`: Then God shut the door. Rain began to fall, and the ark waited while the world outside changed.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/boarding.webp](../../public/assets/art/theatre/boarding.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp)
- noah actor: pose 2, mood `welcome`, position (-1.65, -0.55); artwork [assets/art/theatre/noah-poses.webp](../../public/assets/art/theatre/noah-poses.webp).
- animal-pairs prop: visible width 2.45, position (1.05, -1.05), mirrored horizontally; artwork [assets/art/theatre/animal-pairs.webp](../../public/assets/art/theatre/animal-pairs.webp).
- family group: visible width 3.25, position (0.75, -0.05); artwork [assets/art/theatre/family-seven.webp](../../public/assets/art/theatre/family-seven.webp).

### 04. Waters over the earth (`noah-04`)

**Passage:** Genesis 7:17–24

**Page art:** [assets/art/noah-04.webp](../../public/assets/art/noah-04.webp)

**Read-aloud text (en-US):**

- `s1`: Rain fell for forty days and nights, and the waters rose higher and higher. The ark lifted from the ground and began to float.
- `s2`: The flood covered the land and even the highest mountains. Inside the great ark, Noah's family and the animals waited in the darkness.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/storm-open-water.webp](../../public/assets/art/theatre/storm-open-water.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-storm-water-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-storm-water-ground.webp)
- floating ark: visible width 4.4, position (0.15, 0.35); artwork [assets/art/theatre/ark.webp](../../public/assets/art/theatre/ark.webp).
- Wave layer 1: visible width 4.9, depth 0.78, phase 0.25 rad; artwork [assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp).
- Wave layer 2: visible width 5.25, depth 0.12, phase 2.35 rad; artwork [assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp).
- Wave layer 3: visible width 4.65, depth -0.72, phase 4.4 rad; artwork [assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp).
- Scene elements: 3 independently layered animated waves.

### 05. A leaf of hope (`noah-05`)

**Passage:** Genesis 8:1–12

**Page art:** [assets/art/noah-05.webp](../../public/assets/art/noah-05.webp)

**Read-aloud text (en-US):**

- `s1`: At last God sent a wind, and the waters began to fall. The ark came to rest on the mountains of Ararat.
- `s2`: Noah sent out a raven and then a dove. When the dove returned with a fresh olive leaf, Noah knew the earth was appearing again.

**Scene write-up and animation:**

- Painted backdrop: [assets/books/noah-and-the-great-flood/art/noah-ark-interior-backdrop.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-ark-interior-backdrop.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-ark-interior-plank-floor.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-ark-interior-plank-floor.webp)
- noah actor: pose 2, mood `listen`, position (-1.05, -0.45); artwork [assets/art/theatre/noah-poses.webp](../../public/assets/art/theatre/noah-poses.webp).
- dove: visible width 0.58, position (0.9, -0.3); artwork [assets/art/theatre/dove-olive.webp](../../public/assets/art/theatre/dove-olive.webp).

### 06. Out into a changed world (`noah-06`)

**Passage:** Genesis 7:21–23; 8:13–19

**Page art:** [assets/art/noah-06.webp](../../public/assets/art/noah-06.webp)

**Read-aloud text (en-US):**

- `s1`: When the ground was dry, God told Noah to leave the ark. His family came out, and every animal found the open earth again.
- `s2`: People who remained outside the ark were swept away and drowned. The flood was judgment, and the rescued family stepped into a solemn, changed world.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/shore.webp](../../public/assets/art/theatre/shore.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp)
- noah actor: pose 1, mood `sad`, position (-1.75, -0.55); artwork [assets/art/theatre/noah-poses.webp](../../public/assets/art/theatre/noah-poses.webp).
- animal-pairs prop: visible width 2.45, position (1.05, -1.05); artwork [assets/art/theatre/animal-pairs.webp](../../public/assets/art/theatre/animal-pairs.webp).
- family group: visible width 3.4, position (0.55, -0.18); artwork [assets/books/noah-and-the-great-flood/art/noah-family-seven-sober.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-family-seven-sober.webp).

### 07. God's covenant (`noah-07`)

**Passage:** Genesis 8:20–22; 9:1–17

**Page art:** [assets/art/noah-07.webp](../../public/assets/art/noah-07.webp)

**Read-aloud text (en-US):**

- `s1`: Noah built an altar and worshiped God. God made a covenant with Noah, his family, and every living creature.
- `s2`: God promised that a flood would never again destroy all life on earth. He set a rainbow in the clouds as the sign of his promise.

**Scene write-up and animation:**

- Painted backdrop: [assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp)
- noah actor: pose 2, mood `hope`, position (-0.95, -0.55); artwork [assets/art/theatre/noah-poses.webp](../../public/assets/art/theatre/noah-poses.webp).
- assets/books/noah-and-the-great-flood/art/noah-stone-altar.webp prop: visible width 1.2, position (1.45, -0.9); artwork [assets/books/noah-and-the-great-flood/art/noah-stone-altar.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-stone-altar.webp).
- family group: visible width 3.25, position (0.75, -0.05); artwork [assets/art/theatre/family-seven.webp](../../public/assets/art/theatre/family-seven.webp).

### 08. Remember the rainbow (`noah-08`)

**Passage:** Genesis 9:8–17

**Page art:** [assets/art/noah-08.webp](../../public/assets/art/noah-08.webp)

**Read-aloud text (en-US):**

- `s1`: The rainbow became a bright reminder of God's covenant. Whenever its colors appeared, God remembered his promise, and his people could remember it too.
- `s2`: The flood story holds sorrow, rescue, and a new beginning together. Noah's family carried God's mercy into the world after the waters were gone.

**Scene write-up and animation:**

- Painted backdrop: [assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp)
- Full-page ground print: [assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp](../../public/assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp)
- noah actor: pose 2, mood `hope`, position (-1.65, -0.55); artwork [assets/art/theatre/noah-poses.webp](../../public/assets/art/theatre/noah-poses.webp).
- family group: visible width 3.25, position (0.75, -0.05); artwork [assets/art/theatre/family-seven.webp](../../public/assets/art/theatre/family-seven.webp).

## Narration files by locale

The audio manifest records the measured duration for every file. Keys follow `locale/book/page/segment`; visible words are in the linked locale JSON above.

### en-GB (16 cues)

- `en-GB/noah/noah-01/s1` — [assets/audio/en-GB/noah/noah-01/s1-89c66d8a6f7c20d3fabd.wav](../../public/assets/audio/en-GB/noah/noah-01/s1-89c66d8a6f7c20d3fabd.wav) (6.08 s)
- `en-GB/noah/noah-01/s2` — [assets/audio/en-GB/noah/noah-01/s2-c2cdb1e935c0e273680f.wav](../../public/assets/audio/en-GB/noah/noah-01/s2-c2cdb1e935c0e273680f.wav) (6.77 s)
- `en-GB/noah/noah-02/s1` — [assets/audio/en-GB/noah/noah-02/s1-faaff9d1b668ffd73d6d.wav](../../public/assets/audio/en-GB/noah/noah-02/s1-faaff9d1b668ffd73d6d.wav) (7.77 s)
- `en-GB/noah/noah-02/s2` — [assets/audio/en-GB/noah/noah-02/s2-890ac9a19b528ee12a11.wav](../../public/assets/audio/en-GB/noah/noah-02/s2-890ac9a19b528ee12a11.wav) (6.83 s)
- `en-GB/noah/noah-03/s1` — [assets/audio/en-GB/noah/noah-03/s1-b277771711bb053c0e48.wav](../../public/assets/audio/en-GB/noah/noah-03/s1-b277771711bb053c0e48.wav) (6.84 s)
- `en-GB/noah/noah-03/s2` — [assets/audio/en-GB/noah/noah-03/s2-1196869b45a55ceec26c.wav](../../public/assets/audio/en-GB/noah/noah-03/s2-1196869b45a55ceec26c.wav) (5.28 s)
- `en-GB/noah/noah-04/s1` — [assets/audio/en-GB/noah/noah-04/s1-c696a409400bba7e7af9.wav](../../public/assets/audio/en-GB/noah/noah-04/s1-c696a409400bba7e7af9.wav) (6.83 s)
- `en-GB/noah/noah-04/s2` — [assets/audio/en-GB/noah/noah-04/s2-fa022936ea92656dbf45.wav](../../public/assets/audio/en-GB/noah/noah-04/s2-fa022936ea92656dbf45.wav) (7.35 s)
- `en-GB/noah/noah-05/s1` — [assets/audio/en-GB/noah/noah-05/s1-2e544edb036329ab105b.wav](../../public/assets/audio/en-GB/noah/noah-05/s1-2e544edb036329ab105b.wav) (6.29 s)
- `en-GB/noah/noah-05/s2` — [assets/audio/en-GB/noah/noah-05/s2-f12995eeb841abf6567b.wav](../../public/assets/audio/en-GB/noah/noah-05/s2-f12995eeb841abf6567b.wav) (6.88 s)
- `en-GB/noah/noah-06/s1` — [assets/audio/en-GB/noah/noah-06/s1-b70c0b98c71a56638d42.wav](../../public/assets/audio/en-GB/noah/noah-06/s1-b70c0b98c71a56638d42.wav) (6.88 s)
- `en-GB/noah/noah-06/s2` — [assets/audio/en-GB/noah/noah-06/s2-0581c0250089d929a21f.wav](../../public/assets/audio/en-GB/noah/noah-06/s2-0581c0250089d929a21f.wav) (7.94 s)
- `en-GB/noah/noah-07/s1` — [assets/audio/en-GB/noah/noah-07/s1-22e15cf9678dd9241953.wav](../../public/assets/audio/en-GB/noah/noah-07/s1-22e15cf9678dd9241953.wav) (6.14 s)
- `en-GB/noah/noah-07/s2` — [assets/audio/en-GB/noah/noah-07/s2-33df9d630f68ba27e496.wav](../../public/assets/audio/en-GB/noah/noah-07/s2-33df9d630f68ba27e496.wav) (6.87 s)
- `en-GB/noah/noah-08/s1` — [assets/audio/en-GB/noah/noah-08/s1-b9159aee7803d02e200c.wav](../../public/assets/audio/en-GB/noah/noah-08/s1-b9159aee7803d02e200c.wav) (7.91 s)
- `en-GB/noah/noah-08/s2` — [assets/audio/en-GB/noah/noah-08/s2-93fed6f19d069516ac6a.wav](../../public/assets/audio/en-GB/noah/noah-08/s2-93fed6f19d069516ac6a.wav) (8.14 s)

### en-US (16 cues)

- `en-US/noah/noah-01/s1` — [assets/audio/en-US/noah/noah-01/s1-76b35c45778fd80a4640.wav](../../public/assets/audio/en-US/noah/noah-01/s1-76b35c45778fd80a4640.wav) (6.69 s)
- `en-US/noah/noah-01/s2` — [assets/audio/en-US/noah/noah-01/s2-4120e5e2601b1d6eec10.wav](../../public/assets/audio/en-US/noah/noah-01/s2-4120e5e2601b1d6eec10.wav) (7.31 s)
- `en-US/noah/noah-02/s1` — [assets/audio/en-US/noah/noah-02/s1-68dcf17b757e6c5e9f32.wav](../../public/assets/audio/en-US/noah/noah-02/s1-68dcf17b757e6c5e9f32.wav) (8.14 s)
- `en-US/noah/noah-02/s2` — [assets/audio/en-US/noah/noah-02/s2-37aa5fc5568182fa6ee4.wav](../../public/assets/audio/en-US/noah/noah-02/s2-37aa5fc5568182fa6ee4.wav) (7.24 s)
- `en-US/noah/noah-03/s1` — [assets/audio/en-US/noah/noah-03/s1-eea33266c600ead59f5b.wav](../../public/assets/audio/en-US/noah/noah-03/s1-eea33266c600ead59f5b.wav) (7.41 s)
- `en-US/noah/noah-03/s2` — [assets/audio/en-US/noah/noah-03/s2-61ea19e1afc032a46a58.wav](../../public/assets/audio/en-US/noah/noah-03/s2-61ea19e1afc032a46a58.wav) (5.60 s)
- `en-US/noah/noah-04/s1` — [assets/audio/en-US/noah/noah-04/s1-9aced1eb507ca3f94363.wav](../../public/assets/audio/en-US/noah/noah-04/s1-9aced1eb507ca3f94363.wav) (7.44 s)
- `en-US/noah/noah-04/s2` — [assets/audio/en-US/noah/noah-04/s2-17059eed2337a3aa21ed.wav](../../public/assets/audio/en-US/noah/noah-04/s2-17059eed2337a3aa21ed.wav) (7.96 s)
- `en-US/noah/noah-05/s1` — [assets/audio/en-US/noah/noah-05/s1-980ffaa1c16ec61e9fc8.wav](../../public/assets/audio/en-US/noah/noah-05/s1-980ffaa1c16ec61e9fc8.wav) (6.54 s)
- `en-US/noah/noah-05/s2` — [assets/audio/en-US/noah/noah-05/s2-aaf836dcbdeeb6fc1cac.wav](../../public/assets/audio/en-US/noah/noah-05/s2-aaf836dcbdeeb6fc1cac.wav) (7.31 s)
- `en-US/noah/noah-06/s1` — [assets/audio/en-US/noah/noah-06/s1-6b906bd51e28dd159e08.wav](../../public/assets/audio/en-US/noah/noah-06/s1-6b906bd51e28dd159e08.wav) (7.29 s)
- `en-US/noah/noah-06/s2` — [assets/audio/en-US/noah/noah-06/s2-9f05dafce13b3187ed0d.wav](../../public/assets/audio/en-US/noah/noah-06/s2-9f05dafce13b3187ed0d.wav) (8.86 s)
- `en-US/noah/noah-07/s1` — [assets/audio/en-US/noah/noah-07/s1-b410675d732f17c695c8.wav](../../public/assets/audio/en-US/noah/noah-07/s1-b410675d732f17c695c8.wav) (6.66 s)
- `en-US/noah/noah-07/s2` — [assets/audio/en-US/noah/noah-07/s2-ee80788244a886386c77.wav](../../public/assets/audio/en-US/noah/noah-07/s2-ee80788244a886386c77.wav) (7.73 s)
- `en-US/noah/noah-08/s1` — [assets/audio/en-US/noah/noah-08/s1-8fd9aa357c2ef57991a7.wav](../../public/assets/audio/en-US/noah/noah-08/s1-8fd9aa357c2ef57991a7.wav) (8.86 s)
- `en-US/noah/noah-08/s2` — [assets/audio/en-US/noah/noah-08/s2-541408227c62dd3971ad.wav](../../public/assets/audio/en-US/noah/noah-08/s2-541408227c62dd3971ad.wav) (8.69 s)

### es (16 cues)

- `es/noah/noah-01/s1` — [assets/audio/es/noah/noah-01/s1-14671746b05cb849a2ad.wav](../../public/assets/audio/es/noah/noah-01/s1-14671746b05cb849a2ad.wav) (7.98 s)
- `es/noah/noah-01/s2` — [assets/audio/es/noah/noah-01/s2-77998a7e92862a5d3c56.wav](../../public/assets/audio/es/noah/noah-01/s2-77998a7e92862a5d3c56.wav) (7.13 s)
- `es/noah/noah-02/s1` — [assets/audio/es/noah/noah-02/s1-edee7f4000e08af4ff51.wav](../../public/assets/audio/es/noah/noah-02/s1-edee7f4000e08af4ff51.wav) (9.20 s)
- `es/noah/noah-02/s2` — [assets/audio/es/noah/noah-02/s2-b606c117efd0081bd690.wav](../../public/assets/audio/es/noah/noah-02/s2-b606c117efd0081bd690.wav) (7.16 s)
- `es/noah/noah-03/s1` — [assets/audio/es/noah/noah-03/s1-701533fd115f8378c886.wav](../../public/assets/audio/es/noah/noah-03/s1-701533fd115f8378c886.wav) (7.98 s)
- `es/noah/noah-03/s2` — [assets/audio/es/noah/noah-03/s2-3d4405f6d728ee0e9f49.wav](../../public/assets/audio/es/noah/noah-03/s2-3d4405f6d728ee0e9f49.wav) (5.78 s)
- `es/noah/noah-04/s1` — [assets/audio/es/noah/noah-04/s1-de9d107ff501c0373c0f.wav](../../public/assets/audio/es/noah/noah-04/s1-de9d107ff501c0373c0f.wav) (7.45 s)
- `es/noah/noah-04/s2` — [assets/audio/es/noah/noah-04/s2-376e0865f3f0a78e88c1.wav](../../public/assets/audio/es/noah/noah-04/s2-376e0865f3f0a78e88c1.wav) (8.36 s)
- `es/noah/noah-05/s1` — [assets/audio/es/noah/noah-05/s1-8348ab7db98abe64d203.wav](../../public/assets/audio/es/noah/noah-05/s1-8348ab7db98abe64d203.wav) (6.21 s)
- `es/noah/noah-05/s2` — [assets/audio/es/noah/noah-05/s2-5dc7e8700c08f903701e.wav](../../public/assets/audio/es/noah/noah-05/s2-5dc7e8700c08f903701e.wav) (7.96 s)
- `es/noah/noah-06/s1` — [assets/audio/es/noah/noah-06/s1-d22fb6469a0c08081b48.wav](../../public/assets/audio/es/noah/noah-06/s1-d22fb6469a0c08081b48.wav) (7.74 s)
- `es/noah/noah-06/s2` — [assets/audio/es/noah/noah-06/s2-7239206f92b555d76bec.wav](../../public/assets/audio/es/noah/noah-06/s2-7239206f92b555d76bec.wav) (9.65 s)
- `es/noah/noah-07/s1` — [assets/audio/es/noah/noah-07/s1-d2c4300d3933b35b95df.wav](../../public/assets/audio/es/noah/noah-07/s1-d2c4300d3933b35b95df.wav) (5.95 s)
- `es/noah/noah-07/s2` — [assets/audio/es/noah/noah-07/s2-0433decf3abc27b69d9f.wav](../../public/assets/audio/es/noah/noah-07/s2-0433decf3abc27b69d9f.wav) (7.65 s)
- `es/noah/noah-08/s1` — [assets/audio/es/noah/noah-08/s1-749237823680f35d2408.wav](../../public/assets/audio/es/noah/noah-08/s1-749237823680f35d2408.wav) (9.72 s)
- `es/noah/noah-08/s2` — [assets/audio/es/noah/noah-08/s2-dce7141093415a1f5837.wav](../../public/assets/audio/es/noah/noah-08/s2-dce7141093415a1f5837.wav) (9.30 s)

### fr (16 cues)

- `fr/noah/noah-01/s1` — [assets/audio/fr/noah/noah-01/s1-78820c805caa94da112b.wav](../../public/assets/audio/fr/noah/noah-01/s1-78820c805caa94da112b.wav) (7.86 s)
- `fr/noah/noah-01/s2` — [assets/audio/fr/noah/noah-01/s2-198fcc54864de488c353.wav](../../public/assets/audio/fr/noah/noah-01/s2-198fcc54864de488c353.wav) (6.61 s)
- `fr/noah/noah-02/s1` — [assets/audio/fr/noah/noah-02/s1-b92f3fea00e15248cd0d.wav](../../public/assets/audio/fr/noah/noah-02/s1-b92f3fea00e15248cd0d.wav) (9.13 s)
- `fr/noah/noah-02/s2` — [assets/audio/fr/noah/noah-02/s2-12f3c57dcecd7635f323.wav](../../public/assets/audio/fr/noah/noah-02/s2-12f3c57dcecd7635f323.wav) (7.75 s)
- `fr/noah/noah-03/s1` — [assets/audio/fr/noah/noah-03/s1-31ef6545bedc5fdb44af.wav](../../public/assets/audio/fr/noah/noah-03/s1-31ef6545bedc5fdb44af.wav) (7.51 s)
- `fr/noah/noah-03/s2` — [assets/audio/fr/noah/noah-03/s2-f9f91622d8338704419b.wav](../../public/assets/audio/fr/noah/noah-03/s2-f9f91622d8338704419b.wav) (6.51 s)
- `fr/noah/noah-04/s1` — [assets/audio/fr/noah/noah-04/s1-7bfc51ad076935172cad.wav](../../public/assets/audio/fr/noah/noah-04/s1-7bfc51ad076935172cad.wav) (7.58 s)
- `fr/noah/noah-04/s2` — [assets/audio/fr/noah/noah-04/s2-115b0e7dcced25881a21.wav](../../public/assets/audio/fr/noah/noah-04/s2-115b0e7dcced25881a21.wav) (7.83 s)
- `fr/noah/noah-05/s1` — [assets/audio/fr/noah/noah-05/s1-5cea1eb28591b9d43148.wav](../../public/assets/audio/fr/noah/noah-05/s1-5cea1eb28591b9d43148.wav) (5.95 s)
- `fr/noah/noah-05/s2` — [assets/audio/fr/noah/noah-05/s2-26c2635123e5a50f75ab.wav](../../public/assets/audio/fr/noah/noah-05/s2-26c2635123e5a50f75ab.wav) (7.52 s)
- `fr/noah/noah-06/s1` — [assets/audio/fr/noah/noah-06/s1-5851884201f015d6e6de.wav](../../public/assets/audio/fr/noah/noah-06/s1-5851884201f015d6e6de.wav) (7.08 s)
- `fr/noah/noah-06/s2` — [assets/audio/fr/noah/noah-06/s2-bc4c4c584799173774fc.wav](../../public/assets/audio/fr/noah/noah-06/s2-bc4c4c584799173774fc.wav) (9.22 s)
- `fr/noah/noah-07/s1` — [assets/audio/fr/noah/noah-07/s1-fe7503428b117852b0f4.wav](../../public/assets/audio/fr/noah/noah-07/s1-fe7503428b117852b0f4.wav) (5.89 s)
- `fr/noah/noah-07/s2` — [assets/audio/fr/noah/noah-07/s2-56bb66251be8f7812a9b.wav](../../public/assets/audio/fr/noah/noah-07/s2-56bb66251be8f7812a9b.wav) (7.67 s)
- `fr/noah/noah-08/s1` — [assets/audio/fr/noah/noah-08/s1-560aed1af510c45a4c38.wav](../../public/assets/audio/fr/noah/noah-08/s1-560aed1af510c45a4c38.wav) (9.08 s)
- `fr/noah/noah-08/s2` — [assets/audio/fr/noah/noah-08/s2-6d41d3b70c5aa957ae97.wav](../../public/assets/audio/fr/noah/noah-08/s2-6d41d3b70c5aa957ae97.wav) (9.48 s)

### hi (16 cues)

- `hi/noah/noah-01/s1` — [assets/audio/hi/noah/noah-01/s1-0c0a8db2e164a53a7f30.wav](../../public/assets/audio/hi/noah/noah-01/s1-0c0a8db2e164a53a7f30.wav) (8.79 s)
- `hi/noah/noah-01/s2` — [assets/audio/hi/noah/noah-01/s2-c320a3fab822fd68fd00.wav](../../public/assets/audio/hi/noah/noah-01/s2-c320a3fab822fd68fd00.wav) (9.93 s)
- `hi/noah/noah-02/s1` — [assets/audio/hi/noah/noah-02/s1-b47eaba5bb09876b9011.wav](../../public/assets/audio/hi/noah/noah-02/s1-b47eaba5bb09876b9011.wav) (10.14 s)
- `hi/noah/noah-02/s2` — [assets/audio/hi/noah/noah-02/s2-07f475f06c9011ec0697.wav](../../public/assets/audio/hi/noah/noah-02/s2-07f475f06c9011ec0697.wav) (10.18 s)
- `hi/noah/noah-03/s1` — [assets/audio/hi/noah/noah-03/s1-a350877da14e6e7085f7.wav](../../public/assets/audio/hi/noah/noah-03/s1-a350877da14e6e7085f7.wav) (9.45 s)
- `hi/noah/noah-03/s2` — [assets/audio/hi/noah/noah-03/s2-6c78bbb9edf51f34fd9e.wav](../../public/assets/audio/hi/noah/noah-03/s2-6c78bbb9edf51f34fd9e.wav) (8.10 s)
- `hi/noah/noah-04/s1` — [assets/audio/hi/noah/noah-04/s1-8fb6f3d8b32b67a8312a.wav](../../public/assets/audio/hi/noah/noah-04/s1-8fb6f3d8b32b67a8312a.wav) (7.85 s)
- `hi/noah/noah-04/s2` — [assets/audio/hi/noah/noah-04/s2-c32b6ac931b31ae16098.wav](../../public/assets/audio/hi/noah/noah-04/s2-c32b6ac931b31ae16098.wav) (10.21 s)
- `hi/noah/noah-05/s1` — [assets/audio/hi/noah/noah-05/s1-14cac37291c6bec5facd.wav](../../public/assets/audio/hi/noah/noah-05/s1-14cac37291c6bec5facd.wav) (7.33 s)
- `hi/noah/noah-05/s2` — [assets/audio/hi/noah/noah-05/s2-9d3ef0d73e1eb36be53f.wav](../../public/assets/audio/hi/noah/noah-05/s2-9d3ef0d73e1eb36be53f.wav) (9.67 s)
- `hi/noah/noah-06/s1` — [assets/audio/hi/noah/noah-06/s1-1ff3c3a294dc0d299dba.wav](../../public/assets/audio/hi/noah/noah-06/s1-1ff3c3a294dc0d299dba.wav) (9.55 s)
- `hi/noah/noah-06/s2` — [assets/audio/hi/noah/noah-06/s2-56ad60dd7a408b0ecf58.wav](../../public/assets/audio/hi/noah/noah-06/s2-56ad60dd7a408b0ecf58.wav) (10.16 s)
- `hi/noah/noah-07/s1` — [assets/audio/hi/noah/noah-07/s1-a1cce610c8de084fe539.wav](../../public/assets/audio/hi/noah/noah-07/s1-a1cce610c8de084fe539.wav) (9.24 s)
- `hi/noah/noah-07/s2` — [assets/audio/hi/noah/noah-07/s2-7ab3c49f902c3c58006d.wav](../../public/assets/audio/hi/noah/noah-07/s2-7ab3c49f902c3c58006d.wav) (10.49 s)
- `hi/noah/noah-08/s1` — [assets/audio/hi/noah/noah-08/s1-3567b82e9ad254af64c6.wav](../../public/assets/audio/hi/noah/noah-08/s1-3567b82e9ad254af64c6.wav) (11.47 s)
- `hi/noah/noah-08/s2` — [assets/audio/hi/noah/noah-08/s2-566702c53982816f8546.wav](../../public/assets/audio/hi/noah/noah-08/s2-566702c53982816f8546.wav) (10.42 s)

### it (16 cues)

- `it/noah/noah-01/s1` — [assets/audio/it/noah/noah-01/s1-b1616a0cb62aa9ff04d8.wav](../../public/assets/audio/it/noah/noah-01/s1-b1616a0cb62aa9ff04d8.wav) (7.85 s)
- `it/noah/noah-01/s2` — [assets/audio/it/noah/noah-01/s2-e366c302947de3db4720.wav](../../public/assets/audio/it/noah/noah-01/s2-e366c302947de3db4720.wav) (8.11 s)
- `it/noah/noah-02/s1` — [assets/audio/it/noah/noah-02/s1-784b338deeabb70d235e.wav](../../public/assets/audio/it/noah/noah-02/s1-784b338deeabb70d235e.wav) (8.98 s)
- `it/noah/noah-02/s2` — [assets/audio/it/noah/noah-02/s2-8208b521a826f5537879.wav](../../public/assets/audio/it/noah/noah-02/s2-8208b521a826f5537879.wav) (6.83 s)
- `it/noah/noah-03/s1` — [assets/audio/it/noah/noah-03/s1-2654504179af9da83eaa.wav](../../public/assets/audio/it/noah/noah-03/s1-2654504179af9da83eaa.wav) (7.62 s)
- `it/noah/noah-03/s2` — [assets/audio/it/noah/noah-03/s2-ba6a489b30954aa62911.wav](../../public/assets/audio/it/noah/noah-03/s2-ba6a489b30954aa62911.wav) (5.16 s)
- `it/noah/noah-04/s1` — [assets/audio/it/noah/noah-04/s1-7157fdee11ecbcf82392.wav](../../public/assets/audio/it/noah/noah-04/s1-7157fdee11ecbcf82392.wav) (7.98 s)
- `it/noah/noah-04/s2` — [assets/audio/it/noah/noah-04/s2-ed87e4307635c139481d.wav](../../public/assets/audio/it/noah/noah-04/s2-ed87e4307635c139481d.wav) (7.52 s)
- `it/noah/noah-05/s1` — [assets/audio/it/noah/noah-05/s1-83623f76e5d4c9063387.wav](../../public/assets/audio/it/noah/noah-05/s1-83623f76e5d4c9063387.wav) (6.11 s)
- `it/noah/noah-05/s2` — [assets/audio/it/noah/noah-05/s2-c63b78cdf0d84d178c40.wav](../../public/assets/audio/it/noah/noah-05/s2-c63b78cdf0d84d178c40.wav) (7.58 s)
- `it/noah/noah-06/s1` — [assets/audio/it/noah/noah-06/s1-5dcb6e690866b2e25b7c.wav](../../public/assets/audio/it/noah/noah-06/s1-5dcb6e690866b2e25b7c.wav) (7.15 s)
- `it/noah/noah-06/s2` — [assets/audio/it/noah/noah-06/s2-352ad2b7dc74f8dc0996.wav](../../public/assets/audio/it/noah/noah-06/s2-352ad2b7dc74f8dc0996.wav) (9.30 s)
- `it/noah/noah-07/s1` — [assets/audio/it/noah/noah-07/s1-33add20b81686ad79587.wav](../../public/assets/audio/it/noah/noah-07/s1-33add20b81686ad79587.wav) (6.06 s)
- `it/noah/noah-07/s2` — [assets/audio/it/noah/noah-07/s2-cfe395a638f0bb3cf142.wav](../../public/assets/audio/it/noah/noah-07/s2-cfe395a638f0bb3cf142.wav) (8.30 s)
- `it/noah/noah-08/s1` — [assets/audio/it/noah/noah-08/s1-65e9c6f467ed1022b8e0.wav](../../public/assets/audio/it/noah/noah-08/s1-65e9c6f467ed1022b8e0.wav) (9.23 s)
- `it/noah/noah-08/s2` — [assets/audio/it/noah/noah-08/s2-f3ebb99a2ee97c81bb43.wav](../../public/assets/audio/it/noah/noah-08/s2-f3ebb99a2ee97c81bb43.wav) (9.19 s)

### ja (16 cues)

- `ja/noah/noah-01/s1` — [assets/audio/ja/noah/noah-01/s1-6cd254220e02506c00f2.wav](../../public/assets/audio/ja/noah/noah-01/s1-6cd254220e02506c00f2.wav) (7.68 s)
- `ja/noah/noah-01/s2` — [assets/audio/ja/noah/noah-01/s2-510eed0562dc1ce23164.wav](../../public/assets/audio/ja/noah/noah-01/s2-510eed0562dc1ce23164.wav) (7.96 s)
- `ja/noah/noah-02/s1` — [assets/audio/ja/noah/noah-02/s1-4d10798010c43a356346.wav](../../public/assets/audio/ja/noah/noah-02/s1-4d10798010c43a356346.wav) (8.81 s)
- `ja/noah/noah-02/s2` — [assets/audio/ja/noah/noah-02/s2-2452c04fbf187bf2b5cb.wav](../../public/assets/audio/ja/noah/noah-02/s2-2452c04fbf187bf2b5cb.wav) (8.39 s)
- `ja/noah/noah-03/s1` — [assets/audio/ja/noah/noah-03/s1-b9f8f06248d57a4f8e75.wav](../../public/assets/audio/ja/noah/noah-03/s1-b9f8f06248d57a4f8e75.wav) (9.28 s)
- `ja/noah/noah-03/s2` — [assets/audio/ja/noah/noah-03/s2-91133b8de2e0943571c3.wav](../../public/assets/audio/ja/noah/noah-03/s2-91133b8de2e0943571c3.wav) (6.73 s)
- `ja/noah/noah-04/s1` — [assets/audio/ja/noah/noah-04/s1-2230f921dd64dfda1a83.wav](../../public/assets/audio/ja/noah/noah-04/s1-2230f921dd64dfda1a83.wav) (7.67 s)
- `ja/noah/noah-04/s2` — [assets/audio/ja/noah/noah-04/s2-0a1d57cb166906d94e1c.wav](../../public/assets/audio/ja/noah/noah-04/s2-0a1d57cb166906d94e1c.wav) (9.25 s)
- `ja/noah/noah-05/s1` — [assets/audio/ja/noah/noah-05/s1-15d76e7cafad388268a7.wav](../../public/assets/audio/ja/noah/noah-05/s1-15d76e7cafad388268a7.wav) (6.94 s)
- `ja/noah/noah-05/s2` — [assets/audio/ja/noah/noah-05/s2-6821e63337c1d474520a.wav](../../public/assets/audio/ja/noah/noah-05/s2-6821e63337c1d474520a.wav) (8.64 s)
- `ja/noah/noah-06/s1` — [assets/audio/ja/noah/noah-06/s1-b43f8b59952f2a17d98d.wav](../../public/assets/audio/ja/noah/noah-06/s1-b43f8b59952f2a17d98d.wav) (8.47 s)
- `ja/noah/noah-06/s2` — [assets/audio/ja/noah/noah-06/s2-8be488134fbf63e211ea.wav](../../public/assets/audio/ja/noah/noah-06/s2-8be488134fbf63e211ea.wav) (11.09 s)
- `ja/noah/noah-07/s1` — [assets/audio/ja/noah/noah-07/s1-e1c07c7561f54be6d78b.wav](../../public/assets/audio/ja/noah/noah-07/s1-e1c07c7561f54be6d78b.wav) (7.58 s)
- `ja/noah/noah-07/s2` — [assets/audio/ja/noah/noah-07/s2-068e214d5391d1f61cbf.wav](../../public/assets/audio/ja/noah/noah-07/s2-068e214d5391d1f61cbf.wav) (9.21 s)
- `ja/noah/noah-08/s1` — [assets/audio/ja/noah/noah-08/s1-7f742dcc66fe77e81640.wav](../../public/assets/audio/ja/noah/noah-08/s1-7f742dcc66fe77e81640.wav) (10.95 s)
- `ja/noah/noah-08/s2` — [assets/audio/ja/noah/noah-08/s2-252dae1bbe71ddd0ec67.wav](../../public/assets/audio/ja/noah/noah-08/s2-252dae1bbe71ddd0ec67.wav) (9.49 s)

### pt-BR (16 cues)

- `pt-BR/noah/noah-01/s1` — [assets/audio/pt-BR/noah/noah-01/s1-d8a6611d4a60330749ed.wav](../../public/assets/audio/pt-BR/noah/noah-01/s1-d8a6611d4a60330749ed.wav) (6.71 s)
- `pt-BR/noah/noah-01/s2` — [assets/audio/pt-BR/noah/noah-01/s2-8adc6f03d5ca8e8c98f4.wav](../../public/assets/audio/pt-BR/noah/noah-01/s2-8adc6f03d5ca8e8c98f4.wav) (7.14 s)
- `pt-BR/noah/noah-02/s1` — [assets/audio/pt-BR/noah/noah-02/s1-dad5ed53f8b53f736ba9.wav](../../public/assets/audio/pt-BR/noah/noah-02/s1-dad5ed53f8b53f736ba9.wav) (9.50 s)
- `pt-BR/noah/noah-02/s2` — [assets/audio/pt-BR/noah/noah-02/s2-f74012bec8f6280f9285.wav](../../public/assets/audio/pt-BR/noah/noah-02/s2-f74012bec8f6280f9285.wav) (7.37 s)
- `pt-BR/noah/noah-03/s1` — [assets/audio/pt-BR/noah/noah-03/s1-c343f93c049b217f1518.wav](../../public/assets/audio/pt-BR/noah/noah-03/s1-c343f93c049b217f1518.wav) (8.14 s)
- `pt-BR/noah/noah-03/s2` — [assets/audio/pt-BR/noah/noah-03/s2-533e95fcf44fa27bd66a.wav](../../public/assets/audio/pt-BR/noah/noah-03/s2-533e95fcf44fa27bd66a.wav) (5.61 s)
- `pt-BR/noah/noah-04/s1` — [assets/audio/pt-BR/noah/noah-04/s1-30698330e12a2fb6efd3.wav](../../public/assets/audio/pt-BR/noah/noah-04/s1-30698330e12a2fb6efd3.wav) (7.13 s)
- `pt-BR/noah/noah-04/s2` — [assets/audio/pt-BR/noah/noah-04/s2-0ff16f82e0ee66418ffe.wav](../../public/assets/audio/pt-BR/noah/noah-04/s2-0ff16f82e0ee66418ffe.wav) (7.52 s)
- `pt-BR/noah/noah-05/s1` — [assets/audio/pt-BR/noah/noah-05/s1-4611c6fe261b826719c7.wav](../../public/assets/audio/pt-BR/noah/noah-05/s1-4611c6fe261b826719c7.wav) (5.84 s)
- `pt-BR/noah/noah-05/s2` — [assets/audio/pt-BR/noah/noah-05/s2-8f13ef6055219772360b.wav](../../public/assets/audio/pt-BR/noah/noah-05/s2-8f13ef6055219772360b.wav) (7.84 s)
- `pt-BR/noah/noah-06/s1` — [assets/audio/pt-BR/noah/noah-06/s1-fd80605c9903262748ed.wav](../../public/assets/audio/pt-BR/noah/noah-06/s1-fd80605c9903262748ed.wav) (6.83 s)
- `pt-BR/noah/noah-06/s2` — [assets/audio/pt-BR/noah/noah-06/s2-5c6d237e633e46f36a41.wav](../../public/assets/audio/pt-BR/noah/noah-06/s2-5c6d237e633e46f36a41.wav) (9.87 s)
- `pt-BR/noah/noah-07/s1` — [assets/audio/pt-BR/noah/noah-07/s1-def1d9d7487c7244671f.wav](../../public/assets/audio/pt-BR/noah/noah-07/s1-def1d9d7487c7244671f.wav) (6.34 s)
- `pt-BR/noah/noah-07/s2` — [assets/audio/pt-BR/noah/noah-07/s2-b68c816a3fdb22d106b1.wav](../../public/assets/audio/pt-BR/noah/noah-07/s2-b68c816a3fdb22d106b1.wav) (7.26 s)
- `pt-BR/noah/noah-08/s1` — [assets/audio/pt-BR/noah/noah-08/s1-a3c049c3dec483dc87ee.wav](../../public/assets/audio/pt-BR/noah/noah-08/s1-a3c049c3dec483dc87ee.wav) (9.02 s)
- `pt-BR/noah/noah-08/s2` — [assets/audio/pt-BR/noah/noah-08/s2-e994220b69b1cc86cbe9.wav](../../public/assets/audio/pt-BR/noah/noah-08/s2-e994220b69b1cc86cbe9.wav) (8.29 s)

### zh-CN (16 cues)

- `zh-CN/noah/noah-01/s1` — [assets/audio/zh-CN/noah/noah-01/s1-cd05ef555a584d17ae65.wav](../../public/assets/audio/zh-CN/noah/noah-01/s1-cd05ef555a584d17ae65.wav) (6.63 s)
- `zh-CN/noah/noah-01/s2` — [assets/audio/zh-CN/noah/noah-01/s2-d81633d7ac684425af02.wav](../../public/assets/audio/zh-CN/noah/noah-01/s2-d81633d7ac684425af02.wav) (7.53 s)
- `zh-CN/noah/noah-02/s1` — [assets/audio/zh-CN/noah/noah-02/s1-122a09889f8b8649c80c.wav](../../public/assets/audio/zh-CN/noah/noah-02/s1-122a09889f8b8649c80c.wav) (10.40 s)
- `zh-CN/noah/noah-02/s2` — [assets/audio/zh-CN/noah/noah-02/s2-dfe5fa3019c17c7fdccd.wav](../../public/assets/audio/zh-CN/noah/noah-02/s2-dfe5fa3019c17c7fdccd.wav) (9.54 s)
- `zh-CN/noah/noah-03/s1` — [assets/audio/zh-CN/noah/noah-03/s1-07012fff8c664ec3f9f8.wav](../../public/assets/audio/zh-CN/noah/noah-03/s1-07012fff8c664ec3f9f8.wav) (8.32 s)
- `zh-CN/noah/noah-03/s2` — [assets/audio/zh-CN/noah/noah-03/s2-34de73247cbc42fc1159.wav](../../public/assets/audio/zh-CN/noah/noah-03/s2-34de73247cbc42fc1159.wav) (6.44 s)
- `zh-CN/noah/noah-04/s1` — [assets/audio/zh-CN/noah/noah-04/s1-2737c265b0df8db814c1.wav](../../public/assets/audio/zh-CN/noah/noah-04/s1-2737c265b0df8db814c1.wav) (5.51 s)
- `zh-CN/noah/noah-04/s2` — [assets/audio/zh-CN/noah/noah-04/s2-b42824e9ef9ff43121fb.wav](../../public/assets/audio/zh-CN/noah/noah-04/s2-b42824e9ef9ff43121fb.wav) (8.75 s)
- `zh-CN/noah/noah-05/s1` — [assets/audio/zh-CN/noah/noah-05/s1-350ec5e26648fde404ea.wav](../../public/assets/audio/zh-CN/noah/noah-05/s1-350ec5e26648fde404ea.wav) (5.75 s)
- `zh-CN/noah/noah-05/s2` — [assets/audio/zh-CN/noah/noah-05/s2-f8e3e035260d2864a886.wav](../../public/assets/audio/zh-CN/noah/noah-05/s2-f8e3e035260d2864a886.wav) (9.79 s)
- `zh-CN/noah/noah-06/s1` — [assets/audio/zh-CN/noah/noah-06/s1-bb8f89a46911477ec14f.wav](../../public/assets/audio/zh-CN/noah/noah-06/s1-bb8f89a46911477ec14f.wav) (8.88 s)
- `zh-CN/noah/noah-06/s2` — [assets/audio/zh-CN/noah/noah-06/s2-64ba5d20047058fcf29e.wav](../../public/assets/audio/zh-CN/noah/noah-06/s2-64ba5d20047058fcf29e.wav) (8.69 s)
- `zh-CN/noah/noah-07/s1` — [assets/audio/zh-CN/noah/noah-07/s1-6f429fe20d5bf063ac3c.wav](../../public/assets/audio/zh-CN/noah/noah-07/s1-6f429fe20d5bf063ac3c.wav) (7.26 s)
- `zh-CN/noah/noah-07/s2` — [assets/audio/zh-CN/noah/noah-07/s2-807d950ed76382f47406.wav](../../public/assets/audio/zh-CN/noah/noah-07/s2-807d950ed76382f47406.wav) (7.68 s)
- `zh-CN/noah/noah-08/s1` — [assets/audio/zh-CN/noah/noah-08/s1-0865768712a3a3b9808c.wav](../../public/assets/audio/zh-CN/noah/noah-08/s1-0865768712a3a3b9808c.wav) (9.26 s)
- `zh-CN/noah/noah-08/s2` — [assets/audio/zh-CN/noah/noah-08/s2-9d46f4098d756446f43d.wav](../../public/assets/audio/zh-CN/noah/noah-08/s2-9d46f4098d756446f43d.wav) (9.46 s)
