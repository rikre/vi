"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StyleLibraryDialog } from "@/components/style-library-dialog";
import { cn } from "@/lib/utils";
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

/* ──────────────────────────────────────────────────────────────────────────
 * 创作页 — 视觉规范对齐参考站点
 *
 * 核心 UI 规范（参考站实测 → 本项目落点）：
 *  1. 居中巨标题 + 短副标（"今天想创作什么？"）
 *  2. 单一输入区，placeholder 走 ::before 伪元素
 *  3. 工具栏 = 左 chip 组（上传剧本 / 风格选择 / 场景 / 创作助理 / 选择项目）
 *     + 比例切换（pill 内嵌选中态）+ 右主 CTA（实色）+ 发送（icon 按钮）
 *  4. 比例切换 9:16 / 16:9 用 [bg-brand + text-black] 选中态
 *  5. 主 CTA 用 brand 填充 + 黑色文字 + 圆角 pill
 *  6. 快捷入口 3 项：底栏水平居中，13px 灰白，hover 上提色
 *  7. "发现更多"横向滚动卡片：圆角 2xl、video 背景、底部渐变 + 标题
 * ──────────────────────────────────────────────────────────────────────── */

const ASPECT_RATIOS = ["16:9", "9:16"] as const;
type AspectRatio = (typeof ASPECT_RATIOS)[number];

type ToolKind = "upload" | "style" | "scene" | "assistant" | "project";
type Tool = { id: ToolKind; label: string; Icon: React.ComponentType<{ className?: string }> };

const TOOL_BUTTONS: Tool[] = [
  { id: "upload", label: "上传剧本", Icon: UploadIcon },
  { id: "style", label: "风格选择", Icon: SparkleIcon },
  { id: "scene", label: "场景", Icon: SceneIcon },
  { id: "assistant", label: "创作助理", Icon: UserGroupIcon },
  { id: "project", label: "选择项目", Icon: FolderIcon },
];

const QUICK_LINKS: { label: string; isLink: boolean }[] = [
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

/* ──────────────── Small visual atoms (matching reference site) ───────────── */

function ToolChip({
  Icon,
  label,
  onClick,
}: {
  Icon: Tool["Icon"];
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3",
        "bg-white/[0.05] text-[12px] font-medium leading-[16px] text-white/60",
        "ring-1 ring-inset ring-white/[0.06]",
        "transition-all duration-150",
        "hover:bg-white/[0.08] hover:text-white hover:ring-white/10",
        "active:scale-[0.97]",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function RatioToggle({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="画面比例"
      className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.05] p-1 ring-1 ring-inset ring-white/[0.06]"
    >
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-medium leading-[16px] transition-colors",
              selected
                ? "bg-brand text-brand-foreground shadow-[0_2px_8px_rgba(200,255,113,0.25)]"
                : "text-white/55 hover:text-white",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function PrimaryCTA({
  children,
  Icon,
  onClick,
}: {
  children: React.ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-4",
        "bg-brand text-brand-foreground text-[14px] font-semibold leading-[20px]",
        "shadow-[0_4px_16px_rgba(200,255,113,0.18)]",
        "transition-all duration-150",
        "hover:brightness-105 hover:-translate-y-px",
        "active:scale-[0.97] active:translate-y-0",
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

function IconCircleButton({
  ariaLabel,
  Icon,
  onClick,
  variant = "ghost",
}: {
  ariaLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: "ghost" | "brand";
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full",
        "transition-all duration-150 active:scale-[0.94]",
        variant === "brand"
          ? "bg-brand text-brand-foreground shadow-[0_2px_8px_rgba(200,255,113,0.25)] hover:brightness-105"
          : "bg-white/[0.05] text-white/60 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.08] hover:text-white",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function QuickLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-[13px] leading-[18px] text-white/40",
        "underline-offset-4 transition-colors",
        "hover:text-white/80 hover:underline",
      )}
    >
      {label}
    </button>
  );
}

function DiscoverCard({
  title,
  videoSrc,
  isHover,
  onHover,
  onLeave,
  onClick,
}: {
  title: string;
  videoSrc: string;
  isHover: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "group relative aspect-[0.9/1] w-[224px] shrink-0 overflow-hidden rounded-2xl",
        "bg-card ring-1 ring-inset ring-white/[0.06]",
        "transition-all duration-200",
        "hover:ring-white/15 hover:-translate-y-0.5",
        "active:scale-[0.98]",
      )}
    >
      <video
        src={videoSrc}
        autoPlay={isHover}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />
      <img
        src={`https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          `cinematic anime key visual, ${title}, moody atmosphere, lime green accent, dark background, professional poster art`,
        )}&image_size=portrait_4_3`}
        alt={title}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-3 text-left">
        <h3 className="text-[12px] font-medium leading-[16px] text-white line-clamp-2">
          {title}
        </h3>
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────────── */

export default function CreatePage() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [inputValue, setInputValue] = useState("");
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [styleOpen, setStyleOpen] = useState(false);

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

        {/* 创作输入区 — 居中巨标题 + 输入区 + 工具栏 */}
        <div className="hidden md:block">
          <h1 className="mt-[80px] text-center text-[40px] font-normal leading-[40px] text-foreground">
            今天想创作什么？
          </h1>

          <div className="mx-auto mt-[40px] w-full max-w-[1094px]">
            {/* 输入区 — 半透明深底 + 圆角 + placeholder 伪元素 */}
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="创作输入框"
              data-placeholder="描述你想要的画面，按 Enter 发送"
              onInput={(e) =>
                setInputValue(e.currentTarget.textContent || "")
              }
              className={cn(
                "min-h-[86px] w-full rounded-2xl bg-white/[0.03] px-5 py-4",
                "text-[14px] font-normal leading-[20px] text-white/60",
                "ring-1 ring-inset ring-white/[0.06]",
                "outline-none transition-all duration-150",
                "focus:bg-white/[0.05] focus:ring-white/15",
                "[&:empty]:before:text-white/40 [&:empty]:before:content-[attr(data-placeholder)]",
              )}
            />

            {/* 工具栏：左 chip 组 + 比例切换 + 影棚模式 CTA + Send */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {TOOL_BUTTONS.map((btn) => (
                <ToolChip
                  key={btn.id}
                  Icon={btn.Icon}
                  label={btn.label}
                  onClick={() =>
                    btn.id === "style" ? setStyleOpen(true) : console.log(btn.label)
                  }
                />
              ))}

              <RatioToggle
                value={aspectRatio}
                options={ASPECT_RATIOS}
                onChange={(v) => setAspectRatio(v as AspectRatio)}
              />

              {/* 影棚模式 主 CTA — 推到右 */}
              <div className="ml-auto flex items-center gap-2">
                <PrimaryCTA Icon={SparkleIcon} onClick={() => console.log("影棚模式")}>
                  影棚模式
                </PrimaryCTA>

                <IconCircleButton
                  ariaLabel="发送"
                  Icon={SendIcon}
                  variant="brand"
                  onClick={() => console.log("发送创作请求", inputValue)}
                />
              </div>
            </div>

            {/* 快捷入口 — 居中 3 项 */}
            <div className="mt-4 flex items-center justify-center gap-4">
              {QUICK_LINKS.map((link) => (
                <QuickLink
                  key={link.label}
                  label={link.label}
                  onClick={() => console.log(link.label)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 发现更多 section — 横向滚动卡片 */}
        <section className="hidden md:block md:mt-[80px]">
          <div className="flex items-baseline justify-between pb-3">
            <h2 className="text-[16px] font-medium leading-[24px] text-white/85">
              发现更多
            </h2>
            <button
              type="button"
              className="text-[12px] text-white/40 transition-colors hover:text-white/70"
            >
              查看全部 →
            </button>
          </div>
          <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-[50px]">
            {DISCOVER_CARDS.map((card) => (
              <DiscoverCard
                key={card.id}
                title={card.title}
                videoSrc={card.videoSrc}
                isHover={hoveredCardId === card.id}
                onHover={() => setHoveredCardId(card.id)}
                onLeave={() => setHoveredCardId(null)}
                onClick={() => console.log("查看作品", card.title)}
              />
            ))}
          </div>
        </section>
      </div>

      <StyleLibraryDialog open={styleOpen} onClose={() => setStyleOpen(false)} />
    </AppShell>
  );
}
