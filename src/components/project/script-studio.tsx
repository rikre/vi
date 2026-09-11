"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SparkleIcon } from "@/components/icons";
import { getProject, saveScriptWorkspace, subscribeToProjects } from "@/lib/project-store";
import { appendRevision, buildScriptRequest, DEFAULT_SCRIPT_AGENT, type ScriptAgentConfig, type ScriptWorkspace } from "@/lib/script-workspace";

const field = "w-full rounded-xl border border-border bg-surface p-3 text-sm leading-6 text-foreground outline-none focus:border-brand";
const button = "cursor-pointer rounded-full border border-border px-4 py-2 text-sm text-foreground hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";
const primary = "cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:cursor-not-allowed disabled:opacity-40";

export function ScriptStudio({ projectId }: { projectId: number }) {
  const project = useSyncExternalStore(subscribeToProjects, () => getProject(projectId), () => undefined);
  if (!project) return null;
  const initial = (project.type === "short" && project.scriptChapters?.length ? project.scriptChapters.map((chapter) => chapter.content).join("\n\n") : project.scriptContent) ?? "";
  const workspace: ScriptWorkspace = project.scriptWorkspace ?? {
    draft: initial,
    config: DEFAULT_SCRIPT_AGENT,
    revisions: [{ id: "original", createdAt: new Date().toISOString(), label: "原始版本", content: initial }],
  };
  return <ScriptEditor key={projectId} projectId={projectId} workspace={workspace} />;
}

function ScriptEditor({ projectId, workspace }: { projectId: number; workspace: ScriptWorkspace }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(workspace.draft);
  const [settings, setSettings] = useState(false);
  const [history, setHistory] = useState(false);
  const [revisionId, setRevisionId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [operation, setOperation] = useState("request");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [candidate, setCandidate] = useState<string | null>(null);
  const [request, setRequest] = useState("");
  const [base, setBase] = useState("");
  const [previewConfig, setPreviewConfig] = useState<ScriptAgentConfig | null>(null);
  const saved = workspace.revisions.at(-1)?.content ?? "";
  const revision = workspace.revisions.find((item) => item.id === revisionId);
  useEffect(() => {
    const preventLoss = (event: BeforeUnloadEvent) => { if (draft !== saved) event.preventDefault(); };
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, [draft, saved]);
  const persist = (next: ScriptWorkspace, commit = false) => {
    try { saveScriptWorkspace(projectId, next, commit); return true; }
    catch { toast({ title: "保存失败", description: "浏览器存储不可用，请复制正文备份。", tone: "error" }); return false; }
  };
  const edit = (value: string) => {
    setDraft(value);
    setCandidate(null);
    setRequest("");
    persist({ ...workspace, draft: value });
  };
  const commit = (content: string, label: string, note?: string) => {
    const previous = content !== draft && draft !== saved ? appendRevision(workspace, draft, "创编前草稿") : workspace;
    const next = appendRevision(previous, content, label, note);
    if (previewConfig && label === "创编修改") next.revisions[next.revisions.length - 1].config = previewConfig;
    if (!persist(next, true)) return;
    setDraft(content);
    setCandidate(null);
    setRequest("");
    toast({ title: "已保存新版本", description: "已有分镜、资产和成片不会自动更新。", tone: "success" });
  };
  const prepare = () => {
    if (!draft.trim()) { toast({ title: "请先填写剧本正文", tone: "error" }); return; }
    try {
      setBase(draft);
      setPreviewConfig(structuredClone(workspace.config));
      if (operation === "replace") {
        if (!oldText.trim() || !newText.trim() || !draft.includes(oldText)) throw new Error("请填写有效的原文和替换内容，原文必须存在于剧本中。");
        setCandidate(draft.split(oldText).join(newText));
        setRequest("");
      } else {
        setRequest(buildScriptRequest(draft, instruction, workspace.config));
        setCandidate(null);
      }
    } catch (error) { toast({ title: error instanceof Error ? error.message : "预览失败", tone: "error" }); }
  };
  return <section aria-label="剧本编辑工作台" className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
    <div className="min-w-0 rounded-2xl bg-background p-4 ring-1 ring-border sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold">剧本编辑</h2><p className="mt-1 text-xs text-muted-foreground">草稿保存于此浏览器 · {workspace.revisions.length} 个版本{draft !== saved ? " · 有未提交修改" : ""}</p></div>
        <div className="flex gap-2"><button type="button" className={button} onClick={() => { setRevisionId(workspace.revisions.at(-1)?.id ?? ""); setHistory(true); }}>历史记录</button><button type="button" className={primary} disabled={draft === saved} onClick={() => commit(draft, "手动编辑")}>保存版本</button></div>
      </header>
      <label className="block"><span className="sr-only">剧本正文</span><textarea aria-label="剧本正文" className={`${field} min-h-[480px] resize-y sm:min-h-[600px]`} value={draft} maxLength={150000} onChange={(event) => edit(event.target.value)} placeholder="输入或粘贴剧本，可直接修改人物、场景、结构与对白。" /></label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{draft.length.toLocaleString()} 字 · 保存后不会自动重生成镜头。</p>
        {draft === saved && draft.trim() ? <Link href={`/project/${projectId}?tab=prompts`} className={button}>下一步：分镜提示词</Link> : <span className="text-xs text-muted-foreground">保存版本后继续分镜创作</span>}
      </div>
    </div>
    <aside className="min-w-0 space-y-4 rounded-2xl bg-surface p-4">
      <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-semibold"><SparkleIcon className="size-4 text-brand" />创编助手</h2><button type="button" className={button} onClick={() => setSettings(true)}>剧本偏好</button></header>
      <p className="text-xs leading-5 text-muted-foreground">{workspace.config.name} · 已启用 {workspace.config.skills.filter((skill) => skill.enabled).length} 项技能。当前未连接模型，仅支持编排请求和明确文本替换。</p>
      <label className="block space-y-2 text-sm"><span>修改方式</span><select className={field} value={operation} onChange={(event) => { setOperation(event.target.value); setCandidate(null); setRequest(""); }}><option value="request">结构、人物、场景创编</option><option value="replace">精确替换人物或选段</option></select></label>
      {operation === "replace" ? <>
        <label className="block space-y-2 text-sm"><span>需要替换的原文</span><textarea className={field} value={oldText} onChange={(event) => { setOldText(event.target.value); setCandidate(null); }} /></label>
        <label className="block space-y-2 text-sm"><span>替换为</span><textarea className={field} value={newText} onChange={(event) => { setNewText(event.target.value); setCandidate(null); }} /></label>
        <p className="text-xs text-muted-foreground">替换所有完全匹配文本，确认前不会修改正文。</p>
      </> : <label className="block space-y-2 text-sm"><span>创编要求</span><textarea className={`${field} min-h-28`} value={instruction} maxLength={4000} onChange={(event) => { setInstruction(event.target.value); setRequest(""); setCandidate(null); }} placeholder="例如：加强主角的行动动机，保持结局不变。" /></label>}
      <button type="button" className={primary} onClick={prepare}>{operation === "replace" ? "预览替换" : "编排创编请求"}</button>
      {request && <div className="space-y-3"><label className="block text-sm">请求预览（非模型结果）<textarea readOnly className={`${field} mt-2 h-52`} value={request} /></label><button type="button" className={button} onClick={async () => { try { await navigator.clipboard.writeText(request); toast({ title: "创编请求已复制" }); } catch { toast({ title: "复制失败，请手动复制", tone: "error" }); } }}>复制请求</button><button type="button" className={button} onClick={() => setCandidate(draft)}>粘贴或手动编辑修改稿</button></div>}
      {candidate !== null && <div className="space-y-3"><details className="rounded-xl border border-border p-3"><summary className="cursor-pointer text-sm">查看修改前原稿</summary><textarea aria-label="修改前原稿" readOnly className={`${field} mt-2 h-48`} value={base} /></details><label className="block space-y-2 text-sm"><span>修改稿预览（完整剧本）</span><textarea className={`${field} min-h-64`} value={candidate} maxLength={150000} onChange={(event) => setCandidate(event.target.value)} /></label><p className="text-xs text-muted-foreground">原稿 {base.length} 字 → 修改稿 {candidate.length} 字。确认后生成新版本，可从历史恢复。</p><div className="flex flex-wrap gap-2"><button type="button" className={primary} disabled={!candidate.trim() || candidate === draft || draft !== base} onClick={() => commit(candidate, "创编修改", operation === "replace" ? `精确替换：${oldText} → ${newText}` : instruction)}>确认应用并保存</button><button type="button" className={button} onClick={() => setCandidate(null)}>取消</button></div></div>}
    </aside>
    {settings && <AgentSettings config={workspace.config} onClose={() => setSettings(false)} onSave={(config) => { if (persist({ ...workspace, draft, config })) { setSettings(false); setCandidate(null); setRequest(""); toast({ title: "当前项目配置已保存" }); } }} />}
    <Modal open={history} onClose={() => setHistory(false)} title="剧本历史记录" className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[960px] overflow-y-auto p-5 pt-14">
      <h2 className="mb-4 text-lg font-semibold">历史记录</h2>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]"><div className="max-h-96 space-y-2 overflow-y-auto">{[...workspace.revisions].reverse().map((item, index) => <button type="button" key={item.id} className={`${button} w-full rounded-xl text-left ${revisionId === item.id ? "bg-brand/10 text-brand" : ""}`} onClick={() => setRevisionId(item.id)}>v{workspace.revisions.length - index} · {item.label}<span className="block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("zh-CN")}</span></button>)}</div>
        {revision && <div className="min-w-0 space-y-3"><p className="text-xs text-muted-foreground">{revision.instruction || "正文快照"}</p><textarea aria-label="历史剧本正文" readOnly className={`${field} h-80`} value={revision.content} /><button type="button" className={primary} disabled={draft === revision.content} onClick={() => { if (window.confirm("恢复此版本？当前草稿会先保留为历史版本。")) {
          let next = workspace;
          if (draft !== saved) next = appendRevision(next, draft, "恢复前草稿");
          next = appendRevision(next, revision.content, `恢复：${revision.label}`);
          if (persist(next, true)) { setDraft(revision.content); setCandidate(null); setRequest(""); setHistory(false); toast({ title: "已恢复并保留历史版本" }); }
        } }}>恢复为新版本</button></div>}
      </div>
    </Modal>
  </section>;
}

function AgentSettings({ config, onClose, onSave }: { config: ScriptAgentConfig; onClose: () => void; onSave: (config: ScriptAgentConfig) => void }) {
  const [value, setValue] = useState<ScriptAgentConfig>(() => structuredClone(config));
  const [sample, setSample] = useState("主角走进院子，发现门已经打开。");
  const [testInstruction, setTestInstruction] = useState("检查主角的行动动机");
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const change = (next: ScriptAgentConfig) => { setValue(next); setResult(""); };
  const valid = () => {
    if (!value.name.trim() || !value.role.trim() || value.skills.some((skill) => !skill.name.trim() || !skill.instruction.trim())) {
      toast({ title: "请填写助手名称、角色说明和技能规则", tone: "error" }); return false;
    }
    return true;
  };
  const requestClose = () => {
    if (JSON.stringify(value) !== JSON.stringify(config) && !window.confirm("放弃未保存的项目配置？")) return;
    onClose();
  };
  return <Modal open onClose={requestClose} title="剧本创编偏好" className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[960px] overflow-y-auto p-5 pt-14">
    <h2 className="text-lg font-semibold">剧本创编偏好</h2><p className="mt-1 text-xs text-muted-foreground">仅作用于当前项目 · 本地存储 · 测试不修改剧本、不扣积分</p>
    <div className="mt-5 grid gap-5 md:grid-cols-2"><div className="space-y-3">
      <label className="block space-y-1 text-sm"><span>助手名称</span><input className={field} maxLength={40} value={value.name} onChange={(event) => change({ ...value, name: event.target.value })} /></label>
      <label className="block space-y-1 text-sm"><span>默认角色与规则</span><textarea className={field} maxLength={4000} value={value.role} onChange={(event) => change({ ...value, role: event.target.value })} /></label>
      <label className="block space-y-1 text-sm"><span>默认创作风格</span><textarea className={field} maxLength={2000} value={value.style} onChange={(event) => change({ ...value, style: event.target.value })} /></label>
      <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={value.preserveDialogue} onChange={(event) => change({ ...value, preserveDialogue: event.target.checked })} />默认保留对白</label>
      <h3 className="pt-2 font-medium">项目技能</h3>
      {value.skills.map((skill, index) => <div key={skill.id} className="space-y-2 rounded-xl border border-border p-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={skill.enabled} onChange={(event) => change({ ...value, skills: value.skills.map((item) => item.id === skill.id ? { ...item, enabled: event.target.checked } : item) })} />启用技能 {index + 1}</label><input aria-label={`技能 ${index + 1} 名称`} className={field} value={skill.name} maxLength={40} onChange={(event) => change({ ...value, skills: value.skills.map((item) => item.id === skill.id ? { ...item, name: event.target.value } : item) })} /><textarea aria-label={`技能 ${index + 1} 规则`} className={field} value={skill.instruction} maxLength={2000} onChange={(event) => change({ ...value, skills: value.skills.map((item) => item.id === skill.id ? { ...item, instruction: event.target.value } : item) })} /><button type="button" className="cursor-pointer text-xs text-danger" onClick={() => change({ ...value, skills: value.skills.filter((item) => item.id !== skill.id) })}>移除技能 {index + 1}</button></div>)}
      <button type="button" className={button} disabled={value.skills.length >= 20} onClick={() => change({ ...value, skills: [...value.skills, { id: crypto.randomUUID(), name: "", instruction: "", enabled: true }] })}>添加自定义技能</button>
    </div><div className="space-y-3"><h3 className="font-medium">配置测试</h3><p className="text-xs leading-5 text-muted-foreground">检查当前未保存配置如何组成请求，不是模型试运行。此处修改不会写入正文。</p><label className="block space-y-1 text-sm"><span>测试片段</span><textarea className={field} value={sample} maxLength={6000} onChange={(event) => { setSample(event.target.value); setResult(""); }} /></label><label className="block space-y-1 text-sm"><span>测试要求</span><input className={field} value={testInstruction} maxLength={2000} onChange={(event) => { setTestInstruction(event.target.value); setResult(""); }} /></label><button type="button" className={button} onClick={() => { if (valid()) { try { setResult(buildScriptRequest(sample, testInstruction, value)); } catch { toast({ title: "请填写测试要求", tone: "error" }); } } }}>测试当前配置</button><textarea aria-label="配置测试结果" readOnly className={`${field} min-h-72`} value={result} placeholder="测试后展示实际编排的角色、技能、约束和片段。" /></div></div>
    <footer className="sticky bottom-0 mt-5 flex justify-end gap-2 bg-background py-3"><button type="button" className={button} onClick={requestClose}>取消</button><button type="button" className={primary} onClick={() => { if (valid()) onSave(value); }}>保存项目配置</button></footer>
  </Modal>;
}
