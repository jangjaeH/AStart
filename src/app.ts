import { createServer } from "./api/server";
import { RedisAdapter } from "./infra/redis/redis-adapter";
import { createSeedScenario } from "./simulation/seed-scenario";

async function bootstrap() {
  const port = Number(process.env.REDIS_PORT ?? 3000);
  const pollKey = process.env.REDIS_POLL_KEY ?? "MB4000";
  const pollIntervalMs = Number(process.env.REDIS_POLL_INTERVAL_MS ?? 1000);
  const scenario = createSeedScenario();
  const redis = new RedisAdapter();
  const redisConnected = await redis.connect();
  await redis.publishPlan(scenario.snapshot);

  if (redisConnected) {
    redis.startPollingString(pollKey, pollIntervalMs, (value) => {
      console.log(
        JSON.stringify({
          source: "redis",
          key: pollKey,
          db: 0,
          value,
          polledAt: new Date().toISOString(),
        }),
      );
    });
  }

  const app = createServer(scenario);
  app.listen(port, () => {
    console.log(
      JSON.stringify({
        message: "Multi-robot A* engine server started",
        port,
        redisConnected,
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
