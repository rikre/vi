"use client";

import type { EpisodeStatus, AssetStatus, ShotCard } from "@/hooks/use-remake-studio";

export function StatusBadge({
  status,
}: {
  status: EpisodeStatus | AssetStatus | ShotCard["status"];
}) {
  let cls = "bg-white/5 text-white/50 ring-1 ring-white/10";
  let dot = "bg-white/40";
  if (status === "已完成" || status === "已生成") {
    cls = "bg-brand/10 text-brand ring-1 ring-brand/20";
    dot = "bg-brand";
  } else if (status === "上传中" || status === "进行中" || status === "生成中") {
    cls = "bg-warning/10 text-warning ring-1 ring-warning/20";
    dot = "bg-warning";
  } else if (status === "失败") {
    cls = "bg-danger/10 text-danger ring-1 ring-danger/20";
    dot = "bg-danger";
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${cls}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
