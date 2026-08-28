"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  UploadIcon,
  SparkleIcon,
  ChevronDownIcon,
  CoinsIcon,
  FilmIcon,
  StarIcon,
  FileTextIcon,
  Edit3Icon,
  VideoCameraIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { useReferences, getEvidenceMeta } from "@/lib/reference-store";
import { createProject, saveProject } from "@/lib/project-store";
import type { CreateAction, ProjectConfig } from "@/types/project";

// ─── Config components ──────────────────────────────────────────────────────

function UploadDropzone({
  accept = ".docx,.txt,.pdf",
  maxSize = "15 万字",
  label = "上传剧本",
  onClick,
}: {
  accept?: string;
  maxSize?: string;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/[0.15] px-6 py-8">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.12]"
          >
            <UploadIcon className="size-4" />
            {label}
          </button>
          <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.12]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            粘贴文本
          </button>
        </div>
        <p className="text-[12px] text-white/40">
          支持 {accept}，最多 {maxSize}，可拖拽至此上传
        </p>
      </div>
    </div>
  );
}

function DropdownPicker({
  label,
  value,
  options,
  onSelect,
}: {
  label?: string;
  value: string;
  options: readonly string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[13px] text-white/50"
      >
        {label && (
          <>
            <span>{label}</span>
            <span className="text-white/30">·</span>
          </>
        )}
        <span className="text-brand">{value}</span>
        <ChevronDownIcon className="size-3 text-white/30" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[120px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1a] py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]",
                opt === value ? "text-brand" : "text-white/70"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Action-specific config panels ──────────────────────────────────────────

function EvaluatePanel() {
  const [audience, setAudience] = useState("女频");
  const [production, setProduction] = useState("AIGC");
  const [episodes, setEpisodes] = useState("40集");
  const [trigger, setTrigger] = useState<"full" | "quick" | "single">("full");

  const triggerOptions: { id: "full" | "quick" | "single"; label: string; cost: number; desc: string }[] = [
    { id: "full", label: "完整评估", cost: 50, desc: "16 维度，60s" },
    { id: "quick", label: "快速评估", cost: 20, desc: "5 核心，20s" },
    { id: "single", label: "单点评估", cost: 5, desc: "选 1 维度，10s" },
  ];

  return (
    <div className="space-y-4">
      <UploadDropzone label="上传剧本" maxSize="15 万字" />
      <div className="flex flex-wrap items-center gap-3">
        <DropdownPicker label="受众" value={audience} options={["男频", "女频", "不限"]} onSelect={setAudience} />
        <DropdownPicker label="生产方式" value={production} options={["实拍", "AIGC", "不限"]} onSelect={setProduction} />
        <DropdownPicker label="集数" value={episodes} options={["20集", "30集", "40集", "60集", "100集"]} onSelect={setEpisodes} />
      </div>
      <div>
        <p className="mb-2 text-[12px] text-white/40">评估深度</p>
        <div className="grid grid-cols-3 gap-2">
          {triggerOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTrigger(opt.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                trigger === opt.id
                  ? "border-brand bg-brand/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
              )}
            >
              <div className="text-[13px] font-medium text-white">{opt.label}</div>
              <div className="mt-0.5 text-[11px] text-white/40">{opt.desc}</div>
              <div className="mt-1 text-[12px] text-brand">{opt.cost} 积分</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RewritePanel() {
  const [rewriteType, setRewriteType] = useState("deep");
  const [intensity, setIntensity] = useState(2);

  const types = [
    { id: "structure", label: "结构化拆解", desc: "拆解为大纲/人物/场景", star: 1 },
    { id: "deep", label: "深度改写", desc: "重做结构+人物", star: 2 },
    { id: "benchmark", label: "对标改写", desc: "参考爆款风格", star: 2 },
    { id: "media", label: "媒介转换", desc: "网文→短剧剧本", star: 1 },
    { id: "local", label: "局部优化", desc: "只改对白/节奏", star: 1 },
  ];

  return (
    <div className="space-y-4">
      <UploadDropzone label="上传原剧本" accept=".docx,.txt,.pdf,.fountain,.fdx" maxSize="20 万字" />
      <div>
        <p className="mb-2 text-[12px] text-white/40">改写类型</p>
        <div className="grid grid-cols-5 gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setRewriteType(t.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                rewriteType === t.id
                  ? "border-brand bg-brand/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
              )}
            >
              <div className="text-[12px] font-medium text-white">{t.label}</div>
              <div className="mt-0.5 text-[10px] text-white/40">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[12px] text-white/40">改写强度</p>
        <div className="flex items-center gap-2">
          {[
            { v: 1, label: "轻度" },
            { v: 2, label: "中度" },
            { v: 3, label: "深度" },
          ].map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => setIntensity(s.v)}
              className={cn(
                "rounded-lg px-4 py-2 text-[13px] transition-colors",
                intensity === s.v
                  ? "bg-brand text-black"
                  : "bg-white/5 text-white/60 hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImportPanel() {
  const [nextAction, setNextAction] = useState("parse");

  const purposes = [
    { id: "parse", label: "进资产库", desc: "沉淀待用", cost: "免费" },
    { id: "evaluate", label: "立即评估", desc: "5 维评分", cost: "30 积分" },
    { id: "rewrite", label: "立即改写", desc: "1 个强度", cost: "30 积分" },
    { id: "breakdown", label: "拉片分析", desc: "拆解剧本", cost: "10 积分" },
  ];

  return (
    <div className="space-y-4">
      <UploadDropzone label="上传剧本/网文" accept=".docx,.txt,.pdf,.fountain,.fdx" maxSize="20 万字" />
      <div>
        <p className="mb-2 text-[12px] text-white/40">上传目的</p>
        <div className="grid grid-cols-4 gap-2">
          {purposes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setNextAction(p.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                nextAction === p.id
                  ? "border-brand bg-brand/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
              )}
            >
              <div className="text-[13px] font-medium text-white">{p.label}</div>
              <div className="mt-0.5 text-[11px] text-white/40">{p.desc}</div>
              <div className="mt-1 text-[12px] text-brand">{p.cost}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OriginalPanel({
  idea,
  onIdeaChange,
}: {
  idea: string;
  onIdeaChange: (value: string) => void;
}) {
  const [audience, setAudience] = useState("男频");
  const [genre, setGenre] = useState("✦");
  const [setting, setSetting] = useState("✦");
  const [episodes, setEpisodes] = useState("40集");

  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="absolute left-3 top-3 text-[13px] font-medium text-brand">#男频</span>
        <textarea
          rows={4}
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value)}
          placeholder="在此处输入想法，我们将为您定制创意，至少输入 15 字"
          aria-label="创作输入框"
          className="w-full resize-none rounded-xl bg-white/[0.03] px-3 pt-9 text-[14px] leading-relaxed text-white placeholder:text-white/35 outline-none focus:bg-white/[0.05]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <DropdownPicker label="受众" value={audience} options={["男频", "女频"]} onSelect={setAudience} />
        <DropdownPicker label="题材" value={genre} options={["仙侠玄幻", "现代都市", "悬疑灵异", "架空历史"]} onSelect={setGenre} />
        <DropdownPicker label="设定" value={setting} options={["重生", "穿越", "系统", "快穿"]} onSelect={setSetting} />
        <DropdownPicker label="集数" value={episodes} options={["20集", "30集", "40集", "60集", "100集"]} onSelect={setEpisodes} />
      </div>
    </div>
  );
}

function BreakdownPanel() {
  const [mode, setMode] = useState<"single" | "full">("single");
  const [input, setInput] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[12px] text-white/40">拉片模式</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              mode === "single" ? "border-brand bg-brand/10" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
            )}
          >
            <div className="text-[13px] font-medium text-white">单集拉片</div>
            <div className="mt-0.5 text-[11px] text-white/40">5 积分/15 秒</div>
          </button>
          <button
            type="button"
            onClick={() => setMode("full")}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              mode === "full" ? "border-brand bg-brand/10" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
            )}
          >
            <div className="text-[13px] font-medium text-white">全剧拉片</div>
            <div className="mt-0.5 text-[11px] text-white/40">2000 积分</div>
          </button>
        </div>
      </div>
      <div>
        <p className="mb-2 text-[12px] text-white/40">
          {mode === "single" ? "视频链接 / 分享文案" : "剧名 / 夸克链接"}
        </p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "single" ? "粘贴抖音视频链接或分享文案" : "输入剧名或夸克网盘链接"}
          className="w-full rounded-xl bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/35 outline-none focus:bg-white/[0.05]"
        />
        <p className="mt-2 text-[12px] text-white/40">
          {mode === "single" ? "或上传本地视频（< 20MB）" : "或上传视频文件夹"}
        </p>
      </div>
      <div>
        <p className="mb-2 text-[12px] text-white/40">输出资产</p>
        <div className="flex gap-2">
          {["剧本正文", "专业分镜表"].map((asset) => (
            <span key={asset} className="rounded-lg bg-brand/10 px-3 py-1.5 text-[12px] text-brand">
              ☑ {asset}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShortPanel({
  value,
  onChange,
}: {
  value: { mode: "agent" | "manual"; shortMode: "剧本模式" | "分镜模式"; style: string; tone: string; ratio: string };
  onChange: (v: typeof value) => void;
}) {
  const { mode, shortMode, style, tone, ratio } = value;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[12px] text-white/40">创作模式</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "agent" as const, label: "Agent 模式", desc: "上传剧本，AI 自动成片" },
            { id: "manual" as const, label: "人工模式", desc: "空项目，自主编辑每一步" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange({ ...value, mode: m.id })}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                mode === m.id ? "border-brand bg-brand/10" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
              )}
            >
              <div className="text-[13px] font-medium text-white">{m.label}</div>
              <div className="mt-0.5 text-[11px] text-white/40">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {mode === "agent" && (
        <UploadDropzone label="上传剧本" accept=".docx,.txt" maxSize="10 万字" />
      )}
      {mode === "manual" && (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/[0.15] px-6 py-8">
          <p className="text-[13px] text-white/40">
            此模式无需上传剧本，创建项目后所有步骤均可自主编辑
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 text-[12px] text-white/40">短剧模式</p>
        <div className="flex items-center gap-2">
          {(["剧本模式", "分镜模式"] as const).map((sm) => (
            <button
              key={sm}
              type="button"
              onClick={() => onChange({ ...value, shortMode: sm })}
              className={cn(
                "rounded-lg px-4 py-2 text-[13px] transition-colors",
                shortMode === sm ? "bg-brand text-black" : "bg-white/5 text-white/60 hover:text-white"
              )}
            >
              {sm}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DropdownPicker label="画面风格" value={style} options={["无", "写实", "二次元", "3D", "欧美"]} onSelect={(v) => onChange({ ...value, style: v })} />
        <DropdownPicker label="影调" value={tone} options={["无", "明亮", "暗黑", "复古", "赛博朋克"]} onSelect={(v) => onChange({ ...value, tone: v })} />
        <DropdownPicker value={ratio} options={["9:16", "16:9", "1:1", "4:3", "3:4"]} onSelect={(v) => onChange({ ...value, ratio: v })} />
      </div>
    </div>
  );
}

// ─── Action metadata ────────────────────────────────────────────────────────

const ACTION_META: Record<CreateAction, { title: string; desc: string; cost: number; icon: React.ReactNode }> = {
  original: { title: "创剧本", desc: "从 0 到 1，AI 生成原创剧本", cost: 190, icon: <SparkleIcon className="size-5" /> },
  evaluate: { title: "评剧本", desc: "16 维度专业评估，驱动改稿", cost: 50, icon: <StarIcon className="size-5" /> },
  rewrite: { title: "改剧本", desc: "5 种改写类型，3 档强度", cost: 30, icon: <Edit3Icon className="size-5" /> },
  import: { title: "传剧本", desc: "上传入库，选择后续动作", cost: 0, icon: <FileTextIcon className="size-5" /> },
  breakdown: { title: "AI 拉片", desc: "视频反向生产剧本+分镜", cost: 2000, icon: <FilmIcon className="size-5" /> },
  short: { title: "做短剧", desc: "Agent 自动成片或人工模式", cost: 290, icon: <VideoCameraIcon className="size-5" /> },
};

// ─── Main page content ──────────────────────────────────────────────────────

function CreateProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { references, count } = useReferences();
  const action = (searchParams.get("action") || "original") as CreateAction;
  const meta = ACTION_META[action];

  const [shortConfig, setShortConfig] = useState({
    mode: "agent" as "agent" | "manual",
    shortMode: "剧本模式" as "剧本模式" | "分镜模式",
    style: "无",
    tone: "无",
    ratio: "9:16",
  });
  const [originalIdea, setOriginalIdea] = useState("");

  const originalIdeaValid = originalIdea.trim().length >= 15;

  const handleCreate = () => {
    if (action === "original" && !originalIdeaValid) return;

    // 评估/改写使用真实的数字项目 id，避免进入不存在的 p-001/p-002 路由。
    if (action === "evaluate") {
      const project = createProject(
        {
          action: "import",
          source: "original",
          contentType: "short",
          tags: [],
          nextAction: "evaluate",
        },
        meta.title,
      );
      saveProject(project);
      router.push(`/project/${project.id}?tab=evaluation`);
      return;
    }
    if (action === "rewrite") {
      const project = createProject(
        {
          action: "import",
          source: "original",
          contentType: "short",
          tags: [],
          nextAction: "rewrite",
        },
        meta.title,
      );
      saveProject(project);
      router.push(`/project/${project.id}?tab=rewrite`);
      return;
    }

    // 根据 action 构造最小可用 config，创建并保存项目
    let config: ProjectConfig;
    switch (action) {
      case "short":
        config = {
          action: "short",
          ...shortConfig,
        };
        break;
      case "original":
        config = { action: "original", idea: originalIdea.trim(), audience: "男频", genre: "✦", setting: "✦", episodes: 40 };
        break;
      case "import":
        config = { action: "import", source: "original", contentType: "short", tags: [], nextAction: "parse" };
        break;
      case "breakdown":
        config = { action: "breakdown", mode: "single", input: "", outputAssets: ["script", "storyboard"] };
        break;
      default:
        config = { action: "original", idea: "", audience: "男频", genre: "✦", setting: "✦", episodes: 40 };
    }

    const project = createProject(config, meta.title);
    saveProject(project);
    router.push(`/project/${project.id}?tab=overview`);
  };

  return (
    <div className="mx-auto h-full max-w-[880px] overflow-y-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20">
          {meta.icon}
        </span>
        <div>
          <h1 className="text-[22px] font-medium text-white">{meta.title}</h1>
          <p className="text-[13px] text-white/50">{meta.desc}</p>
        </div>
      </div>

      {/* Panel */}
      <div className="rounded-2xl bg-[#141414] p-5 ring-1 ring-white/[0.06]">
        {action === "original" && (
          <OriginalPanel idea={originalIdea} onIdeaChange={setOriginalIdea} />
        )}
        {action === "evaluate" && <EvaluatePanel />}
        {action === "rewrite" && <RewritePanel />}
        {action === "import" && <ImportPanel />}
        {action === "breakdown" && <BreakdownPanel />}
        {action === "short" && <ShortPanel value={shortConfig} onChange={setShortConfig} />}
      </div>

      {/* 引用带入提示 — 来自广场/AI 助手的跨模块引用 */}
      {count > 0 && (
        <div className="mt-4 rounded-xl bg-brand/[0.06] p-4 ring-1 ring-brand/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-brand">
                将带入 {count} 条引用
              </p>
              <p className="mt-0.5 text-[11px] text-white/50">
                来自广场/AI 助手，创建后可在项目「引用」tab 查看
              </p>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // 滚动到引用清单 — 这里只是提示，实际清单在项目创建后的 [id]?tab=references
                window.console.log("[create] references will be carried over:", references);
              }}
              className="text-[12px] text-white/60 hover:text-brand"
            >
              查看 →
            </a>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {references.slice(0, 5).map((r) => {
              const meta = getEvidenceMeta(r.evidenceType);
              return (
                <span
                  key={`${r.type}-${r.id}`}
                  className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", meta.color)}
                >
                  {r.title}
                </span>
              );
            })}
            {count > 5 && (
              <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/40">
                +{count - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {action === "original" && !originalIdeaValid && (
        <p className="mt-3 text-right text-[12px] text-warning" role="status">
          请先输入至少 15 个字，再开始创作
        </p>
      )}

      {/* CTA */}
      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={handleCreate}
          disabled={action === "original" && !originalIdeaValid}
          className="flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-[14px] font-bold text-black shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
        >
          {action === "import" ? "创建项目" : `开始${meta.title}`}
          {meta.cost > 0 && (
            <>
              <CoinsIcon className="size-4" />
              <span className="tabular-nums">{meta.cost}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProjectNewPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-10 text-center text-white/40">加载中…</div>}>
        <CreateProjectContent />
      </Suspense>
    </AppShell>
  );
}
