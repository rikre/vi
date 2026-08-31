"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  ChevronRightIcon,
  CloseIcon,
  CoinsIcon,
} from "@/components/icons";

/* 封面图统一风格：暗紫调 AI 创作课程封面 */
const COVER = (prompt: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_4_3`;

const COURSES = [
  {
    id: "c1",
    title: "AI短剧实战训练营",
    meta: "共35节 · 41.3万人已学",
    teacher: "主讲人 李甜 · 官方导师",
    cover: COVER(
      "course cover, cinematic AI filmmaking, director monitor displaying AI generated short drama scene, dark studio, purple neon lighting, high quality",
    ),
  },
  {
    id: "c2",
    title: "AIGC视频全流程创作",
    meta: "共28节 · 25.6万人已学",
    teacher: "主讲人 张远 · 官方导师",
    cover: COVER(
      "course cover, cinema camera lens with glowing motion light trails, dark background, purple neon accents, cinematic lighting, high quality",
    ),
  },
  {
    id: "c3",
    title: "漫剧编剧与提示词进阶",
    meta: "共16节 · 9.8万人已学",
    teacher: "主讲人 陈默 · 官方导师",
    cover: COVER(
      "course cover, digital comic storyboard panels floating above glowing tablet, AI writing interface, dark purple tones, high quality",
    ),
  },
];

type Tab = "hot" | "mine";

export function CourseFab() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("hot");
  const [enrolled, setEnrolled] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const enroll = (id: string) => {
    setEnrolled((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const list =
    tab === "hot" ? COURSES : COURSES.filter((c) => enrolled.includes(c.id));

  return (
    <>
      {/* 右下角悬浮入口 — 默认收起为圆钮避免遮挡页面操作区，hover 平滑展开文案 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="AIGC 公开课，听课赢积分"
        className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-brand p-2 shadow-[0_12px_32px_-12px_rgba(212,255,63,0.45)] transition-transform hover:scale-[1.03] active:scale-[0.97] max-md:bottom-4 max-md:right-4"
      >
        <span
          aria-hidden
          className="absolute -right-1 -top-2 rounded-full bg-black px-1.5 py-px text-[9px] font-bold text-brand ring-1 ring-brand/30"
        >
          NEW
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/15 text-black">
          <BookOpenIcon className="size-5" />
        </span>
        <span
          aria-hidden
          className="grid max-w-0 grid-cols-[0fr] items-center gap-2.5 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:max-w-[180px] group-hover:grid-cols-[1fr] group-hover:opacity-100 max-md:hidden"
        >
          <span className="flex min-w-0 items-center gap-2.5 whitespace-nowrap">
            <span className="h-7 w-px shrink-0 bg-black/15" />
            <span className="text-left">
              <span className="block text-[14px] font-bold leading-tight text-black">
                AIGC公开课
              </span>
              <span className="mt-0.5 block text-[11px] leading-tight text-black/65">
                听课赢积分
              </span>
            </span>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/15 text-black">
              <ChevronRightIcon className="size-3.5" />
            </span>
          </span>
        </span>
      </button>

      {/* 课程任务弹框 */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="课程任务"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[520px] rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.1]"
          >
            <button
              type="button"
              aria-label="关闭"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <CloseIcon className="size-4" />
            </button>

            {/* 头部：标题 + 积分胶囊 */}
            <div className="flex items-start justify-between pr-10">
              <div>
                <h2 className="text-[18px] font-bold text-white">课程任务</h2>
                <p className="mt-1 text-[12px] text-white/45">学课程得积分</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-semibold text-white/80 ring-1 ring-white/[0.06]">
                我的积分
                <span className="flex items-center gap-1 text-brand">
                  <CoinsIcon className="size-3.5" />
                  2,580
                </span>
              </span>
            </div>

            {/* 热门课程 / 我的课程 切换 */}
            <div
              role="tablist"
              aria-label="课程分类"
              className="mt-5 flex w-fit rounded-full bg-white/[0.06] p-1"
            >
              {(
                [
                  { id: "hot", label: "热门课程" },
                  { id: "mine", label: "我的课程" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors",
                    tab === t.id
                      ? "bg-white/[0.12] text-white"
                      : "text-white/50 hover:text-white",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 课程列表 */}
            {list.length === 0 ? (
              <p className="py-12 text-center text-[13px] text-white/35">
                还没有报名课程，去热门课程看看吧
              </p>
            ) : (
              <ul className="mt-2 flex flex-col">
                {list.map((c) => {
                  const joined = enrolled.includes(c.id);
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-4 border-b border-white/[0.06] py-4 last:border-0"
                    >
                      <img
                        src={c.cover}
                        alt={c.title}
                        loading="lazy"
                        className="size-16 shrink-0 rounded-lg object-cover ring-1 ring-white/[0.08]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-white">
                          {c.title}
                        </p>
                        <p className="mt-1 text-[11px] text-white/45">{c.meta}</p>
                        <p className="mt-0.5 text-[11px] text-white/35">
                          {c.teacher}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => enroll(c.id)}
                        className={cn(
                          "shrink-0 rounded-full px-4 py-2 text-[12px] font-bold transition-colors",
                          joined
                            ? "bg-white/[0.08] text-white/50"
                            : "bg-brand text-black hover:brightness-105",
                        )}
                      >
                        {joined ? "继续学习" : "去学习"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
