"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon, CrownIcon, CoinsIcon, ChevronRightIcon } from "@/components/icons";

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
}

type Segment = "personal" | "enterprise";

interface Plan {
  id: string;
  meals: string;
  price: number;
  origin: number;
}

const PLANS: Plan[] = [
  { id: "BASE", meals: "+1000 盒饭", price: 88, origin: 133 },
  { id: "STAR", meals: "+3000 盒饭", price: 259, origin: 399 },
  { id: "PRO", meals: "+8000 盒饭", price: 639, origin: 1104 },
  { id: "APEX", meals: "+18000 盒饭", price: 1319, origin: 2394 },
];

export function SubscriptionDialog({ open, onClose }: SubscriptionDialogProps) {
  const [segment, setSegment] = useState<Segment>("personal");
  const [selected, setSelected] = useState<string>("BASE");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sub-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      {/* brand aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute size-[680px] rounded-full bg-[radial-gradient(circle,rgba(240,255,140,0.20),rgba(240,255,140,0.05)_45%,transparent_70%)] blur-2xl"
      />

      <div className="relative w-full max-w-[460px] overflow-hidden rounded-[28px] bg-[#141014] p-7 shadow-[0_30px_80px_-20px_rgba(240,255,140,0.25)] ring-1 ring-white/[0.08]">
        {/* inner top sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(240,255,140,0.10),transparent_70%)]"
        />

        {/* Header */}
        <div className="relative mb-1 flex items-start justify-between">
          <div>
            <h2 id="sub-dialog-title" className="text-[20px] font-bold leading-tight text-white">
              订阅会员，获取最强模型
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/45">
              Seedance 2.0、更多盒饭、去水印、高并发等权益
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="关闭"
          >
            <CloseIcon className="size-[18px]" />
          </button>
        </div>

        {/* Segment */}
        <div className="relative mt-5 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/[0.06]">
            <button
              type="button"
              onClick={() => setSegment("personal")}
              className={cn(
                "rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors",
                segment === "personal"
                  ? "bg-white/[0.12] text-white"
                  : "text-white/45 hover:text-white/70"
              )}
            >
              个人
            </button>
            <button
              type="button"
              onClick={() => setSegment("enterprise")}
              className={cn(
                "relative rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors",
                segment === "enterprise"
                  ? "bg-white/[0.12] text-white"
                  : "text-white/45 hover:text-white/70"
              )}
            >
              企业
              <span className="absolute -right-1 -top-1.5 rounded-full bg-brand px-1.5 py-px text-[9px] font-bold leading-none text-black">
                New
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="relative mt-5 flex flex-col gap-2.5">
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={cn(
                  "group flex items-center justify-between rounded-2xl px-4 py-3.5 text-left transition-all duration-200",
                  active
                    ? "bg-brand/[0.08] ring-1 ring-brand"
                    : "bg-white/[0.03] ring-1 ring-white/[0.07] hover:bg-white/[0.06] hover:ring-white/15"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg ring-1 transition-colors",
                      active
                        ? "bg-brand/15 text-brand ring-brand/40"
                        : "bg-white/[0.04] text-white/40 ring-white/10"
                    )}
                  >
                    <CrownIcon className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-[15px] font-bold tracking-wide transition-colors",
                        active ? "text-brand" : "text-white/85"
                      )}
                    >
                      {plan.id}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[12px] text-white/45">
                      <CoinsIcon className="size-3.5" />
                      {plan.meals}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "text-[13px] font-semibold",
                      active ? "text-brand" : "text-white/80"
                    )}
                  >
                    ¥
                  </span>
                  <span
                    className={cn(
                      "text-[22px] font-extrabold leading-none tabular-nums",
                      active ? "text-white" : "text-white/90"
                    )}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[12px] text-white/40 line-through tabular-nums">
                    {plan.origin}
                  </span>
                  <span className="text-[12px] text-white/40">/月</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="relative mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-white/[0.07] text-[14px] font-medium text-white/80 transition-colors hover:bg-white/[0.12]"
          >
            查看详情
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-brand text-[14px] font-bold text-black shadow-[0_8px_24px_-6px_rgba(240,255,140,0.5)] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            订阅套餐
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        {/* Footer */}
        <p className="relative mt-5 text-center text-[12.5px] text-white/40">
          若您想直接充值盒饭
          <button
            type="button"
            onClick={onClose}
            className="ml-1.5 inline-flex items-center gap-0.5 font-medium text-brand transition-colors hover:brightness-110"
          >
            去充值
            <ChevronRightIcon className="size-3.5" />
          </button>
        </p>
      </div>
    </div>
  );
}
