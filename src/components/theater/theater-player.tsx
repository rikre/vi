"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, HeartIcon, PlayIcon, ShareIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/* ── 数据契约（对齐九霄 DramaDetailPlayer 的最小结构） ── */

export type TheaterEpisode = {
  id: string;
  name: string;
  time: string;
  poster: string;
  src: string | null;
  pending?: string | null;
};

export type TheaterWork = {
  id: string;
  title: string;
  author: string;
  type: string;
  ai: boolean;
  poster: string;
  epCount?: string;
  liked: boolean;
  likeCount: number;
  episodes: TheaterEpisode[];
};

export type TheaterDetail = { work: TheaterWork; works: TheaterWork[] };

export type TheaterService = {
  getDrama: (id: string) => Promise<TheaterDetail>;
};

/** 1.2w 式计数（对齐九霄 count 展示） */
export function formatLikeCount(count: number) {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
  return String(count);
}

type StripCard = {
  work: TheaterWork;
  episode: TheaterEpisode | null;
  index: number;
  active: boolean;
  title: string;
  poster: string;
  pending: string;
};

const pillClass =
  "inline-flex items-center gap-1.5 rounded-full bg-white/[0.12] px-4 py-2 text-[13px] text-foreground backdrop-blur-md transition-colors hover:bg-white/20";

/**
 * 数字剧场播放器 — 按九霄 DramaDetailPlayer 移植：
 * 沉浸模式（播放 2s 隐控件）、顶栏（返回/作者胶囊/AI 标识）、点赞+分享操作坞、
 * 选集与相关作品横滑条、加载/错误/重试/片源待接入全套状态。
 */
export function TheaterPlayer({
  dramaId,
  service,
  backHref = "/plaza",
  immersiveDelay = 2000,
}: {
  dramaId: string;
  service: TheaterService;
  backHref?: string;
  immersiveDelay?: number;
}) {
  const [works, setWorks] = useState<TheaterWork[]>([]);
  const [workId, setWorkId] = useState("");
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; notFound?: boolean } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [message, setMessage] = useState("");

  const shellRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  const toastTimer = useRef(0);
  const loadSeq = useRef(0);
  const autoplayRef = useRef(false);
  // 沉浸定时器读取实时播放态，避免闭包旧值（对齐九霄 playing.value 的即时语义）
  const playingRef = useRef(false);

  const work = works.find((item) => item.id === workId) ?? null;
  const episode = work?.episodes[episodeIndex] ?? null;
  const source = episode && !episode.pending ? episode.src : null;
  const poster = episode?.poster || work?.poster || "";

  const cards: StripCard[] = works.flatMap((item) => {
    const isCurrent = item.id === work?.id;
    const entry = item.episodes[0] ?? null;
    return [
      {
        work: item,
        episode: entry,
        index: 0,
        active: isCurrent,
        // 卡片即不同剧目之间的切换，标题保持剧目名 + 各自封面
        title: item.title,
        poster: entry?.poster || item.poster,
        pending: entry?.pending || (!entry ? "片源尚未接入" : ""),
      },
    ];
  });

  const toast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setMessage(text);
    toastTimer.current = window.setTimeout(() => setMessage(""), 4000);
  }, []);

  const scheduleHide = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    if (playingRef.current && immersiveDelay > 0) {
      hideTimer.current = window.setTimeout(() => setImmersive(true), immersiveDelay);
    }
  }, [immersiveDelay]);

  const showUI = useCallback(() => {
    setImmersive(false);
    scheduleHide();
  }, [scheduleHide]);

  const load = useCallback(
    async (id: string) => {
      const seq = ++loadSeq.current;
      setWorks([]);
      setWorkId("");
      setEpisodeIndex(0);
      setLoading(true);
      setError(null);
      autoplayRef.current = false;
      try {
        if (typeof id !== "string" || !id) throw new Error("请提供剧目 ID");
        const detail = await service.getDrama(id);
        if (seq !== loadSeq.current) return;
        setWorks(detail.works);
        setWorkId(id);
      } catch (cause) {
        if (seq !== loadSeq.current) return;
        const notFound = /不存在|下架|404/.test(String((cause as Error)?.message));
        setError({ message: (cause as Error)?.message || "加载失败，请重试", notFound });
      } finally {
        if (seq === loadSeq.current) setLoading(false);
      }
    },
    [service]
  );

  // 首载/换剧：异步触发，避免在 effect 内同步 setState（react-hooks/set-state-in-effect）
  useEffect(() => {
    const timer = window.setTimeout(() => void load(dramaId), 0);
    return () => window.clearTimeout(timer);
  }, [dramaId, load]);

  // 切集/切作品：同步视频源并滚动激活卡到可视中心（对齐九霄 syncVideo）
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !work) return;
    video.pause();
    playingRef.current = false;
    setPlaying(false);
    setImmersive(false);
    window.clearTimeout(hideTimer.current);
    // 不把空 src 写入 DOM，避免浏览器把当前页面当视频请求
    if (source) video.setAttribute("src", source);
    else video.removeAttribute("src");
    video.load();
    document.title = `${work.title} · 正在播放`;
    stripRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    if (autoplayRef.current && source) void video.play().catch(() => toast("视频暂时无法播放，请重试"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId, episodeIndex, works]);

  // 卸载释放：暂停、清 src、清定时器（对齐九霄 onBeforeUnmount）
  useEffect(
    () => () => {
      loadSeq.current += 1;
      playingRef.current = false;
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(toastTimer.current);
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    },
    []
  );

  const onPlay = () => {
    playingRef.current = true;
    setPlaying(true);
    scheduleHide();
  };

  const onPause = () => {
    playingRef.current = false;
    setPlaying(false);
    setImmersive(false);
    window.clearTimeout(hideTimer.current);
  };

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    video.play().catch(() => {
      onPause();
      toast("视频暂时无法播放，请重试");
    });
  }, [source, toast]);

  const clickVideo = () => {
    shellRef.current?.focus({ preventScroll: true });
    if (immersive) showUI();
    else toggle();
  };

  const select = (card: StripCard) => {
    if (card.pending) {
      toast(card.pending);
      return;
    }
    autoplayRef.current = true;
    setWorkId(card.work.id);
    setEpisodeIndex(card.index);
  };

  const toggleLike = () => {
    if (!work) return;
    setWorks((current) =>
      current.map((item) =>
        item.id === work.id
          ? { ...item, liked: !item.liked, likeCount: Math.max(0, item.likeCount + (item.liked ? -1 : 1)) }
          : item
      )
    );
  };

  const share = async () => {
    try {
      const url = new URL(window.location.href);
      if (work) url.searchParams.set("id", work.id);
      const absolute = url.href;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(absolute);
          toast("链接已复制，快去分享吧");
        } catch {
          toast(absolute);
        }
      } else {
        toast(absolute);
      }
    } catch {
      toast("分享失败，请重试");
    }
  };

  const onKeydown = (event: React.KeyboardEvent) => {
    if (event.code !== "Space" || event.repeat) return;
    const target = event.target;
    const active = shellRef.current ?? videoRef.current;
    if (!active || (target !== active && target !== videoRef.current)) return;
    event.preventDefault();
    showUI();
    toggle();
  };

  return (
    <section
      ref={shellRef}
      tabIndex={0}
      aria-label="短剧播放器"
      onKeyDown={onKeydown}
      className={cn(
        "relative isolate h-dvh w-full overflow-hidden bg-black text-[#f5f5f7] outline-none",
        immersive && "is-immersive"
      )}
    >
      <video
        ref={videoRef}
        poster={source ? poster : undefined}
        preload="metadata"
        playsInline
        aria-label="剧集视频"
        onClick={clickVideo}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onPause}
        onError={() => source && toast("视频暂时无法加载，请重试")}
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />

      {/* 加载 / 错误 / 重试 全屏状态 */}
      {loading || error ? (
        <div
          role={error ? "alert" : "status"}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black px-6 text-center"
        >
          {loading ? (
            <p className="text-[14px] text-white/70">正在加载内容…</p>
          ) : (
            <>
              <h2 className="text-[17px] font-semibold">
                {error?.notFound ? "内容不存在或已下架" : "内容暂时无法加载"}
              </h2>
              <p className="max-w-[420px] text-[13px] text-white/55">{error?.message}</p>
              <button
                type="button"
                onClick={() => void load(dramaId)}
                className="rounded-[10px] border border-white/15 bg-white/10 px-5 py-2 text-[13px] transition-colors hover:bg-white/20"
              >
                重新加载
              </button>
            </>
          )}
          <Link
            href={backHref}
            className="rounded-[10px] border border-white/15 bg-white/10 px-5 py-2 text-[13px] transition-colors hover:bg-white/20"
          >
            ← 返回
          </Link>
        </div>
      ) : null}

      {/* 片源待接入占位 */}
      {!loading && !error && work && !source ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-[radial-gradient(ellipse_at_50%_40%,#232323_0%,#000_75%)]">
          <strong className="text-[26px] tracking-[0.06em]">{work.title}</strong>
          <em className="rounded-full border border-white/10 px-3.5 py-1 text-[13px] not-italic text-white/40">
            {episode?.pending || "片源筹备中"}
          </em>
        </div>
      ) : null}

      {/* 顶栏：返回 + 作者胶囊 + 标题 + 更新时间/AI 标识 */}
      {!loading && !error && work ? (
        <header
          aria-label="播放顶栏"
          onClick={scheduleHide}
          className={cn(
            "theater-ui absolute inset-x-0 top-0 z-10 flex items-center gap-3.5 bg-gradient-to-b from-black/60 to-transparent px-4 py-3.5 transition-opacity duration-300 max-[640px]:gap-2 max-[640px]:px-3 max-[640px]:py-3",
            immersive && "pointer-events-none invisible opacity-0"
          )}
        >
          <Link
            href={backHref}
            aria-label="返回"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] bg-white/[0.12] px-3.5 py-1.5 text-[13px] backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowLeftIcon className="size-3.5" />
            返回
          </Link>
          <Link
            href={backHref}
            aria-label={`查看作者 ${work.author}`}
            className="inline-flex min-w-0 shrink items-center gap-2 rounded-full bg-white/[0.12] py-1 pl-1 pr-3.5 backdrop-blur-md transition-colors hover:bg-white/20 max-[640px]:flex-1"
          >
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" className="size-[26px] rounded-lg object-cover" />
            ) : null}
            <b className="truncate text-[13px] font-semibold">{work.author}</b>
            <i className="shrink-0 rounded-full bg-white/[0.14] px-2 py-0.5 text-[10px] not-italic text-white/60">
              {work.type}
            </i>
          </Link>
          <span className="min-w-0 truncate text-[15px] font-semibold max-[640px]:hidden">
            {work.title}
          </span>
          <div className="ml-auto shrink-0 text-right text-[11px] leading-[1.7] text-white/85 max-[640px]:hidden">
            更新时间：<span>{work.episodes[0]?.time || "待接入"}</span>
            {work.ai ? <em className="block not-italic text-white/60">含 AI 生成内容</em> : null}
          </div>
        </header>
      ) : null}

      {/* 中央播放键（暂停且非沉浸时出现） */}
      {work && source && !playing ? (
        <button
          type="button"
          aria-label="播放"
          onClick={toggle}
          className="absolute left-1/2 top-1/2 z-[6] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-[#171717] transition-transform hover:scale-[1.06] max-[640px]:size-[52px]"
        >
          <PlayIcon className="ml-1 size-[26px]" />
        </button>
      ) : null}

      {/* 操作坞：点赞 + 分享（对齐九霄 play-dock） */}
      {!loading && !error && work ? (
        <div
          aria-label="播放操作"
          onClick={scheduleHide}
          className={cn(
            "theater-ui absolute bottom-[118px] left-1/2 z-[8] flex -translate-x-1/2 items-center gap-2.5 transition-opacity duration-300 max-[640px]:bottom-[98px] max-[640px]:gap-2",
            immersive && "pointer-events-none invisible opacity-0"
          )}
        >
          <button
            type="button"
            aria-label="点赞"
            aria-pressed={work.liked}
            title={`${work.likeCount} 次点赞`}
            onClick={toggleLike}
            className={cn(pillClass, work.liked && "text-danger")}
          >
            <HeartIcon className={cn("size-4", work.liked && "fill-current")} />
            <span>{formatLikeCount(work.likeCount)}</span>
          </button>
          <button type="button" aria-label="分享" onClick={share} className={pillClass}>
            <ShareIcon className="size-4" />
            分享
          </button>
        </div>
      ) : null}

      {/* 选集与相关作品横滑条（对齐九霄 play-strip） */}
      {!loading && !error && work ? (
        <div
          ref={stripRef}
          aria-label="选集与相关作品"
          onClick={scheduleHide}
          className={cn(
            "theater-ui no-scrollbar absolute inset-x-0 bottom-0 z-[7] flex gap-2.5 overflow-x-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3.5 pt-6 transition-opacity duration-300 max-[640px]:gap-2 max-[640px]:px-3 max-[640px]:pt-[18px]",
            immersive && "pointer-events-none invisible opacity-0"
          )}
        >
          {cards.map((card) => (
            <button
              key={`${card.work.id}:${card.index}`}
              type="button"
              data-active={card.active ? "true" : undefined}
              aria-current={card.active ? "true" : undefined}
              aria-disabled={!!card.pending}
              onClick={() => select(card)}
              title={card.pending || card.title}
              className={cn(
                "relative h-[88px] w-[150px] shrink-0 overflow-hidden rounded-lg bg-black text-left opacity-60 transition-opacity hover:opacity-90 max-[640px]:h-[72px] max-[640px]:w-[122px]",
                card.active && "opacity-100 ring-[1.5px] ring-white",
                card.pending && "opacity-40"
              )}
            >
              {card.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 bg-[#1d1d1f]" />
              )}
              <i className="absolute left-1.5 top-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] not-italic text-white/90 backdrop-blur-md">
                {card.work.type}
              </i>
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/90 to-transparent px-2 pb-1.5 pt-4 text-[11px]">
                {card.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* 底部居中 toast（对齐九霄 play-message） */}
      {message ? (
        <div
          role="status"
          className="absolute bottom-6 left-1/2 z-30 max-w-[calc(100%-40px)] -translate-x-1/2 wrap-anywhere rounded-[20px] bg-[#232325]/95 px-5 py-3 text-[13px] ring-1 ring-white/10"
        >
          {message}
        </div>
      ) : null}
    </section>
  );
}
