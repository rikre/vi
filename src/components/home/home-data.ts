// 首页（home-v2）静态数据 — 内容对齐线上 bollo.video/zh/home 2026.10 抓取

export type CampaignSlide = {
  id: string;
  href: string;
  title: string;
  highlights: { label: string; value: string }[];
  countdownDays?: number;
};

export const CAMPAIGN_SLIDES: CampaignSlide[] = [
  {
    id: "video-promo",
    href: "/pricing?tab=credits",
    title: "视频生成限时特惠 720P",
    highlights: [
      { label: "Seedance 2.0 PRO 低至", value: "0.65 元/秒" },
      { label: "Seedance 2.5 低至", value: "0.98 元/秒" },
    ],
    countdownDays: 17,
  },
  {
    id: "baiheliang",
    href: "/campaigns/campus-ai",
    title: "白鹤梁AIGC大赛",
    highlights: [
      { label: "现金奖金", value: "40万元" },
      { label: "算力补贴", value: "20万元" },
    ],
  },
];

export type QuickAction = {
  title: string;
  desc: string;
  img: string;
  href: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "生图片",
    desc: "文字成图，参考生图",
    img: "/images/home/quick-imagegen.webp",
    href: "/tools",
  },
  {
    title: "生视频",
    desc: "多参生视频，多模型任选",
    img: "/images/home/quick-videogen.webp",
    href: "/tools",
  },
  {
    title: "资产广场",
    desc: "挑选演员，锁定形象",
    img: "/images/home/quick-asset.png",
    href: "/library",
  },
  {
    title: "重制工坊",
    desc: "上传原片，重制本土化版本",
    img: "/images/home/quick-remake.png",
    href: "/project/new?action=remake",
  },
];

export type TrendCard = {
  id: string;
  title: string;
  date: string;
  percent: string;
  direction: "flat" | "down";
  hotCount: number;
  newCount: number;
  tags: string[];
  href: string;
};

export const TREND_CARDS: TrendCard[] = [
  {
    id: "hongguo",
    title: "红果热榜",
    date: "2026.10.25",
    percent: "7.1%",
    direction: "flat",
    hotCount: 99,
    newCount: 7,
    tags: ["逆袭 · 37.4%", "穿越 · 28.3%", "乡村 · 25.3%"],
    href: "/script/market",
  },
  {
    id: "overseas",
    title: "海外热榜",
    date: "2026.10.25",
    percent: "10%",
    direction: "down",
    hotCount: 10,
    newCount: 1,
    tags: [],
    href: "/script/market",
  },
];

export const WIDE_BANNER = {
  text: "报名入口 + 算力礼包领取",
  img: "/images/home/banner-opc.webp",
  character: "/images/home/trend-char-2.png",
  href: "/pricing?tab=credits",
};

export type IpItem = {
  title: string;
  level: string;
  channel: string;
  genre: string;
  img: string;
  href: string;
};

export const IP_LIBRARY: IpItem[] = [
  { title: "悬而未落的月光", level: "超级爆款", channel: "女频", genre: "虐恋", img: "/images/home/ip-01.jpg" },
  { title: "我妈归来尔等颤抖", level: "超级爆款", channel: "女频", genre: "豪门", img: "/images/home/ip-02.jpg" },
  { title: "全家悔哭时，我在尸骨中笑", level: "超级爆款", channel: "男频", genre: "逆袭", img: "/images/home/ip-03.jpg" },
  { title: "女神老婆赖上我", level: "超级爆款", channel: "男频", genre: "神豪", img: "/images/home/ip-04.jpg" },
  { title: "死后十八年，亲爸回归炸翻京圈", level: "超级爆款", channel: "男频", genre: "穿越", img: "/images/home/ip-05.jpg" },
  { title: "母力全开", level: "超级爆款", channel: "女频", genre: "神豪", img: "/images/home/ip-06.jpg" },
  { title: "我爸归来全员罚跪", level: "超级爆款", channel: "男频", genre: "豪门", img: "/images/home/ip-07.jpg" },
  { title: "好孕甜妻，顾总求续杯", level: "超级爆款", channel: "女频", genre: "闪婚", img: "/images/home/ip-08.jpg" },
  { title: "重生赌石：我拥有黄金瞳", level: "超级爆款", channel: "男频", genre: "重生", img: "/images/home/ip-09.jpg" },
  { title: "女人村", level: "超级爆款", channel: "男频", genre: "悬疑", img: "/images/home/ip-10.jpg" },
  { title: "爱到尽头终成空", level: "超级爆款", channel: "男频", genre: "虐恋", img: "/images/home/ip-11.jpg" },
  { title: "斩情归来，拿回我的江山", level: "超级爆款", channel: "男频", genre: "复仇", img: "/images/home/ip-12.jpg" },
  { title: "追凶", level: "超级爆款", channel: "女频", genre: "重生", img: "/images/home/ip-13.jpg" },
  { title: "媳妇井", level: "超级爆款", channel: "女频", genre: "悬疑", img: "/images/home/ip-14.jpg" },
  { title: "老爸今天涨停了吗", level: "超级爆款", channel: "男频", genre: "重生", img: "/images/home/ip-15.jpg" },
  { title: "咋把邻居的承重墙拆了", level: "爆款", channel: "女频", genre: "职场", img: "/images/home/ip-16.jpg" },
  { title: "空降兵拿我开刀，我反手教他做人", level: "爆款", channel: "男频", genre: "职场", img: "/images/home/ip-17.jpg" },
  { title: "法外自证，我靠入狱洗刷冤屈", level: "爆款", channel: "女频", genre: "重生", img: "/images/home/ip-18.jpg" },
  { title: "孙女寿宴送机甲，震惊科学界", level: "爆款", channel: "男频", genre: "穿越", img: "/images/home/ip-19.jpg" },
  { title: "我帮校花造机甲，震惊科学界", level: "标准", channel: "男频", genre: "系统", img: "/images/home/ip-20.jpg" },
].map((item, i) => ({
  ...item,
  href: `/plaza/script/${(i % 8) + 1}`,
}));

export type ArtistItem = {
  name: string;
  desc: string;
  img: string;
};

export const ARTISTS: ArtistItem[] = [
  { name: "林晓晴", desc: "真人 · 都市女主", img: "/images/home/artist-bunny.png" },
  { name: "星野澪", desc: "虚拟 · 校园少女", img: "/images/home/artist-hero.png" },
  { name: "阿泽", desc: "虚拟 · 热血少年", img: "/images/home/artist-boy.png" },
  { name: "苏念", desc: "真人 · 甜宠女主", img: "/images/home/artist-girl-pink.png" },
];

export type TheaterItem = {
  title: string;
  author: string;
  img: string;
};

export const THEATERS: TheaterItem[] = [
  { title: "手握八十万镇北军，请陛下退位", author: "凤麟文化", img: "/images/home/theater-zhenbeijun.webp" },
  { title: "穿到现代当武替，我救了全族", author: "凤麟文化", img: "/images/home/theater-wuti.webp" },
  { title: "天降小福星，小龙女嫁到", author: "凤麟文化", img: "/images/home/theater-xiaofuxing.webp" },
  { title: "小僵尸爱钱贪吃，师弟全包所有红糖糕", author: "凤麟文化", img: "/images/home/theater-luoli.webp" },
  { title: "惊澜入翠微", author: "凤麟文化", img: "/images/home/theater-cuiwei.webp" },
  { title: "歪比巴卜别跪了，我真不想当皇帝", author: "凤麟文化", img: "/images/home/theater-waibibabu.webp" },
  { title: "满级神厨穿八零，一碗炒饭馋哭全城", author: "凤麟文化", img: "/images/home/theater-shishen.webp" },
  { title: "桃花马上请长缨", author: "来元数字", img: "/images/home/theater-changying.webp" },
];
