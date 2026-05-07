type Bucket = { count: number; resetAt: number };

const STORE = new Map<string, Bucket>();
const SWEEP_EVERY = 60_000;

let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY) return;
  lastSweep = now;
  for (const [k, b] of STORE.entries()) {
    if (b.resetAt <= now) STORE.delete(k);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = STORE.get(key);
  if (!bucket || bucket.resetAt <= now) {
    STORE.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, retryAfterMs: 0 };
  }
  if (bucket.count >= opts.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.resetAt - now,
    };
  }
  bucket.count++;
  return {
    allowed: true,
    remaining: opts.limit - bucket.count,
    retryAfterMs: 0,
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}
