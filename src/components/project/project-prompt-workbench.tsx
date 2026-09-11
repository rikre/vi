"use client";

import { useSyncExternalStore } from "react";
import { getProject, subscribeToProjects, updateProject } from "@/lib/project-store";
import { PromptWorkbench, type PromptSource } from "@/components/skill/prompt-workbench";
import { activeCreationPreset, DEFAULT_CREATION_SETTINGS } from "@/lib/creation-settings";

export function ProjectPromptWorkbench({ projectId }: { projectId: number }) {
  const project = useSyncExternalStore(subscribeToProjects, () => getProject(projectId), () => undefined);
  if (!project) return null;
  const config = project.creationSettings ?? DEFAULT_CREATION_SETTINGS;
  const projectRules = { storyboard: activeCreationPreset(config, "storyboard").rules, polish: activeCreationPreset(config, "polish").rules, cleanup: activeCreationPreset(config, "polish").rules };
  const sources: PromptSource[] = project.type === "short" && project.shots?.length
    ? project.shots.map((shot) => ({ id: shot.id, label: `第 ${shot.episode} 集 · 镜头 ${shot.index}`, content: `场景：${shot.scene}\n角色：${shot.characters.join("、") || "未指定"}\n内容：${shot.description}\n时长：${shot.duration}`, prompt: shot.prompt }))
    : (project.breakdown?.shots ?? []).map((shot) => ({ id: shot.id, label: `${shot.time} · ${shot.scene}`, content: `场景：${shot.scene}\n动作：${shot.action}\n运镜：${shot.camera || "未指定"}\n对白：${shot.dialog || "无"}`, prompt: shot.prompt }));
  return <PromptWorkbench key={projectId} projectRules={projectRules} sources={sources} onApply={project.type === "short" ? (id, prompt) => {
    const latest = getProject(projectId);
    if (latest?.type !== "short") return;
    if (latest.shots?.some((shot) => shot.id === id)) {
      updateProject(projectId, { shots: latest.shots.map((shot) => shot.id === id ? { ...shot, prompt } : shot) });
    } else if (latest.breakdown) {
      updateProject(projectId, { breakdown: { ...latest.breakdown, shots: latest.breakdown.shots.map((shot) => shot.id === id ? { ...shot, prompt } : shot) } });
    }
    const saved = getProject(projectId);
    const actual = saved?.type === "short"
      ? saved.shots?.find((shot) => shot.id === id)?.prompt ?? saved.breakdown?.shots.find((shot) => shot.id === id)?.prompt
      : undefined;
    if (actual !== prompt) throw new Error("保存失败，请检查浏览器存储空间或复制提示词备份。");
  } : undefined} />;
}
