"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon, PlusIcon, SearchIcon, HeartIcon } from "@/components/icons";

interface StyleLibraryDialogProps {
  open: boolean;
  onClose: () => void;
}

type MainTab = "全部" | "我的收藏" | "我的风格" | "最近使用";

const MAIN_TABS: MainTab[] = ["全部", "我的收藏", "我的风格", "最近使用"];

const CHIPS = ["漫剧", "真人剧", "3D", "国风", "2D", "Q版", "游戏", "日漫", "欧美", "韩流"];

interface StyleItem {
  id: string;
  name: string;
  chip: string;
  badge?: "Hot" | "New";
  author: string;
  usage: number;
  prompt: string;
}

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

const STYLES: StyleItem[] = [
  { id: "s1", name: "古风3D漫剧", chip: "漫剧", badge: "Hot", author: "枫语梧桐", usage: 84764, prompt: "3d render ancient chinese noble woman in blue ornate hanfu with fur collar, holding pipa, dramatic palace backdrop, cinematic lighting" },
  { id: "s2", name: "国风泥偶动画", chip: "国风", badge: "New", author: "乔杉客", usage: 868, prompt: "claymation style ancient chinese woman with fox mask figure, candle light, stop motion puppet aesthetic, textured clay" },
  { id: "s3", name: "国风仙侠", chip: "国风", badge: "New", author: "微凉", usage: 2645, prompt: "ethereal chinese xianxia immortal woman in pale blue robes, glowing magical particles, elegant updo hair, fantasy portrait" },
  { id: "s4", name: "3D种田", chip: "3D", author: "晚风使者", usage: 3945, prompt: "3d render young woman in pink hanfu farming in field holding hoe, warm sunset light, pastoral scene, stylized cartoon" },
  { id: "s5", name: "3D机甲", chip: "3D", author: "月见情报局", usage: 3371, prompt: "3d render female warrior in black futuristic mecha armor, high ponytail, sci-fi battlefield background, detailed armor" },
  { id: "s6", name: "80年代", chip: "真人剧", author: "小可", usage: 1959, prompt: "realistic 1980s chinese young man holding enamel bowl, rural village background, retro film photography, nostalgic" },
  { id: "s7", name: "怀旧火线", chip: "游戏", author: "Pearl Drift", usage: 454, prompt: "retro fps game character soldier kneeling with pistol, green military jacket, low poly game render, nostalgic shooter" },
  { id: "s8", name: "和平精英", chip: "游戏", author: "Hope Daily", usage: 1511, prompt: "battle royale game character with backpack walking through smoke and fire, tactical gear, realistic game render" },
  { id: "s9", name: "3D乙游", chip: "3D", author: "月见情深", usage: 9525, prompt: "3d render handsome young man with brown hair in grey cardigan, otome game style, soft romantic lighting, gentle smile" },
  { id: "s10", name: "崩坏3D", chip: "游戏", author: "瑞波来客", usage: 2088, prompt: "anime game character white hair futuristic bodysuit standing in sci-fi hall, gacha game render, vibrant blue tones" },
  { id: "s11", name: "Low Poly", chip: "Q版", author: "Iris Field", usage: 1871, prompt: "low poly cute chibi girl with black bob hair in orange dress on wooden boat, tropical island, minimal 3d style" },
  { id: "s12", name: "双城风格", chip: "欧美", author: "Tide Pool", usage: 1712, prompt: "stylized painted portrait of blonde man in ornate blue military uniform holding fencing sword, arcane animated series art style" },
  { id: "s13", name: "琦他赛", chip: "真人剧", author: "Nest Egg", usage: 1027, prompt: "realistic man in white tank top leaning on vintage car, miami sunset palm trees, gta vice city loading screen art style" },
  { id: "s14", name: "日漫热血", chip: "日漫", author: "青野", usage: 1204, prompt: "shonen anime style determined boy with spiky silver hair, dynamic action pose, bold cel shading, vibrant colors" },
  { id: "s15", name: "韩流偶像", chip: "韩流", author: "首尔风", usage: 986, prompt: "korean webtoon style handsome idol with pink hair and glasses, school uniform, soft pastel shading, romantic mood" },
  { id: "s16", name: "2D插画", chip: "2D", author: "墨染", usage: 1532, prompt: "flat 2d illustration of cowboy girl with red plaid shirt and hat, bold outlines, warm western palette, storybook style" },
];

export function StyleLibraryDialog({ open, onClose }: StyleLibraryDialogProps) {
  const [mainTab, setMainTab] = useState<MainTab>("全部");
  const [chip, setChip] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  let items = STYLES;
  if (mainTab === "我的收藏") items = items.filter((s) => favorites.has(s.id));
  if (mainTab === "我的风格" || mainTab === "最近使用") items = [];
  if (chip) items = items.filter((s) => s.chip === chip);
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    items = items.filter(
      (s) => s.name.toLowerCase().includes(q) || s.chip.includes(q) || s.author.toLowerCase().includes(q)
    );
  }

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="风格库"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      <div className="relative flex max-h-[88vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-3xl bg-[#161616] ring-1 ring-white/[0.08]">
        {/* Header：标题 + 搜索 + 关闭 */}
        <div className="flex items-center justify-between gap-4 px-7 pb-4 pt-6">
          <h2 className="text-[18px] font-bold text-white">风格库</h2>
          <div className="flex items-center gap-3">
            <div className="flex w-[260px] items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 ring-1 ring-white/[0.1] focus-within:ring-white/25">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索风格名、关键词"
                className="w-full bg-transparent text-[12.5px] text-white/85 placeholder:text-white/35 focus:outline-none"
              />
              <SearchIcon className="size-4 shrink-0 text-white/40" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-white/[0.08] text-white/60 transition-colors hover:bg-white/[0.15] hover:text-white"
              aria-label="关闭"
            >
              <CloseIcon className="size-[16px]" />
            </button>
          </div>
        </div>

        {/* 主 Tab */}
        <div className="flex items-center gap-5 px-7">
          {MAIN_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMainTab(t)}
              className={cn(
                "border-b-2 pb-2 text-[13.5px] font-medium transition-colors",
                mainTab === t
                  ? "border-white text-white"
                  : "border-transparent text-white/50 hover:text-white/80"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 分类 chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 px-7">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChip((v) => (v === c ? null : c))}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                chip === c
                  ? "bg-white text-black"
                  : "bg-white/[0.05] text-white/60 ring-1 ring-white/[0.08] hover:bg-white/[0.1] hover:text-white"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-5 grid grid-cols-4 gap-x-4 gap-y-5 overflow-y-auto px-7 pb-7 md:grid-cols-6">
          {/* 上传 tile */}
          <label className="group flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-white/45 transition-colors hover:border-white/30 hover:bg-white/[0.05] hover:text-white/70">
            <PlusIcon className="size-5" />
            <span className="text-[12px] font-medium">上传</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => console.log("upload style", e.target.files?.[0] ?? null)}
            />
          </label>

          {items.map((item) => (
            <div key={item.id} className="group">
              <button
                type="button"
                onClick={() => {
                  console.log("select style", item.name);
                  onClose();
                }}
                className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl ring-1 ring-white/[0.08] transition-all duration-300 hover:ring-white/25"
              >
                <img
                  src={txi(item.prompt, "portrait_4_3")}
                  alt={item.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                {item.badge && (
                  <span
                    className={cn(
                      "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold leading-none text-white",
                      item.badge === "Hot" ? "bg-[#ff2d92]" : "bg-[#a855f7]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {/* 收藏 */}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={favorites.has(item.id) ? "取消收藏" : "收藏"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(item.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      toggleFav(item.id);
                    }
                  }}
                  className={cn(
                    "absolute right-2 top-2 flex size-6 items-center justify-center rounded-md bg-black/50 backdrop-blur-sm transition-all",
                    favorites.has(item.id)
                      ? "text-[#ff2d92] opacity-100"
                      : "text-white/70 opacity-0 group-hover:opacity-100 hover:text-white"
                  )}
                >
                  <HeartIcon className={cn("size-3.5", favorites.has(item.id) && "fill-current")} />
                </span>
                <span className="absolute inset-x-0 bottom-0 px-2.5 py-2 text-left text-[12.5px] font-semibold text-white">
                  {item.name}
                </span>
              </button>
              {/* 作者 + 使用量 */}
              <div className="mt-1.5 flex items-center justify-between px-0.5 text-[11px] text-white/40">
                <span className="flex min-w-0 items-center gap-1">
                  <span className="size-3.5 shrink-0 rounded-full bg-white/[0.12]" />
                  <span className="truncate">{item.author}</span>
                </span>
                <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
                  <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 3 L13 12 H3 Z" />
                  </svg>
                  {item.usage.toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {/* 空状态 */}
          {items.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-14 text-white/35">
              <SearchIcon className="size-6" />
              <p className="text-[13px]">
                {mainTab === "我的收藏"
                  ? "暂无收藏的风格，悬停卡片点击星标即可收藏"
                  : mainTab === "我的风格"
                    ? "暂无上传的风格，点击「上传」创建你的第一个风格"
                    : "最近没有使用过风格"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
