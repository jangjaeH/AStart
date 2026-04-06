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

export interface EquipmentDefinition {
  id: string;
  accessNodeId: string;
  zone?: string;
  processTimeSec?: number;
  setupTimeSec?: number;
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
  map?: PlannerMap;
  robots: RobotState[];
  tasks: Task[];
  equipments?: EquipmentDefinition[];
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

export interface EngineTimingConfig {
  secondsPerTick: number;
  robotMoveSecondsPerEdge: number;
  robotWaitSecondsPerTick: number;
  defaultTaskServiceSeconds: number;
  defaultEquipmentProcessSeconds: number;
}

export interface EngineOptimizationConfig {
  objective: "minimize_makespan" | "minimize_total_cost" | "balanced";
}

export interface EngineScenario {
  id: string;
  name: string;
  snapshot: WorldSnapshot;
  timing: EngineTimingConfig;
  optimization: EngineOptimizationConfig;
}


export interface Facilities {
  address: string;
  value: string | number;
}

export interface Robots {
  robotId: number;
  armSlot: string;
  state: number;
}

export interface RobotExecutionSummary {
  robotId: string;
  taskId: string;
  travelSeconds: number;
  waitSeconds: number;
  serviceSeconds: number;
  completionSeconds: number;
}

export interface EngineMetrics {
  makespanSeconds: number;
  totalTravelSeconds: number;
  totalWaitSeconds: number;
  totalServiceSeconds: number;
  routeCount: number;
  unassignedTaskCount: number;
}

export interface EnginePlanResult {
  scenarioId: string;
  scenarioName: string;
  scheduler: SchedulerResult;
  robotSummaries: RobotExecutionSummary[];
  metrics: EngineMetrics;
}
