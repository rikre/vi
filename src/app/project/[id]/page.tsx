"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import { getProject, statusLabel, typeLabel } from "@/lib/project-store";
import {
  useReferences,
  getEvidenceMeta,
  type StoredReference,
} from "@/lib/reference-store";
import { AgentStatusPanel } from "@/components/project/agent-status-panel";
import type { ProjectTab, RewriteVersion } from "@/types/project";
import {
  CoinsIcon,
  ChevronDownIcon,
  Edit3Icon,
  StarIcon,
  FileTextIcon,
  FilmIcon,
  SparkleIcon,
  ShareIcon,
} from "@/components/icons";
import { ShareDialog } from "@/components/share-dialog";

// ─── Tab navigation ─────────────────────────────────────────────────────────

const TABS: { id: ProjectTab; label: string }[] = [
  { id: "overview", label: "概览" },
  { id: "script", label: "剧本" },
  { id: "evaluation", label: "评估" },
  { id: "rewrite", label: "改写" },
  { id: "assets", label: "资产" },
  { id: "breakdown", label: "分镜" },
  { id: "references", label: "引用" },
];

// ─── Tab content components ─────────────────────────────────────────────────

function OverviewTab({ project }: { project: ReturnType<typeof getProject> }) {
  if (!project) return null;
  const stats =
    project.stats ?? { episodes: 0, wordCount: 0, characterCount: 0, sceneCount: 0 };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "集数", value: stats.episodes || "—" },
          { label: "字数", value: stats.wordCount ? `${(stats.wordCount / 1000).toFixed(1)}k` : "—" },
          { label: "人物", value: stats.characterCount || "—" },
          { label: "场景", value: stats.sceneCount || "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-[#141414] p-4 ring-1 ring-white/[0.06]">
            <div className="text-[12px] text-white/40">{stat.label}</div>
            <div className="mt-1 text-[20px] font-semibold text-white tabular-nums">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
        <h3 className="text-[14px] font-medium text-white">项目配置</h3>
        <div className="mt-3 space-y-2">
          <ConfigRow label="类型" value={typeLabel(project.type)} />
          <ConfigRow label="状态" value={statusLabel(project.status)} />
          <ConfigRow label="创建时间" value={new Date(project.createdAt).toLocaleString("zh-CN")} />
          <ConfigRow label="更新时间" value={new Date(project.updatedAt).toLocaleString("zh-CN")} />
        </div>
      </div>
      {project.evaluation && (
        <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-white">评估摘要</h3>
            <span className="text-[20px] font-bold text-brand">{project.evaluation.totalScore}</span>
          </div>
          <div className="mt-2 text-[12px] text-white/50">等级 {project.evaluation.rating}</div>
        </div>
      )}
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}

function ScriptTab() {
  return (
    <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-medium text-white">剧本版本</h3>
        <button className="text-[12px] text-brand hover:underline">+ 新版本</button>
      </div>
      <div className="mt-4 space-y-2">
        {["v1 · 原始版本", "v2 · 轻度改稿", "v3 · 深度改写"].map((v, i) => (
          <div
            key={v}
            className={cn(
              "flex items-center justify-between rounded-lg px-4 py-3 text-[13px]",
              i === 2 ? "bg-brand/10 text-brand" : "bg-white/[0.03] text-white/70"
            )}
          >
            <span>{v}</span>
            <span className="text-[11px] text-white/40">{i === 2 ? "当前" : "历史"}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-black/30 p-4">
        <p className="text-[12px] text-white/40">第一集 · 场景 1</p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/70">
          凌晨三点的凯撒大堂空无一人。林策西装笔挺地站在落地窗前，俯瞰着这座他曾经熟悉的城市。雨点打在玻璃上，像是在敲打着他心底最后的防线……
        </p>
      </div>
    </div>
  );
}

// ─── Radar chart (SVG) ──────────────────────────────────────────────────────

function RadarChart({ dimensions }: { dimensions: { dimension: string; score: number; maxScore: number }[] }) {
  const size = 240;
  const center = size / 2;
  const radius = 80;
  const levels = 4;
  const angleStep = (Math.PI * 2) / dimensions.length;

  const pointAt = (angle: number, r: number) => ({
    x: center + Math.cos(angle - Math.PI / 2) * r,
    y: center + Math.sin(angle - Math.PI / 2) * r,
  });

  const dataPoints = dimensions.map((d, i) => {
    const ratio = d.score / d.maxScore;
    return pointAt(i * angleStep, radius * ratio);
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto" aria-label="维度雷达图" role="img">
      {/* 网格 */}
      {Array.from({ length: levels }).map((_, level) => {
        const r = (radius * (level + 1)) / levels;
        const pts = dimensions.map((_, i) => {
          const p = pointAt(i * angleStep, r);
          return `${p.x},${p.y}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}
      {/* 轴线 */}
      {dimensions.map((_, i) => {
        const p = pointAt(i * angleStep, radius);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        );
      })}
      {/* 数据多边形 */}
      <polygon
        points={polygonPoints}
        fill="rgba(212,255,63,0.15)"
        stroke="#D4FF3F"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#D4FF3F" />
      ))}
      {/* 维度标签 */}
      {dimensions.map((d, i) => {
        const p = pointAt(i * angleStep, radius + 24);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="11"
            fontWeight="500"
          >
            {d.dimension}
          </text>
        );
      })}
    </svg>
  );
}

function EvaluationTab({
  project,
  onDriveRewrite,
}: {
  project: ReturnType<typeof getProject>;
  onDriveRewrite: (issues: { dimension: string; text: string }[]) => void;
}) {
  // 用「维度索引-issue 索引」作为 issue 唯一 key
  const issueList = useMemo(() => {
    if (!project?.evaluation) return [];
    return project.evaluation.dimensions.flatMap((d, di) =>
      d.issues.map((text, ii) => ({
        key: `${di}-${ii}`,
        dimension: d.dimension,
        text,
      }))
    );
  }, [project]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(issueList.map((i) => i.key)));

  if (!project?.evaluation) {
    return (
      <div className="rounded-xl bg-[#141414] p-10 text-center ring-1 ring-white/[0.06]">
        <StarIcon className="mx-auto size-8 text-white/20" />
        <p className="mt-3 text-[14px] text-white/40">暂无评估结果</p>
        <button className="mt-4 rounded-full bg-brand px-5 py-2 text-[13px] font-bold text-black">
          开始评估
        </button>
      </div>
    );
  }

  const { evaluation } = project;
  const totalIssues = issueList.length;
  const selectedCount = selected.size;

  const toggleIssue = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDriveRewrite = () => {
    const picked = issueList.filter((i) => selected.has(i.key)).map(({ dimension, text }) => ({ dimension, text }));
    if (picked.length === 0) {
      alert("请至少勾选 1 个问题");
      return;
    }
    const ok = window.confirm(`将把 ${picked.length} 个问题转为改写任务\n预计消耗 30 积分,是否继续？`);
    if (!ok) return;
    onDriveRewrite(picked);
  };

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
          <p className="text-[12px] text-white/40">总分</p>
          <p className="mt-1 text-[36px] font-bold leading-none text-brand tabular-nums">{evaluation.totalScore}</p>
          <p className="mt-2 text-[11px] text-white/40">满分 100</p>
        </div>
        <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
          <p className="text-[12px] text-white/40">等级</p>
          <p className="mt-1 text-[36px] font-bold leading-none text-white">{evaluation.rating}</p>
          <p className="mt-2 text-[11px] text-white/40">
            {evaluation.rating === "S" ? "可直接投产" : evaluation.rating === "A" ? "推荐采纳" : evaluation.rating === "B" ? "建议优化" : "需重写"}
          </p>
        </div>
        <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
          <p className="text-[12px] text-white/40">问题数</p>
          <p className="mt-1 text-[36px] font-bold leading-none text-white tabular-nums">{totalIssues}</p>
          <p className="mt-2 text-[11px] text-white/40">已选 {selectedCount}</p>
        </div>
      </div>

      {/* Radar + Dimensions */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
          <h3 className="mb-2 text-[14px] font-medium text-white">维度雷达</h3>
          <RadarChart dimensions={evaluation.dimensions} />
        </div>
        <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
          <h3 className="mb-3 text-[14px] font-medium text-white">维度明细</h3>
          <div className="space-y-3">
            {evaluation.dimensions.map((d) => (
              <div key={d.dimension}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-white/70">{d.dimension}</span>
                  <span className="tabular-nums text-white/50">
                    {d.score}<span className="text-white/30">/{d.maxScore}</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(d.score / d.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues 清单 (可勾选) */}
      {totalIssues > 0 && (
        <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-white">问题清单</h3>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setSelected(new Set(issueList.map((i) => i.key)))}
                className="text-brand hover:underline"
              >
                全选
              </button>
              <span className="text-white/30">·</span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-white/50 hover:underline"
              >
                清空
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {issueList.map((issue) => {
              const checked = selected.has(issue.key);
              return (
                <label
                  key={issue.key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg px-4 py-3 transition-colors",
                    checked ? "bg-brand/10 ring-1 ring-brand/30" : "bg-white/[0.03] hover:bg-white/[0.05]"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIssue(issue.key)}
                    className="mt-0.5 size-4 accent-brand"
                    aria-label={`勾选问题：${issue.text}`}
                  />
                  <span className="mt-0.5 shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                    {issue.dimension}
                  </span>
                  <span className="text-[13px] text-white/70">{issue.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDriveRewrite}
          className="flex-1 rounded-xl bg-brand py-2.5 text-[13px] font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={selectedCount === 0}
        >
          驱动改稿（{selectedCount}）
        </button>
        <button
          type="button"
          onClick={() => alert("重新评估将消耗 50 积分")}
          className="flex-1 rounded-xl bg-white/[0.06] py-2.5 text-[13px] text-white/70 transition-colors hover:bg-white/[0.1]"
        >
          重新评估
        </button>
      </div>
    </div>
  );
}

function RewriteTab({
  project,
  drivenIssues,
  onClearDriven,
}: {
  project: ReturnType<typeof getProject>;
  drivenIssues: { dimension: string; text: string }[];
  onClearDriven: () => void;
}) {
  const [selectedVersion, setSelectedVersion] = useState<string>("v3");
  const [acceptedDiffs, setAcceptedDiffs] = useState<Set<string>>(new Set());
  // 版本对比模式:选中两个版本进行 diff
  const [compareMode, setCompareMode] = useState(false);
  const [comparePicked, setComparePicked] = useState<Set<string>>(new Set());
  // 回滚确认
  const [rollbackTarget, setRollbackTarget] = useState<RewriteVersion | null>(null);

  if (!project?.rewrite) {
    return (
      <div className="space-y-4">
        {drivenIssues.length > 0 && (
          <div className="rounded-xl bg-brand/10 p-4 ring-1 ring-brand/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-medium text-brand">来自评估的改写目标</h3>
                <p className="mt-0.5 text-[11px] text-white/60">共 {drivenIssues.length} 个问题,改写 Agent 将针对这些项进行优化</p>
              </div>
              <button
                type="button"
                onClick={onClearDriven}
                className="rounded-lg bg-white/[0.06] px-2 py-1 text-[11px] text-white/60 hover:bg-white/[0.1]"
              >
                清除
              </button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {drivenIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-0.5 shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                    {issue.dimension}
                  </span>
                  <span className="text-white/70">{issue.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-xl bg-[#141414] p-10 text-center ring-1 ring-white/[0.06]">
          <Edit3Icon className="mx-auto size-8 text-white/20" />
          <p className="mt-3 text-[14px] text-white/40">暂无改写结果</p>
          <button className="mt-4 rounded-full bg-brand px-5 py-2 text-[13px] font-bold text-black">
            开始改写
          </button>
        </div>
      </div>
    );
  }

  const { versions, diffs } = project.rewrite;
  const totalDelta = diffs.reduce((acc, d) => acc + d.delta, 0);
  const acceptedCount = acceptedDiffs.size;

  const toggleAccept = (id: string) => {
    setAcceptedDiffs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleComparePick = (id: string) => {
    setComparePicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= 2) {
          // 最多 2 个,先清除最早的
          const first = next.values().next().value;
          if (first) next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleRollback = (v: RewriteVersion) => {
    setRollbackTarget(v);
  };

  const confirmRollback = () => {
    if (!rollbackTarget) return;
    alert(`已回滚到「${rollbackTarget.label}」\n该操作将消耗 5 积分`);
    setRollbackTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* 来自评估的 issue */}
      {drivenIssues.length > 0 && (
        <div className="rounded-xl bg-brand/10 p-4 ring-1 ring-brand/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-medium text-brand">来自评估的改写目标</h3>
              <p className="mt-0.5 text-[11px] text-white/60">共 {drivenIssues.length} 个问题,改写 Agent 将针对这些项进行优化</p>
            </div>
            <button
              type="button"
              onClick={onClearDriven}
              className="rounded-lg bg-white/[0.06] px-2 py-1 text-[11px] text-white/60 hover:bg-white/[0.1]"
            >
              清除
            </button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {drivenIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px]">
                <span className="mt-0.5 shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                  {issue.dimension}
                </span>
                <span className="text-white/70">{issue.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Version tree */}
      <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[14px] font-medium text-white">版本树</h3>
            <button
              type="button"
              onClick={() => {
                setCompareMode((v) => !v);
                setComparePicked(new Set());
              }}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] transition-colors",
                compareMode ? "bg-brand text-black" : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
              )}
              aria-pressed={compareMode}
            >
              {compareMode ? "✓ 对比模式" : "版本对比"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => alert("新建改写版本将消耗 30 积分")}
            className="text-[12px] text-brand hover:underline"
          >
            + 新版本
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 overflow-x-auto">
          {versions.map((v, i) => {
            const picked = comparePicked.has(v.id);
            return (
              <div key={v.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => (compareMode ? toggleComparePick(v.id) : setSelectedVersion(v.id))}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-2 text-left transition-colors",
                    compareMode
                      ? picked
                        ? "border-brand bg-brand/15"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                      : selectedVersion === v.id
                        ? "border-brand bg-brand/10"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {compareMode && (
                      <span
                        className={cn(
                          "flex size-3 items-center justify-center rounded-[3px] border",
                          picked ? "border-brand bg-brand text-black" : "border-white/30"
                        )}
                        aria-hidden="true"
                      >
                        {picked && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-[12px] font-medium",
                        compareMode ? (picked ? "text-brand" : "text-white/80") : (selectedVersion === v.id ? "text-brand" : "text-white/80")
                      )}
                    >
                      {v.label}
                    </span>
                    {v.active && (
                      <span className="rounded bg-brand/20 px-1 text-[10px] text-brand">当前</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/40">
                    强度 {v.intensity} · {new Date(v.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                  </div>
                </button>
                {i < versions.length - 1 && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3 shrink-0 text-white/30" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
        {/* 对比模式提示 + 回滚 */}
        {compareMode && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-[11px]">
            <span className="text-white/50">
              {comparePicked.size === 0 ? "请选择 2 个版本进行对比" : comparePicked.size === 1 ? "已选 1 个,再选 1 个" : `已选 ${comparePicked.size} 个,展示左右 diff`}
            </span>
            {comparePicked.size === 2 && (
              <button
                type="button"
                onClick={() => {
                  const ids = Array.from(comparePicked);
                  const target = versions.find((v) => v.id === ids[0]) || versions.find((v) => v.id === ids[1]);
                  if (target) handleRollback(target);
                }}
                className="rounded-md bg-amber-500/15 px-2 py-1 text-amber-400 hover:bg-amber-500/20"
              >
                回滚到选中版本
              </button>
            )}
          </div>
        )}
        {/* 非对比模式下的单版本回滚 */}
        {!compareMode && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const target = versions.find((v) => v.id === selectedVersion);
                if (target) handleRollback(target);
              }}
              className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-white/60 hover:bg-white/[0.1]"
            >
              回滚到此版本
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#141414] p-4 ring-1 ring-white/[0.06]">
          <p className="text-[11px] text-white/40">改写片段</p>
          <p className="mt-1 text-[20px] font-semibold text-white tabular-nums">{diffs.length}</p>
        </div>
        <div className="rounded-xl bg-[#141414] p-4 ring-1 ring-white/[0.06]">
          <p className="text-[11px] text-white/40">净增字数</p>
          <p className="mt-1 text-[20px] font-semibold text-brand tabular-nums">+{totalDelta}</p>
        </div>
        <div className="rounded-xl bg-[#141414] p-4 ring-1 ring-white/[0.06]">
          <p className="text-[11px] text-white/40">已采纳</p>
          <p className="mt-1 text-[20px] font-semibold text-white tabular-nums">{acceptedCount}/{diffs.length}</p>
        </div>
      </div>

      {/* Diff list */}
      <div className="space-y-3">
        {diffs.map((diff) => {
          const accepted = acceptedDiffs.has(diff.id);
          return (
            <div
              key={diff.id}
              className={cn(
                "rounded-xl bg-[#141414] p-5 ring-1 transition-colors",
                accepted ? "ring-brand/40" : "ring-white/[0.06]"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-white/80">{diff.scene}</span>
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px]", diff.delta > 0 ? "bg-brand/15 text-brand" : "bg-white/10 text-white/60")}>
                    {diff.delta > 0 ? `+${diff.delta}` : diff.delta} 字
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAccept(diff.id)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[11px] font-medium transition-colors",
                    accepted ? "bg-brand text-black" : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                  )}
                >
                  {accepted ? "✓ 已采纳" : "采纳"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="mb-1.5 text-[11px] text-white/40">原文</p>
                  <p className="text-[13px] leading-relaxed text-white/60">{diff.original}</p>
                </div>
                <div className={cn("rounded-lg p-3 ring-1", accepted ? "bg-brand/10 ring-brand/30" : "bg-brand/5 ring-brand/20")}>
                  <p className="mb-1.5 text-[11px] text-brand">改稿</p>
                  <p className="text-[13px] leading-relaxed text-white/85">{diff.revised}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-white/40">💡 {diff.reason}</p>
            </div>
          );
        })}
      </div>

      {/* Bulk actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setAcceptedDiffs(new Set(diffs.map((d) => d.id)))}
          className="flex-1 rounded-xl bg-brand py-2.5 text-[13px] font-bold text-black transition-all hover:brightness-110 active:scale-[0.98]"
        >
          全部采纳 ({diffs.length})
        </button>
        <button
          type="button"
          onClick={() => setAcceptedDiffs(new Set())}
          className="flex-1 rounded-xl bg-white/[0.06] py-2.5 text-[13px] text-white/70 transition-colors hover:bg-white/[0.1]"
        >
          清空选择
        </button>
      </div>

      {/* 回滚确认 dialog */}
      {rollbackTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rollback-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setRollbackTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#1a1a1a] p-5 ring-1 ring-white/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="rollback-title" className="text-[15px] font-semibold text-white">
              回滚到「{rollbackTarget.label}」
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-white/60">
              此操作将丢弃当前版本之后的所有改动,且不可恢复。回滚将消耗 5 积分。
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={confirmRollback}
                className="flex-1 rounded-xl bg-brand py-2 text-[13px] font-bold text-black hover:brightness-110"
              >
                确认回滚
              </button>
              <button
                type="button"
                onClick={() => setRollbackTarget(null)}
                className="flex-1 rounded-xl bg-white/[0.06] py-2 text-[13px] text-white/70 hover:bg-white/[0.1]"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Breakdown tab (分镜表) ──────────────────────────────────────────────────

function BreakdownTab({ project }: { project: ReturnType<typeof getProject> }) {
  const isFailed = project?.status === "failed" || project?.agent?.kind === "breakdown" && !!project?.agent?.failedReason;
  const agent = project?.agent;

  // 失败状态卡 + 重试
  if (isFailed && agent?.failedReason) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-red-500/10 p-5 ring-1 ring-red-500/20">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-medium text-red-400">拉片任务失败</h3>
              <p className="mt-1 text-[12px] text-red-300/80">{agent.failedReason}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-white/50">
                <span>任务进度 {agent.progress}%</span>
                <span>·</span>
                <span>已处理 {agent.steps.filter((s) => s.status === "done").length}/{agent.steps.length} 步</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => alert("已触发重试,预计消耗 2000 积分\n失败不扣费,成功后扣除")}
                  className="rounded-xl bg-brand px-4 py-2 text-[12px] font-bold text-black transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  重试任务
                </button>
                <button
                  type="button"
                  onClick={() => alert("已放弃此任务,可在项目列表中删除")}
                  className="rounded-xl bg-white/[0.06] px-4 py-2 text-[12px] text-white/70 hover:bg-white/[0.1]"
                >
                  放弃
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project?.breakdown) {
    return (
      <div className="rounded-xl bg-[#141414] p-10 text-center ring-1 ring-white/[0.06]">
        <FilmIcon className="mx-auto size-8 text-white/20" />
        <p className="mt-3 text-[14px] text-white/40">暂无分镜数据</p>
        <button className="mt-4 rounded-full bg-brand px-5 py-2 text-[13px] font-bold text-black">
          开始拉片
        </button>
      </div>
    );
  }

  const { breakdown } = project;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-medium text-white">{breakdown.videoTitle}</h3>
            <p className="mt-0.5 text-[12px] text-white/40">时长 {breakdown.duration} · {breakdown.shots.length} 个镜头</p>
          </div>
          <button
            type="button"
            onClick={() => alert("导出将生成 Fountain + CSV 文件")}
            className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.1]"
          >
            导出分镜表
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-[#141414] ring-1 ring-white/[0.06]">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-white/[0.06] bg-white/[0.02]">
            <tr>
              <th className="px-4 py-3 text-[11px] font-medium text-white/40">时间</th>
              <th className="px-4 py-3 text-[11px] font-medium text-white/40">场景</th>
              <th className="px-4 py-3 text-[11px] font-medium text-white/40">动作</th>
              <th className="px-4 py-3 text-[11px] font-medium text-white/40">运镜</th>
              <th className="px-4 py-3 text-[11px] font-medium text-white/40">对白</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {breakdown.shots.map((shot) => (
              <tr key={shot.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 text-[12px] tabular-nums text-brand">{shot.time}</td>
                <td className="whitespace-nowrap px-4 py-3 text-white/80">{shot.scene}</td>
                <td className="px-4 py-3 text-white/70">{shot.action}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-white/50">{shot.camera || "—"}</td>
                <td className="px-4 py-3 text-[12px] text-white/60">{shot.dialog || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssetsTab() {
  const assets = [
    { type: "character", label: "林策", desc: "男主 · 商业精英" },
    { type: "character", label: "沈幼微", desc: "女主 · 神秘身份" },
    { type: "scene", label: "凯撒大堂", desc: "凌晨 · 雨夜" },
    { type: "scene", label: "顶层公寓", desc: "白天 · 明亮" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {assets.map((a) => (
        <div key={a.label} className="rounded-xl bg-[#141414] p-4 ring-1 ring-white/[0.06]">
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-white/[0.06]">
            {a.type === "character" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 text-white/60" aria-hidden="true">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 text-white/60" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18" />
              </svg>
            )}
          </div>
          <div className="text-[13px] font-medium text-white">{a.label}</div>
          <div className="mt-0.5 text-[11px] text-white/40">{a.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ─── References tab（引用列表，跨模块数据流动）─────────────────────────────────

const TYPE_LABEL_REF: Record<StoredReference["type"], string> = {
  hotwork: "爆款",
  novel: "网文",
  trend: "热点",
  ai_answer: "AI 回答",
  user_file: "用户文件",
};

function ReferencesTab() {
  const { references, count, remove, clear } = useReferences();

  if (count === 0) {
    return (
      <div className="rounded-xl bg-[#141414] p-10 text-center ring-1 ring-white/[0.06]">
        <FileTextIcon className="mx-auto size-8 text-white/20" />
        <p className="mt-3 text-[14px] text-white/40">暂无引用</p>
        <p className="mt-1 text-[12px] text-white/30">
          前往 <a href="/plaza" className="text-brand hover:underline">广场</a> 或与 AI 助手对话，将内容加入引用
        </p>
      </div>
    );
  }

  // 导出为 Markdown
  const handleExport = () => {
    const md = references
      .map((r) => {
        const meta = getEvidenceMeta(r.evidenceType);
        return `## ${r.title}\n\n- 类型：${TYPE_LABEL_REF[r.type]}\n- 证据等级：${meta.label}\n- 来源：${r.fromPage}\n- 添加时间：${new Date(r.addedAt).toLocaleString("zh-CN")}${r.summary ? `\n\n> ${r.summary}` : ""}${r.sourceUrl ? `\n\n[查看原文](${r.sourceUrl})` : ""}`;
      })
      .join("\n\n---\n\n");
    try {
      const blob = new Blob([`# 引用清单\n\n${md}`], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `references-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("[references-tab] export failed", e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-xl bg-[#141414] p-4 ring-1 ring-white/[0.06]">
        <div>
          <h3 className="text-[14px] font-medium text-white">引用清单</h3>
          <p className="mt-0.5 text-[12px] text-white/40">
            共 <span className="text-brand tabular-nums">{count}</span> 条引用 · 来自广场、AI 助手等
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.1]"
          >
            导出 Markdown
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`确定清空 ${count} 条引用？此操作不可恢复`)) clear();
            }}
            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-[12px] text-red-400 transition-colors hover:bg-red-500/20"
          >
            清空
          </button>
        </div>
      </div>

      {/* References list */}
      <div className="space-y-3">
        {references.map((r) => {
          const meta = getEvidenceMeta(r.evidenceType);
          return (
            <div
              key={`${r.type}-${r.id}`}
              className="rounded-xl bg-[#141414] p-4 ring-1 ring-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                      {TYPE_LABEL_REF[r.type]}
                    </span>
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", meta.color)}>
                      {meta.label}
                    </span>
                  </div>
                  <h4 className="mt-2 text-[14px] font-medium text-white">{r.title}</h4>
                  {r.summary && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/55">
                      {r.summary}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/35">
                    <span>来源：{r.fromPage}</span>
                    <span>· {new Date(r.addedAt).toLocaleString("zh-CN")}</span>
                    {r.sourceUrl && (
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        查看原文 →
                      </a>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(r.type, r.id)}
                  aria-label={`移除引用 ${r.title}`}
                  className="shrink-0 rounded-lg bg-white/[0.04] p-1.5 text-white/40 transition-colors hover:bg-red-500/15 hover:text-red-400"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page content ──────────────────────────────────────────────────────

function ProjectDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("tab") || "overview") as ProjectTab;
  const [activeTab, setActiveTab] = useState<ProjectTab>(tab);
  const [shareOpen, setShareOpen] = useState(false);
  const id = params.id;

  // Loop C: 评估→改稿闭环,从 URL 参数读取 driven issues
  const fromParam = searchParams.get("from");
  const issuesParam = searchParams.get("issues");
  const initialDriven: { dimension: string; text: string }[] = useMemo(() => {
    if (fromParam !== "evaluation" || !issuesParam) return [];
    try {
      const parsed = JSON.parse(decodeURIComponent(issuesParam));
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("[driven-issues] parse failed", e);
    }
    return [];
  }, [fromParam, issuesParam]);
  const [drivenIssues, setDrivenIssues] = useState(initialDriven);

  const project = getProject(id);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-[16px] text-white/60">项目不存在</p>
          <p className="mt-2 text-[13px] text-white/40">ID: {id}</p>
        </div>
      </div>
    );
  }

  // 驱动改稿:把 issues 写入 URL + 切换到 rewrite tab
  const handleDriveRewrite = (issues: { dimension: string; text: string }[]) => {
    setDrivenIssues(issues);
    const encoded = encodeURIComponent(JSON.stringify(issues));
    router.replace(`/project/${id}?tab=rewrite&from=evaluation&issues=${encoded}`);
    setActiveTab("rewrite");
  };

  const handleClearDriven = () => {
    setDrivenIssues([]);
    router.replace(`/project/${id}?tab=rewrite`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-brand/10 px-2 py-1 text-[11px] font-medium text-brand">
              {typeLabel(project.type)}
            </span>
            <h1 className="text-[18px] font-medium text-white">{project.title}</h1>
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/50">
              {statusLabel(project.status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.1]"
            >
              <ShareIcon className="size-4" />
              分享
            </button>
            <button className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.1]">
              重命名
            </button>
            <button className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.1]">
              归档
            </button>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="shrink-0 border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "relative px-4 py-3 text-[13px] font-medium transition-colors",
                activeTab === t.id
                  ? "text-brand"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              {t.label}
              {activeTab === t.id && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-[1000px]">
          {/* Loop C: Agent 状态面板,当项目有 agent 且非完成状态时置顶显示 */}
          {project.agent && project.agent.progress < 100 && (
            <div className="mb-4">
              <AgentStatusPanel
                agent={project.agent}
                onRetry={
                  project.agent.kind === "breakdown" && project.status === "failed"
                    ? () => alert("已触发重试,预计消耗 2000 积分\n失败不扣费,成功后扣除")
                    : undefined
                }
              />
            </div>
          )}

          {activeTab === "overview" && <OverviewTab project={project} />}
          {activeTab === "script" && <ScriptTab />}
          {activeTab === "evaluation" && (
            <EvaluationTab project={project} onDriveRewrite={handleDriveRewrite} />
          )}
          {activeTab === "rewrite" && (
            <RewriteTab
              project={project}
              drivenIssues={drivenIssues}
              onClearDriven={handleClearDriven}
            />
          )}
          {activeTab === "assets" && <AssetsTab />}
          {activeTab === "breakdown" && <BreakdownTab project={project} />}
          {activeTab === "references" && <ReferencesTab />}
        </div>
      </div>

      <ShareDialog
        projectId={id}
        projectTitle={project.title}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-10 text-center text-white/40">加载中…</div>}>
        <ProjectDetailContent />
      </Suspense>
    </AppShell>
  );
}
