import type { ActorDirection, StageDirection } from "./stage-direction-types";

const gardenGround = "assets/art/theatre/continuous-garden-ground.webp";
const exileGround = "assets/art/theatre/exile-earth-ground.webp";

/**
 * These authored portraits replace the old clothed pose atlas for Eden. Each
 * portrait remains an individually selectable named actor, but uses a static
 * non-deforming transparent print so its concealment and period clothing stay
 * correct throughout the scene.
 */
const adult = (
  kind: ActorDirection["kind"],
  file: string,
  width: number,
  x: number,
  depth: number,
  mood: ActorDirection["mood"],
  flipX = false,
): ActorDirection => ({
  kind,
  image: `assets/art/theatre/${file}.webp`,
  width,
  x,
  depth,
  mood,
  ...(flipX ? { flipX: true } : {}),
  motion: { kind: "sway", strength: 0.35, periodSeconds: 6.2 },
});

/**
 * Eden page blocking is authored separately from the Noah legacy directions.
 * Pages 1–3 use tall, opaque-bush portraits with no garments; pages 4–5
 * move to leaf garments; pages 6–8 use animal-hide garments. The p6 firelight
 * is a symbolic stage image for the guarded way, not a depiction of God.
 */
export const edenStageDirections: Record<string, StageDirection> = {
  "eden-01": {
    background: "garden",
    ground: gardenGround,
    actors: [
      adult(
        "adam",
        "eden-adam-behind-garden-bush",
        1.1551,
        -0.4,
        -0.5,
        "welcome",
      ),
    ],
    tree: -2.15,
  },
  "eden-02": {
    background: "garden",
    ground: gardenGround,
    actors: [
      adult(
        "adam",
        "eden-adam-behind-garden-bush",
        1.1551,
        -0.65,
        -0.5,
        "welcome",
      ),
      adult(
        "eve",
        "eden-eve-behind-garden-bush",
        1.2723,
        0.8,
        -0.25,
        "welcome",
        true,
      ),
    ],
    tree: -2.3,
  },
  "eden-03": {
    background: "garden",
    ground: gardenGround,
    actors: [
      adult(
        "adam",
        "eden-adam-fruit-receiving-behind-garden-bush",
        1.164,
        -0.7,
        -0.5,
        "warn",
      ),
      adult(
        "eve",
        "eden-eve-fruit-behind-garden-bush",
        1.014,
        0.7,
        -0.45,
        "warn",
        true,
      ),
    ],
    props: [
      {
        file: "serpent-branch",
        creature: "serpent",
        width: 1.25,
        x: 1.75,
        depth: 0.1,
      },
    ],
    tint: 0xffecc9,
  },
  "eden-04": {
    background: "garden",
    ground: gardenGround,
    actors: [
      adult("adam", "eden-adam-leaf-shame", 0.6188, -0.65, -0.45, "sad"),
      adult("eve", "eden-eve-leaf-shame", 0.4809, 0.65, -0.5, "sad"),
    ],
    tree: 2.2,
    tint: 0xe4d2b4,
  },
  "eden-05": {
    background: "garden",
    ground: gardenGround,
    actors: [
      adult("adam", "eden-adam-leaf-consequences", 0.6893, -0.7, -0.65, "sad"),
      adult("eve", "eden-eve-leaf-consequences", 0.5077, 0.6, -0.4, "sad"),
    ],
    tree: -2.1,
    tint: 0xb5bdad,
  },
  "eden-06": {
    background: "assets/art/theatre/eden-guarded-way-backcloth.webp",
    ground: exileGround,
    actors: [
      adult("adam", "eden-adam-hide-walking", 0.8404, -0.85, -0.4, "sad", true),
      adult("eve", "eden-eve-hide-walking", 0.7082, 0.8, -0.25, "sad"),
    ],
    tint: 0xe0d1b8,
  },
  "eden-07": {
    background: "exile",
    ground: exileGround,
    actors: [
      adult("adam", "eden-adam-hide-work", 1.1392, -0.75, -0.75, "work"),
      adult("eve", "eden-eve-hide-work", 0.9342, 0.75, -0.45, "work"),
    ],
  },
  "eden-08": {
    background: "exile",
    ground: exileGround,
    actors: [
      adult("adam", "eden-adam-hide-hope", 0.8109, -0.75, -0.4, "hope"),
      adult("eve", "eden-eve-hide-hope", 0.8778, 0.65, -0.25, "hope", true),
    ],
  },
};
