"use client";

import { useEffect, useState } from "react";
import { PlayIcon, PlusIcon, XIcon } from "@/components/icons";
import {
  LOOKS,
  MAKEUP_STYLES,
  txi,
  type Artist,
} from "./data";

export function ArtistDetailDialog({
  artist,
  onClose,
}: {
  artist: Artist;
  onClose: () => void;
}) {
  const [activeMode, setActiveMode] = useState<"makeup" | "outfit">("outfit");
  const [selectedLook, setSelectedLook] = useState(LOOKS[0].id);
  const [selectedMakeup, setSelectedMakeup] = useState(MAKEUP_STYLES[0].id);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentLook = LOOKS.find((l) => l.id === selectedLook);
  const currentMakeup = MAKEUP_STYLES.find((s) => s.id === selectedMakeup);

  const previewPrompt =
    activeMode === "outfit"
      ? `${artist.imagePrompt}, ${currentLook?.prompt}`
      : `${artist.imagePrompt}, ${currentMakeup?.prompt}`;

  const thumbs = activeMode === "outfit" ? LOOKS : MAKEUP_STYLES;

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
          {activeMode === "outfit" && isPlaying ? (
            <video
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
              {activeMode === "outfit" && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-2 ring-white/30 transition-transform hover:scale-105"
                >
                  <PlayIcon className="size-8" />
                </button>
              )}
              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-1.5 text-[14px] text-white backdrop-blur-sm">
                {activeMode === "outfit"
                  ? currentLook?.label
                  : currentMakeup?.label}
              </div>
            </>
          )}

          {/* 底部缩略图 */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
            {thumbs.map((item) => {
              const active =
                activeMode === "outfit"
                  ? selectedLook === item.id
                  : selectedMakeup === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (activeMode === "outfit") {
                      setSelectedLook(item.id);
                      setIsPlaying(false);
                    } else {
                      setSelectedMakeup(item.id);
                    }
                  }}
                  className={
                    active
                      ? "relative h-16 w-12 overflow-hidden rounded-lg ring-2 ring-brand"
                      : "relative h-16 w-12 overflow-hidden rounded-lg ring-1 ring-white/20 opacity-70 transition-opacity hover:opacity-100"
                  }
                >
                  <img
                    src={txi(
                      `${artist.imagePrompt}, ${(item as { prompt: string }).prompt}`,
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
        </div>

        {/* 右侧信息 */}
        <div className="flex w-[380px] flex-col border-l border-white/[0.08] p-6">
          <div className="flex-1">
            <h2 className="text-[24px] font-bold text-white">{artist.name}</h2>
            <p className="mt-1 text-[13px] text-white/60">
              适配人设：{artist.fitRoles}
            </p>

            {/* 试妆 / 试服装 Tab */}
            <div className="mt-6 flex rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.08]">
              <button
                onClick={() => setActiveMode("makeup")}
                className={
                  activeMode === "makeup"
                    ? "flex-1 rounded-md bg-white/[0.1] py-2 text-[14px] font-medium text-white"
                    : "flex-1 rounded-md py-2 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
                }
              >
                试妆
              </button>
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
                试服装
              </button>
            </div>

            {/* 缩略图列表 */}
            <div className="mt-4 flex flex-col gap-2">
              {thumbs.map((item) => {
                const active =
                  activeMode === "outfit"
                    ? selectedLook === item.id
                    : selectedMakeup === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (activeMode === "outfit") {
                        setSelectedLook(item.id);
                        setIsPlaying(false);
                      } else {
                        setSelectedMakeup(item.id);
                      }
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
                          `${artist.imagePrompt}, ${(item as { prompt: string }).prompt}`,
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
