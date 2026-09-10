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
import { CpuIcon, ImageIcon, PlusIcon, SettingsIcon, VideoCameraIcon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { saveModelConfig, saveModelSecret } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import type { AdminModelConfig, AdminState, ModelCapability } from "@/types/admin";

const EMPTY_MODEL: AdminModelConfig = { id: "", name: "", vendor: "", capability: "video", endpoint: "", apiKeyLast4: "", enabled: true, health: "healthy", billingUnit: "秒", vendorCost: 0, creditPrice: 0, maxConcurrency: 1, timeoutSeconds: 300, outputOptions: [], allowedPlans: [] };
const CAPABILITY_LABEL: Record<ModelCapability, string> = { video: "视频", image: "图片", audio: "音频", text: "文本" };

export function AdminModels({ state }: { state: AdminState }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<AdminModelConfig | null>(null);
  const [secret, setSecret] = useState("");
  const [options, setOptions] = useState("");

  const open = (model: AdminModelConfig) => {
    setDraft({ ...model, outputOptions: [...model.outputOptions], allowedPlans: [...model.allowedPlans] });
    setOptions(model.outputOptions.join(", "));
    setSecret("");
  };
  const create = () => open({ ...EMPTY_MODEL, id: `model-${Date.now()}` });
  const close = () => { setDraft(null); setSecret(""); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || !draft.name.trim() || !draft.vendor.trim() || !/^https:\/\//.test(draft.endpoint) || draft.maxConcurrency < 1 || draft.timeoutSeconds < 1 || draft.creditPrice < 0 || draft.vendorCost < 0) {
      toast({ title: "模型配置不合法", description: "请检查名称、供应商、HTTPS 地址、价格和并发。", tone: "error" }); return;
    }
    if (secret && secret.trim().length < 8) {
      toast({ title: "密钥长度过短", description: "请输入完整的供应商 API Key。", tone: "error" }); return;
    }
    const next = { ...draft, name: draft.name.trim(), vendor: draft.vendor.trim(), endpoint: draft.endpoint.trim(), outputOptions: options.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean) };
    try {
      const modelId = await saveModelConfig(next);
      // 密钥仅提交服务端写入密钥管理；浏览器不留明文，控制台只回显末四位
      if (secret.trim()) {
        await saveModelSecret(modelId, secret.trim());
      }
      toast({ title: "模型配置已保存", description: secret ? "新密钥已由服务端接收；控制台仅保留末四位用于识别。" : "价格、并发和显影规格已更新。", tone: "success" });
      close();
    } catch (error) {
      toast({ title: "模型保存失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="模型 API 与显影配置" description="管理供应商接入、计费成本、积分售价、并发以及图片/视频输出规格" action={<button type="button" onClick={create} className={ADMIN_PRIMARY_BUTTON}><PlusIcon className="size-3.5" />接入模型</button>} />
      <div className="rounded-2xl bg-info/5 px-4 py-3 text-[11px] leading-relaxed text-info ring-1 ring-info/15">生产环境中 API Key 应由服务端写入密钥管理服务；浏览器控制台只展示末四位，不会把明文密钥写入 localStorage。</div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {state.models.map((model) => <ModelCard key={model.id} model={model} onEdit={() => open(model)} />)}
      </div>

      <Modal open={draft !== null} onClose={close} title="模型配置" className="max-h-[92vh] w-[calc(100vw-24px)] max-w-[820px] overflow-y-auto p-5 sm:p-6">
        {draft ? <form onSubmit={submit}><div className="flex items-start gap-3 pr-8"><span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><CpuIcon className="size-5" /></span><span><h2 className="text-[18px] font-semibold text-white">模型供应配置</h2><p className="mt-1 text-[11px] text-white/40">一处管理成本、售价、路由容量和显影输出选项。</p></span></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="模型名称"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={ADMIN_INPUT} /></Field><Field label="供应商"><input value={draft.vendor} onChange={(e) => setDraft({ ...draft, vendor: e.target.value })} className={ADMIN_INPUT} /></Field><Field label="能力类型"><select value={draft.capability} onChange={(e) => setDraft({ ...draft, capability: e.target.value as ModelCapability })} className={ADMIN_INPUT}>{Object.entries(CAPABILITY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><div className="sm:col-span-2 lg:col-span-3"><Field label="API Endpoint（仅 HTTPS）"><input type="url" value={draft.endpoint} onChange={(e) => setDraft({ ...draft, endpoint: e.target.value })} placeholder="https://api.vendor.com/v1" className={ADMIN_INPUT} /></Field></div><div className="sm:col-span-2 lg:col-span-3"><Field label={`API Key ${draft.apiKeyLast4 ? `（当前 •••• ${draft.apiKeyLast4}）` : ""}`}><input type="password" autoComplete="new-password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={draft.apiKeyLast4 ? "留空表示不更换" : "输入生产密钥"} className={ADMIN_INPUT} /></Field></div><Field label="计费单位"><input value={draft.billingUnit} onChange={(e) => setDraft({ ...draft, billingUnit: e.target.value })} className={ADMIN_INPUT} /></Field><NumberField label="供应商成本（元）" value={draft.vendorCost} step="0.001" onChange={(vendorCost) => setDraft({ ...draft, vendorCost })} /><NumberField label="积分售价" value={draft.creditPrice} onChange={(creditPrice) => setDraft({ ...draft, creditPrice })} /><NumberField label="路由并发" value={draft.maxConcurrency} min={1} onChange={(maxConcurrency) => setDraft({ ...draft, maxConcurrency })} /><NumberField label="超时秒数" value={draft.timeoutSeconds} min={1} onChange={(timeoutSeconds) => setDraft({ ...draft, timeoutSeconds })} /><Field label="健康状态"><select value={draft.health} onChange={(e) => setDraft({ ...draft, health: e.target.value as AdminModelConfig["health"] })} className={ADMIN_INPUT}><option value="healthy">正常</option><option value="degraded">降级</option><option value="offline">离线</option></select></Field><div className="sm:col-span-2 lg:col-span-3"><Field label="显影 / 输出选项（逗号分隔）"><input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="720p, 1080p, 5s, 10s, 9:16" className={ADMIN_INPUT} /></Field></div></div>
          <div className="mt-5"><span className={ADMIN_LABEL}>允许使用的套餐</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{state.plans.map((plan) => { const active = draft.allowedPlans.includes(plan.id); return <button key={plan.id} type="button" onClick={() => setDraft({ ...draft, allowedPlans: active ? draft.allowedPlans.filter((id) => id !== plan.id) : [...draft.allowedPlans, plan.id] })} className={cn("h-10 rounded-xl px-3 text-left text-[11px] ring-1 transition-colors", active ? "bg-brand/10 text-brand ring-brand/25" : "bg-white/[0.025] text-white/40 ring-white/[0.07]")}>{plan.name}</button>; })}</div></div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07]"><span><span className="block text-[12px] font-medium text-white/75">启用模型路由</span><span className="text-[10px] text-white/35">关闭后新任务不再发送至此供应商</span></span><Toggle checked={draft.enabled} onChange={(enabled) => setDraft({ ...draft, enabled })} label="启用模型" /></div>
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={close} className={ADMIN_SECONDARY_BUTTON}>取消</button><button type="submit" className={ADMIN_PRIMARY_BUTTON}>保存模型</button></div>
        </form> : null}
      </Modal>
    </div>
  );
}

function ModelCard({ model, onEdit }: { model: AdminModelConfig; onEdit: () => void }) { const margin = model.creditPrice > 0 ? Math.round(((model.creditPrice / 10 - model.vendorCost) / (model.creditPrice / 10)) * 100) : 0; const Icon = model.capability === "video" ? VideoCameraIcon : model.capability === "image" ? ImageIcon : CpuIcon; return <AdminCard className="p-5"><div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.045] text-white/60"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><h3 className="truncate text-[14px] font-semibold text-white">{model.name}</h3><AdminBadge tone={model.health === "healthy" ? "success" : model.health === "degraded" ? "warning" : "danger"}>{model.health === "healthy" ? "正常" : model.health === "degraded" ? "降级" : "离线"}</AdminBadge></span><span className="mt-1 block text-[10px] text-white/35">{model.vendor} · {CAPABILITY_LABEL[model.capability]} · Key •••• {model.apiKeyLast4 || "未配置"}</span></span></div><div className="my-4 grid grid-cols-3 gap-2"><Stat label="积分价" value={`${model.creditPrice}/${model.billingUnit}`} /><Stat label="并发" value={String(model.maxConcurrency)} /><Stat label="估算毛利" value={`${margin}%`} /></div><div className="flex min-h-12 flex-wrap content-start gap-1.5">{model.outputOptions.slice(0, 6).map((option) => <AdminBadge key={option}>{option}</AdminBadge>)}</div><div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3"><span className={cn("text-[11px]", model.enabled ? "text-success" : "text-white/30")}>{model.enabled ? "路由已启用" : "路由已停用"}</span><button type="button" onClick={onEdit} className={ADMIN_SECONDARY_BUTTON}><SettingsIcon className="size-3.5" />配置</button></div></AdminCard>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className={ADMIN_LABEL}>{label}</span>{children}</label>; }
function NumberField({ label, value, min = 0, step = "1", onChange }: { label: string; value: number; min?: number; step?: string; onChange: (value: number) => void }) { return <Field label={label}><input type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className={ADMIN_INPUT} /></Field>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.06]"><span className="block text-[9px] text-white/30">{label}</span><span className="mt-1 block truncate font-mono text-[12px] text-white/80">{value}</span></div>; }
