"use client";

import { useEffect, useState, useSyncExternalStore, type ComponentType } from "react";
import { AdminFinance } from "@/components/admin/admin-finance";
import { AdminModels } from "@/components/admin/admin-models";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminPlans } from "@/components/admin/admin-plans";
import { AdminSettings } from "@/components/admin/admin-settings";
import { AdminUsers } from "@/components/admin/admin-users";
import { AdminBadge } from "@/components/admin/admin-ui";
import { CoinsIcon, CpuIcon, LayoutGridIcon, RefreshCwIcon, SettingsIcon, UserGroupIcon } from "@/components/icons";
import {
  getAdminServerState,
  getAdminState,
  getAdminStoreError,
  getAdminStoreStatus,
  loadAdminState,
  subscribeAdminState,
} from "@/lib/admin-store";
import { cn } from "@/lib/utils";

type View = "overview" | "users" | "finance" | "plans" | "models" | "settings";
const NAV: { id: View; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "经营概览", Icon: LayoutGridIcon },
  { id: "users", label: "用户管理", Icon: UserGroupIcon },
  { id: "finance", label: "订单与消费", Icon: CoinsIcon },
  { id: "plans", label: "套餐权益", Icon: SettingsIcon },
  { id: "models", label: "模型 API", Icon: CpuIcon },
  { id: "settings", label: "积分与审计", Icon: SettingsIcon },
];

export function AdminConsole() {
  const [view, setView] = useState<View>("overview");
  const state = useSyncExternalStore(subscribeAdminState, getAdminState, getAdminServerState);
  const status = useSyncExternalStore(subscribeAdminState, getAdminStoreStatus, () => "idle" as const);
  const error = useSyncExternalStore(subscribeAdminState, getAdminStoreError, () => null);

  useEffect(() => {
    void loadAdminState();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-[#0b0b0b]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:py-7">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div><div className="flex items-center gap-2"><h1 className="text-[24px] font-bold tracking-[-0.02em] text-white sm:text-[28px]">商业化控制台</h1><AdminBadge tone="brand">企业管理员</AdminBadge></div><p className="mt-1.5 text-[12px] text-white/40">统一管理用户价值、充值消费、套餐权益、模型成本与算力供给</p></div>
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <span className={cn("size-1.5 rounded-full", status === "ready" ? "bg-success" : status === "loading" ? "animate-pulse bg-warning" : status === "error" ? "bg-danger" : "bg-white/25")} />
            {status === "loading" ? "正在同步控制面数据…" : status === "error" ? "数据同步失败" : status === "ready" ? "控制面数据已同步" : "等待同步"}
          </div>
        </header>
        <nav aria-label="商业化控制台模块" className="mt-6 overflow-x-auto pb-1"><div className="flex min-w-max gap-1 rounded-2xl bg-[#141414] p-1.5 ring-1 ring-white/[0.07]">{NAV.map(({ id, label, Icon }) => <button key={id} type="button" onClick={() => setView(id)} aria-current={view === id ? "page" : undefined} className={cn("flex h-10 items-center gap-2 rounded-xl px-3.5 text-[12px] font-medium transition-colors", view === id ? "bg-brand/12 text-brand ring-1 ring-brand/20" : "text-white/42 hover:bg-white/[0.04] hover:text-white")}><Icon className="size-4" />{label}</button>)}</div></nav>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">配置流程：编辑 → 校验保存 → 审计追溯。前台价格发布与生成任务权益校验尚未接通。</p>
        {status === "error" ? (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-[#141414] p-10 text-center ring-1 ring-white/[0.08]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-danger/10 text-danger"><RefreshCwIcon className="size-5" /></span>
            <div>
              <h2 className="text-[16px] font-semibold text-white">数据加载失败</h2><p className="mt-2 text-sm text-muted-foreground">当前模块：{NAV.find((item) => item.id === view)?.label}。数据恢复前不提供编辑操作。</p>
              <p className="mt-1.5 max-w-[520px] text-[12px] leading-relaxed text-white/45">{error ?? "请稍后重试"}</p>
            </div>
            <ol aria-label="后台恢复步骤" className="list-inside list-decimal space-y-2 text-left text-xs leading-5 text-muted-foreground">
              <li>确认管理员权限与服务连接正常。</li>
              <li>若提示数据库未配置，由部署人员配置数据库并完成迁移。</li>
              <li>重新加载并核对数据后，再进行配置修改；不会展示演示数据替代真实结果。</li>
            </ol>
            <button type="button" onClick={() => void loadAdminState()} className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-[13px] font-semibold text-brand-foreground"><RefreshCwIcon className="size-3.5" />重新加载</button>
          </div>
        ) : status === "loading" || status === "idle" ? (
          <div className="mt-6 space-y-4"><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[0, 1, 2, 3].map((key) => <div key={key} className="h-[104px] animate-pulse rounded-2xl bg-white/[0.04]" />)}</div><div className="h-[300px] animate-pulse rounded-2xl bg-white/[0.03]" /></div>
        ) : (
          <>
            <div className="mt-6">{view === "overview" ? <AdminOverview state={state} /> : null}{view === "users" ? <AdminUsers state={state} /> : null}{view === "finance" ? <AdminFinance state={state} /> : null}{view === "plans" ? <AdminPlans state={state} /> : null}{view === "models" ? <AdminModels state={state} /> : null}{view === "settings" ? <AdminSettings state={state} /> : null}</div>
          </>
        )}
      </div>
    </div>
  );
}
