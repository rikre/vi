"use client";

import { useMemo, useState, useCallback } from "react";
import type { ShortDramaProject, Episode, ShotItem } from "@/lib/mock-projects";
import { updateProject, getProject } from "@/lib/project-store";
import { pollShotVideo, submitShotVideo } from "@/lib/generation/client";

function buildPlaceholderEpisodes(total: number): Episode[] {
  return Array.from({ length: Math.max(1, total) }, (_, i) => ({
    id: `ep-${i + 1}`,
    number: i + 1,
    title: `第${i + 1}集`,
    status: i === 0 ? "进行中" : ("未开始" as const),
    progress: i === 0 ? 30 : 0,
  }));
}

/** 真实生成轮询节奏（协议来源 rikre/loopvideo@87a6950，MIT） */
const POLL_INTERVAL_MS = 8_000;
const MAX_POLL_ATTEMPTS = 75; // 约 10 分钟

export function useStoryboard(project: ShortDramaProject) {
  const episodes = useMemo<Episode[]>(
    () =>
      project.episodeList && project.episodeList.length > 0
        ? project.episodeList
        : buildPlaceholderEpisodes(project.episodes),
    [project.episodeList, project.episodes],
  );

  const shots = useMemo<ShotItem[]>(() => project.shots ?? [], [project.shots]);

  const [activeEpisode, setActiveEpisode] = useState<number>(
    episodes[0]?.number ?? 1,
  );
  const [subView, setSubView] = useState<"分镜表" | "分镜生成">("分镜表");
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [prompts, setPrompts] = useState<Record<string, string>>({});

  const episodeShots = useMemo(
    () => shots.filter((s) => s.episode === activeEpisode),
    [shots, activeEpisode],
  );

  const episodeProgress = useCallback(
    (ep: Episode) => {
      const epShots = shots.filter((s) => s.episode === ep.number);
      if (epShots.length === 0) return 0;
      const done = epShots.filter((s) => s.status === "已生成").length;
      return Math.round((done / epShots.length) * 100);
    },
    [shots],
  );

  const addShot = useCallback(() => {
    const epShots = shots.filter((s) => s.episode === activeEpisode);
    const newIndex = (epShots.slice(-1)[0]?.index ?? 0) + 1;
    const newShot: ShotItem = {
      id: `s-ep${activeEpisode}-${newIndex}-${Date.now()}`,
      episode: activeEpisode,
      index: newIndex,
      description: "新分镜",
      duration: "0:10",
      characters: [],
      scene: "未设定",
      prompt: "",
      status: "未开始",
    };
    updateProject(project.id, { shots: [...shots, newShot] });
  }, [shots, activeEpisode, project.id]);

  const updateDescription = useCallback(
    (id: string, desc: string) => {
      setDescriptions((c) => ({ ...c, [id]: desc }));
      const updated = shots.map((s) =>
        s.id === id ? { ...s, description: desc } : s,
      );
      updateProject(project.id, { shots: updated });
    },
    [shots, project.id],
  );

  const updatePrompt = useCallback(
    (id: string, prompt: string) => {
      setPrompts((c) => ({ ...c, [id]: prompt }));
      const updated = shots.map((s) => (s.id === id ? { ...s, prompt } : s));
      updateProject(project.id, { shots: updated });
    },
    [shots, project.id],
  );

  const applyShotPatch = useCallback(
    (ids: Set<string>, patch: (shot: ShotItem) => ShotItem) => {
      const latest = getProject(project.id);
      if (latest?.type !== "short") return;
      updateProject(project.id, {
        shots: (latest.shots ?? []).map((s) => (ids.has(s.id) ? patch(s) : s)),
      });
    },
    [project.id],
  );

  const markStatus = useCallback(
    (ids: Set<string>, status: ShotItem["status"]) => {
      updateProject(project.id, {
        shots: shots.map((s) => (ids.has(s.id) ? { ...s, status } : s)),
      });
    },
    [shots, project.id],
  );

  const simulateGeneration = useCallback(
    (ids: Set<string>, delayMs: number) => {
      setTimeout(() => {
        applyShotPatch(ids, (s) => ({ ...s, status: "已生成" }));
      }, delayMs);
    },
    [applyShotPatch],
  );

  /**
   * 真实生成 + 模拟回退：
   * 1. 串行提交 DashScope 异步任务；服务端未配置可用模型（409）时整批回退模拟；
   * 2. 已提交任务按固定间隔轮询，SUCCEEDED → 已生成（含 videoUrl），FAILED/CANCELED/超时 → 失败；
   * 3. 提交期异常的分镜直接标记失败，不清空其他分镜状态。
   */
  const runGeneration = useCallback(
    async (ids: Set<string>, simulateDelayMs: number) => {
      markStatus(ids, "生成中");
      const simulationIds = new Set(ids);
      const submitted: { id: string; taskId: string }[] = [];

      for (const id of ids) {
        const shot = shots.find((s) => s.id === id);
        if (!shot) {
          simulationIds.delete(id);
          continue;
        }
        try {
          const result = await submitShotVideo({
            prompt: shot.prompt || shot.description,
            aspectRatio: "16:9",
          });
          if (result.kind === "notConfigured") break; // 模型未配置：剩余分镜走模拟
          simulationIds.delete(id);
          submitted.push({ id, taskId: result.taskId });
        } catch {
          simulationIds.delete(id);
          applyShotPatch(new Set([id]), (s) => ({ ...s, status: "失败" }));
        }
      }

      if (simulationIds.size > 0) simulateGeneration(simulationIds, simulateDelayMs);
      if (submitted.length === 0) return;

      const pending = new Map(submitted.map((t) => [t.id, t.taskId]));
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS && pending.size > 0; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        for (const [id, taskId] of pending) {
          try {
            const result = await pollShotVideo(taskId);
            if (result.kind === "succeeded") {
              pending.delete(id);
              applyShotPatch(new Set([id]), (s) => ({
                ...s,
                status: "已生成",
                videoUrl: result.videoUrl,
              }));
            } else if (result.kind === "failed") {
              pending.delete(id);
              applyShotPatch(new Set([id]), (s) => ({ ...s, status: "失败" }));
            }
          } catch {
            // 单次查询失败不终止其他任务；连续失败最终按超时处理
          }
        }
      }
      if (pending.size > 0) {
        applyShotPatch(new Set(pending.keys()), (s) => ({ ...s, status: "失败" }));
      }
    },
    [shots, markStatus, applyShotPatch, simulateGeneration],
  );

  const generateShot = useCallback(
    (id: string) => {
      void runGeneration(new Set([id]), 1500);
    },
    [runGeneration],
  );

  const batchGenerate = useCallback(() => {
    const ids = new Set(
      shots.filter((s) => s.status === "未开始").map((s) => s.id),
    );
    if (ids.size === 0) return;
    void runGeneration(ids, 2000);
  }, [shots, runGeneration]);

  return {
    episodes,
    shots,
    episodeShots,
    activeEpisode,
    setActiveEpisode,
    subView,
    setSubView,
    descriptions,
    prompts,
    episodeProgress,
    addShot,
    updateDescription,
    updatePrompt,
    generateShot,
    batchGenerate,
  };
}
