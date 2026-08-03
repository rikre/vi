"use client";

import type { Episode } from "@/lib/mock-projects";
import { CheckIcon, FolderOpenIcon } from "@/components/icons";

export function EpisodeGrid({
  episodes,
  onMarkAllDone,
}: {
  episodes: Episode[];
  onMarkAllDone: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
            <FolderOpenIcon className="size-4" />
          </span>
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/70">
            剧集
          </h3>
        </div>
        <button
          type="button"
          onClick={onMarkAllDone}
          className="flex items-center gap-1 rounded-full bg-brand/15 px-3 py-1 text-[11px] font-semibold text-brand ring-1 ring-brand/25 transition-colors hover:bg-brand/25"
        >
          <CheckIcon className="size-3" />
          全部完成
        </button>
      </div>

      <div className="rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] backdrop-blur-sm">
        {episodes.length === 0 ? (
          <p className="text-[13px] text-white/40">暂无剧集</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {episodes.map((ep) => {
              const pct = Math.max(0, Math.min(100, ep.progress));
              const isDone = pct >= 100 || ep.status === "已完成";
              const isInProgress = !isDone && pct > 0;

              const cardRing = isDone
                ? "ring-brand/40 bg-brand/[0.06]"
                : isInProgress
                ? "ring-white/30 bg-white/[0.02] animate-[pulse_2s_ease-in-out_infinite]"
                : "ring-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:ring-white/20";

              return (
                <div
                  key={ep.id}
                  className={`group cursor-pointer rounded-xl p-3 ring-1 transition-all duration-200 ${cardRing}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-white">
                      第 {ep.number} 集
                    </span>
                    {isDone ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-brand text-black">
                        <CheckIcon className="size-3" />
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={`h-full rounded-full ${
                        isDone
                          ? "bg-brand"
                          : isInProgress
                          ? "bg-white/60"
                          : "bg-white/20"
                      }`}
                      style={{ width: `${isDone ? 100 : pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span
                      className={`text-[11px] ${
                        isDone
                          ? "text-brand"
                          : isInProgress
                          ? "text-white/70"
                          : "text-white/40"
                      }`}
                    >
                      {isDone ? "已完成" : isInProgress ? `${pct}%` : "未开始"}
                    </span>
                    <span className="text-[10px] text-white/20">
                      {isDone ? <CheckIcon className="size-3" /> : null}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
