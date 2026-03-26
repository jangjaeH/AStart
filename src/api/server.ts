import express from "express";
import { z } from "zod";
import type { EngineScenario } from "../domain/entities";
import { createPlannerEngine } from "../engine";
import { createSeedScenario } from "../simulation/seed-scenario";

const taskSchema = z.object({
  id: z.string(),
  sourceNode: z.string(),
  targetNode: z.string(),
  priority: z.number().int().positive(),
});

export function createServer(initialScenario: EngineScenario = createSeedScenario()) {
  const app = express();
  app.use(express.json());
  const engine = createPlannerEngine();

  let scenario = initialScenario;

  app.get("/health", (_req, res) => {
    res.json({ ok: true, version: scenario.snapshot.version, scenarioId: scenario.id });
  });

  app.get("/robots", (_req, res) => {
    res.json(scenario.snapshot.robots);
  });

  app.get("/tasks", (_req, res) => {
    res.json(scenario.snapshot.tasks);
  });

  app.post("/tasks", (req, res) => {
    const task = taskSchema.parse(req.body);
    scenario = {
      ...scenario,
      snapshot: {
        ...scenario.snapshot,
        version: scenario.snapshot.version + 1,
        tasks: [...scenario.snapshot.tasks, { ...task, status: "READY" }],
      },
    };
    res.status(201).json(task);
  });

  app.post("/simulation/start", (_req, res) => {
    const result = engine.runScenario(scenario);
    res.json(result);
  });

  return app;
}
