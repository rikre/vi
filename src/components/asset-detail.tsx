"use client";

import { useState, useCallback } from "react";
import {
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CoinsIcon,
  CrownIcon,
  SparkleIcon,
} from "@/components/icons";

type StyleOption = { id: string; label: string; prompt: string };

export type AssetCharacter = {
  id: string;
  name: string;
  imagePrompt: string;
  gender: "男" | "女";
  type: "虚拟角色" | "真人演员";
  level: string;
  tags: string[];
  price: number | null;
  copyright: string;
  persona: string;
  makeupStyles: StyleOption[];
  outfitStyles: StyleOption[];
};

interface AssetDetailProps {
  character: AssetCharacter;
  onBack: () => void;
  onClose: () => void;
}

function imageUrl(prompt: string, size = "portrait_4_3") {
  return `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

function formatTime() {
  return new Date().toLocaleDateString("zh-CN");
}

/** 试妆 / 试服装 弹层 */
function StyleTrialDialog({
  mode,
  character,
  onClose,
}: {
  mode: "makeup" | "outfit";
  character: AssetCharacter;
  onClose: () => void;
}) {
  const styles = mode === "makeup" ? character.makeupStyles : character.outfitStyles;
  const [index, setIndex] = useState(0);
  const current = styles[index];

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + styles.length) % styles.length),
    [styles.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % styles.length),
    [styles.length]
  );

  const previewPrompt = `${character.imagePrompt}, ${current.prompt}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "makeup" ? "试妆预览" : "试服装预览"}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="relative flex h-[560px] w-[860px] max-w-[92vw] overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/10">
        {/* 左侧样式列表 */}
        <div className="flex w-[200px] shrink-0 flex-col border-r border-white/[0.08] py-5">
          <h3 className="px-5 pb-4 text-[15px] font-semibold text-white">
            {mode === "makeup" ? "选择妆容样式" : "选择服装样式"}
          </h3>
          <div className="flex-1 space-y-1 overflow-y-auto px-3">
            {styles.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                  i === index
                    ? "bg-[#00e5c8]/12 text-[#00e5c8] ring-1 ring-[#00e5c8]/25"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <img
                  src={imageUrl(`${character.imagePrompt}, ${s.prompt}`, "square")}
                  alt={s.label}
                  loading="lazy"
                  className="size-9 shrink-0 rounded-md object-cover ring-1 ring-white/10"
                />
                <span className="text-[13px] font-medium">{s.label}</span>
              </button>
            ))}
          </div>
          <p className="px-5 pt-3 text-[11px] text-white/30">
            左滑预览即时切换 · {formatTime()}
          </p>
        </div>

        {/* 中间预览 */}
        <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#111]">
          {/* 关闭 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white/60 transition-colors hover:bg-black/70 hover:text-white"
            aria-label="关闭预览"
          >
            <CloseIcon className="size-4" />
          </button>

          {/* 左右切换 */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white/70 ring-1 ring-white/10 transition-all hover:bg-black/60 hover:text-white"
            aria-label="上一个"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white/70 ring-1 ring-white/10 transition-all hover:bg-black/60 hover:text-white"
            aria-label="下一个"
          >
            <ChevronRightIcon className="size-5" />
          </button>

          <div className="relative h-[440px] w-[330px] overflow-hidden rounded-xl ring-1 ring-white/10">
            <img
              key={current.id}
              src={imageUrl(previewPrompt)}
              alt={`${character.name} - ${current.label}`}
              loading="lazy"
              className="size-full animate-[fadeIn_0.4s_ease] object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10">
              <p className="text-center text-[14px] font-semibold text-white">
                {current.label}
              </p>
              <p className="mt-0.5 text-center text-[11px] text-white/50">
                {character.name} · {mode === "makeup" ? "妆容预览" : "服装预览"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetDetail({ character, onBack, onClose }: AssetDetailProps) {
  const [activeOutfit, setActiveOutfit] = useState(0);
  const [trialMode, setTrialMode] = useState<"makeup" | "outfit" | null>(null);

  const isFree = character.price === null;
  const personaList = character.persona.split("·");

  const mainPrompt = `${character.imagePrompt}, ${character.outfitStyles[activeOutfit]?.prompt ?? ""}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="返回资产广场"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <span className="text-[13px] text-white/40">资产广场</span>
        <span className="text-[13px] text-white/20">/</span>
        <span className="text-[13px] font-medium text-white">{character.name}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="关闭"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 gap-0 overflow-hidden px-6 pb-6">
        {/* 左侧大图 */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#161616] to-[#0e0e0e] ring-1 ring-white/[0.06]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,200,0.04)_0%,transparent_70%)]" />
          <div className="relative h-[calc(100%-48px)] max-h-[680px] aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-white/10">
            <img
              key={activeOutfit}
              src={imageUrl(mainPrompt)}
              alt={character.name}
              loading="lazy"
              className="size-full animate-[fadeIn_0.4s_ease] object-cover"
            />
            {/* 价格角标 */}
            <div className="absolute left-3 top-3">
              {isFree ? (
                <span className="flex items-center gap-1 rounded-md bg-[#00e5c8]/90 px-2 py-1 text-[11px] font-bold text-black">
                  <CrownIcon className="size-3" /> 会员免费
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold text-brand backdrop-blur-sm">
                  <CoinsIcon className="size-3" /> {character.price}积分/副
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧缩略图列 */}
        <div className="flex w-[92px] shrink-0 flex-col items-center gap-2 overflow-y-auto py-2 pl-3">
          <p className="pb-1 text-[10px] text-white/30">换装</p>
          {character.outfitStyles.map((o, i) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActiveOutfit(i)}
              className={`relative size-[72px] shrink-0 overflow-hidden rounded-lg transition-all ${
                i === activeOutfit
                  ? "ring-2 ring-[#00e5c8]"
                  : "ring-1 ring-white/10 opacity-60 hover:opacity-100"
              }`}
              aria-label={`切换服装：${o.label}`}
            >
              <img
                src={imageUrl(`${character.imagePrompt}, ${o.prompt}`, "square")}
                alt={o.label}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* 右侧信息面板 */}
        <div className="flex w-[340px] shrink-0 flex-col pl-5">
          <div className="flex-1 overflow-y-auto pr-1">
            {/* 名称 + 类型 */}
            <div className="flex items-start justify-between">
              <h2 className="text-[22px] font-bold leading-tight text-white">
                {character.name}
              </h2>
              <span
                className={`mt-1 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                  character.type === "虚拟角色"
                    ? "bg-[#00e5c8]/12 text-[#00e5c8]"
                    : "bg-pink-500/12 text-pink-400"
                }`}
              >
                {character.type}
              </span>
            </div>

            {/* 基础信息 */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3.5 py-2.5 ring-1 ring-white/[0.06]">
                <span className="text-[12px] text-white/40">版权归属</span>
                <span className="text-[13px] font-medium text-white/80">
                  {character.copyright}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3.5 py-2.5 ring-1 ring-white/[0.06]">
                <span className="text-[12px] text-white/40">演员级别</span>
                <span className="text-[13px] font-medium text-brand">
                  {character.level}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3.5 py-2.5 ring-1 ring-white/[0.06]">
                <span className="text-[12px] text-white/40">使用价格</span>
                {isFree ? (
                  <span className="text-[13px] font-semibold text-[#00e5c8]">
                    免费 · 会员可免费使用
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[13px] font-semibold text-brand">
                    <CoinsIcon className="size-3.5" /> {character.price}积分/副
                  </span>
                )}
              </div>
            </div>

            {/* 适配人设 */}
            <div className="mt-5">
              <p className="text-[12px] text-white/40">适配人设</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {personaList.map((p) => (
                  <span
                    key={p}
                    className="rounded-md bg-white/[0.06] px-2.5 py-1 text-[12px] text-white/70 ring-1 ring-white/[0.08]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* 标签 */}
            <div className="mt-5">
              <p className="text-[12px] text-white/40">标签</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {character.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2.5 py-0.5 text-[11px] text-white/50 ring-1 ring-white/[0.1]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 试妆 / 试服装 */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTrialMode("makeup")}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white/[0.06] text-[13px] font-medium text-white ring-1 ring-white/[0.1] transition-all hover:bg-white/[0.1] hover:ring-white/20"
              >
                <SparkleIcon className="size-3.5 text-[#00e5c8]" /> 试妆
              </button>
              <button
                type="button"
                onClick={() => setTrialMode("outfit")}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white/[0.06] text-[13px] font-medium text-white ring-1 ring-white/[0.1] transition-all hover:bg-white/[0.1] hover:ring-white/20"
              >
                <SparkleIcon className="size-3.5 text-pink-400" /> 试服装
              </button>
            </div>
          </div>

          {/* 底部 CTA */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() =>
                console.log(
                  isFree ? "立即免费使用" : "充值积分免费购买",
                  character.name
                )
              }
              className="h-11 w-full rounded-xl bg-gradient-to-r from-[#00e5c8] to-[#7dff8c] text-[14px] font-bold text-black shadow-[0_4px_24px_rgba(0,229,200,0.25)] transition-all hover:shadow-[0_4px_32px_rgba(0,229,200,0.4)] hover:brightness-105 active:scale-[0.98]"
            >
              {isFree ? "立即免费使用" : "充值积分免费购买"}
            </button>
            <p className="mt-2 text-center text-[11px] text-white/25">
              {isFree ? "会员专属 · 无限次使用" : `一次购买 · 永久授权使用`}
            </p>
          </div>
        </div>
      </div>

      {/* 试妆/试服装弹层 */}
      {trialMode && (
        <StyleTrialDialog
          mode={trialMode}
          character={character}
          onClose={() => setTrialMode(null)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
