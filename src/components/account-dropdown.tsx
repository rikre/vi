"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  EditIcon,
  CreditsIcon,
  ChevronRightIcon,
  BellIcon,
  GiftIcon,
  UsersIcon,
  StarIcon,
  LogoutIcon,
  BuildingIcon,
} from "@/components/icons";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { normalizeAdminRoles } from "@/lib/admin/rbac";

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


function Row({
  Icon,
  title,
  right,
  badge,
  onClick,
  danger = false,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  right?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-left transition-colors hover:bg-white/[0.05] active:bg-white/[0.07]",
        danger ? "text-danger" : "text-foreground/85"
      )}
    >
      <Icon
        strokeWidth={1.8}
        className={cn(
          "size-4 shrink-0",
          danger ? "text-danger" : "text-muted-foreground transition-colors group-hover:text-foreground"
        )}
      />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-[13px] font-medium">{title}</span>
        {badge}
      </span>
      {right}
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
  const { logout, user } = useAuth();
  const USER = {
    name: user?.nickname ?? "未登录",
    tier: user?.tier ?? "普通用户",
    points: user?.credits ?? 0,
  };
  const isAdmin = normalizeAdminRoles(user?.roles ?? []).length > 0;
  const signedToday = useSyncExternalStore(subscribeSign, getSign, getSignServer);

  const isMember = !!user && !["普通用户", "free"].includes(user.tier);

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
        aria-hidden={!open}
        inert={!open}
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
        <div className="max-h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-2xl bg-surface-elevated p-2 ring-1 ring-white/10">
          {/* 身份头部：头像 + 昵称 + 个人主页入口 */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-10 shrink-0 overflow-hidden rounded-full bg-white/10">
              <UserAvatar />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold text-white">
                {USER.name}
              </span>
              <span
                className={cn(
                  "mt-1 inline-block rounded px-1.5 py-px text-[11px] font-medium",
                  isMember ? "bg-brand/15 text-brand" : "bg-white/[0.07] text-white/60"
                )}
              >
                {USER.tier}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAccount("profile")}
              className="flex shrink-0 items-center gap-0.5 text-[12px] text-foreground/75 transition-colors hover:text-foreground"
            >
              个人主页
              <ChevronRightIcon className="size-3.5" />
            </button>
          </div>

          {/* 主操作：创建团队 */}
          <div className="px-1 pb-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTeam?.();
              }}
              className="flex h-9 w-full items-center justify-center rounded-[10px] bg-white/[0.055] text-[13px] font-medium text-foreground transition-colors hover:bg-white/[0.09]"
            >
              创建团队
            </button>
          </div>

          {/* 积分余额 + 每日签到 */}
          <div className="mx-1 flex items-center rounded-[10px] bg-white/[0.035] py-1">
            <button
              type="button"
              onClick={() => openAccount("points")}
              className="group flex h-10 min-w-0 flex-1 items-center gap-3 rounded-[10px] px-3 text-left transition-colors hover:bg-white/[0.04]"
            >
              <CreditsIcon className="size-4 shrink-0 text-brand" />
              <span className="flex-1 truncate text-[13px] font-medium text-foreground/85">
                {USER.points.toLocaleString()} 积分
              </span>
            </button>
            <button
              type="button"
              onClick={handleSign}
              disabled={signedToday}
              className={cn(
                "mr-2 flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold transition-colors",
                signedToday
                  ? "cursor-default bg-white/[0.08] text-muted-foreground"
                  : "bg-brand text-brand-foreground hover:bg-brand-hover"
              )}
            >
              {signedToday ? "已签到" : "+20"}
            </button>
          </div>

          {user?.pointsBreakdown && (
            <div className="mx-3 pb-2 pl-7 pr-3 pt-0.5 text-[11px] text-muted-foreground">
              <span>充值 {user.pointsBreakdown.recharge.toLocaleString()}</span>
              <span className="mx-1.5">·</span>
              <span>会员 {user.pointsBreakdown.member.toLocaleString()}</span>
              <span className="mx-1.5">·</span>
              <span>赠送 {user.pointsBreakdown.gift.toLocaleString()}</span>
            </div>
          )}

          {/* 功能列表 */}
          <div className="px-1 py-1">
            <div>
              <Row
                Icon={GiftIcon}
                title="邀请好友"
                onClick={() => {
                  onClose();
                  onOpenInviteCampaign?.();
                }}
              />
              {isAdmin && (
                <Row
                  Icon={BuildingIcon}
                  title="商业化控制台"
                  onClick={() => {
                    onClose();
                    router.push("/admin");
                  }}
                />
              )}
              <Row
                Icon={UsersIcon}
                title="团队管理"
                right={
                  user?.team ? (
                    <span className="max-w-[112px] truncate text-[12px] text-muted-foreground">{user.team.name}</span>
                  ) : undefined
                }
                onClick={() => {
                  onClose();
                  onOpenTeam?.();
                }}
              />
              <Row
                Icon={BellIcon}
                title="消息中心"
                onClick={() => {
                  onClose();
                  onOpenMessages?.();
                }}
              />
              <Row
                Icon={StarIcon}
                title="超创合伙人"
                badge={
                  <span className="rounded bg-white/[0.06] px-1.5 py-px text-[10px] font-medium text-muted-foreground">
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
                title="生成水印"
                onClick={() => {
                  onClose();
                  onOpenWatermark?.();
                }}
              />
            </div>
          </div>

          {/* 退出登录 */}
          <div className="mt-1 px-1">
            <Row
              Icon={LogoutIcon}
              title="退出登录"
              danger
              onClick={() => {
                onClose();
                logout();
              }}
            />
          </div>

          {/* 备案信息 */}
          <div className="px-4 pb-3 pt-1 text-center text-[10px] leading-4 text-muted-foreground">
            <p>© 2026 菠萝视频 · 京ICP备2025031794号-3</p>
            <p>京公网安备 11010502041287号</p>
          </div>

        </div>
      </div>
    </>
  );
}
