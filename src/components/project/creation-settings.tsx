"use client";

import { useState, useSyncExternalStore } from "react";
import { SettingsIcon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { getProject, saveCreationSettings, subscribeToProjects } from "@/lib/project-store";
import { activeCreationPreset, buildCreationRequest, creationSettingsSchema, CREATION_STAGES, DEFAULT_CREATION_SETTINGS, STAGE_META, type CreationSettings, type CreationStage } from "@/lib/creation-settings";

const field = "w-full rounded-xl border border-border bg-surface p-3 text-sm leading-6 text-foreground outline-none focus:border-brand";
const secondary = "cursor-pointer rounded-full border border-border px-4 py-2 text-sm text-foreground hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";
const primary = "cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:cursor-not-allowed disabled:opacity-40";

export function useCreationSettings(projectId: number) {
  const project = useSyncExternalStore(subscribeToProjects, () => getProject(projectId), () => undefined);
  return project?.creationSettings ?? DEFAULT_CREATION_SETTINGS;
}

export function CreationSettingsButton({ projectId }: { projectId: number }) {
  const settings = useCreationSettings(projectId);
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className={`${secondary} inline-flex shrink-0 items-center gap-2`}><SettingsIcon className="size-4 text-brand" />创作设置</button>
    {open && <CreationSettingsDialog projectId={projectId} initial={settings} onClose={() => setOpen(false)} />}
  </>;
}

function CreationSettingsDialog({ projectId, initial, onClose }: { projectId: number; initial: CreationSettings; onClose: () => void }) {
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [stage, setStage] = useState<CreationStage>("storyboard");
  const [sample, setSample] = useState("主角推开旧宅的门，停在门口，屋内传来脚步声。");
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const selected = activeCreationPreset(draft, stage);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const change = (config: CreationSettings[CreationStage]) => { setDraft({ ...draft, [stage]: config }); setResult(""); };
  const close = () => { if (!dirty || window.confirm("放弃未保存的创作设置？")) onClose(); };
  const save = () => {
    const parsed = creationSettingsSchema.safeParse(draft);
    if (!parsed.success) { toast({ title: "请检查方案名称和规则", description: "名称 1–40 字，规则 1–4000 字，每类最多 20 个方案。", tone: "error" }); return; }
    try { saveCreationSettings(projectId, parsed.data); toast({ title: "项目创作设置已保存", description: "后续请求使用新方案，已有成果不会改变。", tone: "success" }); onClose(); }
    catch { toast({ title: "保存失败，草稿已保留", description: "请检查浏览器存储空间。", tone: "error" }); }
  };
  return <Modal open onClose={close} title="项目创作设置" className="max-h-[92dvh] w-[calc(100%-24px)] max-w-[1080px] overflow-y-auto p-4 pt-14 sm:p-6 sm:pt-14">
    <header className="mb-6"><p className="text-xs text-brand">项目级配置 · #{projectId}</p><h2 className="mt-2 text-2xl font-semibold">创作设置</h2><p className="mt-2 text-sm text-muted-foreground">为每个创作环节选择你的 Agent 与技能。</p></header>
    <div className="grid min-w-0 gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="创作能力分类" className="grid grid-cols-3 gap-2 md:flex md:flex-col">
        {CREATION_STAGES.map((key, index) => <button key={key} type="button" aria-pressed={stage === key} onClick={() => { setStage(key); setResult(""); }} className={`min-w-0 cursor-pointer rounded-2xl border p-2 text-left md:p-4 transition-colors ${stage === key ? "border-brand/40 bg-brand/10" : "border-border bg-surface"}`}><span className="text-xs text-brand">0{index + 1}</span><span className="mt-1 block text-xs font-semibold md:text-base">{STAGE_META[key].title}</span><span className="mt-2 hidden text-xs leading-5 text-muted-foreground md:block">{STAGE_META[key].description}</span><span className="mt-3 hidden truncate text-xs text-brand md:block">当前：{activeCreationPreset(draft, key).name}</span></button>)}
      </nav>
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><label className="block min-w-0 flex-1 space-y-2 text-sm"><span>当前环节默认方案</span><select aria-label="当前环节默认方案" className={field} value={draft[stage].selectedId} onChange={(event) => change({ ...draft[stage], selectedId: event.target.value })}>{draft[stage].presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label><button type="button" className={secondary} disabled={draft[stage].presets.length >= 20} onClick={() => { const id = crypto.randomUUID(); change({ selectedId: id, presets: [...draft[stage].presets, { id, name: "自定义方案", rules: selected.rules }] }); }}>新建自定义方案</button></div>
        <label className="block space-y-2 text-sm"><span>方案名称</span><input aria-label="方案名称" className={field} maxLength={40} value={selected.name} onChange={(event) => change({ ...draft[stage], presets: draft[stage].presets.map((preset) => preset.id === selected.id ? { ...preset, name: event.target.value } : preset) })} /></label>
        <label className="block space-y-2 text-sm"><span>Agent 指令 / Skills 规则</span><textarea aria-label="Agent 指令 / Skills 规则" className={`${field} min-h-40`} maxLength={4000} value={selected.rules} onChange={(event) => change({ ...draft[stage], presets: draft[stage].presets.map((preset) => preset.id === selected.id ? { ...preset, rules: event.target.value } : preset) })} /></label>
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">预设可直接编辑；新建方案会复制当前规则。</p><button type="button" className="cursor-pointer text-xs text-danger disabled:opacity-40" disabled={draft[stage].presets.length <= 1} onClick={() => { if (!window.confirm(`删除方案“${selected.name}”？`)) return; const presets = draft[stage].presets.filter((preset) => preset.id !== selected.id); change({ presets, selectedId: presets[0].id }); }}>删除当前方案</button></div>
        <details className="rounded-2xl border border-border p-4" open><summary className="cursor-pointer text-sm font-medium">测试当前方案</summary><p className="my-3 text-xs leading-5 text-muted-foreground">仅预览当前规则组成的请求，不调用模型、不扣积分，也不修改剧本或分镜。</p><label className="block space-y-2 text-sm"><span>测试内容</span><textarea aria-label="测试内容" className={field} maxLength={6000} value={sample} onChange={(event) => { setSample(event.target.value); setResult(""); }} /></label><button type="button" className={`${secondary} my-3`} onClick={() => { try { if (!creationSettingsSchema.safeParse(draft).success) throw new Error("请先补全方案名称和规则"); setResult(buildCreationRequest(draft, stage, sample)); } catch (error) { toast({ title: error instanceof Error ? error.message : "测试失败", tone: "error" }); } }}>预览请求</button>{result && <textarea aria-label="方案测试结果" readOnly className={`${field} min-h-48`} value={result} />}</details>
      </div>
    </div>
    <footer className="sticky bottom-0 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background py-4"><p className="text-xs text-muted-foreground">{dirty ? "有未保存修改" : "配置未修改"} · 仅当前项目 · 本地存储</p><div className="flex gap-2"><button type="button" className={secondary} onClick={close}>取消</button><button type="button" className={primary} disabled={!dirty} onClick={save}>保存创作设置</button></div></footer>
  </Modal>;
}

export function CreationStageSummary({ projectId, stage }: { projectId: number; stage: CreationStage }) {
  const settings = useCreationSettings(projectId);
  const preset = activeCreationPreset(settings, stage);
  return <details className="mb-4 rounded-xl border border-border bg-surface p-3"><summary className="cursor-pointer text-sm">{STAGE_META[stage].title}：<span className="text-brand">{preset.name}</span></summary><p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-muted-foreground">{preset.rules}</p><p className="mt-2 text-xs text-muted-foreground">当前为规则配置；模型执行尚未接通。可在项目右上角切换方案。</p></details>;
}
