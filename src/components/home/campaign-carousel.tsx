"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  PauseIcon,
  PlayIcon,
} from "@/components/icons";
import { CAMPAIGN_SLIDES, type CampaignSlide } from "./home-data";

const COOKIE_NAME = "home_campaign_closed";
const AUTOPLAY_MS = 5000;
const subscribeNoop = () => () => {};

function readClosedCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_NAME}=1`));
}

function writeClosedCookie() {
  document.cookie = `${COOKIE_NAME}=1; max-age=${30 * 24 * 3600}; path=/`;
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { days, hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}

function Countdown({ days }: { days: number }) {
  // null = SSR/首帧，显示静态占位；interval 首次回调后进入真实倒计时
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target =
      Date.now() + days * 86400 * 1000 + 1 * 3600 * 1000 + 47 * 60 * 1000;
    const id = window.setInterval(() => setLeft(target - Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [days]);

  const cd = formatCountdown(left ?? days * 86400 * 1000);

  return (
    <span className="flex shrink-0 items-center gap-1 tabular-nums" aria-live="off">
      <span className="text-white/50">距优惠结束</span>
      <span className="font-semibold text-brand">{cd.days}</span>
      <span className="text-white/50">天</span>
      <span className="font-semibold text-brand">{cd.hours}</span>
      <span className="text-white/50">时</span>
      <span className="font-semibold text-brand">{cd.minutes}</span>
      <span className="text-white/50">分</span>
      <span className="font-semibold text-brand">{cd.seconds}</span>
      <span className="text-white/50">秒</span>
    </span>
  );
}

export function CampaignCarousel({ slides = CAMPAIGN_SLIDES }: { slides?: CampaignSlide[] }) {
  const router = useRouter();
  // Cookie 关闭状态走 useSyncExternalStore：SSR 恒为 false，客户端挂载后校验
  const closedByCookie = useSyncExternalStore(
    subscribeNoop,
    readClosedCookie,
    () => false,
  );
  const [closedManually, setClosedManually] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  // 自动轮播：尊重 prefers-reduced-motion
  useEffect(() => {
    if (paused || total <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, total]);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total),
    [total],
  );

  const close = () => {
    writeClosedCookie();
    setClosedManually(true);
  };

  if (closedByCookie || closedManually || total === 0) return null;

  const slide = slides[index];

  return (
    <div
      role="region"
      aria-label="限时活动轮播"
      className="sticky top-0 z-40 flex h-[43px] shrink-0 items-center justify-center bg-background/95 px-10 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="上一条活动"
        onClick={() => go(-1)}
        className="absolute left-4 flex size-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        <ChevronLeftIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => router.push(slide.href)}
        className="flex min-w-0 max-w-full items-center gap-3 truncate text-[13px] text-white/90 transition-colors hover:text-white"
      >
        <span className="truncate font-semibold">{slide.title}</span>
        {slide.highlights.map((h) => (
          <span key={h.label} className="hidden shrink-0 items-center gap-1 md:flex">
            <span className="text-white/50">{h.label}</span>
            <span className="font-semibold text-brand">{h.value}</span>
          </span>
        ))}
        {slide.countdownDays !== undefined ? (
          <span className="hidden lg:flex">
            <Countdown days={slide.countdownDays} />
          </span>
        ) : null}
      </button>

      <div className="absolute right-3 flex items-center gap-1.5">
        <div className="mr-1 flex items-center gap-1.5" aria-hidden="true">
          {slides.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === index ? "bg-brand" : "bg-white/25"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={paused ? "恢复自动轮播" : "暂停自动轮播"}
          onClick={() => setPaused((p) => !p)}
          className="flex size-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          {paused ? <PlayIcon className="size-3" /> : <PauseIcon className="size-3" />}
        </button>
        <button
          type="button"
          aria-label="下一条活动"
          onClick={() => go(1)}
          className="flex size-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronRightIcon className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="关闭活动条"
          onClick={close}
          className="flex size-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
