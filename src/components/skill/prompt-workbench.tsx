"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast";
import { SparkleIcon, PlusIcon } from "@/components/icons";
import { BUILTIN_SKILLS, PROMPT_MODES, buildPrompt, inspectPrompt, skillSchema, type PromptMode, type PromptSkill } from "@/lib/prompt-skills";

export interface PromptSource {
  id: string;
  label: string;
  content: string;
  prompt?: string;
}

const field = "w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground outline-none focus:border-brand";
const secondary = "cursor-pointer rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";
const primary = "cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:cursor-not-allowed disabled:opacity-40";
const eventName = "bollo-prompt-skills-change";
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

export function PromptWorkbench({ sources = [], onApply }: {
  sources?: PromptSource[];
  onApply?: (id: string, prompt: string) => void;
}) {
  const { user } = useAuth();
  // 用户级隔离；本版本不向云端同步技能内容。
  return <PromptEditor key={user?.id ?? "guest"} owner={String(user?.id ?? "guest")} sources={sources} onApply={onApply} />;
}

function PromptEditor({ owner, sources, onApply }: {
  owner: string;
  sources: PromptSource[];
  onApply?: (id: string, prompt: string) => void;
}) {
  const { toast } = useToast();
  const storageKey = `bollo-prompt-skills-v1:${owner}`;
  const getSnapshot = useCallback(() => {
    try { return localStorage.getItem(storageKey) ?? "[]"; } catch { return "[]"; }
  }, [storageKey]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const custom = useMemo(() => {
    try { return z.array(skillSchema).parse(JSON.parse(raw)); } catch { return []; }
  }, [raw]);
  const [mode, setMode] = useState<PromptMode>("storyboard");
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "manual");
  const [source, setSource] = useState(sources[0]?.content ?? "");
  const [selected, setSelected] = useState<string[]>(BUILTIN_SKILLS.map((skill) => skill.id));
  const [preview, setPreview] = useState("");
  const [editor, setEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [instruction, setInstruction] = useState("");
  const [undo, setUndo] = useState<{ id: string; prompt: string } | null>(null);
  const skills = [...BUILTIN_SKILLS, ...custom].filter((skill) => skill.mode === mode);
  const warnings = inspectPrompt(source);
  const persist = (next: PromptSkill[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(eventName));
      return true;
    } catch {
      toast({ title: "保存失败", description: "浏览器存储不可用，请先复制内容。", tone: "error" });
      return false;
    }
  };
  const saveSkill = () => {
    const result = skillSchema.safeParse({ id: editingId ?? crypto.randomUUID(), name, instruction, mode });
    if (!result.success) {
      toast({ title: "请填写技能名称和规则", description: "名称最多 30 字，规则最多 2000 字。", tone: "error" });
      return;
    }
    if (persist([...custom.filter((skill) => skill.id !== editingId), result.data])) {
      setSelected((value) => [...new Set([...value, result.data.id])]);
      setEditor(false);
      setPreview("");
      toast({ title: "技能已保存到此浏览器", tone: "success" });
    }
  };
  return (
    <section aria-label="提示词工作台" className="min-w-0 space-y-5 rounded-2xl bg-background p-4 ring-1 ring-border sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground"><SparkleIcon className="size-5 text-brand" />提示词工作台</h2>
          <p className="mt-1 text-sm text-muted-foreground">读分镜、选技能、预览确认，保留你的创作判断。</p>
        </div>
        <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted-foreground">本地规则预览 · 不扣积分</span>
      </header>
      <nav aria-label="提示词模式" className="flex flex-wrap gap-2">
        {(Object.keys(PROMPT_MODES) as PromptMode[]).map((value) => (
          <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setPreview(""); setEditor(false); }} className={mode === value ? primary : secondary}>{PROMPT_MODES[value]}</button>
        ))}
      </nav>
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <label className="block space-y-2 text-sm text-foreground"><span>内容来源</span>
            <select aria-label="内容来源" className={field} value={sourceId} onChange={(event) => {
              const next = sources.find((item) => item.id === event.target.value);
              setSourceId(event.target.value);
              setSource(mode === "storyboard" ? next?.content ?? "" : next?.prompt || next?.content || "");
              setPreview("");
            }}><option value="manual">手动输入</option>{sources.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
          </label>
          <label className="block space-y-2 text-sm text-foreground"><span>分镜内容或视频提示词</span>
            <textarea aria-label="分镜内容或视频提示词" className={`${field} min-h-44 resize-y`} maxLength={12000} value={source} onChange={(event) => { setSource(event.target.value); setPreview(""); }} placeholder="描述人物、场景、动作和镜头，或选择已有分镜。" />
          </label>
          <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-medium">创作技能</h3>
            <button type="button" className="flex cursor-pointer items-center gap-1 text-sm text-brand" onClick={() => { setName(""); setInstruction(""); setEditingId(null); setEditor(true); }}><PlusIcon className="size-4" />自定义技能</button>
          </div>
          {skills.map((skill) => <div key={skill.id} className="rounded-xl bg-surface p-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" checked={selected.includes(skill.id)} className="mt-1 accent-brand" onChange={() => { setSelected((value) => value.includes(skill.id) ? value.filter((id) => id !== skill.id) : [...value, skill.id]); setPreview(""); }} /><span><span className="font-medium">{skill.name}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{skill.instruction}</span></span></label>
            {custom.some((item) => item.id === skill.id) && <div className="mt-2 flex gap-3 pl-6 text-xs">
              <button type="button" className="cursor-pointer text-brand" onClick={() => { setEditingId(skill.id); setName(skill.name); setInstruction(skill.instruction); setEditor(true); }}>编辑</button>
              <button type="button" className="cursor-pointer text-danger" onClick={() => { if (window.confirm(`删除技能“${skill.name}”？`)) { persist(custom.filter((item) => item.id !== skill.id)); setPreview(""); } }}>删除</button>
            </div>}
          </div>)}
          {editor && <div className="space-y-3 rounded-xl border border-brand/30 p-3">
            <label className="block space-y-1 text-sm"><span>技能名称</span><input className={field} value={name} maxLength={30} onChange={(event) => setName(event.target.value)} /></label>
            <label className="block space-y-1 text-sm"><span>技能规则</span><textarea className={field} rows={4} value={instruction} maxLength={2000} onChange={(event) => setInstruction(event.target.value)} placeholder="例如：保留对白，使用固定镜头，保持人物服装一致。" /></label>
            <p className="text-xs text-muted-foreground">适用于{PROMPT_MODES[mode]}，仅当前用户、当前浏览器可见。</p>
            <div className="flex gap-2"><button type="button" className={primary} onClick={saveSkill}>保存技能</button><button type="button" className={secondary} onClick={() => setEditor(false)}>取消</button></div>
          </div>}
        </div>
        <div className="min-w-0 space-y-3">
          <h3 className="text-sm font-medium">确认后应用</h3>
          <p className="text-xs leading-5 text-muted-foreground">当前按模板整理内容并附加技能规则，尚未连接语言模型。去瑕疵仅检查提示词，不处理视频文件。</p>
          {warnings.map((warning) => <p key={warning} role="status" className="rounded-xl bg-warning/10 p-3 text-sm text-warning">{warning}</p>)}
          <button type="button" className={primary} disabled={!source.trim()} onClick={() => setPreview(buildPrompt(source, mode, skills.filter((skill) => selected.includes(skill.id))))}>生成规则预览</button>
          <label className="block space-y-2 text-sm"><span>提示词预览（可编辑）</span><textarea className={`${field} min-h-64 resize-y`} value={preview} onChange={(event) => setPreview(event.target.value)} placeholder="生成后检查、编辑，再应用到当前镜头。" /></label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondary} disabled={!preview.trim()} onClick={async () => { try { await navigator.clipboard.writeText(preview); toast({ title: "提示词已复制", tone: "success" }); } catch { toast({ title: "复制失败，请手动复制", tone: "error" }); } }}>复制提示词</button>
            {onApply && <button type="button" className={primary} disabled={!preview.trim() || !sources.some((item) => item.id === sourceId)} onClick={() => {
              try {
                const previous = sources.find((item) => item.id === sourceId)?.prompt ?? "";
                onApply(sourceId, preview);
                setUndo({ id: sourceId, prompt: previous });
                toast({ title: "已应用到当前镜头", tone: "success" });
              } catch (error) {
                toast({ title: "应用失败", description: error instanceof Error ? error.message : "请重试", tone: "error" });
              }
            }}>应用到当前镜头</button>}
            {undo && onApply && <button type="button" className={secondary} onClick={() => {
              try { onApply(undo.id, undo.prompt); setUndo(null); toast({ title: "已撤销本次应用" }); }
              catch { toast({ title: "撤销失败，请检查浏览器存储", tone: "error" }); }
            }}>撤销应用</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
