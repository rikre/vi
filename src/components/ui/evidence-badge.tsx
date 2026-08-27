"use client";

import { cn } from "@/lib/utils";
import { getEvidenceMeta } from "@/lib/reference-store";
import type { EvidenceType } from "@/types/project";

export function EvidenceBadge({
  type,
  className,
}: {
  type: EvidenceType;
  className?: string;
}) {
  const meta = getEvidenceMeta(type);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
        meta.color,
        className
      )}
      title={meta.label}
    >
      <span className="size-1 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  );
}
