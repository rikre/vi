"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CoinsIcon,
  DownloadIcon,
  InfoIcon,
  LayoutGridIcon,
  MicrophoneIcon,
  MoreIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  ScissorsIcon,
  SparkleIcon,
  Volume2Icon,
  VolumeXIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@/components/icons";
import type { ShortDramaProject } from "@/lib/mock-projects";
import { REMAKE_STEPS, type RemakeStep } from "@/lib/mock-projects";

// ─── txi 图片函数 ──────────────────────────────────────────────────────────
const txi = (prompt: string, size: string = "square") =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

// ─── 顶部栏常量 ─────────────────────────────────────────────────────────────
const POINTS_BALANCE = "70,182";

// ─── 步骤1 · 原片 ─────────────────────────────────────────────────────────
type EpisodeStatus = "已完成" | "上传中" | "未开始" | "失败";

type SourceEpisode = {
  id: string;
  fileName: string;
  thumbnail: string;
  duration: string;
  size: string;
  status: EpisodeStatus;
};

const SOURCE_EPISODES: SourceEpisode[] = [
  {
    id: "ep-1",
    fileName: "1-20251224202512.mp4",
    thumbnail: txi("hospital drama scene keyframe, cinematic", "landscape_16_9"),
    duration: "03:28",
    size: "144.10 MB",
    status: "已完成",
  },
  {
    id: "ep-2",
    fileName: "2-20251224202513.mp4",
    thumbnail: txi("hospital ward conversation scene, cinematic", "landscape_16_9"),
    duration: "02:55",
    size: "128.42 MB",
    status: "已完成",
  },
  {
    id: "ep-3",
    fileName: "3-20251224202514.mp4",
    thumbnail: txi("hospital corridor night scene, cinematic", "landscape_16_9"),
    duration: "03:12",
    size: "151.08 MB",
    status: "已完成",
  },
];

// ─── 步骤2 · 设定（A→B 资产映射） ────────────────────────────────────────
type AssetCategory = "角色" | "场景" | "道具";
type AssetStatus = "未开始" | "进行中" | "已完成";

type AssetMapping = {
  id: string;
  category: AssetCategory;
  sourceName: string;
  sourceImage: string;
  targetName: string;
  targetImage: string;
  voice?: string;
  variantCount?: number;
  status: AssetStatus;
};

const ASSET_MAPPINGS: AssetMapping[] = [
  {
    id: "char-1",
    category: "角色",
    sourceName: "跌母",
    sourceImage: txi("portrait of an elderly asian mother"),
    targetName: "Eleanor Cunningham",
    targetImage: txi("portrait of an elegant western elderly woman"),
    voice: "邻居阿姨",
    variantCount: 3,
    status: "已完成",
  },
  {
    id: "char-2",
    category: "角色",
    sourceName: "沈冰兮",
    sourceImage: txi("portrait of a gentle asian young woman"),
    targetName: "Sophia Miller",
    targetImage: txi("portrait of a beautiful western young woman"),
    voice: "柔美女友",
    variantCount: 4,
    status: "已完成",
  },
  {
    id: "char-3",
    category: "角色",
    sourceName: "沈母",
    sourceImage: txi("portrait of a middle aged asian woman"),
    targetName: "Linda Miller",
    targetImage: txi("portrait of a middle aged western woman"),
    voice: "浣测天",
    variantCount: 2,
    status: "进行中",
  },
  {
    id: "char-4",
    category: "角色",
    sourceName: "顾时宴",
    sourceImage: txi("portrait of a handsome asian ceo man"),
    targetName: "Ethan Cunningham",
    targetImage: txi("portrait of a handsome western businessman"),
    voice: "傲娇霸总",
    variantCount: 5,
    status: "已完成",
  },
  {
    id: "scene-1",
    category: "场景",
    sourceName: "医院走廊",
    sourceImage: txi("asian hospital corridor"),
    targetName: "Hospital Corridor",
    targetImage: txi("western hospital corridor bright"),
    status: "已完成",
  },
  {
    id: "scene-2",
    category: "场景",
    sourceName: "病房",
    sourceImage: txi("asian hospital ward room"),
    targetName: "Patient Ward",
    targetImage: txi("western hospital ward room"),
    status: "已完成",
  },
  {
    id: "prop-1",
    category: "道具",
    sourceName: "病历本",
    sourceImage: txi("medical chart clipboard"),
    targetName: "Medical Chart",
    targetImage: txi("western medical chart clipboard"),
    status: "已完成",
  },
];

const ASSET_CATEGORIES: AssetCategory[] = ["角色", "场景", "道具"];

// ─── 步骤3 · 分镜 ─────────────────────────────────────────────────────────
type ShotCard = {
  id: string;
  index: number;
  description: string;
  prompt: string;
  characterRefs: string[];
  sceneRefs: string[];
  propRefs: string[];
  status: "未开始" | "已生成" | "失败";
  preview?: string;
};

const SHOT_CARDS: ShotCard[] = [
  {
    id: "shot-1",
    index: 1,
    description: "Sophia Miller 快步穿过明亮的医院走廊，神情焦虑地望向病房方向",
    prompt:
      "young woman walking fast through bright hospital corridor, anxious expression, cinematic, close-up",
    characterRefs: ["Sophia Miller", "Eleanor Cunningham"],
    sceneRefs: ["Hospital Corridor"],
    propRefs: ["Medical Chart"],
    status: "已生成",
    preview: txi("hospital drama shot 1, cinematic", "landscape_16_9"),
  },
  {
    id: "shot-2",
    index: 2,
    description: "Eleanor Cunningham 迎面走来轻声安抚，两人在走廊中央停下交谈",
    prompt:
      "two women meeting in hospital corridor, conversation, emotional, medium shot, cinematic",
    characterRefs: ["Eleanor Cunningham", "Sophia Miller"],
    sceneRefs: ["Hospital Corridor"],
    propRefs: [],
    status: "未开始",
  },
  {
    id: "shot-3",
    index: 3,
    description: "镜头缓缓推进聚焦人物面部表情，Dr. James Reed 拿着病历本走过",
    prompt:
      "doctor walking through hospital corridor with medical chart, slow push-in shot, cinematic",
    characterRefs: ["Dr. James Reed"],
    sceneRefs: ["Hospital Corridor"],
    propRefs: ["Medical Chart"],
    status: "未开始",
  },
  {
    id: "shot-4",
    index: 4,
    description: "病房内，Linda Miller 焦急等待，女儿推门进入",
    prompt:
      "anxious mother waiting in hospital ward, daughter entering door, emotional moment, cinematic",
    characterRefs: ["Linda Miller", "Sophia Miller"],
    sceneRefs: ["Patient Ward"],
    propRefs: [],
    status: "已生成",
    preview: txi("hospital drama shot 4, cinematic", "landscape_16_9"),
  },
];

// ─── 步骤4 · 视频 ─────────────────────────────────────────────────────────
const SOURCE_TRACK = Array.from({ length: 8 }, (_, i) => ({
  id: `src-${i + 1}`,
  thumbnail: txi(`hospital drama frame ${i + 1}`, "landscape_16_9"),
}));

const OUTPUT_TRACK = [
  { id: "out-1", name: "分镜1", duration: "11s" },
  { id: "out-2", name: "分镜2", duration: "9s" },
  { id: "out-3", name: "分镜3", duration: "12s" },
  { id: "out-4", name: "分镜4", duration: "10s" },
];

const EXPORT_FORMATS = ["MP4 1080p", "MP4 720p", "MOV 1080p"] as const;

// ─── 工具：状态徽章 ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: EpisodeStatus | AssetStatus | ShotCard["status"] }) {
  let cls = "bg-white/5 text-white/50 ring-1 ring-white/10";
  let dot = "bg-white/40";
  if (status === "已完成" || status === "已生成") {
    cls = "bg-brand/10 text-brand ring-1 ring-brand/20";
    dot = "bg-brand";
  } else if (status === "上传中" || status === "进行中") {
    cls = "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20";
    dot = "bg-amber-400";
  } else if (status === "失败") {
    cls = "bg-red-500/10 text-red-300 ring-1 ring-red-500/20";
    dot = "bg-red-400";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${cls}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ─── 主组件 ─────────────────────────────────────────────────────────────────
export default function RemakeStudio({ project }: { project: ShortDramaProject }) {
  const [step, setStep] = useState<RemakeStep>("原片");
  const [assetCategory, setAssetCategory] = useState<AssetCategory>("角色");
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [syncTimeline, setSyncTimeline] = useState(true);
  const [compareSource, setCompareSource] = useState(true);
  const [exportFormat, setExportFormat] = useState<(typeof EXPORT_FORMATS)[number]>(EXPORT_FORMATS[0]);

  const stepIndex = REMAKE_STEPS.indexOf(step);
  const isLastStep = stepIndex === REMAKE_STEPS.length - 1;

  const goNext = () => {
    if (isLastStep) return;
    setStep(REMAKE_STEPS[stepIndex + 1]);
  };

  const goStep = (target: RemakeStep) => {
    if (REMAKE_STEPS.indexOf(target) <= stepIndex) setStep(target);
  };

  const mappingsInCategory = ASSET_MAPPINGS.filter((m) => m.category === assetCategory);

  // 配置摘要
  const configSummary = `9:16 · 1080p · 写实电影感 · 英语`;

  return (
    <div className="flex h-full flex-col bg-[#0d0d0d] text-white">
      {/* ===== 顶部栏 ===== */}
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 backdrop-blur-md bg-[#0d0d0d]/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="返回"
            title="返回"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <SparkleIcon className="size-4 text-brand" />
              <h1 className="text-[15px] font-semibold text-white">{project.title}</h1>
            </div>
            <span className="mt-0.5 text-[12px] text-white/40">{configSummary}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-white/80 ring-1 ring-white/[0.06] backdrop-blur-sm">
          <CoinsIcon className="size-4 text-brand" />
          <span>{POINTS_BALANCE}</span>
          <span className="ml-1 text-white/30">算力余额</span>
        </div>
      </header>

      {/* ===== 4 步 Stepper ===== */}
      <nav
        className="flex items-center justify-center gap-3 border-b border-white/[0.06] px-6 py-5"
        aria-label="重绘步骤"
      >
        {REMAKE_STEPS.map((s, i) => {
          const state: "done" | "active" | "todo" =
            i < stepIndex ? "done" : i === stepIndex ? "active" : "todo";
          return (
            <div key={s} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goStep(s)}
                disabled={state === "todo"}
                aria-current={state === "active" ? "step" : undefined}
                className={`group flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                  state === "active"
                    ? "bg-brand/10 ring-1 ring-brand/30"
                    : state === "done"
                      ? "hover:bg-white/[0.04]"
                      : "cursor-not-allowed opacity-50"
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-[12px] font-semibold transition-all ${
                    state === "done"
                      ? "bg-brand text-brand-foreground"
                      : state === "active"
                        ? "bg-brand text-brand-foreground"
                        : "bg-white/[0.06] text-white/40 ring-1 ring-white/[0.06]"
                  }`}
                >
                  {state === "done" ? <CheckIcon className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={`text-[13px] font-medium ${
                    state === "active"
                      ? "text-brand"
                      : state === "done"
                        ? "text-white/80"
                        : "text-white/40"
                  }`}
                >
                  {s}
                </span>
              </button>
              {i < REMAKE_STEPS.length - 1 && (
                <span
                  className={`h-px w-12 transition-colors ${
                    i < stepIndex
                      ? "bg-gradient-to-r from-brand/40 to-[#00e5c8]/40"
                      : "bg-white/[0.08]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* ===== 步骤内容区 ===== */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ─── 步骤 1 · 原片 ─── */}
        {step === "原片" && (
          <div className="mx-auto max-w-5xl space-y-5">
            <div className="flex items-start gap-2.5 rounded-2xl bg-brand/[0.06] ring-1 ring-brand/20 backdrop-blur-sm px-4 py-3 text-[13px] text-white/70">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>确认剧集视频后，系统将对原视频进行资产解析，提取主要的人物、场景、道具资产，用于后续替换。</span>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-white">原片剧集</h2>
              <div className="flex items-center gap-4 text-[12px] text-white/50">
                <span>全部剧集 {SOURCE_EPISODES.length}</span>
                <span>
                  已上传 {SOURCE_EPISODES.filter((e) => e.status === "已完成").length}
                </span>
                <span>
                  上传中 {SOURCE_EPISODES.filter((e) => e.status === "上传中").length}
                </span>
                <span>
                  上传失败 {SOURCE_EPISODES.filter((e) => e.status === "失败").length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {SOURCE_EPISODES.map((ep, i) => (
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
                      <span className="text-[12px] font-medium text-white/40">第 {i + 1} 集</span>
                      <span className="text-white/20">·</span>
                      <span className="truncate text-[13px] text-white/80">{ep.fileName}</span>
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
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-6 py-2.5 text-[13px] font-semibold transition-colors hover:bg-brand-hover"
              >
                开始解析资产
                <ChevronDownIcon className="size-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        )}

        {/* ─── 步骤 2 · 设定（A→B 资产映射） ─── */}
        {step === "设定" && (
          <div className="mx-auto max-w-6xl space-y-5">
            <div className="flex items-start gap-2.5 rounded-2xl bg-brand/[0.06] ring-1 ring-brand/20 backdrop-blur-sm px-4 py-3 text-[13px] text-white/70">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                请完成新旧角色、场景、道具映射关系；确认替换关系后，系统将自动对原视频进行智能切片并提取关键帧对应，用于后续分镜生成。
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06]">
                {ASSET_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAssetCategory(c)}
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
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-white/50">
                  形象总计 {mappingsInCategory.length} · 已解析{" "}
                  {mappingsInCategory.filter((m) => m.status === "已完成").length}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <PlusIcon className="size-3.5" />
                  添加{assetCategory}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-4 py-1.5 text-[12px] font-semibold transition-colors hover:bg-brand-hover"
                >
                  <SparkleIcon className="size-3.5" />
                  批量生成
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {mappingsInCategory.map((m) => (
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
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                        aria-label="更多操作"
                      >
                        <MoreIcon className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-6 py-2.5 text-[13px] font-semibold transition-colors hover:bg-brand-hover"
              >
                进入下一步
                <ChevronDownIcon className="size-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        )}

        {/* ─── 步骤 3 · 分镜 ─── */}
        {step === "分镜" && (
          <div className="mx-auto max-w-6xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06] backdrop-blur-md">
                {[1, 2, 3].map((ep) => (
                  <button
                    key={ep}
                    type="button"
                    onClick={() => setActiveEpisode(ep)}
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
                className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-4 py-1.5 text-[12px] font-semibold transition-colors hover:bg-brand-hover"
              >
                <SparkleIcon className="size-3.5" />
                批量生成分镜
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SHOT_CARDS.map((shot) => (
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
                        className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[11px] text-cyan-300"
                      >
                        #{s}
                      </span>
                    ))}
                    {shot.propRefs.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[11px] text-purple-300"
                      >
                        ${p}
                      </span>
                    ))}
                  </div>

                  {/* 提示词 textarea */}
                  <textarea
                    defaultValue={shot.prompt}
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
                      className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        shot.status === "已生成"
                          ? "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
                          : "bg-brand text-brand-foreground hover:bg-brand-hover"
                      }`}
                    >
                      {shot.status === "已生成" ? (
                        <>重新生成</>
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
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-6 py-2.5 text-[13px] font-semibold transition-colors hover:bg-brand-hover"
              >
                进入下一步
                <ChevronDownIcon className="size-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        )}

        {/* ─── 步骤 4 · 视频（原‖新对比） ─── */}
        {step === "视频" && (
          <div className="mx-auto max-w-6xl space-y-5">
            {/* 顶部：集数导航 */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06] backdrop-blur-md">
                {[1, 2, 3].map((ep) => (
                  <button
                    key={ep}
                    type="button"
                    onClick={() => setActiveEpisode(ep)}
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
              <label className="inline-flex items-center gap-2 text-[12px] text-white/60">
                <input
                  type="checkbox"
                  checked={compareSource}
                  onChange={(e) => setCompareSource(e.target.checked)}
                  className="sr-only"
                />
                <button
                  type="button"
                  role="switch"
                  aria-checked={compareSource}
                  onClick={() => setCompareSource((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    compareSource ? "bg-brand" : "bg-white/[0.1]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                      compareSource ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                对比原视频
              </label>
            </div>

            {/* 双播放器对比 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 原片 */}
              <div className="rounded-2xl bg-[#141414] ring-1 ring-white/[0.06] backdrop-blur-sm p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-white/70">
                    原
                  </span>
                  <span className="text-[13px] font-medium text-white/80">原片</span>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-black ring-1 ring-white/[0.06]">
                  <img
                    src={txi("hospital drama original frame, asian cast", "landscape_16_9")}
                    alt="原片"
                    loading="lazy"
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      className="flex size-12 items-center justify-center rounded-full bg-brand/90 text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:scale-110"
                      aria-label="播放原片"
                    >
                      <PlayIcon className="size-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                    <VolumeXIcon className="size-3.5 text-white/60" />
                    <span className="text-[11px] text-white/70">00:04 / 03:28</span>
                    <div className="relative ml-2 h-1 flex-1 rounded-full bg-white/10">
                      <div className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-brand" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 成片 */}
              <div className="rounded-2xl bg-brand/[0.02] ring-1 ring-brand/20 backdrop-blur-sm p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-md bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
                    新
                  </span>
                  <span className="text-[13px] font-medium text-white">成片</span>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-black ring-1 ring-brand/20">
                  <img
                    src={txi("hospital drama remake frame, western cast, cinematic", "landscape_16_9")}
                    alt="成片"
                    loading="lazy"
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      className="flex size-12 items-center justify-center rounded-full bg-brand/90 text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:scale-110"
                      aria-label="播放成片"
                    >
                      <PlayIcon className="size-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                    <Volume2Icon className="size-3.5 text-brand" />
                    <span className="text-[11px] text-white/80">00:04 / 03:34</span>
                    <div className="relative ml-2 h-1 flex-1 rounded-full bg-white/10">
                      <div className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-brand" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 同步时间轴开关 + 时间轴 */}
            <div className="rounded-2xl bg-[#1b1b1b]/90 ring-1 ring-white/10 backdrop-blur-sm p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium text-white/80">时间轴</span>
                <label className="inline-flex items-center gap-2 text-[12px] text-white/60">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={syncTimeline}
                    onClick={() => setSyncTimeline((v) => !v)}
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
                      <img src={t.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
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
                      <span className="text-[11px] font-medium text-brand">{t.name}</span>
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

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between rounded-2xl bg-[#1b1b1b]/90 ring-1 ring-white/10 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <ScissorsIcon className="size-3.5" />
                  导剪辑映
                </button>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    {exportFormat}
                    <ChevronDownIcon className="size-3" />
                  </button>
                  <select
                    value={exportFormat}
                    onChange={(e) =>
                      setExportFormat(e.target.value as (typeof EXPORT_FORMATS)[number])
                    }
                    className="sr-only"
                    aria-label="导出格式"
                  >
                    {EXPORT_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-5 py-2 text-[13px] font-semibold transition-colors hover:bg-brand-hover"
                >
                  <DownloadIcon className="size-4" />
                  下载视频
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 步骤指示器（右下角辅助） */}
      <div className="border-t border-white/[0.06] px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-[12px] text-white/40">
          <div className="flex items-center gap-2">
            <LayoutGridIcon className="size-3.5" />
            <span>
              步骤 {stepIndex + 1} / {REMAKE_STEPS.length} · {step}
            </span>
          </div>
          {!isLastStep && (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1 text-brand transition-opacity hover:opacity-80"
            >
              下一步：{REMAKE_STEPS[stepIndex + 1]}
              <ChevronDownIcon className="size-3.5 -rotate-90" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
