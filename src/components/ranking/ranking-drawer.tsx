"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon, PlusIcon, CloseIcon } from "@/components/icons";
import {
  HOT_WORKS,
  NOVEL_TRENDS,
  TREND_SIGNALS,
} from "@/lib/plaza-data";
import type { HotWork, NovelTrend, TrendSignal } from "@/types/plaza";
import { addReference } from "@/lib/reference-store";

// ─── Tab 配置 ────────────────────────────────────────────────────────────────

const RANKING_TABS: { id: string; label: string }[] = [
  { id: "ranking", label: "短剧爆款榜" },
  { id: "novel", label: "网文风向标" },
  { id: "trending", label: "热点信号" },
];

type RankingTab = (typeof RANKING_TABS)[number]["id"];

// ─── 公共引用按钮 ────────────────────────────────────────────────────────────

function ReferenceButton({
  onClick,
  label = "引用",
}: {
  onClick: () => boolean;
  label?: string;
}) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (added) return;
        const ok = onClick();
        if (ok) setAdded(true);
      }}
      aria-label={`添加为引用 ${label}`}
      title={added ? "已添加为引用" : "添加为引用"}
      className={cn(
        "flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-semibold backdrop-blur transition-all",
        added
          ? "bg-brand/20 text-brand ring-1 ring-brand/40"
          : "bg-black/55 text-white/80 hover:bg-brand/15 hover:text-brand ring-1 ring-white/10"
      )}
    >
      <PlusIcon className="size-3" />
      {added ? "已引用" : "引用"}
    </button>
  );
}

// pushRef wrapper 已移除 — 直接调用 addReference，避免无意义的额外层

// ─── 短剧爆款榜卡片 ────────────────────────────────────────────────────────

const RANK_COLORS: Record<number, string> = {
  1: "text-[#D4FF3F] bg-brand/15 ring-brand/30",
  2: "text-white bg-white/15 ring-white/30",
  3: "text-[#fb923c] bg-[#fb923c]/15 ring-[#fb923c]/30",
};

function HotWorkCard({ work }: { work: HotWork }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20">
      <div className="flex gap-4 p-4">
        <div
          className={cn(
            "flex h-12 w-10 shrink-0 items-center justify-center rounded-lg text-[20px] font-black ring-1",
            RANK_COLORS[work.rank] || "text-white/60 bg-white/[0.06] ring-white/10"
          )}
        >
          {work.rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-[15px] font-bold text-white">{work.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-white/55">
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5">{work.source}</span>
                <span>{work.episodes}集</span>
                <span>· {work.audience}</span>
                <span>· {work.background}</span>
              </div>
            </div>
            <ReferenceButton
              onClick={() =>
                addReference({
                  type: "hotwork",
                  id: work.id,
                  title: work.title,
                  evidenceType: "real_data",
                  addedAt: new Date().toISOString(),
                  fromPage: "/ranking?tab=ranking",
                  summary: work.synopsis,
                  sourceUrl: work.sourceUrl,
                })
              }
            />
          </div>

          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/55">
            {work.synopsis}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {work.setting.map((s) => (
              <span
                key={s}
                className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand/90"
              >
                {s}
              </span>
            ))}
            {work.theme.map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/55"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-white/35">
            <span>上新：{work.launchAt}</span>
            <a
              href={work.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/55 hover:text-brand"
            >
              查看来源 →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── 网文风向标卡片 ────────────────────────────────────────────────────────

function PotentialBar({ score }: { score: number }) {
  const color =
    score >= 88
      ? "bg-brand"
      : score >= 80
      ? "bg-[#7dffe6]"
      : "bg-[#fb923c]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-white/80">{score}</span>
    </div>
  );
}

function NovelTrendCard({ novel }: { novel: NovelTrend }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[12px] font-black text-white/70 ring-1 ring-white/10">
              {novel.rank}
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-[14px] font-bold text-white">{novel.title}</h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-white/50">
                <span>{novel.author}</span>
                <span>· {novel.type}</span>
                <span>· {novel.words}</span>
              </div>
            </div>
          </div>
          <ReferenceButton
            onClick={() =>
              addReference({
                type: "novel",
                id: novel.id,
                title: novel.title,
                evidenceType: "market_estimate",
                addedAt: new Date().toISOString(),
                fromPage: "/ranking?tab=novel",
                summary: novel.synopsis,
                sourceUrl: novel.sourceUrl,
              })
            }
          />
        </div>

        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/55">
          {novel.synopsis}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <div className="text-white/40">改编潜力</div>
            <div className="mt-1">
              <PotentialBar score={novel.adaptationPotential} />
            </div>
          </div>
          <div>
            <div className="text-white/40">适合模式</div>
            <div className="mt-1 font-semibold text-white/80">{novel.suitableMode}</div>
          </div>
          <div>
            <div className="text-white/40">推荐集数</div>
            <div className="mt-1 font-semibold text-white/80">{novel.recommendedEpisodes}集</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-white/35">
          <span>来源：{novel.source}</span>
          <a
            href={novel.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/55 hover:text-brand"
          >
            查看来源 →
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── 热点信号卡片 ────────────────────────────────────────────────────────

const RISK_META: Record<TrendSignal["riskLevel"], { label: string; cls: string }> = {
  low: { label: "低风险", cls: "bg-[#7dffe6]/15 text-[#7dffe6] ring-[#7dffe6]/30" },
  medium: { label: "中风险", cls: "bg-[#facc15]/15 text-[#facc15] ring-[#facc15]/30" },
  high: { label: "高风险", cls: "bg-[#fb923c]/15 text-[#fb923c] ring-[#fb923c]/30" },
};

function TrendSignalCard({ signal }: { signal: TrendSignal }) {
  const risk = RISK_META[signal.riskLevel];
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-1 text-[14px] font-bold text-white">{signal.title}</h3>
              <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1", risk.cls)}>
                {risk.label}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-white/50">
              <span>来源：{signal.source}</span>
              <span>· 热度 {signal.heatScore}</span>
              <span>· 增速 +{signal.growthRate}%</span>
            </div>
          </div>
          <ReferenceButton
            onClick={() =>
              addReference({
                type: "trend",
                id: signal.id,
                title: signal.title,
                evidenceType: "real_data",
                addedAt: new Date().toISOString(),
                fromPage: "/ranking?tab=trending",
                summary: signal.adaptationAdvice,
                sourceUrl: signal.sourceUrl,
              })
            }
          />
        </div>

        <div className="mt-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06]">
          <p className="text-[10px] font-medium text-white/40">创作转化建议</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/75">
            {signal.adaptationAdvice}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {signal.emotions.map((e) => (
            <span
              key={e}
              className="rounded-md bg-[#fb923c]/10 px-1.5 py-0.5 text-[10px] text-[#fb923c]/90"
            >
              #{e}
            </span>
          ))}
          {signal.narrativeThemes.map((n) => (
            <span
              key={n}
              className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/55"
            >
              #{n}
            </span>
          ))}
        </div>

        {signal.riskNote && (
          <p className="mt-2 text-[10px] text-white/35">⚠ {signal.riskNote}</p>
        )}

        <div className="mt-2 flex items-center justify-between text-[10px] text-white/35">
          <span>采集：{signal.capturedAt}</span>
          {signal.sourceUrl && (
            <a
              href={signal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/55 hover:text-brand"
            >
              查看来源 →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── 空状态 ────────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-3 text-3xl text-white/30">🔍</div>
      <p className="text-[15px] font-medium text-white/70">没有找到相关内容</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 rounded-lg bg-white/[0.06] px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
      >
        清空搜索
      </button>
    </div>
  );
}

// ─── 主组件：榜单大抽屉 ────────────────────────────────────────────────────────

export interface RankingDrawerProps {
  open: boolean;
  onClose: () => void;
  initialTab?: RankingTab;
}

export function RankingDrawer({ open, onClose, initialTab = "ranking" }: RankingDrawerProps) {
  const [activeTab, setActiveTab] = useState<RankingTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [rankFilter, setRankFilter] = useState<"all" | "男频" | "女频">("all");
  const [novelFilter, setNovelFilter] = useState<"all" | "实拍" | "AIGC">("all");
  const [trendFilter, setTrendFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // 打开时同步 initialTab
  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 焦点管理：打开时聚焦，关闭时恢复
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      const t = setTimeout(() => {
        const first = drawerRef.current?.querySelector<HTMLElement>(
          "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
        );
        first?.focus();
      }, 50);
      return () => clearTimeout(t);
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus();
      previouslyFocused.current = null;
    }
  }, [open]);

  // 焦点陷阱
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const filteredHotWorks = useMemo(() => {
    let list = HOT_WORKS;
    if (rankFilter !== "all") list = list.filter((w) => w.audience === rankFilter);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q)) ||
          w.theme.some((t) => t.toLowerCase().includes(q)) ||
          w.setting.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [rankFilter, searchQuery]);

  const filteredNovels = useMemo(() => {
    let list = NOVEL_TRENDS;
    if (novelFilter !== "all") list = list.filter((n) => n.suitableMode === novelFilter);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [novelFilter, searchQuery]);

  const filteredTrends = useMemo(() => {
    let list = TREND_SIGNALS;
    if (trendFilter !== "all") list = list.filter((t) => t.riskLevel === trendFilter);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.emotions.some((e) => e.toLowerCase().includes(q)) ||
          t.narrativeThemes.some((n) => n.toLowerCase().includes(q))
      );
    }
    return list;
  }, [trendFilter, searchQuery]);

  const searchPlaceholder = useMemo(() => {
    switch (activeTab) {
      case "ranking":
        return "搜索爆款剧名、标签、主题、设定...";
      case "novel":
        return "搜索网文书名、作者、类型...";
      case "trending":
        return "搜索热点标题、情绪、叙事主题...";
    }
  }, [activeTab]);

  return (
    <>
      {/* 遮罩 — 始终渲染，靠 opacity 过渡 */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* 抽屉 — 全屏覆盖式大弹框，靠 opacity + translate 过渡 */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="数据榜单"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 flex h-screen flex-col bg-[#0a0a0a] shadow-2xl transition-all duration-300",
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"
        )}
      >
        {/* 顶栏 */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/15 text-brand ring-1 ring-brand/30">
              <SearchIcon className="size-4" />
            </span>
            <div>
              <h2 className="text-[16px] font-bold text-white">数据榜单</h2>
              <p className="text-[11px] text-white/40">
                爆款榜 · 网文风向 · 热点信号 · 一键引用到创作
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭榜单"
            className="flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        {/* Tabs + 搜索 + 筛选 */}
        <div className="shrink-0 border-b border-white/[0.06] px-4 pt-4 sm:px-6">
          <div role="tablist" aria-label="榜单分类" className="flex items-center gap-1 overflow-x-auto pb-1">
            {RANKING_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`ranking-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`ranking-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                  setRankFilter("all");
                  setNovelFilter("all");
                  setTrendFilter("all");
                }}
                className={cn(
                  "relative shrink-0 px-4 py-2.5 text-[14px] font-semibold transition-colors",
                  activeTab === tab.id ? "text-white" : "text-white/45 hover:text-white/75"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 py-3">
            {/* 搜索 */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                <SearchIcon className="size-[18px]" />
              </div>
              <input
                type="text"
                aria-label="搜索榜单"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-xl border-0 bg-white/[0.06] pl-11 pr-4 text-[14px] text-white placeholder:text-white/40 transition-all focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* 二级筛选 */}
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-white/40">筛选：</span>
              {activeTab === "ranking" &&
                (["all", "男频", "女频"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setRankFilter(v)}
                    className={cn(
                      "rounded-md px-2.5 py-1 transition-colors",
                      rankFilter === v
                        ? "bg-brand text-black"
                        : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]"
                    )}
                  >
                    {v === "all" ? "全部" : v}
                  </button>
                ))}
              {activeTab === "novel" &&
                (["all", "实拍", "AIGC"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setNovelFilter(v)}
                    className={cn(
                      "rounded-md px-2.5 py-1 transition-colors",
                      novelFilter === v
                        ? "bg-brand text-black"
                        : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]"
                    )}
                  >
                    {v === "all" ? "全部" : v}
                  </button>
                ))}
              {activeTab === "trending" &&
                (["all", "low", "medium", "high"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTrendFilter(v)}
                    className={cn(
                      "rounded-md px-2.5 py-1 transition-colors",
                      trendFilter === v
                        ? "bg-brand text-black"
                        : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]"
                    )}
                  >
                    {v === "all" ? "全部" : v === "low" ? "低风险" : v === "medium" ? "中风险" : "高风险"}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* 内容滚动区 */}
        <div
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
          role="tabpanel"
          id={`ranking-panel-${activeTab}`}
          aria-labelledby={`ranking-tab-${activeTab}`}
          tabIndex={0}
        >
          {activeTab === "ranking" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredHotWorks.length === 0 ? (
                <EmptyState onClear={() => setSearchQuery("")} />
              ) : (
                filteredHotWorks.map((w) => <HotWorkCard key={w.id} work={w} />)
              )}
            </div>
          )}

          {activeTab === "novel" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredNovels.length === 0 ? (
                <EmptyState onClear={() => setSearchQuery("")} />
              ) : (
                filteredNovels.map((n) => <NovelTrendCard key={n.id} novel={n} />)
              )}
            </div>
          )}

          {activeTab === "trending" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredTrends.length === 0 ? (
                <EmptyState onClear={() => setSearchQuery("")} />
              ) : (
                filteredTrends.map((t) => <TrendSignalCard key={t.id} signal={t} />)
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
