"use client";

import { useState, useCallback } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { AssetDetail } from "@/components/asset-detail";

type FilterTag =
  | "全部"
  | "虚拟角色"
  | "真人演员"
  | "男性"
  | "女性"
  | "爆款领衔"
  | "实力主演"
  | "专业演员"
  | "新锐演员";

const FILTER_TAGS: FilterTag[] = [
  "全部",
  "虚拟角色",
  "真人演员",
  "男性",
  "女性",
  "爆款领衔",
  "实力主演",
  "专业演员",
  "新锐演员",
];

type AssetCharacter = {
  id: string;
  name: string;
  imagePrompt: string;
  gender: "男" | "女";
  type: "虚拟角色" | "真人演员";
  level: string;
  tags: string[];
  price: number | null; // null = free
  copyright: string;
  persona: string;
  makeupStyles: { id: string; label: string; prompt: string }[];
  outfitStyles: { id: string; label: string; prompt: string }[];
};

const CHARACTERS: AssetCharacter[] = [
  {
    id: "c1",
    name: "笨蛋美女",
    imagePrompt: "beautiful young chinese woman, long black hair, natural makeup, portrait photo, studio lighting, white background",
    gender: "女",
    type: "真人演员",
    level: "新锐演员",
    tags: ["女性", "青年", "真人风格", "国内", "自然"],
    price: 100,
    copyright: "相由楠生",
    persona: "复仇大女主·元气女神·真假千金",
    makeupStyles: [
      { id: "m1", label: "古装妆容", prompt: "ancient chinese makeup, elegant, traditional" },
      { id: "m2", label: "现代妆容", prompt: "modern natural makeup, fresh look" },
      { id: "m3", label: "民国妆容", prompt: "republic era makeup, vintage style" },
    ],
    outfitStyles: [
      { id: "o1", label: "古装汉服", prompt: "traditional hanfu dress" },
      { id: "o2", label: "现代职业装", prompt: "modern business attire" },
    ],
  },
  {
    id: "c2",
    name: "阳光少年",
    imagePrompt: "handsome young chinese man, yellow knit sweater, warm smile, casual portrait, natural lighting",
    gender: "男",
    type: "真人演员",
    level: "实力主演",
    tags: ["男性", "青年", "真人风格", "国内", "阳光"],
    price: 200,
    copyright: "星辰传媒",
    persona: "校园男神·热血少年·暖男",
    makeupStyles: [
      { id: "m1", label: "清爽妆容", prompt: "clean fresh male makeup" },
      { id: "m2", label: "古风妆容", prompt: "ancient chinese male makeup" },
    ],
    outfitStyles: [
      { id: "o1", label: "休闲装", prompt: "casual streetwear" },
      { id: "o2", label: "古装", prompt: "ancient chinese male robe" },
    ],
  },
  {
    id: "c3",
    name: "冷艳御姐",
    imagePrompt: "stunning chinese woman, white crop top, jeans, confident pose, studio portrait, clean background",
    gender: "女",
    type: "真人演员",
    level: "爆款领衔",
    tags: ["女性", "青年", "真人风格", "国内", "冷艳"],
    price: 300,
    copyright: "光影工作室",
    persona: "霸道女总裁·冷艳杀手·独立女性",
    makeupStyles: [
      { id: "m1", label: "烟熏妆", prompt: "smoky eye makeup, bold lips" },
      { id: "m2", label: "裸妆", prompt: "nude natural makeup" },
    ],
    outfitStyles: [
      { id: "o1", label: "西装套装", prompt: "power suit, professional" },
      { id: "o2", label: "晚礼服", prompt: "elegant evening gown" },
    ],
  },
  {
    id: "c4",
    name: "儒雅绅士",
    imagePrompt: "handsome chinese man in brown blazer, black shirt, glasses, intellectual look, studio portrait",
    gender: "男",
    type: "真人演员",
    level: "专业演员",
    tags: ["男性", "中年", "真人风格", "国内", "儒雅"],
    price: 250,
    copyright: "华视文化",
    persona: "精英律师·温柔教授·腹黑总裁",
    makeupStyles: [
      { id: "m1", label: "商务妆", prompt: "professional male grooming" },
    ],
    outfitStyles: [
      { id: "o1", label: "正装", prompt: "formal business suit" },
      { id: "o2", label: "学者装", prompt: "academic casual wear" },
    ],
  },
  {
    id: "c5",
    name: "清纯学妹",
    imagePrompt: "young chinese woman, white t-shirt, long straight hair, innocent look, natural lighting portrait",
    gender: "女",
    type: "真人演员",
    level: "新锐演员",
    tags: ["女性", "青年", "真人风格", "国内", "清纯"],
    price: 100,
    copyright: "新星娱乐",
    persona: "校园初恋·邻家女孩·清纯少女",
    makeupStyles: [
      { id: "m1", label: "素颜妆", prompt: "barely there makeup, dewy skin" },
      { id: "m2", label: "甜美妆", prompt: "sweet cute makeup, pink tones" },
    ],
    outfitStyles: [
      { id: "o1", label: "校服", prompt: "school uniform style" },
      { id: "o2", label: "连衣裙", prompt: "cute summer dress" },
    ],
  },
  {
    id: "c6",
    name: "霸总精英",
    imagePrompt: "handsome chinese man in black suit with red tie, sharp features, confident expression, studio portrait",
    gender: "男",
    type: "真人演员",
    level: "爆款领衔",
    tags: ["男性", "青年", "真人风格", "国内", "霸气"],
    price: 350,
    copyright: "鼎盛影视",
    persona: "霸道总裁·军界大佬·商界精英",
    makeupStyles: [
      { id: "m1", label: "硬朗妆", prompt: "sharp masculine grooming" },
    ],
    outfitStyles: [
      { id: "o1", label: "黑色西装", prompt: "black formal suit" },
      { id: "o2", label: "军装", prompt: "military uniform" },
    ],
  },
  {
    id: "c7",
    name: "古风仙子",
    imagePrompt: "ethereal chinese woman, white blazer, long wavy hair, elegant pose, soft lighting portrait",
    gender: "女",
    type: "虚拟角色",
    level: "专业演员",
    tags: ["女性", "青年", "虚拟风格", "古风", "仙气"],
    price: null,
    copyright: "bollo AI",
    persona: "仙侠女主·古典美人·温婉才女",
    makeupStyles: [
      { id: "m1", label: "仙侠妆", prompt: "fantasy ethereal makeup" },
      { id: "m2", label: "唐妆", prompt: "tang dynasty makeup style" },
    ],
    outfitStyles: [
      { id: "o1", label: "仙裙", prompt: "flowing fairy dress" },
      { id: "o2", label: "唐装", prompt: "tang dynasty hanfu" },
    ],
  },
  {
    id: "c8",
    name: "暗黑少女",
    imagePrompt: "chinese woman with dark hair, mysterious expression, dark clothing, moody portrait lighting",
    gender: "女",
    type: "虚拟角色",
    level: "新锐演员",
    tags: ["女性", "青年", "虚拟风格", "暗黑", "神秘"],
    price: null,
    copyright: "bollo AI",
    persona: "暗黑系女主·复仇天使·神秘女巫",
    makeupStyles: [
      { id: "m1", label: "哥特妆", prompt: "gothic dark makeup" },
      { id: "m2", label: "烟熏妆", prompt: "heavy smoky eye" },
    ],
    outfitStyles: [
      { id: "o1", label: "暗黑系", prompt: "dark gothic outfit" },
    ],
  },
  {
    id: "c9",
    name: "甜酷女孩",
    imagePrompt: "young chinese woman with short reddish hair, striped shirt, cool expression, studio portrait",
    gender: "女",
    type: "真人演员",
    level: "新锐演员",
    tags: ["女性", "青年", "真人风格", "国内", "酷飒"],
    price: 100,
    copyright: "潮流文化",
    persona: "酷girl·街头少女·叛逆千金",
    makeupStyles: [
      { id: "m1", label: "酷飒妆", prompt: "edgy cool makeup" },
    ],
    outfitStyles: [
      { id: "o1", label: "街头风", prompt: "streetwear style" },
      { id: "o2", label: "朋克装", prompt: "punk rock outfit" },
    ],
  },
  {
    id: "c10",
    name: "温柔知性",
    imagePrompt: "chinese woman with long dark hair, black turtleneck, gentle smile, warm studio portrait",
    gender: "女",
    type: "真人演员",
    level: "实力主演",
    tags: ["女性", "青年", "真人风格", "国内", "知性"],
    price: 200,
    copyright: "雅韵传媒",
    persona: "知性女教师·温柔姐姐·职场精英",
    makeupStyles: [
      { id: "m1", label: "知性妆", prompt: "intellectual elegant makeup" },
    ],
    outfitStyles: [
      { id: "o1", label: "职业装", prompt: "smart casual professional" },
    ],
  },
  {
    id: "c11",
    name: "元气少年",
    imagePrompt: "young chinese man, white blazer, medium length hair, youthful expression, bright studio portrait",
    gender: "男",
    type: "真人演员",
    level: "新锐演员",
    tags: ["男性", "青年", "真人风格", "国内", "元气"],
    price: 100,
    copyright: "青春影业",
    persona: "运动少年·阳光校草·邻家哥哥",
    makeupStyles: [
      { id: "m1", label: "清新妆", prompt: "fresh youthful male look" },
    ],
    outfitStyles: [
      { id: "o1", label: "运动装", prompt: "sporty casual wear" },
    ],
  },
  {
    id: "c12",
    name: "妩媚佳人",
    imagePrompt: "beautiful chinese woman, elegant pose, hand near face, soft glamorous lighting, portrait",
    gender: "女",
    type: "真人演员",
    level: "爆款领衔",
    tags: ["女性", "青年", "真人风格", "国内", "妩媚"],
    price: 300,
    copyright: "魅力影视",
    persona: "妩媚女神·风情万种·谍战女主",
    makeupStyles: [
      { id: "m1", label: "复古妆", prompt: "vintage glamorous makeup" },
      { id: "m2", label: "红唇妆", prompt: "bold red lip makeup" },
    ],
    outfitStyles: [
      { id: "o1", label: "旗袍", prompt: "elegant cheongsam" },
      { id: "o2", label: "晚装", prompt: "glamorous evening wear" },
    ],
  },
];

interface AssetGalleryProps {
  open: boolean;
  onClose: () => void;
}

export function AssetGallery({ open, onClose }: AssetGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<AssetCharacter | null>(null);

  const filtered = CHARACTERS.filter((c) => {
    if (activeFilter === "全部") return true;
    if (activeFilter === "男性") return c.gender === "男";
    if (activeFilter === "女性") return c.gender === "女";
    if (activeFilter === "虚拟角色") return c.type === "虚拟角色";
    if (activeFilter === "真人演员") return c.type === "真人演员";
    return c.level === activeFilter || c.tags.includes(activeFilter);
  }).filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.persona.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  if (selectedCharacter) {
    return (
      <AssetDetail
        character={selectedCharacter}
        onBack={() => setSelectedCharacter(null)}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]"
      onClick={handleOverlayClick}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="text-white/60 transition-colors hover:text-white"
          aria-label="关闭"
        >
          <CloseIcon className="size-5" />
        </button>
        <h1 className="text-[16px] font-bold text-white">资产广场</h1>
        <div className="ml-auto relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="search"
            placeholder="搜索角色名称、标签或提示词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-[260px] rounded-lg bg-white/[0.06] pl-9 pr-4 text-[13px] text-white placeholder:text-white/30 outline-none ring-1 ring-white/[0.08] focus:ring-white/20"
          />
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap items-center gap-2 px-6 pb-4">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveFilter(tag)}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
              activeFilter === tag
                ? "bg-[#00e5c8]/15 text-[#00e5c8] ring-1 ring-[#00e5c8]/30"
                : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Character Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => setSelectedCharacter(char)}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] transition-all hover:ring-white/20 hover:scale-[1.02]"
            >
              <img
                src={`https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(char.imagePrompt)}&image_size=portrait_4_3`}
                alt={char.name}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-[13px] font-semibold text-white">{char.name}</p>
                <p className="mt-0.5 text-[11px] text-white/60">
                  {char.price ? `${char.price}积分/副` : "免费"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
