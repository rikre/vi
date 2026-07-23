import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Treat the project dir (not the parent home dir with its own package-lock.json)
  // as the workspace root so Next.js does not scan sibling directories for assets.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    // Constrain the Turbopack file walker to the project root. This prevents
    // Turbopack from trying to read tooling files like the `.agent-browser/default.sock`
    // Unix socket — which previously caused a fatal panic:
    //   "reading file .agent-browser/default.sock: Operation not supported on socket"
    root: process.cwd(),
  },
  // Exclude tooling dirs from production file tracing as well.
  outputFileTracingExcludes: {
    "*": [".agent-browser/**/*", "docs/**/*", "scripts/**/*"],
  },
};

export default nextConfig;
