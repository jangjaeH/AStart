import { plannerConfig, type PlannerConfig } from "../config/planner-config";
import type { PlannedRoute, RobotState, Task } from "../domain/entities";
import type { WeightedPlannerMap } from "./cost-model";
import { ReservationTable } from "../reservation/reservation-table";

interface SearchState {
  key: string;
  nodeId: string;
  tick: number;
  heading: RobotState["heading"];
  g: number;
  f: number;
  prev?: string;
}

const headings: Record<string, RobotState["heading"]> = {
  "1,0": "E",
  "-1,0": "W",
  "0,1": "S",
  "0,-1": "N",
};

export class WeightedAStarPlanner {
  constructor(
    private readonly weightedMap: WeightedPlannerMap,
    private readonly reservations: ReservationTable,
    private readonly config: PlannerConfig = plannerConfig,
  ) {}

  plan(robot: RobotState, task: Task, version: number): PlannedRoute | null {
    const startNode = this.weightedMap.nodes.get(robot.nodeId);
    const goalNode = this.weightedMap.nodes.get(task.targetNode);
    if (!startNode || !goalNode) {
      return null;
    }

    const open = new Map<string, SearchState>();
    const queue: SearchState[] = [];
    const closed = new Set<string>();

    const push = (state: SearchState) => {
      open.set(state.key, state);
      queue.push(state);
      queue.sort((a, b) => a.f - b.f);
    };

    const startKey = `${robot.nodeId}@0`;
    push({
      key: startKey,
      nodeId: robot.nodeId,
      tick: 0,
      heading: robot.heading,
      g: 0,
      f: this.heuristic(robot.nodeId, task.targetNode),
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (closed.has(current.key)) {
        continue;
      }
      closed.add(current.key);

      if (current.nodeId === task.targetNode) {
        return this.buildRoute(robot, task, version, open, current.key);
      }

      if (current.tick >= this.config.maxTicks) {
        continue;
      }

      const neighbors = this.weightedMap.adjacency.get(current.nodeId) ?? [];
      for (const edge of neighbors) {
        const nextTick = current.tick + 1;
        if (this.reservations.isNodeReserved(nextTick, edge.to, robot.robotId)) {
          continue;
        }
        if (this.reservations.isEdgeSwapReserved(nextTick, current.nodeId, edge.to, robot.robotId)) {
          continue;
        }

        const nextHeading = this.deriveHeading(current.nodeId, edge.to) ?? current.heading;
        const turnPenalty = nextHeading === current.heading ? 0 : this.config.turnPenalty;
        const congestionPenalty = this.hasBottleneck(edge.to) ? this.config.congestionPenalty : 0;
        const g = current.g + edge.effectiveCost + turnPenalty + congestionPenalty;
        const f = g + this.heuristic(edge.to, task.targetNode);
        const key = `${edge.to}@${nextTick}`;
        const existing = open.get(key);
        if (!existing || g < existing.g) {
          push({ key, nodeId: edge.to, tick: nextTick, heading: nextHeading, g, f, prev: current.key });
        }
      }

      const waitTick = current.tick + 1;
      if (!this.reservations.isNodeReserved(waitTick, current.nodeId, robot.robotId)) {
        const waitKey = `${current.nodeId}@${waitTick}`;
        const waitG = current.g + this.config.waitCost;
        const existing = open.get(waitKey);
        if (!existing || waitG < existing.g) {
          push({
            key: waitKey,
            nodeId: current.nodeId,
            tick: waitTick,
            heading: current.heading,
            g: waitG,
            f: waitG + this.heuristic(current.nodeId, task.targetNode),
            prev: current.key,
          });
        }
      }
    }

    return null;
  }

  private buildRoute(
    robot: RobotState,
    task: Task,
    version: number,
    open: Map<string, SearchState>,
    endKey: string,
  ): PlannedRoute {
    const states: SearchState[] = [];
    let cursor: string | undefined = endKey;
    while (cursor) {
      const state = open.get(cursor);
      if (!state) {
        break;
      }
      states.push(state);
      cursor = state.prev;
    }
    states.reverse();

    for (let index = 1; index < states.length; index += 1) {
      const prev = states[index - 1];
      const current = states[index];
      this.reservations.reserveNode(current.tick, current.nodeId, robot.robotId);
      if (prev.nodeId !== current.nodeId) {
        this.reservations.reserveEdge(current.tick, prev.nodeId, current.nodeId, robot.robotId);
      }
    }

    const last = states.at(-1)!;
    return {
      routeId: `${robot.robotId}-${task.id}-v${version}`,
      robotId: robot.robotId,
      taskId: task.id,
      cost: Number(last.g.toFixed(2)),
      etaTicks: last.tick,
      nodes: states.map((state) => state.nodeId),
      steps: states.map((state) => ({ tick: state.tick, nodeId: state.nodeId })),
      version,
    };
  }

  private heuristic(nodeId: string, goalId: string): number {
    const node = this.weightedMap.nodes.get(nodeId)!;
    const goal = this.weightedMap.nodes.get(goalId)!;
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
  }

  private deriveHeading(fromId: string, toId: string): RobotState["heading"] | undefined {
    const from = this.weightedMap.nodes.get(fromId)!;
    const to = this.weightedMap.nodes.get(toId)!;
    return headings[`${to.x - from.x},${to.y - from.y}`];
  }

  private hasBottleneck(nodeId: string): boolean {
    const node = this.weightedMap.nodes.get(nodeId);
    return Boolean(node?.tags?.includes("bottleneck"));
  }
}
