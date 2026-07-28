"use client";

import { useMemo, useState } from "react";
import type { Episode, ShortDramaProject, ShotItem } from "@/lib/mock-projects";
import {
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ScriptIcon,
  UploadIcon,
  DownloadIcon,
  CheckIcon,
} from "@/components/icons";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

type FinalModule = "分镜视频" | "配音" | "配字幕";

const MODULE_TABS: { key: FinalModule; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "分镜视频", label: "分镜视频", Icon: VideoCameraIcon },
  { key: "配音", label: "配音", Icon: MicrophoneIcon },
  { key: "配字幕", label: "配字幕", Icon: ScriptIcon },
];

const TIMELINE_SEGMENTS = [
  { label: "分镜 1", duration: "00:02", color: "bg-brand/70" },
  { label: "分镜 2", duration: "00:02", color: "bg-cyan-400/70" },
  { label: "分镜 3", duration: "00:02", color: "bg-purple-400/70" },
  { label: "分镜 4", duration: "00:02", color: "bg-amber-400/70" },
];

function statusDotClass(status: Episode["status"]) {
  if (status === "已完成") return "bg-brand";
  if (status === "进行中") return "bg-amber-400";
  return "bg-white/30";
}

export default function FilmTab({
  project,
}: {
  project: ShortDramaProject;
}) {
  const episodes = useMemo<Episode[]>(() => {
    return (
      project.episodeList ?? [
        {
          id: "ep-1",
          number: 1,
          title: "第1集",
          status: "进行中",
          progress: 50,
        },
      ]
    );
  }, [project.episodeList]);

  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState(0);
  const [finalModule, setFinalModule] = useState<FinalModule>("分镜视频");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);

  const activeEpisode = episodes[activeEpisodeIdx] ?? episodes[0];

  const episodeShots = useMemo<ShotItem[]>(() => {
    if (!activeEpisode) return [];
    return (project.shots ?? []).filter((s) => s.episode === activeEpisode.number);
  }, [project.shots, activeEpisode]);

  return (
    <div className="flex gap-4">
      {/* 左侧：集数导航 */}
      <aside className="w-[160px] shrink-0">
        <div className="mb-3 px-2 text-[12px] font-bold uppercase tracking-wider text-white/60">
          集数
        </div>
        <ul className="space-y-1">
          {episodes.map((ep, idx) => {
            const active = idx === activeEpisodeIdx;
            return (
              <li key={ep.id}>
                <button
                  type="button"
                  onClick={() => setActiveEpisodeIdx(idx)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] transition-colors ${
                    active
                      ? "bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] text-black shadow-lg shadow-brand/20"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span
                    className={`inline-block size-1.5 rounded-full ${statusDotClass(ep.status)}`}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[12px] font-semibold">{ep.title}</span>
                    <span className="text-[10px] opacity-70">{ep.status}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* 右侧：主工作区 */}
      <section className="flex-1 space-y-6 p-2">
        {/* 1. 顶部操作栏 */}
        <header className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[16px] font-bold text-white">成片预览</h3>
            <span className="text-[12px] text-white/50">
              第{activeEpisode?.number ?? 1}集 · 分镜 {Math.min(activeEpisodeIdx + 1, 4)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/[0.08]"
            >
              <UploadIcon className="size-3.5" />
              导出
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/[0.08]"
            >
              <DownloadIcon className="size-3.5" />
              下载视频
            </button>
          </div>
        </header>

        {/* 2. 播放器卡片 */}
        <div className="overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] backdrop-blur-sm">
          <div className="relative aspect-video w-full">
            <img
              src={txi(project.coverPrompt, "landscape_16_9")}
              alt={activeEpisode?.title ?? "成片预览"}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? "暂停" : "播放"}
                className="flex size-16 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg shadow-brand/30 backdrop-blur-sm transition-colors hover:bg-brand hover:text-brand-foreground"
              >
                {isPlaying ? (
                  <PauseIcon className="size-7" />
                ) : (
                  <PlayIcon className="ml-1 size-7" />
                )}
              </button>
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur-sm">
              分镜 {Math.min(activeEpisodeIdx + 1, 4)}
            </div>
          </div>

          {/* 底部控件 */}
          <div className="flex items-center justify-between bg-black/60 px-4 py-2.5">
            <span className="font-mono text-[12px] text-white/60">00:00 / 00:00</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="上一段"
                onClick={() =>
                  setActiveSegmentIdx((s) => Math.max(0, s - 1))
                }
                className="flex size-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
              <button
                type="button"
                aria-label={isPlaying ? "暂停" : "播放"}
                onClick={() => setIsPlaying((p) => !p)}
                className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition-colors hover:bg-brand-hover"
              >
                {isPlaying ? (
                  <PauseIcon className="size-4" />
                ) : (
                  <PlayIcon className="ml-0.5 size-4" />
                )}
              </button>
              <button
                type="button"
                aria-label="下一段"
                onClick={() =>
                  setActiveSegmentIdx((s) =>
                    Math.min(TIMELINE_SEGMENTS.length - 1, s + 1)
                  )
                }
                className="flex size-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <ChevronRightIcon className="size-4" />
              </button>
            </div>
            <span className="text-[11px] text-white/40">1x</span>
          </div>
        </div>

        {/* 3. 模块 Tab */}
        <div className="flex w-fit items-center gap-1 rounded-full bg-white/15 p-1 ring-1 ring-white/10 backdrop-blur-md">
          {MODULE_TABS.map(({ key, label, Icon }) => {
            const active = finalModule === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFinalModule(key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-white text-black shadow"
                    : "text-white/65 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* 4. 时间轴 */}
        <div className="rounded-2xl bg-[#1b1b1b]/90 p-4 ring-1 ring-white/10 backdrop-blur-sm">
          {/* 时间标尺 */}
          <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className="font-mono text-[10px] text-white/30"
              >
                00:0{i}
              </span>
            ))}
          </div>
          {/* 分镜轨道 */}
          <div className="grid grid-cols-4 gap-1.5">
            {TIMELINE_SEGMENTS.map((seg, idx) => {
              const active = idx === activeSegmentIdx;
              return (
                <button
                  key={seg.label}
                  type="button"
                  onClick={() => {
                    setActiveSegmentIdx(idx);
                    setFinalModule("分镜视频");
                  }}
                  className={`group overflow-hidden rounded-lg transition-all ${
                    active
                      ? "ring-1 ring-brand/40"
                      : "ring-1 ring-white/[0.06] hover:ring-white/[0.15]"
                  }`}
                >
                  <div className={`h-8 ${seg.color}`} />
                  <div className="flex items-center justify-between bg-black/40 px-2 py-1">
                    <span className="text-[10px] font-medium text-white/80">
                      {seg.label}
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      {seg.duration}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. 模块面板 */}
        <ModulePanel
          module={finalModule}
          shots={episodeShots}
          characters={project.characters.map((c) => ({
            id: c.id,
            name: c.name,
            role: c.role,
            hasVoice: false,
          }))}
        />
      </section>
    </div>
  );
}

// ─── 模块面板 ─────────────────────────────────────────────────────────────

type ModulePanelProps = {
  module: FinalModule;
  shots: ShotItem[];
  characters: { id: string; name: string; role: string; hasVoice: boolean }[];
};

function ModulePanel({ module, shots, characters }: ModulePanelProps) {
  if (module === "分镜视频") {
    return (
      <div className="rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.08] backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="flex items-center gap-2 text-[14px] font-semibold text-white">
              <VideoCameraIcon className="size-4 text-brand" />
              分镜视频
            </h4>
            <p className="mt-1 text-[12px] text-white/50">
              查看当前集的分镜片段，支持逐段生成、编辑和替换。
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
          >
            <VideoCameraIcon className="size-3.5" />
            生成当前分镜视频
          </button>
        </div>
        <ul className="space-y-2">
          {shots.length === 0 ? (
            <li className="rounded-lg border border-dashed border-white/[0.08] px-3 py-4 text-center text-[12px] text-white/30">
              暂无分镜片段
            </li>
          ) : (
            shots.map((shot) => (
              <li
                key={shot.id}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 ring-1 ring-white/[0.06]"
              >
                <span className="font-mono text-[11px] text-white/40">
                  #{shot.index}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-white/80">
                    {shot.description}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {shot.scene} · {shot.duration}
                  </p>
                </div>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
                    shot.status === "已生成"
                      ? "bg-brand/15 text-brand ring-brand/30"
                      : shot.status === "失败"
                      ? "bg-red-500/15 text-red-400 ring-red-500/30"
                      : "bg-white/[0.06] text-white/40 ring-white/10"
                  }`}
                >
                  {shot.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  if (module === "配音") {
    return (
      <div className="rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.08] backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="flex items-center gap-2 text-[14px] font-semibold text-white">
              <MicrophoneIcon className="size-4 text-brand" />
              配音
            </h4>
            <p className="mt-1 text-[12px] text-white/50">
              为角色对白绑定音色，生成旁白和对白音轨。
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
          >
            <MicrophoneIcon className="size-3.5" />
            进入配音
          </button>
        </div>
        <ul className="space-y-2">
          {characters.length === 0 ? (
            <li className="rounded-lg border border-dashed border-white/[0.08] px-3 py-4 text-center text-[12px] text-white/30">
              暂无角色对白
            </li>
          ) : (
            characters.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 ring-1 ring-white/[0.06]"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">
                  {c.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-white/80">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-white/40">{c.role}</p>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
                    c.hasVoice
                      ? "bg-brand/15 text-brand ring-brand/30"
                      : "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                  }`}
                >
                  {c.hasVoice ? (
                    <>
                      <CheckIcon className="size-2.5" />
                      已绑定
                    </>
                  ) : (
                    "未绑定"
                  )}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  // 配字幕
  return (
    <div className="rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.08] backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-[14px] font-semibold text-white">
            <ScriptIcon className="size-4 text-brand" />
            配字幕
          </h4>
          <p className="mt-1 text-[12px] text-white/50">
            编辑字幕文本、时间轴和字幕样式。
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
        >
          <ScriptIcon className="size-3.5" />
          进入配字幕
        </button>
      </div>
      <textarea
        rows={6}
        defaultValue={`[00:00] 第${1}集 字幕样例\n[00:08] （旁白）冬日院落，水缸结冰\n[00:23] 林安：又是这一缸冷水`}
        className="w-full resize-none rounded-lg border border-white/[0.08] bg-black p-3 text-[12px] leading-relaxed text-white/80 outline-none transition-colors focus:border-brand/40"
      />
    </div>
  );
}
