// 广场数据 — 详情页与列表页共享

export type ScriptType =
  | "original"          // 凭剧本
  | "breakdown"         // 拉片
  | "ip-adaptation"     // IP 改编
  | "script-adaptation";// 剧本改编

export type Script = {
  id: string;
  type: ScriptType;
  title: string;
  tags: string[];
  episodes: number;
  words: string;
  price: number;
  sold: boolean;
  prompt: string;
  subtitle?: string;
  synopsis?: string;
  // 不同类型的扩展字段
  source?: string;       // 拉片/IP 改编/剧本改编：来源作品
  author?: string;       // 编剧/拉片师
};

export const SCRIPT_TYPE_META: Record<
  ScriptType,
  { label: string; short: string; color: string; dot: string; desc: string }
> = {
  "original": {
    label: "凭剧本",
    short: "原创",
    color: "text-[#D4FF3F] bg-[#D4FF3F]/15 ring-[#D4FF3F]/30",
    dot: "bg-[#D4FF3F]",
    desc: "完全原创剧本",
  },
  "breakdown": {
    label: "拉片",
    short: "拉片",
    color: "text-[#7dffe6] bg-[#00e5c8]/15 ring-[#00e5c8]/30",
    dot: "bg-[#00e5c8]",
    desc: "经典作品逐镜头拆解",
  },
  "ip-adaptation": {
    label: "IP 改编",
    short: "IP 改编",
    color: "text-[#c4b5fd] bg-[#a78bfa]/15 ring-[#a78bfa]/30",
    dot: "bg-[#a78bfa]",
    desc: "基于已有 IP 改编",
  },
  "script-adaptation": {
    label: "剧本改编",
    short: "剧本改编",
    color: "text-[#fdba74] bg-[#fb923c]/15 ring-[#fb923c]/30",
    dot: "bg-[#fb923c]",
    desc: "已有剧本再创作",
  },
};

export const SCRIPT_TYPE_ORDER: ScriptType[] = [
  "original",
  "breakdown",
  "ip-adaptation",
  "script-adaptation",
];

export const SCRIPTS: Script[] = [
  // ============ 凭剧本（原创） ============
  {
    id: "1",
    type: "original",
    title: "画灵觉醒",
    tags: ["男频", "都市异能", "中式美学"],
    episodes: 20,
    words: "1.2万字",
    price: 5800,
    sold: true,
    prompt: "chinese ink fantasy drama poster, mystical painter awakening powers, no text",
    subtitle: "千年画灵复苏，古老笔墨重写都市命运。",
    author: "墨染青衣",
  },
  {
    id: "2",
    type: "original",
    title: "纸扎铺凌晨开门",
    tags: ["女频", "影视", "权谋"],
    episodes: 20,
    words: "6537字",
    price: 4200,
    sold: true,
    prompt: "dark chinese supernatural drama poster, paper effigy shop at night, no text",
    subtitle: "凌晨开门的纸扎铺，接的不是活人的单。",
    author: "小楼听雨",
  },

  // ============ 拉片（经典作品逐镜头分析） ============
  {
    id: "3",
    type: "breakdown",
    title: "《漫长的季节》· 火车拉片",
    tags: ["男频", "权谋", "影视"],
    episodes: 12,
    words: "2.1万字",
    price: 3600,
    sold: false,
    prompt: "rainy night chinese crime thriller poster, detective chase, no text",
    subtitle: "一集一拆，复盘 12 集悬疑巅峰的镜头语言。",
    author: "青锋照影",
    source: "《漫长的季节》",
  },
  {
    id: "4",
    type: "breakdown",
    title: "《漫长的季节》· 王响人物线",
    tags: ["女频", "世家", "职场"],
    episodes: 12,
    words: "1.8万字",
    price: 4800,
    sold: true,
    prompt: "chinese campus mystery romance drama poster, night school fire, no text",
    subtitle: "王响二十年执念的人物弧光完整拆解。",
    author: "青锋照影",
    source: "《漫长的季节》",
  },

  // ============ IP 改编 ============
  {
    id: "5",
    type: "ip-adaptation",
    title: "她在凶宅直播",
    tags: ["女频", "末日", "双强"],
    episodes: 20,
    words: "1.8万字",
    price: 5200,
    sold: false,
    prompt: "chinese livestream horror comedy poster, girl in haunted house, no text",
    subtitle: "百万粉丝凶宅直播，真鬼比黑粉更刺激。",
    author: "北风知我",
    source: "同名网络小说《她在凶宅直播》",
  },
  {
    id: "6",
    type: "ip-adaptation",
    title: "雾港归航",
    tags: ["女频", "权谋", "群像"],
    episodes: 20,
    words: "1.1万字",
    price: 4500,
    sold: true,
    prompt: "chinese maritime mystery drama poster, foggy harbor ship, no text",
    subtitle: "雾港归来的客船，载着二十年前的失踪者。",
    author: "墨染青衣",
    source: "晋江文学城《雾港归航》",
  },

  // ============ 剧本改编 ============
  {
    id: "7",
    type: "script-adaptation",
    title: "《甄嬛传》· 现代职场版",
    tags: ["女频", "宫斗", "职场"],
    episodes: 60,
    words: "3.5万字",
    price: 6800,
    sold: false,
    prompt: "modern office drama poster, female executive in power suit, corporate intrigue, no text",
    subtitle: "把后宫搬到写字楼，权谋戏码一比一还原。",
    author: "小楼听雨",
    source: "《甄嬛传》原剧本",
  },
  {
    id: "8",
    type: "script-adaptation",
    title: "《三体》· 古风短剧版",
    tags: ["男频", "科幻", "古风"],
    episodes: 30,
    words: "4.2万字",
    price: 8800,
    sold: true,
    prompt: "ancient chinese sci-fi poster, star map in scroll, cosmic destiny, no text",
    subtitle: "把三体宇宙搬进江湖门派，文明碰撞全新解法。",
    author: "北风知我",
    source: "刘慈欣《三体》",
  },
];

export function getScriptById(id: string | string[] | undefined): Script | null {
  if (!id || Array.isArray(id)) return null;
  return SCRIPTS.find((s) => s.id === id) ?? null;
}

export function getScriptsByType(type: ScriptType | "all"): Script[] {
  if (type === "all") return SCRIPTS;
  return SCRIPTS.filter((s) => s.type === type);
}

export function countScriptsByType(type: ScriptType): number {
  return SCRIPTS.filter((s) => s.type === type).length;
}
