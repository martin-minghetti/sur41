import { describe, it, expect } from "vitest";
import { rateLimit, getClientIp } from "@/lib/server/rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit then blocks", () => {
    const key = "test:" + Math.random();
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
    const fourth = rateLimit(key, opts);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterMs).toBeGreaterThan(0);
  });

  it("decrements remaining counter", () => {
    const key = "test:" + Math.random();
    const opts = { limit: 5, windowMs: 60_000 };
    expect(rateLimit(key, opts).remaining).toBe(4);
    expect(rateLimit(key, opts).remaining).toBe(3);
  });

  it("isolates buckets by key", () => {
    const a = rateLimit("a:" + Math.random(), {
      limit: 1,
      windowMs: 60_000,
    });
    const b = rateLimit("b:" + Math.random(), {
      limit: 1,
      windowMs: 60_000,
    });
    expect(a.allowed && b.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses x-forwarded-for first", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(h)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(getClientIp(h)).toBe("9.9.9.9");
  });

  it("returns 0.0.0.0 when no headers", () => {
    expect(getClientIp(new Headers())).toBe("0.0.0.0");
  });
});
