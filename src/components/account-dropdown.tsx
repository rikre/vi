"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  EditIcon,
  CameraIcon,
  UserIcon,
  CoinsIcon,
  ChevronRightIcon,
  BellIcon,
  GiftIcon,
  CrownIcon,
  UsersIcon,
  LogoutIcon,
} from "@/components/icons";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";

interface AccountDropdownProps {
  open: boolean;
  onClose: () => void;
  placement?: "bottom-right" | "top-center";
  /** 打开账户管理弹框（个人资料 / 积分明细 / 邀请好友） */
  onOpenAccount?: (tab: "profile" | "points" | "invite") => void;
  /** 打开 AI 水印设置子弹框 */
  onOpenWatermark?: () => void;
  /** 打开消息中心 */
  onOpenMessages?: () => void;
  /** 打开邀请活动弹框 */
  onOpenInviteCampaign?: () => void;
  /** 打开团队版弹框 */
  onOpenTeam?: () => void;
}

// 每日签到：与首充同款 useSyncExternalStore 模式，SSR 恒 false 防 hydration error
const SIGN_KEY = "daily_sign_in";
// 会话级兜底：localStorage 不可用（隐私模式）时保证同会话内不重复签到
let memorySign: string | null = null;
// 本地日期（非 toISOString 的 UTC 日期）：UTC 日期在东八区 00:00-08:00
// 会造成「同一天可签两次」的重复签到窗口
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const readSign = () => {
  try {
    return localStorage.getItem(SIGN_KEY) ?? memorySign;
  } catch {
    return memorySign;
  }
};
function subscribeSign(cb: () => void) {
  // storage 事件仅在其他标签页触发，与同标签页自定义事件互补，保证多标签页 UI 同步
  const onStorage = (e: StorageEvent) => {
    if (e.key === SIGN_KEY) cb();
  };
  window.addEventListener("sign-changed", cb);
  window.addEventListener("storage", onStorage);
  // 跨零点主动刷新，避免常驻页面「已签到」状态跨天卡死
  let timer = 0;
  const scheduleMidnight = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    timer = window.setTimeout(() => {
      cb();
      scheduleMidnight();
    }, next.getTime() - now.getTime());
  };
  scheduleMidnight();
  return () => {
    window.removeEventListener("sign-changed", cb);
    window.removeEventListener("storage", onStorage);
    window.clearTimeout(timer);
  };
}
const getSign = () => readSign() === todayStr();
const getSignServer = () => false;

// Mock signed-in user
const USER = {
  name: "bollo 用户",
  tier: "普通用户",
  points: 2580,
};

function Row({
  Icon,
  title,
  right,
  badge,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  right?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/[0.06] transition-colors group-hover:text-white">
        <Icon className="size-[18px]" />
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-[13.5px] font-semibold text-white/90">{title}</span>
        {badge}
      </span>
      {right}
      <ChevronRightIcon className="size-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/50" />
    </button>
  );
}

export function AccountDropdown({
  open,
  onClose,
  placement = "bottom-right",
  onOpenAccount,
  onOpenWatermark,
  onOpenMessages,
  onOpenInviteCampaign,
  onOpenTeam,
}: AccountDropdownProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const signedToday = useSyncExternalStore(subscribeSign, getSign, getSignServer);

  const isMember = USER.tier !== "普通用户";

  const openAccount = (tab: "profile" | "points" | "invite") => {
    onClose();
    onOpenAccount?.(tab);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 签到：会员每日 +20 积分；非会员点击引导至会员订阅
  // 去重以 localStorage 实时读取为准（state 可能因双击/多标签页竞态而过期）。
  // 注意：跨浏览器/跨设备去重客户端无法保证，接入真实后端时将此函数
  // 整体替换为服务端账户维度的原子 claim 接口，客户端仅作乐观缓存。
  const handleSign = () => {
    if (!isMember) {
      onClose();
      router.push("/pricing?tab=membership");
      return;
    }
    if (readSign() === todayStr()) return;
    memorySign = todayStr();
    try {
      localStorage.setItem(SIGN_KEY, todayStr());
    } catch {
      // 隐私模式等写入失败：会话级兜底已生效，不阻断交互
    }
    window.dispatchEvent(new Event("sign-changed"));
  };

  return (
    <>
      {/* click-away layer */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        role="dialog"
        aria-label="账户菜单"
        className={cn(
          // 宽度上限 320px，窄屏（<336px）按视口收缩，防止右侧溢出
          "absolute z-50 w-[min(320px,calc(100vw-16px))] transition duration-200",
          placement === "bottom-right" && "right-0 top-full mt-2 origin-top-right",
          placement === "top-center" && "bottom-full left-0 mb-2 origin-bottom-left",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-[0.98] opacity-0"
        )}
      >
        <div className="max-h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-2xl bg-[#141414] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.08]">
          {/* 身份头部：头像 + 昵称 + 等级 */}
          <div className="relative overflow-hidden px-4 pb-3 pt-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-brand/[0.07] blur-2xl"
            />
            <div className="relative flex items-center gap-3">
              <div className="relative size-11 shrink-0">
                <div className="size-11 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
                  <UserAvatar />
                </div>
                <button
                  type="button"
                  aria-label="更换头像"
                  onClick={() => console.log("更换头像")}
                  className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#1c1c1c] text-white/70 ring-1 ring-white/15 transition-colors hover:text-white"
                >
                  <CameraIcon className="size-3" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-bold text-white">{USER.name}</span>
                  <button
                    type="button"
                    aria-label="编辑资料"
                    onClick={() => openAccount("profile")}
                    className="flex size-5 shrink-0 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                  >
                    <EditIcon className="size-3.5" />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium",
                      isMember ? "bg-brand/15 text-brand" : "bg-white/[0.07] text-white/65"
                    )}
                  >
                    {USER.tier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 积分余额：单行紧凑展示（点击进积分明细） */}
          <div className="px-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.08]">
              <button
                type="button"
                onClick={() => openAccount("points")}
                className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
              >
                <CoinsIcon className="size-4 shrink-0 text-brand" />
                <span className="flex-1 truncate text-[13px] font-semibold text-white">
                  {USER.points.toLocaleString()} 积分
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-white/30" />
              </button>
              {/* 每日签到：紧凑按钮 */}
              <button
                type="button"
                onClick={handleSign}
                disabled={signedToday}
                className={cn(
                  "mr-2 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-transform active:scale-95",
                  signedToday
                    ? "cursor-default bg-white/[0.08] text-white/40"
                    : "bg-brand text-black hover:brightness-105"
                )}
              >
                <CoinsIcon className="size-3" />
                {signedToday ? "已签到" : "+20"}
              </button>
            </div>
          </div>

          {/* 邀请活动：品牌渐变胶囊入口 */}
          <div className="px-3 pt-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInviteCampaign?.();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-[#ffb03d] py-2.5 text-[13px] font-bold text-black transition-all hover:brightness-105 active:scale-[0.98]"
            >
              <GiftIcon className="size-4" />
              邀请好友赚积分
              <span className="rounded-full bg-black/15 px-1.5 py-px text-[10px] font-bold">
                +200
              </span>
            </button>
          </div>

          {/* 核心菜单 */}
          <div className="px-3 pt-3">
            <div className="overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="divide-y divide-white/[0.05]">
                <Row
                  Icon={UserIcon}
                  title="个人中心与作品"
                  onClick={() => openAccount("profile")}
                />
                <Row
                  Icon={BellIcon}
                  title="消息中心"
                  badge={
                    <span className="flex items-center gap-1 rounded bg-[#ff2d6b]/15 px-1.5 py-px text-[10px] font-bold text-[#ff5c8a]">
                      <span className="size-1.5 animate-pulse rounded-full bg-[#ff2d6b]" />
                      3
                    </span>
                  }
                  onClick={() => {
                    onClose();
                    onOpenMessages?.();
                  }}
                />
                <Row
                  Icon={CrownIcon}
                  title="团队版"
                  right={
                    <span className="rounded bg-brand/15 px-1.5 py-px text-[10px] font-bold text-brand">
                      开通解锁
                    </span>
                  }
                  onClick={() => {
                    onClose();
                    onOpenTeam?.();
                  }}
                />
                <Row
                  Icon={UsersIcon}
                  title="超创合伙人"
                  right={
                    <span className="rounded bg-[#d8a8ff]/15 px-1.5 py-px text-[10px] font-bold text-[#e0b7ff]">
                      合作计划
                    </span>
                  }
                  onClick={() => {
                    onClose();
                    router.push("/partner");
                  }}
                />
                <Row
                  Icon={EditIcon}
                  title="AI 水印"
                  onClick={() => {
                    onClose();
                    onOpenWatermark?.();
                  }}
                />
              </div>
            </div>
          </div>

          {/* 退出登录 */}
          <div className="px-3 pb-3 pt-3">
            <div className="overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-danger/80 ring-1 ring-white/[0.06]">
                  <LogoutIcon className="size-[18px]" />
                </span>
                <span className="text-[13.5px] font-semibold text-danger/90">退出登录</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
