"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon, GlobeIcon, UsersIcon, CheckIcon } from "@/components/icons";
import {
  getProjectShareInfo,
  updateProjectShare,
  copyToClipboard,
  type ShareVisibility,
} from "@/lib/share-api";

interface ShareDialogProps {
  projectId: string;
  projectTitle: string;
  open: boolean;
  onClose: () => void;
}

const VISIBILITY_OPTIONS: {
  id: ShareVisibility;
  label: string;
  icon: typeof GlobeIcon;
  desc: string;
}[] = [
  {
    id: "public",
    label: "互联网获得链接的人可查看",
    icon: GlobeIcon,
    desc: "任何人都可以通过此链接访问",
  },
  {
    id: "team",
    label: "团队成员可查看",
    icon: UsersIcon,
    desc: "只有项目成员可以通过此链接访问",
  },
];

export function ShareDialog({
  projectId,
  projectTitle,
  open,
  onClose,
}: ShareDialogProps) {
  const [visibility, setVisibility] = useState<ShareVisibility>("public");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setDropdownOpen(false);
      setCopied(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getProjectShareInfo(projectId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setVisibility(res.data.visibility);
        setUrl(res.data.url);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, projectId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const activeOption = VISIBILITY_OPTIONS.find((o) => o.id === visibility)!;
  const ActiveIcon = activeOption.icon;

  const handleVisibilityChange = async (next: ShareVisibility) => {
    if (next === visibility) {
      setDropdownOpen(false);
      return;
    }
    setVisibility(next);
    setDropdownOpen(false);
    await updateProjectShare(projectId, { visibility: next, allowFork: false });
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] shadow-2xl"
      >
        {/* 右上角关闭按钮 */}
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        {/* 标题 */}
        <div className="mb-6 pr-8">
          <h2
            id="share-dialog-title"
            className="text-[18px] font-bold text-white"
          >
            分享项目
          </h2>
          <p className="mt-1 text-[13px] text-white/50">{projectTitle}</p>
        </div>

        {/* 谁可以访问 */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-white/80">
            谁可以访问
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-3 text-left ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.07] focus:outline-none focus:ring-brand/50"
            >
              <ActiveIcon className="size-5 text-brand" />
              <span className="flex-1 text-[14px] text-white">
                {activeOption.label}
              </span>
              <ChevronIcon open={dropdownOpen} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl bg-[#1c1c1c] p-1 ring-1 ring-white/[0.1] shadow-xl">
                {VISIBILITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleVisibilityChange(option.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        visibility === option.id
                          ? "bg-white/[0.08]"
                          : "hover:bg-white/[0.05]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5",
                          visibility === option.id ? "text-brand" : "text-white/50"
                        )}
                      />
                      <span className="text-[13px] text-white">{option.label}</span>
                      {visibility === option.id && (
                        <CheckIcon className="ml-auto size-4 text-brand" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 分享链接 */}
        <div className="mt-5 space-y-2">
          <label className="block text-[13px] font-medium text-white/80">
            分享链接
          </label>
          <div className="flex items-center gap-2 overflow-hidden rounded-xl bg-white/[0.05] px-4 py-2 ring-1 ring-white/[0.08]">
            <span className="flex-1 truncate text-[13px] text-white/70">
              {url || "加载中..."}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!url}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                copied
                  ? "text-brand"
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
              )}
            >
              {copied ? (
                <>
                  <CheckIcon className="size-3.5" />
                  已复制
                </>
              ) : (
                "复制链接"
              )}
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-[12px] text-white/40">
            <ActiveIcon className="size-3.5" />
            {activeOption.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 text-white/40 transition-transform", open && "rotate-180")}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
