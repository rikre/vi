"use client";

import dynamic from "next/dynamic";
import { CampaignBanner } from "./campaign-banner";
import { CampaignPopup } from "./campaign-popup";

// 依赖 Cookie / localStorage，仅客户端渲染，避免 SSR 访问浏览器 API
const BannerNoSSR = dynamic(async () => ({ default: CampaignBanner }), {
  ssr: false,
});
const PopupNoSSR = dynamic(async () => ({ default: CampaignPopup }), {
  ssr: false,
});

export function CampaignLayer() {
  return (
    <>
      <BannerNoSSR />
      <PopupNoSSR />
    </>
  );
}
