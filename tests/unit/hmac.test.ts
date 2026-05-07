import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.HMAC_SECRET = "test-secret-deterministic-32bytes-min";
});

describe("hmac", () => {
  it("verifies a freshly signed token", async () => {
    const { signToken, verifyToken } = await import("@/lib/server/hmac");
    const token = signToken({ kind: "checkout", orderId: "abc-123" });
    const v = verifyToken(token, { kind: "checkout", orderId: "abc-123" });
    expect(v.valid).toBe(true);
    if (v.valid) {
      expect(v.kind).toBe("checkout");
      expect(v.orderId).toBe("abc-123");
    }
  });

  it("rejects token for different orderId (IDOR defense)", async () => {
    const { signToken, verifyToken } = await import("@/lib/server/hmac");
    const token = signToken({ kind: "checkout", orderId: "abc-123" });
    const v = verifyToken(token, { kind: "checkout", orderId: "other-456" });
    expect(v.valid).toBe(false);
    if (!v.valid) expect(v.reason).toBe("signature");
  });

  it("rejects token signed for different kind (kind separation)", async () => {
    const { signToken, verifyToken } = await import("@/lib/server/hmac");
    const token = signToken({ kind: "checkout", orderId: "abc-123" });
    const v = verifyToken(token, { kind: "portal", orderId: "abc-123" });
    expect(v.valid).toBe(false);
    if (!v.valid) expect(v.reason).toBe("kind");
  });

  it("rejects malformed token", async () => {
    const { verifyToken } = await import("@/lib/server/hmac");
    const v = verifyToken("garbage", { kind: "checkout", orderId: "x" });
    expect(v.valid).toBe(false);
  });

  it("rejects null/empty token", async () => {
    const { verifyToken } = await import("@/lib/server/hmac");
    expect(
      verifyToken(null, { kind: "checkout", orderId: "x" }).valid,
    ).toBe(false);
    expect(
      verifyToken("", { kind: "checkout", orderId: "x" }).valid,
    ).toBe(false);
  });

  it("rejects tampered signature", async () => {
    const { signToken, verifyToken } = await import("@/lib/server/hmac");
    const token = signToken({ kind: "checkout", orderId: "abc-123" });
    const tampered = token.slice(0, -4) + "AAAA";
    const v = verifyToken(tampered, {
      kind: "checkout",
      orderId: "abc-123",
    });
    expect(v.valid).toBe(false);
  });
});
