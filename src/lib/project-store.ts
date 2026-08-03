import {
  ALL_PROJECTS,
  type Project,
  type ShortDramaMode,
  type ShortDramaProject,
} from "@/lib/mock-projects";

const STORAGE_KEY = "bollo-custom-projects";
const CHANGE_EVENT = "bollo-projects-change";
let cachedStorageValue: string | null | undefined;
let cachedProjects: Project[] = ALL_PROJECTS;

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

export function getProject(id: number): Project | undefined {
  return getProjects().find((project) => project.id === id);
}

export function createProject(input: CreateProjectInput): ShortDramaProject {
  const now = Date.now();
  const episodes = Math.max(1, Math.min(200, input.plannedEpisodes ?? 3));
  const project: ShortDramaProject = {
    id: now,
    type: "short",
    title: input.title.trim(),
    mode: input.mode,
    episodes,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: "刚刚",
    coverPrompt: `cinematic short drama key visual, ${input.title}, dark atmosphere, lime green accent`,
    description: input.description.trim() || "新创建的短剧项目概括描述。",
    characters: [],
    sourceFileName: input.sourceFileName,
    plannedEpisodes: input.mode === "自由模式" ? episodes : undefined,
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦", "张三"],
    computeSpent: 0,
    todaySpent: 0,
    assets: { total: 0, characters: 0, scenes: 0, props: 0 },
    scriptContent: input.scriptContent,
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
