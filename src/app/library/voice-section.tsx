"use client";

import { useRef, useState } from "react";
import {
  ChevronDownIcon,
  MicrophoneIcon,
  PlayIcon,
  VolumeIcon,
} from "@/components/icons";
import { VOICES, txi, type Voice } from "./data";
import { CloneVoiceDialog } from "./clone-voice-dialog";
import { EmptyState } from "./empty-state";

export function VoiceSection({ searchQuery }: { searchQuery: string }) {
  const [genderFilter, setGenderFilter] = useState("全部性别");
  const [ageFilter, setAgeFilter] = useState("全部年龄");
  const [languageFilter, setLanguageFilter] = useState("全部语言");
  const [cloneOpen, setCloneOpen] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const filteredVoices = VOICES.filter((v) => {
    const matchesSearch = v.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGender =
      genderFilter === "全部性别" || v.gender === genderFilter;
    const matchesAge = ageFilter === "全部年龄" || v.age === ageFilter;
    const matchesLanguage =
      languageFilter === "全部语言" || v.language === languageFilter;
    return matchesSearch && matchesGender && matchesAge && matchesLanguage;
  });

  return (
    <>
      {/* 筛选器 */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <VoiceFilter
          label="性别"
          value={genderFilter}
          options={["全部性别", "男", "女"]}
          onChange={setGenderFilter}
        />
        <VoiceFilter
          label="年龄"
          value={ageFilter}
          options={["全部年龄", "青年", "中年", "老年"]}
          onChange={setAgeFilter}
        />
        <VoiceFilter
          label="语言"
          value={languageFilter}
          options={["全部语言", "中文", "英文", "方言"]}
          onChange={setLanguageFilter}
        />

        <button
          onClick={() => setCloneOpen(true)}
          className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[14px] font-medium text-black transition-opacity hover:opacity-80"
        >
          <MicrophoneIcon className="size-4" />
          克隆音色
        </button>
      </div>

      {/* 音色网格 */}
      {filteredVoices.length === 0 ? (
        <EmptyState type="voice" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isPlaying={playingId === voice.id}
              onPlay={() =>
                setPlayingId(playingId === voice.id ? null : voice.id)
              }
            />
          ))}
        </div>
      )}

      {/* 克隆音色弹框 */}
      {cloneOpen && <CloneVoiceDialog onClose={() => setCloneOpen(false)} />}
    </>
  );
}

function VoiceFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.2] bg-white/[0.1] px-3 text-[14px] text-white transition-colors hover:bg-white/[0.12]"
      >
        {value}
        <ChevronDownIcon className="size-3.5 text-white/60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-white/[0.1] bg-[#1b1b1b] py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={
                opt === value
                  ? "w-full px-3 py-2 text-left text-[13px] text-brand"
                  : "w-full px-3 py-2 text-left text-[13px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
              }
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VoiceCard({
  voice,
  isPlaying,
  onPlay,
}: {
  voice: Voice;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#141414] p-4 ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:ring-white/20">
      <div className="relative mx-auto size-20 overflow-hidden rounded-full ring-2 ring-white/[0.08]">
        <img
          src={txi(voice.imagePrompt)}
          alt={voice.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {isPlaying ? (
            <div className="flex gap-0.5">
              <span className="h-4 w-0.5 animate-pulse bg-brand" />
              <span className="h-6 w-0.5 animate-pulse bg-brand delay-75" />
              <span className="h-3 w-0.5 animate-pulse bg-brand delay-150" />
            </div>
          ) : (
            <PlayIcon className="size-5 text-white" />
          )}
        </button>
      </div>

      <div className="mt-3 text-center">
        <h3 className="text-[15px] font-semibold text-white">{voice.name}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/50">
          {voice.desc}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-white/40">
        <span>{voice.gender}</span>
        <span>·</span>
        <span>{voice.age}</span>
        <span>·</span>
        <span>{voice.language}</span>
      </div>

      <button
        type="button"
        onClick={() => console.log("使用音色", voice.name)}
        className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] text-[13px] font-medium text-white ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.1]"
      >
        <VolumeIcon className="size-3.5" />
        使用音色
      </button>
    </div>
  );
}
