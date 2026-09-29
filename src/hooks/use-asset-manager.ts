"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import type { ShortDramaProject } from "@/lib/mock-projects";
import { updateProject } from "@/lib/project-store";

// ─── 类型 ──────────────────────────────────────────────────────────────────

export type AssetType = "character" | "scene" | "prop";

export type AssetVersion = {
  id: string;
  prompt: string;
  createdAt: string;
  source: "生成" | "上传" | "复制";
};

export type AssetItem = {
  id: string;
  type: AssetType;
  name: string;
  description: string;
  prompt: string;
  status: "已生成" | "未开始" | "生成中";
  voice?: string;
  /** 版本历史，[0] 为当前版本 */
  versions?: AssetVersion[];
  /** 资产被分镜/项目引用次数 */
  usage?: number;
};

function nowStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function daysAgoStr(n: number, hm: string) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${hm}`;
}

export type AssetFilter = "全部" | "角色" | "场景" | "道具";

// ─── Mock 资产数据（从 project.characters + 扩展） ─────────────────────────

function buildAssets(project: ShortDramaProject): AssetItem[] {
  const characters: AssetItem[] = project.characters.map((c, i) => {
    const prompt = `anime character design sheet, ${c.name}, ${c.role}, ${c.description}, cinematic, detailed, dark theme, brand lime accent`;
    const generated = i % 3 === 0;
    return {
      id: c.id || `char-${i}`,
      type: "character",
      name: c.name,
      description: c.description,
      prompt,
      status: generated ? "已生成" : i % 3 === 1 ? "生成中" : "未开始",
      voice: i === 0 ? "温柔少女音" : undefined,
      versions: generated
        ? [
            { id: `${c.id || `char-${i}`}-v2`, prompt, createdAt: daysAgoStr(1, "14:20"), source: "生成" },
            { id: `${c.id || `char-${i}`}-v1`, prompt: `${prompt}, early draft`, createdAt: daysAgoStr(6, "10:05"), source: "生成" },
          ]
        : undefined,
      usage: generated ? 8 + i * 3 : 0,
    };
  });

  const sceneCount = Math.max(0, project.assets.scenes);
  const scenes: AssetItem[] = Array.from({ length: sceneCount }, (_, i) => {
    const prompt = `cinematic scene background, scene ${i + 1}, atmospheric, detailed environment, dark cinematic`;
    const generated = i % 2 === 0;
    return {
      id: `scene-${i + 1}`,
      type: "scene",
      name: `场景 ${i + 1}`,
      description: project.mode === "剧本模式" ? "由剧本提取的场景设定" : "手动创建场景",
      prompt,
      status: generated ? "已生成" : "未开始",
      versions: generated
        ? [{ id: `scene-${i + 1}-v1`, prompt, createdAt: daysAgoStr(3, "16:40"), source: "生成" }]
        : undefined,
      usage: generated ? 4 + i * 2 : 0,
    };
  });

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
      setOverrides((prev) => {
        const cur = prev[id] ?? latest;
        const newVersion: AssetVersion = {
          id: `${id}-v${Date.now()}`,
          prompt: cur.prompt,
          createdAt: nowStr(),
          source: "生成",
        };
        return {
          ...prev,
          [id]: { ...cur, status: "已生成", versions: [newVersion, ...(cur.versions ?? [])] },
        };
      });
    }, 1000);
  }, []);

  /** 九宫格选图：以选中的 prompt 生成新版本并置为当前 */
  const addGridVersion = useCallback((id: string, prompt: string) => {
    const target = assetsRef.current.find((a) => a.id === id);
    if (!target) return;
    setOverrides((prev) => {
      const cur = prev[id] ?? target;
      const newVersion: AssetVersion = {
        id: `${id}-v${Date.now()}`,
        prompt,
        createdAt: nowStr(),
        source: "生成",
      };
      return {
        ...prev,
        [id]: { ...cur, prompt, status: "已生成", versions: [newVersion, ...(cur.versions ?? [])] },
      };
    });
  }, []);

  /** 切换当前版本（与当前版本互换位置） */
  const switchVersion = useCallback((id: string, versionId: string) => {
    const target = assetsRef.current.find((a) => a.id === id);
    if (!target) return;
    setOverrides((prev) => {
      const cur = prev[id] ?? target;
      const versions = cur.versions ?? [];
      if (versions[0]?.id === versionId) return prev;
      const targetVersion = versions.find((v) => v.id === versionId);
      if (!targetVersion) return prev;
      const swapped = versions.map((v) =>
        v.id === versionId ? versions[0] : v.id === versions[0].id ? targetVersion : v,
      );
      return { ...prev, [id]: { ...cur, prompt: targetVersion.prompt, versions: swapped } };
    });
  }, []);

  /** 删除历史版本（当前版本不可删） */
  const deleteVersion = useCallback((id: string, versionId: string) => {
    const target = assetsRef.current.find((a) => a.id === id);
    if (!target) return;
    setOverrides((prev) => {
      const cur = prev[id] ?? target;
      const versions = cur.versions ?? [];
      if (versions[0]?.id === versionId) return prev;
      return {
        ...prev,
        [id]: { ...cur, versions: versions.filter((v) => v.id !== versionId) },
      };
    });
  }, []);

  /** 一键复制版本 */
  const copyVersion = useCallback((id: string, versionId: string) => {
    const target = assetsRef.current.find((a) => a.id === id);
    if (!target) return;
    setOverrides((prev) => {
      const cur = prev[id] ?? target;
      const versions = cur.versions ?? [];
      const src = versions.find((v) => v.id === versionId);
      if (!src) return prev;
      const copied: AssetVersion = {
        id: `${id}-v${Date.now()}`,
        prompt: src.prompt,
        createdAt: nowStr(),
        source: "复制",
      };
      const idx = versions.findIndex((v) => v.id === versionId);
      const next = [...versions];
      next.splice(idx + 1, 0, copied);
      return { ...prev, [id]: { ...cur, versions: next } };
    });
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
    addGridVersion,
    switchVersion,
    deleteVersion,
    copyVersion,
    deleteAsset,
    batchGenerate,
    bindVoice,
    addAsset,
    extractAssets,
    openVoiceFor,
    handleVoiceSelect,
  };
}
