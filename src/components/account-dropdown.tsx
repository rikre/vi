"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  EditIcon,
  CameraIcon,
  UserIcon,
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
  DiscoverIcon,
} from "@/components/icons";
import { yearlyDiscountLabel } from "@/app/pricing/data";

interface AccountDropdownProps {
  open: boolean;
  onClose: () => void;
  placement?: "bottom-right" | "top-center";
  /** 打开账户管理弹框（个人资料 / 积分明细 / 邀请好友 / 账单发票 / 问题反馈） */
  onOpenAccount?: (tab: "profile" | "points" | "invite" | "invoice" | "feedback") => void;
  /** 打开 AI 水印设置子弹框 */
  onOpenWatermark?: () => void;
}

const STATS = [
  { label: "作品", value: 12, Icon: DocumentIcon },
  { label: "技能", value: 48, Icon: SparkleIcon },
  { label: "资产", value: 128, Icon: HeartIcon },
];

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

// Mock signed-in user. `team` presence marks a team-plan account and is
// surfaced with a distinguishing icon so team users read at a glance.
const USER = {
  name: "bollo 用户",
  id: "10086420",
  email: "bollo@bollo.video",
  tier: "普通用户",
  points: 2580,
  // 积分构成（扣除顺序：赠送 → 会员 → 充值）
  pointsBreakdown: { recharge: 1580, member: 800, gift: 200 },
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
      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/[0.06] transition-colors group-hover:text-white">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
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

export function AccountDropdown({
  open,
  onClose,
  placement = "bottom-right",
  onOpenAccount,
  onOpenWatermark,
}: AccountDropdownProps) {
  const router = useRouter();
  const signedToday = useSyncExternalStore(subscribeSign, getSign, getSignServer);

  // 商业化引导统一跳转 /pricing 对应入口（积分充值 / 会员订阅），
  // 与定价页单一事实来源保持一致
  const goTo = (tab: "credits" | "membership") => {
    onClose();
    router.push(`/pricing?tab=${tab}`);
  };

  const openAccount = (tab: "profile" | "points" | "invite" | "invoice" | "feedback") => {
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

  const isTeam = !!USER.team;
  const isMember = USER.tier !== "普通用户";

  // 签到：会员每日 +20 积分；非会员点击引导至会员订阅（与参考站「开通 base 以上会员可签到」一致）
  // 去重以 localStorage 实时读取为准（state 可能因双击/多标签页竞态而过期）。
  // 注意：跨浏览器/跨设备去重客户端无法保证，接入真实后端时将此函数
  // 整体替换为服务端账户维度的原子 claim 接口，客户端仅作乐观缓存。
  const handleSign = () => {
    if (!isMember) {
      goTo("membership");
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
        role="menu"
        className={cn(
          "absolute z-50 w-[360px] transition duration-200",
          placement === "bottom-right" && "right-0 top-full mt-2 origin-top-right",
          placement === "top-center" && "bottom-full left-1/2 mb-2 -translate-x-1/2 origin-bottom",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-[0.98] opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-2xl bg-[#141414] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.08]">
          {/* identity header */}
          <div className="relative overflow-hidden px-4 pb-4 pt-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-brand/[0.07] blur-2xl"
            />
            <div className="relative flex items-start gap-3">
              <div className="relative size-14 shrink-0">
                <div className="size-14 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <img
                    src="https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=cute%20anime%20avatar%20mascot%20character%20bollo%20lime%20green%20theme%20simple%20design&image_size=square"
                    alt="用户头像"
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  aria-label="更换头像"
                  onClick={() => console.log("更换头像")}
                  className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#1c1c1c] text-white/70 ring-1 ring-white/15 transition-colors hover:text-white"
                >
                  <CameraIcon className="size-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-bold text-white">{USER.name}</span>
                  <button
                    type="button"
                    aria-label="编辑资料"
                    onClick={() => openAccount("profile")}
                    className="flex size-5 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                  >
                    <EditIcon className="size-3.5" />
                  </button>
                </div>
                <div className="mt-0.5 truncate text-[11.5px] tabular-nums text-white/40">
                  ID: {USER.id} · {USER.email}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[11px] font-medium text-white/65">
                    {USER.tier}
                  </span>
                  {isTeam && (
                    <span className="flex items-center gap-1 rounded-md bg-[#00e5c8]/12 px-2 py-0.5 text-[11px] font-semibold text-[#7dffe6] ring-1 ring-[#00e5c8]/25">
                      <UserGroupIcon className="size-3" />
                      {USER.team!.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-start gap-3 pl-1">
                {STATS.map(({ label, value, Icon }) => (
                  <div key={label} className="flex flex-col items-center">
                    <Icon className="size-3.5 text-white/30" />
                    <span className="mt-1 text-[15px] font-bold tabular-nums text-white">{value}</span>
                    <span className="text-[10.5px] text-white/40">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 双 CTA：订阅会员 / 积分充值（参考站头部双按钮） */}
          <div className="flex gap-2 px-4">
            <button
              type="button"
              onClick={() => goTo("membership")}
              className="flex-1 rounded-full bg-brand py-2 text-[13px] font-bold text-black transition-transform hover:brightness-105 active:scale-[0.98]"
            >
              订阅会员
            </button>
            <button
              type="button"
              onClick={() => goTo("credits")}
              className="flex-1 rounded-full border border-brand/50 py-2 text-[13px] font-bold text-brand transition-colors hover:bg-brand/10"
            >
              积分充值
            </button>
          </div>

          {/* points card：余额 + 构成 + 每日签到入口 */}
          <div className="px-4 pt-3">
            <div className="overflow-hidden rounded-xl bg-white/[0.03] ring-1 ring-white/[0.08]">
              <button
                type="button"
                onClick={() => openAccount("points")}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
              >
                <CoinsIcon className="size-4 text-brand" />
                <span className="flex-1 text-[13px] font-semibold text-white">
                  {USER.points.toLocaleString()} 积分
                </span>
                <ChevronRightIcon className="size-4 text-white/30" />
              </button>
              <div className="space-y-1 border-t border-white/[0.06] px-3 py-2 text-[11.5px] text-white/45">
                <p className="flex justify-between">
                  <span>充值积分</span>
                  <span className="tabular-nums text-white/70">{USER.pointsBreakdown.recharge.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>会员积分</span>
                  <span className="tabular-nums text-white/70">{USER.pointsBreakdown.member.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>赠送积分</span>
                  <span className="tabular-nums text-white/70">{USER.pointsBreakdown.gift.toLocaleString()}</span>
                </p>
              </div>
              {/* 每日签到入口 */}
              <div className="px-3 pb-3">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-brand/[0.12] px-3 py-2 ring-1 ring-brand/30">
                  <p className="text-[11px] leading-snug text-brand">
                    {isMember ? "每日签到领额外积分" : "开通会员，每日签到领额外积分"}
                  </p>
                  <button
                    type="button"
                    onClick={handleSign}
                    disabled={signedToday}
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-transform active:scale-95",
                      signedToday
                        ? "cursor-default bg-white/[0.08] text-white/40"
                        : "bg-brand text-black hover:brightness-105"
                    )}
                  >
                    <CoinsIcon className="size-3" />
                    {signedToday ? "已签到" : "+ 20"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* primary menu */}
          <div className="px-3 pt-3">
            <div className="overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="divide-y divide-white/[0.05]">
                <Row
                  Icon={UserIcon}
                  title="个人中心与作品"
                  onClick={() => openAccount("profile")}
                />
                <Row
                  Icon={GiftIcon}
                  title="邀请好友"
                  badge={
                    <span className="rounded bg-[#ff2d6b]/15 px-1.5 py-px text-[10px] font-bold text-[#ff5c8a]">
                      邀请好友+200 积分
                    </span>
                  }
                  onClick={() => openAccount("invite")}
                />
                <Row
                  Icon={CrownIcon}
                  title="订阅与账单"
                  badge={
                    <span className="rounded bg-brand/15 px-1.5 py-px text-[10px] font-bold text-brand">
                      {yearlyDiscountLabel()}
                    </span>
                  }
                  onClick={() => goTo("membership")}
                />
                <Row
                  Icon={CoinsIcon}
                  title="我的积分"
                  right={<span className="text-[13px] font-bold tabular-nums text-brand">{USER.points.toLocaleString()}</span>}
                  onClick={() => openAccount("points")}
                />
                <Row
                  Icon={DocumentIcon}
                  title="账单发票"
                  onClick={() => openAccount("invoice")}
                />
                <Row
                  Icon={UserGroupIcon}
                  title="团队管理"
                  sub={isTeam ? `${USER.team!.name} · ${USER.team!.role}` : "创建或加入团队，协作创作"}
                  badge={
                    isTeam ? (
                      <span className="flex items-center gap-1 rounded bg-[#00e5c8]/12 px-1.5 py-px text-[10px] font-bold text-[#7dffe6]">
                        <UserGroupIcon className="size-2.5" />
                        团队版
                      </span>
                    ) : undefined
                  }
                  onClick={() => { onClose(); router.push("/team"); }}
                />
              </div>
            </div>
          </div>

          {/* support menu */}
          <div className="px-3 pb-3 pt-3">
            <div className="overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="divide-y divide-white/[0.05]">
                <Row
                  Icon={MessageSquareIcon}
                  title="用户反馈"
                  onClick={() => openAccount("feedback")}
                />
                <Row Icon={DocumentIcon} title="使用说明书" onClick={() => console.log("使用说明书")} />
                <Row Icon={HelpCircleIcon} title="常见问题" onClick={() => console.log("常见问题")} />
                <Row
                  Icon={EditIcon}
                  title="AI 水印"
                  onClick={() => { onClose(); onOpenWatermark?.(); }}
                />
                <Row Icon={InfoIcon} title="关于 bollo" onClick={() => console.log("关于 bollo")} />
                <Row
                  Icon={DiscoverIcon}
                  title="语言"
                  right={<span className="text-[12px] text-white/45">简体中文</span>}
                  onClick={() => console.log("切换语言")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
