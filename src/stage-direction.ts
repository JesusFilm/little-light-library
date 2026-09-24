import { edenStageDirections } from "./eden-stage-direction";
import { noahStageDirections } from "./noah-stage-direction";
import type { StageDirection } from "./stage-direction-types";

export type {
  ActorDirection,
  LegacyStageMotion,
  StageDirection,
  StageProp,
} from "./stage-direction-types";

/** Shared legacy lookup. Each book's unique staging remains in its own module. */
export const stageDirections: Record<string, StageDirection> = {
  ...edenStageDirections,
  ...noahStageDirections,
};
