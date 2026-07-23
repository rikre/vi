"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectGrid } from "@/components/project/project-grid";
import { TrashIcon, SearchIcon, PlusIcon } from "@/components/icons";

const PROJECT_TABS = [
  { id: "all", label: "全部项目" },
  { id: "favorite", label: "我的收藏" },
  { id: "draft", label: "草稿箱" },
  { id: "completed", label: "已完成" },
];

const PROJECTS = [
  {
    id: 1,
    title: "我的第一部动画短片",
    updatedAt: "3 天前",
    status: "completed" as const,
    duration: "1:24",
    favorite: true,
  },
  {
    id: 2,
    title: "世界杯精彩瞬间混剪",
    updatedAt: "1 周前",
    status: "processing" as const,
    duration: "0:45",
    favorite: false,
  },
  {
    id: 3,
    title: "萌宠日常第一集",
    updatedAt: "2 周前",
    status: "completed" as const,
    duration: "2:10",
    favorite: true,
  },
  {
    id: 4,
    title: "水果拟人化短剧",
    updatedAt: "3 周前",
    status: "draft" as const,
    favorite: false,
  },
  {
    id: 5,
    title: "赛博朋克冒险",
    updatedAt: "1 个月前",
    status: "completed" as const,
    duration: "3:05",
    favorite: true,
  },
  {
    id: 6,
    title: "古风仙侠爱情故事",
    updatedAt: "1 个月前",
    status: "completed" as const,
    duration: "1:58",
    favorite: false,
  },
  {
    id: 7,
    title: "校园搞笑日常",
    updatedAt: "2 个月前",
    status: "draft" as const,
    favorite: false,
  },
  {
    id: 8,
    title: "魔法少女变身动画",
    updatedAt: "2 个月前",
    status: "completed" as const,
    duration: "0:32",
    favorite: false,
  },
];

export default function ProjectPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = PROJECTS.filter((project) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "favorite" && project.favorite) ||
      project.status === activeTab;
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        <div className="mt-8 flex items-center justify-between pt-2 pb-6">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
              我的项目
            </h1>
            <p className="mt-2 text-[14px] text-white/50">
              管理和继续创作你的动画项目
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl bg-white/[0.08] px-4 text-[14px] font-medium text-white transition-all hover:bg-white/[0.12]"
              aria-label="回收站"
            >
              <TrashIcon className="size-4" />
              回收站
            </button>
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20"
              aria-label="进入创作"
            >
              <PlusIcon className="size-4" />
              进入创作
            </button>
          </div>
        </div>

        <nav aria-label="项目筛选" className="mb-5 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {PROJECT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "flex h-9 shrink-0 items-center rounded-xl bg-white/[0.1] px-4 text-[14px] font-medium text-white"
                  : "flex h-9 shrink-0 items-center rounded-xl px-4 text-[14px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="relative mb-6">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <SearchIcon className="size-[18px]" />
          </div>
          <input
            type="text"
            aria-label="搜索项目"
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border-0 bg-white/[0.06] pl-12 pr-4 text-[15px] text-white placeholder:text-white/40 transition-all focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
              <SearchIcon className="size-7" />
            </div>
            <p className="text-[15px] font-medium text-white/60">未找到匹配的项目</p>
            <p className="mt-1 text-[13px] text-white/40">尝试更换关键词或切换筛选条件</p>
          </div>
        ) : (
          <ProjectGrid projects={filteredProjects} />
        )}
      </div>
    </AppShell>
  );
}
