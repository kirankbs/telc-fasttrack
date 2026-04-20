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
};

export default nextConfig;
