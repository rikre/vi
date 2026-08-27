import {
  ALL_PROJECTS,
  type Project,
  type ShortDramaMode,
  type ShortDramaProject,
} from "@/lib/mock-projects";
import type { CreateAction, ProjectConfig } from "@/types/project";

const STORAGE_KEY = "bollo-custom-projects";
const CHANGE_EVENT = "bollo-projects-change";
let cachedStorageValue: string | null | undefined;
let cachedProjects: Project[] = ALL_PROJECTS;

const ACTION_LABELS: Record<CreateAction, string> = {
  original: "创剧本",
  evaluate: "评剧本",
  rewrite: "改剧本",
  import: "传剧本",
  breakdown: "AI 拉片",
  short: "做短剧",
};

type CreateProjectInput = {
  title: string;
  description: string;
  mode: ShortDramaMode;
  plannedEpisodes?: number;
  sourceFileName?: string;
  scriptContent?: string;
};

function readCustomProjects(): ShortDramaProject[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const projects: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(projects) ? (projects as ShortDramaProject[]) : [];
  } catch {
    return [];
  }
}

function writeCustomProjects(projects: ShortDramaProject[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage 溢出或不可用时静默降级
  }
}

export function subscribeToProjects(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getProjects(): Project[] {
  if (typeof window === "undefined") return ALL_PROJECTS;

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === cachedStorageValue) return cachedProjects;

  cachedStorageValue = value;
  cachedProjects = [...readCustomProjects(), ...ALL_PROJECTS];
  return cachedProjects;
}

export function getProject(id: number | string): Project | undefined {
  return getProjects().find((project) => String(project.id) === String(id));
}

// ─── /project/[id]、/project/new 页面兼容层 ─────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  evaluating: "评估中",
  rewriting: "改写中",
  completed: "已完成",
  failed: "失败",
};

export function statusLabel(status?: string): string {
  if (!status) return "进行中";
  return STATUS_LABELS[status] ?? status;
}

const TYPE_LABELS: Record<string, string> = {
  short: "短剧",
  script: "剧本",
};

export function typeLabel(type?: string): string {
  if (!type) return "项目";
  return TYPE_LABELS[type] ?? type;
}

// 幂等保存：移除同 id 后置顶写入（createProject 已写入时等价于刷新）
export function saveProject(project: ShortDramaProject): void {
  const rest = readCustomProjects().filter((p) => p.id !== project.id);
  writeCustomProjects([project, ...rest]);
}

export function createProject(input: CreateProjectInput): ShortDramaProject;
export function createProject(config: ProjectConfig, title: string): ShortDramaProject;
export function createProject(
  input: CreateProjectInput | ProjectConfig,
  title?: string,
): ShortDramaProject {
  if (title !== undefined) {
    const config = input as ProjectConfig;
    const inputFromConfig: CreateProjectInput = {
      title,
      description: `通过「${ACTION_LABELS[config.action]}」创建的项目`,
      mode: "剧本模式",
      plannedEpisodes: config.action === "original" ? config.episodes : 3,
    };
    return createProject(inputFromConfig);
  }

  const createProjectInput = input as CreateProjectInput;
  const now = Date.now();
  const episodes = Math.max(1, Math.min(200, createProjectInput.plannedEpisodes ?? 3));
  const project: ShortDramaProject = {
    id: now,
    type: "short",
    title: createProjectInput.title.trim(),
    mode: createProjectInput.mode,
    episodes,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: "刚刚",
    coverPrompt: `cinematic short drama key visual, ${createProjectInput.title}, dark atmosphere, lime green accent`,
    description: createProjectInput.description.trim() || "新创建的短剧项目概括描述。",
    characters: [],
    sourceFileName: createProjectInput.sourceFileName,
    plannedEpisodes: createProjectInput.mode === "自由模式" ? episodes : undefined,
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦", "张三"],
    computeSpent: 0,
    todaySpent: 0,
    assets: { total: 0, characters: 0, scenes: 0, props: 0 },
    scriptContent: createProjectInput.scriptContent,
    episodeList: Array.from({ length: episodes }, (_, index) => ({
      id: `ep-${now}-${index + 1}`,
      number: index + 1,
      title: `第${index + 1}集`,
      status: "未开始" as const,
      progress: 0,
    })),
    shots: [],
  };

  writeCustomProjects([project, ...readCustomProjects()]);
  return project;
}

export function updateProject(
  id: number,
  patch: Partial<ShortDramaProject>,
): void {
  const custom = readCustomProjects();
  const existingCustom = custom.find((p) => p.id === id);

  if (existingCustom) {
    const updated = { ...existingCustom, ...patch, updatedAt: "刚刚" };
    writeCustomProjects(
      custom.map((p) => (p.id === id ? updated : p)),
    );
  } else {
    const mockOriginal = ALL_PROJECTS.find(
      (p): p is ShortDramaProject => p.id === id && p.type === "short",
    );
    if (mockOriginal) {
      const cloned: ShortDramaProject = {
        ...mockOriginal,
        ...patch,
        updatedAt: "刚刚",
      };
      writeCustomProjects([cloned, ...custom]);
    }
  }
}

export function deleteProject(id: number): void {
  const custom = readCustomProjects();
  writeCustomProjects(custom.filter((p) => p.id !== id));
}

export function renameProject(id: number, title: string): void {
  updateProject(id, { title });
}
