"use client";

import { useEffect, useState } from "react";
import {
  HeartIcon,
  MessageSquareIcon,
  SparkleIcon,
  GiftIcon,
  InfoIcon,
  XIcon,
  CheckCheckIcon,
} from "@/components/icons";

interface MessageCenterProps {
  open: boolean;
  onClose: () => void;
}

type MsgKind = "like" | "comment" | "system" | "reward" | "notice" | "platform" | "welcome";

interface MsgItem {
  id: string;
  kind: MsgKind;
  title: string;
  desc: string;
  date: string;
  ts: number;
  read: boolean;
}

const INITIAL_MESSAGES: MsgItem[] = [
  {
    id: "m1",
    kind: "platform",
    title: "bollo关于人工智能生成内容的平台规范公告",
    desc: "人工智能技术的快速发展，为互联网行业带来了更多可能性。尤其在内容创作领域，生成式人工智能技术降低了创作门槛，提升了创作效率。为规范平台内容生态，保障创作者权益，现发布以下规范公告……",
    date: "2026/5/21",
    ts: 70,
    read: false,
  },
  {
    id: "m2",
    kind: "welcome",
    title: "用户注册成功",
    desc: "您好！ 欢迎成为创作者！ 您好，欢迎注册使用bollo漫剧制作推广平台。打破创作局限，AI 赋能每帧精彩，速来体验全新创作之旅……",
    date: "2026/5/21",
    ts: 65,
    read: false,
  },
  {
    id: "m3",
    kind: "system",
    title: "Seedance 2.0 已上线",
    desc: "会员现已解锁 Seedance 2.0 视频模型，去创作页试试吧。",
    date: "2026/7/20",
    ts: 60,
    read: false,
  },
  {
    id: "m4",
    kind: "like",
    title: "你的作品《逆光》获得 128 个赞",
    desc: "「镜头语言太成熟了，期待下一部！」",
    date: "2026/7/19",
    ts: 50,
    read: true,
  },
  {
    id: "m5",
    kind: "comment",
    title: "导演小助手 评论了你的剧本",
    desc: "第三幕的转折可以再提前半拍，张力会更强。",
    date: "2026/7/18",
    ts: 40,
    read: true,
  },
  {
    id: "m6",
    kind: "reward",
    title: "盒饭到账 +200",
    desc: "完成「每日创作」任务，奖励已发放至你的账户。",
    date: "2026/7/17",
    ts: 30,
    read: true,
  },
  {
    id: "m7",
    kind: "notice",
    title: "项目《盛唐》渲染完成",
    desc: "共 12 个分镜已生成完毕，可前往项目页查看与导出。",
    date: "2026/7/16",
    ts: 20,
    read: true,
  },
];

/* Icon per kind — platform uses a gradient "A" badge, welcome uses a megaphone */
function KindIcon({ kind }: { kind: MsgKind }) {
  if (kind === "platform") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a]">
        <svg viewBox="0 0 24 24" className="size-5">
          <defs>
            <linearGradient id="msg-a-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff5c3a" />
              <stop offset="100%" stopColor="#ff2d6b" />
            </linearGradient>
          </defs>
          <text x="12" y="17" textAnchor="middle" fill="url(#msg-a-grad)" fontSize="16" fontWeight="800" fontFamily="system-ui">A</text>
        </svg>
      </span>
    );
  }
  if (kind === "welcome") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a]">
        <svg viewBox="0 0 24 24" fill="none" className="size-5 text-brand">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  const map: Record<string, { Icon: React.ComponentType<{ className?: string }>; color: string }> = {
    like: { Icon: HeartIcon, color: "text-[#ff5cb0]" },
    comment: { Icon: MessageSquareIcon, color: "text-[#00e5c8]" },
    system: { Icon: SparkleIcon, color: "text-brand" },
    reward: { Icon: GiftIcon, color: "text-orange-300" },
    notice: { Icon: InfoIcon, color: "text-white/70" },
  };
  const s = map[kind] ?? map.notice;
  const { Icon } = s;
  return (
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] ${s.color}`}>
      <Icon className="size-[18px]" />
    </span>
  );
}

function TrayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 13h4l1.5 2.5h7L17 13h4" />
      <path d="M5 13l1.8-6.2A2 2 0 0 1 8.7 5.3h6.6a2 2 0 0 1 1.9 1.5L19 13" />
      <path d="M3 13v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

export function MessageCenter({ open, onClose }: MessageCenterProps) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sorted = [...messages].sort((a, b) => b.ts - a.ts);

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed bottom-0 right-0 top-0 left-[108px] z-40 bg-black/40 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="消息中心"
        className="fixed bottom-0 top-0 left-[108px] z-50 flex w-[420px] max-w-[calc(100vw-108px)] flex-col bg-[#1a1a1a] shadow-2xl"
      >
        {/* Header */}
        <div className="flex h-[52px] shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-white">消息中心</h2>
            <button
              type="button"
              onClick={markAllRead}
              title="全部标为已读"
              aria-label="全部标为已读"
              className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70"
            >
              <CheckCheckIcon className="size-[15px]" />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70"
          >
            <XIcon className="size-[16px]" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/35">
              <TrayIcon className="size-12" />
              <span className="text-[13px]">暂无消息</span>
            </div>
          ) : (
            <ul className="flex flex-col">
              {sorted.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setMessages((prev) =>
                        prev.map((x) => (x.id === m.id ? { ...x, read: true } : x))
                      );
                      console.log("navigate to message", m.id);
                    }}
                    className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <KindIcon kind={m.kind} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-white/90">
                        {m.title}
                      </span>
                      <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-white/45">
                        {m.desc}
                      </span>
                      <span className="mt-2 block text-[12px] text-white/30">
                        {m.date}
                      </span>
                    </span>
                    {/* Unread dot */}
                    {!m.read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#ff3b3b]" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
