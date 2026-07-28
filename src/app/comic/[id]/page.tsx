"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Workbench } from "@/components/project-detail/workbench";
import { getProjectById } from "@/lib/mock-projects";
import { FolderIcon, ChevronLeftIcon } from "@/components/icons";
import Link from "next/link";

// ─── 旧详情页样式（剧本类型项目用） ────────────────────────────────────────
// 剧本类型项目仍走简化详情页（无工作台）
import type { ScriptProject } from "@/lib/mock-projects";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

function ScriptProjectDetail({ project }: { project: ScriptProject }) {
  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="mx-auto max-w-[960px] px-6 pb-10 pt-[40px]">
        {/* 面包屑 */}
        <div className="mb-6 flex items-center gap-2 text-[13px]">
          <Link
            href="/comic"
            className="flex items-center gap-1 text-white/40 transition-colors hover:text-white/70"
          >
            <ChevronLeftIcon className="size-3.5" />
            项目列表
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">{project.title}</span>
        </div>

        {/* 信息头 */}
        <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <h1 className="text-[28px] font-bold leading-tight text-white">
              {project.title}
            </h1>
            <span className="rounded-md bg-brand/15 px-2.5 py-1 text-[12px] font-semibold text-brand">
              {project.rating}
            </span>
          </div>
          <p className="mb-4 text-[14px] leading-relaxed text-white/60">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/[0.04] px-2.5 py-1 text-[12px] text-white/70">
              {project.scriptType}
            </span>
            <span className="rounded-md bg-white/[0.04] px-2.5 py-1 text-[12px] text-white/70">
              {project.status}
            </span>
            {project.score !== null && (
              <span className="rounded-md bg-white/[0.04] px-2.5 py-1 text-[12px] text-white/70">
                评分 {project.score}
              </span>
            )}
            <span className="text-[12px] text-white/40">
              · 修改于 {project.updatedAt}
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 评估信息卡 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[12px] text-white/40">评级</p>
            <p className="mt-2 text-[24px] font-bold text-brand">
              {project.rating}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[12px] text-white/40">评分</p>
            <p className="mt-2 text-[24px] font-bold text-white">
              {project.score ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[12px] text-white/40">状态</p>
            <p className="mt-2 text-[14px] font-semibold text-white">
              {project.status}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[12px] text-white/40">类型</p>
            <p className="mt-2 text-[14px] font-semibold text-white">
              {project.scriptType}
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            查看评估报告
          </button>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-[14px] text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            编辑
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params?.id);

  const project = useMemo(
    () => (Number.isFinite(projectId) ? getProjectById(projectId) : undefined),
    [projectId]
  );

  if (!project) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
            <FolderIcon className="size-8" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-white/80">
              项目不存在
            </p>
            <p className="mt-1 text-[13px] text-white/40">
              项目可能已被删除或 ID 错误
            </p>
          </div>
          <Link
            href="/comic"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            <ChevronLeftIcon className="size-4" />
            返回项目列表
          </Link>
        </div>
      </AppShell>
    );
  }

  // 剧本类型项目走简化详情页
  if (project.type === "script") {
    return (
      <AppShell>
        <ScriptProjectDetail project={project} />
      </AppShell>
    );
  }

  // 短剧项目走工作台
  return (
    <AppShell>
      <Workbench project={project} />
    </AppShell>
  );
}
