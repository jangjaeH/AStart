export type RobotMode = "IDLE" | "MOVING" | "WAITING" | "ERROR";
export type EquipmentStatus = "RUN" | "IDLE" | "ALARM" | "DOWN";

export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: "lane" | "service" | "intersection" | "buffer" | "charge";
  zone?: string;
  tags?: string[];
  weight?: number;
  enabled?: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
  cost: number;
  bidirectional?: boolean;
  enabled?: boolean;
  zone?: string;
}

export interface PlannerMap {
  nodes: MapNode[];
  edges: MapEdge[];
}

export interface Task {
  id: string;
  sourceNode: string;
  targetNode: string;
  priority: number;
  status: "READY" | "ASSIGNED" | "DONE";
}

export interface RobotState {
  robotId: string;
  nodeId: string;
  heading: "N" | "E" | "S" | "W";
  mode: RobotMode;
  taskId?: string;
  routeVersion: number;
  updatedAt: string;
}

export interface EquipmentFault {
  eqId: string;
  status: EquipmentStatus;
  blockedNodes: string[];
  weightMultiplier?: number;
  updatedAt: string;
}

export interface WorldSnapshot {
  version: number;
  robots: RobotState[];
  tasks: Task[];
  equipmentFaults: EquipmentFault[];
}

export interface RouteStep {
  tick: number;
  nodeId: string;
}

export interface PlannedRoute {
  routeId: string;
  robotId: string;
  taskId: string;
  cost: number;
  etaTicks: number;
  nodes: string[];
  steps: RouteStep[];
  version: number;
}

export interface SchedulerResult {
  routes: PlannedRoute[];
  unassignedTasks: Task[];
}
