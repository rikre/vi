"use client";

import { cn } from "@/lib/utils";

type TopBarProps = {
  className?: string;
};

export function TopBar({ className }: TopBarProps) {
  return (
    <div
      className={cn(
        "flex h-14 shrink-0 items-center justify-end gap-1 px-6",
        className
      )}
    />
  );
}
