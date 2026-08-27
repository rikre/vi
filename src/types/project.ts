// 项目工作台共享类型

export type ProjectSubTab = "概览" | "剧本" | "资产" | "分镜" | "成片";

export type RemakeStep = "原片" | "设定" | "分镜" | "视频";

// ─── 引用体系（广场 → 引用 → 项目）─────────────────────────────────────────

// 引用来源的业务类型
export type ReferenceType =
  | "hotwork"
  | "novel"
  | "trend"
  | "ai_answer"
  | "user_file";

// 5 色证据徽章：真实数据 / 站内资产 / 模型分析 / 市场估算 / 信息缺失
export type EvidenceType =
  | "real_data"
  | "internal_asset"
  | "model_analysis"
  | "market_estimate"
  | "missing";

export interface Reference {
  type: ReferenceType;
  id: string;
  title: string;
  evidenceType: EvidenceType;
}

// ─── Agent 执行状态面板 ──────────────────────────────────────────────────────

export type AgentStepStatus = "pending" | "running" | "done" | "failed";

export interface AgentStep {
  id: string;
  label: string;
  status: AgentStepStatus;
  startedAt?: string;
  finishedAt?: string;
  note?: string;
}

export interface AgentRun {
  agentName: string;
  currentLabel: string;
  progress: number;
  etaSeconds?: number;
  costPaid: number;
  costEstimate: number;
  steps: AgentStep[];
  failedReason?: string;
}

// ─── 项目详情/新建页面（/project/[id]、/project/new）────────────────────────

export type ProjectTab =
  | "overview"
  | "script"
  | "evaluation"
  | "rewrite"
  | "assets"
  | "breakdown"
  | "references";

// ─── 剧本评估（evaluation tab）──────────────────────────────────────────────

export interface ProjectEvaluation {
  totalScore: number;
  rating: string;
  dimensions: {
    dimension: string;
    score: number;
    maxScore: number;
    issues: string[];
  }[];
}

// ─── AI 拉片（breakdown tab）────────────────────────────────────────────────

export interface BreakdownShot {
  id: string;
  time: string;
  scene: string;
  action: string;
  camera?: string;
  dialog?: string;
}

export interface ProjectBreakdown {
  videoTitle: string;
  duration: string;
  shots: BreakdownShot[];
}

// ─── 改写版本树（rewrite tab）───────────────────────────────────────────────

export interface RewriteVersion {
  id: string;
  label: string;
  createdAt: string;
  intensity: string;
  active: boolean;
}

export interface RewriteDiff {
  id: string;
  scene: string;
  delta: number;
  original: string;
  revised: string;
  reason: string;
}

export interface ProjectRewrite {
  versions: RewriteVersion[];
  diffs: RewriteDiff[];
}

// ─── Agent 执行（breakdown/short 等长任务）──────────────────────────────────

export interface ProjectAgent extends AgentRun {
  kind: "breakdown" | "short" | "original" | "rewrite";
}

// ─── 新建项目（/project/new）───────────────────────────────────────────────

export type CreateAction =
  | "original"
  | "evaluate"
  | "rewrite"
  | "import"
  | "breakdown"
  | "short";

export type ProjectConfig =
  | {
      action: "short";
      mode: "agent" | "manual";
      shortMode: "剧本模式" | "分镜模式";
      style: string;
      tone: string;
      ratio: string;
    }
  | {
      action: "original";
      idea: string;
      audience: string;
      genre: string;
      setting: string;
      episodes: number;
    }
  | {
      action: "import";
      source: string;
      contentType: string;
      tags: string[];
      nextAction: string;
    }
  | {
      action: "breakdown";
      mode: string;
      input: string;
      outputAssets: string[];
    };
