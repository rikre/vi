"use client";

import { useState } from "react";
import { MessageSquareIcon, SendIcon, UploadIcon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

type FeedbackTab = "broadcast" | "feedback";

type FeedbackEntry = {
  id: string;
  subject: string;
  description: string;
  fileName: string;
  createdAt: string;
};

export function ToolsFeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<FeedbackTab>("feedback");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectTab = (tab: FeedbackTab) => {
    setActiveTab(tab);
    setError("");
    setNotice("");
  };

  const handleTabKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    let nextTab: FeedbackTab | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") nextTab = activeTab === "feedback" ? "broadcast" : "feedback";
    if (event.key === "Home") nextTab = "broadcast";
    if (event.key === "End") nextTab = "feedback";
    if (!nextTab) return;
    event.preventDefault();
    selectTab(nextTab);
    document.getElementById(`tools-feedback-tab-${nextTab}`)?.focus();
  };

  const submitFeedback = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError("请填写反馈主题和详细描述");
      setNotice("");
      return;
    }
    const form = event.currentTarget;
    setEntries((current) => [{
      id: `feedback-${Date.now()}`,
      subject: subject.trim(),
      description: description.trim(),
      fileName,
      createdAt: new Date().toISOString(),
    }, ...current]);
    setSubject("");
    setDescription("");
    setFileName("");
    form.reset();
    setError("");
    setNotice("反馈已保存在本地记录中，未发送到服务器");
  };

  return (
    <Modal open={open} onClose={onClose} title="帮助与反馈" className="h-[608px] w-[840px] max-w-[calc(100vw-32px)] overflow-hidden bg-surface max-md:h-[min(720px,calc(100vh-32px))]">
      <div className="flex h-full flex-col md:flex-row">
        <aside className="shrink-0 bg-white/[0.06] p-5 max-md:pb-3 md:w-[240px]">
          <div className="flex items-center gap-2 pr-8 text-foreground">
            <MessageSquareIcon className="size-5 text-brand" />
            <h2 className="text-base font-semibold">帮助与反馈</h2>
          </div>
          <div role="tablist" aria-label="反馈中心" className="mt-5 flex gap-2 md:flex-col">
            {([
              ["broadcast", "广播消息"],
              ["feedback", "意见反馈"],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                id={`tools-feedback-tab-${tab}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tools-feedback-panel-${tab}`}
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => selectTab(tab)}
                onKeyDown={handleTabKeys}
                className={cn(
                  "flex-1 rounded-xl px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none md:flex-none",
                  activeTab === tab ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
          {activeTab === "broadcast" ? (
            <section id="tools-feedback-panel-broadcast" role="tabpanel" aria-labelledby="tools-feedback-tab-broadcast">
              <h3 className="text-lg font-semibold text-foreground">广播消息</h3>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm leading-6 text-muted-foreground">这里展示平台广播消息。本地对齐版本不请求网络消息。</p>
              </div>
            </section>
          ) : (
            <section id="tools-feedback-panel-feedback" role="tabpanel" aria-labelledby="tools-feedback-tab-feedback">
              <h3 className="text-lg font-semibold text-foreground">意见反馈</h3>
              <div className="mt-4">
                <h4 className="text-xs font-medium text-muted-foreground">反馈记录</h4>
                <div className="mt-2 max-h-[112px] space-y-2 overflow-y-auto">
                  {entries.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-white/10 px-3 py-3 text-xs text-muted-foreground">暂无反馈记录</p>
                  ) : entries.map((entry) => (
                    <article key={entry.id} className="rounded-lg bg-white/[0.05] p-3">
                      <h5 className="text-sm font-medium text-foreground">{entry.subject}</h5>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{entry.description}</p>
                      {entry.fileName ? <p className="mt-1 text-[11px] text-brand">附件：{entry.fileName}</p> : null}
                    </article>
                  ))}
                </div>
              </div>

              <form onSubmit={submitFeedback} className="mt-4">
                <h4 className="text-xs font-medium text-muted-foreground">新建反馈</h4>
                <label className="mt-3 block">
                  <span className="sr-only">输入主题</span>
                  <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="输入主题" className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/60" />
                </label>
                <label className="mt-3 block">
                  <span className="sr-only">详细描述</span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="请详细描述你的反馈..." className="h-[116px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/60" />
                </label>
                {error ? <p role="alert" className="mt-2 text-xs text-danger">{error}</p> : null}
                {notice ? <p role="status" className="mt-2 text-xs text-brand">{notice}</p> : null}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <label className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground focus-within:ring-2 focus-within:ring-brand">
                      <UploadIcon className="size-4" />
                      上传图片
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
                    </label>
                    {fileName ? <span className="truncate text-[11px] text-muted-foreground">{fileName}</span> : null}
                  </div>
                  <button type="submit" className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-xs font-semibold text-brand-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none">
                    <SendIcon className="size-3.5" />
                    发送
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
}
