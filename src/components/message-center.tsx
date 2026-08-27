"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCheckIcon, CloseIcon, TrayIcon } from "@/components/icons";

interface MessageCenterProps {
  open: boolean;
  onClose: () => void;
}

type Channel = "announce" | "message";

interface MsgItem {
  id: string;
  channel: Channel;
  title: string;
  desc: string;
  date: string;
  ts: number;
  read: boolean;
}

const INITIAL_MESSAGES: MsgItem[] = [
  {
    id: "a1",
    channel: "announce",
    title: "全量接入 Seedance 2.5 模型，创作体验全面升级！",
    desc: "更稳定、更精细、更懂叙事！打造短剧与商业广告高质感新体验",
    date: "2周前",
    ts: 70,
    read: false,
  },
  {
    id: "a2",
    channel: "announce",
    title: "【Wan 3.0 模型积分消耗下调通知】",
    desc: "更省积分，更敢创作 —— Wan 3.0 价格焕新",
    date: "昨天",
    ts: 69,
    read: false,
  },
  {
    id: "a3",
    channel: "announce",
    title: "重磅官宣｜「bollo」公测正式开启！",
    desc: "故事，不再止于想象。创作，从此拥有全新视界。",
    date: "2天前",
    ts: 68,
    read: false,
  },
  {
    id: "m1",
    channel: "message",
    title: "你的作品《逆光》获得 128 个赞",
    desc: "「镜头语言太成熟了，期待下一部！」",
    date: "2026/7/19",
    ts: 50,
    read: false,
  },
  {
    id: "m2",
    channel: "message",
    title: "导演小助手 评论了你的剧本",
    desc: "第三幕的转折可以再提前半拍，张力会更强。",
    date: "2026/7/18",
    ts: 40,
    read: false,
  },
  {
    id: "m3",
    channel: "message",
    title: "积分到账 +200",
    desc: "完成「每日创作」任务，奖励已发放至你的账户。",
    date: "2026/7/17",
    ts: 30,
    read: false,
  },
  {
    id: "m4",
    channel: "message",
    title: "项目《盛唐》渲染完成",
    desc: "共 12 个分镜已生成完毕，可前往项目页查看与导出。",
    date: "2026/7/16",
    ts: 20,
    read: true,
  },
];

export function MessageCenter({ open, onClose }: MessageCenterProps) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [tab, setTab] = useState<Channel>("announce");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const unreadOf = (ch: Channel) =>
    messages.filter((m) => m.channel === ch && !m.read).length;

  const list = messages
    .filter((m) => m.channel === tab)
    .sort((a, b) => b.ts - a.ts);

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  const markRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed bottom-0 right-0 top-0 left-[64px] z-40 bg-black/40 backdrop-blur-[2px] md:left-[108px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="通知"
        className="fixed bottom-4 right-4 top-4 z-50 flex w-[420px] max-w-[calc(100vw-72px)] flex-col overflow-hidden rounded-2xl bg-[#161616] shadow-2xl ring-1 ring-white/[0.08]"
      >
        {/* Header：标题 + 公告/消息 分段切换 */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-[16px] font-bold text-white">通知</h2>
          <div
            role="tablist"
            aria-label="通知分类"
            className="flex rounded-full bg-white/[0.06] p-1"
          >
            {(
              [
                { id: "announce", label: "公告" },
                { id: "message", label: "消息" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                  tab === t.id ? "bg-white/[0.12] text-white" : "text-white/50 hover:text-white",
                )}
              >
                {t.label}
                <span className="flex size-4 items-center justify-center rounded-full bg-[#7c5cff] text-[10px] font-bold text-white">
                  {unreadOf(t.id)}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70"
          >
            <CloseIcon className="size-[16px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/35">
              <TrayIcon className="size-12" />
              <span className="text-[13px]">暂无通知</span>
            </div>
          ) : (
            <ul className="flex flex-col">
              {list.map((m) => (
                <li key={m.id} className="border-b border-white/[0.06] last:border-0">
                  <button
                    type="button"
                    onClick={() => markRead(m.id)}
                    className="w-full px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <p className="text-right text-[11px] text-white/35">{m.date}</p>
                    <span className="mt-1.5 flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-[7px] size-1.5 shrink-0 rounded-full",
                          m.read ? "bg-white/15" : "bg-[#7c5cff]",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-bold leading-snug text-white">
                          {m.title}
                        </span>
                        <span className="mt-1.5 block text-[12px] leading-relaxed text-white/45">
                          {m.desc}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer：一键已读 */}
        <div className="shrink-0 border-t border-white/[0.06] p-4">
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-[12px] font-semibold text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            <CheckCheckIcon className="size-4" />
            一键已读
          </button>
        </div>
      </aside>
    </>
  );
}
