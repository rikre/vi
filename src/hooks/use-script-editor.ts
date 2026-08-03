"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScriptChapter, ShortDramaProject } from "@/lib/mock-projects";
import { updateProject } from "@/lib/project-store";

export type AspectRatio = "16:9" | "9:16" | "4:3" | "3:4";
export type CreateMode = "AI真人剧" | "AI漫剧" | "自定义";

export function useScriptEditor(project: ShortDramaProject) {
  const baseChapters = useMemo<ScriptChapter[]>(
    () =>
      project.scriptChapters ?? [
        { id: "chapter-1", title: "第1章", content: project.scriptContent ?? "" },
      ],
    [project.scriptChapters, project.scriptContent],
  );

  const [chapters, setChapters] = useState<ScriptChapter[]>(baseChapters);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    baseChapters[0]?.id ?? "",
  );
  const [isAnalyzingScript, setIsAnalyzingScript] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [aspect, setAspect] = useState<AspectRatio>("16:9");
  const [mode, setMode] = useState<CreateMode>("AI漫剧");
  const [styleRef, setStyleRef] = useState("现代短剧");
  const [directorNote, setDirectorNote] = useState("");

  // 1.1 秒后自动关闭解析中状态
  useEffect(() => {
    const t = setTimeout(() => setIsAnalyzingScript(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const updateChapter = useCallback(
    (id: string, content: string) => {
      const updatedChapters = chapters.map((c) =>
        c.id === id ? { ...c, content } : c,
      );
      setChapters(updatedChapters);
      updateProject(project.id, { scriptChapters: updatedChapters });
    },
    [chapters, project.id],
  );

  const addChapter = useCallback(() => {
    const nextIndex = chapters.length + 1;
    const newChapter: ScriptChapter = {
      id: `chapter-${Date.now()}`,
      title: `第${nextIndex}章`,
      content: "",
    };
    const updatedChapters = [...chapters, newChapter];
    setChapters(updatedChapters);
    setActiveChapterId(newChapter.id);
    updateProject(project.id, { scriptChapters: updatedChapters });
  }, [chapters, project.id]);

  const extractAssets = useCallback(() => {
    setIsExtracting(true);
    setExtractProgress(0);
    setTimeout(() => setExtractProgress(1), 500);
    setTimeout(() => setExtractProgress(2), 1000);
    setTimeout(() => {
      setExtractProgress(3);
      const extractedCharacters = [
        {
          id: `ext-c1-${Date.now()}`,
          name: "主角",
          role: "主角",
          description: "从剧本提取的核心角色",
        },
        {
          id: `ext-c2-${Date.now()}`,
          name: "配角",
          role: "配角",
          description: "从剧本提取的配角",
        },
      ];
      const extractedAssets = {
        total: extractedCharacters.length + chapters.length + 2,
        characters: extractedCharacters.length,
        scenes: chapters.length,
        props: 2,
      };
      updateProject(project.id, {
        characters: extractedCharacters,
        assets: extractedAssets,
      });
      setIsExtracting(false);
    }, 1500);
  }, [project.id, chapters]);

  return {
    chapters,
    activeChapterId,
    setActiveChapterId,
    isAnalyzingScript,
    isExtracting,
    extractProgress,
    updateChapter,
    addChapter,
    extractAssets,
    aspect,
    setAspect,
    mode,
    setMode,
    styleRef,
    setStyleRef,
    directorNote,
    setDirectorNote,
  };
}
