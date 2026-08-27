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

// ─── 短剧爆款榜 ─────────────────────────────────────────────────────────────

import type { HotWork, NovelTrend, TrendSignal } from "@/types/plaza";

export const HOT_WORKS: HotWork[] = [
  {
    id: "hw1",
    rank: 1,
    title: "首富千金养成计划",
    episodes: 80,
    synopsis: "落难千金重生归来，凭借前世记忆在商战中步步为营，最终夺回属于自己的一切。",
    tags: ["重生", "商战", "打脸", "女频"],
    source: "红果",
    sourceUrl: "#",
    launchAt: "2026-07-10",
    background: "都市",
    theme: ["现言", "女性成长"],
    setting: ["打脸虐渣", "大女主", "重生"],
    audience: "女频",
  },
  {
    id: "hw2",
    rank: 2,
    title: "战神归来：护你一世安稳",
    episodes: 60,
    synopsis: "退役特种兵王重返都市，为保护挚爱卷入家族纷争，铁血与柔情并存。",
    tags: ["战神", "护妻", "都市", "男频"],
    source: "番茄",
    sourceUrl: "#",
    launchAt: "2026-07-08",
    background: "都市",
    theme: ["战神"],
    setting: ["大男主", "兵王"],
    audience: "男频",
  },
  {
    id: "hw3",
    rank: 3,
    title: "替嫁千金是马甲大佬",
    episodes: 100,
    synopsis: "被强迫替嫁的千金，竟是多领域隐藏大佬，反派们的噩梦开始了。",
    tags: ["替嫁", "马甲", "爽文", "女频"],
    source: "抖音",
    sourceUrl: "#",
    launchAt: "2026-07-12",
    background: "都市",
    theme: ["现言", "脑洞"],
    setting: ["打脸虐渣", "大女主", "系统"],
    audience: "女频",
  },
  {
    id: "hw4",
    rank: 4,
    title: "赘婿神豪：从被赶出家门开始",
    episodes: 70,
    synopsis: "被岳家扫地出门的赘婿，意外觉醒神豪系统，从此一路逆袭打脸。",
    tags: ["赘婿", "神豪", "逆袭", "男频"],
    source: "红果",
    sourceUrl: "#",
    launchAt: "2026-07-05",
    background: "都市",
    theme: ["脑洞"],
    setting: ["大男主", "系统", "重生"],
    audience: "男频",
  },
  {
    id: "hw5",
    rank: 5,
    title: "穿越古代：种田也疯狂",
    episodes: 50,
    synopsis: "现代农学博士穿越古代乡村，凭借知识发家致富，顺便收获爱情。",
    tags: ["穿越", "种田", "古言", "女频"],
    source: "番茄",
    sourceUrl: "#",
    launchAt: "2026-07-15",
    background: "古代",
    theme: ["古言", "种田"],
    setting: ["穿越"],
    audience: "女频",
  },
  {
    id: "hw6",
    rank: 6,
    title: "真假千金：嫡女归来",
    episodes: 90,
    synopsis: "被调包的豪门嫡女重回家族，面对假千金与算计，她如何夺回一切。",
    tags: ["真假千金", "复仇", "古言", "女频"],
    source: "红果",
    sourceUrl: "#",
    launchAt: "2026-07-03",
    background: "古代",
    theme: ["古言"],
    setting: ["打脸虐渣", "大女主"],
    audience: "女频",
  },
];

// ─── 网文风向标 ─────────────────────────────────────────────────────────────

export const NOVEL_TRENDS: NovelTrend[] = [
  {
    id: "nt1",
    rank: 1,
    title: "我在末世开超市",
    author: "番茄作家·青云",
    type: "末世生存",
    words: "320万字",
    synopsis: "末世降临，主角凭借神秘超市系统，在丧尸横行的世界中建立避难所。",
    source: "番茄",
    sourceUrl: "#",
    adaptationPotential: 92,
    suitableMode: "AIGC",
    recommendedEpisodes: 80,
  },
  {
    id: "nt2",
    rank: 2,
    title: "重生之都市修仙",
    author: "起点作家·九霄",
    type: "都市修真",
    words: "580万字",
    synopsis: "修仙大能重生都市，从平凡青年一路崛起，重踏仙途。",
    source: "起点",
    sourceUrl: "#",
    adaptationPotential: 88,
    suitableMode: "实拍",
    recommendedEpisodes: 100,
  },
  {
    id: "nt3",
    rank: 3,
    title: "团宠千金惹不起",
    author: "番茄作家·糖糖",
    type: "团宠爽文",
    words: "210万字",
    synopsis: "被五个哥哥宠上天的千金，任何欺负她的人都要付出代价。",
    source: "番茄",
    sourceUrl: "#",
    adaptationPotential: 85,
    suitableMode: "实拍",
    recommendedEpisodes: 60,
  },
  {
    id: "nt4",
    rank: 4,
    title: "全球冰封：我打造了末日堡垒",
    author: "起点作家·寒霜",
    type: "末世生存",
    words: "450万字",
    synopsis: "全球冰封前一周，主角疯狂囤货建造堡垒，末日来临后笑看众生。",
    source: "起点",
    sourceUrl: "#",
    adaptationPotential: 90,
    suitableMode: "AIGC",
    recommendedEpisodes: 90,
  },
  {
    id: "nt5",
    rank: 5,
    title: "夫人死后顾总疯了",
    author: "番茄作家·梨花",
    type: "虐恋追妻",
    words: "180万字",
    synopsis: "不被珍惜的妻子最终离去，顾总在失去后才懂得什么是无法挽回。",
    source: "番茄",
    sourceUrl: "#",
    adaptationPotential: 82,
    suitableMode: "实拍",
    recommendedEpisodes: 50,
  },
  {
    id: "nt6",
    rank: 6,
    title: "我在修仙界开外挂",
    author: "起点作家·开挂",
    type: "仙侠爽文",
    words: "690万字",
    synopsis: "穿越到修仙界，自带外挂系统，从此横推一切。",
    source: "起点",
    sourceUrl: "#",
    adaptationPotential: 78,
    suitableMode: "AIGC",
    recommendedEpisodes: 120,
  },
];

// ─── 热点信号 ───────────────────────────────────────────────────────────────

export const TREND_SIGNALS: TrendSignal[] = [
  {
    id: "ts1",
    title: "#职场PUA话题持续发酵#",
    source: "微博",
    sourceUrl: "#",
    heatScore: 9856,
    growthRate: 156,
    emotions: ["愤怒", "共情", "正义感"],
    narrativeThemes: ["弱者逆袭", "反抗权威", "职场觉醒"],
    adaptationAdvice:
      "可改编为「职场觉醒+复仇打脸」题材短剧，主角从被 PUA 到反击的过程天然具备爽点节奏。",
    riskLevel: "medium",
    riskNote: "涉及真实企业负面案例时需做虚构化处理，避免直接指代。",
    capturedAt: "2026-07-26T08:00:00Z",
  },
  {
    id: "ts2",
    title: "AI 替代程序员讨论热度上升",
    source: "知乎",
    sourceUrl: "#",
    heatScore: 7421,
    growthRate: 89,
    emotions: ["焦虑", "好奇", "期待"],
    narrativeThemes: ["技术焦虑", "职业转型", "AI 觉醒"],
    adaptationAdvice:
      "适合改编为「程序员对抗 AI」的科幻悬疑题材，结合现实焦虑切入，引发共鸣。",
    riskLevel: "low",
    capturedAt: "2026-07-26T10:00:00Z",
  },
  {
    id: "ts3",
    title: "中老年相亲节目爆火",
    source: "微博",
    sourceUrl: "#",
    heatScore: 6543,
    growthRate: 234,
    emotions: ["欢乐", "怀旧", "温暖"],
    narrativeThemes: ["黄昏恋", "代际冲突", "家庭温情"],
    adaptationAdvice:
      "中老年题材短剧正在蓝海期，可改编为「黄昏恋+家庭伦理」题材，避开传统女频红海。",
    riskLevel: "low",
    capturedAt: "2026-07-25T18:00:00Z",
  },
  {
    id: "ts4",
    title: "校园霸凌事件引发关注",
    source: "微博",
    sourceUrl: "#",
    heatScore: 8932,
    growthRate: 67,
    emotions: ["愤怒", "心疼", "正义感"],
    narrativeThemes: ["校园反抗", "成长蜕变", "正义必胜"],
    adaptationAdvice:
      "改编为「校园觉醒+学霸逆袭」题材，主角从被霸凌到反击的成长弧光具备强爽点。",
    riskLevel: "high",
    riskNote: "涉及未成年人题材需严格审核，避免渲染暴力细节，建议聚焦心理成长。",
    capturedAt: "2026-07-25T14:00:00Z",
  },
  {
    id: "ts5",
    title: "返乡创业话题登顶",
    source: "知乎",
    sourceUrl: "#",
    heatScore: 5621,
    growthRate: 145,
    emotions: ["向往", "励志", "怀旧"],
    narrativeThemes: ["返乡创业", "乡村振兴", "理想主义"],
    adaptationAdvice:
      "适合改编为「都市返乡+乡村创业」题材，避开都市红海，符合乡村振兴政策导向。",
    riskLevel: "low",
    capturedAt: "2026-07-24T20:00:00Z",
  },
  {
    id: "ts6",
    title: "明星离婚财产分割案",
    source: "微博",
    sourceUrl: "#",
    heatScore: 12000,
    growthRate: 312,
    emotions: ["八卦", "愤怒", "共情"],
    narrativeThemes: ["豪门恩怨", "婚姻困境", "女性独立"],
    adaptationAdvice:
      "改编为「豪门离婚+女性独立」题材，参考真实案例但完全虚构化，避免法律风险。",
    riskLevel: "high",
    riskNote: "禁止直接使用真实人物姓名、特征，所有角色必须完全虚构。",
    capturedAt: "2026-07-26T09:00:00Z",
  },
];
