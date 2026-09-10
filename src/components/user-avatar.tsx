"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

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
  const { user } = useAuth();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const avatarUrl = user?.avatarUrl;

  if (!avatarUrl || failedUrl === avatarUrl) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex size-full items-center justify-center bg-brand/15 text-[15px] font-bold text-brand select-none",
          className
        )}
      >
        {user?.nickname.slice(0, 1).toUpperCase() || "B"}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={alt}
      loading="lazy"
      onError={() => setFailedUrl(avatarUrl)}
      className={cn("size-full object-cover", className)}
    />
  );
}
