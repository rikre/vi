"use client";

import {
  ChevronDownIcon,
  InfoIcon,
  PlayIcon,
  RefreshCwIcon,
} from "@/components/icons";
import type { SourceEpisode } from "@/hooks/use-remake-studio";
import { StatusBadge } from "./status-badge";

interface SourceStepProps {
  episodes: SourceEpisode[];
  onRetry: (id: string) => void;
  onNext: () => void;
}

export function SourceStep({ episodes, onRetry, onNext }: SourceStepProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-start gap-2.5 rounded-2xl bg-brand/[0.06] ring-1 ring-brand/20 backdrop-blur-sm px-4 py-3 text-[13px] text-white/70">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>
          确认剧集视频后，系统将对原视频进行资产解析，提取主要的人物、场景、道具资产，用于后续替换。
        </span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-white">原片剧集</h2>
        <div className="flex items-center gap-4 text-[12px] text-white/50">
          <span>全部剧集 {episodes.length}</span>
          <span>
            已上传 {episodes.filter((e) => e.status === "已完成").length}
          </span>
          <span>
            上传中 {episodes.filter((e) => e.status === "上传中").length}
          </span>
          <span>
            上传失败 {episodes.filter((e) => e.status === "失败").length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {episodes.map((ep, i) => (
          <div
            key={ep.id}
            className="flex items-center gap-4 rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] backdrop-blur-sm p-4"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.06]">
              <img
                src={ep.thumbnail}
                alt={ep.fileName}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                <PlayIcon className="size-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-white/40">
                  第 {i + 1} 集
                </span>
                <span className="text-white/20">·</span>
                <span className="truncate text-[13px] text-white/80">
                  {ep.fileName}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-4 text-[12px] text-white/40">
                <span>时长 {ep.duration}</span>
                <span>大小 {ep.size}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={ep.status} />
              {ep.status === "失败" && (
                <button
                  type="button"
                  onClick={() => onRetry(ep.id)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-brand transition-colors hover:bg-brand/10"
                >
                  <RefreshCwIcon className="size-3.5" />
                  重试
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-6 py-2.5 text-[13px] font-semibold transition-colors hover:bg-brand-hover"
        >
          开始解析资产
          <ChevronDownIcon className="size-3.5 -rotate-90" />
        </button>
      </div>
    </div>
  );
}
