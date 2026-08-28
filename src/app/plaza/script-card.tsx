"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CoinsIcon } from "@/components/icons";
import {
  SCRIPT_TYPE_META,
  type Script,
  type ScriptType,
} from "@/lib/plaza-data";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

function TypeBadge({ type, className }: { type: ScriptType; className?: string }) {
  const meta = SCRIPT_TYPE_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1",
        meta.color,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function ScriptCard({ script }: { script: Script }) {
  const [previewing, setPreviewing] = useState(false);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300",
        script.sold
          ? "opacity-60"
          : "hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20",
      )}
    >
      <Link
        href={`/plaza/script/${script.id}`}
        aria-label={`查看剧本「${script.title}」详情`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-2xl"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={txi(script.prompt, "portrait_4_3")}
            alt={script.title}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute left-2 top-2">
            <TypeBadge type={script.type} />
          </div>
          <div className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur">
            {script.episodes}集 | {script.words}
          </div>
          {script.sold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/40 bg-black/40">
                <span className="text-[13px] font-bold text-white/80">
                  已售出
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="line-clamp-1 text-[14px] font-bold text-white">
              {script.title}
            </div>
            {script.subtitle && (
              <p className="mt-0.5 line-clamp-1 text-[11px] text-white/55">
                {script.subtitle}
              </p>
            )}
            {script.source && (
              <p className="mt-0.5 line-clamp-1 text-[10px] text-white/40">
                来源：{script.source}
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
              {script.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-white/55">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[12px] font-bold text-brand">
              <CoinsIcon className="size-3.5" />
              {script.price.toLocaleString()}
            </span>
            <span
              className={cn(
                "rounded-lg px-3 py-1 text-[11px] font-semibold",
                script.sold
                  ? "bg-white/[0.05] text-white/35"
                  : "bg-brand text-black group-hover:bg-[#e6ff4d] transition-colors",
              )}
            >
              {script.sold ? "已售出" : "立即购买"}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="w-full rounded-lg bg-white/[0.06] py-1.5 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
        >
          {previewing ? "试读已打开" : "试读剧本"}
        </button>
      </div>
    </article>
  );
}
