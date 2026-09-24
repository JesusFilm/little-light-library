# Jonah and the Whale

Generated per-book review index. Edit the book JSON and media sources, then regenerate with `npm run book:index`. This file is a discovery aid and contains no parallel authored source.

## Book record

- Shelf entry: [public/books/catalog.json](../../public/books/catalog.json)
- Authoritative book text, stage notes, asset registry, audio, and motion: [public/books/jonah-and-the-whale.book.json](../../public/books/jonah-and-the-whale.book.json)
- Shared page renderer and character transitions: [src/authored-stage.ts](../../src/authored-stage.ts)
- Shared card motion presets: [src/book-animation.ts](../../src/book-animation.ts)
- Shared narration and soundtrack orchestration: [src/book-reader-audio.ts](../../src/book-reader-audio.ts), [src/book-audio.ts](../../src/book-audio.ts)
- Source passage: Jonah 1–4
- Retelling note: A gentle authored retelling of Jonah 1–4. The story text is not a Bible quotation; the scene choices and paper-theatre actions are invented staging. The ending leaves God's question to Jonah about compassion unanswered.
- Source locale: en-US
- Release locales: en-US, en-GB, es, fr, hi, it, ja, pt-BR, zh-CN
- Cover palette: cover `#315E78`, spine `#21445A`, accent `#D9A94E`.

## Reading order and page scene write-ups

### 01. Jonah hears a call (`jonah-called`)

**Source:** Jonah 1:1–3

**Staging note:** Jonah stands on a broad stone quay at Joppa, with the open harbor and distant limestone gate behind him. The bay is calm; no detached wave crosses the paving.

**Text (source locale):**

- `segment-1`: God sent Jonah to Nineveh to call its people away from harm. Jonah set out toward the sea instead.

**Backdrop:** [assets/books/jonah-and-the-whale/art/joppa-harbor-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-harbor-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp)

**Characters, props, and motion:**

- actor `jonah` (Jonah): [assets/art/jonah/jonah-cutout.png](../../public/assets/art/jonah/jonah-cutout.png); sway motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-called-segment-1-225beca98c9fc7ff8476.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-called-segment-1-225beca98c9fc7ff8476.wav) (6.35 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `harbor-calm-surf` loops from `jonah-called` to `jonah-boards-ship`, with 1.4s fade in and 1.4s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav).

### 02. Jonah boards a ship (`jonah-boards-ship`)

**Source:** Jonah 1:3

**Staging note:** The ship and Jonah aboard are one illustrated cutout on calm water in Joppa harbor, with the quay and distant limestone city behind it. Jonah stands on the deck beside the crew; no separate Jonah image or beach/paving sits beneath the vessel.

**Text (source locale):**

- `segment-1`: At Joppa, Jonah found a ship sailing away. He paid the fare and went aboard.

**Backdrop:** [assets/books/jonah-and-the-whale/art/joppa-harbor-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-harbor-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/calm-harbor-water-ground.webp](../../public/assets/books/jonah-and-the-whale/art/calm-harbor-water-ground.webp)

**Characters, props, and motion:**

- prop `ship` (Ship and sailors): [assets/books/jonah-and-the-whale/art/ship-jonah-boarding.webp](../../public/assets/books/jonah-and-the-whale/art/ship-jonah-boarding.webp); rock motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-boards-ship-segment-1-b494e2e3af9633691742.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-boards-ship-segment-1-b494e2e3af9633691742.wav) (4.97 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `harbor-calm-surf` loops from `jonah-called` to `jonah-boards-ship`, with 1.4s fade in and 1.4s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav).

### 03. A storm at sea (`storm-at-sea`)

**Source:** Jonah 1:4–5

**Staging note:** A distressed Jonah clings to a smaller, centered deck among three frightened sailors. Three storm crests cross the water at separate depths; a broad foreground crest masks the lower hull while side crests move at distinct rates and parallax.

**Text (source locale):**

- `segment-1`: A fierce storm tossed the ship. The sailors cried out and threw cargo into the sea.

**Backdrop:** [assets/books/jonah-and-the-whale/art/storm-at-sea.webp](../../public/assets/books/jonah-and-the-whale/art/storm-at-sea.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/storm-water-ground.webp](../../public/assets/books/jonah-and-the-whale/art/storm-water-ground.webp)

**Characters, props, and motion:**

- actor `ship` (Ship and sailors): [assets/books/jonah-and-the-whale/art/storm-deck-jonah.webp](../../public/assets/books/jonah-and-the-whale/art/storm-deck-jonah.webp); rock motion on open, loops.
- prop `storm-wave-rear` (Ocean wave): [assets/books/jonah-and-the-whale/art/storm-wave-layer.webp](../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp); float motion on open, loops.
- prop `storm-wave` (Ocean wave): [assets/books/jonah-and-the-whale/art/storm-wave-layer.webp](../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp); float motion on open, loops.
- prop `storm-wave-front` (Ocean wave): [assets/books/jonah-and-the-whale/art/storm-wave-layer.webp](../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp); float motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/storm-at-sea-segment-1-4f381c811ae9c37e7cb7.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/storm-at-sea-segment-1-4f381c811ae9c37e7cb7.wav) (5.17 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `storm-wind-and-rain` loops from `storm-at-sea` to `jonah-overboard`, with 1.4s fade in and 1.6s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/storm-wind-and-rain.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/storm-wind-and-rain.wav).

### 04. Jonah goes into the sea (`jonah-overboard`)

**Source:** Jonah 1:7–16

**Staging note:** The same storm water surrounds the boatless swimmer. Jonah floats on the right between the foreground crest and rear wave; the front crest reaches his chest while his frightened face and raised hands stay clear. The Jonah-free ship and its distressed crew sit farther back and left.

**Text (source locale):**

- `segment-1`: Jonah told them he was running from the Lord. At his request, they lifted him and threw him into the sea, and the water grew calm.

**Backdrop:** [assets/books/jonah-and-the-whale/art/storm-at-sea.webp](../../public/assets/books/jonah-and-the-whale/art/storm-at-sea.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/storm-water-ground.webp](../../public/assets/books/jonah-and-the-whale/art/storm-water-ground.webp)

**Characters, props, and motion:**

- actor `ship` (Ship and sailors): [assets/books/jonah-and-the-whale/art/storm-ship-sailors.webp](../../public/assets/books/jonah-and-the-whale/art/storm-ship-sailors.webp); rock motion on open, loops.
- actor `jonah` (Jonah): [assets/books/jonah-and-the-whale/art/jonah-overboard.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-overboard.webp); float motion on open, loops.
- prop `calming-wave` (Ocean wave): [assets/books/jonah-and-the-whale/art/storm-wave-layer.webp](../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp); float motion on open, loops.
- prop `overboard-wave-left` (Ocean wave): [assets/books/jonah-and-the-whale/art/storm-wave-layer.webp](../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp); float motion on open, loops.
- prop `overboard-wave-rear` (Ocean wave): [assets/books/jonah-and-the-whale/art/storm-wave-layer.webp](../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp); float motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-overboard-segment-1-2dc4e6178d593052bb06.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-overboard-segment-1-2dc4e6178d593052bb06.wav) (8.10 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `storm-wind-and-rain` loops from `storm-at-sea` to `jonah-overboard`, with 1.4s fade in and 1.6s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/storm-wind-and-rain.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/storm-wind-and-rain.wav).

### 05. A great fish rescues Jonah (`jonah-rescued`)

**Source:** Jonah 1:17

**Staging note:** In open deep water, a large serious-looking great fish approaches from the left with its open mouth facing Jonah. Jonah floats frightened near its mouth, still outside the fish; the next spread shows him safe within the fish.

**Text (source locale):**

- `segment-1`: God sent a great fish to swallow Jonah. Inside it, Jonah was safe in the deep.

**Backdrop:** [assets/art/jonah/underwater-backdrop.png](../../public/assets/art/jonah/underwater-backdrop.png)
**Ground print:** [assets/books/jonah-and-the-whale/art/deepwater-ground.webp](../../public/assets/books/jonah-and-the-whale/art/deepwater-ground.webp)

**Characters, props, and motion:**

- actor `great-fish` (Great fish): [assets/books/jonah-and-the-whale/art/great-fish-serious-open-mouth.webp](../../public/assets/books/jonah-and-the-whale/art/great-fish-serious-open-mouth.webp); float motion on open, loops.
- actor `jonah` (Jonah): [assets/books/jonah-and-the-whale/art/jonah-floating-fullbody.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-floating-fullbody.webp); float motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-rescued-segment-1-8a93037c407dba6b44b0.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-rescued-segment-1-8a93037c407dba6b44b0.wav) (5.33 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `deep-water-prayer` loops from `jonah-rescued` to `jonah-prays`, with 1.6s fade in and 1.4s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/deep-water-prayer.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/deep-water-prayer.wav).

### 06. Jonah prays in the deep (`jonah-prays`)

**Source:** Jonah 2:1–10

**Staging note:** Inside the fish, Jonah prays in a symbolic cutaway illustration. The small fish drift through open water outside the fish; all motion is gentle and contemplative.

**Text (source locale):**

- `segment-1`: From the fish, Jonah prayed and remembered God's help. After three days and nights, God spoke to the fish.

**Backdrop:** [assets/art/jonah/underwater-backdrop.png](../../public/assets/art/jonah/underwater-backdrop.png)
**Ground print:** [assets/books/jonah-and-the-whale/art/deepwater-ground.webp](../../public/assets/books/jonah-and-the-whale/art/deepwater-ground.webp)

**Characters, props, and motion:**

- actor `great-fish` (Great fish): [assets/books/jonah-and-the-whale/art/great-fish-cutaway.webp](../../public/assets/books/jonah-and-the-whale/art/great-fish-cutaway.webp); float motion on open, loops.
- prop `small-fish` (Little fish): [assets/books/jonah-and-the-whale/art/small-fish-school.webp](../../public/assets/books/jonah-and-the-whale/art/small-fish-school.webp); sway motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-prays-segment-1-926506debc00fcf644b9.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-prays-segment-1-926506debc00fcf644b9.wav) (6.70 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `deep-water-prayer` loops from `jonah-rescued` to `jonah-prays`, with 1.6s fade in and 1.4s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/deep-water-prayer.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/deep-water-prayer.wav).

### 07. Jonah reaches dry land (`jonah-ashore`)

**Source:** Jonah 2:10; 3:1–3

**Staging note:** A large, serious great fish sends wet Jonah toward dry land: one connected water arc carries the smaller Jonah onto his hands and knees at right. The transparent action card contains no beach or ground, and it is the only fish/Jonah artwork on the spread.

**Text (source locale):**

- `segment-1`: The fish brought Jonah to dry land. God called Jonah again, and this time Jonah went to Nineveh.

**Backdrop:** [assets/books/jonah-and-the-whale/art/beach-coast-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/beach-coast-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/beach-shore-ground.webp](../../public/assets/books/jonah-and-the-whale/art/beach-shore-ground.webp)

**Characters, props, and motion:**

- actor `great-fish` (Great fish lands Jonah): [assets/books/jonah-and-the-whale/art/fish-jonah-landing-balanced.webp](../../public/assets/books/jonah-and-the-whale/art/fish-jonah-landing-balanced.webp); static pose.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-ashore-segment-1-c5242829716eb551f12a.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-ashore-segment-1-c5242829716eb551f12a.wav) (6.22 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `shore-surf` loops from `jonah-ashore` to `jonah-ashore`, with 1.4s fade in and 1.4s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav).

### 08. Jonah speaks in Nineveh (`nineveh-warning`)

**Source:** Jonah 3:3–4

**Staging note:** Jonah stands to the left of four attentive adults at Nineveh gate. His full-height portrait keeps its native aspect and matches the adults’ visible head-to-sandal height. Three children and a goat with a lamb listen nearby as smaller independent cutouts; Jonah faces the people across a clear gap. Children and the goat/lamb sit in the near foreground as separate, gently animated layers; their faces remain visible beside the adults.

**Text (source locale):**

- `segment-1`: Jonah walked through the great city with God's warning. The people listened.

**Backdrop:** [assets/books/jonah-and-the-whale/art/nineveh-citygate-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-citygate-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp)

**Characters, props, and motion:**

- actor `jonah` (Jonah): [assets/books/jonah-and-the-whale/art/jonah-speaking.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-speaking.webp); sway motion on open, loops.
- actor `residents` (People of Nineveh): [assets/books/jonah-and-the-whale/art/nineveh-listeners.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-listeners.webp); sway motion on open, loops.
- actor `children` (Children of Nineveh): [assets/books/jonah-and-the-whale/art/nineveh-children-lively.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-children-lively.webp); sway motion on open, loops.
- prop `flock` (Goat and lamb): [assets/books/jonah-and-the-whale/art/nineveh-flock-lively.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-flock-lively.webp); sway motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/nineveh-warning-segment-1-2be626de96bde0f3a0af.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/nineveh-warning-segment-1-2be626de96bde0f3a0af.wav) (4.47 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `warm-nineveh-breeze` loops from `nineveh-warning` to `jonah-mercy`, with 1.6s fade in and 1.8s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav).

### 09. Nineveh asks for mercy (`nineveh-turns`)

**Source:** Jonah 3:5–10

**Staging note:** In the same city gate courtyard, adults and children respond with remorse: several adults kneel and pray, children kneel with hands clasped, and a goat and lamb settle beside them. Their knees and folded legs meet the stone floor; all cutouts preserve native proportions and remain below the standing adults’ visible height. Children and the goat/lamb sit in the near foreground as separate, gently animated layers; their faces remain visible beside the adults.

**Text (source locale):**

- `segment-1`: The people stopped their harmful ways and asked God for mercy. God saw their change and spared the city.

**Backdrop:** [assets/books/jonah-and-the-whale/art/nineveh-citygate-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-citygate-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp)

**Characters, props, and motion:**

- actor `residents` (People of Nineveh): [assets/books/jonah-and-the-whale/art/nineveh-remorseful-prayers.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-remorseful-prayers.webp); sway motion on open, loops.
- actor `children` (Children of Nineveh): [assets/books/jonah-and-the-whale/art/nineveh-children-remorseful.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-children-remorseful.webp); sway motion on open, loops.
- prop `flock` (Goat and lamb): [assets/books/jonah-and-the-whale/art/nineveh-flock-remorseful.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-flock-remorseful.webp); sway motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/nineveh-turns-segment-1-9f671e98b4df62edb954.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/nineveh-turns-segment-1-9f671e98b4df62edb954.wav) (6.60 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `warm-nineveh-breeze` loops from `nineveh-warning` to `jonah-mercy`, with 1.6s fade in and 1.8s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav).

### 10. Jonah waits outside (`jonah-angry`)

**Source:** Jonah 4:1–5

**Staging note:** Outside Nineveh, sad and seated Jonah rests on the dry ground beneath the open sky. The distant city wall stays to the left; the following pages return to this same quiet place.

**Text (source locale):**

- `segment-1`: Jonah was angry that God had spared Nineveh. He went outside the city and waited.

**Backdrop:** [assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/dry-earth-ground.webp](../../public/assets/books/jonah-and-the-whale/art/dry-earth-ground.webp)

**Characters, props, and motion:**

- actor `jonah` (Jonah): [assets/books/jonah-and-the-whale/art/jonah-waiting.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-waiting.webp); rock motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-angry-segment-1-4182bec23ace78dc0799.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-angry-segment-1-4182bec23ace78dc0799.wav) (5.20 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `warm-nineveh-breeze` loops from `nineveh-warning` to `jonah-mercy`, with 1.6s fade in and 1.8s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav).

### 11. A plant gives Jonah shade (`shade-for-jonah`)

**Source:** Jonah 4:6

**Staging note:** The living vine arches over a happy, seated Jonah; place his head and shoulders beneath the broad leaf canopy, with his sandals meeting the earth. The vine stays behind him and sways very gently.

**Text (source locale):**

- `segment-1`: God made a leafy plant grow over Jonah to shade him. Jonah was glad for the cool shelter.

**Backdrop:** [assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/dry-earth-ground.webp](../../public/assets/books/jonah-and-the-whale/art/dry-earth-ground.webp)

**Characters, props, and motion:**

- prop `shade-plant` (Leafy shade plant): [assets/books/jonah-and-the-whale/art/shade-plant.webp](../../public/assets/books/jonah-and-the-whale/art/shade-plant.webp); sway motion on open, loops.
- actor `jonah` (Jonah): [assets/books/jonah-and-the-whale/art/jonah-happy-seated.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-happy-seated.webp); sway motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/shade-for-jonah-segment-1-f47d50fd3decce0f9f45.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/shade-for-jonah-segment-1-f47d50fd3decce0f9f45.wav) (6.15 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `warm-nineveh-breeze` loops from `nineveh-warning` to `jonah-mercy`, with 1.6s fade in and 1.8s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav).

### 12. The shade is gone (`plant-withers`)

**Source:** Jonah 4:7–9

**Staging note:** Jonah sits uncovered beside the withered plant on the same dry ground. His unhappy, questioning pose contrasts with the dead leaves; keep the plant and Jonah gently still.

**Text (source locale):**

- `segment-1`: A worm damaged the plant, and a hot wind blew. Jonah felt sad and angry when its shade was gone.

**Backdrop:** [assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/dry-earth-ground.webp](../../public/assets/books/jonah-and-the-whale/art/dry-earth-ground.webp)

**Characters, props, and motion:**

- prop `withered-plant` (Withered plant): [assets/books/jonah-and-the-whale/art/withered-plant.webp](../../public/assets/books/jonah-and-the-whale/art/withered-plant.webp); sway motion on open, loops.
- actor `jonah` (Jonah): [assets/books/jonah-and-the-whale/art/jonah-waiting.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-waiting.webp); rock motion on open, loops.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/plant-withers-segment-1-77e62b1298c30d6e1e70.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/plant-withers-segment-1-77e62b1298c30d6e1e70.wav) (6.63 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `warm-nineveh-breeze` loops from `nineveh-warning` to `jonah-mercy`, with 1.6s fade in and 1.8s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav).

### 13. Who receives mercy? (`jonah-mercy`)

**Source:** Jonah 4:10–11

**Staging note:** The same seated Jonah is now happy beside the still-withered plant. A small vision of sunlit Nineveh floats above and to his right, with the thought dots pointing back toward him; keep the image open and spacious.

**Text (source locale):**

- `segment-1`: God reminded Jonah that Nineveh held many people and animals. Shouldn't God care for them? The story leaves us with that question.

**Backdrop:** [assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp)
**Ground print:** [assets/books/jonah-and-the-whale/art/dry-earth-ground.webp](../../public/assets/books/jonah-and-the-whale/art/dry-earth-ground.webp)

**Characters, props, and motion:**

- actor `jonah` (Jonah): [assets/books/jonah-and-the-whale/art/jonah-happy-seated.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-happy-seated.webp); sway motion on open, loops.
- prop `withered-plant` (Withered plant): [assets/books/jonah-and-the-whale/art/withered-plant.webp](../../public/assets/books/jonah-and-the-whale/art/withered-plant.webp); sway motion on open, loops.
- prop `city-thought` (A glimpse of Nineveh): [assets/books/jonah-and-the-whale/art/jonah-divine-question-sunlight-outline.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-divine-question-sunlight-outline.webp); static pose.

**Narration:**

- `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-mercy-segment-1-46fbbcf4a9288eb45c54.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-mercy-segment-1-46fbbcf4a9288eb45c54.wav) (8.22 s, Kokoro af_heart · 1×, current).

**Soundtracks spanning this page:**

- `warm-nineveh-breeze` loops from `nineveh-warning` to `jonah-mercy`, with 1.6s fade in and 1.8s fade out: [assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav).

## Localized text and voice files

Source-language text is shown in the page sections above. Every translation and its matching recorded text lives in the authoritative JSON. Audio links below resolve through that book's asset registry.

### en-US: Jonah and the Whale

Subtitle: A story of listening, mercy and a great deep breath

Book source: Jonah 1–4

Retelling note: A gentle authored retelling of Jonah 1–4. The story text is not a Bible quotation; the scene choices and paper-theatre actions are invented staging. The ending leaves God's question to Jonah about compassion unanswered.

**Jonah hears a call** (`jonah-called`)

Source: Jonah 1:1–3

- `segment-1`: God sent Jonah to Nineveh to call its people away from harm. Jonah set out toward the sea instead.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-called-segment-1-225beca98c9fc7ff8476.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-called-segment-1-225beca98c9fc7ff8476.wav) (6.35 s, Kokoro af_heart · 1×).

**Jonah boards a ship** (`jonah-boards-ship`)

Source: Jonah 1:3

- `segment-1`: At Joppa, Jonah found a ship sailing away. He paid the fare and went aboard.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-boards-ship-segment-1-b494e2e3af9633691742.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-boards-ship-segment-1-b494e2e3af9633691742.wav) (4.97 s, Kokoro af_heart · 1×).

**A storm at sea** (`storm-at-sea`)

Source: Jonah 1:4–5

- `segment-1`: A fierce storm tossed the ship. The sailors cried out and threw cargo into the sea.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/storm-at-sea-segment-1-4f381c811ae9c37e7cb7.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/storm-at-sea-segment-1-4f381c811ae9c37e7cb7.wav) (5.17 s, Kokoro af_heart · 1×).

**Jonah goes into the sea** (`jonah-overboard`)

Source: Jonah 1:7–16

- `segment-1`: Jonah told them he was running from the Lord. At his request, they lifted him and threw him into the sea, and the water grew calm.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-overboard-segment-1-2dc4e6178d593052bb06.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-overboard-segment-1-2dc4e6178d593052bb06.wav) (8.10 s, Kokoro af_heart · 1×).

**A great fish rescues Jonah** (`jonah-rescued`)

Source: Jonah 1:17

- `segment-1`: God sent a great fish to swallow Jonah. Inside it, Jonah was safe in the deep.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-rescued-segment-1-8a93037c407dba6b44b0.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-rescued-segment-1-8a93037c407dba6b44b0.wav) (5.33 s, Kokoro af_heart · 1×).

**Jonah prays in the deep** (`jonah-prays`)

Source: Jonah 2:1–10

- `segment-1`: From the fish, Jonah prayed and remembered God's help. After three days and nights, God spoke to the fish.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-prays-segment-1-926506debc00fcf644b9.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-prays-segment-1-926506debc00fcf644b9.wav) (6.70 s, Kokoro af_heart · 1×).

**Jonah reaches dry land** (`jonah-ashore`)

Source: Jonah 2:10; 3:1–3

- `segment-1`: The fish brought Jonah to dry land. God called Jonah again, and this time Jonah went to Nineveh.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-ashore-segment-1-c5242829716eb551f12a.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-ashore-segment-1-c5242829716eb551f12a.wav) (6.22 s, Kokoro af_heart · 1×).

**Jonah speaks in Nineveh** (`nineveh-warning`)

Source: Jonah 3:3–4

- `segment-1`: Jonah walked through the great city with God's warning. The people listened.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/nineveh-warning-segment-1-2be626de96bde0f3a0af.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/nineveh-warning-segment-1-2be626de96bde0f3a0af.wav) (4.47 s, Kokoro af_heart · 1×).

**Nineveh asks for mercy** (`nineveh-turns`)

Source: Jonah 3:5–10

- `segment-1`: The people stopped their harmful ways and asked God for mercy. God saw their change and spared the city.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/nineveh-turns-segment-1-9f671e98b4df62edb954.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/nineveh-turns-segment-1-9f671e98b4df62edb954.wav) (6.60 s, Kokoro af_heart · 1×).

**Jonah waits outside** (`jonah-angry`)

Source: Jonah 4:1–5

- `segment-1`: Jonah was angry that God had spared Nineveh. He went outside the city and waited.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-angry-segment-1-4182bec23ace78dc0799.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-angry-segment-1-4182bec23ace78dc0799.wav) (5.20 s, Kokoro af_heart · 1×).

**A plant gives Jonah shade** (`shade-for-jonah`)

Source: Jonah 4:6

- `segment-1`: God made a leafy plant grow over Jonah to shade him. Jonah was glad for the cool shelter.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/shade-for-jonah-segment-1-f47d50fd3decce0f9f45.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/shade-for-jonah-segment-1-f47d50fd3decce0f9f45.wav) (6.15 s, Kokoro af_heart · 1×).

**The shade is gone** (`plant-withers`)

Source: Jonah 4:7–9

- `segment-1`: A worm damaged the plant, and a hot wind blew. Jonah felt sad and angry when its shade was gone.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/plant-withers-segment-1-77e62b1298c30d6e1e70.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/plant-withers-segment-1-77e62b1298c30d6e1e70.wav) (6.63 s, Kokoro af_heart · 1×).

**Who receives mercy?** (`jonah-mercy`)

Source: Jonah 4:10–11

- `segment-1`: God reminded Jonah that Nineveh held many people and animals. Shouldn't God care for them? The story leaves us with that question.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-US/jonah-mercy-segment-1-46fbbcf4a9288eb45c54.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-mercy-segment-1-46fbbcf4a9288eb45c54.wav) (8.22 s, Kokoro af_heart · 1×).

### en-GB: Jonah and the Whale

Subtitle: A story of listening, mercy and a great deep breath

Book source: Jonah 1–4

Retelling note: A gentle retelling of Jonah 1–4. The story text is not a quotation from the Bible; the scenes and paper-theatre actions are invented for this story. The ending leaves God's question to Jonah about compassion unanswered.

**Jonah hears a call** (`jonah-called`)

Source: Jonah 1:1–3

- `segment-1`: God sent Jonah to Nineveh to call its people away from harm. Jonah set out towards the sea instead.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-called-segment-1-b9235eaa75f8a0fe8535.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-called-segment-1-b9235eaa75f8a0fe8535.wav) (6.55 s, Kokoro bf_emma · 1×).

**Jonah boards a ship** (`jonah-boards-ship`)

Source: Jonah 1:3

- `segment-1`: At Joppa, Jonah found a ship sailing away. He paid the fare and went aboard.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-boards-ship-segment-1-6a58d3d04fee2fb4b3fb.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-boards-ship-segment-1-6a58d3d04fee2fb4b3fb.wav) (5.08 s, Kokoro bf_emma · 1×).

**A storm at sea** (`storm-at-sea`)

Source: Jonah 1:4–5

- `segment-1`: A fierce storm tossed the ship. The sailors cried out and threw cargo into the sea.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/storm-at-sea-segment-1-24717e31ca3dc55dbd39.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/storm-at-sea-segment-1-24717e31ca3dc55dbd39.wav) (5.28 s, Kokoro bf_emma · 1×).

**Jonah goes into the sea** (`jonah-overboard`)

Source: Jonah 1:7–16

- `segment-1`: Jonah told them he was running from the Lord. At his request, they lifted him and threw him into the sea, and the water grew calm.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-overboard-segment-1-92083bb19a272609452a.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-overboard-segment-1-92083bb19a272609452a.wav) (7.60 s, Kokoro bf_emma · 1×).

**A great fish rescues Jonah** (`jonah-rescued`)

Source: Jonah 1:17

- `segment-1`: God sent a great fish to swallow Jonah. Inside it, Jonah was safe in the deep.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-rescued-segment-1-e9c88d8facdfa5a9269c.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-rescued-segment-1-e9c88d8facdfa5a9269c.wav) (5.30 s, Kokoro bf_emma · 1×).

**Jonah prays in the deep** (`jonah-prays`)

Source: Jonah 2:1–10

- `segment-1`: From the fish, Jonah prayed and remembered God's help. After three days and nights, God spoke to the fish.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-prays-segment-1-ba8cb5012e72982da3d5.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-prays-segment-1-ba8cb5012e72982da3d5.wav) (6.40 s, Kokoro bf_emma · 1×).

**Jonah reaches dry land** (`jonah-ashore`)

Source: Jonah 2:10; 3:1–3

- `segment-1`: The fish brought Jonah to dry land. God called Jonah again, and this time Jonah went to Nineveh.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-ashore-segment-1-7543f189a39dca57ac50.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-ashore-segment-1-7543f189a39dca57ac50.wav) (6.17 s, Kokoro bf_emma · 1×).

**Jonah speaks in Nineveh** (`nineveh-warning`)

Source: Jonah 3:3–4

- `segment-1`: Jonah walked through the great city with God's warning. The people listened.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/nineveh-warning-segment-1-71929c427ecd3695f096.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/nineveh-warning-segment-1-71929c427ecd3695f096.wav) (4.60 s, Kokoro bf_emma · 1×).

**Nineveh asks for mercy** (`nineveh-turns`)

Source: Jonah 3:5–10

- `segment-1`: The people stopped their harmful ways and asked God for mercy. God saw their change and spared the city.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/nineveh-turns-segment-1-22ed324242cb002e1bf0.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/nineveh-turns-segment-1-22ed324242cb002e1bf0.wav) (6.47 s, Kokoro bf_emma · 1×).

**Jonah waits outside** (`jonah-angry`)

Source: Jonah 4:1–5

- `segment-1`: Jonah was angry that God had spared Nineveh. He went outside the city and waited.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-angry-segment-1-709a75b0fe5fa31d943c.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-angry-segment-1-709a75b0fe5fa31d943c.wav) (5.38 s, Kokoro bf_emma · 1×).

**A plant gives Jonah shade** (`shade-for-jonah`)

Source: Jonah 4:6

- `segment-1`: God made a leafy plant grow over Jonah to shade him. Jonah was glad for the cool shelter.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/shade-for-jonah-segment-1-ea6dc2a7056568a10060.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/shade-for-jonah-segment-1-ea6dc2a7056568a10060.wav) (6.05 s, Kokoro bf_emma · 1×).

**The shade is gone** (`plant-withers`)

Source: Jonah 4:7–9

- `segment-1`: A worm damaged the plant, and a hot wind blew. Jonah felt sad and angry when its shade was gone.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/plant-withers-segment-1-b61f5ff266528fbcd1a4.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/plant-withers-segment-1-b61f5ff266528fbcd1a4.wav) (6.30 s, Kokoro bf_emma · 1×).

**Who receives mercy?** (`jonah-mercy`)

Source: Jonah 4:10–11

- `segment-1`: God reminded Jonah that Nineveh held many people and animals. Shouldn't God care for them? The story leaves us with that question.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/en-GB/jonah-mercy-segment-1-d75c81fe2b548eecee86.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-mercy-segment-1-d75c81fe2b548eecee86.wav) (8.00 s, Kokoro bf_emma · 1×).

### es: Jonás y la ballena

Subtitle: Una historia de escucha, misericordia y un gran respiro en las profundidades

Book source: Jonás 1–4

Retelling note: Una adaptación delicada de Jonás 1–4. El texto del relato no es una cita de la Biblia; las escenas y las acciones del teatro de papel son una puesta en escena inventada. El final deja sin respuesta la pregunta de Dios a Jonás sobre su compasión por Nínive.

**Jonás escucha un llamado** (`jonah-called`)

Source: Jonás 1:1–3

- `segment-1`: Dios envió a Jonás a Nínive para llamar a sus habitantes a dejar de hacer daño. Pero Jonás se dirigió al mar.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-called-segment-1-49fc9ec3f1f5e704ef9f.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-called-segment-1-49fc9ec3f1f5e704ef9f.wav) (6.42 s, Kokoro ef_dora · 1×).

**Jonás sube a bordo de un barco** (`jonah-boards-ship`)

Source: Jonás 1:3

- `segment-1`: En Jope, Jonás encontró un barco que se alejaba. Pagó el pasaje y subió a bordo.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-boards-ship-segment-1-9cdeb1e968d843319f14.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-boards-ship-segment-1-9cdeb1e968d843319f14.wav) (4.95 s, Kokoro ef_dora · 1×).

**Una tormenta en el mar** (`storm-at-sea`)

Source: Jonás 1:4–5

- `segment-1`: Una fuerte tormenta sacudió el barco. Los marineros gritaron y arrojaron la carga al mar.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/storm-at-sea-segment-1-8991c6bd614f1d6545e7.wav](../../public/assets/books/jonah-and-the-whale/audio/es/storm-at-sea-segment-1-8991c6bd614f1d6545e7.wav) (5.50 s, Kokoro ef_dora · 1×).

**Jonás es arrojado al mar** (`jonah-overboard`)

Source: Jonás 1:7–16

- `segment-1`: Jonás les dijo que huía del Señor. A petición suya, lo alzaron y lo arrojaron al mar; entonces el agua se calmó.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-overboard-segment-1-82abc9fd447647dcf6a1.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-overboard-segment-1-82abc9fd447647dcf6a1.wav) (6.97 s, Kokoro ef_dora · 1×).

**Un gran pez rescata a Jonás** (`jonah-rescued`)

Source: Jonás 1:17

- `segment-1`: Dios envió un gran pez que se tragó a Jonás. Dentro de él, Jonás estaba a salvo en las profundidades.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-rescued-segment-1-1daba6b488bfa52cb407.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-rescued-segment-1-1daba6b488bfa52cb407.wav) (6.08 s, Kokoro ef_dora · 1×).

**Jonás ora en las profundidades** (`jonah-prays`)

Source: Jonás 2:1–10

- `segment-1`: Desde el pez, Jonás oró y recordó la ayuda de Dios. Después de tres días y tres noches, Dios habló al pez.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-prays-segment-1-5db9fbabda0c63be71df.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-prays-segment-1-5db9fbabda0c63be71df.wav) (6.50 s, Kokoro ef_dora · 1×).

**Jonás llega a tierra firme** (`jonah-ashore`)

Source: Jonás 2:10; 3:1–3

- `segment-1`: El pez llevó a Jonás a tierra firme. Dios volvió a llamar a Jonás y esta vez Jonás fue a Nínive.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-ashore-segment-1-3781eae236667d222a34.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-ashore-segment-1-3781eae236667d222a34.wav) (5.67 s, Kokoro ef_dora · 1×).

**Jonás habla en Nínive** (`nineveh-warning`)

Source: Jonás 3:3–4

- `segment-1`: Jonás recorrió la gran ciudad con la advertencia de Dios. La gente escuchó.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/nineveh-warning-segment-1-5f91984baff9ac445cf1.wav](../../public/assets/books/jonah-and-the-whale/audio/es/nineveh-warning-segment-1-5f91984baff9ac445cf1.wav) (4.53 s, Kokoro ef_dora · 1×).

**Nínive pide misericordia** (`nineveh-turns`)

Source: Jonás 3:5–10

- `segment-1`: La gente dejó de hacer el mal y le pidió misericordia a Dios. Dios vio que habían cambiado y perdonó a la ciudad.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/nineveh-turns-segment-1-4f5ed146fa41824c8944.wav](../../public/assets/books/jonah-and-the-whale/audio/es/nineveh-turns-segment-1-4f5ed146fa41824c8944.wav) (6.70 s, Kokoro ef_dora · 1×).

**Jonás espera fuera de la ciudad** (`jonah-angry`)

Source: Jonás 4:1–5

- `segment-1`: Jonás se enojó porque Dios había perdonado a Nínive. Salió de la ciudad y esperó.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-angry-segment-1-bf6d08961e469b9269b1.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-angry-segment-1-bf6d08961e469b9269b1.wav) (5.03 s, Kokoro ef_dora · 1×).

**Una planta le da sombra a Jonás** (`shade-for-jonah`)

Source: Jonás 4:6

- `segment-1`: Dios hizo crecer sobre Jonás una planta frondosa para darle sombra. Jonás se alegró por ese refugio fresco.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/shade-for-jonah-segment-1-09535c0612ab52ebb314.wav](../../public/assets/books/jonah-and-the-whale/audio/es/shade-for-jonah-segment-1-09535c0612ab52ebb314.wav) (6.63 s, Kokoro ef_dora · 1×).

**Se acaba la sombra** (`plant-withers`)

Source: Jonás 4:7–9

- `segment-1`: Un gusano dañó la planta y después llegó un viento abrasador. Jonás se entristeció y se enojó cuando se quedó sin sombra.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/plant-withers-segment-1-295434632e107a49983c.wav](../../public/assets/books/jonah-and-the-whale/audio/es/plant-withers-segment-1-295434632e107a49983c.wav) (7.17 s, Kokoro ef_dora · 1×).

**¿Quién recibe misericordia?** (`jonah-mercy`)

Source: Jonás 4:10–11

- `segment-1`: Dios le recordó a Jonás que Nínive tenía muchas personas y animales. ¿Acaso Dios no debería preocuparse por ellos? El relato nos deja con esa pregunta.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/es/jonah-mercy-segment-1-3d05d9000e8a1dd10e3a.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-mercy-segment-1-3d05d9000e8a1dd10e3a.wav) (9.15 s, Kokoro ef_dora · 1×).

### fr: Jonas et la baleine

Subtitle: Une histoire d’écoute, de miséricorde et d’un grand souffle au fond des profondeurs

Book source: Jonas 1–4

Retelling note: Un récit doux inspiré de Jonas 1–4. Le texte de l’histoire n’est pas une citation de la Bible ; les scènes et les gestes du théâtre de papier sont inventés. La fin laisse sans réponse la question que Dieu pose à Jonas sur sa compassion pour Ninive.

**Jonas entend un appel** (`jonah-called`)

Source: Jonas 1:1–3

- `segment-1`: Dieu envoya Jonas à Ninive pour appeler ses habitants à renoncer au mal. Mais Jonas prit la direction de la mer.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-called-segment-1-e41e95a398b9c88d0a33.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-called-segment-1-e41e95a398b9c88d0a33.wav) (7.20 s, Kokoro ff_siwis · 1×).

**Jonas monte à bord d’un navire** (`jonah-boards-ship`)

Source: Jonas 1:3

- `segment-1`: À Joppé, Jonas trouva un navire qui partait. Il paya le prix du passage et monta à bord.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-boards-ship-segment-1-13e045412e9c7655085e.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-boards-ship-segment-1-13e045412e9c7655085e.wav) (5.67 s, Kokoro ff_siwis · 1×).

**Une tempête en mer** (`storm-at-sea`)

Source: Jonas 1:4–5

- `segment-1`: Une violente tempête secoua le navire. Les marins crièrent et jetèrent la cargaison à la mer.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/storm-at-sea-segment-1-638187fb350fa750a1dc.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/storm-at-sea-segment-1-638187fb350fa750a1dc.wav) (5.78 s, Kokoro ff_siwis · 1×).

**Jonas est jeté à la mer** (`jonah-overboard`)

Source: Jonas 1:7–16

- `segment-1`: Jonas leur dit qu’il fuyait le Seigneur. À sa demande, ils le soulevèrent et le jetèrent à la mer ; alors l’eau se calma.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-overboard-segment-1-d63d111874e8437d9f6f.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-overboard-segment-1-d63d111874e8437d9f6f.wav) (7.35 s, Kokoro ff_siwis · 1×).

**Un grand poisson sauve Jonas** (`jonah-rescued`)

Source: Jonas 1:17

- `segment-1`: Dieu envoya un grand poisson qui engloutit Jonas. À l’intérieur, Jonas était en sécurité dans les profondeurs.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-rescued-segment-1-36dd0eb21d26bc504b7e.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-rescued-segment-1-36dd0eb21d26bc504b7e.wav) (7.00 s, Kokoro ff_siwis · 1×).

**Jonas prie dans les profondeurs** (`jonah-prays`)

Source: Jonas 2:1–10

- `segment-1`: À l’intérieur du poisson, Jonas pria et se souvint de l’aide de Dieu. Au bout de trois jours et trois nuits, Dieu parla au poisson.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-prays-segment-1-8d6da95733adcddf3679.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-prays-segment-1-8d6da95733adcddf3679.wav) (7.53 s, Kokoro ff_siwis · 1×).

**Jonas atteint la terre ferme** (`jonah-ashore`)

Source: Jonas 2:10 ; 3:1–3

- `segment-1`: Le poisson conduisit Jonas jusqu’à la terre ferme. Dieu appela de nouveau Jonas, et cette fois Jonas partit pour Ninive.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-ashore-segment-1-c01c65c8f11a14cf0fc7.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-ashore-segment-1-c01c65c8f11a14cf0fc7.wav) (7.33 s, Kokoro ff_siwis · 1×).

**Jonas parle à Ninive** (`nineveh-warning`)

Source: Jonas 3:3–4

- `segment-1`: Jonas parcourut la grande ville avec l’avertissement de Dieu. Les habitants écoutèrent.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/nineveh-warning-segment-1-ce10ef327453484fec20.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/nineveh-warning-segment-1-ce10ef327453484fec20.wav) (5.33 s, Kokoro ff_siwis · 1×).

**Ninive demande miséricorde** (`nineveh-turns`)

Source: Jonas 3:5–10

- `segment-1`: Les habitants cessèrent de faire le mal et demandèrent la miséricorde de Dieu. Dieu vit qu’ils avaient changé et épargna la ville.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/nineveh-turns-segment-1-6c2c20d3bc15fe71de6f.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/nineveh-turns-segment-1-6c2c20d3bc15fe71de6f.wav) (7.55 s, Kokoro ff_siwis · 1×).

**Jonas attend hors de la ville** (`jonah-angry`)

Source: Jonas 4:1–5

- `segment-1`: Jonas était en colère parce que Dieu avait épargné Ninive. Il sortit de la ville et attendit.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-angry-segment-1-e402c2e2fbf5708dc167.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-angry-segment-1-e402c2e2fbf5708dc167.wav) (5.90 s, Kokoro ff_siwis · 1×).

**Une plante fait de l’ombre à Jonas** (`shade-for-jonah`)

Source: Jonas 4:6

- `segment-1`: Dieu fit pousser une plante feuillue au-dessus de Jonas pour le protéger du soleil. Jonas fut heureux de trouver cet abri frais.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/shade-for-jonah-segment-1-66cc813f7bbea738be41.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/shade-for-jonah-segment-1-66cc813f7bbea738be41.wav) (7.50 s, Kokoro ff_siwis · 1×).

**L’ombre a disparu** (`plant-withers`)

Source: Jonas 4:7–9

- `segment-1`: Un ver abîma la plante, et un vent brûlant se leva. Jonas fut triste et en colère lorsque l’ombre disparut.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/plant-withers-segment-1-0babf0271c3c7528b3f1.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/plant-withers-segment-1-0babf0271c3c7528b3f1.wav) (6.90 s, Kokoro ff_siwis · 1×).

**Qui reçoit la miséricorde ?** (`jonah-mercy`)

Source: Jonas 4:10–11

- `segment-1`: Dieu rappela à Jonas que Ninive comptait de nombreux habitants et animaux. Dieu ne devrait-il pas prendre soin d’eux ? L’histoire nous laisse avec cette question.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/fr/jonah-mercy-segment-1-6c792781ba7cfbfbbfa9.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-mercy-segment-1-6c792781ba7cfbfbbfa9.wav) (9.13 s, Kokoro ff_siwis · 1×).

### hi: योना और बड़ी मछली

Subtitle: सुनने, दया और गहरी साँस की कहानी

Book source: योना 1–4

Retelling note: योना 1–4 की एक कोमल, नए ढंग से कही गई कहानी। कहानी का पाठ बाइबल का शब्दशः उद्धरण नहीं है; दृश्यों और काग़ज़ी रंगमंच की गतिविधियों को कहानी के लिए बनाया गया है। अंत में करुणा के बारे में परमेश्वर का योना से पूछा गया प्रश्न अनुत्तरित रह जाता है।

**योना को बुलावा सुनाई देता है** (`jonah-called`)

Source: योना 1:1–3

- `segment-1`: परमेश्वर ने योना को नीनवे भेजा, ताकि वह वहाँ के लोगों से बुराई छोड़ने को कहे। लेकिन योना समुद्र की ओर चल पड़ा।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-called-segment-1-30acfdd496b899a3097e.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-called-segment-1-30acfdd496b899a3097e.wav) (9.68 s, Kokoro hf_alpha · 1×).

**योना जहाज़ पर चढ़ता है** (`jonah-boards-ship`)

Source: योना 1:3

- `segment-1`: याफा में योना को दूर जा रहा एक जहाज़ मिला। उसने किराया चुकाया और जहाज़ पर चढ़ गया।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-boards-ship-segment-1-8fb126963cf4b50f4f8f.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-boards-ship-segment-1-8fb126963cf4b50f4f8f.wav) (7.72 s, Kokoro hf_alpha · 1×).

**समुद्र में तूफ़ान** (`storm-at-sea`)

Source: योना 1:4–5

- `segment-1`: भयंकर तूफ़ान से जहाज़ डोलने लगा। नाविक पुकार उठे और उन्होंने सामान समुद्र में फेंक दिया।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/storm-at-sea-segment-1-220e9251b513fda9fdef.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/storm-at-sea-segment-1-220e9251b513fda9fdef.wav) (8.10 s, Kokoro hf_alpha · 1×).

**योना समुद्र में जाता है** (`jonah-overboard`)

Source: योना 1:7–16

- `segment-1`: योना ने उन्हें बताया कि वह प्रभु से भाग रहा था। उसके कहने पर नाविकों ने उसे उठाकर समुद्र में फेंक दिया, और पानी शांत हो गया।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-overboard-segment-1-70b029c39ae224602c07.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-overboard-segment-1-70b029c39ae224602c07.wav) (10.90 s, Kokoro hf_alpha · 1×).

**एक बड़ी मछली योना को बचाती है** (`jonah-rescued`)

Source: योना 1:17

- `segment-1`: परमेश्वर ने एक बड़ी मछली भेजी, जिसने योना को निगल लिया। मछली के भीतर वह समुद्र की गहराई में सुरक्षित था।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-rescued-segment-1-93b2b4fc603fe8718839.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-rescued-segment-1-93b2b4fc603fe8718839.wav) (9.28 s, Kokoro hf_alpha · 1×).

**योना गहराई में प्रार्थना करता है** (`jonah-prays`)

Source: योना 2:1–10

- `segment-1`: मछली के भीतर से योना ने प्रार्थना की और परमेश्वर की मदद को याद किया। तीन दिन और रातों के बाद परमेश्वर ने मछली से बात की।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-prays-segment-1-c683c54a0d2475ef1f6f.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-prays-segment-1-c683c54a0d2475ef1f6f.wav) (10.68 s, Kokoro hf_alpha · 1×).

**योना सूखी धरती पर पहुँचता है** (`jonah-ashore`)

Source: योना 2:10; 3:1–3

- `segment-1`: मछली योना को सूखी धरती पर ले आई। परमेश्वर ने योना को फिर बुलाया, और इस बार योना नीनवे गया।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-ashore-segment-1-23da8410d6ec71f4dc78.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-ashore-segment-1-23da8410d6ec71f4dc78.wav) (8.40 s, Kokoro hf_alpha · 1×).

**योना नीनवे में बोलता है** (`nineveh-warning`)

Source: योना 3:3–4

- `segment-1`: योना परमेश्वर की चेतावनी लेकर बड़े नगर में चला। लोगों ने उसकी बात सुनी।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/nineveh-warning-segment-1-848b99a5045827096711.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/nineveh-warning-segment-1-848b99a5045827096711.wav) (6.75 s, Kokoro hf_alpha · 1×).

**नीनवे के लोग दया माँगते हैं** (`nineveh-turns`)

Source: योना 3:5–10

- `segment-1`: लोगों ने अपने बुरे काम छोड़ दिए और परमेश्वर से दया माँगी। परमेश्वर ने उनका बदला हुआ मन देखा और नगर को नष्ट नहीं किया।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/nineveh-turns-segment-1-a4aa723cbfaf58e8afe1.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/nineveh-turns-segment-1-a4aa723cbfaf58e8afe1.wav) (10.28 s, Kokoro hf_alpha · 1×).

**योना नगर के बाहर इंतज़ार करता है** (`jonah-angry`)

Source: योना 4:1–5

- `segment-1`: नीनवे को बचाने पर योना क्रोधित हुआ। वह नगर से बाहर गया और इंतज़ार करने लगा।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-angry-segment-1-5380003f7e8c34b58fcf.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-angry-segment-1-5380003f7e8c34b58fcf.wav) (7.40 s, Kokoro hf_alpha · 1×).

**एक पौधा योना को छाया देता है** (`shade-for-jonah`)

Source: योना 4:6

- `segment-1`: परमेश्वर ने योना के ऊपर पत्तों वाला एक पौधा उगाया, ताकि उसे छाया मिले। ठंडी छाँव में योना खुश हुआ।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/shade-for-jonah-segment-1-0b71081078168e4847ee.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/shade-for-jonah-segment-1-0b71081078168e4847ee.wav) (8.85 s, Kokoro hf_alpha · 1×).

**छाया चली जाती है** (`plant-withers`)

Source: योना 4:7–9

- `segment-1`: एक कीड़े ने पौधे को नुकसान पहुँचाया और गरम हवा चली। छाया चली जाने पर योना उदास और क्रोधित हुआ।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/plant-withers-segment-1-7d91f6b027f362a493ed.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/plant-withers-segment-1-7d91f6b027f362a493ed.wav) (8.88 s, Kokoro hf_alpha · 1×).

**दया किसे मिलती है?** (`jonah-mercy`)

Source: योना 4:10–11

- `segment-1`: परमेश्वर ने योना को याद दिलाया कि नीनवे में बहुत से लोग और जानवर रहते थे। क्या परमेश्वर को उनकी परवाह नहीं करनी चाहिए? कहानी हमें इसी सवाल के साथ छोड़ देती है।

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/hi/jonah-mercy-segment-1-cc9fd4a1c0d96f8dda48.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-mercy-segment-1-cc9fd4a1c0d96f8dda48.wav) (13.50 s, Kokoro hf_alpha · 1×).

### it: Giona e la balena

Subtitle: Una storia di ascolto, misericordia e un bel respiro nel profondo del mare

Book source: Giona 1–4

Retelling note: Un racconto delicato ispirato a Giona 1–4. Il testo della storia non è una citazione della Bibbia; le scene e le azioni del teatro di carta sono inventate. Il finale lascia senza risposta la domanda che Dio rivolge a Giona sulla sua compassione per Ninive.

**Giona ascolta una chiamata** (`jonah-called`)

Source: Giona 1:1–3

- `segment-1`: Dio mandò Giona a Ninive per invitare i suoi abitanti ad abbandonare il male. Giona, invece, si diresse verso il mare.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-called-segment-1-1e631c65d7969c89eb85.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-called-segment-1-1e631c65d7969c89eb85.wav) (7.42 s, Kokoro if_sara · 1×).

**Giona sale su una nave** (`jonah-boards-ship`)

Source: Giona 1:3

- `segment-1`: A Giaffa, Giona trovò una nave in partenza. Pagò il viaggio e salì a bordo.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-boards-ship-segment-1-2202a212eb175070ee2a.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-boards-ship-segment-1-2202a212eb175070ee2a.wav) (4.88 s, Kokoro if_sara · 1×).

**Una tempesta in mare** (`storm-at-sea`)

Source: Giona 1:4–5

- `segment-1`: Una violenta tempesta sballottò la nave. I marinai gridarono e gettarono il carico in mare.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/storm-at-sea-segment-1-e17711d3bef659a5066e.wav](../../public/assets/books/jonah-and-the-whale/audio/it/storm-at-sea-segment-1-e17711d3bef659a5066e.wav) (6.03 s, Kokoro if_sara · 1×).

**Giona viene gettato in mare** (`jonah-overboard`)

Source: Giona 1:7–16

- `segment-1`: Giona disse loro che stava fuggendo dal Signore. Su sua richiesta, lo sollevarono e lo gettarono in mare, e l’acqua si calmò.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-overboard-segment-1-f4a979b5e3f6707bdcd4.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-overboard-segment-1-f4a979b5e3f6707bdcd4.wav) (7.65 s, Kokoro if_sara · 1×).

**Un grande pesce salva Giona** (`jonah-rescued`)

Source: Giona 1:17

- `segment-1`: Dio mandò un grande pesce che inghiottì Giona. Al suo interno, Giona era al sicuro nelle profondità.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-rescued-segment-1-caf8bb0f482272809f64.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-rescued-segment-1-caf8bb0f482272809f64.wav) (6.30 s, Kokoro if_sara · 1×).

**Giona prega nelle profondità** (`jonah-prays`)

Source: Giona 2:1–10

- `segment-1`: Dal pesce, Giona pregò e ricordò l’aiuto di Dio. Dopo tre giorni e tre notti, Dio parlò al pesce.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-prays-segment-1-ddda26a7ab30c02ce33e.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-prays-segment-1-ddda26a7ab30c02ce33e.wav) (6.17 s, Kokoro if_sara · 1×).

**Giona raggiunge la terraferma** (`jonah-ashore`)

Source: Giona 2:10; 3:1–3

- `segment-1`: Il pesce portò Giona sulla terraferma. Dio chiamò di nuovo Giona e questa volta Giona andò a Ninive.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-ashore-segment-1-137cfcf8b54b2fee12ba.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-ashore-segment-1-137cfcf8b54b2fee12ba.wav) (6.53 s, Kokoro if_sara · 1×).

**Giona parla a Ninive** (`nineveh-warning`)

Source: Giona 3:3–4

- `segment-1`: Giona attraversò la grande città con l’avvertimento di Dio. Gli abitanti ascoltarono.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/nineveh-warning-segment-1-36b0bd3affd91b24e43c.wav](../../public/assets/books/jonah-and-the-whale/audio/it/nineveh-warning-segment-1-36b0bd3affd91b24e43c.wav) (5.53 s, Kokoro if_sara · 1×).

**Ninive chiede misericordia** (`nineveh-turns`)

Source: Giona 3:5–10

- `segment-1`: Gli abitanti smisero di fare il male e chiesero misericordia a Dio. Dio vide che erano cambiati e risparmiò la città.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/nineveh-turns-segment-1-44d6b182461b81ceb9d3.wav](../../public/assets/books/jonah-and-the-whale/audio/it/nineveh-turns-segment-1-44d6b182461b81ceb9d3.wav) (7.55 s, Kokoro if_sara · 1×).

**Giona aspetta fuori dalla città** (`jonah-angry`)

Source: Giona 4:1–5

- `segment-1`: Giona era arrabbiato perché Dio aveva risparmiato Ninive. Uscì dalla città e aspettò.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-angry-segment-1-ebbe6a5b99358ff5c558.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-angry-segment-1-ebbe6a5b99358ff5c558.wav) (5.50 s, Kokoro if_sara · 1×).

**Una pianta fa ombra a Giona** (`shade-for-jonah`)

Source: Giona 4:6

- `segment-1`: Dio fece crescere sopra Giona una pianta frondosa che gli dava ombra. Giona fu felice di quel fresco riparo.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/shade-for-jonah-segment-1-089170b6f94b04f9dfc3.wav](../../public/assets/books/jonah-and-the-whale/audio/it/shade-for-jonah-segment-1-089170b6f94b04f9dfc3.wav) (7.10 s, Kokoro if_sara · 1×).

**L’ombra è scomparsa** (`plant-withers`)

Source: Giona 4:7–9

- `segment-1`: Un verme danneggiò la pianta e si alzò un vento caldo. Giona si rattristò e si arrabbiò quando rimase senza ombra.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/plant-withers-segment-1-85657cab9f94a0e3758b.wav](../../public/assets/books/jonah-and-the-whale/audio/it/plant-withers-segment-1-85657cab9f94a0e3758b.wav) (7.20 s, Kokoro if_sara · 1×).

**Chi riceve misericordia?** (`jonah-mercy`)

Source: Giona 4:10–11

- `segment-1`: Dio ricordò a Giona che a Ninive vivevano molte persone e animali. Dio non dovrebbe prendersi cura anche di loro? La storia ci lascia con questa domanda.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/it/jonah-mercy-segment-1-457203cfed6c1135b1b6.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-mercy-segment-1-457203cfed6c1135b1b6.wav) (9.38 s, Kokoro if_sara · 1×).

### ja: ヨナと大きな魚

Subtitle: 耳を傾けること、あわれみ、そして深く息をすることのお話

Book source: ヨナ書 1–4章

Retelling note: ヨナ書1～4章をもとに、やさしく語り直したお話です。本文は聖書からの直接の引用ではありません。場面や紙の人形劇の動きは、このお話のために作られたものです。結びには、あわれみについて神がヨナに問いかけた質問が、答えのないまま残ります。

**ヨナに呼びかけが届く** (`jonah-called`)

Source: ヨナ書 1:1–3

- `segment-1`: 神はヨナをニネベへ遣わし、人々に悪い道から離れるよう告げさせました。ところがヨナは、海へ向かって出発しました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-called-segment-1-15efeea74ec7137822a3.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-called-segment-1-15efeea74ec7137822a3.wav) (9.07 s, Kokoro jf_alpha · 1×).

**ヨナが船に乗る** (`jonah-boards-ship`)

Source: ヨナ書 1:3

- `segment-1`: ヨッパで、ヨナは遠くへ向かう船を見つけました。船賃を払い、船に乗り込みました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-boards-ship-segment-1-71bc8acdd22e5ce2119e.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-boards-ship-segment-1-71bc8acdd22e5ce2119e.wav) (6.58 s, Kokoro jf_alpha · 1×).

**海の嵐** (`storm-at-sea`)

Source: ヨナ書 1:4–5

- `segment-1`: 激しい嵐が船を揺さぶりました。船乗りたちは叫び、積み荷を海へ投げ捨てました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/storm-at-sea-segment-1-476784a62cd4937dd73a.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/storm-at-sea-segment-1-476784a62cd4937dd73a.wav) (6.92 s, Kokoro jf_alpha · 1×).

**ヨナが海へ落とされる** (`jonah-overboard`)

Source: ヨナ書 1:7–16

- `segment-1`: ヨナは、主から逃げているのだと船乗りたちに話しました。ヨナに頼まれ、彼らはヨナを持ち上げて海へ投げ入れました。すると海は静かになりました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-overboard-segment-1-4e4e9537f3518982eb64.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-overboard-segment-1-4e4e9537f3518982eb64.wav) (11.07 s, Kokoro jf_alpha · 1×).

**大きな魚がヨナを助ける** (`jonah-rescued`)

Source: ヨナ書 1:17

- `segment-1`: 神は大きな魚を送り、魚はヨナをのみ込みました。魚の中で、ヨナは深い海の中でも守られていました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-rescued-segment-1-e6401d2d3a43931a53e9.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-rescued-segment-1-e6401d2d3a43931a53e9.wav) (8.97 s, Kokoro jf_alpha · 1×).

**ヨナが深いところで祈る** (`jonah-prays`)

Source: ヨナ書 2:1–10

- `segment-1`: 魚の中からヨナは祈り、神の助けを思い出しました。三日三晩の後、神は魚に命じられました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-prays-segment-1-3017c53bdace1d2d084d.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-prays-segment-1-3017c53bdace1d2d084d.wav) (8.68 s, Kokoro jf_alpha · 1×).

**ヨナが陸に着く** (`jonah-ashore`)

Source: ヨナ書 2:10; 3:1–3

- `segment-1`: 魚はヨナを陸へ運びました。神はもう一度ヨナに呼びかけました。今度はヨナはニネベへ向かいました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-ashore-segment-1-dbc12781d67ff3744b44.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-ashore-segment-1-dbc12781d67ff3744b44.wav) (8.22 s, Kokoro jf_alpha · 1×).

**ヨナがニネベで語る** (`nineveh-warning`)

Source: ヨナ書 3:3–4

- `segment-1`: ヨナは神の警告を伝えながら、大きな町を歩きました。人々は耳を傾けました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/nineveh-warning-segment-1-73e4a6b74cc032798073.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/nineveh-warning-segment-1-73e4a6b74cc032798073.wav) (7.08 s, Kokoro jf_alpha · 1×).

**ニネベの人々があわれみを願う** (`nineveh-turns`)

Source: ヨナ書 3:5–10

- `segment-1`: 人々は悪い行いをやめ、神にあわれみを願いました。神は人々の変化をご覧になり、町を滅ぼしませんでした。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/nineveh-turns-segment-1-f3c719480f59556099da.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/nineveh-turns-segment-1-f3c719480f59556099da.wav) (9.57 s, Kokoro jf_alpha · 1×).

**ヨナが町の外で待つ** (`jonah-angry`)

Source: ヨナ書 4:1–5

- `segment-1`: 神がニネベを滅ぼさなかったので、ヨナは腹を立てました。町の外へ出て、そこで待ちました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-angry-segment-1-5d86aab18e035649431d.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-angry-segment-1-5d86aab18e035649431d.wav) (7.05 s, Kokoro jf_alpha · 1×).

**植物がヨナに木陰をつくる** (`shade-for-jonah`)

Source: ヨナ書 4:6

- `segment-1`: 神は葉の茂った植物をヨナの上に生やし、日陰をつくりました。涼しい場所ができて、ヨナは喜びました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/shade-for-jonah-segment-1-02464610c830990a3af3.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/shade-for-jonah-segment-1-02464610c830990a3af3.wav) (8.38 s, Kokoro jf_alpha · 1×).

**木陰がなくなる** (`plant-withers`)

Source: ヨナ書 4:7–9

- `segment-1`: 虫が植物を傷め、暑い風が吹きました。木陰がなくなると、ヨナは悲しみ、腹を立てました。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/plant-withers-segment-1-9affbf4206397956a7ac.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/plant-withers-segment-1-9affbf4206397956a7ac.wav) (7.17 s, Kokoro jf_alpha · 1×).

**だれがあわれみを受けるの？** (`jonah-mercy`)

Source: ヨナ書 4:10–11

- `segment-1`: 神はヨナに、ニネベにはたくさんの人と動物がいると思い出させました。神はみんなを大切にしてはいけないのでしょうか。お話は、この問いを残して終わります。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/ja/jonah-mercy-segment-1-c738aa431d81494c6413.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-mercy-segment-1-c738aa431d81494c6413.wav) (12.32 s, Kokoro jf_alpha · 1×).

### pt-BR: Jonas e a baleia

Subtitle: Uma história sobre ouvir, ter misericórdia e respirar fundo nas profundezas

Book source: Jonas 1–4

Retelling note: Uma releitura delicada de Jonas 1–4. O texto da história não é uma citação da Bíblia; as cenas e as ações do teatro de papel foram inventadas. O final deixa sem resposta a pergunta que Deus faz a Jonas sobre sua compaixão por Nínive.

**Jonas ouve um chamado** (`jonah-called`)

Source: Jonas 1:1–3

- `segment-1`: Deus enviou Jonas a Nínive para chamar seus habitantes a abandonar o mal. Mas Jonas seguiu em direção ao mar.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-called-segment-1-313e92ec469b09cfb62b.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-called-segment-1-313e92ec469b09cfb62b.wav) (6.45 s, Kokoro pf_dora · 1×).

**Jonas embarca em um navio** (`jonah-boards-ship`)

Source: Jonas 1:3

- `segment-1`: Em Jope, Jonas encontrou um navio que estava partindo. Pagou a passagem e embarcou.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-boards-ship-segment-1-d75a71ffca9c1aa95b54.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-boards-ship-segment-1-d75a71ffca9c1aa95b54.wav) (5.00 s, Kokoro pf_dora · 1×).

**Uma tempestade no mar** (`storm-at-sea`)

Source: Jonas 1:4–5

- `segment-1`: Uma forte tempestade sacudiu o navio. Os marinheiros gritaram e lançaram a carga ao mar.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/storm-at-sea-segment-1-61e3b44e07439a859a1a.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/storm-at-sea-segment-1-61e3b44e07439a859a1a.wav) (5.67 s, Kokoro pf_dora · 1×).

**Jonas é lançado ao mar** (`jonah-overboard`)

Source: Jonas 1:7–16

- `segment-1`: Jonas contou que estava fugindo do Senhor. A pedido dele, os marinheiros o ergueram e o lançaram ao mar; então a água se acalmou.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-overboard-segment-1-d0eb087bf87e87737d50.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-overboard-segment-1-d0eb087bf87e87737d50.wav) (7.55 s, Kokoro pf_dora · 1×).

**Um grande peixe resgata Jonas** (`jonah-rescued`)

Source: Jonas 1:17

- `segment-1`: Deus enviou um grande peixe que engoliu Jonas. Dentro dele, Jonas estava a salvo nas profundezas.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-rescued-segment-1-6291d4c962c52bc45c82.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-rescued-segment-1-6291d4c962c52bc45c82.wav) (5.97 s, Kokoro pf_dora · 1×).

**Jonas ora nas profundezas** (`jonah-prays`)

Source: Jonas 2:1–10

- `segment-1`: Do peixe, Jonas orou e se lembrou da ajuda de Deus. Depois de três dias e três noites, Deus falou ao peixe.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-prays-segment-1-39af10c685c9dfe57607.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-prays-segment-1-39af10c685c9dfe57607.wav) (6.65 s, Kokoro pf_dora · 1×).

**Jonas chega à terra firme** (`jonah-ashore`)

Source: Jonas 2:10; 3:1–3

- `segment-1`: O peixe levou Jonas para a terra firme. Deus chamou Jonas outra vez, e desta vez Jonas foi a Nínive.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-ashore-segment-1-511cd9000b7d0bc23d69.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-ashore-segment-1-511cd9000b7d0bc23d69.wav) (6.30 s, Kokoro pf_dora · 1×).

**Jonas fala em Nínive** (`nineveh-warning`)

Source: Jonas 3:3–4

- `segment-1`: Jonas atravessou a grande cidade com o aviso de Deus. O povo ouviu.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-warning-segment-1-57e919bd5ad4d14a4686.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-warning-segment-1-57e919bd5ad4d14a4686.wav) (4.17 s, Kokoro pf_dora · 1×).

**Nínive pede misericórdia** (`nineveh-turns`)

Source: Jonas 3:5–10

- `segment-1`: O povo abandonou seus maus caminhos e pediu misericórdia a Deus. Deus viu que eles haviam mudado e poupou a cidade.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-turns-segment-1-200bb52912f529688083.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-turns-segment-1-200bb52912f529688083.wav) (7.10 s, Kokoro pf_dora · 1×).

**Jonas espera fora da cidade** (`jonah-angry`)

Source: Jonas 4:1–5

- `segment-1`: Jonas ficou zangado porque Deus havia poupado Nínive. Ele saiu da cidade e esperou.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-angry-segment-1-5968d484839db7e097e2.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-angry-segment-1-5968d484839db7e097e2.wav) (5.38 s, Kokoro pf_dora · 1×).

**Uma planta dá sombra a Jonas** (`shade-for-jonah`)

Source: Jonas 4:6

- `segment-1`: Deus fez uma planta frondosa crescer sobre Jonas para lhe dar sombra. Jonas ficou feliz com aquele abrigo fresco.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/shade-for-jonah-segment-1-b92ddc185857d30f4f9c.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/shade-for-jonah-segment-1-b92ddc185857d30f4f9c.wav) (6.90 s, Kokoro pf_dora · 1×).

**A sombra desaparece** (`plant-withers`)

Source: Jonas 4:7–9

- `segment-1`: Um verme danificou a planta, e um vento quente soprou. Jonas ficou triste e zangado quando perdeu a sombra.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/plant-withers-segment-1-30deccb9172051f3fb9a.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/plant-withers-segment-1-30deccb9172051f3fb9a.wav) (6.47 s, Kokoro pf_dora · 1×).

**Quem recebe misericórdia?** (`jonah-mercy`)

Source: Jonas 4:10–11

- `segment-1`: Deus lembrou Jonas de que Nínive tinha muitas pessoas e animais. Deus não deveria cuidar deles? A história termina com essa pergunta.

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-mercy-segment-1-4f157e10b65851e5f93d.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-mercy-segment-1-4f157e10b65851e5f93d.wav) (7.88 s, Kokoro pf_dora · 1×).

### zh-CN: 约拿和大鱼

Subtitle: 关于聆听、怜悯与深深呼吸的故事

Book source: 约拿书 1–4章

Retelling note: 这是根据《约拿书》1至4章温和改编的故事。故事文字并非圣经原文引述；场景和纸偶剧中的动作是为讲故事创作的。结尾保留了上帝向约拿提出的、关于怜悯的问题，没有给出答案。

**约拿听见呼唤** (`jonah-called`)

Source: 约拿书 1:1–3

- `segment-1`: 上帝派约拿去尼尼微，叫那里的人离开恶行。约拿却转身朝大海走去。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-called-segment-1-0b7f44a7b436084e7906.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-called-segment-1-0b7f44a7b436084e7906.wav) (6.83 s, Kokoro zf_xiaoxiao · 1×).

**约拿上了船** (`jonah-boards-ship`)

Source: 约拿书 1:3

- `segment-1`: 在约帕，约拿找到一艘要驶向远方的船。他付了船费，就上了船。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-boards-ship-segment-1-2cb296dab73a4497d264.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-boards-ship-segment-1-2cb296dab73a4497d264.wav) (6.33 s, Kokoro zf_xiaoxiao · 1×).

**海上风暴** (`storm-at-sea`)

Source: 约拿书 1:4–5

- `segment-1`: 猛烈的风暴摇撼着船。水手们大声呼喊，把货物扔进海里。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/storm-at-sea-segment-1-41a2b81c1068d477bf09.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/storm-at-sea-segment-1-41a2b81c1068d477bf09.wav) (5.75 s, Kokoro zf_xiaoxiao · 1×).

**约拿落入海中** (`jonah-overboard`)

Source: 约拿书 1:7–16

- `segment-1`: 约拿告诉水手们，他正在逃避主。应约拿的请求，他们抬起他，把他扔进海里，海水就平静了。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-overboard-segment-1-a6bf95a4819eadacbc34.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-overboard-segment-1-a6bf95a4819eadacbc34.wav) (8.43 s, Kokoro zf_xiaoxiao · 1×).

**大鱼救了约拿** (`jonah-rescued`)

Source: 约拿书 1:17

- `segment-1`: 上帝派来一条大鱼，把约拿吞了下去。在鱼腹中，约拿在深海里安然无恙。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-rescued-segment-1-4a249d1a2089f3f764b4.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-rescued-segment-1-4a249d1a2089f3f764b4.wav) (7.08 s, Kokoro zf_xiaoxiao · 1×).

**约拿在深处祷告** (`jonah-prays`)

Source: 约拿书 2:1–10

- `segment-1`: 约拿在鱼腹中祷告，想起上帝怎样帮助他。过了三天三夜，上帝吩咐那条鱼。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-prays-segment-1-1e99183c2c72f2255bea.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-prays-segment-1-1e99183c2c72f2255bea.wav) (7.28 s, Kokoro zf_xiaoxiao · 1×).

**约拿回到陆地** (`jonah-ashore`)

Source: 约拿书 2:10; 3:1–3

- `segment-1`: 鱼把约拿带到陆地上。上帝再次呼唤约拿，这一次约拿去了尼尼微。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-ashore-segment-1-e002349e3ec2fc5830fe.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-ashore-segment-1-e002349e3ec2fc5830fe.wav) (6.53 s, Kokoro zf_xiaoxiao · 1×).

**约拿在尼尼微传话** (`nineveh-warning`)

Source: 约拿书 3:3–4

- `segment-1`: 约拿带着上帝的警告走过大城。人们听见了他的话。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-warning-segment-1-8b92f1613f1c47b7f813.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-warning-segment-1-8b92f1613f1c47b7f813.wav) (5.15 s, Kokoro zf_xiaoxiao · 1×).

**尼尼微人求怜悯** (`nineveh-turns`)

Source: 约拿书 3:5–10

- `segment-1`: 人们不再作恶，转而求上帝怜悯。上帝看见他们改变了，就没有毁灭那座城。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-turns-segment-1-ddad39a3d20f5ad636b6.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-turns-segment-1-ddad39a3d20f5ad636b6.wav) (6.97 s, Kokoro zf_xiaoxiao · 1×).

**约拿在城外等候** (`jonah-angry`)

Source: 约拿书 4:1–5

- `segment-1`: 上帝饶恕了尼尼微，约拿因此生气。他走到城外，等在那里。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-angry-segment-1-26ccf9b7c54eaca0b931.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-angry-segment-1-26ccf9b7c54eaca0b931.wav) (5.83 s, Kokoro zf_xiaoxiao · 1×).

**植物为约拿遮阴** (`shade-for-jonah`)

Source: 约拿书 4:6

- `segment-1`: 上帝使一株枝叶茂密的植物长在约拿头上，为他遮阴。凉爽的树荫让约拿很高兴。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/shade-for-jonah-segment-1-f0a217dfe50ab885f705.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/shade-for-jonah-segment-1-f0a217dfe50ab885f705.wav) (7.90 s, Kokoro zf_xiaoxiao · 1×).

**树荫消失了** (`plant-withers`)

Source: 约拿书 4:7–9

- `segment-1`: 虫子伤了植物，热风也吹了起来。树荫消失后，约拿既难过又生气。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/plant-withers-segment-1-c4095e4e50880d16950a.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/plant-withers-segment-1-c4095e4e50880d16950a.wav) (6.58 s, Kokoro zf_xiaoxiao · 1×).

**谁能得到怜悯？** (`jonah-mercy`)

Source: 约拿书 4:10–11

- `segment-1`: 上帝提醒约拿，尼尼微住着许多人和动物。上帝难道不该关心他们吗？故事把这个问题留给了我们。

- Voice file for `segment-1`: [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-mercy-segment-1-b66997e8f552ecb169e6.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-mercy-segment-1-b66997e8f552ecb169e6.wav) (8.75 s, Kokoro zf_xiaoxiao · 1×).

## Registered assets

Each runtime path is public-root-relative in the book JSON. This table includes reused images as well as page art and recorded audio.

| Asset ID | Kind | Runtime file | Attribution |
| --- | --- | --- | --- |
| `beach-coast-backdrop` | image | [assets/books/jonah-and-the-whale/art/beach-coast-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/beach-coast-backdrop.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/beach-coast-backdrop.txt. |
| `beach-shore-ground` | image | [assets/books/jonah-and-the-whale/art/beach-shore-ground.webp](../../public/assets/books/jonah-and-the-whale/art/beach-shore-ground.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/beach-shore-ground.txt. |
| `calm-harbor-water-ground` | image | [assets/books/jonah-and-the-whale/art/calm-harbor-water-ground.webp](../../public/assets/books/jonah-and-the-whale/art/calm-harbor-water-ground.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/calm-harbor-water-ground.txt. |
| `deep-water-prayer` | audio | [assets/books/jonah-and-the-whale/audio/soundtracks/deep-water-prayer.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/deep-water-prayer.wav) | Original deterministic algorithmic ambience composed for Little Light Library; no recordings, external services, or third-party audio samples. |
| `deepwater-ground` | image | [assets/books/jonah-and-the-whale/art/deepwater-ground.webp](../../public/assets/books/jonah-and-the-whale/art/deepwater-ground.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/deepwater-ground.txt. |
| `dry-earth-ground` | image | [assets/books/jonah-and-the-whale/art/dry-earth-ground.webp](../../public/assets/books/jonah-and-the-whale/art/dry-earth-ground.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/dry-earth-ground.txt. |
| `fish-jonah-landing` | image | [assets/books/jonah-and-the-whale/art/fish-jonah-landing.webp](../../public/assets/books/jonah-and-the-whale/art/fish-jonah-landing.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/fish-jonah-landing.txt. |
| `fish-jonah-landing-balanced` | image | [assets/books/jonah-and-the-whale/art/fish-jonah-landing-balanced.webp](../../public/assets/books/jonah-and-the-whale/art/fish-jonah-landing-balanced.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/fish-jonah-landing-balanced.txt. |
| `great-fish-cutaway` | image | [assets/books/jonah-and-the-whale/art/great-fish-cutaway.webp](../../public/assets/books/jonah-and-the-whale/art/great-fish-cutaway.webp) | Original illustration generated for this book; see the production brief at assets/books/jonah-and-the-whale/prompts/great-fish-cutaway.txt. |
| `great-fish-open-mouth` | image | [assets/books/jonah-and-the-whale/art/great-fish-open-mouth.webp](../../public/assets/books/jonah-and-the-whale/art/great-fish-open-mouth.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/great-fish-open-mouth.txt. |
| `great-fish-serious-open-mouth` | image | [assets/books/jonah-and-the-whale/art/great-fish-serious-open-mouth.webp](../../public/assets/books/jonah-and-the-whale/art/great-fish-serious-open-mouth.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/great-fish-serious-open-mouth.txt. |
| `harbor-calm-surf` | audio | [assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/harbor-calm-surf.wav) | Original deterministic algorithmic ambience composed for Little Light Library; no recordings, external services, or third-party audio samples. |
| `jonah-cutout` | image | [assets/art/jonah/jonah-cutout.png](../../public/assets/art/jonah/jonah-cutout.png) | Creator-supplied character cutout generated for Story Lab. |
| `jonah-divine-question-sunlight` | image | [assets/books/jonah-and-the-whale/art/jonah-divine-question-sunlight.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-divine-question-sunlight.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/jonah-divine-question-sunlight.txt. |
| `jonah-divine-question-sunlight-outline` | image | [assets/books/jonah-and-the-whale/art/jonah-divine-question-sunlight-outline.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-divine-question-sunlight-outline.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/jonah-divine-question-sunlight-outline.txt. |
| `jonah-floating-fullbody` | image | [assets/books/jonah-and-the-whale/art/jonah-floating-fullbody.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-floating-fullbody.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/jonah-floating-fullbody.txt. |
| `jonah-happy-seated` | image | [assets/books/jonah-and-the-whale/art/jonah-happy-seated.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-happy-seated.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/jonah-happy-seated.txt. |
| `jonah-overboard` | image | [assets/books/jonah-and-the-whale/art/jonah-overboard.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-overboard.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/jonah-overboard.txt. |
| `jonah-shore` | image | [assets/art/jonah/jonah-shore.png](../../public/assets/art/jonah/jonah-shore.png) | Creator-supplied image generated for Story Lab; retained as the cover scene. |
| `jonah-speaking` | image | [assets/books/jonah-and-the-whale/art/jonah-speaking.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-speaking.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/jonah-speaking.txt. |
| `jonah-waiting` | image | [assets/books/jonah-and-the-whale/art/jonah-waiting.webp](../../public/assets/books/jonah-and-the-whale/art/jonah-waiting.webp) | Original illustration generated for this book; see the production brief at assets/books/jonah-and-the-whale/prompts/jonah-waiting.txt. |
| `joppa-harbor` | image | [assets/books/jonah-and-the-whale/art/joppa-harbor.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-harbor.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/joppa-harbor.txt. |
| `joppa-harbor-backdrop` | image | [assets/books/jonah-and-the-whale/art/joppa-harbor-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-harbor-backdrop.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/joppa-harbor-backdrop.txt. |
| `joppa-quay-ground` | image | [assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp](../../public/assets/books/jonah-and-the-whale/art/joppa-quay-ground.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/joppa-quay-ground.txt. |
| `narration-02464610c830990a3af3` | audio | [assets/books/jonah-and-the-whale/audio/ja/shade-for-jonah-segment-1-02464610c830990a3af3.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/shade-for-jonah-segment-1-02464610c830990a3af3.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-089170b6f94b04f9dfc3` | audio | [assets/books/jonah-and-the-whale/audio/it/shade-for-jonah-segment-1-089170b6f94b04f9dfc3.wav](../../public/assets/books/jonah-and-the-whale/audio/it/shade-for-jonah-segment-1-089170b6f94b04f9dfc3.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-09535c0612ab52ebb314` | audio | [assets/books/jonah-and-the-whale/audio/es/shade-for-jonah-segment-1-09535c0612ab52ebb314.wav](../../public/assets/books/jonah-and-the-whale/audio/es/shade-for-jonah-segment-1-09535c0612ab52ebb314.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-0b71081078168e4847ee` | audio | [assets/books/jonah-and-the-whale/audio/hi/shade-for-jonah-segment-1-0b71081078168e4847ee.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/shade-for-jonah-segment-1-0b71081078168e4847ee.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-0b7f44a7b436084e7906` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-called-segment-1-0b7f44a7b436084e7906.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-called-segment-1-0b7f44a7b436084e7906.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-0babf0271c3c7528b3f1` | audio | [assets/books/jonah-and-the-whale/audio/fr/plant-withers-segment-1-0babf0271c3c7528b3f1.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/plant-withers-segment-1-0babf0271c3c7528b3f1.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-137cfcf8b54b2fee12ba` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-ashore-segment-1-137cfcf8b54b2fee12ba.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-ashore-segment-1-137cfcf8b54b2fee12ba.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-13e045412e9c7655085e` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-boards-ship-segment-1-13e045412e9c7655085e.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-boards-ship-segment-1-13e045412e9c7655085e.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-15efeea74ec7137822a3` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-called-segment-1-15efeea74ec7137822a3.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-called-segment-1-15efeea74ec7137822a3.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-1daba6b488bfa52cb407` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-rescued-segment-1-1daba6b488bfa52cb407.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-rescued-segment-1-1daba6b488bfa52cb407.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-1e631c65d7969c89eb85` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-called-segment-1-1e631c65d7969c89eb85.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-called-segment-1-1e631c65d7969c89eb85.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-1e99183c2c72f2255bea` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-prays-segment-1-1e99183c2c72f2255bea.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-prays-segment-1-1e99183c2c72f2255bea.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-200bb52912f529688083` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-turns-segment-1-200bb52912f529688083.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-turns-segment-1-200bb52912f529688083.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-2202a212eb175070ee2a` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-boards-ship-segment-1-2202a212eb175070ee2a.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-boards-ship-segment-1-2202a212eb175070ee2a.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-220e9251b513fda9fdef` | audio | [assets/books/jonah-and-the-whale/audio/hi/storm-at-sea-segment-1-220e9251b513fda9fdef.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/storm-at-sea-segment-1-220e9251b513fda9fdef.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-225beca98c9fc7ff8476` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-called-segment-1-225beca98c9fc7ff8476.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-called-segment-1-225beca98c9fc7ff8476.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-22ed324242cb002e1bf0` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/nineveh-turns-segment-1-22ed324242cb002e1bf0.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/nineveh-turns-segment-1-22ed324242cb002e1bf0.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-23da8410d6ec71f4dc78` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-ashore-segment-1-23da8410d6ec71f4dc78.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-ashore-segment-1-23da8410d6ec71f4dc78.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-24717e31ca3dc55dbd39` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/storm-at-sea-segment-1-24717e31ca3dc55dbd39.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/storm-at-sea-segment-1-24717e31ca3dc55dbd39.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-26ccf9b7c54eaca0b931` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-angry-segment-1-26ccf9b7c54eaca0b931.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-angry-segment-1-26ccf9b7c54eaca0b931.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-295434632e107a49983c` | audio | [assets/books/jonah-and-the-whale/audio/es/plant-withers-segment-1-295434632e107a49983c.wav](../../public/assets/books/jonah-and-the-whale/audio/es/plant-withers-segment-1-295434632e107a49983c.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-2be626de96bde0f3a0af` | audio | [assets/books/jonah-and-the-whale/audio/en-US/nineveh-warning-segment-1-2be626de96bde0f3a0af.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/nineveh-warning-segment-1-2be626de96bde0f3a0af.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-2cb296dab73a4497d264` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-boards-ship-segment-1-2cb296dab73a4497d264.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-boards-ship-segment-1-2cb296dab73a4497d264.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-2dc4e6178d593052bb06` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-overboard-segment-1-2dc4e6178d593052bb06.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-overboard-segment-1-2dc4e6178d593052bb06.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-3017c53bdace1d2d084d` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-prays-segment-1-3017c53bdace1d2d084d.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-prays-segment-1-3017c53bdace1d2d084d.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-30acfdd496b899a3097e` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-called-segment-1-30acfdd496b899a3097e.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-called-segment-1-30acfdd496b899a3097e.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-30deccb9172051f3fb9a` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/plant-withers-segment-1-30deccb9172051f3fb9a.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/plant-withers-segment-1-30deccb9172051f3fb9a.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-313e92ec469b09cfb62b` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-called-segment-1-313e92ec469b09cfb62b.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-called-segment-1-313e92ec469b09cfb62b.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-36b0bd3affd91b24e43c` | audio | [assets/books/jonah-and-the-whale/audio/it/nineveh-warning-segment-1-36b0bd3affd91b24e43c.wav](../../public/assets/books/jonah-and-the-whale/audio/it/nineveh-warning-segment-1-36b0bd3affd91b24e43c.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-36dd0eb21d26bc504b7e` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-rescued-segment-1-36dd0eb21d26bc504b7e.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-rescued-segment-1-36dd0eb21d26bc504b7e.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-3781eae236667d222a34` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-ashore-segment-1-3781eae236667d222a34.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-ashore-segment-1-3781eae236667d222a34.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-39af10c685c9dfe57607` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-prays-segment-1-39af10c685c9dfe57607.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-prays-segment-1-39af10c685c9dfe57607.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-3d05d9000e8a1dd10e3a` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-mercy-segment-1-3d05d9000e8a1dd10e3a.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-mercy-segment-1-3d05d9000e8a1dd10e3a.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-4182bec23ace78dc0799` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-angry-segment-1-4182bec23ace78dc0799.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-angry-segment-1-4182bec23ace78dc0799.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-41a2b81c1068d477bf09` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/storm-at-sea-segment-1-41a2b81c1068d477bf09.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/storm-at-sea-segment-1-41a2b81c1068d477bf09.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-44d6b182461b81ceb9d3` | audio | [assets/books/jonah-and-the-whale/audio/it/nineveh-turns-segment-1-44d6b182461b81ceb9d3.wav](../../public/assets/books/jonah-and-the-whale/audio/it/nineveh-turns-segment-1-44d6b182461b81ceb9d3.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-457203cfed6c1135b1b6` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-mercy-segment-1-457203cfed6c1135b1b6.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-mercy-segment-1-457203cfed6c1135b1b6.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-46fbbcf4a9288eb45c54` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-mercy-segment-1-46fbbcf4a9288eb45c54.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-mercy-segment-1-46fbbcf4a9288eb45c54.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-476784a62cd4937dd73a` | audio | [assets/books/jonah-and-the-whale/audio/ja/storm-at-sea-segment-1-476784a62cd4937dd73a.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/storm-at-sea-segment-1-476784a62cd4937dd73a.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-49fc9ec3f1f5e704ef9f` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-called-segment-1-49fc9ec3f1f5e704ef9f.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-called-segment-1-49fc9ec3f1f5e704ef9f.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-4a249d1a2089f3f764b4` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-rescued-segment-1-4a249d1a2089f3f764b4.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-rescued-segment-1-4a249d1a2089f3f764b4.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-4e4e9537f3518982eb64` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-overboard-segment-1-4e4e9537f3518982eb64.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-overboard-segment-1-4e4e9537f3518982eb64.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-4f157e10b65851e5f93d` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-mercy-segment-1-4f157e10b65851e5f93d.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-mercy-segment-1-4f157e10b65851e5f93d.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-4f381c811ae9c37e7cb7` | audio | [assets/books/jonah-and-the-whale/audio/en-US/storm-at-sea-segment-1-4f381c811ae9c37e7cb7.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/storm-at-sea-segment-1-4f381c811ae9c37e7cb7.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-4f5ed146fa41824c8944` | audio | [assets/books/jonah-and-the-whale/audio/es/nineveh-turns-segment-1-4f5ed146fa41824c8944.wav](../../public/assets/books/jonah-and-the-whale/audio/es/nineveh-turns-segment-1-4f5ed146fa41824c8944.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-511cd9000b7d0bc23d69` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-ashore-segment-1-511cd9000b7d0bc23d69.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-ashore-segment-1-511cd9000b7d0bc23d69.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-5380003f7e8c34b58fcf` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-angry-segment-1-5380003f7e8c34b58fcf.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-angry-segment-1-5380003f7e8c34b58fcf.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-57e919bd5ad4d14a4686` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-warning-segment-1-57e919bd5ad4d14a4686.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/nineveh-warning-segment-1-57e919bd5ad4d14a4686.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-5968d484839db7e097e2` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-angry-segment-1-5968d484839db7e097e2.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-angry-segment-1-5968d484839db7e097e2.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-5d86aab18e035649431d` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-angry-segment-1-5d86aab18e035649431d.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-angry-segment-1-5d86aab18e035649431d.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-5db9fbabda0c63be71df` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-prays-segment-1-5db9fbabda0c63be71df.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-prays-segment-1-5db9fbabda0c63be71df.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-5f91984baff9ac445cf1` | audio | [assets/books/jonah-and-the-whale/audio/es/nineveh-warning-segment-1-5f91984baff9ac445cf1.wav](../../public/assets/books/jonah-and-the-whale/audio/es/nineveh-warning-segment-1-5f91984baff9ac445cf1.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-61e3b44e07439a859a1a` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/storm-at-sea-segment-1-61e3b44e07439a859a1a.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/storm-at-sea-segment-1-61e3b44e07439a859a1a.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-6291d4c962c52bc45c82` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-rescued-segment-1-6291d4c962c52bc45c82.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-rescued-segment-1-6291d4c962c52bc45c82.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-638187fb350fa750a1dc` | audio | [assets/books/jonah-and-the-whale/audio/fr/storm-at-sea-segment-1-638187fb350fa750a1dc.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/storm-at-sea-segment-1-638187fb350fa750a1dc.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-66cc813f7bbea738be41` | audio | [assets/books/jonah-and-the-whale/audio/fr/shade-for-jonah-segment-1-66cc813f7bbea738be41.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/shade-for-jonah-segment-1-66cc813f7bbea738be41.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-6a58d3d04fee2fb4b3fb` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-boards-ship-segment-1-6a58d3d04fee2fb4b3fb.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-boards-ship-segment-1-6a58d3d04fee2fb4b3fb.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-6c2c20d3bc15fe71de6f` | audio | [assets/books/jonah-and-the-whale/audio/fr/nineveh-turns-segment-1-6c2c20d3bc15fe71de6f.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/nineveh-turns-segment-1-6c2c20d3bc15fe71de6f.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-6c792781ba7cfbfbbfa9` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-mercy-segment-1-6c792781ba7cfbfbbfa9.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-mercy-segment-1-6c792781ba7cfbfbbfa9.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-709a75b0fe5fa31d943c` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-angry-segment-1-709a75b0fe5fa31d943c.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-angry-segment-1-709a75b0fe5fa31d943c.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-70b029c39ae224602c07` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-overboard-segment-1-70b029c39ae224602c07.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-overboard-segment-1-70b029c39ae224602c07.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-71929c427ecd3695f096` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/nineveh-warning-segment-1-71929c427ecd3695f096.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/nineveh-warning-segment-1-71929c427ecd3695f096.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-71bc8acdd22e5ce2119e` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-boards-ship-segment-1-71bc8acdd22e5ce2119e.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-boards-ship-segment-1-71bc8acdd22e5ce2119e.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-73e4a6b74cc032798073` | audio | [assets/books/jonah-and-the-whale/audio/ja/nineveh-warning-segment-1-73e4a6b74cc032798073.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/nineveh-warning-segment-1-73e4a6b74cc032798073.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-7543f189a39dca57ac50` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-ashore-segment-1-7543f189a39dca57ac50.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-ashore-segment-1-7543f189a39dca57ac50.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-77e62b1298c30d6e1e70` | audio | [assets/books/jonah-and-the-whale/audio/en-US/plant-withers-segment-1-77e62b1298c30d6e1e70.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/plant-withers-segment-1-77e62b1298c30d6e1e70.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-7d91f6b027f362a493ed` | audio | [assets/books/jonah-and-the-whale/audio/hi/plant-withers-segment-1-7d91f6b027f362a493ed.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/plant-withers-segment-1-7d91f6b027f362a493ed.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-82abc9fd447647dcf6a1` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-overboard-segment-1-82abc9fd447647dcf6a1.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-overboard-segment-1-82abc9fd447647dcf6a1.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-848b99a5045827096711` | audio | [assets/books/jonah-and-the-whale/audio/hi/nineveh-warning-segment-1-848b99a5045827096711.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/nineveh-warning-segment-1-848b99a5045827096711.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-85657cab9f94a0e3758b` | audio | [assets/books/jonah-and-the-whale/audio/it/plant-withers-segment-1-85657cab9f94a0e3758b.wav](../../public/assets/books/jonah-and-the-whale/audio/it/plant-withers-segment-1-85657cab9f94a0e3758b.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-8991c6bd614f1d6545e7` | audio | [assets/books/jonah-and-the-whale/audio/es/storm-at-sea-segment-1-8991c6bd614f1d6545e7.wav](../../public/assets/books/jonah-and-the-whale/audio/es/storm-at-sea-segment-1-8991c6bd614f1d6545e7.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-8a93037c407dba6b44b0` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-rescued-segment-1-8a93037c407dba6b44b0.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-rescued-segment-1-8a93037c407dba6b44b0.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-8b92f1613f1c47b7f813` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-warning-segment-1-8b92f1613f1c47b7f813.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-warning-segment-1-8b92f1613f1c47b7f813.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-8d6da95733adcddf3679` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-prays-segment-1-8d6da95733adcddf3679.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-prays-segment-1-8d6da95733adcddf3679.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-8fb126963cf4b50f4f8f` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-boards-ship-segment-1-8fb126963cf4b50f4f8f.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-boards-ship-segment-1-8fb126963cf4b50f4f8f.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-92083bb19a272609452a` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-overboard-segment-1-92083bb19a272609452a.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-overboard-segment-1-92083bb19a272609452a.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-926506debc00fcf644b9` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-prays-segment-1-926506debc00fcf644b9.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-prays-segment-1-926506debc00fcf644b9.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-93b2b4fc603fe8718839` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-rescued-segment-1-93b2b4fc603fe8718839.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-rescued-segment-1-93b2b4fc603fe8718839.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-9affbf4206397956a7ac` | audio | [assets/books/jonah-and-the-whale/audio/ja/plant-withers-segment-1-9affbf4206397956a7ac.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/plant-withers-segment-1-9affbf4206397956a7ac.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-9cdeb1e968d843319f14` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-boards-ship-segment-1-9cdeb1e968d843319f14.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-boards-ship-segment-1-9cdeb1e968d843319f14.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-9f671e98b4df62edb954` | audio | [assets/books/jonah-and-the-whale/audio/en-US/nineveh-turns-segment-1-9f671e98b4df62edb954.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/nineveh-turns-segment-1-9f671e98b4df62edb954.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-a4aa723cbfaf58e8afe1` | audio | [assets/books/jonah-and-the-whale/audio/hi/nineveh-turns-segment-1-a4aa723cbfaf58e8afe1.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/nineveh-turns-segment-1-a4aa723cbfaf58e8afe1.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-a6bf95a4819eadacbc34` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-overboard-segment-1-a6bf95a4819eadacbc34.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-overboard-segment-1-a6bf95a4819eadacbc34.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-b494e2e3af9633691742` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-boards-ship-segment-1-b494e2e3af9633691742.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-boards-ship-segment-1-b494e2e3af9633691742.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-b61f5ff266528fbcd1a4` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/plant-withers-segment-1-b61f5ff266528fbcd1a4.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/plant-withers-segment-1-b61f5ff266528fbcd1a4.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-b66997e8f552ecb169e6` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-mercy-segment-1-b66997e8f552ecb169e6.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-mercy-segment-1-b66997e8f552ecb169e6.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-b9235eaa75f8a0fe8535` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-called-segment-1-b9235eaa75f8a0fe8535.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-called-segment-1-b9235eaa75f8a0fe8535.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-b92ddc185857d30f4f9c` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/shade-for-jonah-segment-1-b92ddc185857d30f4f9c.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/shade-for-jonah-segment-1-b92ddc185857d30f4f9c.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-ba8cb5012e72982da3d5` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-prays-segment-1-ba8cb5012e72982da3d5.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-prays-segment-1-ba8cb5012e72982da3d5.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-bf6d08961e469b9269b1` | audio | [assets/books/jonah-and-the-whale/audio/es/jonah-angry-segment-1-bf6d08961e469b9269b1.wav](../../public/assets/books/jonah-and-the-whale/audio/es/jonah-angry-segment-1-bf6d08961e469b9269b1.wav) | Generated locally with Kokoro ef_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-c01c65c8f11a14cf0fc7` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-ashore-segment-1-c01c65c8f11a14cf0fc7.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-ashore-segment-1-c01c65c8f11a14cf0fc7.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-c4095e4e50880d16950a` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/plant-withers-segment-1-c4095e4e50880d16950a.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/plant-withers-segment-1-c4095e4e50880d16950a.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-c5242829716eb551f12a` | audio | [assets/books/jonah-and-the-whale/audio/en-US/jonah-ashore-segment-1-c5242829716eb551f12a.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/jonah-ashore-segment-1-c5242829716eb551f12a.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-c683c54a0d2475ef1f6f` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-prays-segment-1-c683c54a0d2475ef1f6f.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-prays-segment-1-c683c54a0d2475ef1f6f.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-c738aa431d81494c6413` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-mercy-segment-1-c738aa431d81494c6413.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-mercy-segment-1-c738aa431d81494c6413.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-caf8bb0f482272809f64` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-rescued-segment-1-caf8bb0f482272809f64.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-rescued-segment-1-caf8bb0f482272809f64.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-cc9fd4a1c0d96f8dda48` | audio | [assets/books/jonah-and-the-whale/audio/hi/jonah-mercy-segment-1-cc9fd4a1c0d96f8dda48.wav](../../public/assets/books/jonah-and-the-whale/audio/hi/jonah-mercy-segment-1-cc9fd4a1c0d96f8dda48.wav) | Generated locally with Kokoro hf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-ce10ef327453484fec20` | audio | [assets/books/jonah-and-the-whale/audio/fr/nineveh-warning-segment-1-ce10ef327453484fec20.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/nineveh-warning-segment-1-ce10ef327453484fec20.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-d0eb087bf87e87737d50` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-overboard-segment-1-d0eb087bf87e87737d50.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-overboard-segment-1-d0eb087bf87e87737d50.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-d63d111874e8437d9f6f` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-overboard-segment-1-d63d111874e8437d9f6f.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-overboard-segment-1-d63d111874e8437d9f6f.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-d75a71ffca9c1aa95b54` | audio | [assets/books/jonah-and-the-whale/audio/pt-BR/jonah-boards-ship-segment-1-d75a71ffca9c1aa95b54.wav](../../public/assets/books/jonah-and-the-whale/audio/pt-BR/jonah-boards-ship-segment-1-d75a71ffca9c1aa95b54.wav) | Generated locally with Kokoro pf_dora · 1×; Kokoro-82M (Apache-2.0). |
| `narration-d75c81fe2b548eecee86` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-mercy-segment-1-d75c81fe2b548eecee86.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-mercy-segment-1-d75c81fe2b548eecee86.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-dbc12781d67ff3744b44` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-ashore-segment-1-dbc12781d67ff3744b44.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-ashore-segment-1-dbc12781d67ff3744b44.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-ddad39a3d20f5ad636b6` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-turns-segment-1-ddad39a3d20f5ad636b6.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/nineveh-turns-segment-1-ddad39a3d20f5ad636b6.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-ddda26a7ab30c02ce33e` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-prays-segment-1-ddda26a7ab30c02ce33e.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-prays-segment-1-ddda26a7ab30c02ce33e.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-e002349e3ec2fc5830fe` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/jonah-ashore-segment-1-e002349e3ec2fc5830fe.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/jonah-ashore-segment-1-e002349e3ec2fc5830fe.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-e17711d3bef659a5066e` | audio | [assets/books/jonah-and-the-whale/audio/it/storm-at-sea-segment-1-e17711d3bef659a5066e.wav](../../public/assets/books/jonah-and-the-whale/audio/it/storm-at-sea-segment-1-e17711d3bef659a5066e.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-e402c2e2fbf5708dc167` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-angry-segment-1-e402c2e2fbf5708dc167.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-angry-segment-1-e402c2e2fbf5708dc167.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-e41e95a398b9c88d0a33` | audio | [assets/books/jonah-and-the-whale/audio/fr/jonah-called-segment-1-e41e95a398b9c88d0a33.wav](../../public/assets/books/jonah-and-the-whale/audio/fr/jonah-called-segment-1-e41e95a398b9c88d0a33.wav) | Generated locally with Kokoro ff_siwis · 1×; Kokoro-82M (Apache-2.0). |
| `narration-e6401d2d3a43931a53e9` | audio | [assets/books/jonah-and-the-whale/audio/ja/jonah-rescued-segment-1-e6401d2d3a43931a53e9.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/jonah-rescued-segment-1-e6401d2d3a43931a53e9.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-e9c88d8facdfa5a9269c` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/jonah-rescued-segment-1-e9c88d8facdfa5a9269c.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/jonah-rescued-segment-1-e9c88d8facdfa5a9269c.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-ea6dc2a7056568a10060` | audio | [assets/books/jonah-and-the-whale/audio/en-GB/shade-for-jonah-segment-1-ea6dc2a7056568a10060.wav](../../public/assets/books/jonah-and-the-whale/audio/en-GB/shade-for-jonah-segment-1-ea6dc2a7056568a10060.wav) | Generated locally with Kokoro bf_emma · 1×; Kokoro-82M (Apache-2.0). |
| `narration-ebbe6a5b99358ff5c558` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-angry-segment-1-ebbe6a5b99358ff5c558.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-angry-segment-1-ebbe6a5b99358ff5c558.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `narration-f0a217dfe50ab885f705` | audio | [assets/books/jonah-and-the-whale/audio/zh-CN/shade-for-jonah-segment-1-f0a217dfe50ab885f705.wav](../../public/assets/books/jonah-and-the-whale/audio/zh-CN/shade-for-jonah-segment-1-f0a217dfe50ab885f705.wav) | Generated locally with Kokoro zf_xiaoxiao · 1×; Kokoro-82M (Apache-2.0). |
| `narration-f3c719480f59556099da` | audio | [assets/books/jonah-and-the-whale/audio/ja/nineveh-turns-segment-1-f3c719480f59556099da.wav](../../public/assets/books/jonah-and-the-whale/audio/ja/nineveh-turns-segment-1-f3c719480f59556099da.wav) | Generated locally with Kokoro jf_alpha · 1×; Kokoro-82M (Apache-2.0). |
| `narration-f47d50fd3decce0f9f45` | audio | [assets/books/jonah-and-the-whale/audio/en-US/shade-for-jonah-segment-1-f47d50fd3decce0f9f45.wav](../../public/assets/books/jonah-and-the-whale/audio/en-US/shade-for-jonah-segment-1-f47d50fd3decce0f9f45.wav) | Generated locally with Kokoro af_heart · 1×; Kokoro-82M (Apache-2.0). |
| `narration-f4a979b5e3f6707bdcd4` | audio | [assets/books/jonah-and-the-whale/audio/it/jonah-overboard-segment-1-f4a979b5e3f6707bdcd4.wav](../../public/assets/books/jonah-and-the-whale/audio/it/jonah-overboard-segment-1-f4a979b5e3f6707bdcd4.wav) | Generated locally with Kokoro if_sara · 1×; Kokoro-82M (Apache-2.0). |
| `nineveh-children-lively` | image | [assets/books/jonah-and-the-whale/art/nineveh-children-lively.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-children-lively.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-children-lively.txt. |
| `nineveh-children-remorseful` | image | [assets/books/jonah-and-the-whale/art/nineveh-children-remorseful.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-children-remorseful.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-children-remorseful.txt. |
| `nineveh-city` | image | [assets/books/jonah-and-the-whale/art/nineveh-gate.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-gate.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-gate.txt. |
| `nineveh-citygate-backdrop` | image | [assets/books/jonah-and-the-whale/art/nineveh-citygate-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-citygate-backdrop.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-citygate-backdrop.txt. |
| `nineveh-flock-lively` | image | [assets/books/jonah-and-the-whale/art/nineveh-flock-lively.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-flock-lively.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-flock-lively.txt. |
| `nineveh-flock-remorseful` | image | [assets/books/jonah-and-the-whale/art/nineveh-flock-remorseful.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-flock-remorseful.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-flock-remorseful.txt. |
| `nineveh-listeners` | image | [assets/books/jonah-and-the-whale/art/nineveh-listeners.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-listeners.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-listeners.txt. |
| `nineveh-outskirts-backdrop` | image | [assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-outskirts-backdrop.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-outskirts-backdrop.txt. |
| `nineveh-people` | image | [assets/books/jonah-and-the-whale/art/nineveh-people.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-people.webp) | Original illustration generated for this book; see the production brief at assets/books/jonah-and-the-whale/prompts/nineveh-people.txt. |
| `nineveh-remorseful-prayers` | image | [assets/books/jonah-and-the-whale/art/nineveh-remorseful-prayers.webp](../../public/assets/books/jonah-and-the-whale/art/nineveh-remorseful-prayers.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/nineveh-remorseful-prayers.txt. |
| `ocean-wave-crest` | image | [assets/books/jonah-and-the-whale/art/ocean-wave-crest.webp](../../public/assets/books/jonah-and-the-whale/art/ocean-wave-crest.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/ocean-wave-crest.txt. |
| `sandy-ground` | image | [assets/art/jonah/sandy-ground.png](../../public/assets/art/jonah/sandy-ground.png) | Creator-supplied image generated for Story Lab. |
| `shade-plant` | image | [assets/books/jonah-and-the-whale/art/shade-plant.webp](../../public/assets/books/jonah-and-the-whale/art/shade-plant.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/shade-plant.txt. |
| `ship-and-sailors` | image | [assets/books/jonah-and-the-whale/art/ship-and-sailors.webp](../../public/assets/books/jonah-and-the-whale/art/ship-and-sailors.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/ship-and-sailors.txt. |
| `ship-jonah-boarding` | image | [assets/books/jonah-and-the-whale/art/ship-jonah-boarding.webp](../../public/assets/books/jonah-and-the-whale/art/ship-jonah-boarding.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/ship-jonah-boarding.txt. |
| `small-fish-school` | image | [assets/books/jonah-and-the-whale/art/small-fish-school.webp](../../public/assets/books/jonah-and-the-whale/art/small-fish-school.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/small-fish-school.txt. |
| `storm-deck-jonah` | image | [assets/books/jonah-and-the-whale/art/storm-deck-jonah.webp](../../public/assets/books/jonah-and-the-whale/art/storm-deck-jonah.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/storm-deck-jonah.txt. |
| `storm-sea` | image | [assets/books/jonah-and-the-whale/art/storm-at-sea.webp](../../public/assets/books/jonah-and-the-whale/art/storm-at-sea.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/storm-at-sea.txt. |
| `storm-ship-sailors` | image | [assets/books/jonah-and-the-whale/art/storm-ship-sailors.webp](../../public/assets/books/jonah-and-the-whale/art/storm-ship-sailors.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/storm-ship-sailors.txt. |
| `storm-water-ground` | image | [assets/books/jonah-and-the-whale/art/storm-water-ground.webp](../../public/assets/books/jonah-and-the-whale/art/storm-water-ground.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/storm-water-ground.txt. |
| `storm-wave-layer` | image | [assets/books/jonah-and-the-whale/art/storm-wave-layer.webp](../../public/assets/books/jonah-and-the-whale/art/storm-wave-layer.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/storm-wave-layer.txt. |
| `storm-wind-and-rain` | audio | [assets/books/jonah-and-the-whale/audio/soundtracks/storm-wind-and-rain.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/storm-wind-and-rain.wav) | Original deterministic algorithmic ambience composed for Little Light Library; no recordings, external services, or third-party audio samples. |
| `underwater-backdrop` | image | [assets/art/jonah/underwater-backdrop.png](../../public/assets/art/jonah/underwater-backdrop.png) | Creator-supplied underwater scene generated for Story Lab. |
| `warm-nineveh-breeze` | audio | [assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav](../../public/assets/books/jonah-and-the-whale/audio/soundtracks/warm-nineveh-breeze.wav) | Original deterministic algorithmic ambience composed for Little Light Library; no recordings, external services, or third-party audio samples. |
| `whale-cutout` | image | [assets/art/jonah/whale-cutout.png](../../public/assets/art/jonah/whale-cutout.png) | Creator-supplied great-fish cutout generated for Story Lab. |
| `withered-plant` | image | [assets/books/jonah-and-the-whale/art/withered-plant.webp](../../public/assets/books/jonah-and-the-whale/art/withered-plant.webp) | Generated with OpenAI ImageGen for Story Lab; source prompt is in assets/books/jonah-and-the-whale/prompts/withered-plant.txt. |

## Original art, prompts, and source tools

Editable artwork, useful prompts, and generation/source tools are kept outside `public/`; the registered files above are their runtime derivatives.

- [assets/books/jonah-and-the-whale/README.md](../../assets/books/jonah-and-the-whale/README.md)
- [assets/books/jonah-and-the-whale/audio/generate_soundtracks.py](../../assets/books/jonah-and-the-whale/audio/generate_soundtracks.py)
- [assets/books/jonah-and-the-whale/prompts/beach-coast-backdrop.txt](../../assets/books/jonah-and-the-whale/prompts/beach-coast-backdrop.txt)
- [assets/books/jonah-and-the-whale/prompts/beach-shore-ground.txt](../../assets/books/jonah-and-the-whale/prompts/beach-shore-ground.txt)
- [assets/books/jonah-and-the-whale/prompts/calm-harbor-water-ground.txt](../../assets/books/jonah-and-the-whale/prompts/calm-harbor-water-ground.txt)
- [assets/books/jonah-and-the-whale/prompts/deepwater-ground.txt](../../assets/books/jonah-and-the-whale/prompts/deepwater-ground.txt)
- [assets/books/jonah-and-the-whale/prompts/dry-earth-ground.txt](../../assets/books/jonah-and-the-whale/prompts/dry-earth-ground.txt)
- [assets/books/jonah-and-the-whale/prompts/fish-jonah-landing-balanced.txt](../../assets/books/jonah-and-the-whale/prompts/fish-jonah-landing-balanced.txt)
- [assets/books/jonah-and-the-whale/prompts/fish-jonah-landing.txt](../../assets/books/jonah-and-the-whale/prompts/fish-jonah-landing.txt)
- [assets/books/jonah-and-the-whale/prompts/great-fish-cutaway.txt](../../assets/books/jonah-and-the-whale/prompts/great-fish-cutaway.txt)
- [assets/books/jonah-and-the-whale/prompts/great-fish-open-mouth-correction.txt](../../assets/books/jonah-and-the-whale/prompts/great-fish-open-mouth-correction.txt)
- [assets/books/jonah-and-the-whale/prompts/great-fish-open-mouth.txt](../../assets/books/jonah-and-the-whale/prompts/great-fish-open-mouth.txt)
- [assets/books/jonah-and-the-whale/prompts/great-fish-serious-open-mouth.txt](../../assets/books/jonah-and-the-whale/prompts/great-fish-serious-open-mouth.txt)
- [assets/books/jonah-and-the-whale/prompts/great-fish-spout-study.txt](../../assets/books/jonah-and-the-whale/prompts/great-fish-spout-study.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-divine-question-sunlight-outline.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-divine-question-sunlight-outline.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-divine-question-sunlight.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-divine-question-sunlight.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-floating-fullbody.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-floating-fullbody.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-happy-seated.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-happy-seated.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-overboard.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-overboard.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-praying.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-praying.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-speaking.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-speaking.txt)
- [assets/books/jonah-and-the-whale/prompts/jonah-waiting.txt](../../assets/books/jonah-and-the-whale/prompts/jonah-waiting.txt)
- [assets/books/jonah-and-the-whale/prompts/joppa-harbor-backdrop.txt](../../assets/books/jonah-and-the-whale/prompts/joppa-harbor-backdrop.txt)
- [assets/books/jonah-and-the-whale/prompts/joppa-harbor.txt](../../assets/books/jonah-and-the-whale/prompts/joppa-harbor.txt)
- [assets/books/jonah-and-the-whale/prompts/joppa-quay-ground.txt](../../assets/books/jonah-and-the-whale/prompts/joppa-quay-ground.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-children-lively.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-children-lively.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-children-remorseful.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-children-remorseful.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-citygate-backdrop.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-citygate-backdrop.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-flock-lively.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-flock-lively.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-flock-remorseful.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-flock-remorseful.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-gate.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-gate.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-listeners.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-listeners.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-outskirts-backdrop.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-outskirts-backdrop.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-people.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-people.txt)
- [assets/books/jonah-and-the-whale/prompts/nineveh-remorseful-prayers.txt](../../assets/books/jonah-and-the-whale/prompts/nineveh-remorseful-prayers.txt)
- [assets/books/jonah-and-the-whale/prompts/ocean-wave-crest.txt](../../assets/books/jonah-and-the-whale/prompts/ocean-wave-crest.txt)
- [assets/books/jonah-and-the-whale/prompts/shade-plant.txt](../../assets/books/jonah-and-the-whale/prompts/shade-plant.txt)
- [assets/books/jonah-and-the-whale/prompts/ship-and-sailors.txt](../../assets/books/jonah-and-the-whale/prompts/ship-and-sailors.txt)
- [assets/books/jonah-and-the-whale/prompts/ship-jonah-boarding.txt](../../assets/books/jonah-and-the-whale/prompts/ship-jonah-boarding.txt)
- [assets/books/jonah-and-the-whale/prompts/small-fish-school.txt](../../assets/books/jonah-and-the-whale/prompts/small-fish-school.txt)
- [assets/books/jonah-and-the-whale/prompts/storm-at-sea.txt](../../assets/books/jonah-and-the-whale/prompts/storm-at-sea.txt)
- [assets/books/jonah-and-the-whale/prompts/storm-deck-jonah.txt](../../assets/books/jonah-and-the-whale/prompts/storm-deck-jonah.txt)
- [assets/books/jonah-and-the-whale/prompts/storm-ship-sailors.txt](../../assets/books/jonah-and-the-whale/prompts/storm-ship-sailors.txt)
- [assets/books/jonah-and-the-whale/prompts/storm-water-ground.txt](../../assets/books/jonah-and-the-whale/prompts/storm-water-ground.txt)
- [assets/books/jonah-and-the-whale/prompts/storm-wave-layer.txt](../../assets/books/jonah-and-the-whale/prompts/storm-wave-layer.txt)
- [assets/books/jonah-and-the-whale/prompts/withered-plant.txt](../../assets/books/jonah-and-the-whale/prompts/withered-plant.txt)
- [assets/books/jonah-and-the-whale/source-art/beach-coast-backdrop.png](../../assets/books/jonah-and-the-whale/source-art/beach-coast-backdrop.png)
- [assets/books/jonah-and-the-whale/source-art/beach-shore-ground.png](../../assets/books/jonah-and-the-whale/source-art/beach-shore-ground.png)
- [assets/books/jonah-and-the-whale/source-art/calm-harbor-water-ground.png](../../assets/books/jonah-and-the-whale/source-art/calm-harbor-water-ground.png)
- [assets/books/jonah-and-the-whale/source-art/deepwater-ground.png](../../assets/books/jonah-and-the-whale/source-art/deepwater-ground.png)
- [assets/books/jonah-and-the-whale/source-art/dry-earth-ground.png](../../assets/books/jonah-and-the-whale/source-art/dry-earth-ground.png)
- [assets/books/jonah-and-the-whale/source-art/fish-jonah-landing-balanced.png](../../assets/books/jonah-and-the-whale/source-art/fish-jonah-landing-balanced.png)
- [assets/books/jonah-and-the-whale/source-art/fish-jonah-landing.png](../../assets/books/jonah-and-the-whale/source-art/fish-jonah-landing.png)
- [assets/books/jonah-and-the-whale/source-art/great-fish-cutaway.png](../../assets/books/jonah-and-the-whale/source-art/great-fish-cutaway.png)
- [assets/books/jonah-and-the-whale/source-art/great-fish-open-mouth.png](../../assets/books/jonah-and-the-whale/source-art/great-fish-open-mouth.png)
- [assets/books/jonah-and-the-whale/source-art/great-fish-serious-open-mouth.png](../../assets/books/jonah-and-the-whale/source-art/great-fish-serious-open-mouth.png)
- [assets/books/jonah-and-the-whale/source-art/great-fish-spout-study.png](../../assets/books/jonah-and-the-whale/source-art/great-fish-spout-study.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-divine-question-sunlight-outline.png](../../assets/books/jonah-and-the-whale/source-art/jonah-divine-question-sunlight-outline.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-divine-question-sunlight.png](../../assets/books/jonah-and-the-whale/source-art/jonah-divine-question-sunlight.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-floating-fullbody.png](../../assets/books/jonah-and-the-whale/source-art/jonah-floating-fullbody.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-happy-seated.png](../../assets/books/jonah-and-the-whale/source-art/jonah-happy-seated.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-overboard.png](../../assets/books/jonah-and-the-whale/source-art/jonah-overboard.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-praying.png](../../assets/books/jonah-and-the-whale/source-art/jonah-praying.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-speaking.png](../../assets/books/jonah-and-the-whale/source-art/jonah-speaking.png)
- [assets/books/jonah-and-the-whale/source-art/jonah-waiting.png](../../assets/books/jonah-and-the-whale/source-art/jonah-waiting.png)
- [assets/books/jonah-and-the-whale/source-art/joppa-harbor-backdrop.png](../../assets/books/jonah-and-the-whale/source-art/joppa-harbor-backdrop.png)
- [assets/books/jonah-and-the-whale/source-art/joppa-harbor.png](../../assets/books/jonah-and-the-whale/source-art/joppa-harbor.png)
- [assets/books/jonah-and-the-whale/source-art/joppa-quay-ground.png](../../assets/books/jonah-and-the-whale/source-art/joppa-quay-ground.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-children-lively.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-children-lively.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-children-remorseful.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-children-remorseful.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-citygate-backdrop.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-citygate-backdrop.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-flock-lively.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-flock-lively.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-flock-remorseful.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-flock-remorseful.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-gate.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-gate.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-listeners.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-listeners.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-outskirts-backdrop.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-outskirts-backdrop.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-people.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-people.png)
- [assets/books/jonah-and-the-whale/source-art/nineveh-remorseful-prayers.png](../../assets/books/jonah-and-the-whale/source-art/nineveh-remorseful-prayers.png)
- [assets/books/jonah-and-the-whale/source-art/ocean-wave-crest.png](../../assets/books/jonah-and-the-whale/source-art/ocean-wave-crest.png)
- [assets/books/jonah-and-the-whale/source-art/shade-plant.png](../../assets/books/jonah-and-the-whale/source-art/shade-plant.png)
- [assets/books/jonah-and-the-whale/source-art/ship-and-sailors.png](../../assets/books/jonah-and-the-whale/source-art/ship-and-sailors.png)
- [assets/books/jonah-and-the-whale/source-art/ship-jonah-boarding.png](../../assets/books/jonah-and-the-whale/source-art/ship-jonah-boarding.png)
- [assets/books/jonah-and-the-whale/source-art/small-fish-school.png](../../assets/books/jonah-and-the-whale/source-art/small-fish-school.png)
- [assets/books/jonah-and-the-whale/source-art/storm-at-sea.png](../../assets/books/jonah-and-the-whale/source-art/storm-at-sea.png)
- [assets/books/jonah-and-the-whale/source-art/storm-deck-jonah.png](../../assets/books/jonah-and-the-whale/source-art/storm-deck-jonah.png)
- [assets/books/jonah-and-the-whale/source-art/storm-ship-sailors.png](../../assets/books/jonah-and-the-whale/source-art/storm-ship-sailors.png)
- [assets/books/jonah-and-the-whale/source-art/storm-water-ground.png](../../assets/books/jonah-and-the-whale/source-art/storm-water-ground.png)
- [assets/books/jonah-and-the-whale/source-art/storm-wave-layer.png](../../assets/books/jonah-and-the-whale/source-art/storm-wave-layer.png)
- [assets/books/jonah-and-the-whale/source-art/withered-plant.png](../../assets/books/jonah-and-the-whale/source-art/withered-plant.png)
