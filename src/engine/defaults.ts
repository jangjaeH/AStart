import type { EngineTimingConfig } from "../domain/entities";

export const defaultTimingConfig: EngineTimingConfig = {
  secondsPerTick: 1,
  robotMoveSecondsPerEdge: 2,
  robotWaitSecondsPerTick: 1,
  defaultTaskServiceSeconds: 8,
  defaultEquipmentProcessSeconds: 20,
};
