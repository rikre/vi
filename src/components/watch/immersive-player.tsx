"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ShortDramaProject } from "@/lib/mock-projects";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  HeartIcon,
  LayoutGridIcon,
  PauseIcon,
  PlayIcon,
  ShareIcon,
  StarIcon,
  VolumeIcon,
  VolumeXIcon,
  ZoomInIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

/** 分镜尚未生成视频时的演示片源（与 /create 轮播同一个 CDN 样片） */
const DEMO_VIDEO =
  "https://store.cdn.bollo.video/media/3e373f32289841fda24e32096f5a917e/6dc02e9b328ab2b2/outputs/final_video_1779181877.mp4";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;

export function formatPlayTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const skipClass =
  "flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white";

function RailButton({
  Icon,
  label,
  onClick,
  active = false,
  activeClass,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex w-[52px] flex-col items-center gap-1 text-[11px] text-white/65 transition-colors hover:text-white"
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/15 backdrop-blur-md transition-colors",
          active && "ring-white/35"
        )}
      >
        <Icon className={cn("size-[18px]", active && activeClass)} />
      </span>
      {label}
    </button>
  );
}

/**
 * 竖屏短剧沉浸播放页：黑底、视频居中、左上返回、右侧操作栏、底部进度与选集抽屉。
 * 分镜有 videoUrl 时播放真实视频，否则回退演示片源并标注「演示片源」。
 */
export function ImmersivePlayer({ project }: { project: ShortDramaProject }) {
  const episodes = project.episodeList ?? [];
  const [episodeIdx, setEpisodeIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hint, setHint] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hintTimer = useRef(0);

  const activeEpisode = episodes[episodeIdx];
  const episodeShots = useMemo(
    () => (project.shots ?? []).filter((shot) => shot.episode === activeEpisode?.number),
    [project.shots, activeEpisode]
  );
  const realVideoUrl = episodeShots.find((shot) => shot.videoUrl)?.videoUrl;
  const videoUrl = realVideoUrl ?? DEMO_VIDEO;
  const isDemo = !realVideoUrl;
  const poster = useMemo(() => txi(project.coverPrompt, "portrait_16_9"), [project.coverPrompt]);

  const flash = useCallback((text: string) => {
    setHint(text);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(""), 1800);
  }, []);

  useEffect(() => () => window.clearTimeout(hintTimer.current), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing, videoUrl]);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const upper = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : time;
    const next = Math.min(Math.max(time, 0), upper);
    video.currentTime = next;
    setCurrentTime(next);
  }, []);

  const skip = useCallback((delta: number) => seekTo((videoRef.current?.currentTime ?? 0) + delta), [seekTo]);

  const switchEpisode = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= episodes.length) return;
      setEpisodeIdx(idx);
      setCurrentTime(0);
      setDuration(0);
      setSheetOpen(false);
      if (videoRef.current) videoRef.current.currentTime = 0;
      setPlaying(true);
    },
    [episodes.length]
  );

  const handleEnded = () => {
    if (episodeIdx < episodes.length - 1) {
      switchEpisode(episodeIdx + 1);
    } else {
      setPlaying(false);
    }
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen();
      }
    } catch {
      flash("当前环境不支持全屏");
    }
  }, [flash]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("链接已复制");
    } catch {
      flash("已取消分享");
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSheetOpen(false);
        return;
      }
      if (event.target instanceof HTMLInputElement) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((p) => !p);
      } else if (event.key === "ArrowRight") {
        skip(10);
      } else if (event.key === "ArrowLeft") {
        skip(-10);
      } else if (event.key.toLowerCase() === "f") {
        void toggleFullscreen();
      } else if (event.key.toLowerCase() === "m") {
        setMuted((m) => !m);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip, toggleFullscreen]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 overflow-hidden bg-black text-white">
      {/* 舞台 */}
      <div className="relative flex h-full w-full items-center justify-center">
        <video
          key={videoUrl}
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          playsInline
          preload="metadata"
          muted={muted}
          onClick={() => setPlaying((p) => !p)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
          className="h-full w-full object-contain"
        />

        {/* 顶部：返回 + 标题 */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent px-4 pb-12 pt-4 md:px-8 md:pt-6">
          <div className="pointer-events-auto flex min-w-0 items-center gap-3">
            <Link
              href={`/comic/${project.id}`}
              aria-label="退出播放"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <ChevronLeftIcon className="size-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold">{project.title}</h1>
              <p className="mt-0.5 truncate text-[12px] text-white/50">
                第 {activeEpisode?.number ?? 1} 集
                {activeEpisode ? ` · ${activeEpisode.title}` : ""}
              </p>
            </div>
          </div>
          {isDemo ? (
            <span className="pointer-events-auto shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/60 backdrop-blur-md">
              演示片源
            </span>
          ) : null}
        </header>

        {/* 中央播放键 */}
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="播放"
            className="absolute left-1/2 top-1/2 z-20 flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-md transition-transform hover:scale-105"
          >
            <PlayIcon className="ml-1 size-8" />
          </button>
        ) : null}

        {/* 右侧操作栏 */}
        <div className="absolute bottom-36 right-4 z-20 flex flex-col items-center gap-5 md:bottom-40 md:right-8">
          <RailButton
            Icon={HeartIcon}
            label={liked ? "已赞" : "点赞"}
            active={liked}
            activeClass="text-[#ff6b81]"
            onClick={() => setLiked((v) => !v)}
          />
          <RailButton
            Icon={StarIcon}
            label={saved ? "已收藏" : "收藏"}
            active={saved}
            activeClass="text-brand"
            onClick={() => {
              setSaved((v) => !v);
              flash(saved ? "已取消收藏" : "已收藏");
            }}
          />
          <RailButton Icon={ShareIcon} label="分享" onClick={share} />
          <RailButton Icon={LayoutGridIcon} label="选集" onClick={() => setSheetOpen(true)} />
        </div>

        {hint ? (
          <div className="absolute bottom-40 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur-md">
            {hint}
          </div>
        ) : null}

        {/* 底部控制条 */}
        <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-14 md:px-8 md:pb-6">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            aria-label="播放进度"
            onChange={(event) => seekTo(Number(event.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-brand"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              aria-label="上一集"
              onClick={() => switchEpisode(episodeIdx - 1)}
              disabled={episodeIdx === 0}
              className={cn(skipClass, "disabled:cursor-not-allowed disabled:opacity-35")}
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label={playing ? "暂停" : "播放"}
              onClick={() => setPlaying((p) => !p)}
              className="flex size-9 items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform hover:scale-105"
            >
              {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="ml-0.5 size-4" />}
            </button>
            <button
              type="button"
              aria-label="下一集"
              onClick={() => switchEpisode(episodeIdx + 1)}
              disabled={episodeIdx >= episodes.length - 1}
              className={cn(skipClass, "disabled:cursor-not-allowed disabled:opacity-35")}
            >
              <ChevronRightIcon className="size-4" />
            </button>
            <span className="ml-1 font-mono text-[12px] tracking-tight text-white/60">
              {formatPlayTime(currentTime)} / {formatPlayTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                aria-label={muted ? "取消静音" : "静音"}
                onClick={() => setMuted((m) => !m)}
                className={skipClass}
              >
                {muted ? <VolumeXIcon className="size-4" /> : <VolumeIcon className="size-4" />}
              </button>
              <button type="button" aria-label="全屏" onClick={toggleFullscreen} className={skipClass}>
                <ZoomInIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="ml-1 flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[12px] text-white/85 backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <LayoutGridIcon className="size-3.5" />
                选集
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 选集抽屉 */}
      {sheetOpen ? (
        <div
          role="presentation"
          onClick={() => setSheetOpen(false)}
          className="absolute inset-0 z-40 flex items-end bg-black/60 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="选集"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[58vh] w-full overflow-y-auto rounded-t-2xl bg-[#141414] ring-1 ring-white/10"
          >
            <div className="sticky top-0 flex items-center justify-between bg-[#141414]/95 px-5 py-4 backdrop-blur">
              <h2 className="text-[14px] font-semibold">
                选集
                <span className="ml-1.5 text-[12px] font-normal text-white/40">
                  共 {episodes.length} 集
                </span>
              </h2>
              <button
                type="button"
                aria-label="关闭选集"
                onClick={() => setSheetOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            {episodes.length === 0 ? (
              <p className="px-5 pb-8 pt-2 text-[13px] text-white/40">暂无剧集</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 px-4 pb-6 pt-1 md:grid-cols-4">
                {episodes.map((episode, idx) => {
                  const active = idx === episodeIdx;
                  return (
                    <li key={episode.id}>
                      <button
                        type="button"
                        onClick={() => switchEpisode(idx)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[12px] transition-colors",
                          active
                            ? "bg-brand/15 text-brand ring-1 ring-brand/40"
                            : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
                        )}
                      >
                        <span className="truncate font-semibold">{episode.title}</span>
                        <span className="ml-auto shrink-0 text-[10px] opacity-60">
                          {episode.status}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
