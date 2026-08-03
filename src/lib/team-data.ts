/**
 * 团队效能看板 mock 数据
 * 迁移自 vibe-video TeamDashboard.tsx / data.ts
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type DashboardTab = "效能" | "团队" | "成员" | "流水";
export type RangeKey = "今日" | "昨日" | "近 7 天" | "近 30 天" | "自定义";

export interface KpiCard {
  key: string;
  label: string;
  value: string;
  unit: string;
  delta: number;
  up: boolean;
  tone: "lime" | "blue" | "violet";
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface RankItem {
  rank: number;
  name: string;
  share: number;
  duration: string;
  points: string;
  color: string;
  team?: string;
}

export interface GenTypeItem {
  name: string;
  share: number;
  duration: string;
  count: string;
  points: string;
  pct: string;
  color: string;
}

export interface TeamRow {
  name: string;
  points: string;
  members: number;
  note: string;
  createdAt: string;
}

export interface MemberRow {
  name: string;
  contact: string;
  status: "已接受" | "待接受";
  channel: string;
  time: string;
}

export interface LedgerRow {
  action: string;
  change: number;
  balance: string;
  target: string;
  note: string;
  time: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

export const DASHBOARD_TABS: DashboardTab[] = ["效能", "团队", "成员", "流水"];
export const RANGE_OPTIONS: RangeKey[] = ["今日", "昨日", "近 7 天", "近 30 天", "自定义"];

export const KPI_CARDS: KpiCard[] = [
  { key: "points", label: "总算力积分消耗", value: "738,127", unit: "PT", delta: 15.4, up: true, tone: "lime" },
  { key: "duration", label: "生成总时长", value: "43,625", unit: "秒", delta: 21.4, up: true, tone: "blue" },
  { key: "tasks", label: "生成任务次数", value: "4,360", unit: "次", delta: -27.3, up: false, tone: "violet" },
];

export const TREND_DATA: TrendPoint[] = [
  { date: "06-27", value: 148000 },
  { date: "06-28", value: 38000 },
  { date: "06-29", value: 205000 },
  { date: "06-30", value: 178000 },
  { date: "07-01", value: 172000 },
  { date: "07-02", value: 22000 },
  { date: "07-03", value: 8000 },
];

export const PROJECT_RANK: RankItem[] = [
  { rank: 1, name: "朕真不想当皇帝啊AI版", share: 52.7, duration: "22,462", points: "388,655", color: "#d9f43c" },
  { rank: 2, name: "惊澜入翠微", share: 21.3, duration: "9,455", points: "157,524", color: "#5f9df6" },
  { rank: 3, name: "雾隐山城", share: 14.5, duration: "6,321", points: "107,652", color: "#4cc391" },
  { rank: 4, name: "非项目", share: 8.6, duration: "3,645", points: "63,126", color: "#f0625f" },
  { rank: 5, name: "30", share: 2.9, duration: "1,415", points: "21,170", color: "#a78bfa" },
];

export const GROUP_SHARE: RankItem[] = [
  { rank: 0, name: "杭州 | 王导组", share: 94.3, duration: "40,781", points: "695,741", color: "#d9f43c" },
  { rank: 0, name: "杭州 | 张导组", share: 5.7, duration: "2,844", points: "42,386", color: "#5f9df6" },
];

export const MEMBER_RANK: RankItem[] = [
  { rank: 1, name: "王大锤", team: "杭州 | 王导组", share: 0, duration: "6,120", points: "112,340", color: "#d9f43c" },
  { rank: 2, name: "费宇晨", team: "杭州 | 王导组", share: 0, duration: "5,750", points: "99,496", color: "#5f9df6" },
  { rank: 3, name: "陈焕林", team: "杭州 | 王导组", share: 0, duration: "4,653", points: "86,691", color: "#4cc391" },
  { rank: 4, name: "潘纯惠", team: "杭州 | 王导组", share: 0, duration: "5,553", points: "84,931", color: "#f0625f" },
  { rank: 5, name: "谢雁雄", team: "杭州 | 王导组", share: 0, duration: "4,239", points: "76,378", color: "#a78bfa" },
];

export const GEN_TYPES: GenTypeItem[] = [
  { name: "多参考视频", share: 97.88, duration: "39,427", count: "2,921", points: "722,449", pct: "97.9%", color: "#d9f43c" },
  { name: "图生图", share: 1.14, duration: "0", count: "755", points: "8,453", pct: "1.1%", color: "#4cc391" },
  { name: "文生图", share: 0.48, duration: "0", count: "358", points: "3,560", pct: "0.5%", color: "#5bc8d6" },
  { name: "视频擦除", share: 0.28, duration: "3,855", count: "278", points: "2,037", pct: "0.3%", color: "#f0625f" },
  { name: "图生视频", share: 0.18, duration: "75", count: "5", points: "1,350", pct: "0.2%", color: "#a78bfa" },
  { name: "智能擦字幕", share: 0.02, duration: "0", count: "12", points: "160", pct: "0.02%", color: "#ff8a5c" },
  { name: "文生音乐", share: 0.02, duration: "0", count: "8", points: "120", pct: "0.02%", color: "#f6c453" },
  { name: "视频超分", share: 0.0, duration: "0", count: "2", points: "30", pct: "0%", color: "#9aa0a6" },
];

export const TEAM_KPIS = [
  { label: "主账号总积分", value: "510,000" },
  { label: "已分配至团队积分", value: "1,770,000" },
  { label: "已回收团队积分", value: "280,000" },
  { label: "团队数量", value: "4" },
];

export const TEAM_LIST: TeamRow[] = [
  { name: "武汉 | 世豪", points: "300,000", members: 5, note: "-", createdAt: "2026-06-26" },
  { name: "北京 | 一文组", points: "200,000", members: 2, note: "-", createdAt: "2026-06-26" },
  { name: "杭州 | 王导组", points: "220,212", members: 21, note: "migrated legacy team", createdAt: "2026-06-25" },
  { name: "杭州 | 张导组", points: "102,718", members: 15, note: "migrated legacy team", createdAt: "2026-06-25" },
];

export const MEMBER_LIST: MemberRow[] = [
  { name: "Serendipity_WSH__", contact: "wechat_oOxhx2U@wechat.local", status: "已接受", channel: "邀请链接", time: "2026-07-02" },
  { name: "406786768", contact: "406786768@qq.com", status: "待接受", channel: "邮件邀请", time: "2026-07-02" },
  { name: "maohongyi", contact: "maohongyi@hrcentury.cn", status: "待接受", channel: "邮件邀请", time: "2026-07-02" },
  { name: "haojinghan", contact: "haojinghan@hrcentury.cn", status: "待接受", channel: "邮件邀请", time: "2026-07-02" },
  { name: "hanjiayi", contact: "hanjiayi@hrcentury.cn", status: "待接受", channel: "邮件邀请", time: "2026-07-02" },
];

export const LEDGER_LIST: LedgerRow[] = [
  { action: "分配给团队", change: -300000, balance: "810,000 → 510,000", target: "武汉 | 世豪", note: "-", time: "2026-07-02" },
  { action: "分配给团队", change: -200000, balance: "1,010,000 → 810,000", target: "北京 | 一文组", note: "-", time: "2026-07-02" },
  { action: "公司入账", change: 1000000, balance: "10,000 → 1,010,000", target: "-", note: "manual top up", time: "2026-07-01" },
  { action: "分配给团队", change: -100000, balance: "110,000 → 10,000", target: "杭州 | 王导组", note: "-", time: "2026-07-01" },
  { action: "分配给团队", change: -100000, balance: "210,000 → 110,000", target: "杭州 | 张导组", note: "-", time: "2026-07-01" },
  { action: "分配给团队", change: -500000, balance: "710,000 → 210,000", target: "杭州 | 王导组", note: "-", time: "2026-06-29" },
  { action: "从团队回收", change: 280000, balance: "430,000 → 710,000", target: "杭州 | 王导组", note: "-", time: "2026-06-27" },
  { action: "分配给团队", change: -500000, balance: "930,000 → 430,000", target: "杭州 | 王导组", note: "-", time: "2026-06-27" },
  { action: "分配给团队", change: -50000, balance: "980,000 → 930,000", target: "杭州 | 王导组", note: "-", time: "2026-06-27" },
  { action: "分配给团队", change: -10000, balance: "990,000 → 980,000", target: "杭州 | 张导组", note: "测试一下", time: "2026-06-26" },
];

export const ALL_MEMBERS = ["所有成员", "常谦", "张三", "李四", "王五", "赵六"];
