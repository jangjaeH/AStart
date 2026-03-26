import type { WorldSnapshot } from "../domain/entities";

export function createSeedScenario(): WorldSnapshot {
  return {
    version: 1,
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
    equipmentFaults: [
      {
        eqId: "EQ-FAULT-DEMO",
        status: "ALARM",
        blockedNodes: ["N8", "N11"],
        weightMultiplier: 2.5,
        updatedAt: new Date().toISOString()
      }
    ]
  };
}
