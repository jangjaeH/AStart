import { runScheduler } from "../scheduler/task-scheduler";
import { createSeedScenario } from "./seed-scenario";

const snapshot = createSeedScenario();
const result = runScheduler(snapshot);

console.log(JSON.stringify({
  snapshotVersion: snapshot.version,
  assignedRoutes: result.routes,
  unassignedTasks: result.unassignedTasks
}, null, 2));
