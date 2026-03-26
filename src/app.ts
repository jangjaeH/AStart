import { createServer } from "./api/server";
import { RedisAdapter } from "./infra/redis/redis-adapter";
import { createSeedScenario } from "./simulation/seed-scenario";

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const scenario = createSeedScenario();
  const redis = new RedisAdapter();
  const redisConnected = await redis.connect();
  await redis.publishPlan(scenario.snapshot);

  const app = createServer(scenario);
  app.listen(port, () => {
    console.log(
      JSON.stringify({
        message: "Multi-robot A* engine server started",
        port,
        redisConnected,
        endpoints: ["/health", "/robots", "/tasks", "/simulation/start"],
      }),
    );
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
