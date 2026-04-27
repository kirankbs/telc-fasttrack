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
  // /exam is now force-static (catalog-driven, no fs at request time — fix #104).
  // /exam/[mockId] is SSG via generateStaticParams (fix #103).
  // Both routes are served as static HTML — no Lambda, no file-system reads.
  // outputFileTracingIncludes is still needed for any remaining dynamic routes
  // that call loadMockExam (e.g. section subroutes under /exam/[mockId]/).
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/exam/[mockId]": ["../../apps/mobile/assets/content/**/*.json"],
  },
};

export default nextConfig;
