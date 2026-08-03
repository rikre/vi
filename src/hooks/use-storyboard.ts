"use client";

import { useMemo, useState, useCallback } from "react";
import type { ShortDramaProject, Episode, ShotItem } from "@/lib/mock-projects";
import { updateProject, getProject } from "@/lib/project-store";

function buildPlaceholderEpisodes(total: number): Episode[] {
  return Array.from({ length: Math.max(1, total) }, (_, i) => ({
    id: `ep-${i + 1}`,
    number: i + 1,
    title: `第${i + 1}集`,
    status: i === 0 ? "进行中" : ("未开始" as const),
    progress: i === 0 ? 30 : 0,
  }));
}

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

  const generateShot = useCallback(
    (id: string) => {
      const generating = shots.map((s) =>
        s.id === id ? { ...s, status: "生成中" as const } : s,
      );
      updateProject(project.id, { shots: generating });

      setTimeout(() => {
        const latest = getProject(project.id);
        if (latest?.type === "short") {
          const done = (latest.shots ?? []).map((s) =>
            s.id === id ? { ...s, status: "已生成" as const } : s,
          );
          updateProject(project.id, { shots: done });
        }
      }, 1500);
    },
    [shots, project.id],
  );

  const batchGenerate = useCallback(() => {
    const ids = new Set(
      shots.filter((s) => s.status === "未开始").map((s) => s.id),
    );
    if (ids.size === 0) return;

    const generating = shots.map((s) =>
      ids.has(s.id) ? { ...s, status: "生成中" as const } : s,
    );
    updateProject(project.id, { shots: generating });

    setTimeout(() => {
      const latest = getProject(project.id);
      if (latest?.type === "short") {
        const done = (latest.shots ?? []).map((s) =>
          ids.has(s.id) ? { ...s, status: "已生成" as const } : s,
        );
        updateProject(project.id, { shots: done });
      }
    }, 2000);
  }, [shots, project.id]);

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
