"use client";

import { ZoomInIcon, ZoomOutIcon } from "@/components/icons";
import { OUTPUT_TRACK, SOURCE_TRACK } from "@/hooks/use-remake-studio";

interface CompareTimelineProps {
  syncTimeline: boolean;
  onSyncTimelineChange: (v: boolean) => void;
}

export function CompareTimeline({
  syncTimeline,
  onSyncTimelineChange,
}: CompareTimelineProps) {
  return (
    <div className="rounded-2xl bg-[#1b1b1b]/90 ring-1 ring-white/10 backdrop-blur-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium text-white/80">时间轴</span>
        <label className="inline-flex items-center gap-2 text-[12px] text-white/60">
          <button
            type="button"
            role="switch"
            aria-checked={syncTimeline}
            onClick={() => onSyncTimelineChange(!syncTimeline)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              syncTimeline ? "bg-brand" : "bg-white/[0.1]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                syncTimeline ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          同步时间轴
        </label>
      </div>

      {/* 原片轨 */}
      <div className="mb-3">
        <div className="mb-1.5 text-[11px] text-white/40">原片</div>
        <div className="flex gap-1 overflow-hidden">
          {SOURCE_TRACK.map((t) => (
            <div
              key={t.id}
              className="aspect-video h-12 shrink-0 overflow-hidden rounded ring-1 ring-white/[0.06]"
            >
              <img
                src={t.thumbnail}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 成片轨 */}
      <div>
        <div className="mb-1.5 text-[11px] text-white/40">成片</div>
        <div className="flex gap-1">
          {OUTPUT_TRACK.map((t) => (
            <div
              key={t.id}
              className="flex h-12 flex-1 flex-col justify-center rounded bg-brand/[0.06] px-2 ring-1 ring-brand/20"
            >
              <span className="text-[11px] font-medium text-brand">
                {t.name}
              </span>
              <span className="text-[10px] text-white/40">{t.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 缩放 */}
      <div className="mt-3 flex items-center justify-end gap-1">
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="缩小时间轴"
        >
          <ZoomOutIcon className="size-3.5" />
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="放大时间轴"
        >
          <ZoomInIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
