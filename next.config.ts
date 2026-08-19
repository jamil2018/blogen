import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    serverActions: {
      // post-covers allow 10MB; leave headroom for multipart encoding.
      bodySizeLimit: "12mb",
    },
  },
  turbopack: {
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
