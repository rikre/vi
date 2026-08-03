"use client";

import type { ShortDramaProject } from "@/lib/mock-projects";
import { VideoCameraIcon } from "@/components/icons";
import { useStoryboard } from "@/hooks/use-storyboard";
import { StoryboardTableView } from "./storyboard/storyboard-table-view";
import { StoryboardGenerateView } from "./storyboard/storyboard-generate-view";

export default function StoryboardTab({
  project,
}: {
  project: ShortDramaProject;
}) {
  const {
    episodes,
    episodeShots,
    activeEpisode,
    setActiveEpisode,
    subView,
    setSubView,
    descriptions,
    prompts,
    episodeProgress,
    addShot,
    updateDescription,
    updatePrompt,
    generateShot,
    batchGenerate,
  } = useStoryboard(project);

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
                            ? "text-warning"
                            : "text-white/40"
                    }`}
                  >
                    {ep.status}
                  </span>
                </div>
                <p
                  className={`mt-0.5 line-clamp-1 text-[11px] ${active ? "text-black/60" : "text-white/40"}`}
                >
                  {ep.title}
                </p>
                <div
                  className={`mt-1.5 h-1 overflow-hidden rounded-full ${active ? "bg-black/20" : "bg-white/[0.06]"}`}
                >
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
              onClick={batchGenerate}
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
            onGenerateShot={generateShot}
          />
        )}

        {/* 分镜生成视图 */}
        {subView === "分镜生成" && (
          <StoryboardGenerateView
            shots={episodeShots}
            prompts={prompts}
            onPromptChange={updatePrompt}
            onAddShot={addShot}
            onGenerateShot={generateShot}
            onBatchGenerate={batchGenerate}
          />
        )}
      </section>
    </div>
  );
}
