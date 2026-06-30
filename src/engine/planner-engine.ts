import type { EngineMetrics, EnginePlanResult, EngineScenario } from "../domain/entities";
import { runScheduler } from "../scheduler/task-scheduler";
import { summarizeRouteExecution } from "./time-model";

function buildMetrics(result: Omit<EnginePlanResult, "metrics">): EngineMetrics {
  let makespanSeconds = 0;
  let totalTravelSeconds = 0;
  let totalWaitSeconds = 0;
  let totalServiceSeconds = 0;

  for (const summary of result.robotSummaries) {
    makespanSeconds = Math.max(makespanSeconds, summary.completionSeconds);
    totalTravelSeconds += summary.travelSeconds;
    totalWaitSeconds += summary.waitSeconds;
    totalServiceSeconds += summary.serviceSeconds;
  }

  return {
    makespanSeconds,
    totalTravelSeconds,
    totalWaitSeconds,
    totalServiceSeconds,
    routeCount: result.scheduler.routes.length,
    unassignedTaskCount: result.scheduler.unassignedTasks.length,
  };
}

export function runScenario(scenario: EngineScenario): EnginePlanResult {
  const scheduler = runScheduler(scenario.snapshot);
  const robotSummaries = scheduler.routes.map((route) => summarizeRouteExecution(scenario, route));
  const result = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    scheduler,
    robotSummaries,
  };

  return {
    ...result,
    metrics: buildMetrics(result),
  };
}
