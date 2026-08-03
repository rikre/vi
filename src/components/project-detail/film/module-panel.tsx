"use client";

import type { ShotItem } from "@/lib/mock-projects";
import {
  VideoCameraIcon,
  MicrophoneIcon,
  ScriptIcon,
  CheckIcon,
} from "@/components/icons";

export type FinalModule = "分镜视频" | "配音" | "配字幕";

type ModulePanelProps = {
  module: FinalModule;
  shots: ShotItem[];
  characters: { id: string; name: string; role: string; hasVoice: boolean }[];
  subtitles: string;
  onSubtitlesChange: (text: string) => void;
  onGenerateCurrentShot: () => void;
  isGeneratingCurrentShot: boolean;
};

export function ModulePanel({
  module,
  shots,
  characters,
  subtitles,
  onSubtitlesChange,
  onGenerateCurrentShot,
  isGeneratingCurrentShot,
}: ModulePanelProps) {
  if (module === "分镜视频") {
    return (
      <div className="rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.08] backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="flex items-center gap-2 text-[14px] font-semibold text-white">
              <VideoCameraIcon className="size-4 text-brand" />
              分镜视频
            </h4>
            <p className="mt-1 text-[12px] text-white/50">
              查看当前集的分镜片段，支持逐段生成、编辑和替换。
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerateCurrentShot}
            disabled={isGeneratingCurrentShot}
            className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <VideoCameraIcon className="size-3.5" />
            {isGeneratingCurrentShot ? "生成中..." : "生成当前分镜视频"}
          </button>
        </div>
        <ul className="space-y-2">
          {shots.length === 0 ? (
            <li className="rounded-lg border border-dashed border-white/[0.08] px-3 py-4 text-center text-[12px] text-white/30">
              暂无分镜片段
            </li>
          ) : (
            shots.map((shot) => (
              <li
                key={shot.id}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 ring-1 ring-white/[0.06]"
              >
                <span className="font-mono text-[11px] text-white/40">
                  #{shot.index}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-white/80">
                    {shot.description}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {shot.scene} · {shot.duration}
                  </p>
                </div>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
                    shot.status === "已生成"
                      ? "bg-brand/15 text-brand ring-brand/30"
                      : shot.status === "生成中"
                        ? "bg-warning/15 text-warning ring-warning/30"
                        : shot.status === "失败"
                          ? "bg-danger/15 text-danger ring-danger/30"
                          : "bg-white/[0.06] text-white/40 ring-white/10"
                  }`}
                >
                  {shot.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  if (module === "配音") {
    return (
      <div className="rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.08] backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="flex items-center gap-2 text-[14px] font-semibold text-white">
              <MicrophoneIcon className="size-4 text-brand" />
              配音
            </h4>
            <p className="mt-1 text-[12px] text-white/50">
              为角色对白绑定音色，生成旁白和对白音轨。
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
          >
            <MicrophoneIcon className="size-3.5" />
            进入配音
          </button>
        </div>
        <ul className="space-y-2">
          {characters.length === 0 ? (
            <li className="rounded-lg border border-dashed border-white/[0.08] px-3 py-4 text-center text-[12px] text-white/30">
              暂无角色对白
            </li>
          ) : (
            characters.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 ring-1 ring-white/[0.06]"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">
                  {c.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-white/80">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-white/40">{c.role}</p>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
                    c.hasVoice
                      ? "bg-brand/15 text-brand ring-brand/30"
                      : "bg-warning/15 text-warning ring-warning/30"
                  }`}
                >
                  {c.hasVoice ? (
                    <>
                      <CheckIcon className="size-2.5" />
                      已绑定
                    </>
                  ) : (
                    "未绑定"
                  )}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  // 配字幕
  return (
    <div className="rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.08] backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-[14px] font-semibold text-white">
            <ScriptIcon className="size-4 text-brand" />
            配字幕
          </h4>
          <p className="mt-1 text-[12px] text-white/50">
            编辑字幕文本、时间轴和字幕样式。
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
        >
          <ScriptIcon className="size-3.5" />
          进入配字幕
        </button>
      </div>
      <textarea
        rows={6}
        value={subtitles}
        onChange={(e) => onSubtitlesChange(e.target.value)}
        placeholder="[00:00] 字幕样例..."
        className="w-full resize-none rounded-lg border border-white/[0.08] bg-black p-3 text-[12px] leading-relaxed text-white/80 outline-none transition-colors focus:border-brand/40"
      />
    </div>
  );
}
