"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  EditIcon,
  CameraIcon,
  UserIcon,
  SettingsIcon,
  CrownIcon,
  CoinsIcon,
  GiftIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  MessageSquareIcon,
  InfoIcon,
  UserGroupIcon,
  HeartIcon,
  DocumentIcon,
  SparkleIcon,
  CloseIcon,
} from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const STATS = [
  { label: "作品", value: 12, Icon: DocumentIcon },
  { label: "技能", value: 48, Icon: SparkleIcon },
  { label: "资产", value: 128, Icon: HeartIcon },
];

const MENU = [
  { Icon: UserIcon, title: "个人资料", onClick: () => console.log("个人资料") },
  { Icon: SettingsIcon, title: "账号设置", onClick: () => console.log("账号设置") },
];

const SUPPORT = [
  { Icon: HelpCircleIcon, title: "帮助中心", onClick: () => console.log("帮助中心") },
  { Icon: MessageSquareIcon, title: "意见反馈", onClick: () => console.log("意见反馈") },
  { Icon: InfoIcon, title: "关于 bollo", onClick: () => console.log("关于 bollo") },
];

const USER = {
  name: "bollo 用户",
  id: "10086420",
  tier: "普通用户",
  points: 2580,
  team: { name: "星河短剧工作室", role: "管理员" } as { name: string; role: string } | null,
};

function Row({
  Icon,
  title,
  sub,
  right,
  badge,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-[11px] text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/[0.06] transition-colors group-hover:text-white">
        <Icon className="size-[18px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-white/90">{title}</span>
          {badge}
        </span>
        {sub && <span className="mt-0.5 block text-[11.5px] text-white/40">{sub}</span>}
      </span>
      {right}
      <ChevronRightIcon className="size-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/50" />
    </button>
  );
}

export function AccountDrawer({ open, onClose, onUpgrade }: AccountDrawerProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const isTeam = !!USER.team;

  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-drawer-title"
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-[400px] bg-[#141414] shadow-[0_0_60px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 id="account-drawer-title" className="text-[16px] font-semibold text-white">个人中心</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <div className="h-[calc(100%-61px)] overflow-y-auto">
          {/* Identity header */}
          <div className="relative overflow-hidden px-5 pb-5 pt-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-brand/[0.07] blur-2xl"
            />
            <div className="relative flex items-start gap-4">
              <div className="relative size-16 shrink-0">
                <div className="size-16 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <UserAvatar />
                </div>
                <button
                  type="button"
                  aria-label="更换头像"
                  onClick={() => console.log("更换头像")}
                  className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-[#1c1c1c] text-white/70 ring-1 ring-white/15 transition-colors hover:text-white"
                >
                  <CameraIcon className="size-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[17px] font-bold text-white">{USER.name}</span>
                  <button
                    type="button"
                    aria-label="编辑资料"
                    onClick={() => { console.log("edit profile"); onClose(); }}
                    className="flex size-5 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                  >
                    <EditIcon className="size-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-[12px] tabular-nums text-white/40">ID: {USER.id}</div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[11px] font-medium text-white/65">
                    {USER.tier}
                  </span>
                  {isTeam && (
                    <span className="flex items-center gap-1 rounded-md bg-[#00e5c8]/12 px-2 py-0.5 text-[11px] font-semibold text-[#7dffe6] ring-1 ring-[#00e5c8]/25">
                      <UserGroupIcon className="size-3" />
                      {USER.team!.name}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { console.log("升级会员"); onUpgrade(); }}
                    className="flex items-center gap-1 rounded-md bg-brand px-2 py-0.5 text-[11px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
                  >
                    <CrownIcon className="size-3" />
                    升级会员
                    <ChevronRightIcon className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-5 mb-4 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.06]">
            {STATS.map(({ label, value, Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <Icon className="size-4 text-white/30" />
                <span className="mt-1 text-[17px] font-bold tabular-nums text-white">{value}</span>
                <span className="text-[11px] text-white/40">{label}</span>
              </div>
            ))}
          </div>

          {/* Points bar */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand/[0.10] to-brand/[0.02] px-4 py-3 ring-1 ring-brand/15">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                <CoinsIcon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-white/45">可用积分</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-extrabold tabular-nums text-white">{USER.points.toLocaleString()}</span>
                  <span className="text-[12px] text-white/40">积分</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => console.log("消费记录")}
                className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
              >
                消费记录
              </button>
              <button
                type="button"
                onClick={() => console.log("立即充值")}
                className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
              >
                立即充值
              </button>
            </div>
          </div>

          {/* Primary menu */}
          <div className="px-5 pb-3">
            <div className="overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="divide-y divide-white/[0.05]">
                {MENU.map((m) => (
                  <Row key={m.title} {...m} />
                ))}
                <Row
                  Icon={CrownIcon}
                  title="会员中心"
                  badge={
                    <span className="rounded bg-[#ff2d6b]/15 px-1.5 py-px text-[10px] font-bold text-[#ff5c8a]">
                      首月5折
                    </span>
                  }
                  onClick={onUpgrade}
                />
                <Row
                  Icon={UserGroupIcon}
                  title="团队管理"
                  badge={
                    isTeam ? (
                      <span className="flex items-center gap-1 rounded bg-[#00e5c8]/12 px-1.5 py-px text-[10px] font-bold text-[#7dffe6]">
                        <UserGroupIcon className="size-2.5" />
                        团队版
                      </span>
                    ) : undefined
                  }
                  onClick={() => console.log("团队管理")}
                />
                <Row
                  Icon={CoinsIcon}
                  title="我的积分"
                  right={<span className="text-[13px] font-bold tabular-nums text-brand">{USER.points.toLocaleString()}</span>}
                  onClick={() => console.log("我的积分")}
                />
                <Row
                  Icon={GiftIcon}
                  title="邀请好友"
                  onClick={() => console.log("邀请好友")}
                />
              </div>
            </div>
          </div>

          {/* Support menu */}
          <div className="px-5 pb-6">
            <div className="overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="divide-y divide-white/[0.05]">
                {SUPPORT.map((s) => (
                  <Row key={s.title} {...s} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
