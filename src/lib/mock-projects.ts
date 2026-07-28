// 项目 mock 数据（列表页与详情页工作台共享）

import type { ProjectSubTab } from "@/types/project";

// ─── 共享类型 ─────────────────────────────────────────────────────────────

export type ShortDramaMode = "剧本模式" | "自由模式" | "AI重绘";

export type ShortDramaProject = {
  id: number;
  type: "short";
  title: string;
  mode: ShortDramaMode;
  episodes: number;
  createdAt: string;
  updatedAt: string;
  coverPrompt: string;
  description: string;
  // 资产摘要（列表页用）
  characters: { id: string; name: string; role: string; description: string }[];
  sourceFileName?: string;
  plannedEpisodes?: number;
  // ── 工作台扩展字段 ──
  tag: string; // '创作中' | '已完结'
  coverType: "gradient" | "image";
  members: string[];
  computeSpent: number;
  todaySpent: number;
  assets: {
    total: number;
    characters: number;
    scenes: number;
    props: number;
  };
  scriptContent?: string; // 剧本模式：解析后的剧本文本
  scriptChapters?: ScriptChapter[];
  episodeList?: Episode[];
  shots?: ShotItem[];
};

export type ScriptProject = {
  id: number;
  type: "script";
  title: string;
  scriptType:
    | "剧本创作"
    | "网文改编"
    | "剧本改编"
    | "剧本评估"
    | "拉片剧本";
  status: string;
  rating: string;
  score: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dateStr: string;
  description: string;
};

export type Project = ShortDramaProject | ScriptProject;

// ─── 工作台子类型 ────────────────────────────────────────────────────────

export type ScriptChapter = {
  id: string;
  title: string;
  content: string;
};

export type Episode = {
  id: string;
  number: number;
  title: string;
  status: "未开始" | "进行中" | "已完成";
  progress: number;
  description?: string;
};

export type ShotItem = {
  id: string;
  episode: number;
  index: number;
  description: string;
  duration: string;
  characters: string[];
  scene: string;
  prompt: string;
  status: "未开始" | "已生成" | "失败";
};

// ─── Mock 数据 ───────────────────────────────────────────────────────────

const FALLBACK_SCRIPT = `第一章 开端

林家院子里，那口缺了口的大水缸面上已经结了一层厚厚的冰。

林安跨进水缸，正用一把生锈的铁锨一下一下地砸开冰面，冒出冰冷刺骨的水。倒进面前那个掉漆的红双喜大木盆里。

她的双手浸泡在漂着冰碴子的冷水里，早就冻得失去了知觉。

第二章 重逢

堂屋的门缝里，正源源不断地飘出猪肉白菜炖粉条的浓郁香气。煤球炉子烧得正旺，把屋里烘得暖融融的。

苏梅推门而入，与多年未见的女儿林晚晴四目相对，空气瞬间凝固。

第三章 真相

一份陈旧的契约被苏梅从行李箱深处翻出，林晚晴这才明白母亲当年离家的真相。`;

function buildChapters(script: string): ScriptChapter[] {
  const pattern = /(?=\n?\s*第[\d一二三四五六七八九十百]+章[^\n]*)/g;
  const chunks = script.split(pattern).map((s) => s.trim()).filter(Boolean);
  const normalized = chunks.length > 1 ? chunks : [script];
  return normalized.slice(0, 20).map((content, index) => ({
    id: `chapter-${index + 1}`,
    title: `第${index + 1}章`,
    content: content.replace(/^第[\d一二三四五六七八九十百]+章[^\n]*\n?/, "").trim(),
  }));
}

export const SHORT_DRAMA_PROJECTS: ShortDramaProject[] = [
  {
    id: 1,
    type: "short",
    title: "小福星",
    mode: "AI重绘",
    episodes: 60,
    createdAt: "2026-07-24",
    updatedAt: "几秒前",
    coverPrompt:
      "cute anime baby celestial fairy tale, warm golden light, lime green accent",
    description:
      "一位被遗忘的孩子在都市中长大，凭借善良与一点点天降福气，化解身边人的困境。AI重绘自原片《小福星》。",
    sourceFileName: "xiaofuxing-原片.mp4",
    characters: [
      { id: "c1", name: "小福星", role: "主角", description: "8岁男孩，性格纯真，自带福气" },
      { id: "c2", name: "奶奶", role: "配角", description: "抚养小福星长大的慈祥老人" },
      { id: "c3", name: "李老板", role: "反派", description: "一心想利用小福星的商人" },
    ],
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦", "张三"],
    computeSpent: 12450,
    todaySpent: 320,
    assets: { total: 8, characters: 3, scenes: 3, props: 2 },
  },
  {
    id: 2,
    type: "short",
    title: "我妈归来demo",
    mode: "剧本模式",
    episodes: 40,
    createdAt: "2026-07-23",
    updatedAt: "4小时前",
    coverPrompt:
      "drama scene mother return home, cinematic lighting, emotional moment",
    description:
      "讲述一位母亲离家多年后归来，与成年女儿之间复杂的情感纠葛与和解过程。",
    sourceFileName: "我妈归来-剧本v2.docx",
    characters: [
      { id: "c1", name: "林晚晴", role: "女儿", description: "都市白领，性格坚韧独立" },
      { id: "c2", name: "苏梅", role: "母亲", description: "离家多年的母亲，心怀愧疚" },
      { id: "c3", name: "陈助理", role: "配角", description: "林晚晴的得力助手" },
    ],
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦", "张三", "李四"],
    computeSpent: 8920,
    todaySpent: 180,
    assets: { total: 12, characters: 4, scenes: 5, props: 3 },
    scriptContent: FALLBACK_SCRIPT,
    scriptChapters: buildChapters(FALLBACK_SCRIPT),
    episodeList: [
      { id: "ep-1", number: 1, title: "第1集", status: "已完成", progress: 100, description: "林安砸冰取水，引出家庭困境" },
      { id: "ep-2", number: 2, title: "第2集", status: "进行中", progress: 60, description: "苏梅归来，母女重逢" },
      { id: "ep-3", number: 3, title: "第3集", status: "未开始", progress: 0, description: "契约揭秘" },
    ],
    shots: [
      { id: "s1", episode: 1, index: 1, description: "冬日院落空镜，水缸结冰", duration: "0:08", characters: [], scene: "冬日院落", prompt: "winter courtyard, frozen water vat, snow falling, cinematic", status: "已生成" },
      { id: "s2", episode: 1, index: 2, description: "林安砸冰取水，双手冻红", duration: "0:15", characters: ["林晚晴"], scene: "冬日院落", prompt: "young woman breaking ice in water vat, red hands, close-up", status: "已生成" },
      { id: "s3", episode: 1, index: 3, description: "堂屋温暖对比镜头", duration: "0:12", characters: [], scene: "堂屋", prompt: "warm interior contrast, pork cabbage stew, steam rising", status: "未开始" },
      { id: "s4", episode: 2, index: 1, description: "苏梅推门而入", duration: "0:20", characters: ["苏梅"], scene: "院门口", prompt: "middle-aged woman entering courtyard, luggage, emotional", status: "未开始" },
    ],
  },
  {
    id: 3,
    type: "short",
    title: "清白入席",
    mode: "自由模式",
    episodes: 24,
    createdAt: "2026-07-20",
    updatedAt: "4天前",
    coverPrompt: "elegant dinner party scene, formal attire, dramatic lighting",
    description:
      "民国背景的家宴题材，一场宴席揭开三代人的恩怨情仇。自由模式从零搭建。",
    plannedEpisodes: 24,
    characters: [
      { id: "c1", name: "沈清白", role: "主角", description: "沈家二少爷，留洋归来" },
      { id: "c2", name: "沈太太", role: "配角", description: "沈家当家主母" },
    ],
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦"],
    computeSpent: 3200,
    todaySpent: 0,
    assets: { total: 5, characters: 2, scenes: 2, props: 1 },
    episodeList: Array.from({ length: 6 }, (_, i) => ({
      id: `ep-${i + 1}`,
      number: i + 1,
      title: `第${i + 1}集`,
      status: i === 0 ? "已完成" : i === 1 ? "进行中" : "未开始",
      progress: i === 0 ? 100 : i === 1 ? 40 : 0,
    })),
    shots: [
      { id: "s1", episode: 1, index: 1, description: "沈家大宅外观空镜", duration: "0:10", characters: [], scene: "沈家大宅", prompt: "republican era mansion exterior, stone lions, cinematic", status: "已生成" },
      { id: "s2", episode: 1, index: 2, description: "沈清白归来，家人迎接", duration: "0:18", characters: ["沈清白", "沈太太"], scene: "沈家大厅", prompt: "young master returning home, family greeting, republican era costumes", status: "未开始" },
    ],
  },
  {
    id: 4,
    type: "short",
    title: "二哈项目",
    mode: "AI重绘",
    episodes: 12,
    createdAt: "2026-07-18",
    updatedAt: "4天前",
    coverPrompt: "funny husky dog meme style, bright colors, comedy",
    description: "一只二哈的搞笑日常，AI重绘自网络热传短视频合集。",
    sourceFileName: "二哈合集.zip",
    characters: [
      { id: "c1", name: "二哈", role: "主角", description: "调皮捣蛋的哈士奇" },
      { id: "c2", name: "主人", role: "配角", description: "无奈又宠溺的铲屎官" },
    ],
    tag: "创作中",
    coverType: "gradient",
    members: ["张三"],
    computeSpent: 1800,
    todaySpent: 50,
    assets: { total: 4, characters: 2, scenes: 1, props: 1 },
  },
  {
    id: 10,
    type: "short",
    title: "世界杯大乱斗",
    mode: "剧本模式",
    episodes: 36,
    createdAt: "2026-07-15",
    updatedAt: "1天前",
    coverPrompt:
      "epic football world cup stadium, dramatic lighting, sports anime",
    description:
      "虚构的世界杯赛事，各国球员在球场内外上演热血对决与兄弟情谊。",
    sourceFileName: "世界杯大乱斗-剧本.txt",
    characters: [
      { id: "c1", name: "李风", role: "主角", description: "中国队长，速度型前锋" },
      { id: "c2", name: "卡洛斯", role: "对手", description: "巴西队核心，技术细腻" },
      { id: "c3", name: "教练老张", role: "配角", description: "中国队主教练，铁血派" },
    ],
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦", "李四"],
    computeSpent: 21500,
    todaySpent: 800,
    assets: { total: 15, characters: 5, scenes: 6, props: 4 },
    scriptContent: FALLBACK_SCRIPT,
    scriptChapters: buildChapters(FALLBACK_SCRIPT),
    episodeList: [
      { id: "ep-1", number: 1, title: "第1集", status: "已完成", progress: 100 },
      { id: "ep-2", number: 2, title: "第2集", status: "已完成", progress: 100 },
      { id: "ep-3", number: 3, title: "第3集", status: "进行中", progress: 70 },
    ],
  },
  {
    id: 11,
    type: "short",
    title: "都市修仙传",
    mode: "自由模式",
    episodes: 48,
    createdAt: "2026-07-10",
    updatedAt: "2天前",
    coverPrompt: "urban cultivation fantasy, modern city with mystical elements",
    description:
      "都市背景下的修仙故事，程序员意外踏入修真界，在写字楼与灵山之间穿梭。",
    plannedEpisodes: 48,
    characters: [
      { id: "c1", name: "陈默", role: "主角", description: "28岁程序员，意外觉醒灵根" },
      { id: "c2", name: "白芷", role: "女主", description: "修真世家传人，外冷内热" },
    ],
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦", "张三"],
    computeSpent: 6700,
    todaySpent: 120,
    assets: { total: 7, characters: 3, scenes: 3, props: 1 },
  },
];

export const SCRIPT_PROJECTS: ScriptProject[] = [
  {
    id: 5,
    type: "script",
    title: "首富千金养成计划 评估",
    scriptType: "剧本评估",
    status: "评估完成",
    rating: "A",
    score: 81,
    tags: ["都市情感", "霸总甜宠", "复仇"],
    createdAt: "2026-05-17",
    updatedAt: "1周前",
    dateStr: "2026/5/17",
    description:
      "首富遗孤被仇家收养，长大后逐步揭开身世真相并展开复仇的故事。评估等级 A。",
  },
  {
    id: 6,
    type: "script",
    title: "1_老",
    scriptType: "剧本创作",
    status: "评估完成",
    rating: "A",
    score: 83,
    tags: ["穿越", "脑洞", "反差喜剧"],
    createdAt: "2026-05-17",
    updatedAt: "1周前",
    dateStr: "2026/5/17",
    description:
      "程序员穿越成古代老者，凭借现代知识在江湖中混得风生水起的反差喜剧。",
  },
  {
    id: 7,
    type: "script",
    title: "拼好饭帝国 评估",
    scriptType: "剧本评估",
    status: "评估完成",
    rating: "A",
    score: 79,
    tags: ["都市", "创业", "喜剧"],
    createdAt: "2026-05-03",
    updatedAt: "3周前",
    dateStr: "2026/5/3",
    description:
      "外卖平台创业故事，三位合伙人从地下室起步到敲钟上市的喜剧。",
  },
  {
    id: 8,
    type: "script",
    title: "网文改编-测试",
    scriptType: "网文改编",
    status: "待评估",
    rating: "—",
    score: null,
    tags: ["网文", "改编"],
    createdAt: "2026-05-10",
    updatedAt: "2周前",
    dateStr: "2026/5/10",
    description: "热门网文《万界之主》的剧本改编测试样例，待评估。",
  },
  {
    id: 9,
    type: "script",
    title: "拉片剧本-样例",
    scriptType: "拉片剧本",
    status: "待评估",
    rating: "—",
    score: null,
    tags: ["拉片", "分析"],
    createdAt: "2026-07-21",
    updatedAt: "3天前",
    dateStr: "2026/7/21",
    description: "经典电影《肖申克的救赎》拉片分析样例剧本。",
  },
  {
    id: 12,
    type: "script",
    title: "剧本改编-示例",
    scriptType: "剧本改编",
    status: "待评估",
    rating: "—",
    score: null,
    tags: ["改编", "测试"],
    createdAt: "2026-07-01",
    updatedAt: "5天前",
    dateStr: "2026/7/1",
    description: "漫画《某科学的超电磁炮》剧本改编示例，待评估。",
  },
];

export const ALL_PROJECTS: Project[] = [
  ...SHORT_DRAMA_PROJECTS,
  ...SCRIPT_PROJECTS,
];

export function getProjectById(id: number): Project | undefined {
  return ALL_PROJECTS.find((p) => p.id === id);
}

// ─── 工作台辅助 ──────────────────────────────────────────────────────────

/** 根据模式获取可见的子 tab 列表 */
export function getSubTabs(mode: ShortDramaMode): ProjectSubTab[] {
  if (mode === "自由模式") return ["概览", "资产", "分镜", "成片"];
  return ["概览", "剧本", "资产", "分镜", "成片"];
}

/** AI重绘 4 步 Stepper */
export const REMAKE_STEPS = ["原片", "设定", "分镜", "视频"] as const;
export type RemakeStep = (typeof REMAKE_STEPS)[number];
