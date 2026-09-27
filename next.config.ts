import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in a parent directory (outside this repo)
  // otherwise makes Turbopack misdetect the workspace root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
