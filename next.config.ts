import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const staticBaseUrl = process.env.NEXT_PUBLIC_STATIC_BASE_URL;
let staticHostname: string | null = null;
if (staticBaseUrl) {
  try {
    staticHostname = new URL(staticBaseUrl).hostname;
  } catch {
    // ignore invalid URL
  }
}

const r2PublicUrl = process.env.R2_PUBLIC_URL;
let r2Hostname: string | null = null;
if (r2PublicUrl) {
  try {
    r2Hostname = new URL(r2PublicUrl).hostname;
  } catch {
    // ignore invalid URL
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // ローカル開発: MinIO
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      // 本番: NEXT_PUBLIC_STATIC_BASE_URL のホスト名を動的に追加
      ...(staticHostname
        ? [{ protocol: "https" as const, hostname: staticHostname }]
        : []),
      // R2 直接URL
      ...(r2Hostname
        ? [{ protocol: "https" as const, hostname: r2Hostname }]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
