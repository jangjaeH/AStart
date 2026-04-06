import IORedis from "ioredis";
import type { WorldSnapshot, Facilities, Robots } from "../../domain/entities";
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

export function toFacilities(address: string, value: string | null): Facilities {
  const normalizedValue = value !== null && !Number.isNaN(Number(value)) ? Number(value) : value ?? "";

  return {
    address,
    value: normalizedValue
  }
}

export function parseFacilities(raw: string): Facilities[] {
  const parsed = JSON.parse(raw) as Record<string, string>;

  return Object.entries(parsed).map(([address, value]) => ({
    address,
    value: Number.isNaN(Number(value)) ? value : Number(value)
  }));
}

export function parseRobots(raw: string) : Robots[] {
  const parsed = JSON.parse(raw) as Record<number, { armSlot: string; state: number }>;
  return Object.entries(parsed).map(([robotId, { armSlot, state }]) => ({
    robotId: Number(robotId),
    armSlot,
    state
  }));
}
