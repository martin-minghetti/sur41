import { createHmac, timingSafeEqual } from "node:crypto";

export type TokenKind = "checkout" | "portal";

const TTL_BY_KIND: Record<TokenKind, number> = {
  checkout: 30 * 60 * 1000,
  portal: 90 * 24 * 60 * 60 * 1000,
};

function getSecret(): string {
  const s = process.env.HMAC_SECRET || process.env.AUTH_SECRET;
  if (!s) {
    throw new Error("HMAC_SECRET (or AUTH_SECRET) must be set");
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signToken(payload: {
  kind: TokenKind;
  orderId: string;
}): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TTL_BY_KIND[payload.kind];
  const body = `${payload.kind}.${payload.orderId}.${expiresAt}`;
  const sig = createHmac("sha256", getSecret()).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export type VerifyResult =
  | { valid: true; orderId: string; kind: TokenKind }
  | { valid: false; reason: "malformed" | "expired" | "signature" | "kind" };

export function verifyToken(
  token: string | null | undefined,
  expected: { kind: TokenKind; orderId: string },
): VerifyResult {
  if (!token) return { valid: false, reason: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 4) return { valid: false, reason: "malformed" };
  const [kind, orderId, expiresAtStr, sig] = parts as [
    string,
    string,
    string,
    string,
  ];
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt)) return { valid: false, reason: "malformed" };
  if (kind !== expected.kind) return { valid: false, reason: "kind" };
  if (orderId !== expected.orderId)
    return { valid: false, reason: "signature" };

  const body = `${kind}.${orderId}.${expiresAtStr}`;
  const expectedSig = createHmac("sha256", getSecret())
    .update(body)
    .digest();
  let providedSig: Buffer;
  try {
    providedSig = fromB64url(sig);
  } catch {
    return { valid: false, reason: "malformed" };
  }
  if (providedSig.length !== expectedSig.length) {
    return { valid: false, reason: "signature" };
  }
  const ok = timingSafeEqual(providedSig, expectedSig);
  if (!ok) return { valid: false, reason: "signature" };
  if (Date.now() > expiresAt) return { valid: false, reason: "expired" };

  return { valid: true, orderId, kind: kind as TokenKind };
}
