"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  InfoIcon,
  MicrophoneIcon,
  MoreIcon,
  PlusIcon,
  SparkleIcon,
  TrashIcon,
} from "@/components/icons";
import {
  ASSET_CATEGORIES,
  type AssetCategory,
  type AssetMapping,
} from "@/hooks/use-remake-studio";
import { StatusBadge } from "./status-badge";

interface MappingStepProps {
  assetCategory: AssetCategory;
  onCategoryChange: (c: AssetCategory) => void;
  mappings: AssetMapping[];
  onAdd: () => void;
  onBatchGenerate: () => void;
  onRemove: (id: string) => void;
  onNext: () => void;
}

export function MappingStep({
  assetCategory,
  onCategoryChange,
  mappings,
  onAdd,
  onBatchGenerate,
  onRemove,
  onNext,
}: MappingStepProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleRemove = (id: string, name: string) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除映射「${name}」？`)) {
      return;
    }
    onRemove(id);
    setOpenMenuId(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-start gap-2.5 rounded-2xl bg-brand/[0.06] ring-1 ring-brand/20 backdrop-blur-sm px-4 py-3 text-[13px] text-white/70">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>
          请完成新旧角色、场景、道具映射关系；确认替换关系后，系统将自动对原视频进行智能切片并提取关键帧对应，用于后续分镜生成。
        </span>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06]">
          {ASSET_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              aria-pressed={assetCategory === c}
              className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${
                assetCategory === c
                  ? "bg-brand text-brand-foreground"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-[12px] text-white/50">
            形象总计 {mappings.length} · 已解析{" "}
            {mappings.filter((m) => m.status === "已完成").length}
          </span>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <PlusIcon className="size-3.5" />
            添加{assetCategory}
          </button>
          <button
            type="button"
            onClick={onBatchGenerate}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-4 py-1.5 text-[12px] font-semibold transition-colors hover:bg-brand-hover"
          >
            <SparkleIcon className="size-3.5" />
            批量生成
          </button>
        </div>
      </div>

      {mappings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-dashed ring-white/[0.08] py-16 text-center">
          <div className="mb-2 text-[15px] font-medium text-white/60">
            暂无{assetCategory}映射
          </div>
          <div className="text-[12px] text-white/30">
            点击右上角「添加{assetCategory}」开始创建映射
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mappings.map((m) => (
            <article
              key={m.id}
              className="rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] backdrop-blur-sm p-5"
            >
              <div className="flex items-center gap-4">
                {/* A 资产（旧） */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <div className="aspect-square w-full overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
                      <img
                        src={m.sourceImage}
                        alt={m.sourceName}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
                      旧
                    </span>
                  </div>
                  <div className="mt-2 truncate text-center text-[13px] font-medium text-white/70">
                    {m.sourceName}
                  </div>
                </div>

                {/* 箭头 */}
                <div className="flex shrink-0 flex-col items-center gap-1 text-white/30">
                  <span className="text-[18px]">→</span>
                </div>

                {/* B 资产（新） */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <div className="aspect-square w-full overflow-hidden rounded-xl ring-1 ring-brand/20">
                      <img
                        src={m.targetImage}
                        alt={m.targetName}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="absolute left-2 top-2 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-foreground">
                      新
                    </span>
                    {m.variantCount && (
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
                        {m.variantCount} 套变装
                      </span>
                    )}
                  </div>
                  <div className="mt-2 truncate text-center text-[13px] font-medium text-white">
                    {m.targetName}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <StatusBadge status={m.status} />
                <div className="flex items-center gap-2">
                  {m.voice && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      <MicrophoneIcon className="size-3" />
                      音色 · {m.voice}
                    </button>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(openMenuId === m.id ? null : m.id)
                      }
                      className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                      aria-label="更多操作"
                      aria-expanded={openMenuId === m.id}
                    >
                      <MoreIcon className="size-3.5" />
                    </button>
                    {openMenuId === m.id && (
                      <div
                        role="menu"
                        className="absolute right-0 top-9 z-10 w-32 rounded-lg bg-[#1a1a1a] py-1 ring-1 ring-white/[0.08] shadow-xl"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleRemove(m.id, m.targetName)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-danger transition-colors hover:bg-white/[0.04]"
                        >
                          <TrashIcon className="size-3.5" />
                          删除映射
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

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
