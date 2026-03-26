import map from "../config/map.json";
import type { EngineScenario, PlannerMap } from "../domain/entities";
import { defaultOptimizationConfig, defaultTimingConfig } from "../engine/defaults";

const scenarioMap: PlannerMap = map as PlannerMap;

export function createSeedScenario(): EngineScenario {
  return {
    id: "seed-factory-layout",
    name: "Seed Factory Scenario",
    timing: {
      ...defaultTimingConfig,
      robotMoveSecondsPerEdge: 3,
      robotWaitSecondsPerTick: 2,
      defaultTaskServiceSeconds: 10,
      defaultEquipmentProcessSeconds: 30,
    },
    optimization: defaultOptimizationConfig,
    snapshot: {
      version: 1,
      map: scenarioMap,
      robots: [
        { robotId: "R1", nodeId: "BUF-W1", heading: "E", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() },
        { robotId: "R2", nodeId: "BUF-W2", heading: "E", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() },
        { robotId: "R3", nodeId: "E-TOP", heading: "W", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() },
        { robotId: "R4", nodeId: "CHG-E", heading: "W", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() }
      ],
      tasks: [
        { id: "TASK-201", sourceNode: "BUF-W1", targetNode: "EQ-C2-ACCESS", priority: 100, status: "READY" },
        { id: "TASK-202", sourceNode: "BUF-W2", targetNode: "EQ-A1-ACCESS", priority: 95, status: "READY" },
        { id: "TASK-203", sourceNode: "E-TOP", targetNode: "EQ-B1-ACCESS", priority: 90, status: "READY" },
        { id: "TASK-204", sourceNode: "CHG-E", targetNode: "EQ-A2-ACCESS", priority: 80, status: "READY" }
      ],
      equipments: [
        { id: "EQ-A1", accessNodeId: "EQ-A1-ACCESS", zone: "LINE-A", processTimeSec: 24, setupTimeSec: 6 },
        { id: "EQ-A2", accessNodeId: "EQ-A2-ACCESS", zone: "LINE-A", processTimeSec: 28, setupTimeSec: 6 },
        { id: "EQ-B1", accessNodeId: "EQ-B1-ACCESS", zone: "LINE-B", processTimeSec: 20, setupTimeSec: 5 },
        { id: "EQ-B2", accessNodeId: "EQ-B2-ACCESS", zone: "LINE-B", processTimeSec: 22, setupTimeSec: 5 },
        { id: "EQ-C1", accessNodeId: "EQ-C1-ACCESS", zone: "LINE-C", processTimeSec: 26, setupTimeSec: 4 },
        { id: "EQ-C2", accessNodeId: "EQ-C2-ACCESS", zone: "LINE-C", processTimeSec: 32, setupTimeSec: 4 }
      ],
      equipmentFaults: [
        {
          eqId: "EQ-FAULT-DEMO",
          status: "ALARM",
          blockedNodes: ["N8", "N11"],
          weightMultiplier: 2.5,
          updatedAt: new Date().toISOString()
        }
      ]
    }
  };
}
