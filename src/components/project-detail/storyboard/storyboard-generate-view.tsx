"use client";

import type { ShotItem } from "@/lib/mock-projects";
import {
  PlusIcon,
  SparkleIcon,
  PlayIcon,
  VideoCameraIcon,
  ImageIcon,
  CheckIcon,
} from "@/components/icons";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

export function StoryboardGenerateView({
  shots,
  prompts,
  onPromptChange,
  onAddShot,
  onGenerateShot,
  onBatchGenerate,
}: {
  shots: ShotItem[];
  prompts: Record<string, string>;
  onPromptChange: (id: string, value: string) => void;
  onAddShot: () => void;
  onGenerateShot: (id: string) => void;
  onBatchGenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {shots.map((shot) => (
          <ShotGenerateCard
            key={shot.id}
            shot={shot}
            prompt={prompts[shot.id] ?? shot.prompt}
            onPromptChange={onPromptChange}
            onGenerateShot={onGenerateShot}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAddShot}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2 text-[12px] text-white/50 transition-all hover:border-brand/40 hover:bg-brand/[0.04] hover:text-brand"
        >
          <PlusIcon className="size-3.5" />
          新增分镜
        </button>
        <button
          type="button"
          onClick={onBatchGenerate}
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
        >
          <SparkleIcon className="size-3.5" />
          批量生成视频
        </button>
      </div>
    </div>
  );
}

function ShotGenerateCard({
  shot,
  prompt,
  onPromptChange,
  onGenerateShot,
}: {
  shot: ShotItem;
  prompt: string;
  onPromptChange: (id: string, value: string) => void;
  onGenerateShot: (id: string) => void;
}) {
  const isDone = shot.status === "已生成";
  const previewPrompt =
    prompt || shot.description || `cinematic shot ${shot.index}, ${shot.scene}`;

  return (
    <article className="overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-colors hover:ring-white/20">
      <div className="relative aspect-video overflow-hidden">
        {isDone ? (
          <img
            src={txi(previewPrompt, "landscape_16_9")}
            alt={`分镜 ${shot.index} 预览`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-white/[0.02] text-white/40">
            <ImageIcon className="size-7" />
            <span className="text-[11px]">未生成预览</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          <VideoCameraIcon className="size-3" />
          分镜 {String(shot.index).padStart(2, "0")}
        </div>

        {isDone && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-medium text-brand ring-1 ring-brand/30 backdrop-blur-sm">
            <CheckIcon className="size-3" />
            已生成
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40">
            分镜描述
          </label>
          <textarea
            defaultValue={shot.description}
            rows={2}
            className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/80 outline-none transition-colors placeholder:text-white/30 focus:border-brand/40 focus:ring-1 focus:ring-brand/30"
            placeholder="描述分镜画面"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40">
            生成提示词
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(shot.id, e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/80 outline-none transition-colors placeholder:text-white/30 focus:border-brand/40 focus:ring-1 focus:ring-brand/30"
            placeholder="使用 @ 引用角色、场景、道具"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {shot.characters.length === 0 ? (
            <span className="text-[11px] text-white/30">未指定角色</span>
          ) : (
            shot.characters.map((c) => (
              <span
                key={c}
                className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand"
              >
                @{c}
              </span>
            ))
          )}
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
            #{shot.scene}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[11px] text-white/40">
            {shot.duration}
          </span>
          <button
            type="button"
            onClick={() => onGenerateShot(shot.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              isDone
                ? "border border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                : "bg-brand text-black shadow-lg shadow-brand/20 hover:bg-brand-hover"
            }`}
          >
            {isDone ? (
              <>
                <PlayIcon className="size-3" />
                重新生成
              </>
            ) : (
              <>
                <SparkleIcon className="size-3.5" />
                生成视频
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
