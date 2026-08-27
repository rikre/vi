"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/icons";

type State = "idle" | "error" | "success";

// Mock 兑换码：接入真实后端时替换为服务端校验接口
const VALID_CODES: Record<string, number> = {
  BOLLO2026: 500,
  SEEDANCE25: 200,
};

export function RedeemDialog({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [reward, setReward] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    const trimmed = code.trim().toUpperCase();
    const points = VALID_CODES[trimmed];
    if (points) {
      setReward(points);
      setState("success");
    } else {
      setState("error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="兑换码"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] rounded-2xl bg-[#141414] ring-1 ring-white/[0.1]"
      >
        {/* 顶栏 */}
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[15px] font-bold text-white">兑换码</h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="text-white/50 transition-colors hover:text-white"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="px-8 pb-6 pt-8">
          {state === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-[20px] font-bold text-success">
                +
              </span>
              <p className="text-[16px] font-bold text-white">
                兑换成功，{reward} 积分已到账
              </p>
              <p className="text-[12px] text-white/45">可在「账户管理 - 积分明细」查看记录</p>
            </div>
          ) : (
            <>
              <input
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setState("idle");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && code.trim()) submit();
                }}
                placeholder="请输入兑换码"
                className={cn(
                  "w-full rounded-xl bg-black/60 px-4 py-3.5 text-[14px] text-white/90 ring-1 transition-shadow placeholder:text-white/30 focus:outline-none",
                  state === "error"
                    ? "ring-danger/60"
                    : "ring-white/[0.12] focus:ring-brand/50"
                )}
              />
              {state === "error" && (
                <p className="mt-2 text-[12px] text-danger">兑换码无效或已过期</p>
              )}
            </>
          )}

          {/* 操作区 */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/[0.08] px-6 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/[0.14] hover:text-white"
            >
              取消
            </button>
            {state !== "success" && (
              <button
                type="button"
                disabled={!code.trim()}
                onClick={submit}
                className={cn(
                  "rounded-lg px-6 py-2.5 text-[13px] font-bold transition-all",
                  code.trim()
                    ? "bg-brand text-black hover:brightness-105 active:scale-[0.98]"
                    : "cursor-not-allowed bg-white/[0.15] text-white/40"
                )}
              >
                确认兑换
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
