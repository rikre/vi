"use client";

import { Modal } from "@/components/ui/modal";
import { SparkleIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const EXTRACT_STEPS = [
  { label: "角色提取", desc: "识别剧本角色设定" },
  { label: "场景提取", desc: "梳理关键场景与环境" },
  { label: "道具提取", desc: "抽取剧情关键道具" },
];

interface ExtractProgressModalProps {
  open: boolean;
  step: number;
}

export function ExtractProgressModal({
  open,
  step,
}: ExtractProgressModalProps) {
  const progress = Math.min(step / EXTRACT_STEPS.length, 1);

  return (
    <Modal
      open={open}
      onClose={() => {}}
      showCloseButton={false}
      labelledby="extract-progress-title"
      className="relative w-[420px] max-w-[90vw] p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <SparkleIcon className="size-5" />
        </div>
        <div>
          <h4
            id="extract-progress-title"
            className="text-[15px] font-semibold text-white"
          >
            正在提取资产
          </h4>
          <p className="text-[12px] text-white/50">
            Agent 正在解析剧本，请稍候...
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {EXTRACT_STEPS.map((s, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-all",
                  done
                    ? "border-brand bg-brand text-black"
                    : active
                      ? "border-brand/60 bg-brand/15 text-brand"
                      : "border-white/10 bg-white/[0.04] text-white/40",
                )}
              >
                {done ? <CheckIcon className="size-3" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[13px] font-medium",
                    done
                      ? "text-white"
                      : active
                        ? "text-brand"
                        : "text-white/50",
                  )}
                >
                  {s.label}
                  {active && (
                    <span className="ml-2 inline-flex gap-0.5 align-middle">
                      <span className="size-1 animate-pulse rounded-full bg-brand" />
                      <span className="size-1 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
                      <span className="size-1 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-white/40">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 进度条 */}
      <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full bg-brand transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </Modal>
  );
}
