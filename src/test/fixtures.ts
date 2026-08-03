import type { ShortDramaProject, ShotItem } from "@/lib/mock-projects";

const STORAGE_KEY = "bollo-custom-projects";

export function seedProject(project: ShortDramaProject): void {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const existing: ShortDramaProject[] = raw ? JSON.parse(raw) : [];
  const next = [project, ...existing.filter((p) => p.id !== project.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearStore(): void {
  window.localStorage.clear();
}

export function makeProject(
  overrides: Partial<ShortDramaProject> = {},
): ShortDramaProject {
  return {
    id: 9999,
    type: "short",
    title: "测试项目",
    mode: "剧本模式",
    episodes: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    coverPrompt: "test cover",
    description: "测试描述",
    characters: [
      { id: "c1", name: "主角", role: "主角", description: "核心角色" },
      { id: "c2", name: "配角", role: "配角", description: "次要角色" },
    ],
    tag: "创作中",
    coverType: "gradient",
    members: ["常谦"],
    computeSpent: 100,
    todaySpent: 10,
    assets: { total: 4, characters: 2, scenes: 1, props: 1 },
    ...overrides,
  };
}

export function makeShots(episode = 1): ShotItem[] {
  return [
    {
      id: "s1",
      episode,
      index: 1,
      description: "镜头一",
      duration: "0:10",
      characters: ["主角"],
      scene: "场景A",
      prompt: "shot one",
      status: "已生成",
    },
    {
      id: "s2",
      episode,
      index: 2,
      description: "镜头二",
      duration: "0:08",
      characters: [],
      scene: "场景B",
      prompt: "shot two",
      status: "未开始",
    },
  ];
}
