"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  FileTextIcon,
  GiftIcon,
  PaletteIcon,
  UploadIcon,
  UserGroupIcon,
  WeChatIcon,
} from "@/components/icons";
import { StyleLibraryDialog } from "@/components/style-library-dialog";
import { txi } from "@/app/library/data";

type MainMode = "short" | "script";
type ShortSubMode = "agent" | "manual";
type ScriptTab = "自由创作" | "IP 改编" | "剧本改编";

const SCRIPT_MODELS = ["Bollo 3.7 Flash", "Bollo 3.7 Pro", "Bollo 4o"] as const;

function UserGroupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="加入用户群"
        onClick={(e) => e.stopPropagation()}
        className="card-base w-[320px] p-6 text-center"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <WeChatIcon className="size-7" />
        </div>
        <h3 className="mt-4 text-[16px] font-semibold text-foreground">加入 Bollo 用户群</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          扫码添加官方企微，进群领取新手算力礼包、参与创作交流。
        </p>
        <img
          src={txi(
            "wechat qr code placeholder, minimal black and white pattern on dark background",
            "square"
          )}
          alt="用户群二维码"
          loading="lazy"
          className="mx-auto mt-4 size-40 rounded-xl object-cover ring-1 ring-border"
        />
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-surface-elevated py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-white/15"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}

export function HomeHero() {
  const router = useRouter();
  const [mainMode, setMainMode] = useState<MainMode>("short");
  const [shortSubMode, setShortSubMode] = useState<ShortSubMode>("agent");
  const [projectName, setProjectName] = useState("");
  const [aspect, setAspect] = useState<"16:9" | "9:16">("9:16");
  const [styleOpen, setStyleOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const [scriptTab, setScriptTab] = useState<ScriptTab>("自由创作");
  const [scriptText, setScriptText] = useState("");
  const [model, setModel] = useState<string>(SCRIPT_MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  const isAgent = shortSubMode === "agent";

  const createShortProject = () => {
    const q = new URLSearchParams({ action: "short" });
    if (projectName.trim()) q.set("name", projectName.trim());
    if (!isAgent) q.set("mode", "manual");
    router.push(`/project/new?${q.toString()}`);
  };

  const submitScript = () => {
    const q = new URLSearchParams({ action: "original", tab: scriptTab });
    if (scriptText.trim()) q.set("idea", scriptText.trim().slice(0, 200));
    router.push(`/create?${q.toString()}`);
  };

  return (
    <section className="relative">
      {/* ── 页面头：logo 居中 + 右上角操作 ── */}
      <header className="relative flex h-[116px] items-start justify-center pt-4 md:h-[82px]">
        <img
          src="/images/home/home-logo.png"
          alt="Bollo 标志"
          className="h-[63px] w-[132px] object-contain"
        />
        <div className="absolute inset-x-0 top-[70px] flex items-center justify-center gap-2 md:inset-x-auto md:right-0 md:top-4 md:justify-end md:gap-2.5">
          <button
            type="button"
            onClick={() => setGroupOpen(true)}
            aria-haspopup="dialog"
            className="flex h-9 items-center gap-1.5 rounded-full bg-surface/40 px-3 text-[12px] text-muted-foreground ring-1 ring-border transition-colors hover:bg-surface hover:text-foreground hover:ring-white/25 md:px-4 md:text-[13px]"
          >
            <UserGroupIcon className="size-4" />
            用户群
          </button>
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="relative flex h-9 items-center gap-1.5 rounded-full bg-brand/[0.08] px-3 text-[12px] font-semibold text-brand ring-1 ring-brand/20 transition-all hover:bg-brand/[0.14] hover:ring-brand/35 active:scale-[0.98] md:px-4 md:text-[13px]"
          >
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-1.5 text-[10px] font-medium text-background">
              最高 1000 积分
            </span>
            <GiftIcon className="size-4" />
            邀请有礼
          </button>
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="relative flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-brand-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <span className="absolute -right-1 -top-1.5 rounded-sm bg-foreground px-1 text-[10px] font-bold text-brand">
              67折
            </span>
            订阅计划
          </button>
        </div>
      </header>

      {/* ── 价值主张：只说明产品能力，不引入不可验证的数据 ── */}
      <div className="mx-auto mt-2 max-w-[720px] text-center md:mt-5">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground md:text-[32px]">
          让灵感，成为下一部作品
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-muted-foreground md:text-[13px]">
          从一个故事到完整短剧，剧本、资产与成片在同一工作台完成。
        </p>
      </div>

      {/* ── 主模式切换 ── */}
      <div className="mx-auto mt-5 flex w-fit items-center gap-1 rounded-full bg-surface/80 p-1 ring-1 ring-border">
        {(
          [
            { id: "short", label: "做短剧" },
            { id: "script", label: "写剧本" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mainMode === m.id}
            onClick={() => setMainMode(m.id)}
            className={cn(
              "rounded-full px-10 py-2 text-[14px] font-semibold transition-colors",
              mainMode === m.id
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── 创作卡片 ── */}
      <div className="hero-panel mx-auto mt-5 max-w-[1050px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[11px] text-muted-foreground">
          <span className="font-medium tracking-[0.08em] text-foreground/70">创作配置</span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            智能创作工作台
          </span>
        </div>
        {mainMode === "short" ? (
          <div className="flex flex-col gap-3 p-3">
            {/* 项目名 */}
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="项目名*"
              aria-label="项目名"
              className="h-9 w-full rounded-full bg-black/25 px-4 text-[13px] text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-brand/50"
            />

            {/* 上传区 */}
            <button
              type="button"
              onClick={createShortProject}
              className="flex h-[104px] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border transition-colors hover:border-brand/40 hover:bg-white/[0.03]"
            >
              <span className="flex size-[38px] items-center justify-center rounded-xl bg-white/[0.08] text-foreground">
                <UploadIcon className="size-[19px]" />
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <strong className="text-[14px] font-semibold text-foreground">
                  {isAgent ? "上传剧本" : "此模式无需上传剧本"}
                </strong>
                <small className="text-[12px] text-muted-foreground">
                  {isAgent
                    ? "支持 TXT、PDF、DOCX，创建后进入 Agent 模式项目。"
                    : "填写项目名后即可创建人工模式项目。"}
                </small>
              </span>
            </button>

            {/* 底栏 */}
            <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-black/50 p-1 ring-1 ring-border">
                {(
                  [
                    { id: "agent", label: "Agent 模式" },
                    { id: "manual", label: "人工模式" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={shortSubMode === t.id}
                    onClick={() => setShortSubMode(t.id)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3.5 py-1 text-[12px] font-medium transition-colors",
                      shortSubMode === t.id
                        ? "bg-brand text-brand-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {isAgent ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStyleOpen(true)}
                      className="flex h-8.5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/25 px-3.5 text-[12px] text-brand/90 ring-1 ring-border transition-colors hover:ring-brand/40"
                    >
                      <PaletteIcon className="size-4" />
                      风格选择
                    </button>
                    <div className="flex h-8.5 items-center gap-0.5 rounded-full bg-black/25 p-0.5 ring-1 ring-border">
                      {(["16:9", "9:16"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAspect(a)}
                          aria-pressed={aspect === a}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[12px] tabular-nums transition-colors",
                            aspect === a
                              ? "bg-brand text-brand-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={createShortProject}
                  className="flex h-8.5 shrink-0 items-center rounded-full bg-brand px-4 text-[13px] font-bold text-brand-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  创建项目
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col p-3">
            {/* 灵感输入 */}
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={
                scriptTab === "自由创作"
                  ? "写下一个人物、一种关系、一个冲突，或你想拍成短剧的任何念头……"
                  : scriptTab === "IP 改编"
                    ? "粘贴 IP 大纲或链接，我们会提取设定并规划改编方案……"
                    : "粘贴现有剧本全文，我们将按短剧节奏进行改编……"
              }
              aria-label="剧本灵感输入"
              rows={4}
              className="min-h-[100px] w-full resize-none bg-transparent px-1 py-2 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground outline-none"
            />

            {/* 工具行 */}
            <div className="flex items-center justify-between gap-3 pb-2">
              <button
                type="button"
                onClick={() => router.push("/create")}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <FileTextIcon className="size-4" />
                上传文件
              </button>
              <p className="hidden text-[12px] text-muted-foreground sm:block">
                可附上参考文件，和你的故事灵感一起带入创作。
              </p>
            </div>

            {/* 底栏 */}
            <div className="flex h-9 items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-full bg-black/50 p-1 ring-1 ring-border">
                {(["自由创作", "IP 改编", "剧本改编"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={scriptTab === t}
                    onClick={() => setScriptTab(t)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                      scriptTab === t
                        ? "bg-brand text-brand-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div ref={modelRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={modelOpen}
                    onClick={() => setModelOpen((v) => !v)}
                    className="flex h-8 items-center gap-1.5 rounded-full bg-black/50 px-3.5 text-[12px] text-foreground ring-1 ring-border transition-colors hover:ring-brand/40"
                  >
                    模型：{model}
                    <ChevronDownIcon
                      className={cn("size-3.5 text-muted-foreground transition-transform", modelOpen && "rotate-180")}
                    />
                  </button>
                  {modelOpen ? (
                    <div
                      role="listbox"
                      className="absolute bottom-full z-30 mb-2 min-w-[160px] overflow-hidden rounded-xl bg-surface-elevated py-1 shadow-xl ring-1 ring-border"
                    >
                      {SCRIPT_MODELS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          role="option"
                          aria-selected={m === model}
                          onClick={() => {
                            setModel(m);
                            setModelOpen(false);
                          }}
                          className={cn(
                            "block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]",
                            m === model ? "text-brand" : "text-foreground/80"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={submitScript}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-[9px] bg-brand px-5 text-[13px] font-bold text-brand-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  写剧本
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <UserGroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />
      <StyleLibraryDialog open={styleOpen} onClose={() => setStyleOpen(false)} />
    </section>
  );
}
