import map from "../config/map.json";
import type { EngineScenario, PlannerMap } from "../domain/entities";
import { defaultOptimizationConfig, defaultTimingConfig } from "../engine/defaults";

const scenarioMap: PlannerMap = map as PlannerMap;

export function createSeedScenario(): EngineScenario {
  return {
    id: "photo-layout-draft",
    name: "Photo Layout Draft Scenario",
    timing: {
      ...defaultTimingConfig,
      robotMoveSecondsPerEdge: 3,
      robotWaitSecondsPerTick: 2,
      defaultTaskServiceSeconds: 12,
      defaultEquipmentProcessSeconds: 28,
    },
    optimization: defaultOptimizationConfig,
    snapshot: {
      version: 1,
      map: scenarioMap,
      robots: [
        { robotId: "R1", nodeId: "L-M", heading: "E", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() },
        { robotId: "R2", nodeId: "R-M", heading: "W", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() },
        { robotId: "R3", nodeId: "CHG-L", heading: "E", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() },
        { robotId: "R4", nodeId: "CHG-R", heading: "W", mode: "IDLE", routeVersion: 0, updatedAt: new Date().toISOString() }
      ],
      tasks: [
        { id: "TASK-301", sourceNode: "L-M", targetNode: "EQ-T6-ACCESS", priority: 100, status: "READY" },
        { id: "TASK-302", sourceNode: "R-M", targetNode: "EQ-B2-ACCESS", priority: 95, status: "READY" },
        { id: "TASK-303", sourceNode: "CHG-L", targetNode: "EQ-CENTER-ACCESS", priority: 90, status: "READY" },
        { id: "TASK-304", sourceNode: "CHG-R", targetNode: "EQ-L2-ACCESS", priority: 85, status: "READY" }
      ],
      equipments: [
        { id: "EQ-L1", accessNodeId: "EQ-L1-ACCESS", zone: "LEFT-BAY", processTimeSec: 24, setupTimeSec: 4 },
        { id: "EQ-L2", accessNodeId: "EQ-L2-ACCESS", zone: "LEFT-BAY", processTimeSec: 24, setupTimeSec: 4 },
        { id: "EQ-T1", accessNodeId: "EQ-T1-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 20, setupTimeSec: 3 },
        { id: "EQ-T2", accessNodeId: "EQ-T2-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 20, setupTimeSec: 3 },
        { id: "EQ-T3", accessNodeId: "EQ-T3-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 22, setupTimeSec: 3 },
        { id: "EQ-T4", accessNodeId: "EQ-T4-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 22, setupTimeSec: 3 },
        { id: "EQ-T5", accessNodeId: "EQ-T5-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 22, setupTimeSec: 3 },
        { id: "EQ-T6", accessNodeId: "EQ-T6-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 22, setupTimeSec: 3 },
        { id: "EQ-T7", accessNodeId: "EQ-T7-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 24, setupTimeSec: 3 },
        { id: "EQ-T8", accessNodeId: "EQ-T8-ACCESS", zone: "TOP-EQUIPMENT", processTimeSec: 24, setupTimeSec: 3 },
        { id: "EQ-CENTER", accessNodeId: "EQ-CENTER-ACCESS", zone: "CENTER-CELL", processTimeSec: 18, setupTimeSec: 4 },
        { id: "EQ-B1", accessNodeId: "EQ-B1-ACCESS", zone: "BOTTOM-EQUIPMENT", processTimeSec: 21, setupTimeSec: 3 },
        { id: "EQ-B2", accessNodeId: "EQ-B2-ACCESS", zone: "BOTTOM-EQUIPMENT", processTimeSec: 21, setupTimeSec: 3 },
        { id: "EQ-B3", accessNodeId: "EQ-B3-ACCESS", zone: "BOTTOM-EQUIPMENT", processTimeSec: 21, setupTimeSec: 3 },
        { id: "EQ-B4", accessNodeId: "EQ-B4-ACCESS", zone: "BOTTOM-EQUIPMENT", processTimeSec: 23, setupTimeSec: 3 },
        { id: "EQ-B5", accessNodeId: "EQ-B5-ACCESS", zone: "BOTTOM-EQUIPMENT", processTimeSec: 23, setupTimeSec: 3 },
        { id: "EQ-B6", accessNodeId: "EQ-B6-ACCESS", zone: "BOTTOM-EQUIPMENT", processTimeSec: 23, setupTimeSec: 3 },
        { id: "EQ-R1", accessNodeId: "EQ-R1-ACCESS", zone: "TRANSFER-TABLE", processTimeSec: 16, setupTimeSec: 2 }
      ],
      equipmentFaults: [
        {
          eqId: "EQ-FAULT-DEMO",
          status: "ALARM",
          blockedNodes: ["M4", "M5", "M6"],
          weightMultiplier: 2.2,
          updatedAt: new Date().toISOString()
        }
      ]
    }
  };
}
