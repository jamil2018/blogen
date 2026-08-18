import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://localhost:8000";
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  agentRules: false,
  turbopack: {
    root: frontendRoot,
    rules: {
      "*.svg": {
        type: "asset",
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      type: "asset/resource",
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
