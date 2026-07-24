"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  SearchIcon,
  ChevronDownIcon,
  UploadIcon,
  SparkleIcon,
  SceneIcon,
  UserGroupIcon,
  FolderIcon,
  SendIcon,
  PlayIcon,
} from "@/components/icons";

const ASPECT_RATIOS = ["16:9", "9:16"] as const;
type AspectRatio = (typeof ASPECT_RATIOS)[number];

const TOOL_BUTTONS = [
  { id: "upload", label: "上传剧本", Icon: UploadIcon },
  { id: "style", label: "风格选择", Icon: SparkleIcon },
  { id: "scene", label: "场景", Icon: SceneIcon },
  { id: "assistant", label: "创作助理", Icon: UserGroupIcon },
  { id: "project", label: "选择项目", Icon: FolderIcon },
];

const QUICK_LINKS = [
  { label: "AI拉片", isLink: false },
  { label: "剧本大师", isLink: true },
  { label: "儿童创作", isLink: true },
];

const DISCOVER_CARDS = [
  {
    id: 1,
    title: "水上同行",
    videoSrc:
      "https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1d3e7c6defd846249ed9b5aaf9981038/69a99f8e1f820539/outputs/final_video_1763566011.mp4",
  },
  {
    id: 2,
    title: "星际觉醒：岩石战神的太空绝地反击",
    videoSrc:
      "https://store.cdn.bollo.video/media/3e373f32289841fda24e32096f5a917e/6dc02e9b328ab2b2/outputs/final_video_1779181877.mp4",
  },
  {
    id: 3,
    title: "先知弥迦：从摩利设加特到伯利恒的公义与怜悯",
    videoSrc:
      "https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1d3e7c6defd846249ed9b5aaf9981038/54daf7d8058e4e40/outputs/final_video_1762230516.mp4",
  },
  {
    id: 4,
    title: "以斯帖记：波斯王宫里的生死豪赌与民族救赎",
    videoSrc:
      "https://store.cdn.bollo.video/media/66a43f7f7b25453b981ffb6803285a2a/3aa1fd7beab08226/outputs/final_video_1776509607.mp4",
  },
  {
    id: 5,
    title: "授时中心",
    videoSrc:
      "https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/686db70e930740d8a5698450e435ea45/4b62b9dc6bf0c060/outputs/final_video_1764765522.mp4",
  },
  {
    id: 6,
    title: "被爱，无需理由",
    videoSrc:
      "https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1d3e7c6defd846249ed9b5aaf9981038/0fdebea15dcb6bf7/outputs/final_video_1760507562.mp4",
  },
  {
    id: 7,
    title: "心光",
    videoSrc:
      "https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1fccece2e713471392f9e773f7e02cbb/fe1130aed9d7ea83/outputs/final_video_1764655726.mp4",
  },
];

export default function CreatePage() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [inputValue, setInputValue] = useState("");
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10 no-scrollbar">
        {/* 移动端提示 */}
        <div className="block py-10 text-center text-white/60 md:hidden">
          <p className="text-[16px] font-medium">为获得最佳体验，请访问网页版</p>
          <p className="mt-2 text-[13px] text-white/40">
            在桌面端使用完整功能创作 AI 视频
          </p>
        </div>

        {/* 创作输入区 */}
        <div className="hidden md:block">
          <h1 className="mt-[80px] text-center text-[40px] font-normal leading-[40px] text-foreground">
            今天想创作什么？
          </h1>

          <div className="mx-auto mt-[40px] w-full max-w-[1094px]">
            {/* contenteditable 输入框 */}
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="创作输入框"
              data-placeholder="描述你想要的画面，按 Enter 发送"
              onInput={(e) =>
                setInputValue(e.currentTarget.textContent || "")
              }
              className="min-h-[86px] w-full rounded-[16px] bg-white/[0.03] px-5 py-4 text-[14px] font-normal leading-[20px] text-white/60 outline-none transition-colors focus:bg-white/[0.05] [&:empty]:before:text-white/40 [&:empty]:before:content-[attr(data-placeholder)]"
            />

            {/* 工具栏 */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {TOOL_BUTTONS.map((btn) => {
                const { Icon } = btn;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    className="flex h-8 items-center gap-2 rounded-full bg-white/[0.05] px-3 text-[12px] font-medium leading-[16px] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <Icon className="size-3.5" />
                    {btn.label}
                  </button>
                );
              })}

              {/* 比例切换 */}
              <div className="flex items-center gap-1 rounded-full bg-white/[0.05] p-1">
                {ASPECT_RATIOS.map((ratio) => {
                  const selected = aspectRatio === ratio;
                  return (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={
                        selected
                          ? "rounded-full bg-brand px-3 py-1 text-[12px] font-medium leading-[16px] text-black"
                          : "rounded-full px-3 py-1 text-[12px] font-medium leading-[16px] text-white/60 transition-colors hover:text-white"
                      }
                    >
                      {ratio}
                    </button>
                  );
                })}
              </div>

              {/* 影棚模式 CTA */}
              <button
                type="button"
                className="ml-auto flex h-8 items-center gap-1.5 rounded-full bg-brand px-4 text-[14px] font-medium leading-[20px] text-black transition-opacity hover:opacity-80"
              >
                <SparkleIcon className="size-3.5" />
                影棚模式
              </button>

              {/* Send 按钮 */}
              <button
                type="button"
                aria-label="发送"
                className="flex h-8 items-center gap-2 rounded-full bg-brand px-3 text-[12px] font-medium text-black transition-opacity hover:opacity-80"
              >
                <SendIcon className="size-3.5" />
                Send
              </button>
            </div>

            {/* 快捷入口 */}
            <div className="mt-4 flex items-center justify-center gap-4">
              {QUICK_LINKS.map((link) => (
                <span
                  key={link.label}
                  className="cursor-pointer text-[13px] text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
                >
                  {link.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 发现更多 section */}
        <section className="hidden md:block md:mt-[80px]">
          <div className="flex items-baseline justify-between pb-3">
            <h2 className="text-[16px] font-medium text-white/85">发现更多</h2>
          </div>
          <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-[50px]">
            {DISCOVER_CARDS.map((card) => (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="relative aspect-[0.9/1] w-[224px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-card"
              >
                <video
                  src={card.videoSrc}
                  autoPlay={hoveredCardId === card.id}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <img
                  src={`https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
                    `cinematic anime key visual, ${card.title}, moody atmosphere, lime green accent, dark background, professional poster art`
                  )}&image_size=portrait_4_3`}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="text-[12px] font-medium text-white">
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
