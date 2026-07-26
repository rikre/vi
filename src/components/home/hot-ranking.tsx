"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@/components/icons";

interface Genre {
  name: string;
  percent: string;
}

interface RankingData {
  title: string;
  date: string;
  trend: string;
  trendDir: "up" | "down";
  hotCount: string;
  newCount: string;
  genres: Genre[];
  href: string;
}

const RANKING_DATA: RankingData[] = [
  {
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
    href: "/ranking/hongguo",
  },
  {
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
    href: "/ranking/overseas",
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
      className={cn("size-5", dir === "down" ? "rotate-0" : "rotate-180")}
    >
      <path d="M7 7l10 10" />
      <path d="M17 9v8h-8" />
    </svg>
  );
}

function RankingCard({ data }: { data: RankingData }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.08] transition-all duration-300 hover:ring-white/15">
      {/* warm ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_80%_50%,rgba(212,255,63,0.15),transparent_70%)]"
      />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-white">{data.title}</h2>
          <span className="text-[11px] text-white/40">{data.date}</span>
        </div>
        <Link
          href={data.href}
          className="flex items-center gap-0.5 text-[11px] text-white/45 transition-colors hover:text-white/85"
        >
          查看更多
          <ChevronRightIcon className="size-3" />
        </Link>
      </div>

      {/* Main content — single row */}
      <div className="relative mt-4 flex items-center gap-5">
        {/* Trend */}
        <div className="flex items-center gap-2">
          <span className="text-[32px] font-extrabold leading-none text-brand tabular-nums">
            {data.trend}
          </span>
          <span className="text-brand">
            <TrendArrow dir={data.trendDir} />
          </span>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/[0.08]" />

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[17px] font-bold text-white tabular-nums">
              {data.hotCount}
              <span className="ml-0.5 text-[11px] font-normal text-white/50">部</span>
            </span>
            <span className="text-[10px] text-white/40">热剧</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold text-white tabular-nums">
              {data.newCount}
              <span className="ml-0.5 text-[11px] font-normal text-white/50">部</span>
            </span>
            <span className="text-[10px] text-white/40">新晋</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/[0.08]" />

        {/* Genres */}
        <div className="flex items-center gap-3">
          {data.genres.map((g) => (
            <div key={g.name} className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-brand">{g.name}</span>
              <span className="text-[10px] text-white/40">{g.percent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HotRanking() {
  return (
    <section className="mt-8">
      <div className="flex gap-4">
        {RANKING_DATA.map((data) => (
          <RankingCard key={data.title} data={data} />
        ))}
      </div>
    </section>
  );
}
