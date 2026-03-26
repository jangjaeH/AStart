import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { PlannerMap } from "../domain/entities";

const nodeSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  type: z.enum(["lane", "service", "intersection", "buffer", "charge"]),
  zone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  weight: z.number().optional(),
  enabled: z.boolean().optional(),
});

const edgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  cost: z.number().positive(),
  bidirectional: z.boolean().optional(),
  enabled: z.boolean().optional(),
  zone: z.string().optional(),
});

const plannerMapSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

export function loadPlannerMap(mapPath = join(process.cwd(), "src", "config", "map.json")): PlannerMap {
  const raw = readFileSync(mapPath, "utf8");
  return plannerMapSchema.parse(JSON.parse(raw));
}
