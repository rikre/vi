"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  EditIcon,
  TrashIcon,
  FolderIcon,
  ScriptIcon,
  LayersIcon,
  RefreshCwIcon,
  CheckIcon,
} from "@/components/icons";
import type { ShortDramaProject } from "@/lib/mock-projects";
import { getSubTabs } from "@/lib/mock-projects";
import type { ProjectSubTab } from "@/types/project";
import OverviewTab from "./overview-tab";
import ScriptTab from "./script-tab";
import AssetTab from "./asset-tab";
import StoryboardTab from "./storyboard-tab";
import FilmTab from "./film-tab";
import RemakeStudio from "./remake-studio";

const MODE_META: Record<
  ShortDramaProject["mode"],
  { label: string; Icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  剧本模式: { label: "剧本模式", Icon: ScriptIcon, accent: "text-brand" },
  自由模式: { label: "自由模式", Icon: LayersIcon, accent: "text-info" },
  AI重绘: { label: "AI重绘", Icon: RefreshCwIcon, accent: "text-info" },
};

interface WorkbenchProps {
  project: ShortDramaProject;
}

export function Workbench({ project }: WorkbenchProps) {
  // 所有 hooks 必须在条件返回之前调用（Rules of Hooks）
  const subTabs = useMemo(() => getSubTabs(project.mode), [project.mode]);
  const [activeTab, setActiveTab] = useState<ProjectSubTab>("概览");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(project.title);

  const modeMeta = MODE_META[project.mode];

  const txi = (prompt: string, size: string) =>
    `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      prompt,
    )}&image_size=${size}`;

  // AI重绘走独立 4 步 Stepper
  if (project.mode === "AI重绘") {
    return <RemakeStudio project={project} />;
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      {/* 宇宙背景（与创作空间同源） */}
      <div className="relative" aria-hidden>
        <img
          src={txi(
            "dark cosmic accretion disk swirl, glowing golden orange light flare on the left, deep black space on the right, cinematic, ultra detailed, no text",
            "square",
          )}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_18%_40%,rgba(255,150,60,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-[#0a0a0a]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 pb-10 pt-[40px]">
        {/* Header */}
        <header className="mb-8">
          {/* 面包屑 + 返回 */}
          <div className="mb-4 flex items-center gap-2 text-[13px]">
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

          {/* 项目标题 + 模式 badge + 操作 */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-10 min-w-[300px] rounded-full border border-white/[0.2] bg-white/[0.1] px-4 text-[24px] font-bold text-white outline-none transition-colors focus:border-brand/60 focus:ring-1 focus:ring-brand/30"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-bold text-black shadow-lg shadow-brand/20 transition-all hover:brightness-110"
                  >
                    <CheckIcon className="size-3.5" />
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(project.title);
                      setIsEditingName(false);
                    }}
                    className="flex h-9 items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white/70 transition-colors hover:bg-white/[0.08]"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgba(255,255,255,0.12)]">
                    {project.title}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    aria-label="编辑项目名"
                    className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <EditIcon className="size-3.5" />
                  </button>
                </div>
              )}
              <div className="mt-2 flex items-center gap-3">
                {/* 模式 badge：与创作空间子 tab 渐变一致 */}
                <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] px-3 py-1 text-[12px] font-bold text-black shadow-lg shadow-brand/20">
                  <modeMeta.Icon className="size-3.5" />
                  {modeMeta.label}
                </span>
                <span className="text-[12px] text-white/40">
                  {project.episodes} 集 · 创建于 {project.createdAt}
                </span>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand ring-1 ring-brand/20">
                  {project.tag}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/[0.08]"
              >
                <FolderIcon className="size-3.5" />
                进入工作台
              </button>
              <button
                type="button"
                aria-label="删除项目"
                className="flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60 backdrop-blur-sm transition-colors hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 子 Tab 导航 — 胶囊式（与创作空间主模式切换一致） */}
        <nav
          role="tablist"
          aria-label="项目功能导航"
          className="mb-8 flex w-fit items-center gap-1 rounded-full bg-white/15 p-1 ring-1 ring-white/10 backdrop-blur-md"
        >
          {subTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-[14px] font-semibold transition-all ${
                  isActive
                    ? "bg-white text-black shadow"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Tab 内容 */}
        <div role="tabpanel">
          {activeTab === "概览" && <OverviewTab project={project} />}
          {activeTab === "剧本" && <ScriptTab project={project} />}
          {activeTab === "资产" && <AssetTab project={project} />}
          {activeTab === "分镜" && <StoryboardTab project={project} />}
          {activeTab === "成片" && <FilmTab project={project} />}
        </div>
      </div>
    </div>
  );
}
