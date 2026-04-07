import { plannerConfig } from "../config/planner-config";
import type { PlannedRoute, RobotState, SchedulerResult, Task, WorldSnapshot } from "../domain/entities";
import { RedisAdapter, parseFacilities, parseRobots } from "../infra/redis/redis-adapter";
import { buildWeightedMap } from "../planner/cost-model";
import { loadPlannerMap } from "../planner/map-loader";
import { WeightedAStarPlanner } from "../planner/weighted-astar";
import { ReservationTable } from "../reservation/reservation-table";

interface RobotDispatchTask {
  robotId: number;
  nodeId: string;
  id: string;
  sourceNode: string;
  targetNode: string;
  processTimeSec: number;
  setupTimeSec: number;
  priority: number;
}

interface RobotDispatchRule {
  robotId: number;
  sourceNode: string;
  fromAddress: string;
  toAddress: string;
}

const ROBOT_DISPATCH_RULES: RobotDispatchRule[] = [
  { robotId: 1, sourceNode: "0050", fromAddress: "0060", toAddress: "0064" },
  { robotId: 2, sourceNode: "0058", fromAddress: "0065", toAddress: "0068" },
  { robotId: 3, sourceNode: "SAFETY-ZONE-3", fromAddress: "0070", toAddress: "0074" },
  { robotId: 4, sourceNode: "SAFETY-ZONE-4", fromAddress: "0075", toAddress: "0078" },
];

function compareRobots(a: RobotState, b: RobotState): number {
  const modeWeight = (robot: RobotState) => (robot.mode === "MOVING" ? 0 : robot.taskId ? 1 : 2);
  return modeWeight(a) - modeWeight(b) || a.robotId.localeCompare(b.robotId);
}

function selectTask(tasks: Task[], robot: RobotState): Task | undefined {
  return tasks
    .filter((task: Task) => task.status === "READY" && task.sourceNode === robot.nodeId)
    .sort((a: Task, b: Task) => b.priority - a.priority || a.id.localeCompare(b.id))[0];
}

export function runScheduler(snapshot: WorldSnapshot): SchedulerResult {
  const plannerMap = snapshot.map ?? loadPlannerMap();
  const weightedMap = buildWeightedMap(plannerMap, snapshot.equipmentFaults, plannerConfig);
  const reservations = new ReservationTable();
  const planner = new WeightedAStarPlanner(weightedMap, reservations, plannerConfig);

  const tasks: Task[] = snapshot.tasks.map((task: Task) => ({ ...task }));
  const routes: PlannedRoute[] = [];

  for (const robot of [...snapshot.robots].sort(compareRobots)) {
    const task = selectTask(tasks, robot);
    if (!task) {
      continue;
    }

    task.status = "ASSIGNED";
    const route = planner.plan(robot, task, robot.routeVersion + 1);
    if (route) {
      routes.push(route);
    } else {
      task.status = "READY";
    }
  }

  return {
    routes,
    unassignedTasks: tasks.filter((task: Task) => task.status === "READY"),
  };
}

function parseAddress(address: string): number {
  return parseInt(address, 16);
}

function isAddressInRange(address: string, fromAddress: string, toAddress: string): boolean {
  const numericAddress = parseAddress(address);
  return numericAddress >= parseAddress(fromAddress) && numericAddress <= parseAddress(toAddress);
}

function createDispatchTask(rule: RobotDispatchRule, facilitiesRaw: string): RobotDispatchTask | null {
  const matchedFacility = parseFacilities(facilitiesRaw)
    .filter((item) => isAddressInRange(item.address, rule.fromAddress, rule.toAddress) && Number(item.value) === 1)
    .sort((a, b) => parseAddress(a.address) - parseAddress(b.address))[0];

  if (!matchedFacility) {
    return null;
  }

  return {
    robotId: rule.robotId,
    nodeId: rule.sourceNode,
    id: matchedFacility.address,
    sourceNode: rule.sourceNode,
    targetNode: matchedFacility.address,
    processTimeSec: 20,
    setupTimeSec: 10,
    priority: 100,
  };
}

export class TaskScheduler {
  async robotScheduler(): Promise<RobotDispatchTask[]> {
    const redis = new RedisAdapter();
    const redisConnected = await redis.connect();

    if (!redisConnected) {
      return [];
    }

    try {
      const facilitiesData = await redis.getString("Melsec.W");
      const robotData = await redis.getString("ammrStatusInfo");

      const facilitiesRaw = facilitiesData ?? "{}";
      const robotParseData = parseRobots(robotData ?? "{}");

      return ROBOT_DISPATCH_RULES.flatMap((rule) => {
        const robot = robotParseData.find((item) => item.robotId === rule.robotId);        
        if (robot?.state !== 5) {
          return [];
        }

        const dispatchTask = createDispatchTask(rule, facilitiesRaw);
        return dispatchTask ? [dispatchTask] : [];
      });
    } finally {
      await redis.disconnect();
    }
  }
}
