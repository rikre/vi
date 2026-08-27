// ─── Plaza Types (广场 4 分区) ───────────────────────────────────────────────

export type PlazaTab =
  | "scripts" // 题材剧本库
  | "ranking" // 短剧爆款榜
  | "novel" // 网文风向标
  | "trending" // 热点信号
  | "orders" // 项目接单（辅助）
  | "writers"; // 编剧推荐（辅助）

// ─── 短剧爆款榜 ──────────────────────────────────────────────────────────────

export type WorkBackground =
  | "现代" | "都市" | "古代" | "乡村" | "年代" | "架空" | "职场" | "校园";

export interface HotWork {
  id: string;
  rank: number;
  title: string;
  episodes: number;
  synopsis: string;
  tags: string[];
  source: "红果" | "番茄" | "抖音" | "其他";
  sourceUrl: string;
  launchAt: string; // 上新时间（ISO 日期）
  background: WorkBackground;
  theme: string[];
  setting: string[];
  audience: "男频" | "女频";
}

// ─── 网文风向标 ──────────────────────────────────────────────────────────────

export interface NovelTrend {
  id: string;
  rank: number;
  title: string;
  author: string;
  type: string;
  words: string;
  synopsis: string;
  source: "起点" | "番茄" | "其他";
  sourceUrl: string;
  adaptationPotential: number; // 0-100
  suitableMode: "实拍" | "AIGC" | "不限";
  recommendedEpisodes: number;
}

// ─── 热点信号 ────────────────────────────────────────────────────────────────

export interface TrendSignal {
  id: string;
  title: string;
  source: "微博" | "知乎" | "其他";
  sourceUrl?: string;
  heatScore: number;
  growthRate: number;
  emotions: string[];
  narrativeThemes: string[];
  adaptationAdvice: string;
  riskLevel: "low" | "medium" | "high";
  riskNote?: string;
  capturedAt: string;
}
