"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const AVATAR_URL =
  "https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=cute%20anime%20avatar%20mascot%20character%20bollo%20lime%20green%20theme%20simple%20design&image_size=square";

/**
 * 用户头像：远程图片加载失败（如签名过期 301）时回退到品牌色字母占位，避免破图。
 */
export function UserAvatar({
  className,
  alt = "用户头像",
}: {
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex size-full items-center justify-center bg-brand/15 text-[15px] font-bold text-brand select-none",
          className
        )}
      >
        B
      </div>
    );
  }

  return (
    <img
      src={AVATAR_URL}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("size-full object-cover", className)}
    />
  );
}
