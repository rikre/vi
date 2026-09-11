"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@/components/icons";

/* ──────────────────────────────────────────────────────────────────────────
 * 活动幻灯片 — 卡片式 cover-flow 轮播
 *
 * 核心交互：
 *  1. 一张幻灯片 = 一张图或一个视频（kind: image | video）
 *  2. 每 10s 自动播放一页；悬停暂停；尊重 prefers-reduced-motion
 *  3. cover-flow 卡片感：主卡居中放大，侧卡缩小/旋转/压暗，点击侧卡切换
 *  4. 图片走 Ken Burns 呼吸动效；视频仅主卡自动播放（poster 铺底淡入）
 *  5. 底部进度条指示器 + 左右箭头 + 键盘 ←/→ 切换
 * ──────────────────────────────────────────────────────────────────────── */

const SLIDE_DURATION = 10000;

type Slide = {
  id: string;
  kind: "image" | "video";
  media: string;
  poster?: string;
  tag: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
};

const SLIDES: Slide[] = [
  {
    id: "opc",
    kind: "image",
    media: "/images/campaigns/supercreator.jpg",
    tag: "限时活动",
    title: "OPC 一人公司创作大赛",
    desc: "一个人完成一部短剧，瓜分 1 亿积分奖池",
    cta: "立即参赛",
    href: "/campaigns/campus-ai",
  },
  {
    id: "wansan",
    kind: "video",
    media:
      "https://store.cdn.bollo.video/media/3e373f32289841fda24e32096f5a917e/6dc02e9b328ab2b2/outputs/final_video_1779181877.mp4",
    poster: "/images/skill-cases/hnlnheuv.webp",
    tag: "新模型",
    title: "万三视频模型上线",
    desc: "电影级画面 · 叙事节奏 · 一句话直出成片",
    cta: "立即体验",
    href: "/project/new?action=short",
  },
  {
    id: "script-master",
    kind: "image",
    media: "/images/campaigns/manual-2-0.jpg",
    tag: "新模型",
    title: "剧本大师 3.0 上线",
    desc: "小说到可拍剧本只要 10 分钟，改编成功率提升 30%",
    cta: "去试试",
    href: "/project/new?action=original",
  },
  {
    id: "prompt-workbench",
    kind: "image",
    media: "/images/home/story-anime.webp",
    tag: "新功能",
    title: "Prompt 工作台上线",
    desc: "技能级 Prompt 管理，版本对比、一键回滚",
    cta: "查看玩法",
    href: "/skills",
  },
  {
    id: "membership",
    kind: "image",
    media: "/images/campaigns/overseas.jpg",
    tag: "会员",
    title: "会员权益全面升级",
    desc: "专属模型 + 3 倍积分 + 优先生成队列",
    cta: "查看权益",
    href: "/team",
  },
];

/* cover-flow 位置变换：主卡居中，侧卡缩小旋转压暗 */
function slideTransform(offset: number): React.CSSProperties {
  if (offset === 0) {
    return {
      transform: "translateX(0) scale(1) rotateY(0deg)",
      opacity: 1,
      zIndex: 30,
    };
  }
  if (Math.abs(offset) === 1) {
    return {
      transform: `translateX(${offset * 48}%) scale(0.84) rotateY(${offset * -10}deg)`,
      opacity: 0.45,
      zIndex: 20,
    };
  }
  return {
    transform: `translateX(${offset * 62}%) scale(0.7)`,
    opacity: 0,
    zIndex: 10,
    pointerEvents: "none",
  };
}

export function ShowcaseCarousel() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback((next: number) => {
    setVideoReady(false);
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  /* 自动轮播：10s/页，悬停暂停 / reduced-motion 关闭 */
  useEffect(() => {
    if (paused || reducedMotion) return;
    timerRef.current = setTimeout(() => goTo(index + 1), SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, paused, reducedMotion, goTo]);

  /* 键盘 ←/→ 切换（输入态跳过） */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t.isContentEditable
      ) {
        return;
      }
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  const n = SLIDES.length;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="活动幻灯片"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mt-4 h-[380px] md:h-[440px] lg:h-[480px]"
      style={{ perspective: "1600px" }}
    >
      {/* 卡片层 */}
      {SLIDES.map((s, i) => {
        const offset = ((((i - index) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
        const isActive = i === index;
        return (
          <div
            key={s.id}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-all duration-700 ease-out"
            style={slideTransform(offset)}
          >
            <button
              type="button"
              tabIndex={isActive ? 0 : -1}
              aria-label={isActive ? s.title : `切换到：${s.title}`}
              onClick={() => !isActive && goTo(i)}
              className={cn(
                "group relative block size-full overflow-hidden rounded-3xl text-left",
                "bg-card ring-1 ring-inset ring-white/[0.08]",
                "shadow-[0_24px_64px_rgba(0,0,0,0.5)]",
                "transition-all duration-300",
                isActive
                  ? "cursor-default shadow-[0_24px_80px_rgba(200,255,113,0.12)] group-hover:ring-white/20"
                  : "hover:opacity-70",
              )}
            >
              {/* 媒体层：图片 Ken Burns / 视频主卡自动播放 */}
              <img
                src={s.kind === "video" ? s.poster : s.media}
                alt={s.title}
                loading={isActive ? "eager" : "lazy"}
                className={cn(
                  "absolute inset-0 size-full object-cover",
                  isActive &&
                    s.kind === "image" &&
                    !reducedMotion &&
                    "animate-[kenburns_10s_ease-out_forwards]",
                )}
              />
              {isActive && s.kind === "video" && (
                <video
                  key={`video-${s.id}`}
                  src={s.media}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onCanPlay={() => setVideoReady(true)}
                  className={cn(
                    "absolute inset-0 size-full object-cover transition-opacity duration-700",
                    videoReady ? "opacity-100" : "opacity-0",
                  )}
                />
              )}

              {/* 沉浸渐变 */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
              />

              {/* 信息层 */}
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold leading-[16px] text-brand-foreground">
                  {s.tag}
                </span>
                <h2 className="mt-2 line-clamp-1 text-[20px] font-semibold leading-[28px] text-white md:text-[24px] md:leading-[32px]">
                  {s.title}
                </h2>
                <p className="mt-1 line-clamp-1 text-[13px] leading-[18px] text-white/65">
                  {s.desc}
                </p>
                {isActive && (
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(s.href);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        router.push(s.href);
                      }
                    }}
                    className="mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-brand-foreground shadow-[0_4px_16px_rgba(200,255,113,0.25)] transition-all hover:brightness-105 active:scale-[0.97]"
                  >
                    {s.cta}
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}

      {/* 左右切换箭头 */}
      <button
        type="button"
        aria-label="上一页"
        onClick={() => goTo(index - 1)}
        className="absolute left-1 top-1/2 z-40 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white active:scale-95"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        aria-label="下一页"
        onClick={() => goTo(index + 1)}
        className="absolute right-1 top-1/2 z-40 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white active:scale-95"
      >
        <ChevronRightIcon className="size-5" />
      </button>

      {/* 底部进度条指示器 */}
      <div
        role="tablist"
        aria-label="幻灯片进度"
        className="absolute inset-x-0 -bottom-6 z-40 flex justify-center gap-1.5"
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`第 ${i + 1} 页：${s.title}`}
            onClick={() => goTo(i)}
            className="group h-4 w-10 cursor-pointer"
          >
            <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/20 transition-colors group-hover:bg-white/35">
              {i < index && <span className="block h-full w-full bg-white/70" />}
              {i === index && (
                <span
                  key={`progress-${index}-${paused ? "p" : "r"}`}
                  className="block h-full bg-brand"
                  style={{
                    animation: reducedMotion
                      ? undefined
                      : `carousel-progress ${SLIDE_DURATION}ms linear forwards`,
                    animationPlayState: paused ? "paused" : "running",
                    width: reducedMotion ? "100%" : undefined,
                  }}
                />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* 当前页码 */}
      <p
        aria-hidden
        className="absolute -bottom-6 right-0 z-40 text-[12px] font-medium tabular-nums text-white/50"
      >
        {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
      </p>
    </section>
  );
}
