"use client";

import { useEffect, useState } from "react";
import { CloseIcon, LayersIcon, PlusIcon, UsersIcon } from "@/components/icons";

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.5 19a4.5 4.5 0 0 0 .42-8.98 6 6 0 0 0-11.7 1.62A3.5 3.5 0 0 0 6.5 19z" />
    </svg>
  );
}

function GemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="team-gem-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe9a3" />
          <stop offset="0.5" stopColor="#f5b93c" />
          <stop offset="1" stopColor="#c77b1e" />
        </linearGradient>
      </defs>
      <path d="M14 8h20l8 10-18 22L6 18z" fill="url(#team-gem-g)" />
      <path
        d="M6 18h36M14 8l4 10 6-10 6 10 4-10M18 18l6 22 6-22"
        stroke="#fff7dd"
        strokeWidth="1.2"
        fill="none"
        opacity=".65"
      />
    </svg>
  );
}

const TEAM_FEATURES = [
  { Icon: UsersIcon, title: "多人协同创作", desc: "团队成员共享资产，实时同步进度" },
  { Icon: CloudIcon, title: "专属云端空间", desc: "大容量安全存储，权限精细管控" },
  { Icon: LayersIcon, title: "团队专属资产库", desc: "核心资产沉淀复用，跨项目高效调用" },
];

export function TeamDialog({ onClose }: { onClose: () => void }) {
  const [notice, setNotice] = useState(false);

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
      aria-label="团队版会员"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[880px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#151c33] to-[#0d1222] px-8 py-12 ring-1 ring-white/[0.08] md:px-14"
      >
        {/* 氛围光 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-[480px] -translate-x-1/2 rounded-full bg-brand/[0.06] blur-3xl"
        />
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <GemIcon className="size-14" />
          <h2 className="mt-5 text-[20px] font-bold text-white">
            开通团队会员后即可使用团队功能
          </h2>
          <p className="mt-2 text-[13px] text-white/50">
            团队功能为团队版会员专属权益，个人账号需开通团队版会员
          </p>

          <button
            type="button"
            onClick={() => setNotice(true)}
            className="mt-6 flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-[13px] font-bold text-black transition-all hover:brightness-105 active:scale-[0.97]"
          >
            <PlusIcon className="size-4" />
            创建团队
          </button>
          {notice && (
            <p className="mt-3 text-[12px] text-white/50" role="status">
              团队版会员即将上线，敬请期待
            </p>
          )}
        </div>

        {/* 分隔标题 */}
        <div className="relative mt-10 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[12px] text-white/40">开通解锁以下功能</span>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {/* 功能三卡 */}
        <div className="relative mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TEAM_FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white/70">
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[14px] font-bold text-white">{title}</span>
                <span className="mt-1 block text-[12px] leading-relaxed text-white/45">{desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
