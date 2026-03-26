import { plannerConfig } from "../config/planner-config";
import type { PlannedRoute, RobotState, SchedulerResult, Task, WorldSnapshot } from "../domain/entities";
import { buildWeightedMap } from "../planner/cost-model";
import { loadPlannerMap } from "../planner/map-loader";
import { WeightedAStarPlanner } from "../planner/weighted-astar";
import { ReservationTable } from "../reservation/reservation-table";

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
