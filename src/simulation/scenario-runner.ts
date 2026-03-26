import { createPlannerEngine } from "../engine";
import { createSeedScenario } from "./seed-scenario";

const scenario = createSeedScenario();
const engine = createPlannerEngine();
const result = engine.runScenario(scenario);

console.log(JSON.stringify({
  scenarioId: result.scenarioId,
  scenarioName: result.scenarioName,
  snapshotVersion: scenario.snapshot.version,
  metrics: result.metrics,
  assignedRoutes: result.scheduler.routes,
  unassignedTasks: result.scheduler.unassignedTasks,
  robotSummaries: result.robotSummaries,
}, null, 2));
