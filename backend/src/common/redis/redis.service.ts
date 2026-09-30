import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly memoryCache = new Map<string, { value: string; expiresAt?: number }>();
  private isConnected = false;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 2) {
            this.logger.warn('Redis unavailable. Operating with local memory cache fallback.');
            return null; // Stop retrying
          }
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Connected to Redis server');
      });

      this.client.on('error', (err) => {
        if (this.isConnected) {
          this.logger.warn(`Redis connection error: ${err.message}`);
        }
        this.isConnected = false;
      });

      await this.client.connect().catch((err) => {
        this.logger.warn(`Redis not reachable at ${redisUrl}. Using local fallback store.`);
      });
    } catch (err) {
      this.logger.warn(`Redis init fallback: ${err.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // Fall back to memory
      }
    }
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.setex(key, ttlSeconds, value);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // Fall back to memory
      }
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // Fall back to memory
      }
    }
    this.memoryCache.delete(key);
  }

  async setJson(key: string, data: any, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(data), ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const val = await this.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async setCourierLocation(courierId: string, location: { lat: number; lng: number; battery?: number; updatedAt: string }) {
    await this.setJson(`courier:location:${courierId}`, location, 3600);
  }

  async getCourierLocation(courierId: string): Promise<{ lat: number; lng: number; battery?: number; updatedAt: string } | null> {
    return this.getJson(`courier:location:${courierId}`);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }
}
