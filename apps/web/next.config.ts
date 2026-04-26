import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: [
    "@fastrack/config",
    "@fastrack/content",
    "@fastrack/core",
    "@fastrack/types",
  ],
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  // Bundle the mobile content JSON into /exam/** Lambdas so Vercel's file-system
  // tracing picks them up. Without this, readFile calls in loadMockExam hang on
  // the Vercel runtime because the sibling apps/mobile directory is not traced
  // into the function bundle (root cause of #102).
  experimental: {
    outputFileTracingRoot: path.resolve(__dirname, "../../"),
    outputFileTracingIncludes: {
      "/exam": ["../../apps/mobile/assets/content/**/*.json"],
      "/exam/[mockId]": ["../../apps/mobile/assets/content/**/*.json"],
    },
  },
};

export default nextConfig;
