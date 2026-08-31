"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CoinsIcon, CrownIcon } from "@/components/icons";
import { yearlyDiscountLabel } from "@/app/pricing/data";
import { AgentDockTrigger } from "./agent-dock";

type TopBarProps = {
  className?: string;
  onToggleAgent?: () => void;
  agentOpen?: boolean;
};

export function TopBar({ className, onToggleAgent, agentOpen }: TopBarProps) {
  const pathname = usePathname();
  // 定价页自身已有完整充值/订阅入口，顶栏不再重复展示
  const showPricingEntry = pathname !== "/pricing";

  return (
    <div
      className={cn(
        "flex h-14 shrink-0 items-center justify-end gap-2 px-6",
        className
      )}
    >
      {showPricingEntry && (
        <>
          <Link
            href="/pricing#recharge"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold text-white/70 ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <CoinsIcon className="size-4 text-brand" />
            积分充值
          </Link>
          <Link
            href="/pricing#membership"
            className="relative flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-brand-foreground shadow-[0_8px_24px_-10px_rgba(200,255,113,0.5)] transition-all hover:brightness-110 active:scale-[0.97]"
          >
            <span
              aria-hidden
              className="absolute -top-2 right-2 rounded-full bg-black px-1.5 py-px text-[9px] font-bold text-brand ring-1 ring-brand/30"
            >
              {yearlyDiscountLabel()}
            </span>
            <CrownIcon className="size-4" />
            会员订阅
          </Link>
        </>
      )}
      {onToggleAgent && (
        <AgentDockTrigger
          onClick={onToggleAgent}
          active={!!agentOpen}
        />
      )}
    </div>
  );
}
