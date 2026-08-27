"use client";

import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/auth-provider";
import {
  SearchIcon,
  ChevronDownIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  UserGroupIcon,
  SceneIcon,
  PropIcon,
  MicrophoneIcon,
  PlayIcon,
  CloseIcon,
  HeartIcon,
  UploadIcon,
  VolumeIcon,
  CoinsIcon,
} from "@/components/icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = "artist" | "voice" | "character" | "scene" | "prop";

type ArtistCategory =
  | "全部"
  | "真人演员"
  | "男性"
  | "女性"
  | "爆款领衔"
  | "实力主演"
  | "专业演员"
  | "新锐演员";

type Artist = {
  id: number;
  name: string;
  category: ArtistCategory[];
  gender: "男" | "女";
  level: string;
  price: number;
  tags: string[];
  fitRoles: string;
  imagePrompt: string;
};

type Voice = {
  id: number;
  name: string;
  desc: string;
  gender: "男" | "女";
  age: "青年" | "中年" | "老年";
  language: string;
  imagePrompt: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TAB_LABEL_MAP: Record<TabId, string> = {
  artist: "创建艺人",
  voice: "克隆音色",
  character: "创建角色",
  scene: "创建场景",
  prop: "创建道具",
};

const ARTIST_CATEGORIES: ArtistCategory[] = [
  "全部",
  "真人演员",
  "男性",
  "女性",
  "爆款领衔",
  "实力主演",
  "专业演员",
  "新锐演员",
];

const MAKEUP_STYLES = [
  { id: "ancient", label: "古装妆容", prompt: "ancient Chinese royal makeup" },
  { id: "modern", label: "现代妆容", prompt: "modern natural makeup" },
  { id: "republic", label: "民国妆容", prompt: "1920s Shanghai makeup" },
];

const DRAMA_THEMES = [
  { id: "urban", label: "都市情感" },
  { id: "ancient", label: "古装权谋" },
  { id: "suspense", label: "悬疑推理" },
  { id: "rebirth", label: "重生逆袭" },
];

const ARTISTS: Artist[] = [
  {
    id: 1,
    name: "张阳阳",
    category: ["真人演员", "女性", "实力主演"],
    gender: "女",
    level: "实力主演",
    price: 500,
    tags: ["女性", "青年", "现代", "自然", "时尚", "知性"],
    fitRoles: "战斗 · 古装",
    imagePrompt:
      "professional female actor portrait, black turtleneck, neutral background, elegant Chinese woman, soft studio lighting",
  },
  {
    id: 2,
    name: "朱辰赫",
    category: ["真人演员", "男性", "新锐演员"],
    gender: "男",
    level: "新锐演员",
    price: 500,
    tags: ["男性", "青年", "阳光", "温暖"],
    fitRoles: "都市 · 甜宠",
    imagePrompt:
      "young Korean actor portrait, yellow sweater, cozy bedroom background, warm smile",
  },
  {
    id: 3,
    name: "林知微",
    category: ["女性", "爆款领衔"],
    gender: "女",
    level: "爆款领衔",
    price: 800,
    tags: ["女性", "古风", "清冷", "仙气"],
    fitRoles: "仙侠 · 玄幻",
    imagePrompt:
      "ethereal fantasy female character, flowing white robes, misty mountain background",
  },
  {
    id: 4,
    name: "周牧野",
    category: ["真人演员", "男性", "实力主演"],
    gender: "男",
    level: "实力主演",
    price: 600,
    tags: ["男性", "中年", "沉稳", "霸气"],
    fitRoles: "商战 · 悬疑",
    imagePrompt:
      "mature Chinese businessman portrait, dark suit, confident expression, modern office",
  },
  {
    id: 5,
    name: "苏晚晴",
    category: ["女性", "新锐演员"],
    gender: "女",
    level: "新锐演员",
    price: 400,
    tags: ["女性", "青年", "甜美", "活泼"],
    fitRoles: "校园 · 青春",
    imagePrompt:
      "cheerful young female character, school uniform, bright classroom background",
  },
  {
    id: 6,
    name: "赵霆骁",
    category: ["真人演员", "男性", "专业演员"],
    gender: "男",
    level: "专业演员",
    price: 700,
    tags: ["男性", "青年", "硬汉", "正义"],
    fitRoles: "警匪 · 动作",
    imagePrompt:
      "tough young male actor portrait, leather jacket, urban night background",
  },
];

const VOICES: Voice[] = [
  {
    id: 1,
    name: "婆婆",
    desc: "语调舒缓、声线慈祥，自带岁月感的长辈音",
    gender: "女",
    age: "老年",
    language: "中文",
    imagePrompt: "elderly Chinese grandmother portrait, warm smile, soft lighting",
  },
  {
    id: 2,
    name: "幽默大爷",
    desc: "豁达沧桑的乐观爷爷，通透豁达又从容",
    gender: "男",
    age: "老年",
    language: "中文",
    imagePrompt: "elderly Chinese grandfather portrait, kind eyes, cheerful expression",
  },
  {
    id: 3,
    name: "和蔼奶奶",
    desc: "慈祥的老奶奶，耐心亲切，散发着岁月沉淀的温柔",
    gender: "女",
    age: "老年",
    language: "中文",
    imagePrompt: "gentle Chinese grandmother portrait, silver hair, warm lighting",
  },
  {
    id: 4,
    name: "武则天",
    desc: "声线威严、气场拉满，自带帝王霸气的御姐音",
    gender: "女",
    age: "中年",
    language: "中文",
    imagePrompt: "regal Chinese empress portrait, golden crown, imperial palace",
  },
  {
    id: 5,
    name: "邻居阿姨",
    desc: "温暖成熟的中年阿姨，兼具知性气质",
    gender: "女",
    age: "中年",
    language: "中文",
    imagePrompt: "middle-aged Chinese woman portrait, friendly smile, home background",
  },
  {
    id: 6,
    name: "女雷神",
    desc: "声线雄浑、气场拉满，充满力量感的御姐音",
    gender: "女",
    age: "青年",
    language: "中文",
    imagePrompt: "powerful female warrior portrait, lightning effects, dramatic lighting",
  },
  {
    id: 7,
    name: "温柔妈妈",
    desc: "语调舒缓、咬字温润，自带母性柔光的治愈音",
    gender: "女",
    age: "中年",
    language: "中文",
    imagePrompt: "gentle mother portrait, soft lighting, warm home background",
  },
  {
    id: 8,
    name: "胡子叔叔",
    desc: "历经风雨后变得沉稳的大叔，果敢让人信赖",
    gender: "男",
    age: "中年",
    language: "中文",
    imagePrompt: "mature bearded Chinese man portrait, confident expression",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function txi(prompt: string, size: "square" | "portrait_4_3" | "landscape_4_3" = "square") {
  return `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("artist");
  const [searchQuery, setSearchQuery] = useState("");
  const [artistCategory, setArtistCategory] = useState<ArtistCategory>("全部");

  return (
    <AppShell>
      <div className="h-full overflow-y-auto no-scrollbar">
        {/* 顶部行：Tabs + 搜索 + 导出（自适应换行，窄屏 tab 可横滚） */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 pt-6">
          <nav
            aria-label="资产分类"
            className="flex min-w-0 max-w-full items-end gap-0 overflow-x-auto no-scrollbar"
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
                      ? "flex h-[46px] shrink-0 items-center whitespace-nowrap border-b-2 border-brand px-4 text-[14px] font-medium text-white"
                      : "flex h-[46px] shrink-0 items-center whitespace-nowrap border-b-2 border-transparent px-4 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
                  }
                >
                  {tab.label}
                  <span className="ml-1 text-white/40">{tab.count}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:flex-none">
            <div className="relative min-w-0 flex-1 sm:w-[288px] sm:flex-none">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <SearchIcon className="size-4" />
              </div>
              <input
                type="search"
                aria-label="搜索资产"
                placeholder="搜索标题、提示词或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-white/[0.2] bg-white/[0.1] py-2 pl-9 pr-9 text-[14px] text-white outline-none transition-colors placeholder:text-white/60 focus:border-brand"
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

// ---------------------------------------------------------------------------
// Artist Section
// ---------------------------------------------------------------------------

const LOOKS = [
  { id: "look1", label: "白色礼服", prompt: "elegant white dress, formal gown" },
  { id: "look2", label: "黑色西装", prompt: "black business suit, professional" },
  { id: "look3", label: "古装红衣", prompt: "ancient Chinese red hanfu" },
  { id: "look4", label: "休闲牛仔", prompt: "casual denim jacket, street style" },
];

function ArtistSection({
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
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:ring-white/20">
      <button
        type="button"
        onClick={onOpenDetail}
        className="relative block w-full"
        style={{ aspectRatio: "3 / 4" }}
      >
        <img
          src={txi(artist.imagePrompt, "portrait_4_3")}
          alt={artist.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
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

function ArtistDetailDialog({
  artist,
  onClose,
}: {
  artist: Artist;
  onClose: () => void;
}) {
  const { isAnonymous, showLogin } = useAuth();
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
        className="relative flex max-h-[92vh] w-full max-w-[1300px] flex-col overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] md:h-[92vh] md:flex-row"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        {/* 左侧展示区域（移动端固定高度，桌面端弹性填满） */}
        <div className="relative h-[46vh] shrink-0 bg-black md:h-auto md:min-w-0 md:flex-1">
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
              <div className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-4 py-1.5 text-[14px] text-white backdrop-blur-sm">
                {activeMode === "outfit"
                  ? currentLook?.label
                  : currentMakeup?.label}
              </div>
            </>
          )}

          {/* 底部缩略图（窄屏可横滚，避免溢出与标签重叠） */}
          <div className="absolute bottom-6 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-3 overflow-x-auto no-scrollbar">
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
                      ? "relative h-16 w-12 shrink-0 overflow-hidden rounded-lg ring-2 ring-brand"
                      : "relative h-16 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/20 opacity-70 transition-opacity hover:opacity-100"
                  }
                >
                  <img
                    src={txi(
                      `${artist.imagePrompt}, ${(item as { prompt: string }).prompt}`,
                      "portrait_4_3"
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

        {/* 右侧信息（窄屏全宽堆叠，内容超高时内部滚动，不再被裁切） */}
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto border-t border-white/[0.08] p-6 md:w-[380px] md:flex-none md:border-l md:border-t-0">
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
                          "portrait_4_3"
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
            onClick={() => {
              if (isAnonymous) {
                showLogin();
                return;
              }
              console.log("AI试戏", artist.name);
            }}
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

// ---------------------------------------------------------------------------
// Voice Section
// ---------------------------------------------------------------------------

function VoiceSection({ searchQuery }: { searchQuery: string }) {
  const [genderFilter, setGenderFilter] = useState("全部性别");
  const [ageFilter, setAgeFilter] = useState("全部年龄");
  const [languageFilter, setLanguageFilter] = useState("全部语言");
  const [cloneOpen, setCloneOpen] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const filteredVoices = VOICES.filter((v) => {
    const matchesSearch = v.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGender =
      genderFilter === "全部性别" || v.gender === genderFilter;
    const matchesAge = ageFilter === "全部年龄" || v.age === ageFilter;
    const matchesLanguage =
      languageFilter === "全部语言" || v.language === languageFilter;
    return matchesSearch && matchesGender && matchesAge && matchesLanguage;
  });

  return (
    <>
      {/* 筛选器 */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <VoiceFilter
          label="性别"
          value={genderFilter}
          options={["全部性别", "男", "女"]}
          onChange={setGenderFilter}
        />
        <VoiceFilter
          label="年龄"
          value={ageFilter}
          options={["全部年龄", "青年", "中年", "老年"]}
          onChange={setAgeFilter}
        />
        <VoiceFilter
          label="语言"
          value={languageFilter}
          options={["全部语言", "中文", "英文", "方言"]}
          onChange={setLanguageFilter}
        />

        <button
          onClick={() => setCloneOpen(true)}
          className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[14px] font-medium text-black transition-opacity hover:opacity-80"
        >
          <MicrophoneIcon className="size-4" />
          克隆音色
        </button>
      </div>

      {/* 音色网格 */}
      {filteredVoices.length === 0 ? (
        <EmptyState type="voice" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isPlaying={playingId === voice.id}
              onPlay={() =>
                setPlayingId(playingId === voice.id ? null : voice.id)
              }
            />
          ))}
        </div>
      )}

      {/* 克隆音色弹框 */}
      {cloneOpen && <CloneVoiceDialog onClose={() => setCloneOpen(false)} />}
    </>
  );
}

function VoiceFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.2] bg-white/[0.1] px-3 text-[14px] text-white transition-colors hover:bg-white/[0.12]"
      >
        {value}
        <ChevronDownIcon className="size-3.5 text-white/60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-white/[0.1] bg-[#1b1b1b] py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={
                opt === value
                  ? "w-full px-3 py-2 text-left text-[13px] text-brand"
                  : "w-full px-3 py-2 text-left text-[13px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
              }
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VoiceCard({
  voice,
  isPlaying,
  onPlay,
}: {
  voice: Voice;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#141414] p-4 ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:ring-white/20">
      <div className="relative mx-auto size-20 overflow-hidden rounded-full ring-2 ring-white/[0.08]">
        <img
          src={txi(voice.imagePrompt)}
          alt={voice.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {isPlaying ? (
            <div className="flex gap-0.5">
              <span className="h-4 w-0.5 animate-pulse bg-brand" />
              <span className="h-6 w-0.5 animate-pulse bg-brand delay-75" />
              <span className="h-3 w-0.5 animate-pulse bg-brand delay-150" />
            </div>
          ) : (
            <PlayIcon className="size-5 text-white" />
          )}
        </button>
      </div>

      <div className="mt-3 text-center">
        <h3 className="text-[15px] font-semibold text-white">{voice.name}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/50">
          {voice.desc}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-white/40">
        <span>{voice.gender}</span>
        <span>·</span>
        <span>{voice.age}</span>
        <span>·</span>
        <span>{voice.language}</span>
      </div>

      <button
        type="button"
        onClick={() => console.log("使用音色", voice.name)}
        className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] text-[13px] font-medium text-white ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.1]"
      >
        <VolumeIcon className="size-3.5" />
        使用音色
      </button>
    </div>
  );
}

function CloneVoiceDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("请选择");
  const [age, setAge] = useState("请选择");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="克隆音色"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#141414] p-8 ring-1 ring-white/[0.08]"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        <h2 className="text-center text-[20px] font-bold text-white">
          克隆音色
        </h2>

        <div className="mt-8 space-y-6">
          {/* 上传音色头像 */}
          <div className="flex items-start gap-4">
            <label className="w-24 shrink-0 pt-3 text-[14px] text-white/80">
              上传音色头像
            </label>
            <label className="flex size-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.04] text-white/50 transition-colors hover:bg-white/[0.06]">
              <UploadIcon className="size-8" />
              <span className="text-[12px]">
                {avatarFile ? avatarFile.name : "上传音色头像"}
              </span>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setAvatarFile(f);
                  console.log("upload voice avatar", f);
                }}
              />
            </label>
          </div>

          {/* 音色名称 */}
          <div className="flex items-center gap-4">
            <label className="w-24 shrink-0 text-[14px] text-white/80">
              音色名称
            </label>
            <div className="relative flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入音色名称"
                maxLength={6}
                className="h-11 w-full rounded-lg border border-white/[0.2] bg-white/[0.05] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/40 focus:border-brand"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-white/40">
                {name.length}/6
              </span>
            </div>
          </div>

          {/* 音色性别 */}
          <div className="flex items-center gap-4">
            <label className="w-24 shrink-0 text-[14px] text-white/80">
              音色性别
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-11 flex-1 appearance-none rounded-lg border border-white/[0.2] bg-white/[0.05] px-4 text-[14px] text-white outline-none transition-colors focus:border-brand"
            >
              <option className="bg-[#1b1b1b]">请选择</option>
              <option className="bg-[#1b1b1b]">男</option>
              <option className="bg-[#1b1b1b]">女</option>
            </select>
          </div>

          {/* 音色年龄 */}
          <div className="flex items-center gap-4">
            <label className="w-24 shrink-0 text-[14px] text-white/80">
              音色年龄
            </label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-11 flex-1 appearance-none rounded-lg border border-white/[0.2] bg-white/[0.05] px-4 text-[14px] text-white outline-none transition-colors focus:border-brand"
            >
              <option className="bg-[#1b1b1b]">请选择</option>
              <option className="bg-[#1b1b1b]">青年</option>
              <option className="bg-[#1b1b1b]">中年</option>
              <option className="bg-[#1b1b1b]">老年</option>
            </select>
          </div>

          {/* 上传音频 */}
          <div className="flex items-start gap-4">
            <label className="w-24 shrink-0 pt-8 text-[14px] text-white/80">
              上传音频
            </label>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.04] px-6 py-8 text-white/50 transition-colors hover:bg-white/[0.06]"
              >
                <UploadIcon className="size-8" />
                <span className="text-[14px] font-medium">上传音频</span>
                <span className="text-[12px]">
                  支持 mp3, wav, m4a 格式，文件大小不超过 30MB，录音时长需在
                  10-300秒之间
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
              />
              <ul className="mt-3 space-y-1 text-[12px] text-white/40">
                <li>1. 请保证上传音频中有且只有一个人声</li>
                <li>2. 尽量保持上传音频的音质和背景干净</li>
                <li>3. 克隆音色情绪会受上传声音影响，请上传想要情绪音色</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => console.log("submit clone voice", { name, gender, age, avatarFile })}
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.1] text-[15px] font-medium text-white ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.14]"
        >
          <MicrophoneIcon className="size-4" />
          克隆音色
          <span className="ml-1 flex items-center gap-1 text-brand">
            <CoinsIcon className="size-3.5" /> 150
          </span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legacy Section (角色库 / 场景库 / 道具库)
// ---------------------------------------------------------------------------

const LEGACY_CARDS: Record<Exclude<TabId, "artist" | "voice">, LegacyCard[]> =
  {
    character: [
      {
        id: 1,
        name: "虾兵",
        imagePrompt:
          "anime character design full body, shrimp soldier, ocean theme, blue tones, detailed",
      },
      {
        id: 2,
        name: "纪川",
        imagePrompt:
          "anime character design portrait, Ji Chuan, modern young man, soft lighting",
      },
      {
        id: 3,
        name: "霍云峥",
        imagePrompt:
          "anime character design portrait, Huo Yunzheng, ancient warrior, dramatic lighting",
      },
      {
        id: 4,
        name: "萧世昌 幕后主使",
        imagePrompt:
          "anime character design portrait, Xiao Shichang, antagonist mastermind, dark atmosphere",
      },
    ],
    scene: [
      {
        id: 101,
        name: "古风宫殿",
        imagePrompt:
          "anime scene background, ancient Chinese palace interior, golden hour, cinematic",
      },
      {
        id: 102,
        name: "现代都市",
        imagePrompt:
          "anime scene background, modern city street at night, neon lights, cyberpunk atmosphere",
      },
      {
        id: 103,
        name: "校园教室",
        imagePrompt:
          "anime scene background, bright classroom with desks, sunlight through windows, peaceful",
      },
      {
        id: 104,
        name: "悬疑密室",
        imagePrompt:
          "anime scene background, dimly lit mysterious room, shadows, suspenseful atmosphere",
      },
    ],
    prop: [
      {
        id: 201,
        name: "古剑",
        imagePrompt:
          "anime prop design, ancient Chinese sword, ornate hilt, metallic sheen, detailed",
      },
      {
        id: 202,
        name: "魔法书",
        imagePrompt:
          "anime prop design, magical spellbook, glowing runes, leather bound, mystical",
      },
      {
        id: 203,
        name: "玉佩",
        imagePrompt:
          "anime prop design, jade pendant, translucent green, carved dragon motif, elegant",
      },
      {
        id: 204,
        name: "手枪",
        imagePrompt:
          "anime prop design, modern handgun, sleek black metal, realistic details",
      },
      {
        id: 205,
        name: "手机",
        imagePrompt:
          "anime prop design, modern smartphone, slim profile, screen glowing",
      },
    ],
  };

type LegacyCard = {
  id: number;
  name: string;
  imagePrompt: string;
};

// 计数从各库实际数据动态计算，避免硬编码与实际内容不一致
const TABS: { id: TabId; label: string; count: number }[] = [
  { id: "artist", label: "数字艺人", count: ARTISTS.length },
  { id: "voice", label: "音色库", count: VOICES.length },
  { id: "character", label: "角色库", count: LEGACY_CARDS.character.length },
  { id: "scene", label: "场景库", count: LEGACY_CARDS.scene.length },
  { id: "prop", label: "道具库", count: LEGACY_CARDS.prop.length },
];

function LegacySection({
  type,
  searchQuery,
}: {
  type: Exclude<TabId, "artist" | "voice">;
  searchQuery: string;
}) {
  const cards = LEGACY_CARDS[type].filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => console.log(type === "character" ? "create character" : type === "scene" ? "create scene" : "create prop")}
          className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[14px] font-medium text-black transition-opacity hover:opacity-80"
        >
          <PlusIcon className="size-4" />
          {TAB_LABEL_MAP[type]}
        </button>
      </div>

      {cards.length === 0 ? (
        <EmptyState type={type} />
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cards.map((card) => (
            <LegacyCardItem key={card.id} card={card} type={type} />
          ))}
        </div>
      )}
    </>
  );
}

function LegacyCardItem({
  card,
  type,
}: {
  card: LegacyCard;
  type: Exclude<TabId, "artist" | "voice">;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08]">
      <button
        type="button"
        onClick={() => console.log("查看资产卡片", card.name)}
        className="relative block w-full"
        style={{ aspectRatio: "16 / 9" }}
      >
        <img
          src={txi(card.imagePrompt, "landscape_4_3")}
          alt={card.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </button>

      <div className="flex items-center justify-between gap-1 px-3 py-2.5">
        <h3 className="truncate text-[14px] font-medium text-white">
          {card.name}
        </h3>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="编辑"
            onClick={() => console.log("edit", card.id)}
            className="flex items-center px-2 py-1 text-white/70 transition-colors hover:text-white"
          >
            <EditIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="删除"
            onClick={() => console.log("delete", card.id)}
            className="flex items-center px-2 py-1 text-white/70 transition-colors hover:text-white"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ type }: { type: TabId }) {
  const config: Record<
    TabId,
    { icon: React.ReactNode; title: string; action: string }
  > = {
    artist: {
      icon: <UserGroupIcon className="size-7" />,
      title: "暂无数字艺人",
      action: "创建艺人",
    },
    voice: {
      icon: <MicrophoneIcon className="size-7" />,
      title: "暂无音色",
      action: "克隆音色",
    },
    character: {
      icon: <UserGroupIcon className="size-7" />,
      title: "暂无角色资产",
      action: "创建角色",
    },
    scene: {
      icon: <SceneIcon className="size-7" />,
      title: "暂无场景资产",
      action: "创建场景",
    },
    prop: {
      icon: <PropIcon className="size-7" />,
      title: "暂无道具资产",
      action: "创建道具",
    },
  };

  const { icon, title, action } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
        {icon}
      </div>
      <p className="text-[15px] font-medium text-white/60">{title}</p>
      <p className="mt-1 text-[13px] text-white/40">
        点击右上角{action}开始创建
      </p>
    </div>
  );
}
