"use client";

import { useCallback, useMemo, useState } from "react";
import type { ShortDramaProject } from "@/lib/mock-projects";
import { REMAKE_STEPS, type RemakeStep } from "@/lib/mock-projects";

// ─── txi 图片函数 ──────────────────────────────────────────────────────────
const txi = (prompt: string, size: string = "square") =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

export { txi };

// ─── 步骤1 · 原片 ─────────────────────────────────────────────────────────
export type EpisodeStatus = "已完成" | "上传中" | "未开始" | "失败";

export type SourceEpisode = {
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
    thumbnail: txi(
      "hospital ward conversation scene, cinematic",
      "landscape_16_9",
    ),
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
export type AssetCategory = "角色" | "场景" | "道具";
export type AssetStatus = "未开始" | "进行中" | "已完成";

export type AssetMapping = {
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

export const ASSET_CATEGORIES: AssetCategory[] = ["角色", "场景", "道具"];

// ─── 步骤3 · 分镜 ─────────────────────────────────────────────────────────
export type ShotCard = {
  id: string;
  index: number;
  description: string;
  prompt: string;
  characterRefs: string[];
  sceneRefs: string[];
  propRefs: string[];
  status: "未开始" | "已生成" | "生成中" | "失败";
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
export const SOURCE_TRACK = Array.from({ length: 8 }, (_, i) => ({
  id: `src-${i + 1}`,
  thumbnail: txi(`hospital drama frame ${i + 1}`, "landscape_16_9"),
}));

export const OUTPUT_TRACK = [
  { id: "out-1", name: "分镜1", duration: "11s" },
  { id: "out-2", name: "分镜2", duration: "9s" },
  { id: "out-3", name: "分镜3", duration: "12s" },
  { id: "out-4", name: "分镜4", duration: "10s" },
];

export const EXPORT_FORMATS = ["MP4 1080p", "MP4 720p", "MOV 1080p"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useRemakeStudio(project: ShortDramaProject) {
  const [step, setStep] = useState<RemakeStep>("原片");
  const [assetCategory, setAssetCategory] = useState<AssetCategory>("角色");
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [syncTimeline, setSyncTimeline] = useState(true);
  const [compareSource, setCompareSource] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(
    EXPORT_FORMATS[0],
  );

  const [episodes, setEpisodes] = useState<SourceEpisode[]>(SOURCE_EPISODES);
  const [mappings, setMappings] = useState<AssetMapping[]>(ASSET_MAPPINGS);
  const [shots, setShots] = useState<ShotCard[]>(SHOT_CARDS);
  const [downloading, setDownloading] = useState(false);

  const stepIndex = REMAKE_STEPS.indexOf(step);
  const isLastStep = stepIndex === REMAKE_STEPS.length - 1;

  const goNext = useCallback(() => {
    if (isLastStep) return;
    setStep(REMAKE_STEPS[stepIndex + 1]);
  }, [isLastStep, stepIndex]);

  const goStep = useCallback(
    (target: RemakeStep) => {
      if (REMAKE_STEPS.indexOf(target) <= stepIndex) setStep(target);
    },
    [stepIndex],
  );

  const mappingsInCategory = useMemo(
    () => mappings.filter((m) => m.category === assetCategory),
    [mappings, assetCategory],
  );

  const configSummary = "9:16 · 1080p · 写实电影感 · 英语";

  // ─── AI 模拟 ────────────────────────────────────────────────────────────

  const retryEpisode = useCallback((id: string) => {
    setEpisodes((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "上传中" } : e)),
    );
    setTimeout(() => {
      setEpisodes((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "已完成" } : e)),
      );
    }, 1200);
  }, []);

  const batchGenerateMappings = useCallback(() => {
    setMappings((prev) =>
      prev.map((m) =>
        m.category === assetCategory && m.status !== "已完成"
          ? { ...m, status: "进行中" }
          : m,
      ),
    );
    setTimeout(() => {
      setMappings((prev) =>
        prev.map((m) =>
          m.category === assetCategory && m.status !== "已完成"
            ? { ...m, status: "已完成" }
            : m,
        ),
      );
    }, 1500);
  }, [assetCategory]);

  const addMapping = useCallback(() => {
    const id = `${assetCategory}-new-${Date.now()}`;
    setMappings((prev) => [
      ...prev,
      {
        id,
        category: assetCategory,
        sourceName: `新${assetCategory}`,
        sourceImage: txi(`generic ${assetCategory} reference, cinematic`),
        targetName: `New ${assetCategory}`,
        targetImage: txi(`new western ${assetCategory} reference, cinematic`),
        status: "未开始",
      },
    ]);
  }, [assetCategory]);

  const generateShot = useCallback((id: string) => {
    setShots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "生成中" } : s)),
    );
    setTimeout(() => {
      setShots((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "已生成",
                preview: txi(
                  `hospital drama remake shot ${s.index}, cinematic`,
                  "landscape_16_9",
                ),
              }
            : s,
        ),
      );
    }, 1500);
  }, []);

  const batchGenerateShots = useCallback(() => {
    setShots((prev) =>
      prev.map((s) =>
        s.status === "未开始" ? { ...s, status: "生成中" } : s,
      ),
    );
    setTimeout(() => {
      setShots((prev) =>
        prev.map((s) =>
          s.status === "生成中"
            ? {
                ...s,
                status: "已生成",
                preview: txi(
                  `hospital drama remake shot ${s.index}, cinematic`,
                  "landscape_16_9",
                ),
              }
            : s,
        ),
      );
    }, 1800);
  }, []);

  const updateShotPrompt = useCallback((id: string, prompt: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, prompt } : s)));
  }, []);

  const downloadVideo = useCallback(() => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1500);
  }, []);

  return {
    project,
    step,
    stepIndex,
    isLastStep,
    goNext,
    goStep,
    configSummary,
    // step 1
    episodes,
    retryEpisode,
    // step 2
    assetCategory,
    setAssetCategory,
    mappingsInCategory,
    batchGenerateMappings,
    addMapping,
    // step 3
    activeEpisode,
    setActiveEpisode,
    shots,
    generateShot,
    batchGenerateShots,
    updateShotPrompt,
    // step 4
    syncTimeline,
    setSyncTimeline,
    compareSource,
    setCompareSource,
    exportFormat,
    setExportFormat,
    downloading,
    downloadVideo,
  };
}
