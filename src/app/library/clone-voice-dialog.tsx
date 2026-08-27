"use client";

import { useEffect, useRef, useState } from "react";
import { CoinsIcon, MicrophoneIcon, UploadIcon, CloseIcon } from "@/components/icons";

export function CloneVoiceDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("请选择");
  const [age, setAge] = useState("请选择");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="克隆音色"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#141414] p-8 ring-1 ring-white/[0.08]"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        <h2 className="text-center text-[20px] font-bold text-white">
          克隆音色
        </h2>

        <div className="mt-8 space-y-6">
          {/* 上传音色头像 */}
          <div className="flex items-start gap-4">
            <label className="w-24 shrink-0 pt-3 text-[14px] text-white/80">
              上传音色头像
            </label>
            <label className="flex size-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.04] text-white/50 transition-colors hover:bg-white/[0.06]">
              <UploadIcon className="size-8" />
              <span className="text-[12px]">
                {avatarFile ? avatarFile.name : "上传音色头像"}
              </span>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setAvatarFile(f);
                  console.log("upload voice avatar", f);
                }}
              />
            </label>
          </div>

          {/* 音色名称 */}
          <div className="flex items-center gap-4">
            <label className="w-24 shrink-0 text-[14px] text-white/80">
              音色名称
            </label>
            <div className="relative flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入音色名称"
                maxLength={6}
                className="h-11 w-full rounded-lg border border-white/[0.2] bg-white/[0.05] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/40 focus:border-brand"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-white/40">
                {name.length}/6
              </span>
            </div>
          </div>

          {/* 音色性别 */}
          <div className="flex items-center gap-4">
            <label className="w-24 shrink-0 text-[14px] text-white/80">
              音色性别
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-11 flex-1 appearance-none rounded-lg border border-white/[0.2] bg-white/[0.05] px-4 text-[14px] text-white outline-none transition-colors focus:border-brand"
            >
              <option className="bg-[#1b1b1b]">请选择</option>
              <option className="bg-[#1b1b1b]">男</option>
              <option className="bg-[#1b1b1b]">女</option>
            </select>
          </div>

          {/* 音色年龄 */}
          <div className="flex items-center gap-4">
            <label className="w-24 shrink-0 text-[14px] text-white/80">
              音色年龄
            </label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-11 flex-1 appearance-none rounded-lg border border-white/[0.2] bg-white/[0.05] px-4 text-[14px] text-white outline-none transition-colors focus:border-brand"
            >
              <option className="bg-[#1b1b1b]">请选择</option>
              <option className="bg-[#1b1b1b]">青年</option>
              <option className="bg-[#1b1b1b]">中年</option>
              <option className="bg-[#1b1b1b]">老年</option>
            </select>
          </div>

          {/* 上传音频 */}
          <div className="flex items-start gap-4">
            <label className="w-24 shrink-0 pt-8 text-[14px] text-white/80">
              上传音频
            </label>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.04] px-6 py-8 text-white/50 transition-colors hover:bg-white/[0.06]"
              >
                <UploadIcon className="size-8" />
                <span className="text-[14px] font-medium">上传音频</span>
                <span className="text-[12px]">
                  支持 mp3, wav, m4a 格式，文件大小不超过 30MB，录音时长需在
                  10-300秒之间
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
              />
              <ul className="mt-3 space-y-1 text-[12px] text-white/40">
                <li>1. 请保证上传音频中有且只有一个人声</li>
                <li>2. 尽量保持上传音频的音质和背景干净</li>
                <li>3. 克隆音色情绪会受上传声音影响，请上传想要情绪音色</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => console.log("submit clone voice", { name, gender, age, avatarFile })}
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.1] text-[15px] font-medium text-white ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.14]"
        >
          <MicrophoneIcon className="size-4" />
          克隆音色
          <span className="ml-1 flex items-center gap-1 text-brand">
            <CoinsIcon className="size-3.5" /> 150
          </span>
        </button>
      </div>
    </div>
  );
}
