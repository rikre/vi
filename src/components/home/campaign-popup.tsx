"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { XIcon } from "@/components/icons";
import { txi } from "@/app/library/data";

const STORAGE_KEY = "campaign_popup_shown_date";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function CampaignPopup() {
  // 懒初始化：仅客户端渲染（ssr:false），每日 1 次频控
  const [open, setOpen] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== today(),
  );
  const [page, setPage] = useState(0);

  // effect 只负责写外部标记，不调用 setState
  useEffect(() => {
    if (open) localStorage.setItem(STORAGE_KEY, today());
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="活动弹窗"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[680px] overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.1]"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <XIcon className="size-4" />
        </button>

        {/* P1：模型特价卡 */}
        {page === 0 && (
          <div className="flex">
            <img
              src={txi(
                "dramatic ocean waves at sunset, person standing on shore with dog, cinematic 1080p film still",
                "portrait_4_3",
              )}
              alt="Seedance 2.5 1080p"
              className="w-[240px] shrink-0 object-cover"
            />
            <div className="flex-1 p-6">
              <p className="text-[12px] text-white/50">
                活动时间：2026.8.14 14:00 - 9.17 14:00
              </p>
              <h3 className="mt-2 text-[24px] font-bold text-white">
                Seedance 2.5 1080p
              </h3>
              <ul className="mt-3 space-y-1.5 text-[13px] text-white/80">
                <li>
                  ✓ 原生<span className="text-brand">1080p</span>搭载
                  <span className="text-brand">10bit</span>色彩
                </li>
                <li>✓ 完美适配高预算精致影级拍摄手法</li>
                <li>✓ 光影效果逼真高还原</li>
              </ul>
              <div className="mt-4 space-y-1.5 border-t border-white/[0.08] pt-3 text-[13px]">
                <p className="text-white/80">
                  无参考视频 积分{" "}
                  <span className="text-[18px] font-bold text-brand">83/s</span>
                  <span className="ml-2 text-white/40 line-through">
                    原价 115
                  </span>
                </p>
                <p className="text-white/80">
                  有参考视频 积分{" "}
                  <span className="text-[18px] font-bold text-brand">54/s</span>
                  <span className="ml-2 text-white/40 line-through">
                    原价 75
                  </span>
                </p>
              </div>
              <Link
                href="/pricing?tab=credits"
                className="mt-5 block rounded-lg bg-gradient-to-r from-[#00e5c8] to-[#7dff8c] py-2.5 text-center text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
              >
                Seedance 2.5 1080p 限时72折
              </Link>
            </div>
          </div>
        )}

        {/* P2：充值加赠卡 */}
        {page === 1 && (
          <div className="relative">
            <img
              src={txi(
                "young woman reading newspaper outdoors, sunglasses on head, blue sky, bright cheerful lifestyle photo",
                "landscape_4_3",
              )}
              alt="Seedance 2.5 首发上线"
              className="h-[320px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/60 to-transparent pt-8 text-center">
              <h3 className="text-[40px] font-bold text-[#22c3dd]">
                Seedance 2.5
              </h3>
              <span className="mt-1 inline-block rounded-full border border-[#22c3dd] px-4 py-1 text-[14px] text-[#22c3dd]">
                首发上线
              </span>
              <p className="mt-3 text-[15px] font-medium text-black/80">
                Seedance 2.0 mini <span className="font-bold text-[#22c3dd]">4折</span>
                <span className="mx-2 text-black/30">｜</span>
                Seedance 2.0 fast <span className="font-bold text-[#22c3dd]">75折</span>
              </p>
              <p className="mt-1 text-[16px] font-semibold text-black/90">
                充值最高加赠<span className="text-[#22c3dd]">70%</span>
              </p>
              <Link
                href="/pricing"
                className="mx-auto mt-4 block w-[200px] rounded-lg bg-gradient-to-r from-[#00e5c8] to-[#7dff8c] py-2.5 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
              >
                立即充值
              </Link>
            </div>
          </div>
        )}

        {/* 轮播指示器 */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {[0, 1].map((i) => (
            <button
              key={i}
              aria-label={`第${i + 1}页`}
              onClick={() => setPage(i)}
              className={
                page === i
                  ? "size-2 rounded-full bg-white"
                  : "size-2 rounded-full bg-white/30 transition-colors hover:bg-white/60"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
