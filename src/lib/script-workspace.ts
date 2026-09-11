export interface ScriptAgentConfig {
  name: string;
  role: string;
  style: string;
  preserveDialogue: boolean;
  skills: { id: string; name: string; instruction: string; enabled: boolean }[];
}
export interface ScriptRevision {
  id: string;
  createdAt: string;
  label: string;
  content: string;
  instruction?: string;
  config?: ScriptAgentConfig;
}
export interface ScriptWorkspace {
  draft: string;
  revisions: ScriptRevision[];
  config: ScriptAgentConfig;
}
export const DEFAULT_SCRIPT_AGENT: ScriptAgentConfig = {
  name: "剧本创编助手",
  role: "协助创作者检查叙事结构、主角动机和场景衔接。不得擅自改变核心剧情。",
  style: "保留原作风格，优先使用可拍摄的动作与对白。",
  preserveDialogue: true,
  skills: [
    { id: "structure", name: "结构检查", instruction: "检查开场目标、冲突升级、转折与结尾是否连贯。", enabled: true },
    { id: "character", name: "人物动机", instruction: "检查主角目标、行为和人物关系是否一致。", enabled: true },
    { id: "scene", name: "场景连续性", instruction: "检查时间、地点、道具和人物出入场的衔接。", enabled: true },
  ],
};

export function buildScriptRequest(content: string, instruction: string, config: ScriptAgentConfig): string {
  if (!instruction.trim()) throw new Error("请填写创编要求");
  return [
    `【助手】${config.name}\n${config.role}`,
    `【风格】${config.style}`,
    config.preserveDialogue ? "【约束】保留原有对白；如需调整，先说明原因。" : "【约束】对白可调整，但不得擅自改变剧情事实。",
    `【技能】\n${config.skills.filter((skill) => skill.enabled).map((skill) => `${skill.name}：${skill.instruction}`).join("\n") || "未启用技能"}`,
    `【创编要求】\n${instruction.trim()}`,
    `【剧本原文】\n${content}`,
    "【输出】先列修改理由，再输出修改后的剧本。所有改动须由创作者确认。",
  ].join("\n\n");
}

export function appendRevision(workspace: ScriptWorkspace, content: string, label: string, instruction?: string): ScriptWorkspace {
  return {
    ...workspace,
    draft: content,
    revisions: [...workspace.revisions, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), label, content, instruction, config: structuredClone(workspace.config) }],
  };
}
