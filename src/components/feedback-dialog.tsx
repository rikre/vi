"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CloseIcon,
  BellIcon,
  MessageSquareIcon,
  SendIcon,
  InfoIcon,
  GiftIcon,
  SparkleIcon,
  CheckCheckIcon,
} from "@/components/icons";

// ─── 数据 ──────────────────────────────────────────────────────────────────

type Notice = {
  id: string;
  tag: "公告" | "活动" | "更新";
  title: string;
  date: string;
  body: string;
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const NOTICES: Notice[] = [
  {
    id: "n1",
    tag: "活动",
    title: "OPC 一人公司创作大赛开启，瓜分 1 亿积分奖池",
    date: daysAgo(1),
    body: "一个人完成一部短剧即可参赛，获奖作品将获得首页推荐位与积分奖励，活动截止本月底。",
  },
  {
    id: "n2",
    tag: "更新",
    title: "万三视频模型上线：电影级画面一句话直出成片",
    date: daysAgo(3),
    body: "新模型支持叙事节奏控制与 1080p 超分，创作页可直接切换体验。",
  },
  {
    id: "n3",
    tag: "更新",
    title: "资产多版本系统上线",
    date: daysAgo(5),
    body: "角色/场景资产支持多版本留存：九宫格生成选图、版本切换、一键复制与删除，分镜引用自动使用当前版本。",
  },
  {
    id: "n4",
    tag: "公告",
    title: "会员权益升级：专属模型 + 3 倍积分 + 优先队列",
    date: daysAgo(8),
    body: "已订阅用户自动生效，未订阅用户可在「订阅会员」页查看新权益。",
  },
];

type Feedback = {
  id: string;
  type: string;
  content: string;
  contact: string;
  createdAt: string;
  status: "已提交" | "已回复";
  reply?: string;
};

const FB_KEY = "bollo_feedbacks";

function loadFeedbacks(): Feedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FB_KEY);
    return raw ? (JSON.parse(raw) as Feedback[]) : [];
  } catch {
    return [];
  }
}

function saveFeedbacks(list: Feedback[]) {
  try {
    window.localStorage.setItem(FB_KEY, JSON.stringify(list));
  } catch {
    // 隐私模式等场景静默降级为会话内状态
  }
}

const FEEDBACK_TYPES = ["功能建议", "问题反馈", "体验优化", "其他"];

const TAG_STYLE: Record<Notice["tag"], string> = {
  公告: "bg-info/15 text-info",
  活动: "bg-brand/15 text-brand",
  更新: "bg-white/[0.08] text-white/70",
};

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"notices" | "mine">("notices");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(loadFeedbacks);
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [justSent, setJustSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const unread = useMemo(() => feedbacks.filter((f) => f.status === "已回复").length, [feedbacks]);

  const submit = () => {
    if (content.trim().length < 5) {
      setError("请至少填写 5 个字的反馈内容");
      return;
    }
    setError(null);
    const item: Feedback = {
      id: `fb-${Date.now()}`,
      type,
      content: content.trim(),
      contact: contact.trim(),
      createdAt: `${daysAgo(0)} ${new Date().toTimeString().slice(0, 5)}`,
      status: "已提交",
    };
    const next = [item, ...feedbacks];
    setFeedbacks(next);
    saveFeedbacks(next);
    setContent("");
    setContact("");
    setJustSent(true);
    setTab("mine");
    setTimeout(() => setJustSent(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="帮助与反馈"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] shadow-2xl"
      >
        {/* 头部 */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MessageSquareIcon className="size-4" />
            </span>
            <h3 className="text-[15px] font-semibold text-white">帮助与反馈</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        {/* Tab */}
        <div role="tablist" aria-label="反馈中心" className="flex gap-1 border-b border-white/[0.06] px-5 pt-3">
          {(
            [
              { key: "notices", label: "站内公告", Icon: BellIcon },
              { key: "mine", label: "我的反馈", Icon: MessageSquareIcon },
            ] as const
          ).map(({ key, label, Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={`relative flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  active ? "text-brand" : "text-white/50 hover:text-white/80"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
                {key === "mine" && unread > 0 && (
                  <span className="rounded-full bg-brand px-1.5 text-[10px] font-bold text-black">
                    {unread}
                  </span>
                )}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />
                )}
              </button>
            );
          })}
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
          {tab === "notices" ? (
            <ul className="space-y-3">
              {NOTICES.map((n) => (
                <li
                  key={n.id}
                  className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TAG_STYLE[n.tag]}`}>
                      {n.tag}
                    </span>
                    <span className="text-[11px] text-white/35">{n.date}</span>
                  </div>
                  <h4 className="mt-2 text-[13px] font-semibold text-white">{n.title}</h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/50">{n.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-5">
              {/* 成功提示 */}
              {justSent && (
                <div className="flex items-center gap-2 rounded-xl bg-brand/[0.08] px-4 py-3 text-[12px] text-brand ring-1 ring-brand/25">
                  <CheckCheckIcon className="size-4" />
                  反馈已提交，我们会尽快处理
                </div>
              )}

              {/* 表单 */}
              <div className="space-y-3 rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.06]">
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="反馈类型">
                  {FEEDBACK_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={type === t}
                      onClick={() => setType(t)}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                        type === t
                          ? "bg-brand text-black"
                          : "bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="描述你的建议或遇到的问题（至少 5 个字）"
                  aria-label="反馈内容"
                  className="w-full resize-none rounded-lg bg-white/[0.04] px-3 py-2.5 text-[13px] text-white placeholder:text-white/30 ring-1 ring-white/[0.08] focus:outline-none focus:ring-brand/40"
                />
                <div className="flex items-center gap-2">
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="联系方式（选填，便于回复你）"
                    aria-label="联系方式"
                    className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2 text-[12px] text-white placeholder:text-white/30 ring-1 ring-white/[0.08] focus:outline-none focus:ring-brand/40"
                  />
                  <button
                    type="button"
                    onClick={submit}
                    className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[12px] font-bold text-black transition-all hover:brightness-105 active:scale-95"
                  >
                    <SendIcon className="size-3.5" />
                    提交反馈
                  </button>
                </div>
                {error && <p className="text-[11px] text-danger">{error}</p>}
              </div>

              {/* 历史反馈 */}
              {feedbacks.length === 0 ? (
                <p className="py-6 text-center text-[12px] text-white/35">
                  暂无反馈记录，有问题随时告诉我们
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {feedbacks.map((f) => (
                    <li
                      key={f.id}
                      className="rounded-xl bg-white/[0.02] p-3.5 ring-1 ring-white/[0.06]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                            {f.type}
                          </span>
                          <span className="text-[11px] text-white/35">{f.createdAt}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            f.status === "已回复"
                              ? "bg-brand/15 text-brand"
                              : "bg-white/[0.06] text-white/50"
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/70">{f.content}</p>
                      {f.reply && (
                        <div className="mt-2 rounded-lg bg-brand/[0.06] px-3 py-2 text-[12px] text-brand/90">
                          官方回复：{f.reply}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* 底部客服入口 */}
        <footer className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <InfoIcon className="size-3.5" />
            工作日 10:00-19:00 在线
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
            >
              <SparkleIcon className="size-3.5" />
              跳转客服系统
            </a>
            <span className="flex items-center gap-1.5 text-[12px] text-white/50">
              <GiftIcon className="size-3.5" />
              官方交流群见侧边栏二维码
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
