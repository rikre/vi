"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AssetGrid } from "@/components/asset/asset-grid";
import { TrashIcon, UploadIcon, SearchIcon, PlusIcon, HeartIcon, UserIcon, SceneIcon, PropIcon } from "@/components/icons";
import type { ComponentType } from "react";

const ASSET_TABS: { id: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: "character", label: "角色", Icon: UserIcon },
  { id: "scene", label: "场景", Icon: SceneIcon },
  { id: "prop", label: "道具", Icon: PropIcon },
  { id: "favorite", label: "我的收藏", Icon: HeartIcon },
];

const CHARACTERS = [
  { id: 1, name: "元气少女小樱", type: "character", tag: "热门" },
  { id: 2, name: "冷酷少年玄", type: "character" },
  { id: 3, name: "萌宠橘猫布丁", type: "character", tag: "新" },
  { id: 4, name: "魔法少女露娜", type: "character" },
  { id: 5, name: "武士银时", type: "character" },
  { id: 6, name: "未来机甲战士", type: "character" },
  { id: 7, name: "古风美人锦瑟", type: "character", tag: "热门" },
  { id: 8, name: "Q版小精灵", type: "character" },
  { id: 9, name: "森林精灵艾拉", type: "character" },
  { id: 10, name: "探测机器人小七", type: "character" },
  { id: 11, name: "恶魔少年路西", type: "character" },
  { id: 12, name: "天使少女米迦", type: "character" },
];

const SCENES = [
  { id: 101, name: "樱花校园教室", type: "scene", tag: "热门" },
  { id: 102, name: "赛博朋克都市", type: "scene", tag: "新" },
  { id: 103, name: "奇幻森林秘境", type: "scene" },
  { id: 104, name: "海边夕阳沙滩", type: "scene" },
  { id: 105, name: "古风宫殿内景", type: "scene" },
  { id: 106, name: "太空站指挥室", type: "scene" },
  { id: 107, name: "温馨咖啡馆", type: "scene" },
  { id: 108, name: "雨夜街道霓虹", type: "scene", tag: "热门" },
  { id: 109, name: "雪山温泉旅馆", type: "scene" },
  { id: 110, name: "魔法图书馆", type: "scene" },
];

const PROPS = [
  { id: 201, name: "魔法权杖", type: "prop", tag: "新" },
  { id: 202, name: "武士刀·村正", type: "prop" },
  { id: 203, name: "未来悬浮滑板", type: "prop" },
  { id: 204, name: "古风团扇", type: "prop" },
  { id: 205, name: "精灵弓箭", type: "prop" },
  { id: 206, name: "机械义肢", type: "prop" },
  { id: 207, name: "治愈药水", type: "prop" },
  { id: 208, name: "魔导书", type: "prop", tag: "热门" },
  { id: 209, name: "复古相机", type: "prop" },
  { id: 210, name: "星空魔法帽", type: "prop" },
];

const FAVORITES = [...CHARACTERS.slice(0, 3), ...SCENES.slice(0, 2), ...PROPS.slice(0, 2)];

export default function AssetPage() {
  const [activeTab, setActiveTab] = useState("character");
  const [searchQuery, setSearchQuery] = useState("");

  const getAssets = () => {
    switch (activeTab) {
      case "character":
        return CHARACTERS;
      case "scene":
        return SCENES;
      case "prop":
        return PROPS;
      case "favorite":
        return FAVORITES;
      default:
        return CHARACTERS;
    }
  };

  const getNewLabel = () => {
    switch (activeTab) {
      case "character":
        return "新角色";
      case "scene":
        return "新场景";
      case "prop":
        return "新道具";
      default:
        return "新建";
    }
  };

  const filteredAssets = getAssets().filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        <div className="mt-8 flex items-center justify-between pt-2 pb-6">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
              我的资产
            </h1>
            <p className="mt-2 text-[14px] text-white/50">
              管理你的角色、场景和道具资产
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl bg-white/[0.08] px-4 text-[14px] font-medium text-white transition-all hover:bg-white/[0.12]"
              aria-label="回收站"
            >
              <TrashIcon className="size-4" />
              回收站
            </button>
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20"
              aria-label="AI 生成"
            >
              <PlusIcon className="size-4" />
              AI 生成
            </button>
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl bg-white/[0.08] px-4 text-[14px] font-medium text-white transition-all hover:bg-white/[0.12]"
            >
              <UploadIcon className="size-4" />
              上传
            </button>
          </div>
        </div>

        <nav aria-label="资产分类" className="mb-5 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {ASSET_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white/[0.1] px-4 text-[14px] font-medium text-white"
                  : "flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-4 text-[14px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
              }
            >
              <tab.Icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="relative mb-6">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <SearchIcon className="size-[18px]" />
          </div>
          <input
            type="text"
            aria-label={`搜索${ASSET_TABS.find((t) => t.id === activeTab)?.label ?? "资产"}`}
            placeholder={`搜索${ASSET_TABS.find((t) => t.id === activeTab)?.label}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border-0 bg-white/[0.06] pl-12 pr-4 text-[15px] text-white placeholder:text-white/40 transition-all focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <AssetGrid assets={filteredAssets} newLabel={getNewLabel()} />
      </div>
    </AppShell>
  );
}
