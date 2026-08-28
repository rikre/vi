"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CoinsIcon } from "@/components/icons";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

const LEFT_MENU = [
  { id: "ai", label: "AI选题" },
  { id: "plan", label: "剧本策划" },
  { id: "outline", label: "剧本大纲" },
  { id: "characters", label: "角色设定" },
  { id: "world", label: "世界设定" },
  { id: "ep1", label: "1-5集剧本正文" },
  { id: "ep2", label: "6-10集剧本正文" },
  { id: "ep3", label: "11-60集内容", locked: true },
  { id: "terms", label: "购买与保障须知" },
];

export function LeftMenu({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav aria-label="剧本章节导航" className="w-full shrink-0 lg:w-[200px]">
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar lg:block lg:space-y-0.5">
        {LEFT_MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "flex shrink-0 items-center justify-between rounded-md px-2 py-2 text-left text-[13px] transition-colors lg:w-full lg:py-1.5",
              active === item.id
                ? "text-white"
                : "text-white/45 hover:text-white/70",
            )}
          >
            <span>{item.label}</span>
            {item.locked && (
              <span className="text-[10px] text-white/30">🔒</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function RightPanel({
  coverPrompt,
  title,
  price,
  sold,
}: {
  coverPrompt: string;
  title: string;
  price: number;
  sold: boolean;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <aside className="w-full shrink-0 space-y-8 lg:w-[300px]">
      {/* 封面 */}
      <div>
        <img
          src={txi(coverPrompt, "portrait_4_3")}
          alt={title}
          loading="lazy"
          className="aspect-[3/4] w-full rounded-lg object-cover"
        />
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          电影封面海报，写实电影风格，现代奢华豪门，东亚28岁泼辣女子身穿大花袄龙凤卫衣霸气坐于真皮沙发，手持金色遗嘱神态戏谑睥睨；身前28岁豪门西装青年神态惊恐慌张。头顶水晶灯洒下耀眼暖光，喜剧张力与阶级压制感爆棚；主色调为暖金与大红，整体明亮且反差极强；画面可留醒目的剧名。
        </p>
      </div>

      {/* 价格 + 操作 */}
      <div className="border-t border-white/[0.08] pt-6">
        <div className="mb-1 text-[11px] text-white/40">价格</div>
        <div className="flex items-baseline gap-1 text-[24px] font-medium text-brand tabular-nums">
          {price.toLocaleString()}
          <span className="text-[12px] font-normal text-white/50">积分</span>
        </div>
        <button
          type="button"
          disabled={sold}
          onClick={() => setNotice("购买流程将在支付接口接入后开放，当前为预览演示")}
          className={cn(
            "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md text-[14px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
            sold
              ? "cursor-not-allowed bg-white/[0.06] text-white/35"
              : "bg-brand text-black hover:bg-[#e6ff4d]",
          )}
        >
          <CoinsIcon className="size-4" />
          {sold ? "已售出" : "立即购买"}
        </button>
        <button
          type="button"
          onClick={() => setNotice("试读内容已在左侧章节中展示")}
          className="mt-2 flex h-10 w-full items-center justify-center rounded-md text-[13px] text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
        >
          试读剧本
        </button>
        {notice && (
          <p className="mt-3 text-[12px] leading-relaxed text-brand" role="status" aria-live="polite">
            {notice}
          </p>
        )}
      </div>
    </aside>
  );
}
