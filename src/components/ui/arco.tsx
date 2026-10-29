"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type ArcoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "text" | "danger";
  size?: "small" | "default" | "large";
};

export function ArcoButton({
  variant = "secondary",
  size = "default",
  className,
  type = "button",
  ...props
}: ArcoButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "small" && "h-7 px-2.5 text-[12px]",
        size === "default" && "h-8",
        size === "large" && "h-9 px-4 text-[14px]",
        variant === "primary" && "bg-brand text-brand-foreground hover:bg-brand-hover",
        variant === "secondary" && "bg-white/[0.05] text-foreground/80 ring-1 ring-white/[0.12] hover:bg-white/[0.09] hover:text-foreground",
        variant === "text" && "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
        variant === "danger" && "bg-transparent text-danger ring-1 ring-danger/35 hover:bg-danger/10",
        className,
      )}
      {...props}
    />
  );
}

export function ArcoInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-8 min-w-0 rounded-[6px] bg-white/[0.05] px-2.5 text-[13px] text-foreground outline-none ring-1 ring-white/[0.12] transition-colors placeholder:text-muted-foreground/70 hover:ring-white/20 focus:ring-2 focus:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function ArcoSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 rounded-[6px] bg-[#242424] px-2.5 text-[13px] text-foreground outline-none ring-1 ring-white/[0.12] transition-colors hover:ring-white/20 focus:ring-2 focus:ring-brand/60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function ArcoTag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "brand" | "success" | "danger";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium leading-5",
        tone === "neutral" && "bg-white/[0.07] text-muted-foreground",
        tone === "brand" && "bg-brand/12 text-brand",
        tone === "success" && "bg-success/10 text-success",
        tone === "danger" && "bg-danger/10 text-danger",
      )}
    >
      {children}
    </span>
  );
}

export function ArcoTable({
  label,
  minWidth = 720,
  children,
}: {
  label: string;
  minWidth?: number;
  children: ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] text-muted-foreground sm:hidden">左右滑动查看完整表格</p>
      <div
        role="region"
        aria-label={`${label}，可横向滚动`}
        tabIndex={0}
        className="max-w-full overflow-x-auto rounded-lg ring-1 ring-white/[0.08]"
      >
        <table
          aria-label={label}
          className="w-full border-collapse bg-white/[0.02]"
          style={{ minWidth }}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

export function ArcoSwitch({
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
        "relative h-6 w-10 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand" : "bg-white/[0.16]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white transition-all",
          checked ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}
