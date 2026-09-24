# Jonah and the Whale source-art catalog

The authored book is [`public/books/jonah-and-the-whale.book.json`](../../../public/books/jonah-and-the-whale.book.json). Its spread entries are the source of truth for page text, passage references, scene notes, art placement, animation, narration, and soundtrack ranges. The human reading index at [`docs/books/jonah-and-the-whale.md`](../../../docs/books/jonah-and-the-whale.md) lays those materials out page by page.

Book-owned source PNGs live in `source-art/`; matching prompt and revision notes live in `prompts/`; reader copies live in `public/assets/books/jonah-and-the-whale/art/` as WebP. The lowercase hyphenated filename stem is the book asset ID. Transparent cutouts retain alpha in the reader WebP. Some early shared art remains under `public/assets/art/jonah/` and is referenced directly by the book rather than duplicated here.

## Active spread art

Layer order, coordinates, scale, animation, and flips remain authored in the book JSON. This table records which art IDs each page currently uses.

| Page | Active art IDs |
| --- | --- |
| `jonah-called` | Backdrop `joppa-harbor-backdrop`; ground `joppa-quay-ground`; Jonah `jonah-cutout` (shared art). |
| `jonah-boards-ship` | Backdrop `joppa-harbor-backdrop`; water `calm-harbor-water-ground`; combined ship, crew, and onboard Jonah `ship-jonah-boarding`. |
| `storm-at-sea` | Backdrop `storm-sea`; water `storm-water-ground`; combined storm ship, crew, and Jonah `storm-deck-jonah`; three wave layers `storm-wave-layer`. |
| `jonah-overboard` | Backdrop `storm-sea`; water `storm-water-ground`; ship and crew without Jonah `storm-ship-sailors`; frightened Jonah `jonah-overboard`; three wave layers `storm-wave-layer`. |
| `jonah-rescued` | Backdrop `underwater-backdrop` (shared art); ground `deepwater-ground`; serious open-mouth fish `great-fish-serious-open-mouth`; smaller floating Jonah `jonah-floating-fullbody`. |
| `jonah-prays` | Backdrop `underwater-backdrop` (shared art); ground `deepwater-ground`; symbolic fish-belly cutaway with Jonah inside `great-fish-cutaway`; small fish `small-fish-school`. |
| `jonah-ashore` | Backdrop `beach-coast-backdrop`; shore `beach-shore-ground`; balanced fish-to-Jonah landing `fish-jonah-landing-balanced`. |
| `nineveh-warning` | Backdrop `nineveh-citygate-backdrop`; stone ground `joppa-quay-ground`; speaking Jonah `jonah-speaking`; listening adults `nineveh-listeners`; lively children `nineveh-children-lively`; goat and lamb `nineveh-flock-lively`. |
| `nineveh-turns` | Backdrop `nineveh-citygate-backdrop`; stone ground `joppa-quay-ground`; kneeling adults `nineveh-remorseful-prayers`; kneeling children `nineveh-children-remorseful`; settled goat and lamb `nineveh-flock-remorseful`. |
| `jonah-angry` | Backdrop `nineveh-outskirts-backdrop`; ground `dry-earth-ground`; waiting Jonah `jonah-waiting`. |
| `shade-for-jonah` | Backdrop `nineveh-outskirts-backdrop`; ground `dry-earth-ground`; `shade-plant`; relieved seated Jonah `jonah-happy-seated`. |
| `plant-withers` | Backdrop `nineveh-outskirts-backdrop`; ground `dry-earth-ground`; `withered-plant`; waiting Jonah `jonah-waiting`. |
| `jonah-mercy` | Backdrop `nineveh-outskirts-backdrop`; ground `dry-earth-ground`; seated Jonah `jonah-happy-seated`; `withered-plant`; outlined thought image `jonah-divine-question-sunlight-outline`. |

The stone quay plane is reused as a neutral stone floor for the two Nineveh gate scenes. Page 2's calm-voyage card includes Jonah aboard; the storm scene uses a separate combined ship-and-Jonah card on page 3, then page 4 switches to ship and sailors plus a frightened overboard Jonah. Page 6's fish cutaway already contains Jonah. Page 7's landing image is a single transparent action card, so it does not need a second fish or Jonah layer. The page 13 thought image depicts light over Nineveh without a human figure, divine character, or text.

## Audio sources

The book JSON and [human page index](../../../docs/books/jonah-and-the-whale.md) catalog narration text, voice, measured duration, and soundtrack page ranges. There are 117 existing localized narration WAVs (13 spreads across 9 locales: `en-US`, `en-GB`, `es`, `fr`, `hi`, `it`, `ja`, `pt-BR`, and `zh-CN`); these narration cues were unchanged during the art revisions. Reader files are under [`public/assets/books/jonah-and-the-whale/audio/<locale>/`](../../../public/assets/books/jonah-and-the-whale/audio/).

Four original looping ambience WAVs are in `public/assets/books/jonah-and-the-whale/audio/soundtracks/`. Their editable local source is [`audio/generate_soundtracks.py`](audio/generate_soundtracks.py).

| Soundtrack assignment | Page range | Runtime WAV |
| --- | --- | --- |
| Harbor surf | `jonah-called`–`jonah-boards-ship` | [harbor-calm-surf.wav](../../../public/assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav) |
| Storm wind and rain | `storm-at-sea`–`jonah-overboard` | [storm-wind-and-rain.wav](../../../public/assets/books/jonah-and-the-whale/audio/soundtracks/storm-wind-and-rain.wav) |
| Deep water prayer | `jonah-rescued`–`jonah-prays` | [deep-water-prayer.wav](../../../public/assets/books/jonah-and-the-whale/audio/soundtracks/deep-water-prayer.wav) |
| Warm Nineveh breeze | `nineveh-warning`–`jonah-mercy` | [warm-nineveh-breeze.wav](../../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav) |
| Quiet shore surf | `jonah-ashore` | Reuses [harbor-calm-surf.wav](../../../public/assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav). |

The five authored page-range assignments use those four loop files. The shared reader carries loops across adjacent pages and fades between active layers; per-range loop and fade values stay in the book JSON.

## Active book-owned art sources

Each source link has a same-stem prompt note and reader WebP unless marked as shared art in the page table. The WebP link points to the exact runtime file registered by the book.

| Asset ID | Active page(s) | Scene role | Source PNG | Prompt / revision note | Reader WebP |
| --- | --- | --- | --- | --- | --- |
| `joppa-harbor-backdrop` | `jonah-called`, `jonah-boards-ship` | Quiet harbor panorama. | [PNG](source-art/joppa-harbor-backdrop.png) | [Prompt](prompts/joppa-harbor-backdrop.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/joppa-harbor-backdrop.webp) |
| `joppa-quay-ground` | `jonah-called`, `nineveh-warning`, `nineveh-turns` | Empty stone quay plane, reused as neutral stone ground in Nineveh. | [PNG](source-art/joppa-quay-ground.png) | [Prompt](prompts/joppa-quay-ground.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp) |
| `calm-harbor-water-ground` | `jonah-boards-ship` | Calm harbor water plane. | [PNG](source-art/calm-harbor-water-ground.png) | [Prompt](prompts/calm-harbor-water-ground.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/calm-harbor-water-ground.webp) |
| `storm-sea` | `storm-at-sea`, `jonah-overboard` | Stormy sea backdrop. | [PNG](source-art/storm-at-sea.png) | [Prompt](prompts/storm-at-sea.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/storm-at-sea.webp) |
| `storm-water-ground` | `storm-at-sea`, `jonah-overboard` | Dark storm-water plane. | [PNG](source-art/storm-water-ground.png) | [Prompt](prompts/storm-water-ground.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/storm-water-ground.webp) |
| `storm-wave-layer` | `storm-at-sea`, `jonah-overboard` | Transparent wave crest repeated at several depths. | [PNG](source-art/storm-wave-layer.png) | [Prompt](prompts/storm-wave-layer.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp) |
| `ship-jonah-boarding` | `jonah-boards-ship` | Calm voyage ship, crew, and Jonah integrated aboard the deck in one cutout. | [PNG](source-art/ship-jonah-boarding.png) | [Prompt](prompts/ship-jonah-boarding.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/ship-jonah-boarding.webp) |
| `storm-deck-jonah` | `storm-at-sea` | Combined storm ship, distressed sailors, and Jonah on deck. | [PNG](source-art/storm-deck-jonah.png) | [Prompt](prompts/storm-deck-jonah.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/storm-deck-jonah.webp) |
| `storm-ship-sailors` | `jonah-overboard` | Storm ship and sailors with Jonah removed for the separate overboard pose. | [PNG](source-art/storm-ship-sailors.png) | [Prompt](prompts/storm-ship-sailors.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/storm-ship-sailors.webp) |
| `jonah-overboard` | `jonah-overboard` | Frightened, upper-body Jonah cutout; keep the lower crop behind the waves. | [PNG](source-art/jonah-overboard.png) | [Prompt](prompts/jonah-overboard.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/jonah-overboard.webp) |
| `deepwater-ground` | `jonah-rescued`, `jonah-prays` | Underwater ground plane. | [PNG](source-art/deepwater-ground.png) | [Prompt](prompts/deepwater-ground.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/deepwater-ground.webp) |
| `great-fish-serious-open-mouth` | `jonah-rescued` | Large, right-facing fish with a calm serious expression and no spout. | [PNG](source-art/great-fish-serious-open-mouth.png) | [Prompt](prompts/great-fish-serious-open-mouth.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/great-fish-serious-open-mouth.webp) |
| `jonah-floating-fullbody` | `jonah-rescued` | Full-body Jonah floating horizontally, facing the fish. | [PNG](source-art/jonah-floating-fullbody.png) | [Prompt](prompts/jonah-floating-fullbody.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/jonah-floating-fullbody.webp) |
| `great-fish-cutaway` | `jonah-prays` | Symbolic cutaway that shows Jonah safe inside the fish. | [PNG](source-art/great-fish-cutaway.png) | [Prompt](prompts/great-fish-cutaway.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/great-fish-cutaway.webp) |
| `small-fish-school` | `jonah-prays` | Small underwater fish. | [PNG](source-art/small-fish-school.png) | [Prompt](prompts/small-fish-school.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/small-fish-school.webp) |
| `beach-coast-backdrop` | `jonah-ashore` | Empty coastline backdrop. | [PNG](source-art/beach-coast-backdrop.png) | [Prompt](prompts/beach-coast-backdrop.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/beach-coast-backdrop.webp) |
| `beach-shore-ground` | `jonah-ashore` | Sandy shoreline plane. | [PNG](source-art/beach-shore-ground.png) | [Prompt](prompts/beach-shore-ground.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/beach-shore-ground.webp) |
| `fish-jonah-landing-balanced` | `jonah-ashore` | Large serious fish, water arc, and smaller wet Jonah landing as one action cutout. | [PNG](source-art/fish-jonah-landing-balanced.png) | [Prompt](prompts/fish-jonah-landing-balanced.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/fish-jonah-landing-balanced.webp) |
| `nineveh-citygate-backdrop` | `nineveh-warning`, `nineveh-turns` | Empty Nineveh gate backdrop. | [PNG](source-art/nineveh-citygate-backdrop.png) | [Prompt](prompts/nineveh-citygate-backdrop.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-citygate-backdrop.webp) |
| `jonah-speaking` | `nineveh-warning` | Full-body Jonah facing and speaking to the listeners. | [PNG](source-art/jonah-speaking.png) | [Prompt](prompts/jonah-speaking.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/jonah-speaking.webp) |
| `nineveh-listeners` | `nineveh-warning` | Four attentive residents facing Jonah. | [PNG](source-art/nineveh-listeners.png) | [Prompt](prompts/nineveh-listeners.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-listeners.webp) |
| `nineveh-remorseful-prayers` | `nineveh-turns` | Residents kneeling in remorse and prayer. | [PNG](source-art/nineveh-remorseful-prayers.png) | [Prompt](prompts/nineveh-remorseful-prayers.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-remorseful-prayers.webp) |
| `nineveh-children-lively` | `nineveh-warning` | Three children listen near the speaker and adult residents. | [PNG](source-art/nineveh-children-lively.png) | [Prompt](prompts/nineveh-children-lively.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-children-lively.webp) |
| `nineveh-flock-lively` | `nineveh-warning` | Goat and lamb listen as a separate small foreground layer. | [PNG](source-art/nineveh-flock-lively.png) | [Prompt](prompts/nineveh-flock-lively.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-flock-lively.webp) |
| `nineveh-children-remorseful` | `nineveh-turns` | Same children kneel with hands clasped. | [PNG](source-art/nineveh-children-remorseful.png) | [Prompt](prompts/nineveh-children-remorseful.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-children-remorseful.webp) |
| `nineveh-flock-remorseful` | `nineveh-turns` | Same goat and lamb settle with heads lowered. | [PNG](source-art/nineveh-flock-remorseful.png) | [Prompt](prompts/nineveh-flock-remorseful.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-flock-remorseful.webp) |
| `nineveh-outskirts-backdrop` | `jonah-angry`, `shade-for-jonah`, `plant-withers`, `jonah-mercy` | Quiet outskirts backdrop. | [PNG](source-art/nineveh-outskirts-backdrop.png) | [Prompt](prompts/nineveh-outskirts-backdrop.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp) |
| `dry-earth-ground` | `jonah-angry`, `shade-for-jonah`, `plant-withers`, `jonah-mercy` | Dry earth plane outside the city. | [PNG](source-art/dry-earth-ground.png) | [Prompt](prompts/dry-earth-ground.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/dry-earth-ground.webp) |
| `jonah-waiting` | `jonah-angry`, `plant-withers` | Seated, unhappy Jonah waiting outside Nineveh. | [PNG](source-art/jonah-waiting.png) | [Prompt](prompts/jonah-waiting.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/jonah-waiting.webp) |
| `shade-plant` | `shade-for-jonah` | Leafy plant providing shade. | [PNG](source-art/shade-plant.png) | [Prompt](prompts/shade-plant.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/shade-plant.webp) |
| `jonah-happy-seated` | `shade-for-jonah`, `jonah-mercy` | Same Jonah seated with a relieved expression. | [PNG](source-art/jonah-happy-seated.png) | [Prompt](prompts/jonah-happy-seated.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/jonah-happy-seated.webp) |
| `withered-plant` | `plant-withers`, `jonah-mercy` | Withered shade plant. | [PNG](source-art/withered-plant.png) | [Prompt](prompts/withered-plant.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/withered-plant.webp) |
| `jonah-divine-question-sunlight-outline` | `jonah-mercy` | Transparent thought image of light over Nineveh with a clear dark outline, no figure or words. | [PNG](source-art/jonah-divine-question-sunlight-outline.png) | [Prompt](prompts/jonah-divine-question-sunlight-outline.txt) | [WebP](../../../public/assets/books/jonah-and-the-whale/art/jonah-divine-question-sunlight-outline.webp) |

## Preserved studies and superseded art

These files remain for comparison and future reuse; they are not active page art.

| Source | Status |
| --- | --- |
| [great-fish-spout-study.png](source-art/great-fish-spout-study.png) | First open-mouth fish version, retained as a study because its back fountain is wrong underwater. It has no reader WebP. The source prompt and edit note are [here](prompts/great-fish-spout-study.txt). |
| [great-fish-open-mouth.png](source-art/great-fish-open-mouth.png) | Original no-spout fish pose, retained as a source study; the active p5 cutout now uses the serious expression variant. |
| [ship-and-sailors.png](source-art/ship-and-sailors.png) | Earlier ship-only calm-harbor cutout, superseded on p2 by the combined `ship-jonah-boarding` card. |
| [fish-jonah-landing.png](source-art/fish-jonah-landing.png) | Earlier action-composite study with Jonah too large beside the fish; the active p7 card uses the balanced variant. |
| [jonah-divine-question-sunlight.png](source-art/jonah-divine-question-sunlight.png) | Earlier thought-image version with a light outline; the active p13 variant uses a darker outline for readability. |
| [jonah-praying.png](source-art/jonah-praying.png) | Earlier separate prayer pose. The active prayer spread uses the fish-belly cutaway to avoid showing Jonah twice. |
| [joppa-harbor.png](source-art/joppa-harbor.png) | Earlier populated harbor illustration, superseded by a clean backdrop plus independent ground and character layers. |
| [nineveh-gate.png](source-art/nineveh-gate.png) | Earlier gate illustration, superseded by the empty city backdrop and separate people. |
| [nineveh-people.png](source-art/nineveh-people.png) | Earlier resident group, replaced in active pages by separately directed listening and kneeling poses. |
| [ocean-wave-crest.png](source-art/ocean-wave-crest.png) | Earlier wave art; storm pages now use the storm-specific wave layer. |

The book cover still references shared art under `public/assets/art/jonah/`. The page-stage cutouts and backgrounds are kept separate so the same character can be placed, animated, and layered without duplicating baked-in Jonah, ship, or scenery.
