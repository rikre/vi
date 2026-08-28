"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CheckoutDialog, type CheckoutOrder } from "@/components/checkout-dialog";
import {
  AccountDialog,
  AiWatermarkDialog,
  type AccountTab,
} from "@/components/account-dialog";
import { UserAvatar } from "@/components/user-avatar";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CoinsIcon,
  GiftIcon,
  SparkleIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  CYCLES,
  FAQ_ITEMS,
  MEMBER_PLANS,
  RECHARGE_TIERS,
  TEAM_BASE_SEATS,
  TEAM_MAX_SEATS,
  cycleMonthlyPrice,
  extraSeatPrice,
  teamCredits,
  yearlyDiscountLabel,
  type MemberCycle,
  type MemberIdentity,
  type MemberPlan,
} from "./data";

const FIRST_CHARGE_KEY = "first_charge_done";

// 首充状态外部存储：SSR 恒返回 false，客户端订阅 localStorage 变化，
// 避免 SSR/CSR 渲染不一致导致的 hydration error
function subscribeFirstCharge(cb: () => void) {
  window.addEventListener("first-charge-changed", cb);
  return () => window.removeEventListener("first-charge-changed", cb);
}
const getFirstCharge = () => localStorage.getItem(FIRST_CHARGE_KEY) === "1";
const getFirstChargeServer = () => false;

// Mock 登录用户（与账户下拉同源展示）
const USER = { name: "bollo 用户", points: 2580 };

// 页面内区块滚动定位（充值区 / 会员区同页连续排布）
function scrollToSection(id: "recharge" | "membership") {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function PricingPage() {
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [accountTab, setAccountTab] = useState<AccountTab | null>(null);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const firstChargeUsed = useSyncExternalStore(
    subscribeFirstCharge,
    getFirstCharge,
    getFirstChargeServer,
  );

  // 深链定位：支持 #recharge / #membership 锚点与旧版 ?tab= 参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target =
      window.location.hash === "#membership" || params.get("tab") === "membership"
        ? "membership"
        : window.location.hash === "#recharge" || params.get("tab") === "credits"
          ? "recharge"
          : null;
    if (target === "recharge") {
      setRechargeOpen(true);
    } else if (target) {
      scrollToSection(target);
    }
  }, []);

  useEffect(() => {
    if (!rechargeOpen) return;
    const frame = window.requestAnimationFrame(() => scrollToSection("recharge"));
    return () => window.cancelAnimationFrame(frame);
  }, [rechargeOpen]);

  const recharge = (tierId: string) => {
    const tier = RECHARGE_TIERS.find((t) => t.id === tierId);
    if (!tier) return;
    if (tier.id === "first" && firstChargeUsed) return;
    setOrder({
      title: `充值 ${tier.credits.toLocaleString()} 积分`,
      subtitle: tier.note ?? `1 元 = 10 积分`,
      amount: tier.price,
      benefits: [
        `到账 ${tier.credits.toLocaleString()} 积分`,
        tier.bonusLabel ? `加赠 ${tier.bonusLabel}` : "无加赠",
        "积分长期有效，生成失败不扣费",
      ],
      purchaseNotes: [
        "积分支付成功后即时到账，生成失败不扣费。",
        "如需开具发票，请联系客服申请；发票服务仅支持团队版订单。",
      ],
      cta: `支付 ¥${tier.price}`,
      onSuccessNote:
        tier.id === "first"
          ? `首充成功！150 积分已到账，推荐升级年费会员享 ${yearlyDiscountLabel()}`
          : "充值成功，积分已到账",
      // 首充→年费会员二次转化路径：关闭弹框并滚动到会员区
      successCta:
        tier.id === "first"
          ? {
              label: "升级年费会员",
              onClick: () => {
                setOrder(null);
                scrollToSection("membership");
              },
            }
          : undefined,
    });
    return tierId;
  };

  const onRechargeSuccess = (tierId: string) => {
    if (tierId === "first") {
      localStorage.setItem(FIRST_CHARGE_KEY, "1");
      window.dispatchEvent(new Event("first-charge-changed"));
    }
  };

  const subscribe = (
    plan: MemberPlan,
    cycle: MemberCycle,
    identity: MemberIdentity,
    seats = TEAM_BASE_SEATS,
  ) => {
    const cycleLabel = CYCLES.find((c) => c.id === cycle)?.label;
    const price = teamPrice(plan, cycle, identity, seats);
    const credits =
      identity === "team" ? teamCredits(plan, seats) : plan.monthlyCredits;
    setOrder({
      title: `${identity === "team" ? "团队版" : "个人创作"} · ${plan.name}`,
      subtitle:
        identity === "team"
          ? `${cycleLabel} · ${seats} 席位 · ${plan.tagline}`
          : `${cycleLabel} · ${plan.tagline}`,
      amount: price * (cycle === "month" ? 1 : 12),
      benefits: [
        `每月 ${credits.toLocaleString()} 积分（含限时赠送）`,
        identity === "team"
          ? `含 ${seats} 席位 · 积分池共享${seats > TEAM_BASE_SEATS ? `（含加席 ×${seats - TEAM_BASE_SEATS}）` : ""}`
          : "单账号使用",
        `${plan.storageGb}GB 云存储 · ${plan.concurrency} 任务并发`,
        "去水印 · " + plan.commercialLicense,
      ],
      purchaseNotes: [
        "会员权益购买后即时生效，具体有效期以所购套餐为准。",
        "如需开具发票，请联系客服申请；发票服务仅支持团队版订单。",
      ],
      cta: "确认订阅",
      onSuccessNote: "订阅成功，会员权益已即时生效",
    });
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 pb-16">
          <ModelBanner />

          {rechargeOpen && (
            <RechargeSection
              firstChargeUsed={firstChargeUsed}
              onRecharge={recharge}
              onClose={() => setRechargeOpen(false)}
            />
          )}

          <MemberSection
            onSubscribe={subscribe}
            onOpenAccount={setAccountTab}
            onOpenRecharge={() => setRechargeOpen(true)}
          />

          <FaqSection />
        </div>
      </div>

      {order && (
        <CheckoutDialog
          order={order}
          onClose={() => setOrder(null)}
          onSuccess={() => {
            const tierId = RECHARGE_TIERS.find(
              (t) => order.title.includes(t.credits.toLocaleString()),
            )?.id;
            if (tierId) onRechargeSuccess(tierId);
          }}
        />
      )}

      {accountTab !== null && (
        <AccountDialog
          open
          initialTab={accountTab}
          onClose={() => setAccountTab(null)}
          onOpenWatermark={() => setWatermarkOpen(true)}
        />
      )}
      {watermarkOpen && <AiWatermarkDialog onClose={() => setWatermarkOpen(false)} />}
    </AppShell>
  );
}

/* ---------- 模型特价 banner ---------- */
function ModelBanner() {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#101418] via-[#0d1a1c] to-[#101418] p-6 ring-1 ring-white/[0.08]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] text-white/50">
            活动时间：2026.8.14 14:00 - 9.17 14:00
          </p>
          <h1 className="mt-1 text-[28px] font-bold text-white">
            Seedance 2.5 首发上线{" "}
            <span className="text-brand">低至 1元/秒</span>
          </h1>
          <p className="mt-2 text-[14px] text-white/70">
            Seedance 2.0 mini <span className="font-semibold text-brand">4折</span>
            <span className="mx-2 text-white/30">｜</span>
            Seedance 2.0 fast <span className="font-semibold text-brand">75折</span>
            <span className="mx-2 text-white/30">｜</span>
            充值积分最高加赠<span className="font-semibold text-brand">70%</span>
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.04] px-5 py-3 ring-1 ring-white/[0.08]">
          <p className="text-[13px] text-white/60">无参考视频</p>
          <p className="mt-0.5 text-[22px] font-bold text-white">
            83<span className="text-[13px] font-normal text-white/60"> 积分/s</span>
            <span className="ml-2 text-[13px] font-normal text-white/40 line-through">原价 115</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 积分充值 6 档 ---------- */
function RechargeSection({
  firstChargeUsed,
  onRecharge,
  onClose,
}: {
  firstChargeUsed: boolean;
  onRecharge: (tierId: string) => void;
  onClose: () => void;
}) {
  return (
    <section id="recharge" className="mt-10 scroll-mt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CoinsIcon className="size-5 text-brand" />
          <h2 className="text-[20px] font-bold text-white">积分充值</h2>
          <span className="text-[13px] text-white/50">1 元 = 10 积分</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          收起
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {RECHARGE_TIERS.map((tier) => {
          const firstUsed = tier.id === "first" && firstChargeUsed;
          return (
            <button
              key={tier.id}
              type="button"
              disabled={firstUsed}
              onClick={() => onRecharge(tier.id)}
              className={cn(
                "relative flex flex-col rounded-2xl p-4 text-left ring-1 transition-all",
                firstUsed
                  ? "cursor-not-allowed bg-white/[0.02] opacity-50 ring-white/[0.06]"
                  : "hover:-translate-y-0.5",
                tier.recommended
                  ? "bg-gradient-to-b from-brand/10 to-transparent ring-brand/50"
                  : !firstUsed && "bg-white/[0.03] ring-white/[0.08] hover:ring-white/20",
              )}
            >
              {tier.note && (
                <span className="absolute -top-2.5 left-3 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-black">
                  {firstUsed ? "已使用" : tier.note}
                </span>
              )}
              {tier.recommended && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-black">
                  推荐
                </span>
              )}
              <p className="text-[22px] font-bold text-white">¥{tier.price}</p>
              <p className="mt-1 text-[14px] text-white/80">
                {tier.credits.toLocaleString()} 积分
              </p>
              {tier.bonusLabel ? (
                <p className="mt-1 text-[12px] font-medium text-brand">
                  加赠 {tier.bonusLabel}
                </p>
              ) : (
                <p className="mt-1 text-[12px] text-white/45">无加赠</p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 会员订阅（参考「跳跃视界」会员体系） ---------- */
function MemberSection({
  onSubscribe,
  onOpenAccount,
  onOpenRecharge,
}: {
  onSubscribe: (
    plan: MemberPlan,
    cycle: MemberCycle,
    identity: MemberIdentity,
    seats?: number,
  ) => void;
  onOpenAccount: (tab: AccountTab) => void;
  onOpenRecharge: () => void;
}) {
  const [identity, setIdentity] = useState<MemberIdentity>("personal");
  const [cycle, setCycle] = useState<MemberCycle>("month");
  const [seats, setSeats] = useState(TEAM_BASE_SEATS);

  return (
    <section id="membership" className="mt-12 scroll-mt-6">
      {/* 用户积分条：头像 + 积分详情 + 充值/订单入口 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-5 py-3.5 ring-1 ring-white/[0.08]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
            <UserAvatar />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">
              {USER.name}
            </p>
            <button
              type="button"
              onClick={() => onOpenAccount("points")}
              className="group mt-0.5 flex items-center gap-1 text-[12px] text-white/50 transition-colors hover:text-brand"
            >
              积分详情
              <span className="flex items-center gap-0.5 font-semibold text-brand">
                <CoinsIcon className="size-3.5" />
                {USER.points.toLocaleString()}
              </span>
              <ArrowRightIcon className="size-3 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenRecharge}
            className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-black transition-all hover:brightness-105 active:scale-[0.97]"
          >
            充值积分
            <CoinsIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenAccount("charge")}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-white/70 ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            订单管理
          </button>
        </div>
      </div>

      {/* 身份切换 + 课程赠品 */}
      <div className="relative mt-8 flex items-center justify-center">
        <div
          role="tablist"
          aria-label="会员身份"
          className="flex items-center gap-10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={identity === "personal"}
            onClick={() => setIdentity("personal")}
            className={cn(
              "relative pb-2 text-[17px] font-bold transition-colors",
              identity === "personal" ? "text-white" : "text-white/45 hover:text-white/75",
            )}
          >
            个人创作会员
            {identity === "personal" && (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand" />
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={identity === "team"}
            onClick={() => setIdentity("team")}
            className={cn(
              "relative pb-2 text-[17px] font-bold transition-colors",
              identity === "team" ? "text-white" : "text-white/45 hover:text-white/75",
            )}
          >
            团队版会员
            {identity === "team" && (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand" />
            )}
          </button>
        </div>
        <div className="absolute right-0 hidden items-center lg:flex">
          <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-[12px] font-semibold text-brand ring-1 ring-brand/25">
            <GiftIcon className="size-3.5" />
            会员充值即送价值 2980 的 AI 创作课
          </span>
        </div>
      </div>

      {/* 周期切换 */}
      <div className="mt-4 flex justify-center">
        <div
          role="tablist"
          aria-label="订阅周期"
          className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.08]"
        >
          {CYCLES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={cycle === c.id}
              onClick={() => setCycle(c.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-[13px] font-medium transition-colors",
                cycle === c.id
                  ? "bg-brand font-bold text-black"
                  : "text-white/60 hover:text-white",
              )}
            >
              {c.label}
              {c.discount && (
                <span
                  className={cn(
                    "text-[11px]",
                    cycle === c.id ? "text-black/70" : "text-brand",
                  )}
                >
                  {c.discount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-white/45">
        <SparkleIcon className="size-3.5 text-brand" />
        {identity === "team"
          ? "团队积分购买后一次性到账，有效期以所购套餐为准，到期清零"
          : "会员积分购买后按月下发，有效期30天，到期重置"}
      </p>

      {identity === "team" && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-white/60">
          <p>
            团队版含 <span className="font-semibold text-brand">{seats} 席位</span>
            ，积分池席位共享，单席位成本比个人版低约 33%
          </p>
          {/* 席位步进器：第 4 席起每席 = 个人版月价 × 1/2 */}
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-2 py-1 ring-1 ring-white/[0.08]">
            <span className="text-white/50">席位</span>
            <button
              type="button"
              aria-label="减少席位"
              disabled={seats <= TEAM_BASE_SEATS}
              onClick={() => setSeats((s) => Math.max(TEAM_BASE_SEATS, s - 1))}
              className="flex size-6 items-center justify-center rounded-md bg-white/[0.06] text-[15px] font-bold text-white/80 transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>
            <span className="w-6 text-center text-[14px] font-bold tabular-nums text-white">
              {seats}
            </span>
            <button
              type="button"
              aria-label="增加席位"
              disabled={seats >= TEAM_MAX_SEATS}
              onClick={() => setSeats((s) => Math.min(TEAM_MAX_SEATS, s + 1))}
              className="flex size-6 items-center justify-center rounded-md bg-white/[0.06] text-[15px] font-bold text-white/80 transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
            <span className="text-[12px] text-white/45">
              {seats > TEAM_BASE_SEATS
                ? `已加席 ×${seats - TEAM_BASE_SEATS}`
                : `每 +1 席 = 个人版月价 ×1/2`}
            </span>
          </div>
        </div>
      )}

      {/* 5 档卡片：横向滚动（对齐参考站 plan-row） */}
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex w-max gap-4 px-px pb-1">
          {MEMBER_PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              seats={seats}
              highlighted={i === 2}
              identity={identity}
              onSubscribe={onSubscribe}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-[12px] text-white/40">
        如有疑问可前往{" "}
        <a
          href="https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand transition-opacity hover:opacity-80"
        >
          使用手册
        </a>{" "}
        查询或联系客服。
      </p>
    </section>
  );
}

/** 当前周期单席位月价（个人）/ 团队整包月价（含加席） */
function teamPrice(
  plan: MemberPlan,
  cycle: MemberCycle,
  identity: MemberIdentity,
  seats = TEAM_BASE_SEATS,
) {
  const personal = cycleMonthlyPrice(plan, cycle);
  if (identity !== "team") return personal;
  return personal * 2 + (seats - TEAM_BASE_SEATS) * extraSeatPrice(plan, cycle);
}

function PlanCard({
  plan,
  cycle,
  seats,
  highlighted,
  identity,
  onSubscribe,
}: {
  plan: MemberPlan;
  cycle: MemberCycle;
  seats: number;
  highlighted: boolean;
  identity: MemberIdentity;
  onSubscribe: (
    plan: MemberPlan,
    cycle: MemberCycle,
    identity: MemberIdentity,
    seats?: number,
  ) => void;
}) {
  const price = teamPrice(plan, cycle, identity, seats);
  const displayOriginal =
    identity === "team" ? plan.monthlyPrice * 2 : plan.monthlyPrice;
  const yearlySave = (displayOriginal - price) * 12;
  // 团队积分池/额度随席位线性扩容：基础 ×2，每加一席 +0.5 基础
  const quotaFactor =
    identity === "team" ? 2 + 0.5 * (seats - TEAM_BASE_SEATS) : 1;
  const creditsPool = Math.round(plan.monthlyCredits * quotaFactor);
  const validity =
    identity === "team"
      ? "单次购买 · 有效期以套餐为准"
      : cycle === "month"
        ? "每30天续费"
        : "每365天续费";

  return (
    <div
      className={cn(
        "flex w-[300px] shrink-0 flex-col rounded-2xl p-5 ring-1 transition-colors",
        highlighted
          ? "bg-gradient-to-b from-brand/10 to-transparent ring-brand/50"
          : "bg-white/[0.03] ring-white/[0.08] hover:ring-white/20",
      )}
    >
      {/* 名称 + 限时赠送徽标 */}
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate text-[16px] font-bold text-white">
          {plan.name}
        </span>
        <span className="shrink-0 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
          限时赠送{plan.bonusCredits.toLocaleString()}积分
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-white/45">{plan.tagline}</p>

      {/* 有效期 */}
      <div className="mt-2 flex items-center gap-2 text-[12px]">
        <span className="text-white/40">有效期</span>
        <span className="h-3 w-px bg-white/[0.12]" />
        <span className="text-white/60">{validity}</span>
      </div>

      {/* 价格 */}
      <div className="mt-3">
        {cycle !== "month" && (
          <p className="text-[12px] text-white/35 line-through">
            ¥{displayOriginal.toLocaleString()} /月
          </p>
        )}
        <p className="flex items-baseline gap-x-2 whitespace-nowrap">
          <span className="text-[28px] font-bold leading-none text-white">
            ¥{price.toLocaleString()}
          </span>
          <span className="text-[13px] text-white/50">/ 月</span>
        </p>
        {cycle === "year" && (
          <p className="mt-1 text-[12px] font-medium text-brand">
            年付折合 · 年省 ¥{yearlySave.toLocaleString()}
          </p>
        )}
      </div>

      {/* 积分盒：每月 / 换算 */}
      <div className="mt-3 flex gap-2">
        <div className="flex flex-1 items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2 ring-1 ring-white/[0.06]">
          <span className="text-[11px] text-white/45">每月</span>
          <span className="text-[13px] font-bold text-white">
            {creditsPool.toLocaleString()} 积分
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2 ring-1 ring-white/[0.06]">
          <span className="text-[11px] text-white/45">换算</span>
          <span className="ml-2 text-[13px] font-semibold text-brand">
            {plan.conversion}
          </span>
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-white/45">
        最多生成约 {Math.round(plan.maxImages * quotaFactor).toLocaleString()} 张图片 |{" "}
        {Math.round(plan.maxSeconds * quotaFactor).toLocaleString()}秒视频
      </p>

      <button
        type="button"
        onClick={() => onSubscribe(plan, cycle, identity, seats)}
        className={cn(
          "mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98]",
          highlighted
            ? "bg-brand text-black hover:brightness-105"
            : "bg-white/[0.08] text-white ring-1 ring-white/[0.1] hover:bg-white/[0.14]",
        )}
      >
        订阅{plan.name}
      </button>

      {/* 分组权益矩阵 */}
      <div className="mt-4 space-y-4 border-t border-white/[0.08] pt-4 text-[13px]">
        <BenefitGroup title="限时权益">
          <li className="flex items-center gap-2 text-white/80">
            <SparkleIcon className="size-3.5 text-brand" />
            官方资产限时不限
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <SparkleIcon className="size-3.5 text-brand" />
            模型使用限时不限
          </li>
        </BenefitGroup>
        <BenefitGroup title="积分权益">
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            每月赠送
            <span className="font-semibold text-brand">
              {creditsPool.toLocaleString()}
            </span>
            积分（含{Math.round(plan.bonusCredits * quotaFactor).toLocaleString()}额外赠送）
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            每日登录赠送 <span className="font-semibold text-brand">50</span> 积分
          </li>
        </BenefitGroup>
        <BenefitGroup title="资源与存储">
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            <span className="font-semibold text-brand">
              {Math.round(plan.storageGb * quotaFactor)}
            </span>
            GB 云存储空间
          </li>
        </BenefitGroup>
        <BenefitGroup title="创作效能">
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            支持 <span className="font-semibold text-brand">
              {Math.round(plan.concurrency * quotaFactor)}
            </span> 个任务同时生成
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            可创建 <span className="font-semibold text-brand">
              {Math.round(plan.projects * quotaFactor)}
            </span> 个独立创作项目
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            {plan.channel}
          </li>
        </BenefitGroup>
        <BenefitGroup title="使用权限">
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            去水印
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <CheckIcon className="size-3.5 text-brand" />
            {plan.commercialLicense}
          </li>
        </BenefitGroup>
      </div>
    </div>
  );
}

function BenefitGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-white/60">{title}</h3>
      <ul className="mt-2 space-y-2">{children}</ul>
    </div>
  );
}

/* ---------- FAQ ---------- */
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-12">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-brand">
          FAQ
        </span>
        <h2 className="mt-2 text-[20px] font-bold text-white">
          会员与积分常见问题
        </h2>
      </div>
      <div className="mx-auto mt-5 flex max-w-[760px] flex-col gap-2">
        {FAQ_ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              key={item.q}
              className="rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]"
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-[14px] font-medium text-white/90"
              >
                {i + 1}. {item.q}
                <ChevronDownIcon
                  className={cn(
                    "size-4 text-white/50 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
              {open && (
                <p className="px-5 pb-4 text-[13px] leading-relaxed text-white/60">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
