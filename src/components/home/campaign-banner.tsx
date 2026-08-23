"use client";

import { useState } from "react";
import Link from "next/link";
import { XIcon } from "@/components/icons";

const COOKIE_NAME = "campaign_banner_closed";
const COOKIE_MAX_AGE = 365 * 24 * 3600; // 1 年

function readClosedCookie() {
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${COOKIE_NAME}=1`));
}

function writeClosedCookie() {
  document.cookie = `${COOKIE_NAME}=1; max-age=${COOKIE_MAX_AGE}; path=/`;
}

export function CampaignBanner() {
  // 懒初始化：仅客户端渲染（ssr:false），关闭后写入 Cookie，不再显示
  const [visible, setVisible] = useState(() => !readClosedCookie());

  const close = () => {
    writeClosedCookie();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-40 flex h-10 shrink-0 items-center justify-center gap-2 bg-[#0a0a0a]/95 px-10 text-[13px] text-white/90 backdrop-blur-sm">
      <span className="truncate">
        <span className="mr-1">🔥</span>
        Seedance 2.5 上线大促，充值积分最高赠送
        <span className="font-semibold text-brand">70%</span>
        <span className="mx-2 text-white/30">｜</span>
        2.0 mini <span className="font-semibold text-brand">4折</span>
        <span className="mx-2 text-white/30">｜</span>
        2.0 fast <span className="font-semibold text-brand">75折</span>
      </span>
      <Link
        href="/pricing?tab=credits"
        className="shrink-0 rounded-full bg-white/[0.1] px-3 py-1 text-[12px] font-medium text-brand ring-1 ring-brand/30 transition-colors hover:bg-white/[0.15]"
      >
        去充值
      </Link>
      <button
        type="button"
        aria-label="关闭通告"
        onClick={close}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
