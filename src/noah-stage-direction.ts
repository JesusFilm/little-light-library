import type { ActorDirection, StageDirection } from "./stage-direction-types";

const worksiteGround =
  "assets/books/noah-and-the-great-flood/art/noah-worksite-earth-ground.webp";
const stormGround =
  "assets/books/noah-and-the-great-flood/art/noah-storm-water-ground.webp";
const cabinGround =
  "assets/books/noah-and-the-great-flood/art/noah-ark-interior-plank-floor.webp";
const shoreGround =
  "assets/books/noah-and-the-great-flood/art/noah-shore-stone-ground.webp";
const covenantBackdrop =
  "assets/books/noah-and-the-great-flood/art/noah-covenant-shore-backdrop.webp";
const familySober =
  "assets/books/noah-and-the-great-flood/art/noah-family-seven-sober.webp";

const noah = (
  pose: 0 | 1 | 2,
  x = -0.9,
  depth = -0.5,
  mood: ActorDirection["mood"] = "work",
): ActorDirection => ({ kind: "noah", pose, x, depth, mood });

const altar = "assets/books/noah-and-the-great-flood/art/noah-stone-altar.webp";
const stormWave =
  "assets/books/noah-and-the-great-flood/art/noah-storm-wave-crest.webp";

/** Authored blocking for the retained eight-page Noah paper-theatre story. */
export const noahStageDirections: Record<string, StageDirection> = {
  "noah-01": {
    background: "shipyard",
    ground: worksiteGround,
    actors: [noah(2, -0.3, -0.5, "listen")],
  },
  "noah-02": {
    background: "shipyard",
    ground: worksiteGround,
    actors: [noah(0, -0.35, 0.1, "work")],
    props: [{ file: "timber-bench", width: 2.25, x: -0.45, depth: -0.35 }],
  },
  "noah-03": {
    background: "boarding",
    ground: worksiteGround,
    actors: [noah(2, -1.65, -0.55, "welcome")],
    family: true,
    props: [
      {
        file: "animal-pairs",
        width: 2.45,
        x: 1.05,
        depth: -1.05,
        flipX: true,
      },
    ],
  },
  "noah-04": {
    background: "storm-open-water",
    ground: stormGround,
    actors: [],
    ark: {
      file: "ark.webp",
      width: 4.4,
      x: 0.15,
      depth: 0.35,
      lift: 0.5,
      motion: {
        kind: "float",
        strength: 0.07,
        periodSeconds: 5.3,
        phaseRadians: 0.4,
      },
    },
    tint: 0xc8d5d9,
    waves: [
      {
        file: stormWave,
        width: 4.9,
        x: -0.15,
        depth: 0.78,
        motion: {
          kind: "sway",
          strength: 1.2,
          periodSeconds: 5.2,
          phaseRadians: 0.25,
        },
      },
      {
        file: stormWave,
        width: 5.25,
        x: 0.05,
        depth: 0.12,
        motion: {
          kind: "sway",
          strength: 1.55,
          periodSeconds: 4.1,
          phaseRadians: 2.35,
        },
      },
      {
        file: stormWave,
        width: 4.65,
        x: 0.5,
        depth: -0.72,
        motion: {
          kind: "sway",
          strength: 1.35,
          periodSeconds: 4.7,
          phaseRadians: 4.4,
        },
      },
    ],
  },
  "noah-05": {
    background:
      "assets/books/noah-and-the-great-flood/art/noah-ark-interior-backdrop.webp",
    ground: cabinGround,
    actors: [noah(2, -1.05, -0.45, "listen")],
    dove: {
      file: "assets/art/theatre/dove-olive.webp",
      creature: "dove",
      width: 0.58,
      x: 0.9,
      depth: -0.3,
      lift: 1.65,
      flipX: true,
      motion: {
        kind: "float",
        strength: 0.045,
        periodSeconds: 3.8,
        phaseRadians: 0.5,
      },
    },
    tint: 0xd9e6e9,
  },
  "noah-06": {
    background: "shore",
    ground: shoreGround,
    actors: [noah(1, -1.75, -0.55, "sad")],
    family: {
      file: familySober,
      width: 3.4,
      x: 0.55,
      depth: -0.18,
    },
    props: [
      {
        file: "animal-pairs",
        width: 2.45,
        x: 1.05,
        depth: -1.05,
      },
    ],
  },
  "noah-07": {
    background: covenantBackdrop,
    ground: shoreGround,
    actors: [noah(2, -0.95, -0.55, "hope")],
    family: true,
    props: [{ file: altar, width: 1.2, x: 1.45, depth: -0.9 }],
  },
  "noah-08": {
    background: covenantBackdrop,
    ground: shoreGround,
    actors: [noah(2, -1.65, -0.55, "hope")],
    family: true,
  },
};
