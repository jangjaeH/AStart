import type { EquipmentFault, MapEdge, MapNode, PlannerMap } from "../domain/entities";
import type { PlannerConfig } from "../config/planner-config";

export interface WeightedGraphEdge extends MapEdge {
  effectiveCost: number;
}

export interface WeightedPlannerMap {
  nodes: Map<string, MapNode>;
  adjacency: Map<string, WeightedGraphEdge[]>;
}

export function buildWeightedMap(
  plannerMap: PlannerMap,
  faults: EquipmentFault[],
  config: PlannerConfig,
): WeightedPlannerMap {
  const blockedNodes = new Set<string>();
  const nodeMultipliers = new Map<string, number>();

  for (const fault of faults) {
    for (const nodeId of fault.blockedNodes) {
      if (fault.status === "DOWN") {
        blockedNodes.add(nodeId);
      } else if (fault.status === "ALARM") {
        nodeMultipliers.set(nodeId, fault.weightMultiplier ?? config.equipmentPenalty);
      }
    }
  }

  const enabledNodes = plannerMap.nodes.filter(
    (node: MapNode) => node.enabled !== false && !blockedNodes.has(node.id),
  );
  const nodes = new Map<string, MapNode>(
    enabledNodes.map((node: MapNode) => [
      node.id,
      {
        ...node,
        weight: (node.weight ?? 1) * (nodeMultipliers.get(node.id) ?? 1),
      },
    ]),
  );

  const adjacency = new Map<string, WeightedGraphEdge[]>();

  const pushEdge = (edge: MapEdge, from: string, to: string) => {
    if (!nodes.has(from) || !nodes.has(to) || edge.enabled === false) {
      return;
    }

    const target = nodes.get(to)!;
    const effectiveCost = edge.cost * (target.weight ?? 1);
    const weightedEdge: WeightedGraphEdge = { ...edge, from, to, effectiveCost };
    const existing = adjacency.get(from) ?? [];
    existing.push(weightedEdge);
    adjacency.set(from, existing);
  };

  for (const edge of plannerMap.edges) {
    pushEdge(edge, edge.from, edge.to);
    if (edge.bidirectional) {
      pushEdge(edge, edge.to, edge.from);
    }
  }

  return { nodes, adjacency };
}
