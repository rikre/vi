"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon, PlusIcon } from "@/components/icons";

interface StyleLibraryDialogProps {
  open: boolean;
  onClose: () => void;
}

type Category = "all" | "real" | "3d" | "western";

interface StyleItem {
  id: string;
  name: string;
  category: Exclude<Category, "all">;
  badge?: "Hot" | "New";
  prompt: string;
}

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "real", label: "真人" },
  { id: "3d", label: "3D" },
  { id: "western", label: "欧美" },
];

const STYLES: StyleItem[] = [
  {
    id: "r1",
    name: "都市丽人",
    category: "real",
    badge: "Hot",
    prompt:
      "cinematic realistic portrait of a young east asian woman, soft studio lighting, shallow depth of field, film grain, elegant",
  },
  {
    id: "r2",
    name: "硬汉男主",
    category: "real",
    prompt:
      "realistic cinematic portrait of a rugged asian man actor, dramatic side lighting, moody, film still",
  },
  {
    id: "r3",
    name: "戏骨老生",
    category: "real",
    prompt:
      "realistic portrait of a distinguished elderly asian man, warm key light, weathered expressive face, cinematic",
  },
  {
    id: "d1",
    name: "萌系 3D",
    category: "3d",
    badge: "New",
    prompt:
      "cute 3d render cartoon girl character, pixar style, big eyes, soft pastel lighting, glossy, octane render",
  },
  {
    id: "d2",
    name: "潮玩少年",
    category: "3d",
    prompt:
      "stylized 3d render of a trendy teenage boy character, designer toy aesthetic, vibrant rim light, blender",
  },
  {
    id: "d3",
    name: "奇幻精灵",
    category: "3d",
    prompt:
      "3d render fantasy elf creature, glowing magical atmosphere, stylized cartoon, detailed subsurface skin",
  },
  {
    id: "w1",
    name: "欧美电影感",
    category: "western",
    badge: "Hot",
    prompt:
      "cinematic portrait of a western european woman, hollywood film still, anamorphic lens, teal and amber grade",
  },
  {
    id: "w2",
    name: "黑色电影",
    category: "western",
    prompt:
      "film noir portrait of a western man in a trench coat, high contrast chiaroscuro lighting, moody, 35mm",
  },
];

export function StyleLibraryDialog({ open, onClose }: StyleLibraryDialogProps) {
  const [category, setCategory] = useState<Category>("all");

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

  const items =
    category === "all"
      ? STYLES
      : STYLES.filter((s) => s.category === category);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="风格库"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      <div className="relative flex max-h-[86vh] w-full max-w-[880px] flex-col overflow-hidden rounded-3xl bg-[#161616] ring-1 ring-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pb-4 pt-6">
          <div>
            <h2 className="text-[18px] font-bold text-white">风格库</h2>
            <p className="mt-1 text-[12.5px] text-white/40">
              选择一种视觉风格，应用到你的角色与画面
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="关闭"
          >
            <CloseIcon className="size-[18px]" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 px-7">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
                category === c.id
                  ? "bg-brand text-black"
                  : "bg-white/[0.05] text-white/55 hover:bg-white/[0.1] hover:text-white/80"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-5 grid grid-cols-4 gap-3.5 overflow-y-auto px-7 pb-7">
          {/* Upload tile */}
          <label className="group flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-white/45 transition-colors hover:border-white/30 hover:bg-white/[0.05] hover:text-white/70">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] transition-transform group-hover:scale-110">
              <PlusIcon className="size-5" />
            </span>
            <span className="text-[12.5px] font-medium">上传风格</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                console.log("upload style", e.target.files?.[0] ?? null)
              }
            />
          </label>

          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                console.log("select style");
                onClose();
              }}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/[0.08] transition-all duration-300 hover:ring-white/25"
            >
              <img
                src={txi(item.prompt, "portrait_4_3")}
                alt={item.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {item.badge && (
                <span
                  className={cn(
                    "absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none text-black",
                    item.badge === "Hot" ? "bg-brand" : "bg-[#00e5c8]"
                  )}
                >
                  {item.badge}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 px-3 py-2.5 text-left text-[13px] font-semibold text-white">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
