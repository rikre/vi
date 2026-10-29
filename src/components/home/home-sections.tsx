"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  TrendDownIcon,
  TrendFlatIcon,
} from "@/components/icons";
import {
  ARTISTS,
  IP_LIBRARY,
  QUICK_ACTIONS,
  THEATERS,
  TREND_CARDS,
  WIDE_BANNER,
  type ArtistItem,
  type IpItem,
  type QuickAction,
  type TheaterItem,
  type TrendCard,
} from "./home-data";

/* ── 快捷创作入口：深色卡 + 左侧标题描述 + 右侧缩略图 ── */
export function QuickActions({ items = QUICK_ACTIONS }: { items?: QuickAction[] }) {
  return (
    <section aria-label="快捷创作入口" className="mx-auto mt-8 w-full max-w-[1360px]">
      <div className="mb-3 flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">快捷创作</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">从单次生成到数字资产，选择一种能力快速开始</p>
        </div>
        <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{items.length} 项能力</span>
      </div>
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {items.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group card-base relative flex h-[96px] items-stretch overflow-hidden"
          >
            <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3 pl-4 pr-2">
              <strong className="truncate text-[14px] font-semibold text-foreground transition-colors group-hover:text-brand">
                {a.title}
              </strong>
              <span className="line-clamp-2 text-[11px] leading-[15px] text-muted-foreground">
                {a.desc}
              </span>
            </div>
            <div aria-hidden="true" className="relative w-[38%] shrink-0 overflow-hidden">
              <img
                src={a.img}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-300 group-hover:scale-[1.05] group-hover:opacity-100"
              />
              <span className="absolute inset-0 bg-[linear-gradient(90deg,#141414_0%,rgba(20,20,20,0.5)_34%,transparent_78%)]" />
              <span className="absolute bottom-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-background/75 text-foreground ring-1 ring-white/15 backdrop-blur-sm transition-all group-hover:bg-brand group-hover:text-brand-foreground group-hover:ring-brand">
                <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── 洞察区：双热榜趋势卡（浅色） + 宽幅活动 banner ── */
export function InsightSection({
  trendCards = TREND_CARDS,
  banner = WIDE_BANNER,
}: {
  trendCards?: TrendCard[];
  banner?: { text: string; img: string; character: string; href: string };
}) {
  return (
    <section aria-label="创作洞察" className="mt-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[615px_721px]">
        {/* 左列：两张趋势卡 */}
        <div className="flex flex-col gap-4">
          {trendCards.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="group relative block h-[171px] w-full shrink-0 overflow-hidden rounded-[18px] bg-[linear-gradient(100deg,#f1f1eb,#dfe7cc)] transition-transform hover:-translate-y-0.5 lg:w-[615px]"
            >
              {t.id === "hongguo" ? (
                <>
                  <img
                    src="/images/home/trend-bg-hot.png"
                    alt=""
                    loading="lazy"
                    className="absolute right-0 top-0 h-full opacity-90"
                  />
                  <img
                    src="/images/home/trend-char-hot.png"
                    alt=""
                    loading="lazy"
                    className="absolute bottom-0 left-0 size-[142px]"
                  />
                </>
              ) : null}
              <div className="relative z-10 flex h-full items-center justify-between gap-4 px-[30px] py-5">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[17px] font-bold text-brand-foreground">
                      {t.title}
                    </span>
                    <small className="text-[12px] text-brand-foreground/60">
                      {t.date}
                    </small>
                  </div>
                  <div className="mt-1 flex items-end gap-1.5">
                    <strong className="text-[56px] font-black leading-none tracking-tight text-brand-foreground">
                      {t.percent}
                    </strong>
                    {t.direction === "flat" ? (
                      <TrendFlatIcon className="mb-1.5 size-4 text-brand-foreground" />
                    ) : (
                      <TrendDownIcon className="mb-1.5 size-4 text-brand-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2.5">
                  <div className="flex gap-4 text-[12px] text-brand-foreground/75">
                    <span>
                      <strong className="text-[14px] font-bold">{t.hotCount}</strong>
                      部热剧
                    </span>
                    <span>
                      <strong className="text-[14px] font-bold">{t.newCount}</strong>
                      部新晋
                    </span>
                  </div>
                  {t.tags.length > 0 ? (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-foreground/[0.08] px-2.5 py-1 text-[12px] text-brand-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="text-[18px] leading-none text-brand-foreground transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 右列：宽幅活动 banner */}
        <Link
          href={banner.href}
          className="group relative block h-[358px] overflow-hidden rounded-[18px]"
        >
          <img
            src={banner.img}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <img
            src={banner.character}
            alt=""
            loading="lazy"
            className="absolute right-8 top-0 size-[142px] origin-top scale-[1.1]"
          />
          <span className="absolute inset-0 flex items-center justify-center text-[30px] font-bold text-warning">
            {banner.text}
          </span>
        </Link>
      </div>
    </section>
  );
}

/* ── 通用 section 头：h2 + 探索更多 ── */
function SectionHead({
  title,
  moreHref,
}: {
  title: string;
  moreHref?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[22px] font-normal text-foreground">{title}</h2>
      {moreHref ? (
        <Link
          href={moreHref}
          className="text-[13px] text-brand transition-colors hover:text-brand-hover"
        >
          探索更多<span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}

/* ── 通用海报卡遮罩（底部 + 左侧渐变） ── */
function PosterShade() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,8,0.94)_0%,rgba(8,10,8,0.24)_44%,transparent_62%),linear-gradient(90deg,rgba(8,10,8,0.14),transparent_38%)]"
    />
  );
}

/* ── 爆款IP库：20 卡横向滚动 ── */
export function IpLibrarySection({ items = IP_LIBRARY }: { items?: IpItem[] }) {
  return (
    <section aria-label="爆款IP库" className="mt-12">
      <SectionHead title="爆款IP库" moreHref="/script/market" />
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-1">
        {items.map((ip) => (
          <Link
            key={ip.title}
            href={ip.href}
            aria-label={`查看 IP《${ip.title}》`}
            className="group relative block aspect-[174/249] w-[174px] shrink-0 overflow-hidden rounded-[12px] ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:ring-white/20"
          >
            <img
              src={ip.img}
              alt={ip.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <PosterShade />
            <div className="absolute bottom-[14px] left-[14px] right-[14px] z-10 text-left">
              <h3 className="truncate text-[14px] font-medium text-foreground">
                {ip.title}
              </h3>
              <p className="mt-1 flex gap-1.5 text-[12px] text-foreground/70">
                <span>{ip.level}</span>
                <span>{ip.channel}</span>
                <span>{ip.genre}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── 数字艺人：4 卡方形 ── */
export function ArtistSection({ items = ARTISTS }: { items?: ArtistItem[] }) {
  const router = useRouter();
  return (
    <section aria-label="数字艺人" className="mt-12">
      <SectionHead title="数字艺人" />
      <div className="mt-5 grid grid-cols-2 gap-[22px] lg:grid-cols-4">
        {items.map((a) => (
          <button
            key={a.name}
            type="button"
            aria-label={`查看数字艺人 ${a.name}`}
            onClick={() => router.push("/library")}
            className="group relative block aspect-square w-full overflow-hidden rounded-[12px] ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:ring-white/20"
          >
            <img
              src={a.img}
              alt={a.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <PosterShade />
            <div className="absolute bottom-[14px] left-[14px] z-10 text-left">
              <h3 className="text-[14px] font-medium text-foreground">{a.name}</h3>
              <p className="mt-1 text-[12px] text-foreground/70">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── 数字剧场：8 卡 4 列 2 行，hover 直接静音预览，点击进入沉浸播放 ── */
function TheaterPreviewVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      onMouseEnter={() => void videoRef.current?.play().catch(() => undefined)}
      onMouseLeave={() => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        video.currentTime = 0;
      }}
    />
  );
}

export const THEATER_PREVIEW_VIDEO =
  "https://store.cdn.bollo.video/media/3e373f32289841fda24e32096f5a917e/6dc02e9b328ab2b2/outputs/final_video_1779181877.mp4";

export function TheaterSection({ items = THEATERS }: { items?: TheaterItem[] }) {
  return (
    <section aria-label="数字剧场" className="mt-12">
      <SectionHead title="数字剧场" />
      <div className="mt-5 grid grid-cols-2 gap-[22px] lg:grid-cols-4">
        {items.map((t, idx) => (
          <Link
            key={t.title}
            href={`/theater/${idx + 1}`}
            aria-label={`播放 ${t.title}`}
            className="group relative block aspect-[1.6/1] w-full overflow-hidden rounded-[12px] ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:ring-white/20"
          >
            <img
              src={t.img}
              alt={t.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            />
            {/* hover 直接静音循环播放预览 */}
            <TheaterPreviewVideo src={THEATER_PREVIEW_VIDEO} poster={t.img} />
            <PosterShade />
            <div className="absolute bottom-[14px] left-[14px] right-[14px] z-10 text-left">
              <h3 className="line-clamp-2 text-[14px] font-medium text-foreground">
                {t.title}
              </h3>
              <p className="mt-1 text-[12px] text-foreground/70">{t.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
