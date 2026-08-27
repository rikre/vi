"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { SparkleIcon, CloseIcon } from "@/components/icons";
import { addReference } from "@/lib/reference-store";
import type { EvidenceType } from "@/types/project";

// ─── Agent 对话消息 ──────────────────────────────────────────────────────────

interface AgentMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  evidenceType?: EvidenceType;
  timestamp: string;
}

// ─── Mock 对话流 ─────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: AgentMessage[] = [
  {
    id: "m1",
    role: "agent",
    content: "你好，我是 bollo AI 助手。可以帮你分析广场数据、生成创作引用、提取故事结构。今天想了解什么？",
    timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
  },
  {
    id: "m2",
    role: "user",
    content: "最近有哪些爆款题材？",
    timestamp: new Date(Date.now() - 60000 * 4).toISOString(),
  },
  {
    id: "m3",
    role: "agent",
    content:
      "近 7 天爆款榜显示，「重生复仇」「真假千金」「战神归来」三类题材热度持续上升。其中红果短剧《首富千金养成计划》连续 14 天霸榜，结构上采用「重生+商战+打脸」三段式钩子，建议参考其开篇 3 分钟节奏。",
    evidenceType: "real_data",
    timestamp: new Date(Date.now() - 60000 * 3).toISOString(),
  },
  {
    id: "m4",
    role: "agent",
    content:
      "基于历史数据模型分析，预计未来 2 周该题材仍有 60% 流量空间，但同质化风险上升，建议在人物设定上做差异化（如加入职场元素）。",
    evidenceType: "model_analysis",
    timestamp: new Date(Date.now() - 60000 * 2).toISOString(),
  },
];

// ─── AgentDock 组件 ──────────────────────────────────────────────────────────

export interface AgentDockContext {
  page: string;
  tab?: string;
  selectedId?: string;
}

export function AgentDock({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  context: AgentDockContext;
}) {
  const [messages, setMessages] = useState<AgentMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 自动滚动到底部
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  // 焦点管理：打开时聚焦抽屉，关闭时恢复原焦点
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      // 等待渲染完成后聚焦
      const t = setTimeout(() => {
        const first = drawerRef.current?.querySelector<HTMLElement>(
          "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
        );
        first?.focus();
      }, 50);
      return () => clearTimeout(t);
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus();
      previouslyFocused.current = null;
    }
  }, [open]);

  // 卸载时清理 setTimeout
  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  // 焦点陷阱：Tab 到末尾时回到开头
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 模拟 Agent 回复（带清理）
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const agentMsg: AgentMessage = {
        id: `a-${Date.now()}`,
        role: "agent",
        content:
          "已收到你的问题。基于广场数据分析，这个题材在过去 30 天表现稳定，但同质化严重。建议从人物动机切入做差异化，并参考爆款榜前 3 名的开篇结构。是否需要将本次分析添加为引用？",
        evidenceType: "market_estimate",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 800);
  };

  const handleAddReference = () => {
    const lastAgent = [...messages].reverse().find((m) => m.role === "agent");
    const ok = addReference({
      type: "ai_answer",
      id: `agent-${Date.now()}`,
      title: "AI 助手分析",
      evidenceType: lastAgent?.evidenceType ?? "model_analysis",
      addedAt: new Date().toISOString(),
      fromPage: context.page,
      summary: lastAgent?.content,
    });
    if (!ok) {
      // 已存在或失败 — 静默提示
      window.console.warn("[agent-dock] reference already exists or add failed");
    }
  };

  return (
    <>
      {/* 遮罩 */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* 抽屉 — 始终渲染，靠 translate + opacity 做过渡 */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI 助手"
        aria-hidden={!open}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-[420px] max-sm:w-full flex-col border-l border-white/[0.08] bg-[#0f0f0f] shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
      >
        {/* 顶栏 */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-brand/15">
              <SparkleIcon className="size-3.5 text-brand" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-white">AI 助手</p>
              <p className="text-[10px] text-white/40">
                上下文：{context.page}
                {context.tab ? ` · ${context.tab}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        {/* 对话流 */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto p-4"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>

        {/* 快捷动作 — 「添加为引用」走真实 addReference，其余保持 mock */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-2">
          <button
            type="button"
            onClick={handleAddReference}
            className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            + 添加为引用
          </button>
          <button
            type="button"
            onClick={() => window.console.log("[agent-dock] generate benchmark (mock)")}
            className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            生成对标
          </button>
          <button
            type="button"
            onClick={() => window.console.log("[agent-dock] extract structure (mock)")}
            className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            提取结构
          </button>
        </div>

        {/* 输入区 */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-end gap-2 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/[0.06] focus-within:ring-brand/30">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="问 AI 助手..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none"
              style={{ maxHeight: "100px" }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
                input.trim()
                  ? "bg-brand text-black hover:brightness-110"
                  : "bg-white/[0.06] text-white/30"
              )}
            >
              发送
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── 消息气泡 ────────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
          isUser
            ? "bg-brand text-black"
            : "bg-white/[0.06] text-white/85 ring-1 ring-white/[0.06]"
        )}
      >
        {!isUser && message.evidenceType && (
          <div className="mb-1.5">
            <EvidenceBadge type={message.evidenceType} />
          </div>
        )}
        <p>{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[10px] tabular-nums",
            isUser ? "text-black/50" : "text-white/30"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── 触发按钮（在 TopBar 中使用）─────────────────────────────────────────────

export function AgentDockTrigger({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="打开 AI 助手"
      aria-expanded={active}
      title="AI 助手"
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-colors",
        active
          ? "bg-brand/15 text-brand"
          : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white"
      )}
    >
      <SparkleIcon className="size-3.5" />
      <span>AI 助手</span>
    </button>
  );
}
