import type { PaperActorKind, PaperActorMood } from "./paper-actor";

export type LegacyStageMotion =
  | {
      kind: "sway";
      /** Maximum rotation in degrees. */
      strength: number;
      periodSeconds?: number;
      phaseRadians?: number;
    }
  | {
      kind: "float";
      /** Maximum vertical travel in page units. */
      strength: number;
      periodSeconds?: number;
      phaseRadians?: number;
    };

interface ActorDirectionBase {
  kind: PaperActorKind;
  x: number;
  depth: number;
  mood: PaperActorMood;
  flipX?: boolean;
  motion?: LegacyStageMotion;
}

/** A selectable stage actor may use the shared pose atlas or a printed cutout. */
export type ActorDirection =
  | (ActorDirectionBase & {
      /** Fixed atlas pose for the legacy character rig. */
      pose: 0 | 1 | 2;
      image?: never;
      width?: never;
    })
  | (ActorDirectionBase & {
      /** Public-root-relative image path or theatre shorthand. */
      image: string;
      /** Visible width in page units; height follows the painted alpha bounds. */
      width: number;
      pose?: never;
    });

/** A transparent printed cutout. Width describes visible art after alpha trim. */
export interface StageProp {
  /** Theatre shorthand (for example `timber-bench`) or a public-root-relative path. */
  file: string;
  /** Visible painted width in page units; height follows the trimmed source ratio. */
  width: number;
  x: number;
  depth: number;
  /** Raise the visible bottom anchor above the page surface, in page units. */
  lift?: number;
  flipX?: boolean;
  scale?: number;
  /** Offset from the page-normal standee plane, in page units. */
  elevation?: number;
  motion?: LegacyStageMotion;
  creature?: "serpent" | "dove";
}

/** Retained, artwork-specific Eden/Noah scene instructions consumed by scene.ts. */
export interface StageDirection {
  /** Theatre shorthand or public-root-relative backdrop image path. */
  background: string;
  /** Explicit horizontal print that meets this page's backdrop. */
  ground: string;
  props?: StageProp[];
  actors: ActorDirection[];
  tree?: number;
  /** `true` preserves two legacy layers; arrays define explicit independent wave prints. */
  waves?: boolean | number | StageProp[];
  ark?: boolean | StageProp;
  family?: boolean | StageProp;
  interior?: boolean;
  dove?: boolean | StageProp;
  rainbow?: boolean;
  tint?: number;
}
