import { describe, expect, it } from "vitest";

import { clientKey, createRateLimiter } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("allows up to the limit per window, then reports retry-after", () => {
    const limit = createRateLimiter({ limit: 2, windowMs: 10_000 });
    expect(limit("a", 0).allowed).toBe(true);
    expect(limit("a", 1).allowed).toBe(true);
    expect(limit("a", 2)).toEqual({ allowed: false, retryAfterSeconds: 10 });
    expect(limit("b", 2).allowed).toBe(true);
    expect(limit("a", 10_000).allowed).toBe(true);
  });

  it("keys clients by the first forwarded address", () => {
    expect(clientKey(new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } }))).toBe("1.2.3.4");
    expect(clientKey(new Request("http://x"))).toBe("unknown");
  });
});
