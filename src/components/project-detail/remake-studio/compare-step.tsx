"use client";

import {
  ChevronDownIcon,
  DownloadIcon,
  PlayIcon,
  ScissorsIcon,
  Volume2Icon,
  VolumeXIcon,
} from "@/components/icons";
import {
  EXPORT_FORMATS,
  txi,
  type ExportFormat,
} from "@/hooks/use-remake-studio";
import { CompareTimeline } from "./compare-timeline";

interface CompareStepProps {
  activeEpisode: number;
  onEpisodeChange: (ep: number) => void;
  compareSource: boolean;
  onCompareSourceChange: (v: boolean) => void;
  syncTimeline: boolean;
  onSyncTimelineChange: (v: boolean) => void;
  exportFormat: ExportFormat;
  onExportFormatChange: (f: ExportFormat) => void;
  downloading: boolean;
  onDownload: () => void;
}

function PlayerCard({
  variant,
  src,
  duration,
  muted,
}: {
  variant: "source" | "output";
  src: string;
  duration: string;
  muted: boolean;
}) {
  const isOutput = variant === "output";
  return (
    <div
      className={`rounded-2xl backdrop-blur-sm p-4 ${
        isOutput
          ? "bg-brand/[0.02] ring-1 ring-brand/20"
          : "bg-[#141414] ring-1 ring-white/[0.06]"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
            isOutput
              ? "bg-brand text-brand-foreground"
              : "bg-white/[0.06] text-white/70"
          }`}
        >
          {isOutput ? "新" : "原"}
        </span>
        <span
          className={`text-[13px] font-medium ${
            isOutput ? "text-white" : "text-white/80"
          }`}
        >
          {isOutput ? "成片" : "原片"}
        </span>
      </div>
      <div
        className={`relative aspect-video overflow-hidden rounded-lg bg-black ${
          isOutput ? "ring-1 ring-brand/20" : "ring-1 ring-white/[0.06]"
        }`}
      >
        <img
          src={src}
          alt={isOutput ? "成片" : "原片"}
          loading="lazy"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-full bg-brand/90 text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:scale-110"
            aria-label={isOutput ? "播放成片" : "播放原片"}
          >
            <PlayIcon className="size-5" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          {muted ? (
            <VolumeXIcon className="size-3.5 text-white/60" />
          ) : (
            <Volume2Icon className="size-3.5 text-brand" />
          )}
          <span
            className={`text-[11px] ${isOutput ? "text-white/80" : "text-white/70"}`}
          >
            00:04 / {duration}
          </span>
          <div className="relative ml-2 h-1 flex-1 rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-brand" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompareStep({
  activeEpisode,
  onEpisodeChange,
  compareSource,
  onCompareSourceChange,
  syncTimeline,
  onSyncTimelineChange,
  exportFormat,
  onExportFormatChange,
  downloading,
  onDownload,
}: CompareStepProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* 顶部：集数导航 */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06] backdrop-blur-md">
          {[1, 2, 3].map((ep) => (
            <button
              key={ep}
              type="button"
              onClick={() => onEpisodeChange(ep)}
              aria-pressed={activeEpisode === ep}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
                activeEpisode === ep
                  ? "bg-brand text-brand-foreground"
                  : "text-white/60 hover:text-white"
              }`}
            >
              第 {ep} 集
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 text-[12px] text-white/60">
          <button
            type="button"
            role="switch"
            aria-checked={compareSource}
            onClick={() => onCompareSourceChange(!compareSource)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              compareSource ? "bg-brand" : "bg-white/[0.1]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                compareSource ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          对比原视频
        </label>
      </div>

      {/* 双播放器对比 */}
      <div
        className={`grid gap-4 ${compareSource ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {compareSource && (
          <PlayerCard
            variant="source"
            src={txi("hospital drama original frame, asian cast", "landscape_16_9")}
            duration="03:28"
            muted
          />
        )}
        <PlayerCard
          variant="output"
          src={txi(
            "hospital drama remake frame, western cast, cinematic",
            "landscape_16_9",
          )}
          duration="03:34"
          muted={false}
        />
      </div>

      {/* 同步时间轴开关 + 时间轴 */}
      <CompareTimeline
        syncTimeline={syncTimeline}
        onSyncTimelineChange={onSyncTimelineChange}
      />

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between rounded-2xl bg-[#1b1b1b]/90 ring-1 ring-white/10 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <ScissorsIcon className="size-3.5" />
            导剪辑映
          </button>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              {exportFormat}
              <ChevronDownIcon className="size-3" />
            </button>
            <select
              value={exportFormat}
              onChange={(e) =>
                onExportFormatChange(e.target.value as ExportFormat)
              }
              className="sr-only"
              aria-label="导出格式"
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className={`inline-flex items-center gap-1.5 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-5 py-2 text-[13px] font-semibold transition-colors hover:bg-brand-hover ${
              downloading ? "cursor-wait opacity-70" : ""
            }`}
          >
            <DownloadIcon className="size-4" />
            {downloading ? "导出中..." : "下载视频"}
          </button>
        </div>
      </div>
    </div>
  );
}
