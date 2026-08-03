"use client";

import { useState } from "react";
import {
  VideoCameraIcon,
  ImageIcon,
  CloseIcon,
  ChevronDownIcon,
  HelpCircleIcon,
} from "@/components/icons";
import { Modal } from "@/components/ui/modal";

type PublishType = "project" | "script";

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PublishDialog({ open, onClose }: PublishDialogProps) {
  const [activeType, setActiveType] = useState<PublishType>("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publicCanvas, setPublicCanvas] = useState(true);

  const canPublish =
    title.trim().length > 0 && description.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledby="publish-dialog-title"
      showCloseButton={false}
      className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] p-6 shadow-2xl ring-1 ring-white/[0.08]"
    >
      {/* Header */}
      <div className="relative mb-6 flex items-center justify-center">
        <h2
          id="publish-dialog-title"
          className="text-[18px] font-bold text-white"
        >
          发布到 bollo tv
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
          aria-label="关闭"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      {/* Type tabs */}
      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveType("project")}
          className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
            activeType === "project"
              ? "bg-white/[0.12] text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          发布项目
        </button>
        <button
          type="button"
          onClick={() => setActiveType("script")}
          className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
            activeType === "script"
              ? "bg-white/[0.12] text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          发布剧本
        </button>
      </div>

      {/* Upload areas */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {/* Upload video */}
        <label className="flex h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] transition-colors hover:border-white/30 hover:bg-white/[0.04]">
          <VideoCameraIcon className="mb-2 size-6 text-white/50" />
          <span className="text-[13px] font-medium text-white/70">
            上传视频 <span className="text-danger">*</span>
          </span>
          <span className="mt-1 text-[11px] text-white/35">
            点击或拖拽上传
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) =>
              console.log("upload video", e.target.files?.[0] ?? null)
            }
          />
        </label>
        {/* Upload cover */}
        <label className="flex h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] transition-colors hover:border-white/30 hover:bg-white/[0.04]">
          <ImageIcon className="mb-2 size-6 text-white/50" />
          <span className="text-[13px] font-medium text-white/70">
            上传封面 <span className="text-danger">*</span>
          </span>
          <span className="mt-1 text-[11px] text-white/35">
            点击或拖拽上传
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              console.log("upload cover", e.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>

      {/* 关联项目 */}
      <div className="mb-4 flex items-center justify-between">
        <label className="text-[14px] font-semibold text-white">
          关联项目 <span className="text-danger">*</span>
        </label>
        <button
          type="button"
          onClick={() => console.log("select project")}
          className="rounded-full bg-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-white/80 transition-colors hover:bg-white/[0.12]"
        >
          + 选择项目
        </button>
      </div>

      {/* 作品名称 */}
      <div className="mb-4">
        <label className="mb-2 block text-[14px] font-semibold text-white">
          作品名称 <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 20))}
            placeholder="请输入作品名称"
            maxLength={20}
            className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none ring-1 ring-white/[0.08] transition-colors focus:ring-white/20"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-white/30">
            {title.length}/20
          </span>
        </div>
      </div>

      {/* 作品描述 */}
      <div className="mb-4">
        <label className="mb-2 block text-[14px] font-semibold text-white">
          作品描述 <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 100))}
            placeholder="请描述您的作品内容"
            maxLength={100}
            rows={4}
            className="w-full resize-none rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none ring-1 ring-white/[0.08] transition-colors focus:ring-white/20"
          />
          <span className="absolute bottom-3 right-4 text-[12px] text-white/30">
            {description.length}/100
          </span>
        </div>
      </div>

      {/* 活动标签 */}
      <div className="mb-4">
        <label className="mb-2 block text-[14px] font-semibold text-white">
          活动标签
        </label>
        <button
          type="button"
          onClick={() => console.log("select activity")}
          className="flex w-full items-center justify-between rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] text-white/30 ring-1 ring-white/[0.08] transition-colors hover:ring-white/20"
        >
          <span>选择进行中的活动</span>
          <ChevronDownIcon className="size-4 text-white/40" />
        </button>
      </div>

      {/* 公开画布 */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-[14px] font-semibold text-white">公开画布</span>
        <button
          type="button"
          onClick={() => setPublicCanvas(!publicCanvas)}
          className={`relative h-[22px] w-[40px] rounded-full transition-colors ${
            publicCanvas ? "bg-danger" : "bg-white/20"
          }`}
          aria-label="公开画布开关"
        >
          <span
            className={`absolute top-[3px] size-[16px] rounded-full bg-white shadow transition-transform ${
              publicCanvas ? "translate-x-[21px]" : "translate-x-[3px]"
            }`}
          />
        </button>
        <HelpCircleIcon className="size-4 text-white/30" />
      </div>

      {/* 发布按钮 */}
      <button
        type="button"
        disabled={!canPublish}
        onClick={() => console.log("publish")}
        className={`w-full rounded-xl py-3.5 text-[15px] font-semibold transition-colors ${
          canPublish
            ? "bg-brand text-black hover:bg-brand-hover"
            : "bg-white/[0.08] text-white/40 cursor-not-allowed"
        }`}
      >
        发布
      </button>

      {/* Footer */}
      <p className="mt-4 text-center text-[12px] text-white/40">
        继续即表示你同意我们的
        <a
          href="https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-white/60"
        >
          创作许可协议
        </a>
        。
      </p>
    </Modal>
  );
}
