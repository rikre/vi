"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SearchIcon } from "@/components/icons";
import { TABS, type ArtistCategory, type TabId } from "./data";
import { ArtistSection } from "./artist-section";
import { VoiceSection } from "./voice-section";
import { LegacySection } from "./legacy-section";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("artist");
  const [searchQuery, setSearchQuery] = useState("");
  const [artistCategory, setArtistCategory] = useState<ArtistCategory>("全部");

  return (
    <AppShell>
      <div className="h-full overflow-y-auto no-scrollbar">
        {/* 顶部行：Tabs + 搜索 + 导出 */}
        <div className="flex h-[70px] items-center justify-between gap-4 px-6 pt-6">
          <nav
            aria-label="资产分类"
            className="flex items-end gap-0"
            role="tablist"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    active
                      ? "flex h-[46px] items-center border-b-2 border-brand px-4 text-[14px] font-medium text-white"
                      : "flex h-[46px] items-center border-b-2 border-transparent px-4 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
                  }
                >
                  {tab.label}
                  <span className="ml-1 text-white/40">{tab.count}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <SearchIcon className="size-4" />
              </div>
              <input
                type="search"
                aria-label="搜索资产"
                placeholder="搜索标题、提示词或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-[288px] rounded-lg border border-white/[0.2] bg-white/[0.1] py-2 pl-9 pr-9 text-[14px] text-white outline-none transition-colors placeholder:text-white/60 focus:border-brand"
              />
            </div>
            <button
              type="button"
              onClick={() => console.log("export")}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[14px] font-medium text-black transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="导出"
            >
              导出
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="px-6 pb-10 pt-4">
          {activeTab === "artist" && (
            <ArtistSection
              searchQuery={searchQuery}
              artistCategory={artistCategory}
              setArtistCategory={setArtistCategory}
            />
          )}
          {activeTab === "voice" && <VoiceSection searchQuery={searchQuery} />}
          {activeTab === "character" && (
            <LegacySection type="character" searchQuery={searchQuery} />
          )}
          {activeTab === "scene" && (
            <LegacySection type="scene" searchQuery={searchQuery} />
          )}
          {activeTab === "prop" && (
            <LegacySection type="prop" searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
