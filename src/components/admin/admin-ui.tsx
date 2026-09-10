"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const ADMIN_CARD = "rounded-2xl bg-[#141414] ring-1 ring-white/[0.08]";
export const ADMIN_INPUT = "h-10 w-full rounded-xl bg-white/[0.06] px-3 text-[13px] text-white outline-none ring-1 ring-white/[0.1] placeholder:text-white/30 focus:ring-2 focus:ring-brand/30";
export const ADMIN_LABEL = "mb-1.5 block text-[12px] font-medium text-white/55";
export const ADMIN_PRIMARY_BUTTON = "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60";
export const ADMIN_SECONDARY_BUTTON = "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-white/[0.07] px-4 text-[13px] font-medium text-white/75 ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.11] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(ADMIN_CARD, className)}>{children}</div>;
}

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "brand";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        tone === "neutral" && "bg-white/[0.07] text-white/55",
        tone === "success" && "bg-success/10 text-success",
        tone === "warning" && "bg-warning/10 text-warning",
        tone === "danger" && "bg-danger/10 text-danger",
        tone === "info" && "bg-info/10 text-info",
        tone === "brand" && "bg-brand/10 text-brand",
      )}
    >
      {children}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "neutral" | "brand" | "success" | "warning";
}) {
  return (
    <AdminCard className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[12px] text-white/50">
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "neutral" && "bg-white/30",
            tone === "brand" && "bg-brand",
            tone === "success" && "bg-success",
            tone === "warning" && "bg-warning",
          )}
        />
        {label}
      </div>
      <p className="mt-3 font-mono text-[24px] font-bold tabular-nums text-white sm:text-[28px]">{value}</p>
      <p className="mt-1 text-[11px] text-white/38">{note}</p>
    </AdminCard>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[18px] font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-[12px] text-white/45">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
        checked ? "bg-brand" : "bg-white/[0.14]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="py-16 text-center text-[13px] text-white/40">{text}</div>;
}
