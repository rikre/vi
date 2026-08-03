"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import type { ShortDramaProject } from "@/lib/mock-projects";
import { updateProject } from "@/lib/project-store";

// ─── 类型 ──────────────────────────────────────────────────────────────────

export type AssetType = "character" | "scene" | "prop";

export type AssetItem = {
  id: string;
  type: AssetType;
  name: string;
  description: string;
  prompt: string;
  status: "已生成" | "未开始" | "生成中";
  voice?: string;
};

export type AssetFilter = "全部" | "角色" | "场景" | "道具";

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

  const sceneCount = Math.max(0, project.assets.scenes);
  const scenes: AssetItem[] = Array.from({ length: sceneCount }, (_, i) => ({
    id: `scene-${i + 1}`,
    type: "scene",
    name: `场景 ${i + 1}`,
    description: project.mode === "剧本模式" ? "由剧本提取的场景设定" : "手动创建场景",
    prompt: `cinematic scene background, scene ${i + 1}, atmospheric, detailed environment, dark cinematic`,
    status: i % 2 === 0 ? "已生成" : "未开始",
  }));

  const propCount = Math.max(0, project.assets.props);
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

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAssetManager(project: ShortDramaProject) {
  const isScriptMode = project.mode === "剧本模式";
  const isFreeMode = project.mode === "自由模式";

  const baseAssets = useMemo(() => buildAssets(project), [project]);

  const [overrides, setOverrides] = useState<Record<string, AssetItem>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const assets = useMemo(() => {
    return baseAssets
      .filter((a) => !removed.has(a.id))
      .map((a) => overrides[a.id] ?? a);
  }, [baseAssets, removed, overrides]);

  const assetsRef = useRef(assets);
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  const [extracted, setExtracted] = useState(
    !isScriptMode || baseAssets.length > 0,
  );
  const [filter, setFilter] = useState<AssetFilter>("全部");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTargetId, setVoiceTargetId] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [extractProgress, setExtractProgress] = useState<{
    open: boolean;
    step: number;
  }>({ open: false, step: 0 });

  const voiceTarget = useMemo(
    () => assets.find((a) => a.id === voiceTargetId) ?? null,
    [assets, voiceTargetId],
  );

  const filteredAssets = useMemo(() => {
    if (filter === "全部") return assets;
    const typeMap: Record<AssetFilter, AssetType> = {
      角色: "character",
      场景: "scene",
      道具: "prop",
      全部: "character",
    };
    return assets.filter((a) => a.type === typeMap[filter]);
  }, [assets, filter]);

  const stats = useMemo(() => {
    const total = assets.length;
    const completed = assets.filter((a) => a.status === "已生成").length;
    const generating = assets.filter((a) => a.status === "生成中").length;
    return { total, completed, generating };
  }, [assets]);

  useEffect(() => {
    if (!extractProgress.open) return;
    if (extractProgress.step >= 3) {
      const t = setTimeout(() => {
        setExtractProgress({ open: false, step: 0 });
        setExtracted(true);
        const current = assetsRef.current;
        updateProject(project.id, {
          assets: {
            total: current.length,
            characters: current.filter((a) => a.type === "character").length,
            scenes: current.filter((a) => a.type === "scene").length,
            props: current.filter((a) => a.type === "prop").length,
          },
        });
      }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setExtractProgress((p) => ({ ...p, step: p.step + 1 }));
    }, 500);
    return () => clearTimeout(t);
  }, [extractProgress, project.id]);

  const regenerateAsset = useCallback((id: string) => {
    const target = assetsRef.current.find((a) => a.id === id);
    if (!target) return;
    setOverrides((prev) => ({ ...prev, [id]: { ...target, status: "生成中" } }));
    setTimeout(() => {
      const latest = assetsRef.current.find((a) => a.id === id);
      if (!latest) return;
      setOverrides((prev) => ({
        ...prev,
        [id]: { ...latest, status: "已生成" },
      }));
    }, 1000);
  }, []);

  const deleteAsset = useCallback(
    (id: string) => {
      const target = assetsRef.current.find((a) => a.id === id);
      if (!target) return;
      setRemoved((prev) => new Set(prev).add(id));
      setOverrides((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      const remaining = assetsRef.current.filter((a) => a.id !== id);
      const patch: Partial<ShortDramaProject> = {
        assets: {
          total: remaining.length,
          characters: remaining.filter((a) => a.type === "character").length,
          scenes: remaining.filter((a) => a.type === "scene").length,
          props: remaining.filter((a) => a.type === "prop").length,
        },
      };
      if (target.type === "character") {
        patch.characters = project.characters.filter((c, i) => {
          const expectedId = c.id || `char-${i}`;
          return expectedId !== id;
        });
      }
      updateProject(project.id, patch);
    },
    [project.id, project.characters],
  );

  const batchGenerate = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setOverrides((prev) => {
      const next = { ...prev };
      for (const a of assetsRef.current) {
        if (idSet.has(a.id)) {
          next[a.id] = { ...a, status: "生成中" };
        }
      }
      return next;
    });
    setTimeout(() => {
      setOverrides((prev) => {
        const next = { ...prev };
        for (const a of assetsRef.current) {
          if (idSet.has(a.id)) {
            const current = prev[a.id] ?? a;
            next[a.id] = { ...current, status: "已生成" };
          }
        }
        return next;
      });
    }, 1500);
  }, []);

  const bindVoice = useCallback((assetId: string, voiceName: string) => {
    const target = assetsRef.current.find((a) => a.id === assetId);
    if (!target) return;
    setOverrides((prev) => ({
      ...prev,
      [assetId]: { ...target, voice: voiceName },
    }));
  }, []);

  const addAsset = useCallback(() => {
    const newId = `char-new-${Date.now()}`;
    updateProject(project.id, {
      characters: [
        ...project.characters,
        {
          id: newId,
          name: "新角色",
          role: "配角",
          description: "点击编辑角色描述",
        },
      ],
    });
    setOverrides((prev) => ({
      ...prev,
      [newId]: {
        id: newId,
        type: "character",
        name: "新角色",
        description: "点击编辑角色描述",
        prompt:
          "anime character design sheet, 新角色, 配角, 点击编辑角色描述, cinematic, detailed, dark theme, brand lime accent",
        status: "未开始",
      },
    }));
  }, [project.id, project.characters]);

  const extractAssets = useCallback(() => {
    setExtractProgress({ open: true, step: 0 });
  }, []);

  const openVoiceFor = useCallback((assetId: string) => {
    setVoiceTargetId(assetId);
    setVoiceOpen(true);
  }, []);

  const handleVoiceSelect = useCallback(
    (voiceName: string) => {
      if (!voiceTargetId) return;
      bindVoice(voiceTargetId, voiceName);
    },
    [voiceTargetId, bindVoice],
  );

  return {
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
    bindVoice,
    addAsset,
    extractAssets,
    openVoiceFor,
    handleVoiceSelect,
  };
}
