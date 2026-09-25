# Adam, Eve, and the Garden

Generated per-book review index. Source text stays in locale files; page staging stays in TypeScript. Regenerate with `npm run book:index`.

## Source files

- Shelf entry and palette: [public/books/catalog.json](../../public/books/catalog.json)
- Base story, title, and page text: [public/content/en-US.json](../../public/content/en-US.json)
- Localized titles and page text: [en-GB](../../public/content/en-GB.json), [en-US](../../public/content/en-US.json), [es](../../public/content/es.json), [fr](../../public/content/fr.json), [hi](../../public/content/hi.json), [it](../../public/content/it.json), [ja](../../public/content/ja.json), [pt-BR](../../public/content/pt-BR.json), [zh-CN](../../public/content/zh-CN.json)
- Measured narration manifest: [public/audio-manifest.json](../../public/audio-manifest.json)
- Shared page staging contract and composition: [src/stage-direction.ts](../../src/stage-direction.ts), [src/eden-stage-direction.ts](../../src/eden-stage-direction.ts), [src/stage-direction-types.ts](../../src/stage-direction-types.ts)
- Shared stage surfaces and alpha-aware cutout geometry: [src/garden-floor.ts](../../src/garden-floor.ts), [src/stage-prop-geometry.ts](../../src/stage-prop-geometry.ts), [src/alpha-bounds.ts](../../src/alpha-bounds.ts)
- Shared legacy scene renderer and motion: [src/scene.ts](../../src/scene.ts), [src/stage-motion.ts](../../src/stage-motion.ts)
- Shared actor transitions: [src/paper-actor.ts](../../src/paper-actor.ts)
- Shared narration transport and page-range audio: [src/book-reader-audio.ts](../../src/book-reader-audio.ts), [src/book-audio.ts](../../src/book-audio.ts)
- Shared room ambience: [src/soundscape.ts](../../src/soundscape.ts)

The cover artwork begins with page one, [assets/art/eden-01.webp](../../public/assets/art/eden-01.webp). Eden and Noah retain their established localized voice and character rigs.

- Book-specific art notes and source inventory: [assets/books/eden/README.md](../../assets/books/eden/README.md).
- Editable source art and prompts: [assets/books/eden/prompts/adam-behind-garden-bush.txt](../../assets/books/eden/prompts/adam-behind-garden-bush.txt), [assets/books/eden/prompts/adam-fruit-receiving-behind-garden-bush.txt](../../assets/books/eden/prompts/adam-fruit-receiving-behind-garden-bush.txt), [assets/books/eden/prompts/adam-hide-hope.txt](../../assets/books/eden/prompts/adam-hide-hope.txt), [assets/books/eden/prompts/adam-hide-walking.txt](../../assets/books/eden/prompts/adam-hide-walking.txt), [assets/books/eden/prompts/adam-hide-work.txt](../../assets/books/eden/prompts/adam-hide-work.txt), [assets/books/eden/prompts/adam-leaf-consequences.txt](../../assets/books/eden/prompts/adam-leaf-consequences.txt), [assets/books/eden/prompts/adam-leaf-shame.txt](../../assets/books/eden/prompts/adam-leaf-shame.txt), [assets/books/eden/prompts/continuous-garden-ground.txt](../../assets/books/eden/prompts/continuous-garden-ground.txt), [assets/books/eden/prompts/eden-guarded-way-backcloth.txt](../../assets/books/eden/prompts/eden-guarded-way-backcloth.txt), [assets/books/eden/prompts/eve-behind-garden-bush.txt](../../assets/books/eden/prompts/eve-behind-garden-bush.txt), [assets/books/eden/prompts/eve-fruit-behind-garden-bush.txt](../../assets/books/eden/prompts/eve-fruit-behind-garden-bush.txt), [assets/books/eden/prompts/eve-hide-hope.txt](../../assets/books/eden/prompts/eve-hide-hope.txt), [assets/books/eden/prompts/eve-hide-walking.txt](../../assets/books/eden/prompts/eve-hide-walking.txt), [assets/books/eden/prompts/eve-hide-work.txt](../../assets/books/eden/prompts/eve-hide-work.txt), [assets/books/eden/prompts/eve-leaf-consequences.txt](../../assets/books/eden/prompts/eve-leaf-consequences.txt), [assets/books/eden/prompts/eve-leaf-shame.txt](../../assets/books/eden/prompts/eve-leaf-shame.txt), [assets/books/eden/prompts/exile-earth-ground.txt](../../assets/books/eden/prompts/exile-earth-ground.txt), [assets/books/eden/prompts/fieldwork-tools.txt](../../assets/books/eden/prompts/fieldwork-tools.txt), [assets/books/eden/prompts/fig-leaf-hiding-screen.txt](../../assets/books/eden/prompts/fig-leaf-hiding-screen.txt), [assets/books/eden/source-art/adam-behind-garden-bush.png](../../assets/books/eden/source-art/adam-behind-garden-bush.png), [assets/books/eden/source-art/adam-fruit-receiving-behind-garden-bush.png](../../assets/books/eden/source-art/adam-fruit-receiving-behind-garden-bush.png), [assets/books/eden/source-art/adam-hide-hope.png](../../assets/books/eden/source-art/adam-hide-hope.png), [assets/books/eden/source-art/adam-hide-walking.png](../../assets/books/eden/source-art/adam-hide-walking.png), [assets/books/eden/source-art/adam-hide-work.png](../../assets/books/eden/source-art/adam-hide-work.png), [assets/books/eden/source-art/adam-leaf-consequences.png](../../assets/books/eden/source-art/adam-leaf-consequences.png), [assets/books/eden/source-art/adam-leaf-shame.png](../../assets/books/eden/source-art/adam-leaf-shame.png), [assets/books/eden/source-art/continuous-garden-ground.png](../../assets/books/eden/source-art/continuous-garden-ground.png), [assets/books/eden/source-art/eden-guarded-way-backcloth.png](../../assets/books/eden/source-art/eden-guarded-way-backcloth.png), [assets/books/eden/source-art/eve-behind-garden-bush.png](../../assets/books/eden/source-art/eve-behind-garden-bush.png), [assets/books/eden/source-art/eve-fruit-behind-garden-bush.png](../../assets/books/eden/source-art/eve-fruit-behind-garden-bush.png), [assets/books/eden/source-art/eve-hide-hope.png](../../assets/books/eden/source-art/eve-hide-hope.png), [assets/books/eden/source-art/eve-hide-walking.png](../../assets/books/eden/source-art/eve-hide-walking.png), [assets/books/eden/source-art/eve-hide-work.png](../../assets/books/eden/source-art/eve-hide-work.png), [assets/books/eden/source-art/eve-leaf-consequences.png](../../assets/books/eden/source-art/eve-leaf-consequences.png), [assets/books/eden/source-art/eve-leaf-shame.png](../../assets/books/eden/source-art/eve-leaf-shame.png), [assets/books/eden/source-art/exile-earth-ground.png](../../assets/books/eden/source-art/exile-earth-ground.png), [assets/books/eden/source-art/fieldwork-tools.png](../../assets/books/eden/source-art/fieldwork-tools.png), [assets/books/eden/source-art/fig-leaf-hiding-screen.png](../../assets/books/eden/source-art/fig-leaf-hiding-screen.png).
- Book-local runtime art: shared theatre paths listed per page.

## Page sequence, text, art, and scene direction

### 01. A garden called Eden (`eden-01`)

**Passage:** Genesis 2:4–20

**Page art:** [assets/art/eden-01.webp](../../public/assets/art/eden-01.webp)

**Read-aloud text (en-US):**

- `s1`: God made the heavens and the earth, then planted a beautiful garden called Eden. He placed Adam there to tend it and enjoy its trees.
- `s2`: God breathed life into Adam. Every creature had a place, but Adam needed a companion.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/garden.webp](../../public/assets/art/theatre/garden.webp)
- Full-page ground print: [assets/art/theatre/continuous-garden-ground.webp](../../public/assets/art/theatre/continuous-garden-ground.webp)
- adam actor: mood `welcome`, position (-0.4, -0.5), visible width 1.1551, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-behind-garden-bush.webp](../../public/assets/art/theatre/eden-adam-behind-garden-bush.webp).
- Eden tree cutout: [assets/art/eden-tree.webp](../../public/assets/art/eden-tree.webp).
- Scene elements: tree at -2.15.

### 02. A companion and a command (`eden-02`)

**Passage:** Genesis 2:16–25

**Page art:** [assets/art/eden-02.webp](../../public/assets/art/eden-02.webp)

**Read-aloud text (en-US):**

- `s1`: God made Eve from Adam's side and brought her to him. They belonged together, unashamed and at peace.
- `s2`: God gave them the garden's fruit, but one tree was forbidden: the tree of the knowledge of good and evil. He warned them not to eat it.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/garden.webp](../../public/assets/art/theatre/garden.webp)
- Full-page ground print: [assets/art/theatre/continuous-garden-ground.webp](../../public/assets/art/theatre/continuous-garden-ground.webp)
- adam actor: mood `welcome`, position (-0.65, -0.5), visible width 1.1551, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-behind-garden-bush.webp](../../public/assets/art/theatre/eden-adam-behind-garden-bush.webp).
- eve actor: mood `welcome`, position (0.8, -0.25), visible width 1.2723, mirrored horizontally, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-eve-behind-garden-bush.webp](../../public/assets/art/theatre/eden-eve-behind-garden-bush.webp).
- Eden tree cutout: [assets/art/eden-tree.webp](../../public/assets/art/eden-tree.webp).
- Scene elements: tree at -2.3.

### 03. The serpent's question (`eden-03`)

**Passage:** Genesis 3:1–6

**Page art:** [assets/art/eden-03.webp](../../public/assets/art/eden-03.webp)

**Read-aloud text (en-US):**

- `s1`: A serpent spoke to Eve and questioned God's command. It promised that the forbidden fruit would make them like God, knowing good and evil.
- `s2`: Eve saw that the fruit looked good, took it, and ate. She gave some to Adam, and he ate too.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/garden.webp](../../public/assets/art/theatre/garden.webp)
- Full-page ground print: [assets/art/theatre/continuous-garden-ground.webp](../../public/assets/art/theatre/continuous-garden-ground.webp)
- adam actor: mood `warn`, position (-0.7, -0.5), visible width 1.164, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-fruit-receiving-behind-garden-bush.webp](../../public/assets/art/theatre/eden-adam-fruit-receiving-behind-garden-bush.webp).
- eve actor: mood `warn`, position (0.7, -0.45), visible width 1.014, mirrored horizontally, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-eve-fruit-behind-garden-bush.webp](../../public/assets/art/theatre/eden-eve-fruit-behind-garden-bush.webp).
- serpent-branch prop: visible width 1.25, position (1.75, 0.1); artwork [assets/art/theatre/serpent-branch.webp](../../public/assets/art/theatre/serpent-branch.webp).

### 04. Shame and hiding (`eden-04`)

**Passage:** Genesis 3:7–13

**Page art:** [assets/art/eden-04.webp](../../public/assets/art/eden-04.webp)

**Read-aloud text (en-US):**

- `s1`: At once they knew they were naked, and shame made them hide. They stitched leaves together to cover themselves.
- `s2`: When God called, Adam blamed Eve, and Eve blamed the serpent. Their trust had broken, and their choice had brought sin into the garden.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/garden.webp](../../public/assets/art/theatre/garden.webp)
- Full-page ground print: [assets/art/theatre/continuous-garden-ground.webp](../../public/assets/art/theatre/continuous-garden-ground.webp)
- adam actor: mood `sad`, position (-0.65, -0.45), visible width 0.6188, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-leaf-shame.webp](../../public/assets/art/theatre/eden-adam-leaf-shame.webp).
- eve actor: mood `sad`, position (0.65, -0.5), visible width 0.4809, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-eve-leaf-shame.webp](../../public/assets/art/theatre/eden-eve-leaf-shame.webp).
- Eden tree cutout: [assets/art/eden-tree.webp](../../public/assets/art/eden-tree.webp).
- Scene elements: tree at 2.2.

### 05. Consequences (`eden-05`)

**Passage:** Genesis 3:14–19

**Page art:** [assets/art/eden-05.webp](../../public/assets/art/eden-05.webp)

**Read-aloud text (en-US):**

- `s1`: God told the serpent that it would be cursed. The woman's offspring would strike its head, though the serpent would strike his heel.
- `s2`: God told Eve that bringing children would bring pain, and told Adam that the ground would resist his work. Their lives would now carry sorrow and toil.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/garden.webp](../../public/assets/art/theatre/garden.webp)
- Full-page ground print: [assets/art/theatre/continuous-garden-ground.webp](../../public/assets/art/theatre/continuous-garden-ground.webp)
- adam actor: mood `sad`, position (-0.7, -0.65), visible width 0.6893, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-leaf-consequences.webp](../../public/assets/art/theatre/eden-adam-leaf-consequences.webp).
- eve actor: mood `sad`, position (0.6, -0.4), visible width 0.5077, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-eve-leaf-consequences.webp](../../public/assets/art/theatre/eden-eve-leaf-consequences.webp).
- Eden tree cutout: [assets/art/eden-tree.webp](../../public/assets/art/eden-tree.webp).
- Scene elements: tree at -2.1.

### 06. Outside the garden (`eden-06`)

**Passage:** Genesis 3:20–24

**Page art:** [assets/art/eden-06.webp](../../public/assets/art/eden-06.webp)

**Read-aloud text (en-US):**

- `s1`: God made garments for Adam and Eve and clothed them. Then he sent them out of Eden, so they could not take fruit from the tree of life.
- `s2`: Cherubim and a flaming sword guarded the way to the tree of life. Adam and Eve could not go back.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/eden-guarded-way-backcloth.webp](../../public/assets/art/theatre/eden-guarded-way-backcloth.webp)
- Full-page ground print: [assets/art/theatre/exile-earth-ground.webp](../../public/assets/art/theatre/exile-earth-ground.webp)
- adam actor: mood `sad`, position (-0.85, -0.4), visible width 0.8404, mirrored horizontally, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-hide-walking.webp](../../public/assets/art/theatre/eden-adam-hide-walking.webp).
- eve actor: mood `sad`, position (0.8, -0.25), visible width 0.7082, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-eve-hide-walking.webp](../../public/assets/art/theatre/eden-eve-hide-walking.webp).

### 07. Life beyond Eden (`eden-07`)

**Passage:** Genesis 3:17–24

**Page art:** [assets/art/eden-07.webp](../../public/assets/art/eden-07.webp)

**Read-aloud text (en-US):**

- `s1`: Outside Eden, Adam and Eve worked hard for food among thorns. They would grow old and return to the dust from which Adam had been made.
- `s2`: The loss was real, but God had not stopped seeing them. Their story showed how disobedience wounds, and why people need God's rescue.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/exile.webp](../../public/assets/art/theatre/exile.webp)
- Full-page ground print: [assets/art/theatre/exile-earth-ground.webp](../../public/assets/art/theatre/exile-earth-ground.webp)
- adam actor: mood `work`, position (-0.75, -0.75), visible width 1.1392, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-hide-work.webp](../../public/assets/art/theatre/eden-adam-hide-work.webp).
- eve actor: mood `work`, position (0.75, -0.45), visible width 0.9342, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-eve-hide-work.webp](../../public/assets/art/theatre/eden-eve-hide-work.webp).

### 08. A promise carried forward (`eden-08`)

**Passage:** Genesis 3:14–24

**Page art:** [assets/art/eden-08.webp](../../public/assets/art/eden-08.webp)

**Read-aloud text (en-US):**

- `s1`: Eden was behind them, yet God's word about the serpent carried a promise of victory. The Bible keeps that hope as its story continues.
- `s2`: Adam and Eve could not repair what they had broken by themselves. Their first choice reminds us to trust God's good ways and seek his mercy.

**Scene write-up and animation:**

- Painted backdrop: [assets/art/theatre/exile.webp](../../public/assets/art/theatre/exile.webp)
- Full-page ground print: [assets/art/theatre/exile-earth-ground.webp](../../public/assets/art/theatre/exile-earth-ground.webp)
- adam actor: mood `hope`, position (-0.75, -0.4), visible width 0.8109, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-adam-hide-hope.webp](../../public/assets/art/theatre/eden-adam-hide-hope.webp).
- eve actor: mood `hope`, position (0.65, -0.25), visible width 0.8778, mirrored horizontally, sway motion (0.35°, 6.2s cycle); artwork [assets/art/theatre/eden-eve-hide-hope.webp](../../public/assets/art/theatre/eden-eve-hide-hope.webp).

## Narration files by locale

The audio manifest records the measured duration for every file. Keys follow `locale/book/page/segment`; visible words are in the linked locale JSON above.

### en-GB (16 cues)

- `en-GB/eden/eden-01/s1` — [assets/audio/en-GB/eden/eden-01/s1-fbc211bd93e07b83a777.mp3](../../public/assets/audio/en-GB/eden/eden-01/s1-fbc211bd93e07b83a777.mp3) (7.68 s)
- `en-GB/eden/eden-01/s2` — [assets/audio/en-GB/eden/eden-01/s2-48cf9e83f1a7c3026b86.mp3](../../public/assets/audio/en-GB/eden/eden-01/s2-48cf9e83f1a7c3026b86.mp3) (4.94 s)
- `en-GB/eden/eden-02/s1` — [assets/audio/en-GB/eden/eden-02/s1-34b6fe6732d11de2e472.mp3](../../public/assets/audio/en-GB/eden/eden-02/s1-34b6fe6732d11de2e472.mp3) (5.43 s)
- `en-GB/eden/eden-02/s2` — [assets/audio/en-GB/eden/eden-02/s2-13451a4f3a0a67dcbc46.mp3](../../public/assets/audio/en-GB/eden/eden-02/s2-13451a4f3a0a67dcbc46.mp3) (6.76 s)
- `en-GB/eden/eden-03/s1` — [assets/audio/en-GB/eden/eden-03/s1-38ca015e2a6226ae4c5f.mp3](../../public/assets/audio/en-GB/eden/eden-03/s1-38ca015e2a6226ae4c5f.mp3) (7.51 s)
- `en-GB/eden/eden-03/s2` — [assets/audio/en-GB/eden/eden-03/s2-28d348779e14537d0f0d.mp3](../../public/assets/audio/en-GB/eden/eden-03/s2-28d348779e14537d0f0d.mp3) (4.79 s)
- `en-GB/eden/eden-04/s1` — [assets/audio/en-GB/eden/eden-04/s1-e0126985e05b652834b5.mp3](../../public/assets/audio/en-GB/eden/eden-04/s1-e0126985e05b652834b5.mp3) (5.65 s)
- `en-GB/eden/eden-04/s2` — [assets/audio/en-GB/eden/eden-04/s2-f30803f7a17687177fc1.mp3](../../public/assets/audio/en-GB/eden/eden-04/s2-f30803f7a17687177fc1.mp3) (7.24 s)
- `en-GB/eden/eden-05/s1` — [assets/audio/en-GB/eden/eden-05/s1-3e80a597b87936371052.mp3](../../public/assets/audio/en-GB/eden/eden-05/s1-3e80a597b87936371052.mp3) (6.37 s)
- `en-GB/eden/eden-05/s2` — [assets/audio/en-GB/eden/eden-05/s2-c41f67f3d9c0b4e1f6b1.mp3](../../public/assets/audio/en-GB/eden/eden-05/s2-c41f67f3d9c0b4e1f6b1.mp3) (7.96 s)
- `en-GB/eden/eden-06/s1` — [assets/audio/en-GB/eden/eden-06/s1-b036c0f6ac61d7922249.mp3](../../public/assets/audio/en-GB/eden/eden-06/s1-b036c0f6ac61d7922249.mp3) (7.01 s)
- `en-GB/eden/eden-06/s2` — [assets/audio/en-GB/eden/eden-06/s2-17bc34408905207788b7.mp3](../../public/assets/audio/en-GB/eden/eden-06/s2-17bc34408905207788b7.mp3) (5.37 s)
- `en-GB/eden/eden-07/s1` — [assets/audio/en-GB/eden/eden-07/s1-400e561124a4a1e69fd4.mp3](../../public/assets/audio/en-GB/eden/eden-07/s1-400e561124a4a1e69fd4.mp3) (7.58 s)
- `en-GB/eden/eden-07/s2` — [assets/audio/en-GB/eden/eden-07/s2-57105a9cd09012999fd3.mp3](../../public/assets/audio/en-GB/eden/eden-07/s2-57105a9cd09012999fd3.mp3) (7.04 s)
- `en-GB/eden/eden-08/s1` — [assets/audio/en-GB/eden/eden-08/s1-a4b55e5732a51c5c1084.mp3](../../public/assets/audio/en-GB/eden/eden-08/s1-a4b55e5732a51c5c1084.mp3) (7.60 s)
- `en-GB/eden/eden-08/s2` — [assets/audio/en-GB/eden/eden-08/s2-e486d87baf98a71e8296.mp3](../../public/assets/audio/en-GB/eden/eden-08/s2-e486d87baf98a71e8296.mp3) (7.32 s)

### en-US (16 cues)

- `en-US/eden/eden-01/s1` — [assets/audio/en-US/eden/eden-01/s1-d8527e49d2451a69a856.mp3](../../public/assets/audio/en-US/eden/eden-01/s1-d8527e49d2451a69a856.mp3) (7.88 s)
- `en-US/eden/eden-01/s2` — [assets/audio/en-US/eden/eden-01/s2-51db259a9498f9fc5814.mp3](../../public/assets/audio/en-US/eden/eden-01/s2-51db259a9498f9fc5814.mp3) (5.13 s)
- `en-US/eden/eden-02/s1` — [assets/audio/en-US/eden/eden-02/s1-1e6c52c5e1efa3a274bc.mp3](../../public/assets/audio/en-US/eden/eden-02/s1-1e6c52c5e1efa3a274bc.mp3) (5.91 s)
- `en-US/eden/eden-02/s2` — [assets/audio/en-US/eden/eden-02/s2-347e3fbf75cbdd3624e9.mp3](../../public/assets/audio/en-US/eden/eden-02/s2-347e3fbf75cbdd3624e9.mp3) (7.27 s)
- `en-US/eden/eden-03/s1` — [assets/audio/en-US/eden/eden-03/s1-6c0831baf7bd3a83155c.mp3](../../public/assets/audio/en-US/eden/eden-03/s1-6c0831baf7bd3a83155c.mp3) (8.06 s)
- `en-US/eden/eden-03/s2` — [assets/audio/en-US/eden/eden-03/s2-f51fd31abd9cba67bb16.mp3](../../public/assets/audio/en-US/eden/eden-03/s2-f51fd31abd9cba67bb16.mp3) (4.91 s)
- `en-US/eden/eden-04/s1` — [assets/audio/en-US/eden/eden-04/s1-e8849f2d28abffced09d.mp3](../../public/assets/audio/en-US/eden/eden-04/s1-e8849f2d28abffced09d.mp3) (5.96 s)
- `en-US/eden/eden-04/s2` — [assets/audio/en-US/eden/eden-04/s2-cc3da1e2c0304d1c3b60.mp3](../../public/assets/audio/en-US/eden/eden-04/s2-cc3da1e2c0304d1c3b60.mp3) (7.54 s)
- `en-US/eden/eden-05/s1` — [assets/audio/en-US/eden/eden-05/s1-afdf75840462a36253d4.mp3](../../public/assets/audio/en-US/eden/eden-05/s1-afdf75840462a36253d4.mp3) (6.81 s)
- `en-US/eden/eden-05/s2` — [assets/audio/en-US/eden/eden-05/s2-b64ee2fc562153b94f4b.mp3](../../public/assets/audio/en-US/eden/eden-05/s2-b64ee2fc562153b94f4b.mp3) (8.72 s)
- `en-US/eden/eden-06/s1` — [assets/audio/en-US/eden/eden-06/s1-236c2bd327dccaa1bb64.mp3](../../public/assets/audio/en-US/eden/eden-06/s1-236c2bd327dccaa1bb64.mp3) (7.40 s)
- `en-US/eden/eden-06/s2` — [assets/audio/en-US/eden/eden-06/s2-e9c742ba2d827aa1802b.mp3](../../public/assets/audio/en-US/eden/eden-06/s2-e9c742ba2d827aa1802b.mp3) (5.64 s)
- `en-US/eden/eden-07/s1` — [assets/audio/en-US/eden/eden-07/s1-9afe9a42e2a31ca43159.mp3](../../public/assets/audio/en-US/eden/eden-07/s1-9afe9a42e2a31ca43159.mp3) (7.99 s)
- `en-US/eden/eden-07/s2` — [assets/audio/en-US/eden/eden-07/s2-4079f27bd2b5480ce55e.mp3](../../public/assets/audio/en-US/eden/eden-07/s2-4079f27bd2b5480ce55e.mp3) (7.86 s)
- `en-US/eden/eden-08/s1` — [assets/audio/en-US/eden/eden-08/s1-f7c0c85fad264b7e9c85.mp3](../../public/assets/audio/en-US/eden/eden-08/s1-f7c0c85fad264b7e9c85.mp3) (8.22 s)
- `en-US/eden/eden-08/s2` — [assets/audio/en-US/eden/eden-08/s2-5c3dd4cae90a5b08d0af.mp3](../../public/assets/audio/en-US/eden/eden-08/s2-5c3dd4cae90a5b08d0af.mp3) (8.32 s)

### es (16 cues)

- `es/eden/eden-01/s1` — [assets/audio/es/eden/eden-01/s1-77549a66ded934b16cb5.mp3](../../public/assets/audio/es/eden/eden-01/s1-77549a66ded934b16cb5.mp3) (8.58 s)
- `es/eden/eden-01/s2` — [assets/audio/es/eden/eden-01/s2-39a2f06f1fcb8541306d.mp3](../../public/assets/audio/es/eden/eden-01/s2-39a2f06f1fcb8541306d.mp3) (5.44 s)
- `es/eden/eden-02/s1` — [assets/audio/es/eden/eden-02/s1-d1f6ff0104c9ca151190.mp3](../../public/assets/audio/es/eden/eden-02/s1-d1f6ff0104c9ca151190.mp3) (5.76 s)
- `es/eden/eden-02/s2` — [assets/audio/es/eden/eden-02/s2-ad48d0b0d33d04922da0.mp3](../../public/assets/audio/es/eden/eden-02/s2-ad48d0b0d33d04922da0.mp3) (7.56 s)
- `es/eden/eden-03/s1` — [assets/audio/es/eden/eden-03/s1-71ca6682d35d0addd501.mp3](../../public/assets/audio/es/eden/eden-03/s1-71ca6682d35d0addd501.mp3) (7.74 s)
- `es/eden/eden-03/s2` — [assets/audio/es/eden/eden-03/s2-d88414da47517935f236.mp3](../../public/assets/audio/es/eden/eden-03/s2-d88414da47517935f236.mp3) (5.57 s)
- `es/eden/eden-04/s1` — [assets/audio/es/eden/eden-04/s1-d52440356290a9e2bd29.mp3](../../public/assets/audio/es/eden/eden-04/s1-d52440356290a9e2bd29.mp3) (6.16 s)
- `es/eden/eden-04/s2` — [assets/audio/es/eden/eden-04/s2-9f28811a8da87e776bdd.mp3](../../public/assets/audio/es/eden/eden-04/s2-9f28811a8da87e776bdd.mp3) (8.27 s)
- `es/eden/eden-05/s1` — [assets/audio/es/eden/eden-05/s1-4e77cd39b03b800d1d22.mp3](../../public/assets/audio/es/eden/eden-05/s1-4e77cd39b03b800d1d22.mp3) (7.32 s)
- `es/eden/eden-05/s2` — [assets/audio/es/eden/eden-05/s2-492355072ace7944eaf3.mp3](../../public/assets/audio/es/eden/eden-05/s2-492355072ace7944eaf3.mp3) (8.38 s)
- `es/eden/eden-06/s1` — [assets/audio/es/eden/eden-06/s1-6428674d9d0b2245f145.mp3](../../public/assets/audio/es/eden/eden-06/s1-6428674d9d0b2245f145.mp3) (6.80 s)
- `es/eden/eden-06/s2` — [assets/audio/es/eden/eden-06/s2-6d9b09b2effc9aca5ed7.mp3](../../public/assets/audio/es/eden/eden-06/s2-6d9b09b2effc9aca5ed7.mp3) (6.61 s)
- `es/eden/eden-07/s1` — [assets/audio/es/eden/eden-07/s1-a8ecba6a2c0ffad8ef89.mp3](../../public/assets/audio/es/eden/eden-07/s1-a8ecba6a2c0ffad8ef89.mp3) (8.66 s)
- `es/eden/eden-07/s2` — [assets/audio/es/eden/eden-07/s2-dc00631698a07efae797.mp3](../../public/assets/audio/es/eden/eden-07/s2-dc00631698a07efae797.mp3) (9.03 s)
- `es/eden/eden-08/s1` — [assets/audio/es/eden/eden-08/s1-bc85695a17a8dea9ac5c.mp3](../../public/assets/audio/es/eden/eden-08/s1-bc85695a17a8dea9ac5c.mp3) (9.20 s)
- `es/eden/eden-08/s2` — [assets/audio/es/eden/eden-08/s2-717c3141eb612df26e85.mp3](../../public/assets/audio/es/eden/eden-08/s2-717c3141eb612df26e85.mp3) (8.82 s)

### fr (16 cues)

- `fr/eden/eden-01/s1` — [assets/audio/fr/eden/eden-01/s1-c055773500e0f804d5b7.mp3](../../public/assets/audio/fr/eden/eden-01/s1-c055773500e0f804d5b7.mp3) (8.08 s)
- `fr/eden/eden-01/s2` — [assets/audio/fr/eden/eden-01/s2-771533c6e893cb50782b.mp3](../../public/assets/audio/fr/eden/eden-01/s2-771533c6e893cb50782b.mp3) (5.37 s)
- `fr/eden/eden-02/s1` — [assets/audio/fr/eden/eden-02/s1-78ddf783ed27c02e530b.mp3](../../public/assets/audio/fr/eden/eden-02/s1-78ddf783ed27c02e530b.mp3) (6.63 s)
- `fr/eden/eden-02/s2` — [assets/audio/fr/eden/eden-02/s2-2ce472a4b9d90b3894de.mp3](../../public/assets/audio/fr/eden/eden-02/s2-2ce472a4b9d90b3894de.mp3) (8.61 s)
- `fr/eden/eden-03/s1` — [assets/audio/fr/eden/eden-03/s1-74e9979c32e5634c0136.mp3](../../public/assets/audio/fr/eden/eden-03/s1-74e9979c32e5634c0136.mp3) (8.20 s)
- `fr/eden/eden-03/s2` — [assets/audio/fr/eden/eden-03/s2-290941ae73415e0938c1.mp3](../../public/assets/audio/fr/eden/eden-03/s2-290941ae73415e0938c1.mp3) (5.27 s)
- `fr/eden/eden-04/s1` — [assets/audio/fr/eden/eden-04/s1-7934fae7a8bbbc257c57.mp3](../../public/assets/audio/fr/eden/eden-04/s1-7934fae7a8bbbc257c57.mp3) (5.76 s)
- `fr/eden/eden-04/s2` — [assets/audio/fr/eden/eden-04/s2-6f32d5da64c023d5d673.mp3](../../public/assets/audio/fr/eden/eden-04/s2-6f32d5da64c023d5d673.mp3) (8.41 s)
- `fr/eden/eden-05/s1` — [assets/audio/fr/eden/eden-05/s1-00643d99d7e5b9af8b27.mp3](../../public/assets/audio/fr/eden/eden-05/s1-00643d99d7e5b9af8b27.mp3) (7.51 s)
- `fr/eden/eden-05/s2` — [assets/audio/fr/eden/eden-05/s2-858c7cab0ce2a18b5d66.mp3](../../public/assets/audio/fr/eden/eden-05/s2-858c7cab0ce2a18b5d66.mp3) (9.01 s)
- `fr/eden/eden-06/s1` — [assets/audio/fr/eden/eden-06/s1-28bd8eb6a9824028a739.mp3](../../public/assets/audio/fr/eden/eden-06/s1-28bd8eb6a9824028a739.mp3) (7.43 s)
- `fr/eden/eden-06/s2` — [assets/audio/fr/eden/eden-06/s2-550ad31d35e28f222031.mp3](../../public/assets/audio/fr/eden/eden-06/s2-550ad31d35e28f222031.mp3) (6.24 s)
- `fr/eden/eden-07/s1` — [assets/audio/fr/eden/eden-07/s1-a18202a275702ae5d83b.mp3](../../public/assets/audio/fr/eden/eden-07/s1-a18202a275702ae5d83b.mp3) (8.39 s)
- `fr/eden/eden-07/s2` — [assets/audio/fr/eden/eden-07/s2-d84962a0aaeecffaaa72.mp3](../../public/assets/audio/fr/eden/eden-07/s2-d84962a0aaeecffaaa72.mp3) (9.02 s)
- `fr/eden/eden-08/s1` — [assets/audio/fr/eden/eden-08/s1-2b8efce3de501fe5ff57.mp3](../../public/assets/audio/fr/eden/eden-08/s1-2b8efce3de501fe5ff57.mp3) (9.14 s)
- `fr/eden/eden-08/s2` — [assets/audio/fr/eden/eden-08/s2-c864844c370c9ffc4df3.mp3](../../public/assets/audio/fr/eden/eden-08/s2-c864844c370c9ffc4df3.mp3) (9.42 s)

### hi (16 cues)

- `hi/eden/eden-01/s1` — [assets/audio/hi/eden/eden-01/s1-7b3930d0974bebe2a87d.mp3](../../public/assets/audio/hi/eden/eden-01/s1-7b3930d0974bebe2a87d.mp3) (11.44 s)
- `hi/eden/eden-01/s2` — [assets/audio/hi/eden/eden-01/s2-f9675bee7e732c50cab6.mp3](../../public/assets/audio/hi/eden/eden-01/s2-f9675bee7e732c50cab6.mp3) (8.09 s)
- `hi/eden/eden-02/s1` — [assets/audio/hi/eden/eden-02/s1-a6f8f22c6f1c0c14edca.mp3](../../public/assets/audio/hi/eden/eden-02/s1-a6f8f22c6f1c0c14edca.mp3) (8.63 s)
- `hi/eden/eden-02/s2` — [assets/audio/hi/eden/eden-02/s2-b1b1cadcd240771fae58.mp3](../../public/assets/audio/hi/eden/eden-02/s2-b1b1cadcd240771fae58.mp3) (9.52 s)
- `hi/eden/eden-03/s1` — [assets/audio/hi/eden/eden-03/s1-7bbc791bd31166283e55.mp3](../../public/assets/audio/hi/eden/eden-03/s1-7bbc791bd31166283e55.mp3) (11.99 s)
- `hi/eden/eden-03/s2` — [assets/audio/hi/eden/eden-03/s2-d77c3bb46adbe3f2300a.mp3](../../public/assets/audio/hi/eden/eden-03/s2-d77c3bb46adbe3f2300a.mp3) (7.35 s)
- `hi/eden/eden-04/s1` — [assets/audio/hi/eden/eden-04/s1-a7ab71254d92ef19e80c.mp3](../../public/assets/audio/hi/eden/eden-04/s1-a7ab71254d92ef19e80c.mp3) (7.82 s)
- `hi/eden/eden-04/s2` — [assets/audio/hi/eden/eden-04/s2-d960f1bde903f18b77f6.mp3](../../public/assets/audio/hi/eden/eden-04/s2-d960f1bde903f18b77f6.mp3) (9.92 s)
- `hi/eden/eden-05/s1` — [assets/audio/hi/eden/eden-05/s1-27c4292f429d030ff023.mp3](../../public/assets/audio/hi/eden/eden-05/s1-27c4292f429d030ff023.mp3) (7.82 s)
- `hi/eden/eden-05/s2` — [assets/audio/hi/eden/eden-05/s2-1044eeb23793a26999dc.mp3](../../public/assets/audio/hi/eden/eden-05/s2-1044eeb23793a26999dc.mp3) (11.04 s)
- `hi/eden/eden-06/s1` — [assets/audio/hi/eden/eden-06/s1-d4cdc9576982c5de4011.mp3](../../public/assets/audio/hi/eden/eden-06/s1-d4cdc9576982c5de4011.mp3) (10.14 s)
- `hi/eden/eden-06/s2` — [assets/audio/hi/eden/eden-06/s2-854b17179e7417215727.mp3](../../public/assets/audio/hi/eden/eden-06/s2-854b17179e7417215727.mp3) (8.62 s)
- `hi/eden/eden-07/s1` — [assets/audio/hi/eden/eden-07/s1-a661f2d448760dfc3f6a.mp3](../../public/assets/audio/hi/eden/eden-07/s1-a661f2d448760dfc3f6a.mp3) (10.69 s)
- `hi/eden/eden-07/s2` — [assets/audio/hi/eden/eden-07/s2-3dc9dfc9c13af16aa756.mp3](../../public/assets/audio/hi/eden/eden-07/s2-3dc9dfc9c13af16aa756.mp3) (11.97 s)
- `hi/eden/eden-08/s1` — [assets/audio/hi/eden/eden-08/s1-8cffe5aa98ddab6582f4.mp3](../../public/assets/audio/hi/eden/eden-08/s1-8cffe5aa98ddab6582f4.mp3) (11.29 s)
- `hi/eden/eden-08/s2` — [assets/audio/hi/eden/eden-08/s2-93de739f6d67f1ab1ed7.mp3](../../public/assets/audio/hi/eden/eden-08/s2-93de739f6d67f1ab1ed7.mp3) (12.62 s)

### it (16 cues)

- `it/eden/eden-01/s1` — [assets/audio/it/eden/eden-01/s1-20fa3134d7dbf9d96f8c.mp3](../../public/assets/audio/it/eden/eden-01/s1-20fa3134d7dbf9d96f8c.mp3) (8.00 s)
- `it/eden/eden-01/s2` — [assets/audio/it/eden/eden-01/s2-8828bc3d4b7b1b9f86dc.mp3](../../public/assets/audio/it/eden/eden-01/s2-8828bc3d4b7b1b9f86dc.mp3) (6.80 s)
- `it/eden/eden-02/s1` — [assets/audio/it/eden/eden-02/s1-deb40551195b16c9cbb9.mp3](../../public/assets/audio/it/eden/eden-02/s1-deb40551195b16c9cbb9.mp3) (6.42 s)
- `it/eden/eden-02/s2` — [assets/audio/it/eden/eden-02/s2-9a167d20b6295b7c93fb.mp3](../../public/assets/audio/it/eden/eden-02/s2-9a167d20b6295b7c93fb.mp3) (7.65 s)
- `it/eden/eden-03/s1` — [assets/audio/it/eden/eden-03/s1-2749b3da3b2c3650bc8d.mp3](../../public/assets/audio/it/eden/eden-03/s1-2749b3da3b2c3650bc8d.mp3) (8.54 s)
- `it/eden/eden-03/s2` — [assets/audio/it/eden/eden-03/s2-82152ec36d5b3cfadd3a.mp3](../../public/assets/audio/it/eden/eden-03/s2-82152ec36d5b3cfadd3a.mp3) (5.59 s)
- `it/eden/eden-04/s1` — [assets/audio/it/eden/eden-04/s1-1056f85876392d9c6604.mp3](../../public/assets/audio/it/eden/eden-04/s1-1056f85876392d9c6604.mp3) (6.55 s)
- `it/eden/eden-04/s2` — [assets/audio/it/eden/eden-04/s2-7d36b8f596c1021f1022.mp3](../../public/assets/audio/it/eden/eden-04/s2-7d36b8f596c1021f1022.mp3) (8.80 s)
- `it/eden/eden-05/s1` — [assets/audio/it/eden/eden-05/s1-24cc12b76bd167f18d69.mp3](../../public/assets/audio/it/eden/eden-05/s1-24cc12b76bd167f18d69.mp3) (8.98 s)
- `it/eden/eden-05/s2` — [assets/audio/it/eden/eden-05/s2-ce6b78fdd5331f660f72.mp3](../../public/assets/audio/it/eden/eden-05/s2-ce6b78fdd5331f660f72.mp3) (8.91 s)
- `it/eden/eden-06/s1` — [assets/audio/it/eden/eden-06/s1-50d7457a625f837288be.mp3](../../public/assets/audio/it/eden/eden-06/s1-50d7457a625f837288be.mp3) (7.52 s)
- `it/eden/eden-06/s2` — [assets/audio/it/eden/eden-06/s2-19d1fca428488bf63118.mp3](../../public/assets/audio/it/eden/eden-06/s2-19d1fca428488bf63118.mp3) (7.18 s)
- `it/eden/eden-07/s1` — [assets/audio/it/eden/eden-07/s1-4875575d7bb01ba7d43b.mp3](../../public/assets/audio/it/eden/eden-07/s1-4875575d7bb01ba7d43b.mp3) (9.40 s)
- `it/eden/eden-07/s2` — [assets/audio/it/eden/eden-07/s2-0dc6ac725764fff0a2cd.mp3](../../public/assets/audio/it/eden/eden-07/s2-0dc6ac725764fff0a2cd.mp3) (9.36 s)
- `it/eden/eden-08/s1` — [assets/audio/it/eden/eden-08/s1-4c25cd059ccf4014072a.mp3](../../public/assets/audio/it/eden/eden-08/s1-4c25cd059ccf4014072a.mp3) (9.15 s)
- `it/eden/eden-08/s2` — [assets/audio/it/eden/eden-08/s2-69581b6e2c5bd4086f7b.mp3](../../public/assets/audio/it/eden/eden-08/s2-69581b6e2c5bd4086f7b.mp3) (9.75 s)

### ja (16 cues)

- `ja/eden/eden-01/s1` — [assets/audio/ja/eden/eden-01/s1-9429155bce71d4623568.mp3](../../public/assets/audio/ja/eden/eden-01/s1-9429155bce71d4623568.mp3) (8.86 s)
- `ja/eden/eden-01/s2` — [assets/audio/ja/eden/eden-01/s2-382a0d50f6460c0dea40.mp3](../../public/assets/audio/ja/eden/eden-01/s2-382a0d50f6460c0dea40.mp3) (7.88 s)
- `ja/eden/eden-02/s1` — [assets/audio/ja/eden/eden-02/s1-470e6bcd2e7d16f6a422.mp3](../../public/assets/audio/ja/eden/eden-02/s1-470e6bcd2e7d16f6a422.mp3) (7.51 s)
- `ja/eden/eden-02/s2` — [assets/audio/ja/eden/eden-02/s2-4d53c2e6d46720e7368c.mp3](../../public/assets/audio/ja/eden/eden-02/s2-4d53c2e6d46720e7368c.mp3) (9.19 s)
- `ja/eden/eden-03/s1` — [assets/audio/ja/eden/eden-03/s1-a3ef38e3f4f6a461d746.mp3](../../public/assets/audio/ja/eden/eden-03/s1-a3ef38e3f4f6a461d746.mp3) (8.32 s)
- `ja/eden/eden-03/s2` — [assets/audio/ja/eden/eden-03/s2-08f1315c13d23f763bf9.mp3](../../public/assets/audio/ja/eden/eden-03/s2-08f1315c13d23f763bf9.mp3) (6.34 s)
- `ja/eden/eden-04/s1` — [assets/audio/ja/eden/eden-04/s1-2118eadbadb6a48a9def.mp3](../../public/assets/audio/ja/eden/eden-04/s1-2118eadbadb6a48a9def.mp3) (6.67 s)
- `ja/eden/eden-04/s2` — [assets/audio/ja/eden/eden-04/s2-6b68254de81b28ab391e.mp3](../../public/assets/audio/ja/eden/eden-04/s2-6b68254de81b28ab391e.mp3) (7.79 s)
- `ja/eden/eden-05/s1` — [assets/audio/ja/eden/eden-05/s1-7b7e21f633303863a4d6.mp3](../../public/assets/audio/ja/eden/eden-05/s1-7b7e21f633303863a4d6.mp3) (8.01 s)
- `ja/eden/eden-05/s2` — [assets/audio/ja/eden/eden-05/s2-e06ad652de76faa8e47d.mp3](../../public/assets/audio/ja/eden/eden-05/s2-e06ad652de76faa8e47d.mp3) (10.51 s)
- `ja/eden/eden-06/s1` — [assets/audio/ja/eden/eden-06/s1-95ce15157aee10087695.mp3](../../public/assets/audio/ja/eden/eden-06/s1-95ce15157aee10087695.mp3) (9.01 s)
- `ja/eden/eden-06/s2` — [assets/audio/ja/eden/eden-06/s2-d9c65879079d4a8aab5a.mp3](../../public/assets/audio/ja/eden/eden-06/s2-d9c65879079d4a8aab5a.mp3) (6.96 s)
- `ja/eden/eden-07/s1` — [assets/audio/ja/eden/eden-07/s1-b5422168aede635ac9bc.mp3](../../public/assets/audio/ja/eden/eden-07/s1-b5422168aede635ac9bc.mp3) (9.88 s)
- `ja/eden/eden-07/s2` — [assets/audio/ja/eden/eden-07/s2-77a10677c10c1d2cbd30.mp3](../../public/assets/audio/ja/eden/eden-07/s2-77a10677c10c1d2cbd30.mp3) (9.69 s)
- `ja/eden/eden-08/s1` — [assets/audio/ja/eden/eden-08/s1-e2ab56c3cdaaab8b3bc6.mp3](../../public/assets/audio/ja/eden/eden-08/s1-e2ab56c3cdaaab8b3bc6.mp3) (10.87 s)
- `ja/eden/eden-08/s2` — [assets/audio/ja/eden/eden-08/s2-04a76576edd2540bc793.mp3](../../public/assets/audio/ja/eden/eden-08/s2-04a76576edd2540bc793.mp3) (9.85 s)

### pt-BR (16 cues)

- `pt-BR/eden/eden-01/s1` — [assets/audio/pt-BR/eden/eden-01/s1-9501fbcc8512a5f2c7b3.mp3](../../public/assets/audio/pt-BR/eden/eden-01/s1-9501fbcc8512a5f2c7b3.mp3) (8.41 s)
- `pt-BR/eden/eden-01/s2` — [assets/audio/pt-BR/eden/eden-01/s2-7b94a50c67f03cb40e69.mp3](../../public/assets/audio/pt-BR/eden/eden-01/s2-7b94a50c67f03cb40e69.mp3) (5.52 s)
- `pt-BR/eden/eden-02/s1` — [assets/audio/pt-BR/eden/eden-02/s1-386092145fa91ff644ae.mp3](../../public/assets/audio/pt-BR/eden/eden-02/s1-386092145fa91ff644ae.mp3) (6.10 s)
- `pt-BR/eden/eden-02/s2` — [assets/audio/pt-BR/eden/eden-02/s2-b2d481a895cde78c1069.mp3](../../public/assets/audio/pt-BR/eden/eden-02/s2-b2d481a895cde78c1069.mp3) (7.64 s)
- `pt-BR/eden/eden-03/s1` — [assets/audio/pt-BR/eden/eden-03/s1-19e83efc5bf0bea629d3.mp3](../../public/assets/audio/pt-BR/eden/eden-03/s1-19e83efc5bf0bea629d3.mp3) (7.74 s)
- `pt-BR/eden/eden-03/s2` — [assets/audio/pt-BR/eden/eden-03/s2-d44e63cdbe559fed25bf.mp3](../../public/assets/audio/pt-BR/eden/eden-03/s2-d44e63cdbe559fed25bf.mp3) (5.45 s)
- `pt-BR/eden/eden-04/s1` — [assets/audio/pt-BR/eden/eden-04/s1-59137e746f6d4eca1f13.mp3](../../public/assets/audio/pt-BR/eden/eden-04/s1-59137e746f6d4eca1f13.mp3) (6.71 s)
- `pt-BR/eden/eden-04/s2` — [assets/audio/pt-BR/eden/eden-04/s2-a38d70434682e521ea9b.mp3](../../public/assets/audio/pt-BR/eden/eden-04/s2-a38d70434682e521ea9b.mp3) (8.06 s)
- `pt-BR/eden/eden-05/s1` — [assets/audio/pt-BR/eden/eden-05/s1-66e9804d5cd29330a807.mp3](../../public/assets/audio/pt-BR/eden/eden-05/s1-66e9804d5cd29330a807.mp3) (7.68 s)
- `pt-BR/eden/eden-05/s2` — [assets/audio/pt-BR/eden/eden-05/s2-5aad8a2e6c8496cb72dc.mp3](../../public/assets/audio/pt-BR/eden/eden-05/s2-5aad8a2e6c8496cb72dc.mp3) (8.19 s)
- `pt-BR/eden/eden-06/s1` — [assets/audio/pt-BR/eden/eden-06/s1-fb37f3164f72fe1b12d3.mp3](../../public/assets/audio/pt-BR/eden/eden-06/s1-fb37f3164f72fe1b12d3.mp3) (7.31 s)
- `pt-BR/eden/eden-06/s2` — [assets/audio/pt-BR/eden/eden-06/s2-29352187a4e6180ad395.mp3](../../public/assets/audio/pt-BR/eden/eden-06/s2-29352187a4e6180ad395.mp3) (6.14 s)
- `pt-BR/eden/eden-07/s1` — [assets/audio/pt-BR/eden/eden-07/s1-9f3eab353c58f5d56399.mp3](../../public/assets/audio/pt-BR/eden/eden-07/s1-9f3eab353c58f5d56399.mp3) (8.71 s)
- `pt-BR/eden/eden-07/s2` — [assets/audio/pt-BR/eden/eden-07/s2-55852fb583c8d8e09867.mp3](../../public/assets/audio/pt-BR/eden/eden-07/s2-55852fb583c8d8e09867.mp3) (8.11 s)
- `pt-BR/eden/eden-08/s1` — [assets/audio/pt-BR/eden/eden-08/s1-bd28138460a26ed304c1.mp3](../../public/assets/audio/pt-BR/eden/eden-08/s1-bd28138460a26ed304c1.mp3) (8.91 s)
- `pt-BR/eden/eden-08/s2` — [assets/audio/pt-BR/eden/eden-08/s2-eab6db29ba086a939e77.mp3](../../public/assets/audio/pt-BR/eden/eden-08/s2-eab6db29ba086a939e77.mp3) (9.51 s)

### zh-CN (16 cues)

- `zh-CN/eden/eden-01/s1` — [assets/audio/zh-CN/eden/eden-01/s1-eb1633b9e4ff2e675b0f.mp3](../../public/assets/audio/zh-CN/eden/eden-01/s1-eb1633b9e4ff2e675b0f.mp3) (10.96 s)
- `zh-CN/eden/eden-01/s2` — [assets/audio/zh-CN/eden/eden-01/s2-8154781419563db96ebe.mp3](../../public/assets/audio/zh-CN/eden/eden-01/s2-8154781419563db96ebe.mp3) (8.00 s)
- `zh-CN/eden/eden-02/s1` — [assets/audio/zh-CN/eden/eden-02/s1-b5a68118a5002e2d9298.mp3](../../public/assets/audio/zh-CN/eden/eden-02/s1-b5a68118a5002e2d9298.mp3) (8.96 s)
- `zh-CN/eden/eden-02/s2` — [assets/audio/zh-CN/eden/eden-02/s2-0f7ef76ffcdd33f7aa5c.mp3](../../public/assets/audio/zh-CN/eden/eden-02/s2-0f7ef76ffcdd33f7aa5c.mp3) (9.36 s)
- `zh-CN/eden/eden-03/s1` — [assets/audio/zh-CN/eden/eden-03/s1-acea423fdfbb6773a446.mp3](../../public/assets/audio/zh-CN/eden/eden-03/s1-acea423fdfbb6773a446.mp3) (8.53 s)
- `zh-CN/eden/eden-03/s2` — [assets/audio/zh-CN/eden/eden-03/s2-e0c1610ac357752b5aed.mp3](../../public/assets/audio/zh-CN/eden/eden-03/s2-e0c1610ac357752b5aed.mp3) (6.64 s)
- `zh-CN/eden/eden-04/s1` — [assets/audio/zh-CN/eden/eden-04/s1-667761c3a23d0dc1b636.mp3](../../public/assets/audio/zh-CN/eden/eden-04/s1-667761c3a23d0dc1b636.mp3) (8.18 s)
- `zh-CN/eden/eden-04/s2` — [assets/audio/zh-CN/eden/eden-04/s2-ab411abeda4e7148fc29.mp3](../../public/assets/audio/zh-CN/eden/eden-04/s2-ab411abeda4e7148fc29.mp3) (9.23 s)
- `zh-CN/eden/eden-05/s1` — [assets/audio/zh-CN/eden/eden-05/s1-48e0308f19310e8c83e1.mp3](../../public/assets/audio/zh-CN/eden/eden-05/s1-48e0308f19310e8c83e1.mp3) (6.53 s)
- `zh-CN/eden/eden-05/s2` — [assets/audio/zh-CN/eden/eden-05/s2-60754576d6fcea988c7f.mp3](../../public/assets/audio/zh-CN/eden/eden-05/s2-60754576d6fcea988c7f.mp3) (9.55 s)
- `zh-CN/eden/eden-06/s1` — [assets/audio/zh-CN/eden/eden-06/s1-2584568f868ddab3d28e.mp3](../../public/assets/audio/zh-CN/eden/eden-06/s1-2584568f868ddab3d28e.mp3) (8.96 s)
- `zh-CN/eden/eden-06/s2` — [assets/audio/zh-CN/eden/eden-06/s2-290d91727cfb7b91fae6.mp3](../../public/assets/audio/zh-CN/eden/eden-06/s2-290d91727cfb7b91fae6.mp3) (6.71 s)
- `zh-CN/eden/eden-07/s1` — [assets/audio/zh-CN/eden/eden-07/s1-080667c96530272730b1.mp3](../../public/assets/audio/zh-CN/eden/eden-07/s1-080667c96530272730b1.mp3) (10.92 s)
- `zh-CN/eden/eden-07/s2` — [assets/audio/zh-CN/eden/eden-07/s2-f2481847578895ff49f3.mp3](../../public/assets/audio/zh-CN/eden/eden-07/s2-f2481847578895ff49f3.mp3) (10.28 s)
- `zh-CN/eden/eden-08/s1` — [assets/audio/zh-CN/eden/eden-08/s1-08a6d2b593eefee9f369.mp3](../../public/assets/audio/zh-CN/eden/eden-08/s1-08a6d2b593eefee9f369.mp3) (10.18 s)
- `zh-CN/eden/eden-08/s2` — [assets/audio/zh-CN/eden/eden-08/s2-4116974fee5c581426e3.mp3](../../public/assets/audio/zh-CN/eden/eden-08/s2-4116974fee5c581426e3.mp3) (10.24 s)
