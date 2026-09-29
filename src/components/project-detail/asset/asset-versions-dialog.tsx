"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssetItem } from "@/hooks/use-asset-manager";
import {
  CloseIcon,
  CheckIcon,
  TrashIcon,
  LayersIcon,
  LayoutGridIcon,
  SparkleIcon,
} from "@/components/icons";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

// ─── 通用弹窗外壳 ──────────────────────────────────────────────────────────

function DialogShell({
  label,
  title,
  Icon,
  onClose,
  children,
  wide,
}: {
  label: string;
  title: string;
  Icon: typeof LayersIcon;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] shadow-2xl ${
          wide ? "max-w-[720px]" : "max-w-[560px]"
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="size-4" />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold text-white">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>
        <div className="overflow-y-auto p-5 no-scrollbar">{children}</div>
      </div>
    </div>
  );
}

// ─── 版本管理弹窗 ──────────────────────────────────────────────────────────

export function AssetVersionsDialog({
  asset,
  onClose,
  onSwitch,
  onDelete,
  onCopy,
}: {
  asset: AssetItem;
  onClose: () => void;
  onSwitch: (versionId: string) => void;
  onDelete: (versionId: string) => void;
  onCopy: (versionId: string) => void;
}) {
  const versions = asset.versions ?? [];

  return (
    <DialogShell label="版本管理" title={`版本管理 · ${asset.name}`} Icon={LayersIcon} onClose={onClose}>
      {/* 用量统计 */}
      <div className="mb-4 flex items-center gap-4 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.06]">
        <span className="text-[12px] text-white/50">
          当前版本 <b className="text-white">V{versions.length || 1}</b>
        </span>
        <span className="h-3 w-px bg-white/10" />
        <span className="text-[12px] text-white/50">
          历史版本 <b className="text-white">{Math.max(0, versions.length - 1)}</b>
        </span>
        <span className="h-3 w-px bg-white/10" />
        <span className="text-[12px] text-white/50">
          被引用 <b className="text-brand">{asset.usage ?? 0}</b> 次
        </span>
      </div>

      {versions.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-white/35">
          暂无版本记录，生成或重新生成后将自动留存版本
        </p>
      ) : (
        <ul className="space-y-2.5">
          {versions.map((v, i) => {
            const isCurrent = i === 0;
            return (
              <li
                key={v.id}
                className={`group flex items-center gap-3 rounded-xl p-2.5 ring-1 transition-colors ${
                  isCurrent
                    ? "bg-brand/[0.06] ring-brand/30"
                    : "bg-white/[0.02] ring-white/[0.06] hover:bg-white/[0.04]"
                }`}
              >
                <img
                  src={txi(v.prompt, "square")}
                  alt={`版本 ${versions.length - i}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-white">
                      V{versions.length - i}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium text-brand">
                        <CheckIcon className="size-2.5" />
                        当前版本
                      </span>
                    )}
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/50">
                      {v.source}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-white/40">{v.createdAt}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {!isCurrent && (
                    <>
                      <button
                        type="button"
                        onClick={() => onSwitch(v.id)}
                        className="rounded-lg bg-brand/15 px-2.5 py-1.5 text-[11px] font-medium text-brand transition-colors hover:bg-brand hover:text-black"
                      >
                        设为当前
                      </button>
                      <button
                        type="button"
                        onClick={() => onCopy(v.id)}
                        aria-label="复制版本"
                        title="一键复制"
                        className="flex size-7 items-center justify-center rounded-lg bg-white/[0.06] text-white/60 transition-colors hover:bg-white/[0.12] hover:text-white"
                      >
                        <LayersIcon className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(v.id)}
                        aria-label="删除版本"
                        title="删除版本"
                        className="flex size-7 items-center justify-center rounded-lg bg-white/[0.06] text-white/60 transition-colors hover:bg-danger/80 hover:text-white"
                      >
                        <TrashIcon className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DialogShell>
  );
}

// ─── 九宫格生成与选图 ──────────────────────────────────────────────────────

const GRID_VARIANTS = [
  "front view, neutral pose",
  "three-quarter view, dynamic pose",
  "side profile, dramatic rim light",
  "close-up portrait, soft light",
  "full body action shot",
  "low angle hero shot",
  "high angle overview",
  "back view, silhouette light",
  "studio lighting, clean background",
];

export function GridSelectDialog({
  asset,
  onClose,
  onPick,
}: {
  asset: AssetItem;
  onClose: () => void;
  onPick: (prompt: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());

  const cells = useMemo(
    () =>
      GRID_VARIANTS.map((variant, i) => ({
        prompt: `${asset.prompt}, ${variant}, variation ${i + 1}`,
        variant,
      })),
    [asset.prompt],
  );

  return (
    <DialogShell
      label="九宫格选图"
      title={`九宫格生成 · ${asset.name}`}
      Icon={LayoutGridIcon}
      onClose={onClose}
      wide
    >
      <p className="mb-4 text-[12px] text-white/50">
        基于当前提示词一次生成 9 张候选图，点击选中后「使用该图」将保存为新版本。
      </p>

      <div className="grid grid-cols-3 gap-2">
        {cells.map((cell, i) => {
          const isSel = selected === i;
          const isLoaded = loaded.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(isSel ? null : i)}
              aria-label={`候选图 ${i + 1}：${cell.variant}`}
              aria-pressed={isSel}
              className={`group relative aspect-square overflow-hidden rounded-xl ring-2 transition-all ${
                isSel
                  ? "ring-brand shadow-lg shadow-brand/20"
                  : "ring-transparent hover:ring-white/25"
              }`}
            >
              {!isLoaded && (
                <span className="absolute inset-0 animate-pulse bg-white/[0.05]" />
              )}
              <img
                src={txi(cell.prompt, "square")}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setLoaded((prev) => new Set(prev).add(i))}
                className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
              {isSel && (
                <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-brand text-black shadow-md">
                  <CheckIcon className="size-3.5" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4 text-left text-[10px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                {cell.variant}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/15 px-4 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          取消
        </button>
        <button
          type="button"
          disabled={selected === null}
          onClick={() => {
            if (selected === null) return;
            onPick(cells[selected].prompt);
            onClose();
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[12px] font-bold text-black transition-all hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SparkleIcon className="size-3.5" />
          使用该图
        </button>
      </div>
    </DialogShell>
  );
}
