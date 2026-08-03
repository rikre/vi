"use client";

import type { ShortDramaProject } from "@/lib/mock-projects";
import {
  PlusIcon,
  SparkleIcon,
  UserGroupIcon,
  SceneIcon,
  PropIcon,
  ChevronRightIcon,
} from "@/components/icons";
import VoiceSelectorDialog from "@/components/voice-selector-dialog";
import BatchGenerateDialog, {
  type BatchAsset,
} from "@/components/batch-generate-dialog";
import { useAssetManager, type AssetFilter } from "@/hooks/use-asset-manager";
import { AssetCard } from "./asset/asset-card";
import { ExtractProgressModal } from "./asset/extract-progress-modal";

const FILTER_LABELS: {
  key: AssetFilter;
  Icon: typeof UserGroupIcon;
}[] = [
  { key: "全部", Icon: SparkleIcon },
  { key: "角色", Icon: UserGroupIcon },
  { key: "场景", Icon: SceneIcon },
  { key: "道具", Icon: PropIcon },
];

export default function AssetTab({ project }: { project: ShortDramaProject }) {
  const {
    isScriptMode,
    isFreeMode,
    assets,
    extracted,
    filter,
    setFilter,
    voiceOpen,
    setVoiceOpen,
    voiceTarget,
    batchOpen,
    setBatchOpen,
    extractProgress,
    filteredAssets,
    stats,
    regenerateAsset,
    deleteAsset,
    batchGenerate,
    addAsset,
    extractAssets,
    openVoiceFor,
    handleVoiceSelect,
  } = useAssetManager(project);

  const batchAssets: BatchAsset[] = assets.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    status: a.status,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 顶部标题 + 操作 */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-semibold text-white">项目资产</h3>
          <p className="mt-1 text-[13px] text-white/50">
            {isFreeMode
              ? "自由模式下请手动创建角色、场景、道具和音色，用于后续分镜生成。"
              : isScriptMode
                ? extracted
                  ? "已从剧本中提取角色、场景和道具，可继续生成视觉资产。"
                  : "Agent 正在从剧本中提取角色、场景和道具，请稍候。"
                : "AI重绘模式：管理本项目所有视觉资产。"}
          </p>
        </div>
        <div className="flex gap-2">
          {isScriptMode && extracted && (
            <button
              type="button"
              onClick={() => setBatchOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-all hover:brightness-110"
            >
              <SparkleIcon className="size-3.5" />
              批量生成
            </button>
          )}
          <button
            type="button"
            onClick={addAsset}
            className="flex h-9 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 text-[12px] text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            <PlusIcon className="size-3.5" />
            新增资产
          </button>
        </div>
      </header>

      {/* 剧本模式未提取提示横幅 */}
      {isScriptMode && !extracted && (
        <div className="flex items-center justify-between rounded-xl border border-brand/30 bg-brand/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <SparkleIcon className="size-4" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">
                尚未从剧本提取资产
              </p>
              <p className="text-[12px] text-white/50">
                点击&ldquo;提取资产&rdquo;，Agent
                将解析剧本并生成角色、场景、道具。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={extractAssets}
            className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            <SparkleIcon className="size-3.5" />
            提取资产
            <ChevronRightIcon className="size-3.5" />
          </button>
        </div>
      )}

      {/* 筛选 Tab */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex gap-1">
          {FILTER_LABELS.map(({ key, Icon }) => {
            const count =
              key === "全部"
                ? assets.length
                : assets.filter((a) => {
                    const typeMap: Record<AssetFilter, string | null> = {
                      全部: null,
                      角色: "character",
                      场景: "scene",
                      道具: "prop",
                    };
                    return a.type === typeMap[key];
                  }).length;
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-brand/15 text-brand"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                <Icon className="size-3.5" />
                {key}
                <span
                  className={`rounded px-1.5 text-[11px] ${
                    active
                      ? "bg-brand/20 text-brand"
                      : "bg-white/[0.06] text-white/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <span className="text-[12px] text-white/40">
          总计 {stats.total} · 已完成 {stats.completed} · 生成中{" "}
          {stats.generating}
        </span>
      </div>

      {/* 资产卡网格 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onOpenVoice={() => openVoiceFor(asset.id)}
            onRegenerate={() => regenerateAsset(asset.id)}
            onDelete={() => deleteAsset(asset.id)}
          />
        ))}

        {/* 新增资产虚线卡 */}
        <button
          type="button"
          onClick={addAsset}
          className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] text-white/40 transition-all hover:border-brand/40 hover:bg-brand/[0.04] hover:text-brand"
        >
          <PlusIcon className="size-8" />
          <span className="text-[13px] font-medium">新增资产</span>
        </button>
      </div>

      {/* 音色选择弹窗 */}
      <VoiceSelectorDialog
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSelect={handleVoiceSelect}
        characterName={voiceTarget?.name}
      />

      {/* 批量生成弹窗 */}
      <BatchGenerateDialog
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        assets={batchAssets}
        onConfirm={(ids) => {
          batchGenerate(ids);
          setBatchOpen(false);
        }}
      />

      {/* 提取资产进度弹窗 */}
      <ExtractProgressModal
        open={extractProgress.open}
        step={extractProgress.step}
      />
    </div>
  );
}
