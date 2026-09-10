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
import { CoinsIcon, CpuIcon, GiftIcon, SearchIcon, UserIcon } from "@/components/icons";
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
  const [bucket, setBucket] = useState<CreditBucket>("enterprise");
  const [amount, setAmount] = useState("10000");
  const [planId, setPlanId] = useState(state.plans[0]?.id ?? "");
  const [durationDays, setDurationDays] = useState("365");
  const [concurrency, setConcurrency] = useState("20");
  const [quota, setQuota] = useState("100000");
  const [reason, setReason] = useState("");

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
    setConcurrency(String(user.maxConcurrency));
    setQuota(String(user.monthlyComputeQuota));
    setReason("");
  };

  const handleGrant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!grantUser || reason.trim().length < 2) {
      toast({ title: "请填写发放原因", description: "原因会写入操作审计日志。", tone: "error" });
      return;
    }
    let grant: EntitlementGrant;
    if (grantKind === "credits") {
      const value = Number(amount);
      if (!Number.isInteger(value) || value < state.creditPolicy.minimumGrant) {
        toast({ title: "积分数量不合法", description: `最低发放 ${state.creditPolicy.minimumGrant} 积分。`, tone: "error" });
        return;
      }
      grant = { kind: "credits", userId: grantUser.id, bucket, amount: value, reason: reason.trim() };
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
      <AdminCard className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">搜索用户</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-3 size-4 text-white/30" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索用户 ID、昵称、手机、邮箱或企业" className={cn(ADMIN_INPUT, "pl-9")} />
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
          <table className="w-full min-w-[1040px] text-left">
            <thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35">
              <tr><Th>用户</Th><Th>注册 / 最近活跃</Th><Th>会员</Th><Th>积分余额</Th><Th>累计付费</Th><Th>累计消耗</Th><Th>并发</Th><Th>状态</Th><Th><span className="sr-only">操作</span></Th></tr>
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
                    <Td><button type="button" onClick={() => openGrant(user)} className={ADMIN_SECONDARY_BUTTON}><GiftIcon className="size-3.5" />配置权益</button></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <EmptyState text="没有匹配的用户" /> : null}
      </AdminCard>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title="用户详情" className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[760px] overflow-y-auto p-5 sm:p-6">
        {selected ? <UserDetail user={selected} onGrant={() => { setSelected(null); openGrant(selected); }} onStatus={(next, changeReason) => void changeStatus(selected, next, changeReason)} /> : null}
      </Modal>

      <Modal open={grantUser !== null} onClose={() => setGrantUser(null)} title="定向配置权益" className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[620px] overflow-y-auto p-5 sm:p-6">
        {grantUser ? (
          <form onSubmit={handleGrant}>
            <h2 className="text-[18px] font-semibold text-white">为 {grantUser.nickname} 配置权益</h2>
            <p className="mt-1 text-[12px] text-white/40">变更即时生效，并记录管理员、原因和配置内容。</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {(["credits", "membership", "compute"] as const).map((kind) => (
                <button key={kind} type="button" onClick={() => setGrantKind(kind)} className={cn("h-10 rounded-full text-[12px] font-medium ring-1 transition-colors", grantKind === kind ? "bg-brand/12 text-brand ring-brand/30" : "bg-white/[0.04] text-white/50 ring-white/[0.08] hover:text-white")}>
                  {kind === "credits" ? "加积分" : kind === "membership" ? "配会员" : "配算力"}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {grantKind === "credits" ? <><Field label="积分账户"><select value={bucket} onChange={(event) => setBucket(event.target.value as CreditBucket)} className={ADMIN_INPUT}>{Object.entries(BUCKET_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="发放数量"><input type="number" min={state.creditPolicy.minimumGrant} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className={ADMIN_INPUT} /></Field></> : null}
              {grantKind === "membership" ? <><Field label="会员套餐"><select value={planId} onChange={(event) => setPlanId(event.target.value)} className={ADMIN_INPUT}>{state.plans.filter((plan) => plan.enabled).map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></Field><Field label="有效天数"><input type="number" min="1" step="1" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className={ADMIN_INPUT} /></Field></> : null}
              {grantKind === "compute" ? <><Field label="任务并发上限"><input type="number" min="1" step="1" value={concurrency} onChange={(event) => setConcurrency(event.target.value)} className={ADMIN_INPUT} /></Field><Field label="月算力额度"><input type="number" min="0" step="1" value={quota} onChange={(event) => setQuota(event.target.value)} className={ADMIN_INPUT} /></Field></> : null}
              <div className="sm:col-span-2"><Field label="发放原因（必填）"><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：企业合同到账 / 客诉补偿 / 商务试用" className={cn(ADMIN_INPUT, "h-24 resize-none py-3")} /></Field></div>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setGrantUser(null)} className={ADMIN_SECONDARY_BUTTON}>取消</button><button type="submit" className={ADMIN_PRIMARY_BUTTON}>确认发放</button></div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}

function UserDetail({ user, onGrant, onStatus }: { user: AdminUser; onGrant: () => void; onStatus: (status: AdminUser["status"], reason: string) => void }) {
  const [statusReason, setStatusReason] = useState("");
  const total = Object.values(user.balances).reduce((sum, value) => sum + value, 0);
  const [registeredDays] = useState(() =>
    Math.max(1, Math.floor((Date.now() - new Date(user.registeredAt.replace(" ", "T")).getTime()) / 86_400_000)),
  );
  return (
    <div>
      <div className="flex items-start gap-3 pr-8"><span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><UserIcon className="size-5" /></span><span><h2 className="text-[18px] font-semibold text-white">{user.nickname}</h2><p className="mt-1 text-[11px] text-white/40">{user.id} · {user.contact} · {user.organization ?? "个人用户"}</p></span></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Mini label="总余额" value={total.toLocaleString()} icon={<CoinsIcon className="size-3.5" />} /><Mini label="累计付费" value={`¥${user.lifetimePaid.toLocaleString()}`} /><Mini label="累计任务" value={user.taskCount.toLocaleString()} /><Mini label="当前并发" value={String(user.maxConcurrency)} icon={<CpuIcon className="size-3.5" />} /></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><InfoBlock title="账户生命周期"><Info label="注册时间" value={user.registeredAt} /><Info label="累计注册时长" value={`${registeredDays.toLocaleString()} 天`} /><Info label="最近活跃" value={user.lastActiveAt} /><Info label="账户状态" value={STATUS_LABEL[user.status]} /></InfoBlock><InfoBlock title="会员与算力"><Info label="会员档位" value={user.membership.planName} /><Info label="到期时间" value={user.membership.expiresAt ?? "长期有效"} /><Info label="月算力额度" value={user.monthlyComputeQuota.toLocaleString()} /></InfoBlock></div>
      <InfoBlock title="积分账户" className="mt-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries(user.balances).map(([key, value]) => <span key={key}><span className="block text-[10px] text-white/35">{BUCKET_LABEL[key as CreditBucket]}</span><span className="mt-1 block font-mono text-[13px] text-white">{value.toLocaleString()}</span></span>)}</div></InfoBlock>
      <InfoBlock title="功能白名单" className="mt-4"><div className="flex flex-wrap gap-2">{user.featureWhitelist.map((feature) => <AdminBadge key={feature} tone="brand">{feature}</AdminBadge>)}</div></InfoBlock>
      <div className="mt-4"><span className={ADMIN_LABEL}>状态变更原因（必填）</span><input value={statusReason} onChange={(event) => setStatusReason(event.target.value)} placeholder="例如：风控复核通过 / 请求频率异常 / 违规内容确认" className={ADMIN_INPUT} /></div>
      <div className="mt-4 flex flex-wrap justify-between gap-3"><div className="flex gap-2">{user.status !== "active" ? <button type="button" onClick={() => onStatus("active", statusReason)} className={ADMIN_SECONDARY_BUTTON}>恢复正常</button> : null}{user.status !== "risk" ? <button type="button" onClick={() => onStatus("risk", statusReason)} className={ADMIN_SECONDARY_BUTTON}>标记风险</button> : null}{user.status !== "disabled" ? <button type="button" onClick={() => onStatus("disabled", statusReason)} className="inline-flex h-9 items-center rounded-full bg-danger/10 px-4 text-[12px] font-medium text-danger ring-1 ring-danger/20">停用账户</button> : null}</div><button type="button" onClick={onGrant} className={ADMIN_PRIMARY_BUTTON}>配置权益</button></div>
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
