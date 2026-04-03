import IORedis from "ioredis";
import type { WorldSnapshot, Facilities } from "../../domain/entities";
import dotenv from "dotenv";
dotenv.config();
export class RedisAdapter {
  private client: IORedis | null = null;
  private readonly db = Number(process.env.REDIS_DB ?? 0);

  private readonly url = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${this.db}`;
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

  async publishFacilities(facilities: Facilities): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.set(
      facilities.address,
      JSON.stringify({
        address: facilities.address,
        value: facilities.value,
        time: new Date().toISOString(),
      }),
    );
  }

  async getString(key: string): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    return this.client.get(key);
  }

  startPollingString(
    key: string,
    intervalMs: number,
    onData: (value: string | null) => void,
  ): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        const value = await this.getString(key);
        onData(value);
      } catch (error) {
        console.error("[REDIS POLL ERROR] key=" + key, error);
      }
    }, intervalMs);
  }

  getDb(): number {
    return this.db;
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
