import { z } from "zod";

export const CREATION_STAGES = ["storyboard", "assets", "polish"] as const;
export type CreationStage = typeof CREATION_STAGES[number];
export const STAGE_META: Record<CreationStage, { title: string; description: string }> = {
  storyboard: { title: "分镜 Agent", description: "剧本拆镜、镜头语言与分镜提示词" },
  assets: { title: "资产提炼 Agent", description: "角色、场景、道具与一致性规则" },
  polish: { title: "提示词润色", description: "图片与视频提示词的表达优化" },
};
const presetSchema = z.object({ id: z.string(), name: z.string().trim().min(1).max(40), rules: z.string().trim().min(1).max(4000) });
const stageSchema = z.object({ selectedId: z.string(), presets: z.array(presetSchema).min(1).max(20) }).refine((value) => value.presets.some((preset) => preset.id === value.selectedId), "请选择有效方案");
export const creationSettingsSchema = z.object({ storyboard: stageSchema, assets: stageSchema, polish: stageSchema });
export type CreationSettings = z.infer<typeof creationSettingsSchema>;
export const DEFAULT_CREATION_SETTINGS: CreationSettings = {
  storyboard: { selectedId: "narrative", presets: [
    { id: "narrative", name: "叙事分镜", rules: "按剧情目标拆分镜头。明确景别、角色动作、场景与运镜；不增加原文没有的剧情事实。" },
    { id: "remake", name: "重绘还原", rules: "保持原分镜顺序、构图、人物关系和动作连续性，只调整用户指定的画面风格。" },
  ] },
  assets: { selectedId: "consistent", presets: [
    { id: "consistent", name: "一致性提炼", rules: "分别提取角色、场景、道具。合并同一对象的别名，保留服装、外观、时代背景；缺失信息标记待确认。" },
    { id: "minimal", name: "精简资产", rules: "仅提取实际出场并影响剧情的角色、场景和道具，避免重复资产，不补造角色。" },
  ] },
  polish: { selectedId: "clear", presets: [
    { id: "clear", name: "清晰表达", rules: "按主体、动作、环境、镜头组织提示词。删除重复修饰，保留原意；冲突交由用户确认。" },
    { id: "stable", name: "画面稳定", rules: "保持角色外观、服装与光线连续，避免运镜冲突、纹理闪烁、肢体畸变和道具漂移。" },
  ] },
};
export function activeCreationPreset(settings: CreationSettings, stage: CreationStage) {
  const config = settings[stage];
  return config.presets.find((preset) => preset.id === config.selectedId) ?? config.presets[0];
}
export function buildCreationRequest(settings: CreationSettings, stage: CreationStage, source: string) {
  if (!source.trim()) throw new Error("请先填写测试内容");
  const preset = activeCreationPreset(settings, stage);
  return `【环节】${STAGE_META[stage].title}\n【方案】${preset.name}\n【规则】\n${preset.rules}\n\n【输入】\n${source.trim()}\n\n【约束】仅处理当前输入，不改变未指定的剧情事实；结果需用户确认。`;
}
