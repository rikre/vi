import type { NextConfig } from "next";
import { realpathSync } from "node:fs";

const projectRoot = realpathSync(process.cwd());
const safeDev = process.env.VI_SAFE_DEV === "1";

const nextConfig: NextConfig = {
  // Keep development tools away from the sidebar's login/account controls.
  devIndicators: { position: "bottom-right" },
  // Treat the project dir (not the parent home dir with its own package-lock.json)
  // as the workspace root so Next.js does not scan sibling directories for assets.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    // Constrain the Turbopack file walker to the project root. This prevents
    // Turbopack from trying to read tooling files like the `.agent-browser/default.sock`
    // Unix socket — which previously caused a fatal panic:
    //   "reading file .agent-browser/default.sock: Operation not supported on socket"
    root: projectRoot,
  },
  // Exclude tooling dirs from production file tracing as well.
  outputFileTracingExcludes: {
    "*": [".agent-browser/**/*", "docs/**/*", "scripts/**/*"],
  },
  // Only the guarded local dev command opts into Webpack and these limits.
  // Leave the production bundler and its configuration unchanged.
  ...(safeDev
    ? {
        experimental: { cpus: 2, webpackMemoryOptimizations: true },
        webpack(config) {
          config.parallelism = 2;
          const ignored = config.watchOptions?.ignored;
          const tooling = /[\\/](?:\.agent-browser|\.dev-runtime|temp-template|\.vibe-video-ref)(?:[\\/]|$)/;
          config.watchOptions = {
            ...config.watchOptions,
            // Next supplies a RegExp; Webpack only permits strings inside arrays.
            ignored: ignored instanceof RegExp
              ? new RegExp(`(?:${ignored.source})|(?:${tooling.source})`, ignored.flags)
              : [
                  ...(Array.isArray(ignored) ? ignored : ignored ? [ignored] : []),
                  "**/.agent-browser/**",
                  "**/.dev-runtime/**",
                  "**/temp-template/**",
                  "**/.vibe-video-ref/**",
                ],
          };
          return config;
        },
      }
    : {}),
};

export default nextConfig;
