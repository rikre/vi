"use client";

import { useState } from "react";
import { CoinsIcon, HeartIcon, PlayIcon, PlusIcon } from "@/components/icons";
import { ARTIST_CATEGORIES, ARTISTS, txi, type Artist, type ArtistCategory } from "./data";
import { ArtistDetailDialog } from "./artist-detail-dialog";
import { EmptyState } from "./empty-state";

export function ArtistSection({
  searchQuery,
  artistCategory,
  setArtistCategory,
}: {
  searchQuery: string;
  artistCategory: ArtistCategory;
  setArtistCategory: (c: ArtistCategory) => void;
}) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const filteredArtists = ARTISTS.filter((a) => {
    const matchesSearch = a.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      artistCategory === "全部" || a.category.includes(artistCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* 分类标签 */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {ARTIST_CATEGORIES.map((cat) => {
          const active = artistCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setArtistCategory(cat)}
              className={
                active
                  ? "rounded-full bg-brand px-4 py-1.5 text-[13px] font-medium text-black"
                  : "rounded-full bg-white/[0.06] px-4 py-1.5 text-[13px] font-medium text-white/70 ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.1] hover:text-white"
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 创建按钮 */}
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => console.log("create artist")}
          className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[14px] font-medium text-black transition-opacity hover:opacity-80"
        >
          <PlusIcon className="size-4" />
          创建艺人
        </button>
      </div>

      {/* 艺人网格 */}
      {filteredArtists.length === 0 ? (
        <EmptyState type="artist" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onOpenDetail={() => setSelectedArtist(artist)}
            />
          ))}
        </div>
      )}

      {/* 详情弹框 */}
      {selectedArtist && (
        <ArtistDetailDialog
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </>
  );
}

function ArtistCard({
  artist,
  onOpenDetail,
}: {
  artist: Artist;
  onOpenDetail: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  // 排查日志：卡片 hover 视频播放
  const handleMouseEnter = () => {
    console.log(`[ArtistCard] hover 进入，开始播放视频`, {
      id: artist.id,
      name: artist.name,
      video: artist.video,
    });
    setHovered(true);
  };

  const handleMouseLeave = () => {
    console.log(`[ArtistCard] hover 离开，停止播放视频`, {
      id: artist.id,
      name: artist.name,
    });
    setHovered(false);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:ring-white/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={onOpenDetail}
        className="relative block w-full"
        style={{ aspectRatio: "3 / 4" }}
      >
        {hovered ? (
          <video
            src={artist.video}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={txi(artist.imagePrompt, "portrait_4_3")}
            alt={artist.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* hover 操作 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm ring-1 ring-white/20">
            <PlayIcon className="size-3.5" />
            试戏
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm ring-1 ring-white/20">
            <HeartIcon className="size-3.5" />
            收藏
          </span>
        </div>

        {/* 底部信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="truncate text-[15px] font-semibold text-white">
            {artist.name}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-white/60">
            {artist.fitRoles}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[13px] font-medium text-brand">
              <CoinsIcon className="size-3.5" />
              {artist.price}/剧
            </span>
            <span className="rounded bg-white/[0.1] px-1.5 py-0.5 text-[11px] text-white/70">
              {artist.level}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
