"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AdminBadge,
  AdminCard,
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PRIMARY_BUTTON,
  ADMIN_SECONDARY_BUTTON,
  EmptyState,
  SectionTitle,
} from "@/components/admin/admin-ui";
import { CoinsIcon, CpuIcon, CrownIcon, DocumentIcon, GiftIcon, SearchIcon, UserIcon, UserGroupIcon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { grantEntitlement, updateAdminUserStatus } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import type { AdminState, AdminUser, CreditBucket, EntitlementGrant } from "@/types/admin";

type GrantKind = EntitlementGrant["kind"];

const STATUS_LABEL = { active: "正常", risk: "风险", disabled: "已停用" } as const;
const BUCKET_LABEL: Record<CreditBucket, string> = {
  recharge: "充值积分",
  member: "会员积分",
  gift: "赠送积分",
  enterprise: "企业积分",
};

export function AdminUsers({ state }: { state: AdminState }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AdminUser["status"]>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [grantUser, setGrantUser] = useState<AdminUser | null>(null);
  const [grantKind, setGrantKind] = useState<GrantKind>("credits");
  const [direction, setDirection] = useState<"grant" | "deduct">("grant");
  const [bucket, setBucket] = useState<CreditBucket>("enterprise");
  const [amount, setAmount] = useState("10000");
  const [planId, setPlanId] = useState(state.plans[0]?.id ?? "");
  const [durationDays, setDurationDays] = useState("365");
  const [concurrency, setConcurrency] = useState("20");
  const [quota, setQuota] = useState("100000");
  const [reason, setReason] = useState("");
  const [ledgerUser, setLedgerUser] = useState<AdminUser | null>(null);

  const stats = useMemo(() => {
    const totalUsers = state.users.length;
    const memberUsers = state.users.filter((user) => user.membership.planId !== null).length;
    const totalConsumed = state.users.reduce((sum, user) => sum + user.lifetimeConsumed, 0);
    const totalPaid = state.users.reduce((sum, user) => sum + user.lifetimePaid, 0);
    return { totalUsers, memberUsers, totalConsumed, totalPaid };
  }, [state.users]);

  const rows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return state.users.filter((user) => {
      const matchesStatus = status === "all" || user.status === status;
      const matchesQuery = !keyword || [user.id, user.nickname, user.contact, user.organization ?? ""]
        .some((value) => value.toLowerCase().includes(keyword));
      return matchesStatus && matchesQuery;
    });
  }, [query, state.users, status]);

  const openGrant = (user: AdminUser) => {
    setGrantUser(user);
    setGrantKind("credits");
    setDirection("grant");
    setConcurrency(String(user.maxConcurrency));
    setQuota(String(user.monthlyComputeQuota));
    setReason("");
  };

  const handleGrant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!grantUser || reason.trim().length < 2) {
      toast({ title: "请填写调整原因", description: "原因会写入操作审计日志。", tone: "error" });
      return;
    }
    let grant: EntitlementGrant;
    if (grantKind === "credits") {
      const value = Number(amount);
      if (!Number.isInteger(value) || value < 1) {
        toast({ title: "积分数量不合法", description: "请输入正整数数量。", tone: "error" });
        return;
      }
      if (direction === "grant" && value < state.creditPolicy.minimumGrant) {
        toast({ title: "积分数量不合法", description: `最低发放 ${state.creditPolicy.minimumGrant} 积分。`, tone: "error" });
        return;
      }
      if (direction === "deduct" && grantUser.balances[bucket] < value) {
        toast({ title: "积分余额不足", description: `${grantUser.nickname} 的 ${BUCKET_LABEL[bucket]}账户仅剩 ${grantUser.balances[bucket].toLocaleString()} 积分。`, tone: "error" });
        return;
      }
      const signed = direction === "deduct" ? -value : value;
      grant = { kind: "credits", userId: grantUser.id, bucket, amount: signed, reason: reason.trim() };
    } else if (grantKind === "membership") {
      const days = Number(durationDays);
      if (!planId || !Number.isInteger(days) || days < 1) {
        toast({ title: "会员配置不完整", tone: "error" });
        return;
      }
      grant = { kind: "membership", userId: grantUser.id, planId, durationDays: days, reason: reason.trim() };
    } else {
      const maxConcurrency = Number(concurrency);
      const monthlyComputeQuota = Number(quota);
      if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1 || !Number.isInteger(monthlyComputeQuota) || monthlyComputeQuota < 0) {
        toast({ title: "算力配置不合法", tone: "error" });
        return;
      }
      grant = { kind: "compute", userId: grantUser.id, maxConcurrency, monthlyComputeQuota, reason: reason.trim() };
    }
    try {
      await grantEntitlement(grant);
      toast({ title: "权益已发放", description: `${grantUser.nickname} 的账户已更新并记录审计。`, tone: "success" });
      setGrantUser(null);
    } catch (error) {
      toast({ title: "发放失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  const changeStatus = async (user: AdminUser, next: AdminUser["status"], changeReason: string) => {
    if (changeReason.trim().length < 2) {
      toast({ title: "请填写状态变更原因", description: "原因会写入操作审计日志。", tone: "error" });
      return;
    }
    try {
      await updateAdminUserStatus(user.id, next, changeReason.trim());
      setSelected(null);
      toast({ title: "用户状态已更新", description: `${user.nickname}：${STATUS_LABEL[next]}`, tone: "success" });
    } catch (error) {
      toast({ title: "状态更新失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="用户与企业客户" description="统一查看注册、付费、消耗、余额与定向权益" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={<UserGroupIcon className="size-3.5" />} label="累计注册用户" value={stats.totalUsers.toLocaleString()} />
        <StatTile icon={<CrownIcon className="size-3.5" />} label="会员用户" value={stats.memberUsers.toLocaleString()} hint={`占比 ${stats.totalUsers ? Math.round((stats.memberUsers / stats.totalUsers) * 100) : 0}%`} />
        <StatTile icon={<CoinsIcon className="size-3.5" />} label="累计积分消耗" value={`${stats.totalConsumed.toLocaleString()} PT`} />
        <StatTile icon={<CpuIcon className="size-3.5" />} label="累计付费收入" value={`¥${stats.totalPaid.toLocaleString()}`} />
      </div>
      <AdminCard className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">搜索用户</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-3 size-4 text-white/30" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索手机号 / 邮箱 / 用户 ID / 昵称或企业" className={cn(ADMIN_INPUT, "pl-9")} />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className={cn(ADMIN_INPUT, "sm:w-36")} aria-label="用户状态">
            <option value="all">全部状态</option>
            <option value="active">正常</option>
            <option value="risk">风险</option>
            <option value="disabled">已停用</option>
          </select>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35">
              <tr><Th>用户</Th><Th>注册 / 上次登录</Th><Th>会员</Th><Th>积分余额</Th><Th>累计付费</Th><Th>累计消耗</Th><Th>并发</Th><Th>状态</Th><Th><span className="sr-only">操作</span></Th></tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((user) => {
                const balance = Object.values(user.balances).reduce((sum, value) => sum + value, 0);
                return (
                  <tr key={user.id} className="text-[12px] text-white/65 transition-colors hover:bg-white/[0.025]">
                    <Td><button type="button" onClick={() => setSelected(user)} className="text-left"><span className="block font-medium text-white">{user.nickname}</span><span className="mt-0.5 block text-[10px] text-white/35">{user.id} · {user.organization ?? "个人用户"}</span></button></Td>
                    <Td><span className="block">{user.registeredAt}</span><span className="mt-0.5 block text-[10px] text-white/35">{user.lastActiveAt}</span></Td>
                    <Td><span className="text-white/80">{user.membership.planName}</span><span className="mt-0.5 block text-[10px] text-white/35">{user.membership.expiresAt ?? "长期有效"}</span></Td>
                    <Td><span className="font-mono text-brand">{balance.toLocaleString()}</span></Td>
                    <Td><span className="font-mono">¥{user.lifetimePaid.toLocaleString()}</span></Td>
                    <Td><span className="font-mono">{user.lifetimeConsumed.toLocaleString()} PT</span></Td>
                    <Td>{user.maxConcurrency}</Td>
                    <Td><StatusBadge status={user.status} /></Td>
                    <Td><div className="flex gap-1.5"><button type="button" onClick={() => setLedgerUser(user)} className={ADMIN_SECONDARY_BUTTON} title="资产流水日志"><DocumentIcon className="size-3.5" />流水</button><button type="button" onClick={() => openGrant(user)} className={ADMIN_SECONDARY_BUTTON}><GiftIcon className="size-3.5" />配置权益</button></div></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <EmptyState text="没有匹配的用户" /> : null}
      </AdminCard>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title="用户详情" className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[760px] overflow-y-auto p-5 sm:p-6">
        {selected ? <UserDetail user={selected} onGrant={() => { setSelected(null); openGrant(selected); }} onLedger={() => { setSelected(null); setLedgerUser(selected); }} onStatus={(next, changeReason) => void changeStatus(selected, next, changeReason)} /> : null}
      </Modal>

      <Modal open={ledgerUser !== null} onClose={() => setLedgerUser(null)} title="资产流水" className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[860px] overflow-y-auto p-5 sm:p-6">
        {ledgerUser ? <UserLedger user={ledgerUser} state={state} /> : null}
      </Modal>

      <Modal open={grantUser !== null} onClose={() => setGrantUser(null)} title="定向配置权益" className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[620px] overflow-y-auto p-5 sm:p-6">
        {grantUser ? (
          <form onSubmit={handleGrant}>
            <h2 className="text-[18px] font-semibold text-white">为 {grantUser.nickname} 配置权益</h2>
            <p className="mt-1 text-[12px] text-white/40">变更即时生效，并记录管理员、原因和配置内容。</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {(["credits", "membership", "compute"] as const).map((kind) => (
                <button key={kind} type="button" onClick={() => setGrantKind(kind)} className={cn("h-10 rounded-full text-[12px] font-medium ring-1 transition-colors", grantKind === kind ? "bg-brand/12 text-brand ring-brand/30" : "bg-white/[0.04] text-white/50 ring-white/[0.08] hover:text-white")}>
                  {kind === "credits" ? "调积分" : kind === "membership" ? "配会员" : "配算力"}
                </button>
              ))}
            </div>
            {grantKind === "credits" ? (
              <div className="mt-3 flex gap-2">
                {(["grant", "deduct"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setDirection(mode)} className={cn("h-9 flex-1 rounded-full text-[12px] font-medium ring-1 transition-colors", direction === mode ? (mode === "grant" ? "bg-brand/12 text-brand ring-brand/30" : "bg-danger/10 text-danger ring-danger/25") : "bg-white/[0.04] text-white/50 ring-white/[0.08] hover:text-white")}>
                    {mode === "grant" ? "增加积分" : "扣减积分"}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {grantKind === "credits" ? <><Field label="积分账户"><select value={bucket} onChange={(event) => setBucket(event.target.value as CreditBucket)} className={ADMIN_INPUT}>{Object.entries(BUCKET_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label={direction === "grant" ? "发放数量" : "扣减数量"}><input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className={ADMIN_INPUT} /><span className="mt-1 block text-[10px] text-white/30">{direction === "deduct" ? `当前账户余额 ${grantUser.balances[bucket].toLocaleString()} 积分` : `最低发放 ${state.creditPolicy.minimumGrant} 积分`}</span></Field></> : null}
              {grantKind === "membership" ? <><Field label="会员套餐"><select value={planId} onChange={(event) => setPlanId(event.target.value)} className={ADMIN_INPUT}>{state.plans.filter((plan) => plan.enabled).map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></Field><Field label="有效天数"><input type="number" min="1" step="1" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className={ADMIN_INPUT} /></Field></> : null}
              {grantKind === "compute" ? <><Field label="任务并发上限"><input type="number" min="1" step="1" value={concurrency} onChange={(event) => setConcurrency(event.target.value)} className={ADMIN_INPUT} /></Field><Field label="月算力额度"><input type="number" min="0" step="1" value={quota} onChange={(event) => setQuota(event.target.value)} className={ADMIN_INPUT} /></Field></> : null}
              <div className="sm:col-span-2"><Field label={`${direction === "deduct" && grantKind === "credits" ? "扣减" : "发放"}原因（必填，写入审计日志）`}><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：企业合同到账 / 客诉补偿 / 误发冲正 / 风控处置" className={cn(ADMIN_INPUT, "h-24 resize-none py-3")} /></Field></div>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setGrantUser(null)} className={ADMIN_SECONDARY_BUTTON}>取消</button><button type="submit" className={ADMIN_PRIMARY_BUTTON}>确认发放</button></div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}

function UserDetail({ user, onGrant, onLedger, onStatus }: { user: AdminUser; onGrant: () => void; onLedger: () => void; onStatus: (status: AdminUser["status"], reason: string) => void }) {
  const [statusReason, setStatusReason] = useState("");
  const total = Object.values(user.balances).reduce((sum, value) => sum + value, 0);
  const [registeredDays] = useState(() =>
    Math.max(1, Math.floor((Date.now() - new Date(user.registeredAt.replace(" ", "T")).getTime()) / 86_400_000)),
  );
  return (
    <div>
      <div className="flex items-start gap-3 pr-8"><span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><UserIcon className="size-5" /></span><span><h2 className="text-[18px] font-semibold text-white">{user.nickname}</h2><p className="mt-1 text-[11px] text-white/40">{user.id} · {user.contact} · {user.organization ?? "个人用户"}</p></span></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Mini label="总余额" value={total.toLocaleString()} icon={<CoinsIcon className="size-3.5" />} /><Mini label="累计付费" value={`¥${user.lifetimePaid.toLocaleString()}`} /><Mini label="累计任务" value={user.taskCount.toLocaleString()} /><Mini label="当前并发" value={String(user.maxConcurrency)} icon={<CpuIcon className="size-3.5" />} /></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><InfoBlock title="账户生命周期"><Info label="注册时间" value={user.registeredAt} /><Info label="累计注册时长" value={`${registeredDays.toLocaleString()} 天`} /><Info label="上次登录" value={user.lastActiveAt} /><Info label="账户状态" value={STATUS_LABEL[user.status]} /></InfoBlock><InfoBlock title="会员与算力"><Info label="会员档位" value={user.membership.planName} /><Info label="到期时间" value={user.membership.expiresAt ?? "长期有效"} /><Info label="月算力额度" value={user.monthlyComputeQuota.toLocaleString()} /></InfoBlock></div>
      <InfoBlock title="积分账户" className="mt-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries(user.balances).map(([key, value]) => <span key={key}><span className="block text-[10px] text-white/35">{BUCKET_LABEL[key as CreditBucket]}</span><span className="mt-1 block font-mono text-[13px] text-white">{value.toLocaleString()}</span></span>)}</div></InfoBlock>
      <InfoBlock title="功能白名单" className="mt-4"><div className="flex flex-wrap gap-2">{user.featureWhitelist.map((feature) => <AdminBadge key={feature} tone="brand">{feature}</AdminBadge>)}</div></InfoBlock>
      <div className="mt-4"><span className={ADMIN_LABEL}>状态变更原因（必填）</span><input value={statusReason} onChange={(event) => setStatusReason(event.target.value)} placeholder="例如：风控复核通过 / 请求频率异常 / 违规内容确认" className={ADMIN_INPUT} /></div>
      <div className="mt-4 flex flex-wrap justify-between gap-3"><div className="flex gap-2">{user.status !== "active" ? <button type="button" onClick={() => onStatus("active", statusReason)} className={ADMIN_SECONDARY_BUTTON}>恢复正常</button> : null}{user.status !== "risk" ? <button type="button" onClick={() => onStatus("risk", statusReason)} className={ADMIN_SECONDARY_BUTTON}>标记风险</button> : null}{user.status !== "disabled" ? <button type="button" onClick={() => onStatus("disabled", statusReason)} className="inline-flex h-9 items-center rounded-full bg-danger/10 px-4 text-[12px] font-medium text-danger ring-1 ring-danger/20">停用账户</button> : null}</div><div className="flex gap-2"><button type="button" onClick={onLedger} className={ADMIN_SECONDARY_BUTTON}><DocumentIcon className="size-3.5" />资产流水</button><button type="button" onClick={onGrant} className={ADMIN_PRIMARY_BUTTON}>配置权益</button></div></div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminUser["status"] }) { return <AdminBadge tone={status === "active" ? "success" : status === "risk" ? "warning" : "danger"}>{STATUS_LABEL[status]}</AdminBadge>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-4 py-3.5">{children}</td>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className={ADMIN_LABEL}>{label}</span>{children}</label>; }
function Mini({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="rounded-xl bg-white/[0.035] p-3 ring-1 ring-white/[0.07]"><span className="flex items-center gap-1.5 text-[10px] text-white/35">{icon}{label}</span><span className="mt-1.5 block font-mono text-[15px] font-semibold text-white">{value}</span></div>; }
function InfoBlock({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) { return <div className={cn("rounded-xl bg-white/[0.025] p-4 ring-1 ring-white/[0.07]", className)}><h3 className="mb-3 text-[12px] font-semibold text-white/75">{title}</h3>{children}</div>; }
function Info({ label, value }: { label: string; value: string }) { return <p className="flex justify-between gap-4 py-1.5 text-[11px]"><span className="text-white/35">{label}</span><span className="text-right text-white/70">{value}</span></p>; }

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] p-4 ring-1 ring-white/[0.07]">
      <span className="flex items-center gap-1.5 text-[11px] text-white/40">{icon}{label}</span>
      <span className="mt-2 block font-mono text-[22px] font-semibold tracking-[-0.02em] text-white">{value}</span>
      {hint ? <span className="mt-1 block text-[10px] text-white/30">{hint}</span> : null}
    </div>
  );
}

const LEDGER_ACTION_LABEL: Record<string, string> = {
  "企业积分发放": "积分发放",
  "定向积分发放": "积分发放",
  "定向积分扣减": "积分扣减",
  "大额积分发放待审批": "大额发放待审批",
  "定向会员配置": "会员配置",
  "定向算力配置": "算力配置",
  "用户风控": "风控处置",
  "用户状态变更": "状态变更",
};

/** 用户资产流水：任务消耗（负）+ 管理端发放/扣减（审计）合并时间线，另附订单记录。 */
function UserLedger({ user, state }: { user: AdminUser; state: AdminState }) {
  type Row = { key: string; time: string; type: string; detail: string; delta: number | null; operator: string };
  const rows: Row[] = useMemo(() => {
    const usageRows: Row[] = state.usage
      .filter((item) => item.userId === user.id && item.status === "success")
      .map((item) => ({
        key: `usage-${item.id}`,
        time: item.createdAt,
        type: "任务消耗",
        detail: `${item.modelName} · ${item.taskType} · ${item.project}`,
        delta: -Math.abs(item.credits),
        operator: "系统",
      }));
    const auditRows: Row[] = state.auditLogs
      .filter((log) => log.target === `user:${user.id}`)
      .map((log) => ({
        key: `audit-${log.id}`,
        time: log.createdAt,
        type: LEDGER_ACTION_LABEL[log.action] ?? "管理操作",
        detail: log.detail,
        delta: log.amount,
        operator: log.operator,
      }));
    return [...usageRows, ...auditRows].sort((a, b) => b.time.localeCompare(a.time));
  }, [state.auditLogs, state.usage, user.id]);

  const orders = useMemo(
    () => state.orders.filter((order) => order.userId === user.id).sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    [state.orders, user.id],
  );

  return (
    <div>
      <div className="flex items-start gap-3 pr-8">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><DocumentIcon className="size-5" /></span>
        <span>
          <h2 className="text-[18px] font-semibold text-white">{user.nickname} 的资产流水</h2>
          <p className="mt-1 text-[11px] text-white/40">{user.id} · {user.contact} · 积分变动与管理操作全量留痕</p>
        </span>
      </div>
      <InfoBlock title={`积分流水（${rows.length} 条）`} className="mt-5">
        {rows.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-white/35">暂无流水记录</p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#141414] text-[10px] text-white/35"><tr><th className="px-2 py-2 font-medium">时间</th><th className="px-2 py-2 font-medium">类型</th><th className="px-2 py-2 font-medium">说明</th><th className="px-2 py-2 text-right font-medium">积分变动</th><th className="px-2 py-2 font-medium">操作方</th></tr></thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rows.map((row) => (
                  <tr key={row.key} className="text-[11px] text-white/65">
                    <td className="whitespace-nowrap px-2 py-2.5 font-mono text-[10px] text-white/45">{row.time}</td>
                    <td className="whitespace-nowrap px-2 py-2.5"><AdminBadge tone={row.type.includes("扣减") ? "danger" : row.type === "任务消耗" ? "neutral" : "brand"}>{row.type}</AdminBadge></td>
                    <td className="max-w-[280px] truncate px-2 py-2.5" title={row.detail}>{row.detail}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-right font-mono">{row.delta === null ? <span className="text-white/25">—</span> : <span className={row.delta < 0 ? "text-danger" : "text-brand"}>{row.delta > 0 ? "+" : ""}{row.delta.toLocaleString()}</span>}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-white/45">{row.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoBlock>
      <InfoBlock title={`订单记录（${orders.length} 条）`} className="mt-4">
        {orders.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-white/35">暂无订单</p>
        ) : (
          <div className="max-h-[220px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#141414] text-[10px] text-white/35"><tr><th className="px-2 py-2 font-medium">时间</th><th className="px-2 py-2 font-medium">商品</th><th className="px-2 py-2 text-right font-medium">金额</th><th className="px-2 py-2 text-right font-medium">积分</th><th className="px-2 py-2 font-medium">渠道</th><th className="px-2 py-2 font-medium">状态</th></tr></thead>
              <tbody className="divide-y divide-white/[0.05]">
                {orders.map((order) => (
                  <tr key={order.id} className="text-[11px] text-white/65">
                    <td className="whitespace-nowrap px-2 py-2.5 font-mono text-[10px] text-white/45">{order.paidAt}</td>
                    <td className="whitespace-nowrap px-2 py-2.5">{order.product}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-right font-mono">¥{order.amount.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-right font-mono text-brand">+{order.credits.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-white/45">{order.channel === "wechat" ? "微信" : order.channel === "alipay" ? "支付宝" : order.channel === "bank" ? "对公转账" : "余额支付"}</td>
                    <td className="whitespace-nowrap px-2 py-2.5"><AdminBadge tone={order.status === "paid" ? "success" : order.status === "refunded" ? "danger" : "neutral"}>{order.status === "paid" ? "已支付" : order.status === "refunded" ? "已退款" : order.status === "pending" ? "待支付" : "已关闭"}</AdminBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoBlock>
    </div>
  );
}
