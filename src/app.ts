import { createServer } from "./api/server";
import { RedisAdapter, parseFacilities } from "./infra/redis/redis-adapter";
import { createSeedScenario } from "./simulation/seed-scenario";
import type { Facilities } from "./domain/entities";
import { TaskScheduler } from "./scheduler/task-scheduler";
async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const pollKey = process.env.REDIS_POLL_KEY ?? "Melsec.W";
  const pollIntervalMs = Number(process.env.REDIS_POLL_INTERVAL_MS ?? 1000);
  const scenario = createSeedScenario();
  const redis = new RedisAdapter();
  const task = new TaskScheduler();
  let redisData: Facilities[] = [];
  const redisConnected = await redis.connect();

  await redis.publishPlan(scenario.snapshot);

  setInterval(async () => {
    await task.robotScheduler();
  },1000);
  
  // if (redisConnected) {
  //   redis.startPollingString(pollKey, pollIntervalMs, (value) => {
  //     redisData = parseFacilities(value ?? "{}");
  //     const matched = redisData.filter(item => {
  //         const address = item.address;
  //         return address >= "0051" && address <= "0057" && Number(item.value) === 1;
  //     });
  //     console.log('Matched items:', matched); 
  //   });
  // }

  // const app = createServer(scenario);
  // app.listen(port, () => {
  //   console.log(
  //     JSON.stringify({
  //       message: "Multi-robot A* engine server started",
  //       port,
  //       redisConnected,
  //       redisDb: redis.getDb(),
  //       redisPollKey: pollKey,
  //       redisPollIntervalMs: pollIntervalMs,
  //       endpoints: ["/health", "/robots", "/tasks", "/simulation/start"],
  //     }),
  //   );
  // });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
