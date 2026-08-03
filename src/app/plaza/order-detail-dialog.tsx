"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Order } from "./order-card";

export function OrderDetailDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  if (!order) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="接单详情"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] p-6"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-white">{order.title}</h2>
            <div className="mt-2 flex gap-2">
              {order.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/40">预估收益</div>
            <div className="text-[20px] font-bold text-[#00e5c8]">
              {order.income}
              <span className="text-[12px] font-normal text-white/50">
                {" "}
                /部
              </span>
            </div>
            <div className="mt-1 text-[11px] text-white/60">{order.model}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-3 rounded-xl bg-white/[0.03] p-4">
          <div>
            <div className="text-[11px] text-white/40">单位时长</div>
            <div className="mt-1 text-[13px] font-semibold text-white">
              {order.perMin}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">交付总量</div>
            <div className="mt-1 text-[13px] font-semibold text-white">
              {order.total}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">交付周期</div>
            <div className="mt-1 text-[13px] font-semibold text-white">
              {order.cycle}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">题材地区</div>
            <div className="mt-1 text-[13px] font-semibold text-white">
              {order.region}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">当前状态</div>
            <div className="mt-1 text-[13px] font-semibold text-[#00e5c8]">
              ●{" "}
              {order.status === "open"
                ? "可申请"
                : order.status === "full"
                  ? "名额已满"
                  : "暂不可申请"}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-white">
              <span className="h-3 w-1 rounded-full bg-[#00e5c8]" />
              剧本简介
            </h3>
            <button
              type="button"
              onClick={() => console.log("preview script")}
              className="rounded-lg bg-[#00e5c8]/15 px-3 py-1 text-[11px] font-semibold text-[#7dffe6]"
            >
              试读剧本
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-white/60">
            {order.synopsis}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/[0.03] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-white">
              <span className="flex size-5 items-center justify-center rounded-md bg-[#00e5c8]/15 text-[10px] font-bold text-[#7dffe6]">
                01
              </span>
              项目简介
            </h3>
            <p className="text-[12px] leading-relaxed text-white/55">
              平台精选优质剧本资源，为制作方提供稳定制作机会。制作方无需自行寻找剧本，只需按照项目要求完成短剧制作，经平台验收通过后即可获得保底制作收益。适合具备成熟短剧制作能力的团队参与。
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-white">
              <span className="flex size-5 items-center justify-center rounded-md bg-[#00e5c8]/15 text-[10px] font-bold text-[#7dffe6]">
                02
              </span>
              审核和结算
            </h3>
            <p className="text-[12px] leading-relaxed text-white/55">
              项目采用保底制作费用结算模式。制作方完成约定内容制作并通过平台验收后，平台按照双方确认的保底单价及实际交付有效分钟数进行费用结算。结算金额
              = 实际验收通过的成片分钟数 × 保底单价。
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={order.status !== "open"}
            onClick={() => console.log("apply order")}
            className={cn(
              "rounded-xl px-6 py-2.5 text-[14px] font-semibold transition-colors",
              order.status === "open"
                ? "bg-brand text-black hover:bg-[#e6ff4d]"
                : "bg-white/[0.06] text-white/35",
            )}
          >
            {order.status === "open"
              ? "立即申请"
              : order.status === "full"
                ? "名额已满"
                : "暂不可申请"}
          </button>
        </div>
      </div>
    </div>
  );
}
