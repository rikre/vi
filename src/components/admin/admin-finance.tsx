"use client";

import { useMemo, useRef, useState } from "react";
import {
  AdminBadge,
  AdminCard,
  ADMIN_INPUT,
  EmptyState,
  MetricCard,
  SectionTitle,
} from "@/components/admin/admin-ui";
import { BuildingIcon, CoinsIcon, SearchIcon } from "@/components/icons";
import { discountLabel } from "@/lib/enterprise-pricing";
import { cn } from "@/lib/utils";
import type { AdminOrder, AdminState, UsageLedgerItem } from "@/types/admin";

const ORDER_STATUS = { paid: "已支付", refunded: "已退款", pending: "待支付", closed: "已关闭" } as const;
const USAGE_STATUS = { success: "成功", failed: "失败", refunded: "已退回" } as const;
const CHANNEL = { wechat: "微信", alipay: "支付宝", bank: "对公转账", balance: "余额" } as const;

/** 订单与消费内部页签：普通用户订单 / 企业订单 / 消费流水 */
type FinanceTab = "personal" | "enterprise" | "usage";
const TABS: { id: FinanceTab; label: string }[] = [
  { id: "personal", label: "用户订单" },
  { id: "enterprise", label: "企业订单" },
  { id: "usage", label: "消费流水" },
];

export function AdminFinance({ state }: { state: AdminState }) {
  const [tab, setTab] = useState<FinanceTab>("personal");
  const [query, setQuery] = useState("");
  const tablistRef = useRef<HTMLDivElement>(null);
  const users = useMemo(() => new Map(state.users.map((user) => [user.id, user])), [state.users]);
  const keyword = query.trim().toLowerCase();

  const personalOrders = useMemo(
    () => state.orders.filter((order) => order.organization === null),
    [state.orders],
  );
  const enterpriseOrders = useMemo(
    () => state.orders.filter((order) => order.organization !== null),
    [state.orders],
  );
  const orders = (tab === "enterprise" ? enterpriseOrders : personalOrders)
    .filter((order) => !keyword || [order.id, order.userId, order.product, order.organization ?? "", users.get(order.userId)?.nickname ?? ""]
      .some((value) => value.toLowerCase().includes(keyword)));
  const usage = state.usage.filter((item) => !keyword || [item.id, item.userId, item.modelName, item.project, users.get(item.userId)?.nickname ?? ""].some((value) => value.toLowerCase().includes(keyword)));

  const personalRevenue = personalOrders.filter((order) => order.status === "paid").reduce((sum, order) => sum + order.amount, 0);
  const enterpriseRevenue = enterpriseOrders.filter((order) => order.status === "paid").reduce((sum, order) => sum + order.amount, 0);
  const enterpriseCredits = enterpriseOrders.reduce((sum, order) => sum + order.credits, 0);
  const consumed = state.usage.reduce((sum, item) => sum + Math.abs(item.credits), 0);
  const cost = state.usage.reduce((sum, item) => sum + item.cost, 0);

  /** tablist 键盘导航：左右方向键在页签间移动。 */
  const onTablistKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = TABS.findIndex((item) => item.id === tab);
    const next = event.key === "ArrowRight"
      ? (index + 1) % TABS.length
      : (index - 1 + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tablistRef.current?.querySelector<HTMLButtonElement>(`#finance-tab-${TABS[next].id}`)?.focus();
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="订单与消费明细" description="普通用户订单与企业订单分账核对，支持按用户、订单或任务检索" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="用户订单实收" value={`¥${personalRevenue.toLocaleString()}`} note={`${personalOrders.filter((order) => order.status === "paid").length} 笔个人充值`} tone="brand" />
        <MetricCard label="企业订单实收" value={`¥${enterpriseRevenue.toLocaleString()}`} note={`${enterpriseOrders.length} 笔企业订单 · ${enterpriseCredits.toLocaleString()} PT`} tone="success" />
        <MetricCard label="累计扣除" value={`${consumed.toLocaleString()} PT`} note="含成功与退回任务" />
        <MetricCard label="供应商成本" value={`¥${cost.toFixed(2)}`} note="用于毛利与异常定价监控" tone="warning" />
      </div>
      <AdminCard className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            ref={tablistRef}
            role="tablist"
            aria-label="订单与消费视图"
            onKeyDown={onTablistKeyDown}
            className="flex rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.07]"
          >
            {TABS.map((item) => (
              <button
                key={item.id}
                id={`finance-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                aria-controls={`finance-panel-${item.id}`}
                tabIndex={tab === item.id ? 0 : -1}
                onClick={() => setTab(item.id)}
                className={cn("h-8 rounded-full px-4 text-[12px] font-medium transition-colors", tab === item.id ? "bg-brand text-brand-foreground" : "text-white/45 hover:text-white")}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="relative w-full sm:max-w-[360px]"><span className="sr-only">搜索流水</span><SearchIcon className="pointer-events-none absolute left-3 top-3 size-4 text-white/30" /><input value={query} onChange={(event) => setQuery(event.target.value)} className={cn(ADMIN_INPUT, "pl-9")} placeholder="订单号 / 任务号 / 用户 / 项目" /></label>
        </div>
      </AdminCard>

      <div
        id="finance-panel-personal"
        role="tabpanel"
        aria-labelledby="finance-tab-personal"
        hidden={tab !== "personal"}
      >
        {tab === "personal" ? <OrderTable orders={orders} users={users} /> : null}
      </div>
      <div
        id="finance-panel-enterprise"
        role="tabpanel"
        aria-labelledby="finance-tab-enterprise"
        hidden={tab !== "enterprise"}
      >
        {tab === "enterprise" ? <OrderTable orders={orders} users={users} enterprise /> : null}
      </div>
      <div
        id="finance-panel-usage"
        role="tabpanel"
        aria-labelledby="finance-tab-usage"
        hidden={tab !== "usage"}
      >
        {tab === "usage" ? <UsageTable usage={usage} users={users} creditsPerYuan={state.creditPolicy.creditsPerYuan} /> : null}
      </div>
    </div>
  );
}

function OrderTable({
  orders,
  users,
  enterprise = false,
}: {
  orders: AdminOrder[];
  users: Map<string, AdminState["users"][number]>;
  enterprise?: boolean;
}) {
  return (
    <AdminCard className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35"><tr>{enterprise ? <Th>企业 / 折扣</Th> : null}<Th>订单号</Th><Th>用户</Th><Th>商品</Th><Th>金额 / 积分</Th><Th>渠道</Th><Th>支付时间</Th><Th>状态</Th></tr></thead><tbody className="divide-y divide-white/[0.06]">{orders.map((order) => <tr key={order.id} className="text-[12px] text-white/65 hover:bg-white/[0.025]">{enterprise ? <Td><span className="flex items-center gap-1.5 text-white/80"><BuildingIcon className="size-3.5 text-brand" />{order.organization ?? "—"}</span>{order.discountPct !== null && order.discountPct > 0 ? <span className="mt-0.5 block"><AdminBadge tone="brand">{discountLabel(order.discountPct)}</AdminBadge></span> : <span className="mt-0.5 block text-[10px] text-white/30">无折扣</span>}</Td> : null}<Td><span className="font-mono text-white/80">{order.id}</span></Td><Td><span className="block text-white/80">{users.get(order.userId)?.nickname ?? order.userId}</span><span className="text-[10px] text-white/30">{order.userId}</span></Td><Td>{order.product}</Td><Td><span className="block font-mono text-white">¥{order.amount.toLocaleString()}</span><span className="text-[10px] text-brand">+{order.credits.toLocaleString()} PT</span></Td><Td>{CHANNEL[order.channel]}</Td><Td>{order.paidAt}</Td><Td><AdminBadge tone={order.status === "paid" ? "success" : order.status === "refunded" ? "warning" : "neutral"}>{ORDER_STATUS[order.status]}</AdminBadge></Td></tr>)}</tbody></table></div>{orders.length === 0 ? <EmptyState text={enterprise ? "暂无企业订单，可在企业管理中开单" : "没有匹配的订单"} /> : null}</AdminCard>
  );
}

function UsageTable({ usage, users, creditsPerYuan }: { usage: UsageLedgerItem[]; users: Map<string, AdminState["users"][number]>; creditsPerYuan: number }) {
  return (
    <AdminCard className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35"><tr><Th>任务号</Th><Th>用户</Th><Th>项目 / 类型</Th><Th>模型</Th><Th>计量</Th><Th>积分扣除</Th><Th>供应商成本</Th><Th>估算毛利</Th><Th>时间</Th><Th>状态</Th></tr></thead><tbody className="divide-y divide-white/[0.06]">{usage.map((item) => { const revenue = Math.abs(item.credits) / creditsPerYuan; const gross = revenue - item.cost; return <tr key={item.id} className="text-[12px] text-white/65 hover:bg-white/[0.025]"><Td><span className="font-mono text-white/80">{item.id}</span></Td><Td><span className="block text-white/80">{users.get(item.userId)?.nickname ?? item.userId}</span><span className="text-[10px] text-white/30">{item.userId}</span></Td><Td><span className="block max-w-[190px] truncate text-white/80">{item.project}</span><span className="text-[10px] text-white/35">{item.taskType}</span></Td><Td>{item.modelName}</Td><Td>{item.units}</Td><Td><span className={cn("font-mono", item.credits < 0 ? "text-warning" : "text-success")}>{item.credits.toLocaleString()} PT</span></Td><Td><span className="font-mono">¥{item.cost.toFixed(2)}</span></Td><Td><span className={cn("font-mono", gross >= 0 ? "text-success" : "text-danger")}>¥{gross.toFixed(2)}</span></Td><Td>{item.createdAt}</Td><Td><AdminBadge tone={item.status === "success" ? "success" : item.status === "failed" ? "danger" : "warning"}>{USAGE_STATUS[item.status]}</AdminBadge></Td></tr>; })}</tbody></table></div>{usage.length === 0 ? <EmptyState text="没有匹配的消费记录" /> : null}<div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3 text-[11px] text-white/35"><CoinsIcon className="size-3.5 text-brand" />毛利按当前积分汇率估算，不替代财务结算报表。</div></AdminCard>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-4 py-3.5">{children}</td>; }
