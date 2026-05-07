import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  "img-src 'self' data: https://*.mlstatic.com",
  `script-src 'self' ${isProd ? "" : "'unsafe-eval'"} 'unsafe-inline' https://*.mercadopago.com`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' https://*.mercadopago.com https://api.mercadopago.com",
  "frame-src 'self' https://*.mercadopago.com",
  "form-action 'self' https://*.mercadopago.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
]
  .join("; ")
  .replace(/\s+/g, " ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
