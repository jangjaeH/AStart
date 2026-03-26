export const plannerConfig = {
  baseMoveCost: 1,
  turnPenalty: 0.3,
  waitCost: 0.7,
  congestionPenalty: 1.5,
  equipmentPenalty: 5,
  reservationConflictPenalty: Number.POSITIVE_INFINITY,
  maxTicks: 48,
  horizonTicks: 12,
};

export type PlannerConfig = typeof plannerConfig;
