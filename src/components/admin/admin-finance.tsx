"use client";

import { useMemo, useState } from "react";
import {
  AdminBadge,
  AdminCard,
  ADMIN_INPUT,
  EmptyState,
  MetricCard,
  SectionTitle,
} from "@/components/admin/admin-ui";
import { CoinsIcon, SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { AdminOrder, AdminState, UsageLedgerItem } from "@/types/admin";

const ORDER_STATUS = { paid: "已支付", refunded: "已退款", pending: "待支付", closed: "已关闭" } as const;
const USAGE_STATUS = { success: "成功", failed: "失败", refunded: "已退回" } as const;
const CHANNEL = { wechat: "微信", alipay: "支付宝", bank: "银行转账", balance: "余额" } as const;

export function AdminFinance({ state }: { state: AdminState }) {
  const [tab, setTab] = useState<"orders" | "usage">("orders");
  const [query, setQuery] = useState("");
  const users = useMemo(() => new Map(state.users.map((user) => [user.id, user])), [state.users]);
  const keyword = query.trim().toLowerCase();
  const orders = state.orders.filter((order) => !keyword || [order.id, order.userId, order.product, users.get(order.userId)?.nickname ?? ""].some((value) => value.toLowerCase().includes(keyword)));
  const usage = state.usage.filter((item) => !keyword || [item.id, item.userId, item.modelName, item.project, users.get(item.userId)?.nickname ?? ""].some((value) => value.toLowerCase().includes(keyword)));
  const paid = state.orders.filter((order) => order.status === "paid");
  const revenue = paid.reduce((sum, order) => sum + order.amount, 0);
  const consumed = state.usage.reduce((sum, item) => sum + Math.abs(item.credits), 0);
  const cost = state.usage.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-5">
      <SectionTitle title="订单与消费明细" description="订单收入和模型任务消耗分账核对，支持按用户、订单或任务检索" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="成功实收" value={`¥${revenue.toLocaleString()}`} note={`${paid.length} 笔成功订单`} tone="brand" />
        <MetricCard label="退款金额" value={`¥${state.orders.filter((order) => order.status === "refunded").reduce((sum, order) => sum + order.amount, 0).toLocaleString()}`} note="支付渠道原路退回" tone="warning" />
        <MetricCard label="累计扣除" value={`${consumed.toLocaleString()} PT`} note="含成功与退回任务" />
        <MetricCard label="供应商成本" value={`¥${cost.toFixed(2)}`} note="用于毛利与异常定价监控" tone="success" />
      </div>
      <AdminCard className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.07]">
            <Tab active={tab === "orders"} onClick={() => setTab("orders")}>充值订单</Tab>
            <Tab active={tab === "usage"} onClick={() => setTab("usage")}>消费流水</Tab>
          </div>
          <label className="relative w-full sm:max-w-[360px]"><span className="sr-only">搜索流水</span><SearchIcon className="pointer-events-none absolute left-3 top-3 size-4 text-white/30" /><input value={query} onChange={(event) => setQuery(event.target.value)} className={cn(ADMIN_INPUT, "pl-9")} placeholder="订单号 / 任务号 / 用户 / 项目" /></label>
        </div>
      </AdminCard>

      {tab === "orders" ? <OrderTable orders={orders} users={users} /> : <UsageTable usage={usage} users={users} creditsPerYuan={state.creditPolicy.creditsPerYuan} />}
    </div>
  );
}

function OrderTable({ orders, users }: { orders: AdminOrder[]; users: Map<string, AdminState["users"][number]> }) {
  return (
    <AdminCard className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left"><thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35"><tr><Th>订单号</Th><Th>用户</Th><Th>商品</Th><Th>金额 / 积分</Th><Th>渠道</Th><Th>支付时间</Th><Th>状态</Th></tr></thead><tbody className="divide-y divide-white/[0.06]">{orders.map((order) => <tr key={order.id} className="text-[12px] text-white/65 hover:bg-white/[0.025]"><Td><span className="font-mono text-white/80">{order.id}</span></Td><Td><span className="block text-white/80">{users.get(order.userId)?.nickname ?? order.userId}</span><span className="text-[10px] text-white/30">{order.userId}</span></Td><Td>{order.product}</Td><Td><span className="block font-mono text-white">¥{order.amount.toLocaleString()}</span><span className="text-[10px] text-brand">+{order.credits.toLocaleString()} PT</span></Td><Td>{CHANNEL[order.channel]}</Td><Td>{order.paidAt}</Td><Td><AdminBadge tone={order.status === "paid" ? "success" : order.status === "refunded" ? "warning" : "neutral"}>{ORDER_STATUS[order.status]}</AdminBadge></Td></tr>)}</tbody></table></div>{orders.length === 0 ? <EmptyState text="没有匹配的订单" /> : null}</AdminCard>
  );
}

function UsageTable({ usage, users, creditsPerYuan }: { usage: UsageLedgerItem[]; users: Map<string, AdminState["users"][number]>; creditsPerYuan: number }) {
  return (
    <AdminCard className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35"><tr><Th>任务号</Th><Th>用户</Th><Th>项目 / 类型</Th><Th>模型</Th><Th>计量</Th><Th>积分扣除</Th><Th>供应商成本</Th><Th>估算毛利</Th><Th>时间</Th><Th>状态</Th></tr></thead><tbody className="divide-y divide-white/[0.06]">{usage.map((item) => { const revenue = Math.abs(item.credits) / creditsPerYuan; const gross = revenue - item.cost; return <tr key={item.id} className="text-[12px] text-white/65 hover:bg-white/[0.025]"><Td><span className="font-mono text-white/80">{item.id}</span></Td><Td><span className="block text-white/80">{users.get(item.userId)?.nickname ?? item.userId}</span><span className="text-[10px] text-white/30">{item.userId}</span></Td><Td><span className="block max-w-[190px] truncate text-white/80">{item.project}</span><span className="text-[10px] text-white/35">{item.taskType}</span></Td><Td>{item.modelName}</Td><Td>{item.units}</Td><Td><span className={cn("font-mono", item.credits < 0 ? "text-warning" : "text-success")}>{item.credits.toLocaleString()} PT</span></Td><Td><span className="font-mono">¥{item.cost.toFixed(2)}</span></Td><Td><span className={cn("font-mono", gross >= 0 ? "text-success" : "text-danger")}>¥{gross.toFixed(2)}</span></Td><Td>{item.createdAt}</Td><Td><AdminBadge tone={item.status === "success" ? "success" : item.status === "failed" ? "danger" : "warning"}>{USAGE_STATUS[item.status]}</AdminBadge></Td></tr>; })}</tbody></table></div>{usage.length === 0 ? <EmptyState text="没有匹配的消费记录" /> : null}<div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3 text-[11px] text-white/35"><CoinsIcon className="size-3.5 text-brand" />毛利按当前积分汇率估算，不替代财务结算报表。</div></AdminCard>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={cn("h-8 rounded-full px-4 text-[12px] font-medium transition-colors", active ? "bg-brand text-brand-foreground" : "text-white/45 hover:text-white")}>{children}</button>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-4 py-3.5">{children}</td>; }
