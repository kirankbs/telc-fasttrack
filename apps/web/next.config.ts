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
  // All /exam routes (index, [mockId], and all 6 subroutes) are fully SSG via
  // static imports in @fastrack/content — no fs reads at request time (#108 fix).
  // outputFileTracingIncludes for /exam paths is removed; the bundler traces the
  // JSON through static import statements in packages/content/src/mocks.ts.
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
};

export default nextConfig;
