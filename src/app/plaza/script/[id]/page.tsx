"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@/components/icons";
import {
  getScriptById,
  SCRIPT_TYPE_META,
  type ScriptType,
} from "@/lib/plaza-data";
import { ContentPanel } from "./content-panel";
import { LeftMenu, RightPanel } from "./side-panels";

const DEFAULT_PROMPT =
  "cinematic Chinese modern luxury family drama poster, elegant woman in golden qipao facing young man in suit, grand mansion interior, warm lighting, no text";

function TypeBadge({ type }: { type: ScriptType }) {
  const meta = SCRIPT_TYPE_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold ring-1",
        meta.color,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

function NotFound() {
  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-8 pb-12">
        <div className="mt-6 flex items-center gap-1 text-[12px] text-white/40">
          <Link href="/plaza" className="hover:text-white/70">
            广场
          </Link>
          <ChevronRightIcon className="size-3" />
          <span>剧本市场</span>
        </div>
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="mb-3 text-3xl text-white/30">🔍</div>
          <p className="text-[16px] font-medium text-white/80">未找到该剧本</p>
          <p className="mt-1 text-[13px] text-white/50">
            该剧本可能已下架或链接错误
          </p>
          <Link
            href="/plaza"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-brand px-5 text-[13px] font-medium text-black transition-colors hover:bg-[#e6ff4d]"
          >
            返回剧本市场
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

export default function ScriptDetailPage() {
  const params = useParams();
  const script = getScriptById(params?.id as string | undefined);
  const [active, setActive] = useState("ai");

  if (!script) return <NotFound />;

  const coverPrompt = script.id === "1" ? DEFAULT_PROMPT : script.prompt;
  const detailSubtitle =
    script.subtitle || "剧本详情正在完善中，请关注后续更新。";

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-8 pb-12">
        {/* Breadcrumb */}
        <div className="mt-6 flex items-center gap-1 text-[12px] text-white/40">
          <Link href="/plaza" className="hover:text-white/70">
            广场
          </Link>
          <ChevronRightIcon className="size-3" />
          <Link href="/plaza" className="hover:text-white/70">
            剧本市场
          </Link>
          <ChevronRightIcon className="size-3" />
          <span className="text-white/70">{script.title}</span>
        </div>

        {/* Title */}
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <TypeBadge type={script.type} />
            {script.source && (
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/55 ring-1 ring-white/[0.08]">
                来源：{script.source}
              </span>
            )}
            {script.author && (
              <span className="text-[11px] text-white/40">
                编剧：{script.author}
              </span>
            )}
          </div>
          <h1 className="text-[24px] font-medium text-white">
            {script.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-white/50">{detailSubtitle}</p>
        </div>

        {/* Main content */}
        <div className="mt-10 flex gap-12">
          <LeftMenu active={active} onChange={setActive} />
          <div className="flex-1 min-w-0">
            <ContentPanel
              active={active}
              script={{
                id: script.id,
                title: script.title,
                subtitle: detailSubtitle,
                tags: script.tags,
                episodes: script.episodes,
                price: script.price,
              }}
            />
          </div>
          <RightPanel
            coverPrompt={coverPrompt}
            title={script.title}
            price={script.price}
            sold={script.sold}
          />
        </div>
      </div>
    </AppShell>
  );
}
