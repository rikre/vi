"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { BellIcon, MessageIcon, CrownIcon, ChevronDownIcon } from "@/components/icons";

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
    >
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
        aria-label="活动"
      >
        <BellIcon className="size-[18px]" />
      </button>
      <button
        type="button"
        className="relative flex h-9 items-center gap-1.5 rounded-xl px-3 text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
        aria-label="消息"
      >
        <MessageIcon className="size-[18px]" />
        <span className="text-[13px]">消息</span>
      </button>
      <button
        type="button"
        className="flex h-9 items-center gap-1.5 rounded-xl bg-brand/15 px-3 text-brand transition-colors hover:bg-brand/25"
        aria-label="会员升级"
      >
        <CrownIcon className="size-[16px]" />
        <span className="text-[13px] font-medium">会员升级</span>
      </button>
      <div className="mx-2 h-5 w-px bg-white/10" />
      <Link
        href="/space/new"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/[0.05]"
        aria-label="个人中心"
      >
        <div className="size-7 overflow-hidden rounded-full bg-white/10 ring-2 ring-transparent transition-all hover:ring-brand/30">
          <img
            src="https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=cute%20anime%20avatar%20mascot%20character%20bollo%20lime%20green%20theme%20simple%20design&image_size=square"
            alt="用户头像"
            className="size-full object-cover"
          />
        </div>
        <ChevronDownIcon className="size-3.5 text-white/40" />
      </Link>
    </div>
  );
}
