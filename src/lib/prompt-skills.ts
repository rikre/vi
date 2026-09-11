import { z } from "zod";

export const promptModeSchema = z.enum(["storyboard", "polish", "cleanup"]);
export type PromptMode = z.infer<typeof promptModeSchema>;
export const PROMPT_MODES: Record<PromptMode, string> = {
  storyboard: "分镜提示词",
  polish: "单视频润色",
  cleanup: "去瑕疵",
};
export const skillSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(30),
  mode: promptModeSchema,
  instruction: z.string().trim().min(1).max(2000),
});
export type PromptSkill = z.infer<typeof skillSchema>;
export const BUILTIN_SKILLS: PromptSkill[] = [
  { id: "story", name: "镜头叙事", mode: "storyboard", instruction: "围绕一个主要动作组织镜头，交代主体、环境、景别和运动方向；不添加原文没有的人物或剧情。" },
  { id: "motion", name: "动作与运镜", mode: "polish", instruction: "明确动作的起点、过程和终点。每个镜头只保留一个主运镜，避免同时推近与拉远。" },
  { id: "continuity", name: "角色一致性", mode: "cleanup", instruction: "保持人物面部、服装、道具和光线连续，不改变人物身份，不增删肢体，避免穿模。" },
  { id: "clean", name: "画面稳定", mode: "cleanup", instruction: "避免画面闪烁、纹理抖动、背景漂移和物体突然出现。非剧情需要时不添加字幕或水印。" },
];

export function inspectPrompt(source: string): string[] {
  const warnings: string[] = [];
  if (/推近|推进/.test(source) && /拉远|拉出/.test(source)) warnings.push("同时出现推近与拉远，请确认是否为先后动作。");
  if (/固定镜头/.test(source) && /环绕|手持|跟拍/.test(source)) warnings.push("固定镜头与移动运镜并存，建议保留一种主运镜。");
  if (source.length > 3000) warnings.push("描述较长，建议按独立动作拆分镜头。");
  return warnings;
}

/** 本地规则编排，不冒充模型生成；不删除或改写原始剧情。 */
export function buildPrompt(source: string, mode: PromptMode, skills: PromptSkill[]): string {
  if (!source.trim()) throw new Error("请先填写分镜内容或视频提示词");
  const rules = skills.filter((skill) => skill.mode === mode).map((skill) => skill.instruction);
  const heading = mode === "storyboard" ? "分镜内容" : "原始提示词";
  return [
    `【${heading}】\n${source.trim()}`,
    rules.length ? `【创作规则】\n${rules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}` : "",
    mode === "cleanup" ? "【复核要求】\n检查角色、动作、运镜与画面连续性；发现冲突时交由创作者确认，不自行改变剧情。" : "【输出要求】\n主体、动作、场景和镜头语言保持清晰；未提供的信息不作事实补充。",
  ].filter(Boolean).join("\n\n");
}
