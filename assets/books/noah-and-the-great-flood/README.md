# Noah and the Great Flood stage-art catalog

The retained eight-page story and its nine localized narration sets remain in
[`public/content/`](../../../public/content/). Stage blocking is authored in
[`src/noah-stage-direction.ts`](../../../src/noah-stage-direction.ts); this file
records the art currently mapped to each spread. Book-owned source PNGs are in
`source-art/`, brief or edit notes are in `prompts/`, and reader-ready WebP files
are under `public/assets/books/noah-and-the-great-flood/art/`. Transparent
cutouts preserve their alpha in WebP.

## Active spread art

| Page      | Active stage art                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `noah-01` | Shared shipyard backcloth; Noah on the worksite-earth ground.                                                                                                      |
| `noah-02` | Same shipyard backcloth and ground; Noah works beside the shared timber bench.                                                                                     |
| `noah-03` | Shared boarding backcloth and worksite ground; Noah, the shared seven-person family cutout, and animal pairs turned toward the ark door.                           |
| `noah-04` | Shared open-storm backcloth; book-owned storm-water ground, the shared ark, and three independent book-owned storm-wave cutouts with staggered depths and motion.  |
| `noah-05` | Book-owned built-in ark-window backcloth and plank floor; Noah and a small returning dove with an olive leaf. The old procedural picture frame is disabled.        |
| `noah-06` | Shared shore backcloth and book-owned stone ground; Noah, the same family in a sober pose, and animal pairs leaving the ark at the same scale as page 3.           |
| `noah-07` | Book-owned covenant-shore backcloth and shared stone ground; Noah, the family, and a separate transparent stone-altar cutout. The rainbow is painted into the sky. |
| `noah-08` | Same covenant-shore backcloth and stone ground as page 7; Noah and the family remember the covenant.                                                               |

The directions reuse existing theatre art where it is already suitable: the
shipyard, boarding, storm, shore and ark cutouts, Noah pose atlas, timber bench,
family group, animal pair and dove. Reused Jonah storm textures are copied into
this book's own runtime/source folders so the Noah stage does not depend on
another book's asset path. No story text or narration cue was changed for this
visual revision.

## Book-owned source art

| Asset ID                        | Active page(s) | Role                                                                                                              | Source PNG                                          | Prompt/edit note                                        | Reader WebP                                                                                          |
| ------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `noah-worksite-earth-ground`    | 1–3            | Full spread worksite ground.                                                                                      | [PNG](source-art/noah-worksite-earth-ground.png)    | [Brief](prompts/noah-worksite-earth-ground.txt)         | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp)    |
| `noah-storm-water-ground`       | 4              | Dark open-water ground; copied from the Jonah storm asset and kept book-local.                                    | [PNG](source-art/noah-storm-water-ground.png)       | [Source prompt](prompts/noah-storm-water-ground.txt)    | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-storm-water-ground.webp)       |
| `noah-storm-wave-crest`         | 4              | Transparent rolling-crest cutout repeated at three depths; copied from the Jonah storm asset and kept book-local. | [PNG](source-art/noah-storm-wave-crest.png)         | [Source/edit prompt](prompts/noah-storm-wave-crest.txt) | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp)         |
| `noah-ark-interior-backdrop`    | 5              | Ark cabin wall with a built-in window onto receding floodwater.                                                   | [PNG](source-art/noah-ark-interior-backdrop.png)    | [Brief](prompts/noah-ark-interior-backdrop.txt)         | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-ark-interior-backdrop.webp)    |
| `noah-ark-interior-plank-floor` | 5              | Horizontal ark floor print matching the cabin wall.                                                               | [PNG](source-art/noah-ark-interior-plank-floor.png) | [Brief](prompts/noah-ark-interior-plank-floor.txt)      | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-ark-interior-plank-floor.webp) |
| `noah-shore-stone-ground`       | 6–8            | Continuous warm stone ground for the dry shore scenes.                                                            | [PNG](source-art/noah-shore-stone-ground.png)       | [Brief](prompts/noah-shore-stone-ground.txt)            | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp)       |
| `noah-family-seven-sober`       | 6              | Same seven people and clothing as the shared family cutout, with solemn expressions.                              | [PNG](source-art/noah-family-seven-sober.png)       | [Edit brief](prompts/noah-family-seven-sober.txt)       | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-family-seven-sober.webp)       |
| `noah-covenant-shore-backdrop`  | 7–8            | Shared shore backdrop with a soft painted rainbow in the sky.                                                     | [PNG](source-art/noah-covenant-shore-backdrop.png)  | [Edit note](prompts/noah-covenant-shore-backdrop.txt)   | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp)  |
| `noah-stone-altar`              | 7              | Transparent stone altar prop.                                                                                     | [PNG](source-art/noah-stone-altar.png)              | [Brief](prompts/noah-stone-altar.txt)                   | [WebP](../../../public/assets/books/noah-and-the-great-flood/art/noah-stone-altar.webp)              |

The source notes capture the art brief and known edits for review. The
stage-direction module is the source of truth for file paths, page membership,
scale, placement, animation and flip direction.
