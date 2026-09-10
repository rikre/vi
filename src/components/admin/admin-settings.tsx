"use client";

import { useState, type FormEvent } from "react";
import {
  AdminBadge,
  AdminCard,
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PRIMARY_BUTTON,
  SectionTitle,
  Toggle,
} from "@/components/admin/admin-ui";
import { CoinsIcon, DocumentIcon, SettingsIcon } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { saveCreditPolicy } from "@/lib/admin-store";
import type { AdminState, CreditBucket, CreditPolicy } from "@/types/admin";

const BUCKET_LABEL: Record<CreditBucket, string> = { gift: "赠送积分", member: "会员积分", enterprise: "企业积分", recharge: "充值积分" };

export function AdminSettings({ state }: { state: AdminState }) {
  const { toast } = useToast();
  const [policy, setPolicy] = useState<CreditPolicy>(state.creditPolicy);
  const [syncedFrom, setSyncedFrom] = useState<CreditPolicy>(state.creditPolicy);
  if (syncedFrom !== state.creditPolicy) {
    setSyncedFrom(state.creditPolicy);
    setPolicy(state.creditPolicy);
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (policy.creditsPerYuan < 1 || policy.minimumGrant < 1 || policy.giftExpiryDays < 1 || policy.memberResetDay < 1 || policy.memberResetDay > 28 || new Set(policy.deductionOrder).size !== 4) {
      toast({ title: "积分规则不合法", description: "扣减账户不能重复，会员重置日应为 1–28。", tone: "error" }); return;
    }
    try {
      await saveCreditPolicy(policy);
      toast({ title: "积分策略已保存", description: "新任务和后续权益发放将按新规则执行。", tone: "success" });
    } catch (error) {
      toast({ title: "积分策略保存失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <SectionTitle title="积分与结算规则" description="配置积分汇率、账户扣减顺序、过期和失败任务退回策略" />
        <form onSubmit={submit}><AdminCard className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><CoinsIcon className="size-5" /></span><div><h3 className="text-[14px] font-semibold text-white">全局积分策略</h3><p className="mt-0.5 text-[11px] text-white/35">涉及资金口径的变更会进入审计日志。</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="每 1 元兑换积分" value={policy.creditsPerYuan} min={1} onChange={(creditsPerYuan) => setPolicy({ ...policy, creditsPerYuan })} /><NumberField label="赠送积分有效期（天）" value={policy.giftExpiryDays} min={1} onChange={(giftExpiryDays) => setPolicy({ ...policy, giftExpiryDays })} /><NumberField label="会员积分重置日" value={policy.memberResetDay} min={1} max={28} onChange={(memberResetDay) => setPolicy({ ...policy, memberResetDay })} /><NumberField label="人工最低发放数量" value={policy.minimumGrant} min={1} onChange={(minimumGrant) => setPolicy({ ...policy, minimumGrant })} /></div><div className="mt-5"><span className={ADMIN_LABEL}>积分扣减顺序</span><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{policy.deductionOrder.map((bucket, index) => <label key={index} className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07]"><span className="mb-2 block text-[10px] text-white/35">第 {index + 1} 顺位</span><select value={bucket} onChange={(event) => { const deductionOrder = [...policy.deductionOrder]; deductionOrder[index] = event.target.value as CreditBucket; setPolicy({ ...policy, deductionOrder }); }} className={ADMIN_INPUT}>{Object.entries(BUCKET_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><ToggleRow title="失败任务自动退积分" desc="仅供应商确认失败且未产出时退回" checked={policy.failedTaskRefund} onChange={(failedTaskRefund) => setPolicy({ ...policy, failedTaskRefund })} /><ToggleRow title="允许账户负余额" desc="建议仅用于授信企业客户" checked={policy.negativeBalanceAllowed} onChange={(negativeBalanceAllowed) => setPolicy({ ...policy, negativeBalanceAllowed })} /></div><div className="mt-6 flex justify-end"><button type="submit" className={ADMIN_PRIMARY_BUTTON}><SettingsIcon className="size-3.5" />保存规则</button></div></AdminCard></form>
      </section>

      <section className="space-y-4">
        <SectionTitle title="管理员审计日志" description="权益发放、用户状态、套餐价格、模型和积分规则的完整操作记录" />
        <AdminCard className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35"><tr><Th>时间</Th><Th>操作人</Th><Th>动作</Th><Th>对象</Th><Th>详情</Th></tr></thead><tbody className="divide-y divide-white/[0.06]">{state.auditLogs.map((log) => <tr key={log.id} className="text-[12px] text-white/60 hover:bg-white/[0.025]"><Td>{log.createdAt}</Td><Td>{log.operator}</Td><Td><AdminBadge tone="info">{log.action}</AdminBadge></Td><Td><span className="font-mono text-white/70">{log.target}</span></Td><Td><span className="block max-w-[480px] truncate">{log.detail}</span></Td></tr>)}</tbody></table></div><div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3 text-[11px] text-white/35"><DocumentIcon className="size-3.5" />生产版应由服务端生成不可篡改日志并支持按时间、管理员和对象导出。</div></AdminCard>
      </section>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max?: number; onChange: (value: number) => void }) { return <label><span className={ADMIN_LABEL}>{label}</span><input type="number" min={min} max={max} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} className={ADMIN_INPUT} /></label>; }
function ToggleRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (checked: boolean) => void }) { return <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07]"><span><span className="block text-[12px] font-medium text-white/75">{title}</span><span className="mt-0.5 block text-[10px] text-white/35">{desc}</span></span><Toggle checked={checked} onChange={onChange} label={title} /></div>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-4 py-3.5">{children}</td>; }
