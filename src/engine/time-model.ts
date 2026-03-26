import type {
  EngineScenario,
  PlannedRoute,
  RobotExecutionSummary,
  Task,
  WorldSnapshot,
} from "../domain/entities";

function getTaskById(snapshot: WorldSnapshot, taskId: string): Task | undefined {
  return snapshot.tasks.find((task) => task.id === taskId);
}

function countWaitSteps(route: PlannedRoute): number {
  let waitSteps = 0;
  for (let index = 1; index < route.nodes.length; index += 1) {
    if (route.nodes[index] === route.nodes[index - 1]) {
      waitSteps += 1;
    }
  }
  return waitSteps;
}

export function summarizeRouteExecution(
  scenario: EngineScenario,
  route: PlannedRoute,
): RobotExecutionSummary {
  const task = getTaskById(scenario.snapshot, route.taskId);
  const equipment = scenario.snapshot.equipments?.find(
    (item) => item.accessNodeId === task?.targetNode,
  );
  const waitSteps = countWaitSteps(route);
  const moveSteps = Math.max(route.steps.length - 1 - waitSteps, 0);
  const travelSeconds = moveSteps * scenario.timing.robotMoveSecondsPerEdge;
  const waitSeconds = waitSteps * scenario.timing.robotWaitSecondsPerTick;
  const serviceSeconds =
    (equipment?.setupTimeSec ?? 0) +
    (equipment?.processTimeSec ?? scenario.timing.defaultEquipmentProcessSeconds) +
    scenario.timing.defaultTaskServiceSeconds;

  return {
    robotId: route.robotId,
    taskId: route.taskId,
    travelSeconds,
    waitSeconds,
    serviceSeconds,
    completionSeconds: travelSeconds + waitSeconds + serviceSeconds,
  };
}
