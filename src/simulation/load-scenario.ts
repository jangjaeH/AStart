import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { EngineScenario, PlannerMap  } from "../domain/entities";
import { defaultOptimizationConfig, defaultTimingConfig } from "../engine/defaults";

type RawScenarioRobot = {
    robotId: string;
    nodeId: string;
    heading: "N" | "E" | "S" | "W";
    mode: "IDLE" | "MOVING" | "WAITING" | "ERROR";

}

type RawScenarioTask = {
    sourceNode: any;
    targetNode: any;
    priority: any;
    id: string;
    accessNodeId: string;
    processTimeSec?: number;
    setupTimeSec?: number;
}

type RawScenarioEquipment = {
    id: string;
    accessNodeId: string;
    processTimeSec?: number;
    setupTimeSec?: number;
};

type RawScenarioFile = {
    name: string;
    mapFile: string;
    robots: RawScenarioRobot[];
    equipments?: RawScenarioEquipment[];
    tasks: RawScenarioTask[];
    timing?: Partial<EngineScenario["timing"]>;
    optimization?: Partial<EngineScenario["optimization"]>;

}

export function loadScenarioFromFile(filePath: string): EngineScenario  {
    const absoluteScenarioPath = resolve(filePath);
    const scenarioDir = dirname(absoluteScenarioPath);

    const rawScenario = JSON.parse(
        readFileSync(absoluteScenarioPath, "utf-8"),
    ) as RawScenarioFile;


    const absoluteMapPath = resolve(scenarioDir, "..", "..", rawScenario.mapFile)
    const map = JSON.parse(readFileSync(absoluteMapPath, "utf-8")) as PlannerMap;

    return {
        id: rawScenario.name,
        name: rawScenario.name,
        timing: {
        ...defaultTimingConfig,
        ...rawScenario.timing,
        },
        optimization: {
        ...defaultOptimizationConfig,
        ...rawScenario.optimization,
        },
        snapshot: {
        version: 1,
        map,
        robots: rawScenario.robots.map((robot) => ({
            ...robot,
            routeVersion: 0,
            updatedAt: new Date().toISOString(),
        })),
        tasks: rawScenario.tasks.map((task) => ({
            id: task.id,
            sourceNode: task.sourceNode,
            targetNode: task.targetNode,
            priority: task.priority,
            status: "READY" as const,
        })),
        equipments: rawScenario.equipments ?? [],
        equipmentFaults: [],
        },
    };  
}