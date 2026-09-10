"use client";

import {
  AdminBadge,
  AdminCard,
  MetricCard,
  SectionTitle,
} from "@/components/admin/admin-ui";
import { CoinsIcon, CpuIcon, UserGroupIcon } from "@/components/icons";
import type { AdminState } from "@/types/admin";

const REVENUE_TREND = [
  { label: "08-29", revenue: 42, usage: 58 },
  { label: "08-30", revenue: 54, usage: 48 },
  { label: "08-31", revenue: 38, usage: 62 },
  { label: "09-01", revenue: 68, usage: 71 },
  { label: "09-02", revenue: 76, usage: 66 },
  { label: "09-03", revenue: 61, usage: 82 },
  { label: "09-04", revenue: 92, usage: 88 },
] as const;

export function AdminOverview({ state }: { state: AdminState }) {
  const paidOrders = state.orders.filter((order) => order.status === "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const paidUsers = new Set(paidOrders.map((order) => order.userId)).size;
  const consumed = state.usage
    .filter((item) => item.status === "success")
    .reduce((sum, item) => sum + Math.abs(item.credits), 0);
  const cost = state.usage.reduce((sum, item) => sum + item.cost, 0);
  const margin = revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="累计注册用户" value={state.users.length.toLocaleString()} note="本月新增 2 位企业客户" tone="brand" />
        <MetricCard label="累计付费用户" value={paidUsers.toLocaleString()} note={`付费转化率 ${Math.round((paidUsers / state.users.length) * 100)}%`} tone="success" />
        <MetricCard label="累计实收" value={`¥${revenue.toLocaleString()}`} note={`${paidOrders.length} 笔成功订单`} tone="brand" />
        <MetricCard label="模型毛利率" value={`${margin}%`} note={`样本成本 ¥${cost.toFixed(2)}`} tone={margin >= 50 ? "success" : "warning"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <AdminCard className="p-5">
          <SectionTitle title="收入与算力消耗" description="近 7 日归一化趋势，收入与用量分轴观察" />
          <div className="mt-6 grid h-[220px] grid-cols-7 items-end gap-2 sm:gap-4">
            {REVENUE_TREND.map((item) => (
              <div key={item.label} className="flex h-full flex-col justify-end gap-2">
                <div className="flex flex-1 items-end justify-center gap-1">
                  <svg viewBox="0 0 30 100" preserveAspectRatio="none" className="h-full w-full max-w-[36px]" aria-label={`${item.label} 收入 ${item.revenue}，消耗 ${item.usage}`}>
                    <rect x="2" y={100 - item.revenue} width="11" height={item.revenue} rx="3" fill="var(--brand)" opacity="0.9" />
                    <rect x="17" y={100 - item.usage} width="11" height={item.usage} rx="3" fill="var(--info)" opacity="0.55" />
                  </svg>
                </div>
                <span className="text-center text-[10px] text-white/35">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-5 text-[11px] text-white/45">
            <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-brand" />收入</span>
            <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-info" />算力消耗</span>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <SectionTitle title="运营预警" description="需要管理员优先处理的经营信号" />
          <div className="mt-5 space-y-3">
            <AlertRow Icon={CpuIcon} tone="warning" title="Doubao Pro 服务降级" detail="P95 延迟高于 8 秒，已持续 26 分钟" />
            <AlertRow Icon={UserGroupIcon} tone="danger" title="1 个风险用户待复核" detail="任务失败率与请求频率同时异常" />
            <AlertRow Icon={CoinsIcon} tone="info" title="专业版年付使用率 78%" detail="接近 82% 盈亏平衡阈值，建议观察" />
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard className="overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-4">
            <SectionTitle title="模型供给状态" description="API 健康度、并发和积分售价" />
          </div>
          <div className="divide-y divide-white/[0.06]">
            {state.models.map((model) => (
              <div key={model.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.05] text-white/60">
                  <CpuIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-white">{model.name}</span>
                  <span className="text-[11px] text-white/38">{model.vendor} · 并发 {model.maxConcurrency}</span>
                </span>
                <span className="text-right">
                  <span className="block font-mono text-[12px] text-brand">{model.creditPrice}/{model.billingUnit}</span>
                  <AdminBadge tone={model.health === "healthy" ? "success" : model.health === "degraded" ? "warning" : "danger"}>
                    {model.health === "healthy" ? "正常" : model.health === "degraded" ? "降级" : "离线"}
                  </AdminBadge>
                </span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-4">
            <SectionTitle title="最近管理操作" description="所有权益与价格变更留痕" />
          </div>
          <div className="divide-y divide-white/[0.06]">
            {state.auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-white">{log.action}</span>
                  <span className="shrink-0 text-[10px] text-white/30">{log.createdAt}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] text-white/45">{log.target} · {log.detail}</p>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[12px] text-white/45">本期成功任务积分消耗</p>
            <p className="mt-1 font-mono text-[26px] font-bold text-white">{consumed.toLocaleString()} PT</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px] sm:grid-cols-4">
            <OverviewStat label="启用套餐" value={`${state.plans.filter((plan) => plan.enabled).length}`} />
            <OverviewStat label="充值档位" value={`${state.rechargeTiers.filter((tier) => tier.enabled).length}`} />
            <OverviewStat label="健康模型" value={`${state.models.filter((model) => model.health === "healthy").length}`} />
            <OverviewStat label="企业客户" value={`${state.users.filter((user) => user.organization).length}`} />
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

function AlertRow({
  Icon,
  tone,
  title,
  detail,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  tone: "warning" | "danger" | "info";
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/[0.035] p-3 ring-1 ring-white/[0.06]">
      <span className={`mt-0.5 ${tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : "text-info"}`}>
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-[12px] font-medium text-white/85">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-white/40">{detail}</span>
      </span>
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-white/35">{label}</span>
      <span className="mt-0.5 block font-mono text-[15px] font-semibold text-white">{value}</span>
    </span>
  );
}
