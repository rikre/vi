"use client";

import { useState, useMemo, useRef, useCallback, useEffect, useSyncExternalStore } from "react";
import type { DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  SearchIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  ScriptIcon,
  LayersIcon,
  RefreshCwIcon,
  SparkleIcon,
  UploadIcon,
  MoreIcon,
  EditIcon,
  UserGroupIcon,
  CoinsIcon,
  CheckIcon,
} from "@/components/icons";
import {
  ALL_PROJECTS,
  ALL_MEMBERS,
  formatProjectDate,
  type ShortDramaProject,
  type ScriptProject,
} from "@/lib/mock-projects";
import {
  createProject,
  getProjects,
  subscribeToProjects,
} from "@/lib/project-store";

// ─── Types ───────────────────────────────────────────────────────────────────

// 严格对齐 vibe-video useCreateProjectDialog：3 种创作模式
type ProjectType = "剧本模式" | "自由模式" | "AI重绘";

type UploadedFile = {
  name: string;
  size: string;
  content?: string; // txt 文件读取的文本内容（与 vibe-video 一致）
};

const DEFAULT_DESCRIPTION = "新创建的短剧项目概括描述。";

// 创建模式卡片配置（与 vibe-video ProjectList.tsx 一致：3 选 1）
const PROJECT_TYPE_OPTIONS: ReadonlyArray<{
  value: ProjectType;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "剧本模式", label: "剧本模式", hint: "上传剧本，自动解析", Icon: ScriptIcon },
  { value: "自由模式", label: "自由模式", hint: "输入集数，自由创作", Icon: LayersIcon },
  { value: "AI重绘", label: "AI重绘", hint: "上传原片，智能复刻", Icon: RefreshCwIcon },
];

// ─── Data ────────────────────────────────────────────────────────────────────

const MAIN_TABS = [
  { key: "short", label: "短剧" },
  { key: "script", label: "剧本" },
] as const;

type MainTabKey = (typeof MAIN_TABS)[number]["key"];

const SHORT_SUB_TABS = ["剧本模式", "自由模式", "AI重绘"] as const;
const SCRIPT_SUB_TABS = ["剧本创作", "网文改编", "剧本改编", "剧本评估", "拉片剧本"] as const;

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ComicPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MainTabKey>("short");
  const [activeShortSubTab, setActiveShortSubTab] = useState<string | null>(null);
  const [activeScriptSubTab, setActiveScriptSubTab] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "recycle">("list");

  // 归属筛选
  // 卡片更多菜单
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // 重命名弹窗
  const [renameTarget, setRenameTarget] = useState<ShortDramaProject | null>(null);
  const [renameInput, setRenameInput] = useState("");

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<ShortDramaProject | null>(null);

  // 邀请弹窗
  const [inviteTarget, setInviteTarget] = useState<ShortDramaProject | null>(null);
  const [inviteSelected, setInviteSelected] = useState<string[]>([]);
  const projects = useSyncExternalStore(
    subscribeToProjects,
    getProjects,
    () => ALL_PROJECTS
  );

  // ─── 创建项目表单 state（严格对齐 vibe-video useCreateProjectDialog）──────
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formProjectType, setFormProjectType] = useState<ProjectType>("剧本模式");
  const [formEpisodesCount, setFormEpisodesCount] = useState(3);
  const [formUploadedFile, setFormUploadedFile] = useState<UploadedFile | null>(null);
  const [formIsDragging, setFormIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormDescription("");
    setFormProjectType("剧本模式");
    setFormEpisodesCount(3);
    setFormUploadedFile(null);
    setFormIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    resetForm();
  }, [resetForm]);

  // 点击外部/ESC 关闭更多菜单
  useEffect(() => {
    if (activeMenuId === null) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-more-menu-root]")) return;
      setActiveMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenuId(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeMenuId]);

  // 与 vibe-video useCreateProjectDialog.captureFile 严格一致：txt/text 文件读取文本内容
  const captureFile = useCallback(async (file: File) => {
    const sizeStr = (file.size / 1024 / 1024).toFixed(2) + " MB";
    const canReadText =
      file.type.startsWith("text/") ||
      file.name.toLowerCase().endsWith(".txt");
    const content = canReadText ? await file.text() : undefined;
    setFormUploadedFile({ name: file.name, size: sizeStr, content });
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFormIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFormIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFormIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void captureFile(e.dataTransfer.files[0]);
    }
  }, [captureFile]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void captureFile(e.target.files[0]);
    }
  }, [captureFile]);

  const removeFile = useCallback(() => {
    setFormUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // 提交校验：与 vibe-video useCreateProjectDialog.submit 严格一致
  const canSubmit = (() => {
    if (!formName.trim()) return false;
    if ((formProjectType === "剧本模式" || formProjectType === "AI重绘") && !formUploadedFile) return false;
    if (formProjectType === "自由模式" && (!Number.isFinite(formEpisodesCount) || formEpisodesCount < 1)) return false;
    return true;
  })();

  // 与 vibe-video useCreateProjectDialog.submit 严格一致：补齐 tag/coverType/members/coverUrl/scriptContent 默认字段
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    const project = createProject({
      title: formName,
      description: formDescription || DEFAULT_DESCRIPTION,
      mode: formProjectType,
      plannedEpisodes: formProjectType === "自由模式" ? formEpisodesCount : undefined,
      sourceFileName: formUploadedFile?.name,
      scriptContent: formUploadedFile?.content,
    });
    closeCreateModal();
    router.push(`/comic/${project.id}`);
  };

  // 重命名
  const openRename = useCallback((p: ShortDramaProject) => {
    setActiveMenuId(null);
    setRenameTarget(p);
    setRenameInput(p.title);
  }, []);
  const closeRename = useCallback(() => {
    setRenameTarget(null);
    setRenameInput("");
  }, []);
  const handleRenameSave = useCallback(() => {
    if (!renameTarget) return;
    const trimmed = renameInput.trim();
    if (!trimmed) return;
    console.log("重命名项目", { id: renameTarget.id, oldName: renameTarget.title, newName: trimmed });
    closeRename();
  }, [renameTarget, renameInput, closeRename]);

  // 删除
  const openDelete = useCallback((p: ShortDramaProject) => {
    setActiveMenuId(null);
    setDeleteTarget(p);
  }, []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);
  // ESC 关闭删除确认
  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDelete();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteTarget, closeDelete]);
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    console.log("删除项目", { id: deleteTarget.id, name: deleteTarget.title });
    closeDelete();
  }, [deleteTarget, closeDelete]);

  // 邀请
  const openInvite = useCallback((p: ShortDramaProject) => {
    setActiveMenuId(null);
    setInviteTarget(p);
    setInviteSelected([]);
  }, []);
  const closeInvite = useCallback(() => {
    setInviteTarget(null);
    setInviteSelected([]);
  }, []);
  const toggleInviteMember = useCallback((name: string) => {
    setInviteSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);
  const handleInviteConfirm = useCallback(() => {
    if (!inviteTarget) return;
    if (inviteSelected.length === 0) return;
    console.log("邀请成员", {
      projectId: inviteTarget.id,
      projectName: inviteTarget.title,
      members: inviteSelected,
    });
    closeInvite();
  }, [inviteTarget, inviteSelected, closeInvite]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let visibleProjects = projects;

    // Filter by main tab
    if (activeTab === "short") {
      visibleProjects = visibleProjects.filter((p) => p.type === "short");
      // Filter by short sub-tab
      if (activeShortSubTab) {
          visibleProjects = visibleProjects.filter(
          (p) => p.type === "short" && p.mode === activeShortSubTab
        );
      }
    } else if (activeTab === "script") {
      visibleProjects = visibleProjects.filter((p) => p.type === "script");
      // Filter by script sub-tab
      if (activeScriptSubTab) {
          visibleProjects = visibleProjects.filter(
          (p) => p.type === "script" && p.scriptType === activeScriptSubTab
        );
      }
    }

    // Filter by search
    if (searchQuery) {
      visibleProjects = visibleProjects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by createdAt
    visibleProjects = [...visibleProjects].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return visibleProjects;
  }, [activeTab, activeShortSubTab, activeScriptSubTab, projects, searchQuery, sortBy]);

  const countFor = (key: MainTabKey) => {
    return projects.filter((project) => project.type === key).length;
  };

  // 归属筛选数量徽标
  const handleTabChange = (tab: MainTabKey) => {
    setActiveTab(tab);
    setActiveShortSubTab(null);
    setActiveScriptSubTab(null);
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="px-6 pt-[56px]">
          {/* Header row */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[30px] font-bold leading-tight text-white">
              我的项目
            </h1>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <SearchIcon className="size-4" />
                </div>
                <input
                  type="search"
                  aria-label="搜索项目"
                  placeholder="搜索项目"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-[288px] rounded-lg border border-white/[0.2] bg-white/[0.1] py-2 pl-9 pr-9 text-[14px] text-white outline-none transition-colors placeholder:text-white/60 focus:border-brand"
                />
              </div>

              {/* Sort by createdAt */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
                className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.2] bg-white/[0.1] px-3 py-2 text-[14px] text-white transition-colors hover:bg-white/[0.12]"
              >
                {sortBy === "newest" ? "最新创建" : "最早创建"}
                <ChevronDownIcon className="size-3.5" />
              </button>

              {/* Recycle bin */}
              <button
                type="button"
                aria-pressed={viewMode === "recycle"}
                onClick={() => setViewMode((v) => (v === "recycle" ? "list" : "recycle"))}
                className={`flex h-9 items-center gap-2 rounded-lg border px-3 py-2 text-[14px] transition-colors ${
                  viewMode === "recycle"
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-white/[0.2] bg-white/[0.1] text-white hover:bg-white/[0.12]"
                }`}
              >
                <TrashIcon className="size-4" />
                回收站
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-1 border-b border-white/[0.06] pb-px">
            {MAIN_TABS.map((tab) => {
              const count = countFor(tab.key);
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative flex items-baseline gap-1.5 rounded-t-lg px-4 py-3 text-[15px] font-medium transition-colors ${
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[12px] font-normal ${
                      active ? "text-brand" : "text-white/30"
                    }`}
                  >
                    {count}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-brand" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Short drama sub-tabs */}
          {activeTab === "short" && (
            <div className="mt-4 flex items-center gap-2">
              {SHORT_SUB_TABS.map((sub) => {
                const active = activeShortSubTab === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveShortSubTab(active ? null : sub)}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                      active
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-white/[0.1] bg-white/[0.04] text-white/60 hover:border-white/[0.2] hover:text-white/90"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}

          {/* Script sub-tabs */}
          {activeTab === "script" && (
            <div className="mt-4 flex items-center gap-2">
              {SCRIPT_SUB_TABS.map((sub) => {
                const active = activeScriptSubTab === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveScriptSubTab(active ? null : sub)}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                      active
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-white/[0.1] bg-white/[0.04] text-white/60 hover:border-white/[0.2] hover:text-white/90"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grid */}
          <div className="pb-10 pt-[32px]">
            {viewMode === "recycle" ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
                  <TrashIcon className="size-7" />
                </div>
                <p className="text-[15px] font-medium text-white/60">回收站为空</p>
                <p className="mt-1 text-[13px] text-white/40">
                  删除的项目会在此处保留 30 天，之后将永久删除
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="mt-6 flex h-9 items-center rounded-lg border border-white/[0.15] bg-white/[0.04] px-4 text-[13px] text-white/80 transition-colors hover:bg-white/[0.08]"
                >
                  返回项目列表
                </button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <EmptyProjectsState
                hasFilter={
                  !!searchQuery ||
                  !!activeShortSubTab ||
                  !!activeScriptSubTab
                }
              />
            ) : (
              <div className="grid auto-rows-fr grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {/* Create new card */}
                {activeTab === "short" ? (
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    aria-label="创建短剧项目"
                    className="group flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.12] transition-colors hover:border-brand/40"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-white/40 transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                      <PlusIcon className="size-6" />
                    </div>
                    <span className="text-[14px] text-white/40 transition-colors group-hover:text-white/70">
                      进入创作
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/create"
                    className="group flex h-full min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.12] transition-colors hover:border-brand/40"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-white/40 transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                      <PlusIcon className="size-6" />
                    </div>
                    <span className="text-[14px] text-white/40 transition-colors group-hover:text-white/70">
                      进入创作
                    </span>
                  </Link>
                )}

                {filteredProjects.map((project) =>
                  project.type === "short" ? (
                    <ShortDramaCard
                      key={project.id}
                      project={project}
                      menuOpen={activeMenuId === project.id}
                      onToggleMenu={() =>
                        setActiveMenuId(
                          activeMenuId === project.id ? null : project.id
                        )
                      }
                      onRename={() => openRename(project)}
                      onInvite={() => openInvite(project)}
                      onDelete={() => openDelete(project)}
                    />
                  ) : (
                    <ScriptCard key={project.id} project={project} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 创建项目弹窗：严格对齐 vibe-video ProjectList.tsx 的 Create Project Modal */}
      <Modal
        open={createModalOpen}
        onClose={closeCreateModal}
        title="创建项目"
        className="w-full max-w-lg p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkleIcon className="size-5 text-brand" />
            <h2 className="text-[18px] font-bold text-white">创建项目</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 项目名称 */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
              项目名称 &lt;必填&gt;
            </label>
            <input
              type="text"
              required
              placeholder="如: 媳妇井 / 绝境逃生"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand"
            />
          </div>

          {/* 项目简介 */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
              项目简介 &lt;选填&gt;
            </label>
            <textarea
              rows={2}
              placeholder="一句话描述项目定位，将展示在概览页全剧总览中"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-[14px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand"
            />
          </div>

          {/* 创作模式（3 选 1，严格对齐 vibe-video） */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
              创作模式
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PROJECT_TYPE_OPTIONS.map((opt) => {
                const { Icon } = opt;
                const active = formProjectType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFormProjectType(opt.value);
                      // vibe-video：切到自由模式时清空已上传文件
                      if (opt.value === "自由模式") removeFile();
                    }}
                    className={`flex min-h-[76px] flex-col items-start justify-center gap-1.5 rounded-[11px] border p-3.5 text-left transition-all ${
                      active
                        ? "border-brand bg-brand/[0.06] text-brand shadow-[0_0_22px_rgba(212,255,63,0.05)]"
                        : "border-white/[0.1] bg-white/[0.025] text-white/90 hover:border-white/[0.2]"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="text-[13px] font-semibold">{opt.label}</span>
                    <small className="text-[10px] text-white/40">{opt.hint}</small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 条件字段：上传 / 集数（严格对齐 vibe-video） */}
          {formProjectType === "剧本模式" || formProjectType === "AI重绘" ? (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {formProjectType === "AI重绘" ? "上传原片 <必填>" : "上传剧本 <必填>"}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={formProjectType === "AI重绘" ? ".mp4,.mov,.zip" : ".txt,.pdf,.docx,.doc"}
                className="hidden"
              />
              {!formUploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-all ${
                    formIsDragging
                      ? "border-brand bg-brand/[0.05]"
                      : "border-white/[0.12] bg-white/[0.03] hover:border-white/[0.25]"
                  }`}
                >
                  <div className="flex items-center justify-center rounded-full bg-white/[0.06] p-2.5 text-brand">
                    <UploadIcon className="size-5" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-white/80">
                      点击或将文件拖件到这里上传
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/40">
                      {formProjectType === "AI重绘"
                        ? "mp4/mov ≤500M · 或上传 zip 批量导入"
                        : "支持 PDF, TXT, WORD (最大 50MB)"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] p-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex shrink-0 items-center justify-center rounded-lg bg-brand/10 p-1.5 text-brand">
                      <ScriptIcon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-white/90">
                        {formUploadedFile.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-white/40">
                        {formUploadedFile.size} • 已检测
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-danger transition-all hover:bg-danger/10 hover:text-danger"
                  >
                    删除
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
                集数 &lt;必填&gt;
              </label>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={formEpisodesCount}
                onChange={(e) =>
                  setFormEpisodesCount(Math.max(1, Number(e.target.value) || 1))
                }
                placeholder="请输入计划集数"
                className="h-10 w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand"
              />
              <p className="mt-1.5 text-[10px] text-white/40">
                自由模式会按集数创建空白剧集。
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 text-[14px] font-semibold">
            <button
              type="button"
              onClick={closeCreateModal}
              className="flex h-10 items-center rounded-lg bg-white/[0.06] px-4 text-white/60 transition-colors hover:bg-white/[0.12] hover:text-white/80"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-10 items-center rounded-lg bg-brand px-6 font-semibold text-brand-foreground shadow-lg shadow-brand/10 transition-all hover:bg-brand-hover active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formProjectType === "AI重绘" ? "创建重制项目" : "创建项目"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 重命名弹窗 */}
      <Modal
        open={!!renameTarget}
        onClose={closeRename}
        title="重命名项目"
        className="w-full max-w-md p-6"
      >
        <h2 className="mb-1 text-[18px] font-bold text-white">重命名项目</h2>
        <p className="mb-5 text-[13px] text-white/50">修改项目名称以便更好地识别。</p>
        <input
          type="text"
          autoFocus
          value={renameInput}
          onChange={(e) => setRenameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSave();
          }}
          placeholder="请输入项目名称"
          className="h-10 w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand"
        />
        <div className="mt-6 flex justify-end gap-3 text-[14px] font-semibold">
          <button
            type="button"
            onClick={closeRename}
            className="flex h-10 items-center rounded-lg bg-white/[0.06] px-4 text-white/60 transition-colors hover:bg-white/[0.12] hover:text-white/80"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleRenameSave}
            disabled={!renameInput.trim()}
            className="flex h-10 items-center rounded-lg bg-brand px-6 font-semibold text-brand-foreground transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </Modal>

      {/* 邀请成员弹窗 */}
      <Modal
        open={!!inviteTarget}
        onClose={closeInvite}
        title={`邀请成员到「${inviteTarget?.title ?? ""}」`}
        className="w-full max-w-md p-6"
      >
        <h2 className="mb-1 text-[18px] font-bold text-white">
          邀请成员到「{inviteTarget?.title}」
        </h2>
        <p className="mb-5 text-[13px] text-white/50">
          选择要邀请加入该项目的成员。
        </p>
        {inviteTarget && (() => {
          const candidates = ALL_MEMBERS.filter(
            (m) => !inviteTarget.members.includes(m)
          );
          if (candidates.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] py-10 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
                  <UserGroupIcon className="size-5" />
                </div>
                <p className="text-[14px] font-medium text-white/60">
                  所有成员都已加入该项目
                </p>
              </div>
            );
          }
          return (
            <div className="flex flex-wrap gap-2">
              {candidates.map((name) => {
                const selected = inviteSelected.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleInviteMember(name)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-all ${
                      selected
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-white/[0.1] bg-white/[0.04] text-white/70 hover:border-white/[0.2] hover:text-white"
                    }`}
                  >
                    {selected && <CheckIcon className="size-3.5" />}
                    {name}
                  </button>
                );
              })}
            </div>
          );
        })()}
        <div className="mt-6 flex justify-end gap-3 text-[14px] font-semibold">
          <button
            type="button"
            onClick={closeInvite}
            className="flex h-10 items-center rounded-lg bg-white/[0.06] px-4 text-white/60 transition-colors hover:bg-white/[0.12] hover:text-white/80"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleInviteConfirm}
            disabled={inviteSelected.length === 0}
            className="flex h-10 items-center rounded-lg bg-brand px-6 font-semibold text-brand-foreground transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认邀请{inviteSelected.length > 0 ? ` (${inviteSelected.length})` : ""}
          </button>
        </div>
      </Modal>

      {/* 删除确认模态 */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDelete();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#141414] p-6 outline-none"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
                <TrashIcon className="size-7" />
              </div>
              <h2 className="text-[18px] font-bold text-white">确认删除项目</h2>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-white/50">
                项目「<span className="text-white/80">{deleteTarget.title}</span>」将被永久移除，项目下的所有剧本、资产、分镜和成片数据将不可恢复。
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3 text-[14px] font-semibold">
              <button
                type="button"
                onClick={closeDelete}
                className="flex h-10 items-center rounded-lg bg-white/[0.06] px-4 text-white/60 transition-colors hover:bg-white/[0.12] hover:text-white/80"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex h-10 items-center rounded-lg bg-danger px-6 font-semibold text-white transition-all hover:bg-danger"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ─── Short Drama Card (图一风格) ─────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

type ShortDramaCardProps = {
  project: ShortDramaProject;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onRename: () => void;
  onInvite: () => void;
  onDelete: () => void;
};

function ShortDramaCard({
  project,
  menuOpen,
  onToggleMenu,
  onRename,
  onInvite,
  onDelete,
}: ShortDramaCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/comic/${project.id}`}
        className="block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] transition-all hover:border-white/[0.15]"
      >
        {/* Cover */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={`https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
              project.coverPrompt
            )}&image_size=landscape_4_3`}
            alt={project.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Mode badge — top left */}
          <div className="absolute left-2.5 top-2.5 rounded-md bg-brand/20 px-2 py-0.5 text-[11px] font-medium text-brand backdrop-blur-sm">
            {project.mode}
          </div>

          {/* Episodes badge — top right (left of more button) */}
          <div className="absolute right-10 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur-sm">
            {project.episodes} 集
          </div>
        </div>

        {/* Info */}
        <div className="px-3.5 py-3">
          <h3 className="truncate pr-7 text-[15px] font-semibold text-white">
            {project.title}
          </h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-[12px] text-white/40">
              {formatProjectDate(project.updatedAt)}
            </p>
            <div className="flex shrink-0 items-center gap-1 text-white/50">
              <CoinsIcon className="size-3" />
              <span className="text-[11px] tabular-nums">
                {formatNumber(project.computeSpent)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* More button (card top-right, over cover) */}
      <div data-more-menu-root className="absolute right-2 top-2 z-10">
        <button
          type="button"
          aria-label="更多操作"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleMenu();
          }}
          className={`flex size-7 items-center justify-center rounded-md backdrop-blur-sm transition-all ${
            menuOpen
              ? "bg-black/70 text-white"
              : "bg-black/40 text-white/70 opacity-0 hover:bg-black/70 hover:text-white group-hover:opacity-100"
          }`}
        >
          <MoreIcon className="size-3.5" />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1c] py-1 shadow-xl shadow-black/40"
          >
            <MenuItem
              label="编辑名称"
              Icon={EditIcon}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRename();
              }}
            />
            <MenuItem
              label="邀请分享"
              Icon={UserGroupIcon}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInvite();
              }}
            />
            <div className="my-1 h-px bg-white/[0.06]" />
            <MenuItem
              label="删除项目"
              Icon={TrashIcon}
              danger
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  label,
  Icon,
  onClick,
  danger,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-[13px] transition-colors ${
        danger
          ? "text-danger hover:bg-danger/10 hover:text-danger"
          : "text-white/80 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

// ─── Script Card (图二风格) ───────────────────────────────────────────────────

function ScriptCard({ project }: { project: ScriptProject }) {
  const hasScore = project.score !== null;

  return (
    <Link
      href={`/comic/${project.id}`}
      className="group block rounded-2xl border border-white/[0.06] bg-[#141414] p-4 transition-all hover:border-white/[0.15]"
    >
      {/* Type + status badge */}
      <div className="flex items-center gap-1.5">
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] text-white/50">
          {project.scriptType}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] ${
            project.status === "评估完成"
              ? "bg-brand/15 text-brand"
              : "bg-white/[0.06] text-white/40"
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-white">
        {project.title}
      </h3>

      {/* Score row */}
      {hasScore ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
            <p className="text-[11px] text-white/40">剧本评级</p>
            <p className="mt-0.5 text-[20px] font-bold text-white">
              {project.rating}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
            <p className="text-[11px] text-white/40">潜力评分</p>
            <p className="mt-0.5 text-[20px] font-bold text-white">
              {project.score}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
          <p className="text-[11px] text-white/40">剧本评级</p>
          <p className="mt-0.5 text-[20px] font-bold text-white/30">—</p>
        </div>
      )}

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/40"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
        <span className="text-[12px] text-white/40">{project.updatedAt}</span>
        <span className="text-[12px] text-white/30">{project.dateStr}</span>
      </div>
    </Link>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyProjectsState({ hasFilter }: { hasFilter: boolean }) {
  if (hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
          <SearchIcon className="size-7" />
        </div>
        <p className="text-[15px] font-medium text-white/60">
          未找到匹配的项目
        </p>
        <p className="mt-1 text-[13px] text-white/40">
          尝试更换关键词或调整筛选条件
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
        <LayersIcon className="size-7" />
      </div>
      <p className="text-[15px] font-medium text-white/60">还没有任何项目</p>
      <p className="mt-1 text-[13px] text-white/40">
        点击上方「进入创作」开始你的第一个项目
      </p>
    </div>
  );
}
