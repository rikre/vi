"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CoinsIcon,
  SparkleIcon,
  ChevronDownIcon,
  UploadIcon,
} from "@/components/icons";
import { StyleLibraryDialog } from "@/components/style-library-dialog";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

// ─── Types ───────────────────────────────────────────────────────────────────

type MainMode = "script" | "short";
type ScriptSubTab = "原创剧本" | "IP 改编";
type ShortSubMode = "Agent" | "人工模式";

// ─── Data ────────────────────────────────────────────────────────────────────

const MAIN_MODES: { id: MainMode; label: string }[] = [
  { id: "short", label: "做短剧" },
  { id: "script", label: "写剧本" },
];

const SCRIPT_SUB_TABS: ScriptSubTab[] = ["原创剧本", "IP 改编"];
const SHORT_SUB_MODES: ShortSubMode[] = ["Agent", "人工模式"];

const QUICK_ENTRIES = [
  { label: "剧本广场", icon: "clapper", href: "#" },
  { label: "剧本评分", icon: "star", href: "#" },
  { label: "拉片/拆书", icon: "sparkle", href: "#" },
  { label: "定制剧本", icon: "triangle", href: "#" },
];

const SHORT_QUICK_ENTRIES = [
  {
    label: "接制作单",
    desc: "去接单广场赚钱",
    icon: "briefcase",
    bg: "dark mountain landscape with dramatic lightning, cinematic",
    href: "#",
  },
  {
    label: "资产广场",
    desc: "挑选演员，锁定形象",
    icon: "users",
    bg: "ancient chinese palace with misty mountains, epic cinematic",
    href: "#",
  },
];

// ─── Quick entry icons ───────────────────────────────────────────────────────

function QuickIcon({ name }: { name: string }) {
  const common = "size-5";
  if (name === "clapper")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
        <path d="M7 8 3 6l3-2 3 2-3 2Zm7 0-3-2 3-2 3 2-3 2ZM3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Z" />
        <path d="M3 9h18" />
      </svg>
    );
  if (name === "shield")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
        <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  if (name === "star")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`${common} text-[#ffd166]`}>
        <path d="m12 3 2.9 5.9 6.6.95-4.75 4.65 1.1 6.5L12 17.8 6.15 20l1.1-6.5L2.5 9.85l6.6-.95Z" />
      </svg>
    );
  if (name === "sparkle")
    return <SparkleIcon className={`${common} text-[#ffd166]`} />;
  if (name === "triangle")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
        <path d="M12 3 3 20h18Z" />
      </svg>
    );
  if (name === "briefcase")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  if (name === "users")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  return null;
}

// ─── Dropdown helper ─────────────────────────────────────────────────────────

function DropdownPicker({
  label,
  value,
  options,
  onSelect,
  accent,
}: {
  label?: string;
  value: string;
  options: readonly string[];
  onSelect: (v: string) => void;
  accent?: "cyan";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 text-[13px] transition-colors",
          accent === "cyan" ? "text-[#5fffe0]" : "text-white/50"
        )}
      >
        {label && (
          <>
            <span>{label}</span>
            <span className="text-white/30">·</span>
          </>
        )}
        <span className={cn(accent === "cyan" ? "text-[#5fffe0]" : "text-white/70")}>{value}</span>
        <ChevronDownIcon className="size-3 text-white/30" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[120px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1a] py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]",
                opt === value ? "text-brand" : "text-white/70"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function HeroSection() {
  const router = useRouter();
  const [mainMode, setMainMode] = useState<MainMode>("short");

  // Script state
  const [scriptSubTab, setScriptSubTab] = useState<ScriptSubTab>("原创剧本");
  const [scriptStyleOpen, setScriptStyleOpen] = useState(false);
  const [episodes, setEpisodes] = useState("40集");

  // Short drama state
  const [shortSubMode, setShortSubMode] = useState<ShortSubMode>("Agent");
  const [shortMode, setShortMode] = useState("剧本模式");
  const [style, setStyle] = useState("无");
  const [tone, setTone] = useState("无");
  const [ratio, setRatio] = useState("9:16");
  const [shortStyleOpen, setShortStyleOpen] = useState(false);

  const isShort = mainMode === "short";

  return (
    <section className="relative overflow-hidden">
      {/* cosmic backdrop */}
      <img
        src={txi(
          "dark cosmic accretion disk swirl, glowing golden orange light flare on the left, deep black space on the right, cinematic, ultra detailed, no text",
          "square"
        )}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_18%_40%,rgba(255,150,60,0.18),transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-[#0a0a0a]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]/80"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 pb-9 pt-9">
        {/* Title block */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[34px] font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(255,255,255,0.18)] sm:text-[44px]">
            一人一座
            <span className="text-brand">梦工厂</span>
          </h1>
          <div className="mt-4 flex items-center gap-3 text-[13px] font-medium text-white/60">
            {["灵感", "剧本", "成片", "发行"].map((word, i) => (
              <span key={word} className="flex items-center gap-3">
                <span className="relative">
                  {word}
                  <span className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
                </span>
                {i < 3 && (
                  <span className="size-1 rounded-full bg-gradient-to-r from-brand/60 to-[#00e5c8]/60" />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Main mode toggle — top center */}
        <div className="mx-auto mt-6 flex w-fit items-center gap-1 rounded-full bg-white/15 p-1 ring-1 ring-white/10 backdrop-blur-md">
          {MAIN_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMainMode(m.id)}
              className={cn(
                "rounded-full px-8 py-2 text-[14px] font-semibold transition-colors",
                mainMode === m.id
                  ? "bg-white text-black shadow"
                  : "text-white/65 hover:text-white"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Composer */}
        <div className="mx-auto mt-6 max-w-[880px]">
          {/* Sub-tab — left aligned outside composer, above it */}
          <div className="mb-2 flex items-center gap-1">
            {isShort ? (
              SHORT_SUB_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setShortSubMode(mode)}
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors",
                    shortSubMode === mode
                      ? "bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] text-black shadow-lg"
                      : "bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  {mode}
                  {mode === "人工模式" && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              SCRIPT_SUB_TABS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setScriptSubTab(sub)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-[13px] font-medium transition-colors",
                    scriptSubTab === sub
                      ? "bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] text-black shadow-lg"
                      : "bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  {sub}
                </button>
              ))
            )}
          </div>

          <div className="relative rounded-2xl bg-[#1b1b1b]/90 p-4 ring-1 ring-white/10 backdrop-blur-sm">
            {/* ── Short drama: Agent mode upload area ── */}
            {isShort && shortSubMode === "Agent" && (
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/[0.15] px-6 py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.12]"
                    >
                      <UploadIcon className="size-4" />
                      上传剧本
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.12]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      </svg>
                      粘贴文本
                    </button>
                  </div>
                  <p className="text-[12px] text-white/40">
                    支持.docx/.txt，最多 10 万字，可拖拽至此上传
                  </p>
                </div>
              </div>
            )}

            {/* ── Short drama: manual mode ── */}
            {isShort && shortSubMode === "人工模式" && (
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/[0.15] px-6 py-8">
                <p className="text-[13px] text-white/40">
                  此模式无需上传剧本，创建项目后所有步骤均可自主编辑
                </p>
              </div>
            )}

            {/* ── Script: original ── */}
            {!isShort && scriptSubTab === "原创剧本" && (
              <div className="relative">
                <span className="absolute left-3 top-3 text-[13px] font-medium text-[#5fffe0]">#男频</span>
                <textarea
                  rows={4}
                  placeholder="在此处输入想法，我们将为您定制创意，至少输入15字"
                  aria-label="创作输入框"
                  className="w-full resize-none bg-transparent px-3 pt-9 text-[14px] leading-relaxed text-white placeholder:text-white/35 outline-none"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-white/30 transition-colors hover:text-white/60"
                  aria-label="展开"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <path d="M7 14v5h5M17 10V5h-5M14 10l7-7M3 21l7-7" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── Script: IP adapt ── */}
            {!isShort && scriptSubTab === "IP 改编" && (
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/[0.15] px-6 py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.12]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                        <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                      </svg>
                      引用IP
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.12]"
                    >
                      <UploadIcon className="size-4" />
                      本地文件
                    </button>
                  </div>
                  <p className="text-[12px] text-white/40">
                    支持.docx/.txt，最多 15 万字，可拖拽至此上传
                  </p>
                </div>
              </div>
            )}

            {/* ── Bottom row ── */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
              <div className="flex flex-wrap items-center gap-3">
                {isShort ? (
                  <>
                    <DropdownPicker
                      value={`短剧·${shortMode}`}
                      options={["剧本模式", "分镜模式"]}
                      onSelect={(v) => setShortMode(v)}
                      accent="cyan"
                    />
                    <DropdownPicker
                      label="画面风格"
                      value={style}
                      options={["无", "写实", "二次元", "3D", "欧美"]}
                      onSelect={(v) => setStyle(v)}
                    />
                    <DropdownPicker
                      label="影调"
                      value={tone}
                      options={["无", "明亮", "暗黑", "复古", "赛博朋克"]}
                      onSelect={(v) => setTone(v)}
                    />
                    <DropdownPicker
                      value={ratio}
                      options={["9:16", "16:9", "1:1", "4:3", "3:4"]}
                      onSelect={(v) => setRatio(v)}
                    />
                  </>
                ) : (
                  <>
                    <DropdownPicker
                      value={episodes}
                      options={["20集", "30集", "40集", "60集", "100集"]}
                      onSelect={(v) => setEpisodes(v)}
                    />
                    <DropdownPicker
                      label="目标受众"
                      value="男频"
                      options={["男频", "女频"]}
                      onSelect={() => {}}
                      accent="cyan"
                    />
                    <DropdownPicker
                      label="题材类型"
                      value="✦"
                      options={["仙侠玄幻", "现代都市", "悬疑灵异", "架空历史"]}
                      onSelect={() => {}}
                    />
                    <DropdownPicker
                      label="核心设定"
                      value="✦"
                      options={["重生", "穿越", "系统", "快穿"]}
                      onSelect={() => {}}
                    />
                    <button
                      type="button"
                      onClick={() => setScriptStyleOpen(true)}
                      className="flex items-center gap-1 text-[13px] text-white/50 transition-colors hover:text-white/80"
                    >
                      <SparkleIcon className="size-3.5" />
                      风格元素
                    </button>
                  </>
                )}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => router.push("/create")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-5 py-2 text-[13.5px] font-bold text-black shadow-lg transition-all active:scale-[0.98]",
                  isShort
                    ? "bg-white/20 text-white/40 hover:bg-white/25"
                    : "bg-gradient-to-r from-[#00e5c8] to-[#7dff8c] hover:brightness-110"
                )}
              >
                开始创作
                <CoinsIcon className="size-4" />
                <span className="tabular-nums">190</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick entry cards */}
        <div className="mx-auto mt-4 grid max-w-[880px] gap-3">
          {isShort ? (
            <div className="grid grid-cols-2 gap-3">
              {SHORT_QUICK_ENTRIES.map((entry) => (
                <Link
                  key={entry.label}
                  href={entry.href}
                  className="group relative h-[80px] overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all hover:ring-white/20"
                >
                  <img
                    src={txi(entry.bg, "landscape_16_9")}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-35 transition-opacity group-hover:opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
                  <div className="relative flex h-full items-center gap-3 px-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.1] text-white/80 ring-1 ring-white/10">
                      <QuickIcon name={entry.icon} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-white">
                        {entry.label}
                      </span>
                      <span className="text-[12px] text-white/50">
                        {entry.desc}
                      </span>
                    </div>
                    <div className="ml-auto flex -space-x-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="size-7 rounded-full ring-2 ring-[#141414]"
                          style={{
                            backgroundImage: `url(${txi(
                              `portrait of person ${i + 1}, cinematic lighting`,
                              "square"
                            )})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid-cols-4 gap-3 grid">
              {QUICK_ENTRIES.map((entry) => (
                <Link
                  key={entry.label}
                  href={entry.href}
                  className="group relative h-[68px] overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all hover:ring-white/20"
                >
                  <img
                    src={txi(
                      `abstract nebula galaxy cosmic dust, deep space, dark background, cinematic lighting`,
                      "square"
                    )}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-25 transition-opacity group-hover:opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="relative flex h-full items-center gap-2.5 px-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white/80 ring-1 ring-white/10">
                      <QuickIcon name={entry.icon} />
                    </span>
                    <span className="text-[13px] font-medium text-white/90">
                      {entry.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <StyleLibraryDialog
        open={shortStyleOpen || scriptStyleOpen}
        onClose={() => {
          setShortStyleOpen(false);
          setScriptStyleOpen(false);
        }}
      />
    </section>
  );
}
