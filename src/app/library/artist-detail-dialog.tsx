"use client";

import { useEffect, useState } from "react";
import { PlayIcon, PlusIcon, XIcon } from "@/components/icons";
import { EMOTION_PERFORMANCES, ERA_OUTFITS, txi, type Artist } from "./data";

type ActiveMode = "outfit" | "audition";

export function ArtistDetailDialog({
  artist,
  onClose,
}: {
  artist: Artist;
  onClose: () => void;
}) {
  const [activeMode, setActiveMode] = useState<ActiveMode>("audition");
  const [selectedEra, setSelectedEra] = useState(ERA_OUTFITS[0].id);
  const [selectedEmotion, setSelectedEmotion] = useState(
    EMOTION_PERFORMANCES[0].id,
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentEra =
    ERA_OUTFITS.find((e) => e.id === selectedEra) ?? ERA_OUTFITS[0];
  const currentEmotion =
    EMOTION_PERFORMANCES.find((e) => e.id === selectedEmotion) ??
    EMOTION_PERFORMANCES[0];

  const previewPrompt =
    activeMode === "outfit"
      ? `${artist.imagePrompt}, ${currentEra.prompt}`
      : `${artist.imagePrompt}, ${currentEmotion.prompt}`;

  // 排查日志：AI试装 主图生成
  useEffect(() => {
    if (activeMode !== "outfit") return;
    console.log(`[AI试装] 生成预览图`, {
      id: artist.id,
      name: artist.name,
      era: currentEra.label,
      outfit: currentEra.outfitLabel,
      prompt: previewPrompt,
    });
  }, [activeMode, previewPrompt, currentEra, artist.id, artist.name]);

  // 排查日志：AI试装 时代切换
  const changeEra = (eraId: string) => {
    const era = ERA_OUTFITS.find((e) => e.id === eraId);
    console.log(`[AI试装] 切换时代`, {
      eraId,
      eraLabel: era?.label,
      outfitLabel: era?.outfitLabel,
    });
    setSelectedEra(eraId);
    setIsPlaying(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="艺人详情"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[92vh] w-full max-w-[1300px] overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08]"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute left-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <XIcon className="size-4" />
        </button>

        {/* 左侧展示区域 */}
        <div className="relative flex-1 bg-black">
          {activeMode === "audition" && isPlaying ? (
            <video
              src={currentEmotion?.video}
              controls
              autoPlay
              className="h-full w-full"
            />
          ) : (
            <>
              <img
                src={txi(previewPrompt, "portrait_4_3")}
                alt={artist.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {activeMode === "audition" && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-2 ring-white/30 transition-transform hover:scale-105"
                >
                  <PlayIcon className="size-8" />
                </button>
              )}
              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-1.5 text-[14px] text-white backdrop-blur-sm">
                {activeMode === "outfit"
                  ? `${currentEra.label} · ${currentEra.outfitLabel}`
                  : currentEmotion.label}
              </div>
            </>
          )}

          {/* 底部缩略图：仅 AI试戏 显示喜怒哀乐 */}
          {activeMode === "audition" && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
              {EMOTION_PERFORMANCES.map((item) => {
                const active = selectedEmotion === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedEmotion(item.id);
                      setIsPlaying(false);
                    }}
                    className={
                      active
                        ? "relative h-16 w-12 overflow-hidden rounded-lg ring-2 ring-brand"
                        : "relative h-16 w-12 overflow-hidden rounded-lg ring-1 ring-white/20 opacity-70 transition-opacity hover:opacity-100"
                    }
                  >
                    <img
                      src={txi(
                        `${artist.imagePrompt}, ${item.prompt}`,
                        "portrait_4_3",
                      )}
                      alt={item.label}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* 主图右侧子图角标：仅 AI试装 显示，快速切换时代妆造 */}
          {activeMode === "outfit" && (
            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
              {ERA_OUTFITS.map((era) => {
                const active = selectedEra === era.id;
                return (
                  <button
                    key={era.id}
                    onClick={() => changeEra(era.id)}
                    className={
                      active
                        ? "relative w-[104px] overflow-hidden rounded-xl ring-2 ring-white"
                        : "relative w-[104px] overflow-hidden rounded-xl ring-1 ring-white/20 opacity-70 transition-opacity hover:opacity-100"
                    }
                  >
                    <img
                      src={txi(
                        `${artist.imagePrompt}, ${era.prompt}`,
                        "portrait_4_3",
                      )}
                      alt={era.label}
                      loading="lazy"
                      className="h-[120px] w-full object-cover"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4 text-left text-[12px] text-white">
                      {era.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧信息 */}
        <div className="flex w-[380px] flex-col border-l border-white/[0.08] p-6">
          <div className="flex-1 overflow-y-auto pr-1">
            <h2 className="text-[24px] font-bold text-white">{artist.name}</h2>
            <p className="mt-1 text-[13px] text-white/60">
              适配人设：{artist.fitRoles}
            </p>

            {/* AI试装 / AI试戏 Tab */}
            <div className="mt-6 flex rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.08]">
              <button
                onClick={() => {
                  setActiveMode("outfit");
                  setIsPlaying(false);
                }}
                className={
                  activeMode === "outfit"
                    ? "flex-1 rounded-md bg-white/[0.1] py-2 text-[14px] font-medium text-white"
                    : "flex-1 rounded-md py-2 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
                }
              >
                AI试装
              </button>
              <button
                onClick={() => {
                  setActiveMode("audition");
                  setIsPlaying(false);
                }}
                className={
                  activeMode === "audition"
                    ? "flex-1 rounded-md bg-white/[0.1] py-2 text-[14px] font-medium text-white"
                    : "flex-1 rounded-md py-2 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
                }
              >
                AI试戏
              </button>
            </div>

            {activeMode === "outfit" ? (
              <>
                {/* 当前妆造 */}
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-white/[0.04] p-2 ring-1 ring-white/[0.06]">
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md">
                    <img
                      src={txi(
                        `${artist.imagePrompt}, ${currentEra.prompt}`,
                        "portrait_4_3",
                      )}
                      alt={currentEra.outfitLabel}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] text-white/50">代表妆造</p>
                    <p className="mt-0.5 text-[15px] font-medium text-white">
                      {currentEra.outfitLabel}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 喜怒哀乐列表 */}
                <p className="mt-4 text-[12px] text-white/50">
                  表情包 · 视频预览
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {EMOTION_PERFORMANCES.map((item) => {
                    const active = selectedEmotion === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedEmotion(item.id);
                          setIsPlaying(false);
                        }}
                        className={
                          active
                            ? "flex items-center gap-3 rounded-lg bg-white/[0.06] p-2 ring-1 ring-brand/30 text-left"
                            : "flex items-center gap-3 rounded-lg p-2 text-left text-white/70 transition-colors hover:bg-white/[0.04]"
                        }
                      >
                        <div className="relative h-12 w-9 overflow-hidden rounded-md">
                          <img
                            src={txi(
                              `${artist.imagePrompt}, ${item.prompt}`,
                              "portrait_4_3",
                            )}
                            alt={item.label}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span
                          className={
                            active
                              ? "text-[14px] font-medium text-brand"
                              : "text-[14px] font-medium text-white"
                          }
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
                <p className="text-[12px] text-white/50">积分</p>
                <p className="mt-1 text-[16px] font-semibold text-white">
                  {artist.price}/剧
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
                <p className="text-[12px] text-white/50">演员级别</p>
                <p className="mt-1 text-[16px] font-semibold text-white">
                  {artist.level}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[12px] text-white/50">标签</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {artist.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] text-white/80 ring-1 ring-white/[0.08]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => console.log("AI试戏", artist.name)}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00e5c8] to-[#7dff8c] text-[15px] font-semibold text-black transition-opacity hover:opacity-90"
          >
            <PlusIcon className="size-4" />
            AI试戏 {artist.price}/剧
          </button>
        </div>
      </div>
    </div>
  );
}
