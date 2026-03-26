import type { EngineScenario } from "../domain/entities"

export function validateScenario(scenario: EngineScenario): string[] {
    const errors : string[] = [];

    const mapNodes = new Set( 
        (scenario.snapshot.map?.nodes ?? []).map((node) => node.id),
    )

    for (const robot of scenario.snapshot.robots)  {
        if(!mapNodes.has(robot.nodeId)) {
            errors.push(`Robot ${robot.nodeId} is on a node that doesn't exist in the map.`);
        }
    }

    for (const task of scenario.snapshot.tasks)  {
        if(!mapNodes.has(task.sourceNode)) {
            errors.push(`Task ${task.id} has a source node that doesn't exist in the map.`);
        }

        if (!mapNodes.has(task.targetNode)) {
            errors.push(`Task ${task.id} has a target node that doesn't exist in the map.`);
        }
    }

    for (const equipments of scenario.snapshot.equipments ?? [])  {
        if(!mapNodes.has(equipments.accessNodeId)) {
            errors.push(`Equipment ${equipments.id} has an access node that doesn't exist in the map.`);
        }
    }

    return errors;
}