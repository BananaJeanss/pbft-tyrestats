import type { NextConfig } from "next";
import { execSync } from "child_process";

const getCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
};

const commitHash =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || getCommitHash();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: commitHash,
  },
  generateBuildId: async () => {
    return commitHash;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbft-tyrestats.vercel.app",
      },
      {
        protocol: "https",
        hostname: "tyrestats.vercel.app",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
