import IORedis from "ioredis";
import type { WorldSnapshot } from "../../domain/entities";

export class RedisAdapter {
  private client: IORedis | null = null;

  constructor(private readonly url = process.env.REDIS_URL) {}

  async connect(): Promise<boolean> {
    if (!this.url) {
      return false;
    }

    this.client = new IORedis(this.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    try {
      await this.client.connect();
      await this.client.ping();
      return true;
    } catch {
      await this.disconnect();
      return false;
    }
  }

  async publishPlan(snapshot: WorldSnapshot): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.set(
      "planner:last-snapshot",
      JSON.stringify({
        version: snapshot.version,
        robotCount: snapshot.robots.length,
        taskCount: snapshot.tasks.length,
        updatedAt: new Date().toISOString(),
      }),
    );
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.quit();
    this.client = null;
  }
}
