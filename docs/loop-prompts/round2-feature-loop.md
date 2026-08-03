# Loop Round 2+ — 功能闭环驱动（逐模块迭代模板）

> **模式**：方案 A（功能闭环驱动），从桩代码走到生产质量
> **前置条件**：Round 1（设计 Token 层硬化）已完成
> **使用方式**：每个模块运行一次完整 Loop，产出可演示的完整功能

---

## 模块优先级队列

按用户价值和技术依赖排序，逐模块推进：

| 序号 | 模块 | vibe-video 参考文件 | 依赖模块 | 预计 Loop 轮次 |
|------|------|---------------------|---------|--------------|
| 1 | 项目工作台-概览 | ProjectDetail.tsx (概览 tab) | 无 | 1 |
| 2 | 剧本编辑器 | ProjectDetail.tsx (剧本 tab) + data.ts | 概览 | 1 |
| 3 | 资产管理 | ProjectDetail.tsx (资产 tab) | 剧本（提取资产） | 1 |
| 4 | 分镜工作台 | ProjectDetail.tsx (分镜 tab) | 资产（角色引用） | 2 |
| 5 | 成片组装 | ProjectDetail.tsx (成片 tab) | 分镜（镜头素材） | 1 |
| 6 | AI重绘四步向导 | RemakeStudio.tsx | 无（独立流程） | 2 |
| 7 | 广场/技能/资产库 | — | 无 | 2 |
| 8 | 发布中心 | — | 成片 | 1 |

**Karpathy 原则 — March of Nines**：每轮 Loop 不是"做完就行"。验收标准不是"happy path 走通"，而是"最难的 5% 场景也通过"。一个能创建项目但搜索空状态崩溃的模块，还没有到 90%。

---

## Loop 模板（每个模块运行一次）

### Phase 1 — 功能走查与数据流追踪

**目标**：理解当前状态的真相，不要基于假设动手。

#### 1.1 桩点清点

扫描当前模块的所有 `console.log`、空 `onClick`、`// TODO`：

```bash
# 找到当前模块的所有桩点
rg "console\.log" src/components/project-detail/[当前模块].tsx -n
rg "onClick=\{?\(\) =>|onClick=\{\(\)" src/components/project-detail/[当前模块].tsx -n
rg "TODO|FIXME|HACK" src/components/project-detail/[当前模块].tsx -n
```

产出桩点清单：

```markdown
## 桩点清单：[模块名]

| 文件:行号 | 当前行为 | 期望行为 | 复杂度 |
|-----------|---------|---------|--------|
| asset-tab.tsx:241 | console.log("提取资产") | 触发模拟提取流程，更新 assets 状态 | 中 |
| asset-tab.tsx:512 | console.log("删除") | 从 project.characters 中移除 | 低 |
| ... | ... | ... | ... |
```

#### 1.2 数据流追踪（Karpathy 原则 — 先看数据再动代码）

画清当前模块的数据全链路：

```markdown
## 数据流追踪：[模块名]

### 数据来源
- 从哪读取？project-store.ts / mock-projects.ts / 组件内部 state
- 数据结构是什么？（列出 TypeScript 类型）

### 数据存储
- 存在哪？localStorage / React state / 无持久化
- 生命周期？页面刷新后是否还在？

### 数据读写
- 谁读取这个数据？（列出所有消费者）
- 谁写入这个数据？（列出所有修改者）

### 数据飞轮评估
- 当前数据层设计能否未来无痛迁移到 API？
- 是否积累了可复用的用户行为数据？
```

#### 1.3 vibe-video 对照

读取 vibe-video 对应模块的实现，提取可复用的模式：

```bash
# 获取 vibe-video 对应文件
gh api "repos/rikre/vibe-video/contents/src/components/ProjectDetail.tsx" -H "Accept: application/vnd.github.raw+json"
```

对照清单：
- [ ] vibe-video 的状态结构（哪些 useState）
- [ ] vibe-video 的数据流（props 还是 store）
- [ ] vibe-video 的 AI 模拟方式（setTimeout 链的模式）
- [ ] vibe-video 的子组件拆分方式

---

### Phase 2 — 数据与状态层

**目标**：为该模块建立干净的数据层，对齐 vibe-video 的类型和 store 模式。

#### 2.1 创建自定义 Hook

在 `src/hooks/` 下创建模块专用 Hook（目前目录为空，从此开始填充）：

```
src/hooks/
  use-project-store.ts      # Round 2.1 创建：项目 CRUD + 持久化
  use-script-chapters.ts     # Round 2.2 创建：剧本章节解析与管理
  use-asset-extraction.ts    # Round 2.3 创建：资产提取模拟
  use-storyboard.ts          # Round 2.4 创建：分镜 CRUD
  use-film-assembly.ts       # Round 2.5 创建：成片组装
  use-remake-studio.ts       # Round 2.6 创建：AI重绘四步向导
```

#### 2.2 Hook 设计规范

```typescript
// 每个 Hook 必须遵循的结构
export function useXxx(project: ShortDramaProject) {
  // 1. 派生数据（从 project 中计算）
  const derived = useMemo(() => ..., [project.xxx]);

  // 2. 本地状态（UI 交互）
  const [state, setState] = useState(...);

  // 3. AI 模拟（setTimeout 链，对齐 vibe-video 模式）
  const simulate = useCallback(() => {
    // 分阶段更新状态，模拟异步生成
  }, []);

  // 4. 返回值
  return { derived, state, setState, simulate };
}
```

**Karpathy 原则 — Don't be a hero**：
- 单个 Hook 不超过 8 个 useState（如果超过，说明该拆分了）
- 只有 3+ 处复用的逻辑才抽 Hook（不过早抽象）
- Hook 命名以 `use-` 开头，kebab-case 文件名，camelCase 函数名

#### 2.3 数据飞轮检查（Karpathy 原则 — Data flywheel 优先）

```markdown
## 数据飞轮检查：[模块名]

- [ ] 数据层接口设计为 `getData()` / `mutate(data)` 模式，而非直接操作 localStorage
- [ ] 未来迁移到 API 时，只需替换 `getData`/`mutate` 实现，组件不变
- [ ] 积累的数据格式与 API 预期的 JSON schema 兼容
- [ ] 如果有 AI 生成模拟，模拟的输入输出格式与真实 API 一致
```

#### 2.4 验证

```bash
npm run typecheck
```

---

### Phase 3 — 组件重构

**目标**：拆分大文件，消除孤儿组件，应用设计 token。

#### 3.1 文件拆分

| 当前文件 | 行数 | 拆分目标 |
|---------|------|---------|
| `comic/page.tsx` | 1212 | `comic/page.tsx`（主框架）+ `comic/create-modal.tsx` + `comic/rename-modal.tsx` + `comic/delete-dialog.tsx` + `comic/invite-modal.tsx` + `comic/short-drama-card.tsx` + `comic/script-card.tsx` + `comic/empty-state.tsx` |
| `library/page.tsx` | 1297 | `library/page.tsx`（主框架）+ `library/artist-section.tsx` + `library/voice-section.tsx` + `library/legacy-section.tsx` |
| `remake-studio.tsx` | 1038 | `remake-studio/index.tsx`（主框架）+ `remake-studio/source-step.tsx` + `remake-studio/mapping-step.tsx` + `remake-studio/storyboard-step.tsx` + `remake-studio/compare-step.tsx` |

**Karpathy 原则 — 复杂度预算**：
- 单文件 < 300 行（硬限制，超过必须拆分）
- 单组件 < 8 个 useState（超过说明职责过多，应抽取 Hook）
- 嵌套深度 < 5 层 JSX
- props 数量 < 8 个（超过应考虑用 Context 或合并对象）

#### 3.2 孤儿组件清理

以下组件未被任何页面引用，需删除或合并：

| 文件 | 状态 | 处理 |
|------|------|------|
| `components/project/project-grid.tsx` | 未被引用（/comic 有自己的卡片） | 删除 |
| `components/asset-gallery.tsx` | 未被引用（/library 有自己的 ArtistDetailDialog） | 删除 |
| `components/asset-detail.tsx` | 依赖 asset-gallery | 删除 |
| `components/home/greeting.tsx` | 未被 /home/page.tsx 引用 | 合并回 hero-section 或删除 |
| `components/home/features-section.tsx` | 未被引用 | 合并回 hero-section 或删除 |
| `components/home/skill-section.tsx` | 未被引用 | 删除 |
| `components/home/projects-section.tsx` | 未被引用 | 删除 |
| `components/ui/button.tsx` | 未被引用 | 保留（未来可用），但标注 "not yet adopted" |

#### 3.3 设计 Token 应用

确认所有组件使用 Round 1 建立的语义 token：
- [ ] 无 `text-red-400` 等原生色板残留
- [ ] 使用 `text-danger` / `text-success` / `text-warning` / `text-info`
- [ ] 使用 `bg-brand` / `text-brand` / `text-brand-foreground`

#### 3.4 验证

```bash
npm run typecheck
npm run lint
```

---

### 🔶 人工检查点（Karpathy 原则 — Iron Man 套装 > 机器人）

**AI 完成组件重构后，必须人工确认架构方向再继续 P4。**

以下检查项需要人工判断（AI 容易在跨文件重构中犯错）：

```markdown
## 人工检查清单

### 架构方向确认
- [ ] 拆分后的文件结构是否合理？目录层级是否过深？
- [ ] 组件职责划分是否清晰？有没有"为了拆而拆"的情况？
- [ ] Hook 的抽取是否过早？（是否有 3+ 处复用？）

### 类型安全确认
- [ ] 拆分后的 props 类型是否完整？有没有用 `any` 或 `as` 绕过？
- [ ] Hook 返回值类型是否显式声明？

### 视觉一致性确认
- [ ] 拆分后的组件渲染结果与拆分前是否完全一致？
- [ ] 截图对比：拆分前 vs 拆分后

### 确认签字
- [ ] 架构方向 OK，继续 P4
- [ ] 需要调整：[说明]
```

**Karpathy 原则 — 锯齿状智能**：AI 在以下任务上容易出错（凹陷点）：
- 跨文件重构（容易丢导入、错引用）
- CSS 像素对齐（容易差 1-2px）
- 类型推导（容易用 `any` 绕过 strict mode）
- 状态同步（多个组件共享状态时容易遗漏更新点）

这些是 AI 的系统性凹陷点，人工必须介入确认。

---

### Phase 4 — 交互逻辑接线

**目标**：将桩函数替换为真实状态操作。

#### 4.1 桩点替换

按 Phase 1 产出的桩点清单，逐个替换：

```markdown
## 桩点替换记录：[模块名]

| 文件:行号 | 桩点 | 替换为 | 验证方式 |
|-----------|------|--------|---------|
| asset-tab.tsx:241 | console.log("提取资产") | simulateExtraction() — setTimeout 链模拟 角色→场景→道具 三阶段 | UI 观察进度动画 |
| asset-tab.tsx:512 | console.log("删除") | removeFromProject(id) — 更新 project.characters | 列表减少一项 |
| ... | ... | ... | ... |
```

#### 4.2 AI 模拟模式

对齐 vibe-video 的 setTimeout 链模式：

```typescript
// 示例：资产提取模拟（对齐 vibe-video ProjectDetail.tsx 的 startSubjectExtraction）
function simulateExtraction() {
  setIsExtracting(true);
  setExtractionStage("角色");
  setTimeout(() => {
    setExtractionStage("场景");
    setTimeout(() => {
      setExtractionStage("道具");
      setTimeout(() => {
        setIsExtracting(false);
        setHasExtracted(true);
      }, 520);
    }, 520);
  }, 520);
}
```

#### 4.3 验证

```bash
# 功能验证（agent-browser）
agent-browser open http://localhost:3000/comic/2
agent-browser snapshot -i
# 点击对应按钮，确认交互逻辑生效
```

---

### Phase 5 — 测试

**目标**：为数据层写单元测试，为关键交互写集成测试。

#### 5.1 测试框架选择

```bash
# 检查项目中是否已有测试框架
cat package.json | grep -E "vitest|jest|playwright|testing-library"
```

如果项目中没有测试框架，选择 **Vitest + React Testing Library**：

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

在 `package.json` 中添加：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

创建 `vitest.config.ts`：

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### 5.2 单元测试（数据层）

为每个 Hook 的数据操作写测试：

```typescript
// src/hooks/use-project-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createProject, getProjects, getProject } from "@/lib/project-store";

describe("project-store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("创建项目后应出现在列表中", () => {
    const project = createProject({
      title: "测试项目",
      description: "测试描述",
      mode: "自由模式",
      plannedEpisodes: 3,
    });
    const projects = getProjects();
    expect(projects.find((p) => p.id === project.id)).toBeDefined();
  });

  it("创建项目后应可通过 ID 查询", () => {
    const project = createProject({
      title: "测试项目",
      description: "",
      mode: "剧本模式",
    });
    const found = getProject(project.id);
    expect(found?.title).toBe("测试项目");
  });
});
```

#### 5.3 尾部测试（Karpathy 原则 — March of Nines）

测试最难的 5% 场景：

```typescript
describe("project-store 尾部测试", () => {
  it("localStorage 满时不应崩溃", () => {
    // 模拟 localStorage 满
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException("QuotaExceededError");
    };
    expect(() => createProject({ title: "x", description: "", mode: "自由模式" })).not.toThrow();
    Storage.prototype.setItem = original;
  });

  it("ID 碰撞时不应覆盖已有项目", () => {
    const p1 = createProject({ title: "p1", description: "", mode: "自由模式" });
    // 模拟同一毫秒创建
    const p2 = createProject({ title: "p2", description: "", mode: "自由模式" });
    const projects = getProjects();
    expect(projects.find((p) => p.id === p1.id)).toBeDefined();
    expect(projects.find((p) => p.id === p2.id)).toBeDefined();
  });

  it("损坏的 localStorage 数据不应导致崩溃", () => {
    localStorage.setItem("bollo-custom-projects", "{ invalid json");
    expect(() => getProjects()).not.toThrow();
  });

  it("SSR 环境下不应访问 window", () => {
    // project-store.ts 已有 typeof window === "undefined" 检查
    // 测试确认 SSR 安全
    const originalWindow = global.window;
    // @ts-expect-error — 模拟无 window
    delete global.window;
    expect(() => getProjects()).not.toThrow();
    global.window = originalWindow;
  });
});
```

#### 5.4 集成测试（关键交互）

为核心链路写端到端测试：

```typescript
describe("项目创建链路", () => {
  it("创建项目 → 列表显示 → 详情可访问", () => {
    // 1. 创建项目
    const project = createProject({
      title: "集成测试项目",
      description: "",
      mode: "自由模式",
      plannedEpisodes: 5,
    });

    // 2. 列表应包含
    const projects = getProjects();
    expect(projects.some((p) => p.id === project.id)).toBe(true);

    // 3. 详情应可查到
    const detail = getProject(project.id);
    expect(detail).toBeDefined();
    expect(detail?.title).toBe("集成测试项目");
    expect(detail?.episodes).toBe(5);
  });
});
```

#### 5.5 重建验证（Karpathy 原则 — 构建即理解）

```markdown
## 重建验证：[模块名]

核心逻辑能否用 <200 行从零重建？

- [ ] 列出核心逻辑的行数（不含 UI 渲染）
- [ ] 如果 >200 行，说明过度复杂了——简化
- [ ] 能否向别人解释清楚每一步？（如果不能，说明你还不理解它）

核心逻辑清单：
1. 数据读取：getProject(id) — ~10 行
2. 数据写入：createProject(input) — ~30 行
3. 状态同步：useSyncExternalStore 订阅 — ~20 行
4. AI 模拟：setTimeout 链 — ~20 行
合计：~80 行 ✅
```

#### 5.6 运行测试

```bash
npm run test
```

---

### Phase 6 — UI 走查

**目标**：对照设计参考截图，逐像素验证。

#### 6.1 截图对比

```bash
# 桌面 1440px
agent-browser set viewport 1440 900
agent-browser open http://localhost:3000/comic/[当前模块对应的项目ID]
agent-browser screenshot /Users/rikre/vi/docs/loop-prompts/screenshots/round2-[模块名]-desktop.png --full

# 与参考截图对比
# 参考：docs/design-references/modules/ 下的对应截图
```

#### 6.2 走查清单

```markdown
## UI 走查清单：[模块名]

### 布局
- [ ] 整体布局与参考截图一致
- [ ] 间距体系符合 DESIGN_SYSTEM.md（4px grid）
- [ ] 圆角使用正确（卡片 xl，模态 2xl，按钮 pill）

### 颜色
- [ ] 品牌色使用 `bg-brand` / `text-brand`，无原生色板
- [ ] 语义状态色正确（success/warning/danger/info）
- [ ] 文字对比度通过 WCAG AA（用浏览器 DevTools 确认）

### 交互
- [ ] hover 态有反馈（translateY / opacity / color change）
- [ ] active 态有反馈（scale(0.98)）
- [ ] focus-visible 有 ring（:focus-visible 样式）
- [ ] 空状态有提示文案 + 插图
- [ ] loading 状态有骨架/spinner

### 响应式
- [ ] 1440px 下布局正确
- [ ] 375px 下无横向溢出
- [ ] 侧边栏在 375px 下为 64px

### 无障碍
- [ ] 所有按钮有 aria-label
- [ ] 所有图标有 aria-hidden（装饰性）
- [ ] 模态有 role="dialog" + aria-modal
- [ ] Tab 键可遍历交互元素
```

#### 6.3 交互验证

```bash
# 使用 agent-browser 验证关键交互
agent-browser open http://localhost:3000/comic/2
agent-browser snapshot -i
# 点击各 Tab，确认内容切换正确
# 测试搜索，确认过滤生效
# 测试空状态，确认提示出现
```

---

### Phase 7 — 架构记录

**目标**：更新文档，记录技术决策，为下一轮 Loop 留下上下文。

#### 7.1 更新 AGENTS.md

在 AGENTS.md 中追加模块状态：

```markdown
## 模块状态追踪

| 模块 | 状态 | Round | 备注 |
|------|------|-------|------|
| 项目创建+列表 | ✅ 生产就绪 | R1 | localStorage 持久化，useSyncExternalStore |
| 项目工作台-概览 | ✅ 功能完整 | R2.1 | 动态、成员统计、剧集进度 |
| 剧本编辑器 | ✅ 功能完整 | R2.2 | 章节解析、提取资产模拟 |
| 资产管理 | ✅ 功能完整 | R2.3 | CRUD、音色绑定、批量生成模拟 |
| 分镜工作台 | ✅ 功能完整 | R2.4 | 镜头 CRUD、批量生视频模拟 |
| 成片组装 | ✅ 功能完整 | R2.5 | 播放器、时间轴、导出模拟 |
| AI重绘向导 | ✅ 功能完整 | R2.6 | 四步 Stepper 完整 |
| 广场/技能/资产库 | ✅ 功能完整 | R2.7 | 搜索/筛选/详情完整 |
| 发布中心 | ✅ 功能完整 | R2.8 | 平台绑定模拟 |
```

#### 7.2 技术决策记录

```markdown
## 技术决策记录

### TD-[编号]: [决策标题]
- 决策：[一句话]
- 理由：[为什么这样选]
- 确定性：✅ 已验证 / ⚠️ 推断可用
- 验证方式：[如何验证的]
```

---

## Karpathy 检查清单（每 Phase 结束时逐项确认）

### 数据流追踪（先看数据再动代码）

- [ ] P1 已画清数据全链路：来源 → 存储 → 读写 → 生命周期
- [ ] P1 已对照 vibe-video 的数据模式
- [ ] 不基于假设动手——先确认数据真相

### 人工检查点（Iron Man 套装 > 机器人）

- [ ] P3→P4 之间已人工确认架构方向
- [ ] 跨文件重构的凹陷点已人工 review
- [ ] AI 的系统性弱点（类型推导、状态同步、CSS 对齐）已人工验证

### 尾部测试（March of Nines）

- [ ] P5 已测试空数据场景
- [ ] P5 已测试 localStorage 满/损坏场景
- [ ] P5 已测试 SSR/CSR 一致性
- [ ] P5 已测试 ID 碰撞
- [ ] 验收标准不是"happy path 走通"，是"最难的 5% 场景也通过"

### 复杂度预算（Don't be a hero）

- [ ] 单文件 < 300 行
- [ ] 单组件 < 8 个 useState
- [ ] 嵌套深度 < 5 层 JSX
- [ ] props 数量 < 8 个
- [ ] 只有 3+ 处复用才抽 Hook
- [ ] AI 模拟用最简 setTimeout 链，不引入状态机库

### 重建验证（构建即理解）

- [ ] 核心逻辑 < 200 行
- [ ] 能向别人解释清楚每一步
- [ ] 如果不能从零重建，说明过度复杂了——简化

### 数据飞轮（Data flywheel 优先）

- [ ] 数据层接口为 getData/mutate 模式，未来可无痛迁移到 API
- [ ] 积累的数据格式与 API 预期 schema 兼容
- [ ] AI 模拟的输入输出格式与真实 API 一致

### 确定性标记（imo 标记）

- [ ] 桩点替换记录每项标注验证方式
- [ ] 技术决策每条标注 ✅ 已验证 / ⚠️ 推断可用
- [ ] 模块状态追踪表准确反映真实状态

---

## 完成标准

| 检查项 | 命令 | 预期结果 |
|--------|------|---------|
| TypeScript | `npm run typecheck` | 零错误 |
| ESLint | `npm run lint` | 零新 warning |
| 构建 | `npm run build` | 成功 |
| 单元测试 | `npm run test` | 全部通过 |
| 尾部测试 | `npm run test` | 全部通过 |
| 文件复杂度 | 无文件 > 300 行 | ✅ |
| 孤儿组件 | 无未引用的组件文件 | ✅ |
| 色板规范 | `rg "text-(red\|emerald\|amber)-[0-9]" src/ --include="*.tsx"` | 零结果 |
| UI 走查 | agent-browser 截图对比 | 与参考视觉一致 |
| 交互验证 | agent-browser 手动操作 | 核心链路走通 |
| 重建验证 | 核心逻辑 < 200 行 | ✅ |
