import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimitMemory(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    memoryStore.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  memoryStore.set(identifier, entry);
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

async function checkRateLimitRedis(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const key = `rl:${identifier}`;
  const windowSec = Math.ceil(windowMs / 1000);

  const count = await redis!.incr(key);
  if (count === 1) {
    await redis!.expire(key, windowSec);
  }

  const ttl = await redis!.ttl(key);
  const resetAt = Date.now() + Math.max(0, ttl) * 1000;

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60_000
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  if (redis) {
    return checkRateLimitRedis(identifier, limit, windowMs);
  }
  return checkRateLimitMemory(identifier, limit, windowMs);
}

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60_000 },
  register: { limit: 3, windowMs: 60 * 60_000 },
  passwordReset: { limit: 3, windowMs: 60 * 60_000 },
  changePassword: { limit: 5, windowMs: 15 * 60_000 },
  deleteAccount: { limit: 3, windowMs: 60 * 60_000 },
  createArticle: { limit: 10, windowMs: 60_000 },
  createComment: { limit: 20, windowMs: 60_000 },
  search: { limit: 30, windowMs: 60_000 },
  getUser: { limit: 60, windowMs: 60_000 },
  reaction: { limit: 30, windowMs: 60_000 },
  follow: { limit: 20, windowMs: 60_000 },
  default: { limit: 60, windowMs: 60_000 },
} as const;

export function getClientIp(request: Request): string {
  const headers = request.headers;

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

export function createRateLimitErrorResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);

  return {
    error: {
      type: "RATE_LIMIT_EXCEEDED",
      message: "リクエストが多すぎます。しばらくしてからもう一度お試しください。",
      retryAfter,
    },
  };
}
