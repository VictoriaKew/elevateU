import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";

// Keep production builds from overwriting files used by a running dev server.
export default function nextConfig(phase: string): NextConfig {
  return { reactStrictMode: true, ...([PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER].includes(phase) ? { distDir: ".next-build" } : {}) };
}
