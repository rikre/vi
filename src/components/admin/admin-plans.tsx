"use client";

import { useState, type FormEvent } from "react";
import {
  AdminBadge,
  AdminCard,
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PRIMARY_BUTTON,
  ADMIN_SECONDARY_BUTTON,
  SectionTitle,
  Toggle,
} from "@/components/admin/admin-ui";
import { CheckIcon, CoinsIcon, PlusIcon, SettingsIcon, UserGroupIcon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ADMIN_FEATURES } from "@/lib/admin-data";
import { saveAdminPlan, saveRechargeTier } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import type { AdminPlan, AdminRechargeTier, AdminState } from "@/types/admin";

const FEATURE_LABEL: Record<(typeof ADMIN_FEATURES)[number], string> = {
  "seedance-2.5": "Seedance 2.5",
  "seedance-2.0": "Seedance 2.0",
  "seedream-4.0": "Seedream 4.0",
  "1080p-export": "1080P 导出",
  "4k-export": "4K 导出",
  "watermark-free": "无水印",
  "priority-queue": "优先队列",
  "api-access": "开放 API",
  "private-model": "私有模型",
  "audit-export": "审计导出",
};

const EMPTY_PLAN: AdminPlan = { id: "", name: "", audience: "enterprise", priceMonthly: 0, priceYearlyMonthly: 0, monthlyCredits: 0, seats: 1, concurrency: 1, monthlyComputeQuota: 0, queue: "standard", features: [], enabled: true };
const EMPTY_TIER: AdminRechargeTier = { id: "", name: "", price: 0, baseCredits: 0, bonusCredits: 0, firstPurchaseOnly: false, enabled: true };

export function AdminPlans({ state }: { state: AdminState }) {
  const { toast } = useToast();
  const [planDraft, setPlanDraft] = useState<AdminPlan | null>(null);
  const [tierDraft, setTierDraft] = useState<AdminRechargeTier | null>(null);

  const openNewPlan = () => setPlanDraft({ ...EMPTY_PLAN, id: `custom-${Date.now()}` });
  const openNewTier = () => setTierDraft({ ...EMPTY_TIER, id: `tier-${Date.now()}` });

  const submitPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!planDraft || !planDraft.name.trim() || planDraft.concurrency < 1 || planDraft.seats < 1 || planDraft.priceMonthly < 0) {
      toast({ title: "套餐配置不完整", description: "请检查名称、席位、并发与价格。", tone: "error" }); return;
    }
    try {
      await saveAdminPlan({ ...planDraft, name: planDraft.name.trim() });
      toast({ title: "套餐已保存", description: `${planDraft.name} 的价格与权益已更新。`, tone: "success" });
      setPlanDraft(null);
    } catch (error) {
      toast({ title: "套餐保存失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  const submitTier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tierDraft || !tierDraft.name.trim() || tierDraft.price <= 0 || tierDraft.baseCredits <= 0) {
      toast({ title: "充值档位不合法", description: "名称、售价和基础积分均为必填。", tone: "error" }); return;
    }
    try {
      await saveRechargeTier({ ...tierDraft, name: tierDraft.name.trim() });
      toast({ title: "充值档位已保存", tone: "success" });
      setTierDraft(null);
    } catch (error) {
      toast({ title: "充值档位保存失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <SectionTitle title="会员与企业套餐" description="个人、团队与企业档位共享同一套权益模型，可独立配置席位、并发和白名单" action={<button type="button" onClick={openNewPlan} className={ADMIN_PRIMARY_BUTTON}><PlusIcon className="size-3.5" />新建套餐</button>} />
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {state.plans.map((plan) => <PlanCard key={plan.id} plan={plan} onEdit={() => setPlanDraft({ ...plan, features: [...plan.features] })} />)}
        </div>
      </section>
      <section className="space-y-4">
        <SectionTitle title="积分充值档位" description="售价、基础积分、赠送积分和首充限制均可独立调整" action={<button type="button" onClick={openNewTier} className={ADMIN_SECONDARY_BUTTON}><PlusIcon className="size-3.5" />新增档位</button>} />
        <AdminCard className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35"><tr><Th>档位</Th><Th>售价</Th><Th>基础积分</Th><Th>赠送积分</Th><Th>到账积分</Th><Th>限制</Th><Th>状态</Th><Th><span className="sr-only">操作</span></Th></tr></thead><tbody className="divide-y divide-white/[0.06]">{state.rechargeTiers.map((tier) => <tr key={tier.id} className="text-[12px] text-white/65 hover:bg-white/[0.025]"><Td><span className="font-medium text-white">{tier.name}</span><span className="ml-2 font-mono text-[10px] text-white/25">{tier.id}</span></Td><Td>¥{tier.price.toLocaleString()}</Td><Td>{tier.baseCredits.toLocaleString()}</Td><Td><span className="text-brand">+{tier.bonusCredits.toLocaleString()}</span></Td><Td>{(tier.baseCredits + tier.bonusCredits).toLocaleString()} PT</Td><Td>{tier.firstPurchaseOnly ? "仅首充" : "不限"}</Td><Td><AdminBadge tone={tier.enabled ? "success" : "neutral"}>{tier.enabled ? "上架" : "下架"}</AdminBadge></Td><Td><button type="button" onClick={() => setTierDraft({ ...tier })} className={ADMIN_SECONDARY_BUTTON}><SettingsIcon className="size-3.5" />编辑</button></Td></tr>)}</tbody></table></div></AdminCard>
      </section>

      <Modal open={planDraft !== null} onClose={() => setPlanDraft(null)} title="套餐配置" className="max-h-[92vh] w-[calc(100vw-24px)] max-w-[760px] overflow-y-auto p-5 sm:p-6">
        {planDraft ? <form onSubmit={submitPlan}><FormHead icon={<UserGroupIcon className="size-5" />} title="套餐与权益配置" desc="保存后可用于用户定向发放，并作为功能准入规则来源。" /><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="套餐名称"><input value={planDraft.name} onChange={(e) => setPlanDraft({ ...planDraft, name: e.target.value })} className={ADMIN_INPUT} /></Field><Field label="适用对象"><select value={planDraft.audience} onChange={(e) => setPlanDraft({ ...planDraft, audience: e.target.value as AdminPlan["audience"] })} className={ADMIN_INPUT}><option value="personal">个人</option><option value="team">团队</option><option value="enterprise">企业</option></select></Field><Field label="队列等级"><select value={planDraft.queue} onChange={(e) => setPlanDraft({ ...planDraft, queue: e.target.value as AdminPlan["queue"] })} className={ADMIN_INPUT}><option value="standard">标准</option><option value="priority">优先</option><option value="dedicated">独享</option></select></Field><NumberField label="月付价格" value={planDraft.priceMonthly} onChange={(value) => setPlanDraft({ ...planDraft, priceMonthly: value })} /><NumberField label="年付折算/月" value={planDraft.priceYearlyMonthly} onChange={(value) => setPlanDraft({ ...planDraft, priceYearlyMonthly: value })} /><NumberField label="每月积分" value={planDraft.monthlyCredits} onChange={(value) => setPlanDraft({ ...planDraft, monthlyCredits: value })} /><NumberField label="席位数" value={planDraft.seats} min={1} onChange={(value) => setPlanDraft({ ...planDraft, seats: value })} /><NumberField label="任务并发" value={planDraft.concurrency} min={1} onChange={(value) => setPlanDraft({ ...planDraft, concurrency: value })} /><NumberField label="月算力额度" value={planDraft.monthlyComputeQuota} onChange={(value) => setPlanDraft({ ...planDraft, monthlyComputeQuota: value })} /></div><div className="mt-5"><span className={ADMIN_LABEL}>功能与模型白名单</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{ADMIN_FEATURES.map((feature) => { const active = planDraft.features.includes(feature); return <button key={feature} type="button" onClick={() => setPlanDraft({ ...planDraft, features: active ? planDraft.features.filter((item) => item !== feature) : [...planDraft.features, feature] })} className={cn("flex h-10 items-center gap-2 rounded-xl px-3 text-left text-[11px] ring-1 transition-colors", active ? "bg-brand/10 text-brand ring-brand/25" : "bg-white/[0.025] text-white/40 ring-white/[0.07] hover:text-white")}><span className={cn("flex size-4 items-center justify-center rounded-full", active ? "bg-brand text-brand-foreground" : "bg-white/[0.08]")}>{active ? <CheckIcon className="size-2.5" /> : null}</span>{FEATURE_LABEL[feature]}</button>; })}</div></div><div className="mt-5 flex items-center justify-between rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07]"><span><span className="block text-[12px] font-medium text-white/75">对外启用套餐</span><span className="text-[10px] text-white/35">关闭后不可新购，已有用户权益不受影响</span></span><Toggle checked={planDraft.enabled} onChange={(enabled) => setPlanDraft({ ...planDraft, enabled })} label="启用套餐" /></div><FormActions onCancel={() => setPlanDraft(null)} /></form> : null}
      </Modal>

      <Modal open={tierDraft !== null} onClose={() => setTierDraft(null)} title="充值档位" className="w-[calc(100vw-24px)] max-w-[600px] p-5 sm:p-6">
        {tierDraft ? <form onSubmit={submitTier}><FormHead icon={<CoinsIcon className="size-5" />} title="充值档位配置" desc="到账积分 = 基础积分 + 赠送积分。" /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="档位名称"><input value={tierDraft.name} onChange={(e) => setTierDraft({ ...tierDraft, name: e.target.value })} className={ADMIN_INPUT} /></Field><NumberField label="售价（元）" value={tierDraft.price} min={1} onChange={(value) => setTierDraft({ ...tierDraft, price: value })} /><NumberField label="基础积分" value={tierDraft.baseCredits} min={1} onChange={(value) => setTierDraft({ ...tierDraft, baseCredits: value })} /><NumberField label="赠送积分" value={tierDraft.bonusCredits} onChange={(value) => setTierDraft({ ...tierDraft, bonusCredits: value })} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><ToggleRow label="仅限首充" checked={tierDraft.firstPurchaseOnly} onChange={(firstPurchaseOnly) => setTierDraft({ ...tierDraft, firstPurchaseOnly })} /><ToggleRow label="上架销售" checked={tierDraft.enabled} onChange={(enabled) => setTierDraft({ ...tierDraft, enabled })} /></div><FormActions onCancel={() => setTierDraft(null)} /></form> : null}
      </Modal>
    </div>
  );
}

function PlanCard({ plan, onEdit }: { plan: AdminPlan; onEdit: () => void }) { return <AdminCard className="flex flex-col p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="text-[16px] font-semibold text-white">{plan.name}</h3><AdminBadge tone={plan.enabled ? "success" : "neutral"}>{plan.enabled ? "启用" : "停用"}</AdminBadge></div><p className="mt-1 text-[11px] text-white/35">{plan.audience === "personal" ? "个人" : plan.audience === "team" ? "团队" : "企业"} · {plan.seats} 席位 · {plan.queue === "dedicated" ? "独享队列" : plan.queue === "priority" ? "优先队列" : "标准队列"}</p></div><span className="text-right"><span className="font-mono text-[20px] font-bold text-white">¥{plan.priceMonthly.toLocaleString()}</span><span className="block text-[10px] text-white/30">/月</span></span></div><div className="my-4 grid grid-cols-3 gap-2"><Stat label="月积分" value={plan.monthlyCredits.toLocaleString()} /><Stat label="并发" value={String(plan.concurrency)} /><Stat label="月算力" value={plan.monthlyComputeQuota.toLocaleString()} /></div><div className="flex min-h-[54px] flex-wrap content-start gap-1.5">{plan.features.slice(0, 5).map((feature) => <AdminBadge key={feature}>{feature}</AdminBadge>)}{plan.features.length > 5 ? <AdminBadge tone="brand">+{plan.features.length - 5}</AdminBadge> : null}</div><button type="button" onClick={onEdit} className={cn(ADMIN_SECONDARY_BUTTON, "mt-4 w-full")}><SettingsIcon className="size-3.5" />配置套餐</button></AdminCard>; }
function FormHead({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) { return <div className="flex items-start gap-3 pr-8"><span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</span><span><h2 className="text-[18px] font-semibold text-white">{title}</h2><p className="mt-1 text-[11px] text-white/40">{desc}</p></span></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className={ADMIN_LABEL}>{label}</span>{children}</label>; }
function NumberField({ label, value, min = 0, onChange }: { label: string; value: number; min?: number; onChange: (value: number) => void }) { return <Field label={label}><input type="number" min={min} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} className={ADMIN_INPUT} /></Field>; }
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07]"><span className="text-[12px] text-white/65">{label}</span><Toggle checked={checked} onChange={onChange} label={label} /></div>; }
function FormActions({ onCancel }: { onCancel: () => void }) { return <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onCancel} className={ADMIN_SECONDARY_BUTTON}>取消</button><button type="submit" className={ADMIN_PRIMARY_BUTTON}>保存配置</button></div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.06]"><span className="block text-[9px] text-white/30">{label}</span><span className="mt-1 block truncate font-mono text-[12px] text-white/80">{value}</span></div>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-4 py-3.5">{children}</td>; }
