# Little Light Library editorial record

This record covers the authored story and localization package in `public/content/`.
The scripts are original, age-appropriate retellings for shared reading by children
aged 4–8 and a parent or caregiver. They are paraphrases of Genesis, not quotations
from a modern Bible translation. No separately quoted source material is included.

## Source and adaptation

The Eden book follows Genesis 2:4–25 and 3:1–24. The eight spreads move from the
garden and Adam's need for a companion, through Eve's creation and God's command,
the serpent's temptation, the eating of the fruit, shame and blame, the stated
consequences, the clothing and expulsion, and life beyond Eden. The final spread
keeps the serpent's offspring statement as a forward-looking promise in the text;
it does not name a later fulfilment or add a denominational interpretation.

The Noah book follows Genesis 6:5–22, 7:1–24, 8:1–22 and 9:1–17. It preserves
the violence and corruption that prompt judgment, Noah's obedience, the scale of
the ark, the animals and family entering, the forty-day rain, the waters over the
mountains, the raven and dove, and the altar and covenant afterward. Spread
`noah-06` states plainly that people who remained outside the ark were swept away
and drowned. The wording is direct but non-graphic; the art brief must use distance
and restraint and must not turn death into spectacle. The rainbow is the covenant
sign, not a reward system.

Each page has exactly two independently narratable phrase segments, `s1` and `s2`.
The American English source is 35–50 words per page (minor punctuation and
contraction counting differences are harmless); translations preserve the same
events and moral weight rather than matching word counts. Page images are authored
runtime assets at `assets/art/{page.id}.webp`; the paths are intentionally language
neutral because artwork contains no story text.

The page titles and subtitles are authored editorial labels. The `passage` field is
a locator for adult reference, not a claim that the page reproduces the wording of
that passage. The short closing reflections on Eden 7–8 and Noah 8 make the story
legible for a family conversation while remaining clearly separate from a quoted
Bible text.

## Visual staging boundaries

The following are staging decisions for the illustrated pop-up pages, not claims
about details supplied by Genesis: a warm child's bedroom and shelf; the exact
camera angle and depth layers; facial expression, clothing palette and landscape
layout; the placement of the serpent, dove, olive leaf, altar and rainbow; and the
use of distant silhouettes and muted water on the flood spread. The ark should read
as a large shelter capable of holding a family and many animals. No art should show
blood, gore, lingering suffering, or a tiny cheerful toy boat. The source text's
serious events stay readable when decorative motion and audio are disabled.

## Localization record

All nine required locale manifests contain both books, all sixteen page IDs, two
segments per page, localized titles/subtitles/character names, and the complete
shared UI key set. Language names are written in the language's own script where
applicable. Names are localized consistently: Adán/Eva/Noé; Adam/Ève/Noé;
आदम/हव्वा/नूह; Adamo/Eva/Noè; アダム/エバ/ノア; Adão/Eva/Noé; and
亚当/夏娃/挪亚.

| Locale | Manifest | Kokoro voice | Translation note |
| --- | --- | --- | --- |
| American English (`en-US`) | `public/content/en-US.json` | `af_heart` | Authoritative source script for production audio. |
| British English (`en-GB`) | `public/content/en-GB.json` | `bf_emma` | British spelling in selected labels and narration. |
| Spanish (`es`) | `public/content/es.json` | `ef_dora` | Uses Génesis, Edén, Adán, Eva and Noé consistently. |
| French (`fr`) | `public/content/fr.json` | `ff_siwis` | Uses Genèse, Éden, Ève and Noé consistently. |
| Hindi (`hi`) | `public/content/hi.json` | `hf_alpha` | Uses the common Hindi forms आदम, हव्वा and नूह. |
| Italian (`it`) | `public/content/it.json` | `if_sara` | Uses Genesi, Eden, Adamo, Eva and Noè consistently. |
| Japanese (`ja`) | `public/content/ja.json` | `jf_alpha` | Uses 創世記, アダム, エバ and ノア; phrase segmentation follows Japanese punctuation. |
| Brazilian Portuguese (`pt-BR`) | `public/content/pt-BR.json` | `pf_dora` | Uses Gênesis, Éden, Adão, Eva and Noé consistently. |
| Mandarin Chinese (`zh-CN`) | `public/content/zh-CN.json` | `zf_xiaobei` | Uses 简体中文, 创世记 and the consistent names 亚当、夏娃、挪亚. |

The selected voices are supported Kokoro language/accent IDs documented by the
local Voice Lab. Generated audio must use the matching manifest text and voice;
the browser must never silently substitute English. Pronunciation checks should
pay special attention to proper names, `noah-06`, and the Japanese and Mandarin
segmentation. This repository records the selected IDs; listening evidence belongs
in the audio handoff because this package contains source text only.

## Review status and limitations

The content package was checked mechanically for JSON validity, locale coverage,
page and segment IDs, asset path shape, and the complete UI key set. An editorial
consistency pass checked that every locale retains the same sixteen beats, that
Noah's flood judgment and drowning outside the ark remain explicit, and that no
locale falls back to English. This is an agent review of authored files, not a
claim of independent human, theological, or native-speaker review.

Before publication, a human editor and fluent speakers for each shipped locale
should listen to the generated narration and review names, pacing, cultural
register, and any theological ambiguity. If a reviewer changes a script, regenerate
only the affected segment audio and rerun the manifest validator. Keep this file's
source/adaptation boundary intact when making such edits.
