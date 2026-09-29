"use client";

import type { AssetType, AssetItem } from "@/hooks/use-asset-manager";
import {
  MicrophoneIcon,
  PlayIcon,
  UploadIcon,
  CheckIcon,
  RefreshCwIcon,
  TrashIcon,
  LayersIcon,
  LayoutGridIcon,
} from "@/components/icons";

// ─── 图片生成（与 comic/[id]/page.tsx 同源） ─────────────────────────────────

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

const TYPE_BADGE: Record<AssetType, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
};

// ─── AssetCard ─────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: AssetItem;
  onOpenVoice: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onOpenVersions: () => void;
  onOpenGrid: () => void;
}

export function AssetCard({
  asset,
  onOpenVoice,
  onRegenerate,
  onDelete,
  onOpenVersions,
  onOpenGrid,
}: AssetCardProps) {
  const isCharacter = asset.type === "character";
  const isDone = asset.status === "已生成";
  const isRunning = asset.status === "生成中";
  const versionCount = asset.versions?.length ?? 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
      {/* 封面图 */}
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={txi(asset.prompt, "square")}
          alt={asset.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            isDone ? "" : "opacity-60"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* 左上：类型角标 */}
        <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
          {TYPE_BADGE[asset.type]}
        </div>

        {/* 左下：版本标签（已生成且有版本记录） */}
        {isDone && versionCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenVersions();
            }}
            className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-brand hover:text-black"
            aria-label="查看版本"
          >
            <LayersIcon className="size-2.5" />
            V{versionCount}
          </button>
        )}

        {/* 右上：状态点 */}
        <div
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ${
            isDone
              ? "bg-brand/20 text-brand"
              : isRunning
                ? "bg-warning/20 text-warning"
                : "bg-white/[0.08] text-white/60"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isDone
                ? "bg-brand"
                : isRunning
                  ? "bg-warning"
                  : "bg-white/40"
            } ${isRunning ? "animate-pulse" : ""}`}
          />
          {asset.status}
        </div>

        {/* 已生成标记（右下角） */}
        {isDone && (
          <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <CheckIcon className="size-3.5" />
          </div>
        )}

        {/* 已生成卡片 hover 工具条（覆盖图片底部） */}
        {isDone && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/85 via-black/60 to-transparent p-2 pt-6 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGrid();
                }}
                aria-label="九宫格生成选图"
                title="九宫格生成选图"
                className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-brand hover:text-black"
              >
                <LayoutGridIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVersions();
                }}
                aria-label="版本管理"
                title="版本管理"
                className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-brand hover:text-black"
              >
                <LayersIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
                aria-label="重新生成"
                className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-brand hover:text-black"
              >
                <RefreshCwIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="删除"
                className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-danger/80 hover:text-white"
              >
                <TrashIcon className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 资产信息 */}
      <div className="space-y-2 p-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h5 className="truncate text-[14px] font-semibold text-white">
              {asset.name}
            </h5>
            {isDone && (
              <span className="shrink-0 text-[10px] text-white/35">
                引用 {asset.usage ?? 0}
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-white/50">
            {asset.description}
          </p>
        </div>

        {/* 角色卡：音色绑定 */}
        {isCharacter && (
          <div className="pt-1">
            {asset.voice ? (
              <button
                type="button"
                onClick={onOpenVoice}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-brand/20 bg-brand/[0.06] px-2.5 py-1.5 text-[12px] text-brand transition-colors hover:bg-brand/[0.1]"
              >
                <span className="flex items-center gap-1.5">
                  <MicrophoneIcon className="size-3.5" />
                  <span className="font-medium">{asset.voice}</span>
                </span>
                <PlayIcon className="size-3" />
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={onOpenVoice}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/70 transition-colors hover:border-brand/30 hover:text-brand"
                >
                  <MicrophoneIcon className="size-3.5" />
                  选择音色
                </button>
                <button
                  type="button"
                  aria-label="上传音频"
                  className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/70 transition-colors hover:border-brand/30 hover:text-brand"
                >
                  <UploadIcon className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
