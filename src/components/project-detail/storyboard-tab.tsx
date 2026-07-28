"use client";

import { useMemo, useState } from "react";
import type { ShortDramaProject, Episode, ShotItem } from "@/lib/mock-projects";
import {
  PlusIcon,
  SparkleIcon,
  PlayIcon,
  VideoCameraIcon,
  ImageIcon,
  CheckIcon,
} from "@/components/icons";

// ─── 图片生成（与 comic/[id]/page.tsx 同源） ─────────────────────────────────

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

// ─── 子视图 ─────────────────────────────────────────────────────────────────

type SubView = "分镜表" | "分镜生成";

// ─── StoryboardTab ─────────────────────────────────────────────────────────

export default function StoryboardTab({ project }: { project: ShortDramaProject }) {
  const episodes = useMemo<Episode[]>(
    () =>
      project.episodeList && project.episodeList.length > 0
        ? project.episodeList
        : Array.from({ length: Math.max(1, project.episodes) }, (_, i) => ({
            id: `ep-${i + 1}`,
            number: i + 1,
            title: `第${i + 1}集`,
            status: i === 0 ? "进行中" : "未开始",
            progress: i === 0 ? 30 : 0,
          })),
    [project.episodeList, project.episodes]
  );

  const shots = useMemo<ShotItem[]>(() => project.shots ?? [], [project.shots]);

  const [activeEpisode, setActiveEpisode] = useState<number>(episodes[0]?.number ?? 1);
  const [subView, setSubView] = useState<SubView>("分镜表");
  const [shotList, setShotList] = useState<ShotItem[]>(
    shots.length > 0
      ? shots
      : [
          {
            id: `s-ep1-1`,
            episode: 1,
            index: 1,
            description: "开场空镜，建立氛围",
            duration: "0:08",
            characters: [],
            scene: "主场景",
            prompt: "",
            status: "未开始",
          },
        ]
  );
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [prompts, setPrompts] = useState<Record<string, string>>({});

  const episodeShots = useMemo(
    () => shotList.filter((s) => s.episode === activeEpisode),
    [shotList, activeEpisode]
  );

  const episodeProgress = (ep: Episode) => {
    const epShots = shotList.filter((s) => s.episode === ep.number);
    if (epShots.length === 0) return 0;
    const done = epShots.filter((s) => s.status === "已生成").length;
    return Math.round((done / epShots.length) * 100);
  };

  const addShot = () => {
    const newIndex =
      (shotList.filter((s) => s.episode === activeEpisode).slice(-1)[0]?.index ?? 0) + 1;
    setShotList((cur) => [
      ...cur,
      {
        id: `s-ep${activeEpisode}-${newIndex}-${Date.now()}`,
        episode: activeEpisode,
        index: newIndex,
        description: "新分镜",
        duration: "0:10",
        characters: [],
        scene: "未设定",
        prompt: "",
        status: "未开始",
      },
    ]);
  };

  const updateDescription = (id: string, value: string) =>
    setDescriptions((c) => ({ ...c, [id]: value }));
  const updatePrompt = (id: string, value: string) =>
    setPrompts((c) => ({ ...c, [id]: value }));

  return (
    <div className="flex gap-4 animate-fade-in">
      {/* 左侧：集数列表 */}
      <aside className="w-[180px] shrink-0 rounded-2xl bg-[#1b1b1b]/90 p-3 ring-1 ring-white/10 backdrop-blur-sm">
        <h3 className="px-2 pb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">
          集数
        </h3>
        <div className="space-y-1">
          {episodes.map((ep) => {
            const active = ep.number === activeEpisode;
            const progress = episodeProgress(ep);
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => setActiveEpisode(ep.number)}
                className={`w-full rounded-lg px-2.5 py-2 text-left transition-all ${
                  active
                    ? "bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] text-black shadow-lg shadow-brand/20"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">
                    第 {ep.number} 集
                  </span>
                  <span
                    className={`text-[10px] ${
                      active
                        ? "text-black/70"
                        : ep.status === "已完成"
                          ? "text-brand"
                          : ep.status === "进行中"
                            ? "text-amber-400"
                            : "text-white/40"
                    }`}
                  >
                    {ep.status}
                  </span>
                </div>
                <p className={`mt-0.5 line-clamp-1 text-[11px] ${active ? "text-black/60" : "text-white/40"}`}>
                  {ep.title}
                </p>
                <div className={`mt-1.5 h-1 overflow-hidden rounded-full ${active ? "bg-black/20" : "bg-white/[0.06]"}`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      active ? "bg-black/50" : "bg-white/30"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 右侧：分镜工作区 */}
      <section className="flex-1 rounded-2xl bg-[#1b1b1b]/90 p-6 ring-1 ring-white/10 backdrop-blur-sm">
        {/* 顶部：子 tab + 批量生成 */}
        <header className="mb-5 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-1 rounded-full bg-white/15 p-1 ring-1 ring-white/10 backdrop-blur-md">
            {(["分镜表", "分镜生成"] as const).map((view) => {
              const active = subView === view;
              return (
                <button
                  key={view}
                  type="button"
                  onClick={() => setSubView(view)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-all ${
                    active
                      ? "bg-white text-black shadow"
                      : "text-white/65 hover:text-white"
                  }`}
                >
                  {view}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <select
              defaultValue="Doubao-Seedance-2-0"
              className="h-8 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 text-[12px] text-white/70 outline-none backdrop-blur-sm transition-colors hover:border-white/[0.16]"
            >
              <option>Doubao-Seedance-2-0</option>
              <option>Vidu-Q1</option>
              <option>Kling-2.1</option>
            </select>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded-full bg-brand px-3 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
            >
              <VideoCameraIcon className="size-3.5" />
              批量生成
            </button>
          </div>
        </header>

        {/* 分镜表视图 */}
        {subView === "分镜表" && (
          <StoryboardTableView
            shots={episodeShots}
            descriptions={descriptions}
            onDescriptionChange={updateDescription}
            onAddShot={addShot}
          />
        )}

        {/* 分镜生成视图 */}
        {subView === "分镜生成" && (
          <StoryboardGenerateView
            shots={episodeShots}
            prompts={prompts}
            onPromptChange={updatePrompt}
            onAddShot={addShot}
          />
        )}
      </section>
    </div>
  );
}

// ─── 分镜表视图 ─────────────────────────────────────────────────────────────

function StoryboardTableView({
  shots,
  descriptions,
  onDescriptionChange,
  onAddShot,
}: {
  shots: ShotItem[];
  descriptions: Record<string, string>;
  onDescriptionChange: (id: string, value: string) => void;
  onAddShot: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-white/50">
              <th className="w-14 p-3 font-semibold">序号</th>
              <th className="p-3 font-semibold">描述</th>
              <th className="w-20 p-3 font-semibold">时长</th>
              <th className="w-40 p-3 font-semibold">出镜角色</th>
              <th className="w-32 p-3 font-semibold">场景</th>
              <th className="w-20 p-3 font-semibold">状态</th>
              <th className="w-24 p-3 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {shots.map((shot) => {
              const isDone = shot.status === "已生成";
              const isFailed = shot.status === "失败";
              const isRunning = !isDone && !isFailed && shot.status !== "未开始";
              return (
                <tr key={shot.id} className="transition-colors hover:bg-white/[0.04]">
                  <td className="p-3 font-mono font-semibold text-white/80">
                    {String(shot.index).padStart(2, "0")}
                  </td>
                  <td className="p-3">
                    <textarea
                      value={descriptions[shot.id] ?? shot.description}
                      onChange={(e) => onDescriptionChange(shot.id, e.target.value)}
                      rows={1}
                      className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-1.5 py-1 text-[12px] text-white/90 outline-none transition-colors placeholder:text-white/30 hover:border-white/[0.08] focus:border-brand/40 focus:bg-white/[0.02] focus:ring-1 focus:ring-brand/30"
                      placeholder="请输入分镜描述"
                    />
                  </td>
                  <td className="p-3 font-mono text-white/70">{shot.duration}</td>
                  <td className="p-3">
                    {shot.characters.length === 0 ? (
                      <span className="text-white/30">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {shot.characters.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] text-brand"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-white/70">{shot.scene}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
                        isDone
                          ? "bg-brand/15 text-brand ring-brand/20"
                          : isRunning
                            ? "bg-amber-500/15 text-amber-300 ring-amber-500/20"
                            : "bg-white/[0.06] text-white/50 ring-white/10"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isDone
                            ? "bg-brand"
                            : isRunning
                              ? "bg-amber-400 animate-pulse"
                              : "bg-white/40"
                        }`}
                      />
                      {shot.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="text-[11px] text-white/40 transition-colors hover:text-brand"
                    >
                      生成
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onAddShot}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-white/[0.12] bg-white/[0.02] py-3 text-[12px] text-white/50 transition-all hover:border-brand/40 hover:bg-brand/[0.04] hover:text-brand"
      >
        <PlusIcon className="size-3.5" />
        新增分镜
      </button>
    </div>
  );
}

// ─── 分镜生成视图 ───────────────────────────────────────────────────────────

function StoryboardGenerateView({
  shots,
  prompts,
  onPromptChange,
  onAddShot,
}: {
  shots: ShotItem[];
  prompts: Record<string, string>;
  onPromptChange: (id: string, value: string) => void;
  onAddShot: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {shots.map((shot) => (
          <ShotGenerateCard
            key={shot.id}
            shot={shot}
            prompt={prompts[shot.id] ?? shot.prompt}
            onPromptChange={onPromptChange}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAddShot}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2 text-[12px] text-white/50 transition-all hover:border-brand/40 hover:bg-brand/[0.04] hover:text-brand"
        >
          <PlusIcon className="size-3.5" />
          新增分镜
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
        >
          <SparkleIcon className="size-3.5" />
          批量生成视频
        </button>
      </div>
    </div>
  );
}

function ShotGenerateCard({
  shot,
  prompt,
  onPromptChange,
}: {
  shot: ShotItem;
  prompt: string;
  onPromptChange: (id: string, value: string) => void;
}) {
  const isDone = shot.status === "已生成";
  const previewPrompt = prompt || shot.description || `cinematic shot ${shot.index}, ${shot.scene}`;

  return (
    <article className="overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-colors hover:ring-white/20">
      {/* 预览区 */}
      <div className="relative aspect-video overflow-hidden">
        {isDone ? (
          <img
            src={txi(previewPrompt, "landscape_16_9")}
            alt={`分镜 ${shot.index} 预览`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-white/[0.02] text-white/40">
            <ImageIcon className="size-7" />
            <span className="text-[11px]">未生成预览</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* 序号 */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          <VideoCameraIcon className="size-3" />
          分镜 {String(shot.index).padStart(2, "0")}
        </div>

        {/* 状态 */}
        {isDone && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-medium text-brand ring-1 ring-brand/30 backdrop-blur-sm">
            <CheckIcon className="size-3" />
            已生成
          </div>
        )}
      </div>

      {/* 编辑区 */}
      <div className="space-y-3 p-4">
        {/* 描述 */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40">
            分镜描述
          </label>
          <textarea
            defaultValue={shot.description}
            rows={2}
            className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/80 outline-none transition-colors placeholder:text-white/30 focus:border-brand/40 focus:ring-1 focus:ring-brand/30"
            placeholder="描述分镜画面"
          />
        </div>

        {/* 提示词 */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40">
            生成提示词
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(shot.id, e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/80 outline-none transition-colors placeholder:text-white/30 focus:border-brand/40 focus:ring-1 focus:ring-brand/30"
            placeholder="使用 @ 引用角色、场景、道具"
          />
        </div>

        {/* 出镜角色 tags + 场景 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {shot.characters.length === 0 ? (
            <span className="text-[11px] text-white/30">未指定角色</span>
          ) : (
            shot.characters.map((c) => (
              <span
                key={c}
                className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand"
              >
                @{c}
              </span>
            ))
          )}
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
            #{shot.scene}
          </span>
        </div>

        {/* 生成按钮 */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[11px] text-white/40">{shot.duration}</span>
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              isDone
                ? "border border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                : "bg-brand text-black shadow-lg shadow-brand/20 hover:bg-brand-hover"
            }`}
          >
            {isDone ? (
              <>
                <PlayIcon className="size-3" />
                重新生成
              </>
            ) : (
              <>
                <SparkleIcon className="size-3.5" />
                生成视频
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
