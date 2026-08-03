"use client";

import { useCallback, useMemo, useState } from "react";
import type { Episode, ShortDramaProject } from "@/lib/mock-projects";
import { getProject, updateProject } from "@/lib/project-store";

export function useFilmAssembly(project: ShortDramaProject) {
  const episodes = useMemo<Episode[]>(
    () => project.episodeList ?? [],
    [project.episodeList],
  );

  const subtitles = project.scriptContent ?? "";

  const setSubtitles = useCallback(
    (text: string) => {
      updateProject(project.id, { scriptContent: text });
    },
    [project.id],
  );

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [generatingShotIds, setGeneratingShotIds] = useState<Set<string>>(
    () => new Set(),
  );

  const readShots = useCallback(() => {
    const latest = getProject(project.id);
    if (latest && latest.type === "short") return latest.shots ?? [];
    return project.shots ?? [];
  }, [project.id, project.shots]);

  const generateShotVideo = useCallback(
    (shotId: string) => {
      const pending = readShots().map((s) =>
        s.id === shotId ? { ...s, status: "生成中" as const } : s,
      );
      updateProject(project.id, { shots: pending });
      setGeneratingShotIds((prev) => new Set(prev).add(shotId));

      window.setTimeout(() => {
        const done = readShots().map((s) =>
          s.id === shotId ? { ...s, status: "已生成" as const } : s,
        );
        updateProject(project.id, { shots: done });
        setGeneratingShotIds((prev) => {
          const next = new Set(prev);
          next.delete(shotId);
          return next;
        });
      }, 1500);
    },
    [project.id, readShots],
  );

  const exportVideo = useCallback(() => {
    setIsExporting(true);
    setExportSuccess(false);
    window.setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      window.setTimeout(() => setExportSuccess(false), 2000);
    }, 2000);
  }, []);

  const downloadVideo = useCallback(() => {
    console.log("[film-assembly] downloadVideo() called — simulated no-op");
  }, []);

  return {
    episodes,
    subtitles,
    setSubtitles,
    generateShotVideo,
    generatingShotIds,
    exportVideo,
    downloadVideo,
    isExporting,
    exportSuccess,
  };
}
