"use client";

import { useMemo, useState } from "react";
import type { ShortDramaProject } from "@/lib/mock-projects";
import {
  PlusIcon,
  SparkleIcon,
  MicrophoneIcon,
  PlayIcon,
  SceneIcon,
  PropIcon,
  UserGroupIcon,
  CheckIcon,
  UploadIcon,
  ChevronRightIcon,
} from "@/components/icons";

// ─── 图片生成（与 comic/[id]/page.tsx 同源） ─────────────────────────────────

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

// ─── 类型 ──────────────────────────────────────────────────────────────────

type AssetType = "character" | "scene" | "prop";

type AssetItem = {
  id: string;
  type: AssetType;
  name: string;
  description: string;
  prompt: string;
  status: "已生成" | "未开始" | "生成中";
  voice?: string; // 角色卡专属：已绑定的音色名
};

type AssetFilter = "全部" | "角色" | "场景" | "道具";

// ─── Mock 资产数据（从 project.characters + 扩展） ─────────────────────────

function buildAssets(project: ShortDramaProject): AssetItem[] {
  const characters: AssetItem[] = project.characters.map((c, i) => ({
    id: c.id || `char-${i}`,
    type: "character",
    name: c.name,
    description: c.description,
    prompt: `anime character design sheet, ${c.name}, ${c.role}, ${c.description}, cinematic, detailed, dark theme, brand lime accent`,
    status: i % 3 === 0 ? "已生成" : i % 3 === 1 ? "生成中" : "未开始",
    voice: i === 0 ? "温柔少女音" : undefined,
  }));

  const sceneCount = Math.max(0, project.assets.scenes - 0);
  const scenes: AssetItem[] = Array.from({ length: sceneCount }, (_, i) => ({
    id: `scene-${i + 1}`,
    type: "scene",
    name: `场景 ${i + 1}`,
    description: project.mode === "剧本模式" ? "由剧本提取的场景设定" : "手动创建场景",
    prompt: `cinematic scene background, scene ${i + 1}, atmospheric, detailed environment, dark cinematic`,
    status: i % 2 === 0 ? "已生成" : "未开始",
  }));

  const propCount = Math.max(0, project.assets.props - 0);
  const props: AssetItem[] = Array.from({ length: propCount }, (_, i) => ({
    id: `prop-${i + 1}`,
    type: "prop",
    name: `道具 ${i + 1}`,
    description: "关键剧情道具",
    prompt: `object design reference, prop ${i + 1}, product shot, dark background, brand lime accent`,
    status: "未开始",
  }));

  return [...characters, ...scenes, ...props];
}

const FILTER_LABELS: { key: AssetFilter; type: AssetType | null; Icon: typeof UserGroupIcon }[] = [
  { key: "全部", type: null, Icon: SparkleIcon },
  { key: "角色", type: "character", Icon: UserGroupIcon },
  { key: "场景", type: "scene", Icon: SceneIcon },
  { key: "道具", type: "prop", Icon: PropIcon },
];

const TYPE_BADGE: Record<AssetType, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
};

// ─── AssetTab ──────────────────────────────────────────────────────────────

export default function AssetTab({ project }: { project: ShortDramaProject }) {
  const isFreeMode = project.mode === "自由模式";
  const isScriptMode = project.mode === "剧本模式";

  const allAssets = useMemo(() => buildAssets(project), [project]);
  const [filter, setFilter] = useState<AssetFilter>("全部");
  const [extracted, setExtracted] = useState<boolean>(!isScriptMode || allAssets.length > 0);

  const filteredAssets = useMemo(() => {
    if (filter === "全部") return allAssets;
    const typeMap: Record<AssetFilter, AssetType> = {
      角色: "character",
      场景: "scene",
      道具: "prop",
      全部: "character",
    };
    return allAssets.filter((a) => a.type === typeMap[filter]);
  }, [allAssets, filter]);

  const stats = useMemo(() => {
    const total = allAssets.length;
    const completed = allAssets.filter((a) => a.status === "已生成").length;
    const generating = allAssets.filter((a) => a.status === "生成中").length;
    return { total, completed, generating };
  }, [allAssets]);

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
              className="flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-all hover:brightness-110"
            >
              <SparkleIcon className="size-3.5" />
              批量生成
            </button>
          )}
          <button
            type="button"
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
              <p className="text-[13px] font-medium text-white">尚未从剧本提取资产</p>
              <p className="text-[12px] text-white/50">点击"提取资产"，Agent 将解析剧本并生成角色、场景、道具。</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExtracted(true)}
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
                ? allAssets.length
                : allAssets.filter((a) => a.type === FILTER_LABELS.find((f) => f.key === key)?.type).length;
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
                    active ? "bg-brand/20 text-brand" : "bg-white/[0.06] text-white/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <span className="text-[12px] text-white/40">
          总计 {stats.total} · 已完成 {stats.completed} · 生成中 {stats.generating}
        </span>
      </div>

      {/* 资产卡网格 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}

        {/* 新增资产虚线卡 */}
        <button
          type="button"
          className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] text-white/40 transition-all hover:border-brand/40 hover:bg-brand/[0.04] hover:text-brand"
        >
          <PlusIcon className="size-8" />
          <span className="text-[13px] font-medium">新增资产</span>
        </button>
      </div>
    </div>
  );
}

// ─── AssetCard ─────────────────────────────────────────────────────────────

function AssetCard({ asset }: { asset: AssetItem }) {
  const isCharacter = asset.type === "character";
  const isDone = asset.status === "已生成";
  const isRunning = asset.status === "生成中";

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

        {/* 右上：状态点 */}
        <div
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ${
            isDone
              ? "bg-brand/20 text-brand"
              : isRunning
                ? "bg-amber-500/20 text-amber-300"
                : "bg-white/[0.08] text-white/60"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isDone
                ? "bg-brand"
                : isRunning
                  ? "bg-amber-400"
                  : "bg-white/40"
            } ${isRunning ? "animate-pulse" : ""}`}
          />
          {asset.status}
        </div>

        {/* 已生成标记 */}
        {isDone && (
          <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <CheckIcon className="size-3.5" />
          </div>
        )}
      </div>

      {/* 资产信息 */}
      <div className="space-y-2 p-3">
        <div>
          <h5 className="truncate text-[14px] font-semibold text-white">{asset.name}</h5>
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
