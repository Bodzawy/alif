// Small in-memory fixed-window rate limiter for the public API routes.
// It is per server instance (on serverless platforms each instance has its own
// window), which is enough to stop a single client from hammering the paid
// Azure endpoints. Replace with a shared store (e.g. Redis) when scaling out.

type Window = { start: number; count: number };

export type RateLimiter = (key: string, now?: number) => { allowed: boolean; retryAfterSeconds: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const windows = new Map<string, Window>();

  return (key, now = Date.now()) => {
    // Drop expired windows so the map cannot grow without bound.
    if (windows.size > 5_000) {
      for (const [entryKey, entry] of windows) {
        if (now - entry.start >= windowMs) windows.delete(entryKey);
      }
    }

    const current = windows.get(key);
    if (!current || now - current.start >= windowMs) {
      windows.set(key, { start: now, count: 1 });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    current.count += 1;
    if (current.count > limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((current.start + windowMs - now) / 1000) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
