"use client";

import { cn } from "@/lib/utils";
import type { AgentRun, AgentStep, AgentStepStatus } from "@/types/project";

// ─── 状态徽章颜色 (去紫化,与 EvidenceBadge 一致) ──────────────────────────────
const STATUS_META: Record<AgentStepStatus, { label: string; color: string; dot: string }> = {
  pending: { label: "待处理", color: "text-white/40 bg-white/[0.06]", dot: "bg-white/30" },
  running: { label: "进行中", color: "text-brand bg-brand/15", dot: "bg-brand animate-pulse" },
  done: { label: "已完成", color: "text-[#7dffe6] bg-[#7dffe6]/15", dot: "bg-[#7dffe6]" },
  failed: { label: "失败", color: "text-red-400 bg-red-500/15", dot: "bg-red-500" },
};

// ─── 时间格式化 ────────────────────────────────────────────────────────────
function fmtTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtEta(seconds?: number): string {
  if (seconds === undefined || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds} 秒`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分`;
}

// ─── 步骤行 ────────────────────────────────────────────────────────────────
function StepRow({ step }: { step: AgentStep }) {
  const meta = STATUS_META[step.status];
  return (
    <li className="flex items-start gap-3 py-2" role="listitem">
      {/* 状态点 + 连线 */}
      <div className="flex flex-col items-center pt-1">
        <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} aria-hidden="true" />
        {step.status === "running" && (
          <span className="mt-1 size-2 rounded-full border border-brand/40" aria-hidden="true" />
        )}
      </div>

      {/* 文案 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[13px]",
              step.status === "done" && "text-white/70",
              step.status === "running" && "text-white font-medium",
              step.status === "pending" && "text-white/50",
              step.status === "failed" && "text-red-400"
            )}
          >
            {step.label}
          </span>
          <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium", meta.color)}>
            {meta.label}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-white/40 tabular-nums">
          {step.startedAt && <span>开始 {fmtTime(step.startedAt)}</span>}
          {step.finishedAt && <span>· 完成 {fmtTime(step.finishedAt)}</span>}
        </div>
        {step.note && (
          <p className={cn("mt-1 text-[11px]", step.status === "failed" ? "text-red-400" : "text-white/50")}>
            {step.status === "failed" ? "⚠ " : "💡 "}{step.note}
          </p>
        )}
      </div>
    </li>
  );
}

// ─── 主面板 ────────────────────────────────────────────────────────────────
export function AgentStatusPanel({
  agent,
  onRetry,
}: {
  agent: AgentRun;
  onRetry?: () => void;
}) {
  const completed = agent.steps.filter((s) => s.status === "done").length;
  const total = agent.steps.length;
  const isFailed = agent.steps.some((s) => s.status === "failed") || !!agent.failedReason;
  const isRunning = agent.steps.some((s) => s.status === "running");

  return (
    <section
      aria-label="Agent 状态面板"
      className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]"
    >
      {/* 头部 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              isFailed ? "bg-red-500/15 text-red-400" : isRunning ? "bg-brand/15 text-brand" : "bg-[#7dffe6]/15 text-[#7dffe6]"
            )}
            aria-hidden="true"
          >
            {isFailed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : isRunning ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <div>
            <h3 className="text-[14px] font-medium text-white">{agent.agentName}</h3>
            <p className="mt-0.5 text-[12px] text-white/50">{agent.currentLabel}</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-[11px] font-medium",
            isFailed ? "bg-red-500/15 text-red-400" : isRunning ? "bg-brand/15 text-brand" : "bg-[#7dffe6]/15 text-[#7dffe6]"
          )}
        >
          {isFailed ? "失败" : isRunning ? "运行中" : "已完成"}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-white/50 tabular-nums">
          <span>进度 {completed}/{total} 步</span>
          <span>{agent.progress}%</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
          role="progressbar"
          aria-valuenow={agent.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isFailed ? "bg-red-500" : "bg-brand"
            )}
            style={{ width: `${agent.progress}%` }}
          />
        </div>
      </div>

      {/* 指标三联 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[11px] text-white/40">预计剩余</p>
          <p className="mt-0.5 text-[14px] font-medium text-white tabular-nums">{fmtEta(agent.etaSeconds)}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[11px] text-white/40">积分消耗</p>
          <p className="mt-0.5 text-[14px] font-medium text-brand tabular-nums">
            {agent.costPaid}<span className="text-white/40">/{agent.costEstimate}</span>
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[11px] text-white/40">失败重试</p>
          <p className="mt-0.5 text-[14px] font-medium text-white tabular-nums">
            {isFailed ? "可重试" : "—"}
          </p>
        </div>
      </div>

      {/* 步骤列表 */}
      <div className="mt-4">
        <p className="mb-1 text-[11px] text-white/40">执行步骤</p>
        <ul role="list" className="divide-y divide-white/[0.04]">
          {agent.steps.map((step) => (
            <StepRow key={step.id} step={step} />
          ))}
        </ul>
      </div>

      {/* 失败原因 + 重试 */}
      {isFailed && agent.failedReason && (
        <div className="mt-4 rounded-lg bg-red-500/10 p-3 ring-1 ring-red-500/20">
          <p className="text-[12px] font-medium text-red-400">失败原因</p>
          <p className="mt-1 text-[12px] text-red-300/80">{agent.failedReason}</p>
        </div>
      )}
      {isFailed && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 w-full rounded-xl bg-brand py-2.5 text-[13px] font-bold text-black transition-all hover:brightness-110 active:scale-[0.98]"
        >
          重试任务
        </button>
      )}
    </section>
  );
}
