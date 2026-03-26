# Multi-Robot A* Engine

This repository contains a library-style Node.js engine skeleton for multi-robot path and task optimization based on Weighted A*, reservation tables, and scenario-driven execution.

## Included Areas

- `src/engine/*`: reusable engine entry points and time model
- `src/config/map.json`: sample factory-style map draft
- `src/planner/*`: weighted graph and Weighted A* planner
- `src/reservation/*`: time-slot reservation table
- `src/scheduler/*`: multi-robot task assignment skeleton
- `src/simulation/*`: sample scenario and CLI runner
- `src/api/*`: lightweight HTTP API wrapper
- `src/infra/redis/*`: Redis adapter skeleton
- `docs/Astar_engine_development_plan.md`: detailed development plan source

## Engine Flow

- `EngineScenario`: input map, robots, tasks, equipment, and timing model
- `PlannerEngine`: computes assignment, routes, and execution summaries
- `EnginePlanResult`: returns routes, robot summaries, and KPIs

The long-term goal is to keep the engine reusable as a library and let HTTP, Redis, dashboards, and simulators remain thin adapters around it.

## Run

```bash
npm.cmd install
npm.cmd run simulate
npm.cmd run start
```

## Example

```ts
import { createPlannerEngine } from "./src/engine";
import { createSeedScenario } from "./src/simulation/seed-scenario";

const engine = createPlannerEngine();
const scenario = createSeedScenario();
const result = engine.runScenario(scenario);
```

## Documents

- Detailed development plan: [docs/Astar_engine_development_plan.md](/docs/Astar_engine_development_plan.md)

## Recommended Next Steps

1. Split objective-specific optimization strategies under `src/engine`
2. Add a scenario JSON loader based on real factory maps
3. Expand timing models for equipment, tasks, and batching
4. Add exclusive bottleneck windows and deadlock recovery policies
