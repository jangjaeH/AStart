import { createPlannerEngine } from "../engine";   
import { loadScenarioFromFile } from "../simulation/load-scenario";
import { validateScenario } from "../scenario/validate-scenario";

const scenario = loadScenarioFromFile("./src/config/scenario.basic.json");
const errors = validateScenario(scenario);

if(errors.length > 0) {
    console.error("Scenario validation failed with the following errors:");
    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

const engine = createPlannerEngine();
const result = engine.runScenario(scenario);

console.log(JSON.stringify({
    scenarioId: result.scenarioId,
    scenarioName: result.scenarioName,
    metrics: result.metrics,
    assignedRoutes: result.scheduler.routes,
    unassignedTasks: result.scheduler.unassignedTasks,
    robotSummaries: result.robotSummaries
}, null, 2));