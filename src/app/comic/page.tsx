"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  SearchIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";

// ─── Types ───────────────────────────────────────────────────────────────────

type ShortDramaProject = {
  id: number;
  type: "short";
  title: string;
  mode: "短片" | "剧本模式" | "自由模式";
  episodes: number;
  createdAt: string; // ISO date string for sorting/filtering
  updatedAt: string;
  coverPrompt: string;
};

type ScriptProject = {
  id: number;
  type: "script";
  title: string;
  scriptType: "剧本创作" | "网文改编" | "剧本改编" | "剧本评估" | "拉片剧本";
  status: string;
  rating: string;
  score: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dateStr: string;
};

type Project = ShortDramaProject | ScriptProject;

// ─── Data ────────────────────────────────────────────────────────────────────

const SHORT_DRAMA_PROJECTS: ShortDramaProject[] = [
  { id: 1, type: "short", title: "小福星", mode: "短片", episodes: 60, createdAt: "2026-07-24", updatedAt: "几秒前", coverPrompt: "cute anime baby celestial fairy tale, warm golden light, lime green accent" },
  { id: 2, type: "short", title: "我妈归来demo", mode: "剧本模式", episodes: 40, createdAt: "2026-07-23", updatedAt: "4小时前", coverPrompt: "drama scene mother return home, cinematic lighting, emotional moment" },
  { id: 3, type: "short", title: "清白入席", mode: "自由模式", episodes: 24, createdAt: "2026-07-20", updatedAt: "4天前", coverPrompt: "elegant dinner party scene, formal attire, dramatic lighting" },
  { id: 4, type: "short", title: "二哈项目", mode: "短片", episodes: 12, createdAt: "2026-07-18", updatedAt: "4天前", coverPrompt: "funny husky dog meme style, bright colors, comedy" },
  { id: 10, type: "short", title: "世界杯大乱斗", mode: "剧本模式", episodes: 36, createdAt: "2026-07-15", updatedAt: "1天前", coverPrompt: "epic football world cup stadium, dramatic lighting, sports anime" },
  { id: 11, type: "short", title: "都市修仙传", mode: "自由模式", episodes: 48, createdAt: "2026-07-10", updatedAt: "2天前", coverPrompt: "urban cultivation fantasy, modern city with mystical elements" },
];

const SCRIPT_PROJECTS: ScriptProject[] = [
  { id: 5, type: "script", title: "首富千金养成计划 评估", scriptType: "剧本评估", status: "评估完成", rating: "A", score: 81, tags: ["都市情感", "霸总甜宠", "复仇"], createdAt: "2026-05-17", updatedAt: "1周前", dateStr: "2026/5/17" },
  { id: 6, type: "script", title: "1_老", scriptType: "剧本创作", status: "评估完成", rating: "A", score: 83, tags: ["穿越", "脑洞", "反差喜剧"], createdAt: "2026-05-17", updatedAt: "1周前", dateStr: "2026/5/17" },
  { id: 7, type: "script", title: "拼好饭帝国 评估", scriptType: "剧本评估", status: "评估完成", rating: "A", score: 79, tags: ["都市", "创业", "喜剧"], createdAt: "2026-05-03", updatedAt: "3周前", dateStr: "2026/5/3" },
  { id: 8, type: "script", title: "网文改编-测试", scriptType: "网文改编", status: "待评估", rating: "—", score: null, tags: ["网文", "改编"], createdAt: "2026-05-10", updatedAt: "2周前", dateStr: "2026/5/10" },
  { id: 9, type: "script", title: "拉片剧本-样例", scriptType: "拉片剧本", status: "待评估", rating: "—", score: null, tags: ["拉片", "分析"], createdAt: "2026-07-21", updatedAt: "3天前", dateStr: "2026/7/21" },
  { id: 12, type: "script", title: "剧本改编-示例", scriptType: "剧本改编", status: "待评估", rating: "—", score: null, tags: ["改编", "测试"], createdAt: "2026-07-01", updatedAt: "5天前", dateStr: "2026/7/1" },
];

const ALL_PROJECTS: Project[] = [...SHORT_DRAMA_PROJECTS, ...SCRIPT_PROJECTS];

const MAIN_TABS = [
  { key: "short", label: "短剧" },
  { key: "script", label: "剧本" },
] as const;

type MainTabKey = (typeof MAIN_TABS)[number]["key"];

const SHORT_SUB_TABS = ["短片", "剧本模式", "自由模式"] as const;
const SCRIPT_SUB_TABS = ["剧本创作", "网文改编", "剧本改编", "剧本评估", "拉片剧本"] as const;

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ComicPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MainTabKey>("short");
  const [activeShortSubTab, setActiveShortSubTab] = useState<string | null>(null);
  const [activeScriptSubTab, setActiveScriptSubTab] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Filter projects
  const filteredProjects = useMemo(() => {
    let projects = ALL_PROJECTS;

    // Filter by main tab
    if (activeTab === "short") {
      projects = projects.filter((p) => p.type === "short");
      // Filter by short sub-tab
      if (activeShortSubTab) {
        projects = projects.filter(
          (p) => p.type === "short" && p.mode === activeShortSubTab
        );
      }
    } else if (activeTab === "script") {
      projects = projects.filter((p) => p.type === "script");
      // Filter by script sub-tab
      if (activeScriptSubTab) {
        projects = projects.filter(
          (p) => p.type === "script" && p.scriptType === activeScriptSubTab
        );
      }
    }

    // Filter by search
    if (searchQuery) {
      projects = projects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by createdAt
    projects = [...projects].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return projects;
  }, [activeTab, activeShortSubTab, activeScriptSubTab, searchQuery, sortBy]);

  const countFor = (key: MainTabKey) => {
    if (key === "short") return SHORT_DRAMA_PROJECTS.length;
    return SCRIPT_PROJECTS.length;
  };

  const handleTabChange = (tab: MainTabKey) => {
    setActiveTab(tab);
    // Reset sub-tabs when switching main tab
    setActiveShortSubTab(null);
    setActiveScriptSubTab(null);
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="px-6 pt-[56px]">
          {/* Header row */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[30px] font-bold leading-tight text-white">
              我的项目
            </h1>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <SearchIcon className="size-4" />
                </div>
                <input
                  type="search"
                  aria-label="搜索项目"
                  placeholder="搜索项目"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-[288px] rounded-lg border border-white/[0.2] bg-white/[0.1] py-2 pl-9 pr-9 text-[14px] text-white outline-none transition-colors placeholder:text-white/60 focus:border-brand"
                />
              </div>

              {/* Sort by createdAt */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
                className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.2] bg-white/[0.1] px-3 py-2 text-[14px] text-white transition-colors hover:bg-white/[0.12]"
              >
                {sortBy === "newest" ? "最新创建" : "最早创建"}
                <ChevronDownIcon className="size-3.5" />
              </button>

              {/* Recycle bin */}
              <button
                type="button"
                onClick={() => console.log("recycle bin")}
                className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.2] bg-white/[0.1] px-3 py-2 text-[14px] text-white transition-colors hover:bg-white/[0.12]"
              >
                <TrashIcon className="size-4" />
                回收站
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-1 border-b border-white/[0.06] pb-px">
            {MAIN_TABS.map((tab) => {
              const count = countFor(tab.key);
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative flex items-baseline gap-1.5 rounded-t-lg px-4 py-3 text-[15px] font-medium transition-colors ${
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[12px] font-normal ${
                      active ? "text-brand" : "text-white/30"
                    }`}
                  >
                    {count}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-brand" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Short drama sub-tabs */}
          {activeTab === "short" && (
            <div className="mt-4 flex items-center gap-2">
              {SHORT_SUB_TABS.map((sub) => {
                const active = activeShortSubTab === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveShortSubTab(active ? null : sub)}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                      active
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-white/[0.1] bg-white/[0.04] text-white/60 hover:border-white/[0.2] hover:text-white/90"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}

          {/* Script sub-tabs */}
          {activeTab === "script" && (
            <div className="mt-4 flex items-center gap-2">
              {SCRIPT_SUB_TABS.map((sub) => {
                const active = activeScriptSubTab === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveScriptSubTab(active ? null : sub)}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                      active
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-white/[0.1] bg-white/[0.04] text-white/60 hover:border-white/[0.2] hover:text-white/90"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grid */}
          <div className="pb-10 pt-[32px]">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
                  <SearchIcon className="size-7" />
                </div>
                <p className="text-[15px] font-medium text-white/60">
                  未找到匹配的项目
                </p>
                <p className="mt-1 text-[13px] text-white/40">
                  尝试更换关键词或创建新项目
                </p>
              </div>
            ) : (
              <div className="grid auto-rows-fr grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {/* Create new card */}
                <Link
                  href="/create"
                  className="group flex h-full min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.12] transition-colors hover:border-brand/40"
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-white/40 transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                    <PlusIcon className="size-6" />
                  </div>
                  <span className="text-[14px] text-white/40 transition-colors group-hover:text-white/70">
                    进入创作
                  </span>
                </Link>

                {filteredProjects.map((project) =>
                  project.type === "short" ? (
                    <ShortDramaCard key={project.id} project={project} />
                  ) : (
                    <ScriptCard key={project.id} project={project} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Short Drama Card (图一风格) ─────────────────────────────────────────────

function ShortDramaCard({ project }: { project: ShortDramaProject }) {
  return (
    <Link
      href={`/comic/${project.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] transition-all hover:border-white/[0.15]"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={`https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
            project.coverPrompt
          )}&image_size=landscape_4_3`}
          alt={project.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Mode badge — top left */}
        <div className="absolute left-2.5 top-2.5 rounded-md bg-brand/20 px-2 py-0.5 text-[11px] font-medium text-brand backdrop-blur-sm">
          {project.mode}
        </div>

        {/* Episodes badge — top right */}
        <div className="absolute right-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur-sm">
          {project.episodes} 集
        </div>
      </div>

      {/* Info */}
      <div className="px-3.5 py-3">
        <h3 className="truncate text-[15px] font-semibold text-white">
          {project.title}
        </h3>
        <p className="mt-1 text-[12px] text-white/40">{project.updatedAt}</p>
      </div>
    </Link>
  );
}

// ─── Script Card (图二风格) ───────────────────────────────────────────────────

function ScriptCard({ project }: { project: ScriptProject }) {
  const hasScore = project.score !== null;

  return (
    <Link
      href={`/comic/${project.id}`}
      className="group block rounded-2xl border border-white/[0.06] bg-[#141414] p-4 transition-all hover:border-white/[0.15]"
    >
      {/* Type + status badge */}
      <div className="flex items-center gap-1.5">
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] text-white/50">
          {project.scriptType}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] ${
            project.status === "评估完成"
              ? "bg-brand/15 text-brand"
              : "bg-white/[0.06] text-white/40"
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-white">
        {project.title}
      </h3>

      {/* Score row */}
      {hasScore ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
            <p className="text-[11px] text-white/40">剧本评级</p>
            <p className="mt-0.5 text-[20px] font-bold text-white">
              {project.rating}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
            <p className="text-[11px] text-white/40">潜力评分</p>
            <p className="mt-0.5 text-[20px] font-bold text-white">
              {project.score}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
          <p className="text-[11px] text-white/40">剧本评级</p>
          <p className="mt-0.5 text-[20px] font-bold text-white/30">—</p>
        </div>
      )}

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/40"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
        <span className="text-[12px] text-white/40">{project.updatedAt}</span>
        <span className="text-[12px] text-white/30">{project.dateStr}</span>
      </div>
    </Link>
  );
}
