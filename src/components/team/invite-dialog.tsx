"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ALL_MEMBERS } from "@/lib/team-data";

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (members: string[]) => void;
}

export function InviteDialog({ open, onClose, onSubmit }: InviteDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const toggle = useCallback((member: string) => {
    setSelected((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  }, []);

  const handleSubmit = () => {
    onSubmit(selected);
    setSelected([]);
    setSearch("");
    onClose();
  };

  if (!open) return null;

  const candidates = ALL_MEMBERS.filter(
    (m) => m !== "所有成员" && m.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#1e1e1e] p-6 shadow-2xl">
        <h2 className="text-[16px] font-bold text-white">邀请成员</h2>
        <p className="mt-1 text-[12px] text-white/40">选择要邀请加入团队的成员</p>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索成员…"
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-brand/40"
        />

        {/* Member list */}
        <div className="mt-3 max-h-[240px] space-y-1 overflow-y-auto">
          {candidates.map((member) => {
            const checked = selected.includes(member);
            return (
              <button
                key={member}
                onClick={() => toggle(member)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  checked ? "bg-brand/10" : "hover:bg-white/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors",
                    checked
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-white/20 text-transparent"
                  )}
                >
                  ✓
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-[12px] text-white/50">
                  {member[0]?.toUpperCase()}
                </span>
                <span className={cn("text-[13px]", checked ? "font-medium text-white" : "text-white/70")}>
                  {member}
                </span>
              </button>
            );
          })}
          {candidates.length === 0 && (
            <p className="py-6 text-center text-[13px] text-white/30">无匹配成员</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-[13px] text-white/60 transition-colors hover:bg-white/[0.05]"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            邀请 {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
