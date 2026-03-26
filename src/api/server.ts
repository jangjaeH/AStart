import express from "express";
import { z } from "zod";
import type { WorldSnapshot } from "../domain/entities";
import { runScheduler } from "../scheduler/task-scheduler";
import { createSeedScenario } from "../simulation/seed-scenario";

const taskSchema = z.object({
  id: z.string(),
  sourceNode: z.string(),
  targetNode: z.string(),
  priority: z.number().int().positive(),
});

export function createServer(initialSnapshot: WorldSnapshot = createSeedScenario()) {
  const app = express();
  app.use(express.json());

  let snapshot = initialSnapshot;

  app.get("/health", (_req, res) => {
    res.json({ ok: true, version: snapshot.version });
  });

  app.get("/robots", (_req, res) => {
    res.json(snapshot.robots);
  });

  app.get("/tasks", (_req, res) => {
    res.json(snapshot.tasks);
  });

  app.post("/tasks", (req, res) => {
    const task = taskSchema.parse(req.body);
    snapshot = {
      ...snapshot,
      version: snapshot.version + 1,
      tasks: [...snapshot.tasks, { ...task, status: "READY" }],
    };
    res.status(201).json(task);
  });

  app.post("/simulation/start", (_req, res) => {
    const result = runScheduler(snapshot);
    res.json(result);
  });

  return app;
}
