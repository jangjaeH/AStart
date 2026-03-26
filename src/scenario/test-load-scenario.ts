import { loadScenarioFromFile } from "../simulation/load-scenario";
import { validateScenario } from "./validate-scenario";
const scenario = loadScenarioFromFile("./src/config/scenario.basic.json");
const errors = validateScenario(scenario);

if (errors.length > 0) {
    console.log("Scenario validation failed:");
    for (const error of errors) {
        console.log("-", error);
    }
    process.exit(1);
}
console.log(JSON.stringify({
    name: scenario.name,
    robots: scenario.snapshot.robots.map((r) => r.robotId),
    tasks: scenario.snapshot.tasks.map((t) => t.id),
    mapNodes: scenario.snapshot.map?.nodes.length ?? 0,
}, null, 2));