"use client";

import { Suspense, useSyncExternalStore, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CheckoutDialog, type CheckoutOrder } from "@/components/checkout-dialog";
import { CheckIcon, ChevronDownIcon, CoinsIcon, CrownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  CYCLES,
  FAQ_ITEMS,
  MEMBER_PLANS,
  RECHARGE_TIERS,
  TEAM_BASE_SEATS,
  TEAM_MAX_SEATS,
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

type PricingTab = "credits" | "membership";

// useSearchParams 要求包裹 Suspense（Next.js 生产构建 CSR bailout 约定）
export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // tab 以 URL 查询参数为单一事实来源，支持深链与外部跳转联动
  const tab: PricingTab =
    searchParams.get("tab") === "membership" ? "membership" : "credits";

  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const firstChargeUsed = useSyncExternalStore(
    subscribeFirstCharge,
    getFirstCharge,
    getFirstChargeServer,
  );

  const switchTab = (next: PricingTab) => {
    if (next === tab) return;
    router.replace(`/pricing?tab=${next}`, { scroll: false });
  };

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
      cta: `支付 ¥${tier.price}`,
      onSuccessNote:
        tier.id === "first"
          ? `首充成功！150 积分已到账，推荐升级年费会员享 ${yearlyDiscountLabel()}`
          : "充值成功，积分已到账",
      // 首充→年费会员二次转化路径（spec 优化循环 1 闭环）
      successCta:
        tier.id === "first"
          ? {
              label: "升级年费会员",
              onClick: () => {
                setOrder(null);
                router.replace("/pricing?tab=membership", { scroll: false });
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
    const price = cyclePrice(plan, cycle, identity, seats);
    const credits =
      identity === "team" ? teamCredits(plan, seats) : plan.monthlyCredits;
    setOrder({
      title: `${identity === "team" ? "团队版" : "个人版"} · ${plan.name}`,
      subtitle:
        identity === "team"
          ? `${cycleLabel} · ${seats} 席位 · ${plan.tagline}`
          : `${cycleLabel} · ${plan.tagline}`,
      amount: price * (cycle === "month" ? 1 : cycle === "quarter" ? 3 : 12),
      benefits: [
        `每月 ${credits.toLocaleString()} 积分`,
        identity === "team"
          ? `含 ${seats} 席位 · 积分池共享${seats > TEAM_BASE_SEATS ? `（含加席 ×${seats - TEAM_BASE_SEATS}）` : ""}`
          : "单账号使用",
        `视频模型 ${plan.videoDiscount} · 图片模型 ${plan.imageDiscount}`,
        cycle === "year" ? "年付专属：加赠 2 个月等值积分 + 折扣锁定" : "",
      ].filter(Boolean),
      cta: "确认订阅",
      onSuccessNote: "订阅成功，会员权益已即时生效",
    });
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 pb-16">
          <ModelBanner />

          {/* 入口切换：积分充值 / 会员订阅 分离，双心智模型互不干扰 */}
          <div className="mt-6 flex w-fit rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/[0.08]">
            <button
              type="button"
              onClick={() => switchTab("credits")}
              aria-pressed={tab === "credits"}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-6 py-2.5 text-[14px] font-semibold transition-colors",
                tab === "credits"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-white/55 hover:text-white",
              )}
            >
              <CoinsIcon className="size-4" />
              积分充值
            </button>
            <button
              type="button"
              onClick={() => switchTab("membership")}
              aria-pressed={tab === "membership"}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-6 py-2.5 text-[14px] font-semibold transition-colors",
                tab === "membership"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-white/55 hover:text-white",
              )}
            >
              <CrownIcon className="size-4" />
              会员订阅
              <span className="rounded-full bg-brand/20 px-1.5 py-px text-[10px] font-bold text-brand">
                {yearlyDiscountLabel()}
              </span>
            </button>
          </div>

          {tab === "credits" ? (
            <RechargeSection
              firstChargeUsed={firstChargeUsed}
              onRecharge={recharge}
            />
          ) : (
            <MemberSection onSubscribe={subscribe} />
          )}

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
}: {
  firstChargeUsed: boolean;
  onRecharge: (tierId: string) => void;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <CoinsIcon className="size-5 text-brand" />
        <h2 className="text-[20px] font-bold text-white">积分充值</h2>
        <span className="text-[13px] text-white/50">1 元 = 10 积分</span>
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
                <p className="mt-1 text-[12px] text-white/30">无加赠</p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 会员订阅 ---------- */
function MemberSection({
  onSubscribe,
}: {
  onSubscribe: (
    plan: MemberPlan,
    cycle: MemberCycle,
    identity: MemberIdentity,
    seats?: number,
  ) => void;
}) {
  const [identity, setIdentity] = useState<MemberIdentity>("personal");
  const [cycle, setCycle] = useState<MemberCycle>("year");
  const [seats, setSeats] = useState(TEAM_BASE_SEATS);

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2">
        <CrownIcon className="size-5 text-brand" />
        <h2 className="text-[20px] font-bold text-white">会员订阅</h2>
      </div>

      {/* 身份切换 */}
      <div className="mt-4 flex w-fit rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.08]">
        <button
          onClick={() => setIdentity("personal")}
          className={cn(
            "rounded-md px-6 py-2 text-[14px] font-medium transition-colors",
            identity === "personal"
              ? "bg-white/[0.1] text-white"
              : "text-white/60 hover:text-white",
          )}
        >
          个人
        </button>
        <button
          onClick={() => setIdentity("team")}
          className={cn(
            "rounded-md px-6 py-2 text-[14px] font-medium transition-colors",
            identity === "team"
              ? "bg-white/[0.1] text-white"
              : "text-white/60 hover:text-white",
          )}
        >
          团队
        </button>
      </div>

      {/* 周期切换 */}
      <div className="mt-3 flex w-fit items-center gap-2 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.08]">
        {CYCLES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCycle(c.id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-4 py-2 text-[13px] font-medium transition-colors",
              cycle === c.id
                ? "bg-white/[0.1] text-white"
                : "text-white/60 hover:text-white",
            )}
          >
            {c.label}
            <span
              className={cn(
                "text-[11px]",
                cycle === c.id ? "text-brand" : "text-white/40",
              )}
            >
              {c.id === "year" ? yearlyDiscountLabel() : c.discount}
            </span>
          </button>
        ))}
      </div>

      {identity === "team" && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/60">
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

      {/* 3 档卡片（席位/周期联动计价） */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
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
    </section>
  );
}

function cyclePrice(
  plan: MemberPlan,
  cycle: MemberCycle,
  identity: MemberIdentity,
  seats = TEAM_BASE_SEATS,
) {
  // 个人价：季付 85 折先 round；团队价 = 个人价 round 后 ×2（消除舍入误差）；
  // 超出基础 3 席后，每席加收个人版当前周期月价 × 1/2
  let personal: number;
  if (cycle === "month") personal = plan.monthlyOriginal;
  else if (cycle === "quarter") personal = Math.round(plan.monthlyOriginal * 0.85);
  else personal = plan.yearlyMonthly;
  if (identity !== "team") return personal;
  return (
    personal * 2 + (seats - TEAM_BASE_SEATS) * Math.round(personal * 0.5)
  );
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
  const price = cyclePrice(plan, cycle, identity, seats);
  const displayOriginal = identity === "team" ? plan.monthlyOriginal * 2 : plan.monthlyOriginal;
  const yearlySave = (displayOriginal - price) * 12;
  // 团队积分池/额度随席位线性扩容：基础 ×2，每加一席 +0.5 基础
  const quotaFactor =
    identity === "team" ? 2 + 0.5 * (seats - TEAM_BASE_SEATS) : 1;
  const creditsPool = Math.round(plan.monthlyCredits * quotaFactor);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl p-5 ring-1",
        highlighted
          ? "bg-gradient-to-b from-brand/10 to-transparent ring-brand/50"
          : "bg-white/[0.03] ring-white/[0.08]",
      )}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-[18px] font-bold text-white">{plan.name}</h3>
        <span className="text-[12px] text-white/50">{plan.tagline}</span>
      </div>
      {identity === "team" && (
        <p className="mt-1 text-[12px] text-brand">
          含 {seats} 席位 · 积分池共享
          {seats > TEAM_BASE_SEATS ? `（含加席 ×${seats - TEAM_BASE_SEATS}）` : ""}
        </p>
      )}

      <div className="mt-4">
        <p className="text-[13px] text-white/40 line-through">
          ¥{displayOriginal} /月
        </p>
        <p className="mt-0.5 text-[32px] font-bold text-white">
          ¥{price}
          <span className="text-[14px] font-normal text-white/60"> /月</span>
        </p>
        {cycle === "year" && (
          <p className="mt-1 text-[12px] font-medium text-brand">
            年付折合 · 年省 ¥{yearlySave.toLocaleString()}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSubscribe(plan, cycle, identity, seats)}
        className={cn(
          "mt-4 rounded-lg py-2.5 text-[14px] font-semibold transition-opacity hover:opacity-90",
          highlighted
            ? "bg-gradient-to-r from-[#00e5c8] to-[#7dff8c] text-black"
            : "bg-white text-black",
        )}
      >
        订阅
      </button>

      {/* 权益矩阵（参考竞品 OiiOii 强化） */}
      <ul className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-4 text-[13px]">
        <li className="flex items-center gap-2 text-white/90">
          <CheckIcon className="size-3.5 text-brand" />
          {creditsPool.toLocaleString()} 积分 / 月
        </li>
        <li className="flex items-center gap-2 text-white/80">
          <CheckIcon className="size-3.5 text-brand" />
          最多约 {Math.round(plan.maxImages * quotaFactor).toLocaleString()} 张图片
        </li>
        <li className="flex items-center gap-2 text-white/80">
          <CheckIcon className="size-3.5 text-brand" />
          最多约 {Math.round(plan.maxSeconds * quotaFactor).toLocaleString()} 秒视频
        </li>
        <li className="flex items-center justify-between text-white/80">
          <span>视频模型</span>
          <span className="text-brand">{plan.videoDiscount}</span>
        </li>
        <li className="flex items-center justify-between text-white/80">
          <span>图片模型</span>
          <span>{plan.imageDiscount}</span>
        </li>
        <li className="flex items-center justify-between text-white/80">
          <span>分镜并发</span>
          <span>{plan.concurrency} 个</span>
        </li>
        <BenefitRow ok={plan.watermarkFree} label="去水印导出" />
        <BenefitRow ok={plan.hd1080p} label="1080p 高清导出" />
        <BenefitRow ok={plan.hd4k} label="4K 超清导出" />
        <BenefitRow ok={plan.stableService} label="更稳定的模型服务" />
        <li className="flex items-center justify-between text-white/80">
          <span>生成队列</span>
          <span className={plan.queue === "标准" ? "text-white/50" : "text-brand"}>
            {plan.queue}队列
          </span>
        </li>
      </ul>
    </div>
  );
}

function BenefitRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2",
        ok ? "text-white/80" : "text-white/30",
      )}
    >
      {ok ? (
        <CheckIcon className="size-3.5 text-brand" />
      ) : (
        <span className="flex size-3.5 items-center justify-center text-white/30">—</span>
      )}
      {label}
    </li>
  );
}

/* ---------- FAQ ---------- */
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-12">
      <h2 className="text-center text-[20px] font-bold text-white">
        订阅与积分常见问题
      </h2>
      <div className="mt-5 flex flex-col gap-2">
        {FAQ_ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              key={item.q}
              className="rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]"
            >
              <button
                type="button"
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
