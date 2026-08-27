"use client";

import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@/components/icons";

interface Genre {
  name: string;
  percent: string;
}

export interface RankingData {
  id: string;
  title: string;
  date: string;
  trend: string;
  trendDir: "up" | "down";
  hotCount: string;
  newCount: string;
  genres: Genre[];
}

const RANKING_DATA: RankingData[] = [
  {
    id: "ranking",
    title: "红果热榜",
    date: "2026.07.23",
    trend: "7.8%",
    trendDir: "down",
    hotCount: "111",
    newCount: "12",
    genres: [
      { name: "现代", percent: "44%" },
      { name: "乡村", percent: "19%" },
      { name: "年代", percent: "18%" },
    ],
  },
  {
    id: "novel",
    title: "海外热榜",
    date: "2026.07.23",
    trend: "12.4%",
    trendDir: "up",
    hotCount: "86",
    newCount: "23",
    genres: [
      { name: "都市", percent: "38%" },
      { name: "甜宠", percent: "24%" },
      { name: "悬疑", percent: "15%" },
    ],
  },
];

function TrendArrow({ dir }: { dir: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-5", dir === "down" ? "rotate-0" : "rotate-180")}
    >
      <path d="M7 7l10 10" />
      <path d="M17 9v8h-8" />
    </svg>
  );
}

function RankingCard({ data, onMore }: { data: RankingData; onMore: () => void }) {
  return (
    <div className="card-base p-5">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-white">{data.title}</h2>
          <span className="text-[11px] text-white/40 tabular-nums">{data.date}</span>
        </div>
        <button
          type="button"
          onClick={onMore}
          aria-label={`查看更多 ${data.title}`}
          className="flex items-center gap-0.5 text-[11px] text-white/45 transition-colors hover:text-brand"
        >
          查看更多
          <ChevronRightIcon className="size-3" />
        </button>
      </div>

      {/* Main content — 移动端纵向堆叠 */}
      <div className="relative mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* Trend — 主焦点 */}
        <div className="flex items-center gap-2">
          <span className="text-[28px] font-extrabold leading-none text-brand tabular-nums">
            {data.trend}
          </span>
          <span className="text-brand">
            <TrendArrow dir={data.trendDir} />
          </span>
        </div>

        {/* Divider — 移动端隐藏 */}
        <div className="hidden h-10 w-px bg-white/[0.08] sm:block" />

        {/* Stats — 次级 */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-white tabular-nums">
              {data.hotCount}
              <span className="ml-0.5 text-[11px] font-normal text-white/50">部</span>
            </span>
            <span className="text-[10px] text-white/40">热剧</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-white tabular-nums">
              {data.newCount}
              <span className="ml-0.5 text-[11px] font-normal text-white/50">部</span>
            </span>
            <span className="text-[10px] text-white/40">新晋</span>
          </div>
        </div>

        {/* Divider — 移动端隐藏 */}
        <div className="hidden h-10 w-px bg-white/[0.08] sm:block" />

        {/* Genres — 第三级 */}
        <div className="flex items-center gap-3">
          {data.genres.map((g) => (
            <div key={g.name} className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-brand">{g.name}</span>
              <span className="text-[10px] text-white/40 tabular-nums">{g.percent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface HotRankingProps {
  onMore?: (id: string) => void;
}

export function HotRanking({ onMore }: HotRankingProps) {
  return (
    <section className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        {RANKING_DATA.map((data) => (
          <RankingCard
            key={data.id}
            data={data}
            onMore={() => onMore?.(data.id)}
          />
        ))}
      </div>
    </section>
  );
}
