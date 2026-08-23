"use client";

import {
  ChevronDownIcon,
  MoreIcon,
  PlayIcon,
  RefreshCwIcon,
  SparkleIcon,
} from "@/components/icons";
import type { ShotCard } from "@/hooks/use-remake-studio";
import { StatusBadge } from "./status-badge";

interface StoryboardStepProps {
  activeEpisode: number;
  onEpisodeChange: (ep: number) => void;
  shots: ShotCard[];
  onGenerateShot: (id: string) => void;
  onRetryShot: (id: string) => void;
  onBatchGenerate: () => void;
  onPromptChange: (id: string, prompt: string) => void;
  onNext: () => void;
}

export function StoryboardStep({
  activeEpisode,
  onEpisodeChange,
  shots,
  onGenerateShot,
  onRetryShot,
  onBatchGenerate,
  onPromptChange,
  onNext,
}: StoryboardStepProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06] backdrop-blur-md">
          {[1, 2, 3].map((ep) => (
            <button
              key={ep}
              type="button"
              onClick={() => onEpisodeChange(ep)}
              aria-pressed={activeEpisode === ep}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
                activeEpisode === ep
                  ? "bg-brand text-brand-foreground"
                  : "text-white/60 hover:text-white"
              }`}
            >
              第 {ep} 集
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onBatchGenerate}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-4 py-1.5 text-[12px] font-semibold transition-colors hover:bg-brand-hover"
        >
          <SparkleIcon className="size-3.5" />
          批量生成分镜
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {shots.map((shot) => (
          <article
            key={shot.id}
            className="rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] backdrop-blur-sm p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[12px] font-semibold text-brand">
                  分镜 {String(shot.index).padStart(2, "0")}
                </span>
                <StatusBadge status={shot.status} />
              </div>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="更多操作"
              >
                <MoreIcon className="size-3.5" />
              </button>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-white/70">
              {shot.description}
            </p>

            {/* 三要素引用 */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {shot.characterRefs.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[11px] text-brand"
                >
                  @{c}
                </span>
              ))}
              {shot.sceneRefs.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-info/10 px-1.5 py-0.5 text-[11px] text-info"
                >
                  #{s}
                </span>
              ))}
              {shot.propRefs.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-info/10 px-1.5 py-0.5 text-[11px] text-info"
                >
                  ${p}
                </span>
              ))}
            </div>

            {/* 提示词 textarea */}
            <textarea
              value={shot.prompt}
              onChange={(e) => onPromptChange(shot.id, e.target.value)}
              rows={3}
              placeholder="输入分镜提示词..."
              className="mt-3 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] leading-relaxed text-white/80 placeholder:text-white/30 focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/30"
            />

            {/* 已生成预览 */}
            {shot.preview && (
              <div className="relative mt-3 aspect-video overflow-hidden rounded-lg ring-1 ring-white/[0.06]">
                <img
                  src={shot.preview}
                  alt={`分镜 ${shot.index} 预览`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <PlayIcon className="size-8 text-white" />
                </div>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80"
                >
                  对比原视频
                </button>
              </div>
            )}

            {/* 底部操作 */}
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  Seedance-2.0
                  <ChevronDownIcon className="size-3" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  11s
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (shot.status === "生成中") return;
                  if (shot.status === "失败") {
                    onRetryShot(shot.id);
                  } else {
                    onGenerateShot(shot.id);
                  }
                }}
                disabled={shot.status === "生成中"}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  shot.status === "生成中"
                    ? "cursor-wait bg-white/[0.06] text-white/40"
                    : shot.status === "已生成"
                      ? "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
                      : shot.status === "失败"
                        ? "bg-danger/10 text-danger ring-1 ring-danger/30 hover:bg-danger/20"
                        : "bg-brand text-brand-foreground hover:bg-brand-hover"
                }`}
              >
                {shot.status === "生成中" ? (
                  <>生成中...</>
                ) : shot.status === "已生成" ? (
                  <>重新生成</>
                ) : shot.status === "失败" ? (
                  <>
                    <RefreshCwIcon className="size-3" />
                    重试
                  </>
                ) : (
                  <>
                    <SparkleIcon className="size-3" />
                    +1650 生成
                  </>
                )}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-6 py-2.5 text-[13px] font-semibold transition-colors hover:bg-brand-hover"
        >
          进入下一步
          <ChevronDownIcon className="size-3.5 -rotate-90" />
        </button>
      </div>
    </div>
  );
}
