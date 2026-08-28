"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronRightIcon, CrownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

export type CheckoutOrder = {
  title: string;
  subtitle: string;
  amount: number;
  benefits: string[];
  purchaseNotes?: string[];
  cta: string;
  onSuccessNote?: string;
  /** 支付成功后的二次转化 CTA（如首充→升级年费会员） */
  successCta?: { label: string; onClick: () => void };
};

type Step = "confirm" | "paying" | "success";

const PAY_METHODS = ["微信支付", "支付宝", "余额支付"];

export function CheckoutDialog({
  order,
  onClose,
  onSuccess,
}: {
  order: CheckoutOrder;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<Step>("confirm");
  const [method, setMethod] = useState(PAY_METHODS[0]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (step !== "paying") onClose();
  };

  // 模拟支付网关
  const pay = () => {
    setStep("paying");
    timerRef.current = setTimeout(() => {
      setStep("success");
      onSuccess();
    }, 1200);
  };

  return (
    <Modal
      open
      onClose={handleClose}
      title="收银台"
      showCloseButton={step !== "paying"}
      className="w-full max-w-[420px] p-6"
    >
        {step === "confirm" && (
          <>
            <h3 className="text-[18px] font-bold text-white">订单确认</h3>
            <div className="mt-4 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
              <p className="text-[15px] font-semibold text-white">
                {order.title}
              </p>
              <p className="mt-1 text-[12px] text-white/50">{order.subtitle}</p>
              <ul className="mt-3 space-y-1 text-[13px] text-white/70">
                {order.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <CheckIcon className="size-3.5 text-brand" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-white/[0.08] pt-3 text-[13px] text-white/60">
                应付金额
                <span className="ml-2 text-[24px] font-bold text-brand">
                  ¥{order.amount}
                </span>
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.06]">
              <p className="text-[12px] font-semibold text-white/80">购买说明</p>
              <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-white/50">
                {(order.purchaseNotes ?? [
                  "权益购买后即时生效，虚拟数字商品不支持无理由退款或转让。",
                  "如需开具发票，请联系客服申请，仅支持团队版订单。",
                ]).map((note) => (
                  <li key={note} className="flex gap-1.5">
                    <span aria-hidden className="mt-1 size-1 shrink-0 rounded-full bg-brand/70" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-[12px] text-white/50">支付方式</p>
            <div className="mt-2 flex gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "min-h-11 flex-1 rounded-lg px-2 py-2 text-[13px] font-medium ring-1 transition-colors",
                    method === m
                      ? "bg-white/[0.08] text-white ring-brand/40"
                      : "text-white/60 ring-white/[0.08] hover:text-white",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={pay}
              className="mt-5 min-h-11 w-full rounded-lg bg-brand px-4 py-2.5 text-[15px] font-semibold text-black transition-opacity hover:opacity-90"
            >
              {order.cta}
            </button>
          </>
        )}

        {step === "paying" && (
          <div className="flex flex-col items-center py-10">
            <div className="size-10 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
            <p className="mt-4 text-[14px] text-white/70">
              正在通过{method}支付…
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-brand/15">
              <CheckIcon className="size-7 text-brand" />
            </div>
            <h3 className="mt-4 text-[18px] font-bold text-white">支付成功</h3>
            <p className="mt-2 text-[13px] text-white/60">
              {order.onSuccessNote ?? "权益已即时生效，积分已到账"}
            </p>
            {order.successCta && (
              <button
                type="button"
                onClick={order.successCta.onClick}
                className="mt-4 flex items-center gap-1.5 rounded-full bg-brand/15 px-4 py-2 text-[13px] font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/25"
              >
                <CrownIcon className="size-4" />
                {order.successCta.label}
                <ChevronRightIcon className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-11 w-full rounded-lg bg-white py-2.5 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
            >
              完成
            </button>
          </div>
        )}
    </Modal>
  );
}
