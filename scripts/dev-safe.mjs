// Guard the local development server on macOS/Linux. Stop on overload; never retry.
import { spawn, execFile } from "node:child_process";
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const args = process.argv.slice(2);
if (args.length && !(args.length === 2 && args[0] === "--port")) {
  console.error("Usage: npm run dev [-- --port 3000]");
  process.exit(1);
}
const port = Number(args[1] ?? 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error("Port must be an integer between 1024 and 65535.");
  process.exit(1);
}
if (process.platform === "win32") {
  console.error("This process-group resource guard requires macOS or Linux.");
  process.exit(1);
}

// Refuse an occupied port instead of silently creating another dev server.
const probe = createServer();
try {
  await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(port, "127.0.0.1", resolve);
  });
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
} catch (error) {
  console.error(`Cannot start: 127.0.0.1:${port} is unavailable (${error.code}). Reuse or inspect the existing service; do not keep restarting.`);
  process.exit(1);
}

const runtime = join(root, ".dev-runtime");
mkdirSync(runtime, { recursive: true });
const statusPath = join(runtime, `status-${port}.json`);
const limits = { rssMiB: 4096, processes: 24, nodeHeapMiB: 2048 };
let status = { root, port, supervisorPid: process.pid, limits, state: "starting" };
const save = (update) => {
  status = { ...status, ...update, updatedAt: new Date().toISOString() };
  writeFileSync(statusPath, JSON.stringify(status, null, 2) + "\n");
};

const child = spawn(process.execPath, [
  `--max-old-space-size=${limits.nodeHeapMiB}`,
  join(root, "node_modules/next/dist/bin/next"),
  "dev", "--webpack", "--hostname", "127.0.0.1", "--port", String(port),
], {
  cwd: root,
  detached: true,
  stdio: "inherit",
  env: {
    ...process.env,
    VI_SAFE_DEV: "1",
    RAYON_NUM_THREADS: "2",
    TOKIO_WORKER_THREADS: "2",
    UV_THREADPOOL_SIZE: "2",
  },
});
let stopping = false;
let exitCode = 0;
let escalation;
const killGroup = (signal) => {
  if (!child.pid) return;
  try { process.kill(-child.pid, signal); }
  catch (error) { if (error.code !== "ESRCH") console.error(error.message); }
};
const stop = (reason, code) => {
  if (stopping) return;
  stopping = true;
  exitCode = code;
  save({ state: "stopping", reason });
  console.error(`[dev-safe] ${reason}`);
  killGroup("SIGTERM");
  escalation = setTimeout(() => killGroup("SIGKILL"), 5000);
};
save({ childPid: child.pid, state: "running" });
console.log(`[dev-safe] http://localhost:${port} | Webpack | heap 2048 MiB/process | group RSS guard 4096 MiB | 24 processes max`);

let checking = false;
let monitorFailures = 0;
const timer = setInterval(() => {
  if (stopping || checking) return;
  checking = true;
  execFile("ps", ["-axo", "pid=,pgid=,rss="], { timeout: 3000, maxBuffer: 2 * 1024 * 1024 }, (error, stdout) => {
    checking = false;
    if (stopping) return;
    if (error) {
      if (++monitorFailures >= 3) stop("Resource monitor failed three times; stopping to avoid an unmonitored run.", 1);
      return;
    }
    monitorFailures = 0;
    const rows = stdout.trim().split("\n").map((line) => line.trim().split(/\s+/).map(Number));
    const group = rows.filter(([, pgid]) => pgid === child.pid);
    const rssMiB = Math.round(group.reduce((sum, [, , rss]) => sum + rss, 0) / 1024);
    save({ rssMiB, processes: group.length, peakRssMiB: Math.max(status.peakRssMiB ?? 0, rssMiB) });
    if (rssMiB > limits.rssMiB || group.length > limits.processes) {
      stop(`Resource limit exceeded: ${rssMiB} MiB RSS, ${group.length} processes. Inspect the log before trying again.`, 1);
    }
  });
}, 5000);
process.once("SIGINT", () => stop("Stopped by user (SIGINT).", 130));
process.once("SIGTERM", () => stop("Stopped by user (SIGTERM).", 143));
process.once("exit", () => killGroup("SIGTERM"));
child.once("error", (error) => {
  clearInterval(timer);
  clearTimeout(escalation);
  save({ state: "failed", reason: error.message });
  console.error(error.message);
  process.exit(1);
});
child.once("exit", (code, signal) => {
  clearInterval(timer);
  clearTimeout(escalation);
  killGroup("SIGTERM");
  save({ state: "stopped", childExitCode: code, childSignal: signal });
  process.exit(stopping ? exitCode : code ?? 1);
});
