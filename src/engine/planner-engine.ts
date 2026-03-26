import type { EngineMetrics, EnginePlanResult, EngineScenario } from "../domain/entities";
import { runScheduler } from "../scheduler/task-scheduler";
import { summarizeRouteExecution } from "./time-model";

function buildMetrics(result: EnginePlanResult): EngineMetrics {
  const makespanSeconds = result.robotSummaries.reduce(
    (max, summary) => Math.max(max, summary.completionSeconds),
    0,
  );
  const totalTravelSeconds = result.robotSummaries.reduce(
    (sum, summary) => sum + summary.travelSeconds,
    0,
  );
  const totalWaitSeconds = result.robotSummaries.reduce(
    (sum, summary) => sum + summary.waitSeconds,
    0,
  );
  const totalServiceSeconds = result.robotSummaries.reduce(
    (sum, summary) => sum + summary.serviceSeconds,
    0,
  );

  return {
    makespanSeconds,
    totalTravelSeconds,
    totalWaitSeconds,
    totalServiceSeconds,
    routeCount: result.scheduler.routes.length,
    unassignedTaskCount: result.scheduler.unassignedTasks.length,
  };
}

export class PlannerEngine {
  runScenario(scenario: EngineScenario): EnginePlanResult {
    const scheduler = runScheduler(scenario.snapshot);
    const robotSummaries = scheduler.routes.map((route) => summarizeRouteExecution(scenario, route));

    const result: EnginePlanResult = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      scheduler,
      robotSummaries,
      metrics: {
        makespanSeconds: 0,
        totalTravelSeconds: 0,
        totalWaitSeconds: 0,
        totalServiceSeconds: 0,
        routeCount: 0,
        unassignedTaskCount: 0,
      },
    };

    result.metrics = buildMetrics(result);
    return result;
  }
}

export function createPlannerEngine(): PlannerEngine {
  return new PlannerEngine();
}
