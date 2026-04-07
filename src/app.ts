import { createServer } from "./api/server";
import { RedisAdapter, parseFacilities } from "./infra/redis/redis-adapter";
import { createSeedScenario } from "./simulation/seed-scenario";
import type { Facilities } from "./domain/entities";
import { TaskScheduler } from "./scheduler/task-scheduler";
import { createPlannerEngine } from "./engine";

type  ScenarioFile = {
  name: string;
  mapFile: string;
  robots: Array<[
    robotId: string,
    nodeId: string,
    heading: "N" | "E" | "S" | "W",
    mode: "IDLE" | "MOVING" | "WAITING" | "ERROR"
  ]>;
  equipments: Array<[
    id: string,
    accessNodeId: string,
    processTimeSec?: number,
    setupTimeSec?: number
  ]>;
  tasks: Array<[
    id: string,
    robotId: string,
    sourceNode: string,
    targetNode: string,
    priority: number
  ]>;
  timing: {
    robotMoveSecondsPerEdge: number,
    robotWaitSecondsPerTick: number,
    defaultTaskServiceSeconds: number,
    defaultEquipmentProcessSeconds: number
  },
  optimization: {
    objective: string
  }

}

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const pollKey = process.env.REDIS_POLL_KEY ?? "Melsec.W";
  const pollIntervalMs = Number(process.env.REDIS_POLL_INTERVAL_MS ?? 1000);
  const scenario = createSeedScenario();
  const redis = new RedisAdapter();
  const task = new TaskScheduler();
  let redisData: Facilities[] = [];
  const redisConnected = await redis.connect();
  const planner = createPlannerEngine();
  await redis.publishPlan(scenario.snapshot);

  
  setInterval(async () => {
    const tasks =  await task.robotScheduler();
    console.log('tasks:', tasks);
    scenario.snapshot.robots = tasks.map((itme) => ({
      robotId: String(itme.robotId),
      nodeId: itme.nodeId,
      heading: 'E',
      mode: 'IDLE',
      routeVersion: 0,
      updatedAt: '2026-04-06T07:31:16.817Z'
    }))

    scenario.snapshot.tasks = tasks.map((item) => ({
      id: item.id,
      sourceNode: item.sourceNode,
      targetNode: item.targetNode,
      priority: item.priority,
      status: "READY" as const,
    }))

    scenario.snapshot.equipments = tasks.map((item) => ({
        id: item.id,
        accessNodeId: item.targetNode,
        processTimeSec: item.processTimeSec,
        setupTimeSec: item.setupTimeSec,
    }));

    // console.log('map:', scenario.snapshot.map);
    // console.log('robots', scenario.snapshot.robots);
    // console.log('tasks:', scenario.snapshot.tasks);
    // console.log('equipments:', scenario.snapshot.equipments);
    // console.log('equipmentFaults:', scenario.snapshot.equipmentFaults);
    
    const result = planner.runScenario(scenario);
    console.log(JSON.stringify({
        scenarioId: result.scenarioId,
        scenarioName: result.scenarioName,
        metrics: result.metrics,
        assignedRoutes: result.scheduler.routes,
        unassignedTasks: result.scheduler.unassignedTasks,
        robotSummaries: result.robotSummaries
    }, null, 2));
  },3000);


  const app = createServer(scenario);
  app.listen(port, () => {
    console.log(
      JSON.stringify({
        message: "Multi-robot A* engine server started",
        port,
        redisConnected,
        redisDb: redis.getDb(),
        redisPollKey: pollKey,
        redisPollIntervalMs: pollIntervalMs,
        endpoints: ["/health", "/robots", "/tasks", "/simulation/start"],
      }),
    );
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
