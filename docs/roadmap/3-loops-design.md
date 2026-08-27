# 菠萝 × VibeSpark 融合 - 3 Loops 设计文档

> 基于功能比对，将 VibeSpark 缺失功能融合到菠萝当前系统
> 原则：复用首页 `HeroSection` 设计语言、品牌色 `#D4FF3F`、卡片 `rounded-xl ring-1 ring-white/[0.06]`
> 仅功能开发测试的 loop，按 A → B → C 顺序实施

---

## 差异概览

| 模块 | VibeSpark | 菠萝当前 | 差异 |
|---|---|---|---|
| 首页任务启动器 | 4 任务模式 | 已有 4 子模块 + 拉片入口 | ✅ 已覆盖 |
| 广场 | 4 数据分区 + AI 助手 | 剧本市场单分区 | ⚠️ 缺 3 分区 + AI 助手 |
| 项目中心 | 5 类项目 + 状态机 | `/comic` + `/project` 双入口 | ⚠️ 路由重叠 |
| 引用机制 | 跨模块数据流动 | 无 | ❌ 完全缺失 |
| 长任务状态机 | 后台任务 + 进度 + 重试 | 无 | ❌ 完全缺失 |
| 多智能体可视化 | Agent 状态 | 无 | ❌ 完全缺失 |
| 评估→改稿闭环 | 自动衔接 + 版本对比 | 仅独立 tab | ⚠️ 缺闭环 |
| 计费透明化 | 执行前预估 + 失败不扣费 | 散落 | ⚠️ 需统一 |

---

## Loop A：广场 4 分区 + AI 助手

### 目标
把 `/plaza` 从单分区（剧本市场）扩展为 4 数据分区 + 右侧 AI 助手抽屉，建立发现→引用的入口。

### 路由设计
- `/plaza` → 默认重定向到 `/plaza?tab=scripts`
- `/plaza?tab=scripts` 题材剧本库（保留现有剧本市场）
- `/plaza?tab=ranking` 短剧爆款榜
- `/plaza?tab=novel` 网文风向标
- `/plaza?tab=trending` 热点信号

### Tab 改造
当前 `PLAZA_TABS`：剧本市场 / 项目接单 / 编剧推荐
改为：题材剧本库 / 短剧爆款榜 / 网文风向标 / 热点信号
（项目接单、编剧推荐移到 `/plaza?tab=orders`、`/plaza?tab=writers` 作为辅助 tab，不在主导航）

### 数据模型新增

```typescript
// src/types/plaza.ts
export interface HotWork {
  id: string;
  rank: number;
  title: string;
  episodes: number;
  synopsis: string;
  tags: string[];
  source: "红果" | "番茄" | "抖音" | "其他";
  sourceUrl: string;
 上新Time: string;
  background: "现代" | "都市" | "古代" | "乡村" | "年代" | "架空" | "职场" | "校园";
  theme: string[];
  setting: string[];
  audience: "男频" | "女频";
}

export interface NovelTrend {
  id: string;
  rank: number;
  title: string;
  author: string;
  type: string;
  words: string;
  synopsis: string;
  source: "起点" | "番茄" | "其他";
  sourceUrl: string;
  adaptationPotential: number; // 0-100
  suitableMode: "实拍" | "AIGC" | "不限";
  recommendedEpisodes: number;
}

export interface TrendSignal {
  id: string;
  title: string;
  source: "微博" | "知乎" | "其他";
  sourceUrl?: string;
  heatScore: number;
  growthRate: number;
  emotions: string[];
  narrativeThemes: string[];
  adaptationAdvice: string;
  riskLevel: "low" | "medium" | "high";
  riskNote?: string;
  capturedAt: string;
}
```

### AI 助手抽屉（AgentDock）

新增组件 `src/components/layout/agent-dock.tsx`：
- 位置：AppShell 右侧，可折叠（默认收起，宽度 0；展开时宽度 420px）
- 触发：所有页面右上角悬浮按钮（TopBar 增加按钮）
- 内容：
  - 顶部：当前上下文（如「广场·热点信号」）
  - 中部：对话流（消息列表 + 证据等级徽章）
  - 底部：输入框 + 快捷动作（添加为引用 / 生成对标分析 / 提取故事结构）

```typescript
// src/components/layout/agent-dock.tsx
"use client";
export function AgentDock({ open, onClose, context }: {
  open: boolean;
  onClose: () => void;
  context: { page: string; tab?: string; selectedId?: string };
}) {
  // 消息流 mock
  // 输入框
  // 证据等级徽章组件 EvidenceBadge
}
```

### EvidenceBadge 组件
```typescript
const EVIDENCE_META = {
  real_data: { label: "真实数据", color: "bg-brand/15 text-brand" },
  internal_asset: { label: "站内资产", color: "bg-blue-500/15 text-blue-400" },
  model_analysis: { label: "模型分析", color: "bg-purple-500/15 text-purple-400" },
  market_estimate: { label: "市场估算", color: "bg-amber-500/15 text-amber-400" },
  missing: { label: "信息缺失", color: "bg-red-500/15 text-red-400" },
};
```

### 卡片设计
所有 4 分区卡片统一样式（继承 `HeroSection` 风格）：
- 卡片：`rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] hover:ring-white/20 hover:-translate-y-0.5`
- 标签：`rounded-md bg-brand/15 text-brand` 或 `bg-white/[0.05] text-white/60`
- 数字：`text-brand tabular-nums`
- 排名：前三名 `text-brand`，其余 `text-white/60`

### 引用按钮
所有卡片增加右上角「+ 引用」按钮（小图标），点击后：
1. 加入临时引用列表（localStorage）
2. 在 `/project/new` 创建项目时可见
3. 在 `/project/[id]` 引用 tab 可见

### 验收标准
- [ ] 4 分区 tab 切换正常，URL 同步
- [ ] 每个分区至少 4 条 mock 数据
- [ ] AI 助手抽屉可打开/关闭，对话流可滚动
- [ ] EvidenceBadge 5 种颜色正确显示
- [ ] 引用按钮可点击，加入引用列表
- [ ] `npx tsc --noEmit` 零错误
- [ ] curl 5 路由（4 tab + 默认）HTTP 200
- [ ] agent-browser DOM 验证可交互元素

---

## Loop B：统一项目中心 + 引用机制

### 目标
合并 `/comic` → `/project`，建立跨模块引用机制，让数据流动闭环。

### 路由整合
- `/comic` → 301 重定向到 `/project`
- 删除 `src/app/comic/page.tsx`
- 更新 `sidebar.tsx` 的 `/comic` 链接为 `/project`

### 项目中心改造 `/project`

当前 `/project/page.tsx` 增加内容：
- 顶部统计栏：5 类项目数 + 进行中数 + 已完成数
- 类型筛选：全部 / 创作 / 网文改编 / 剧本改写 / 剧本评估 / 拉片
- 状态筛选：全部 / 规划中 / 进行中 / 已完成 / 失败
- 搜索框：按标题/标签
- 项目卡片：类型徽章 + 状态徽章 + 标题 + 简介 + 时间 + 重命名/归档/删除菜单

### Reference 数据流

```typescript
// src/lib/reference-store.ts
"use client";
const STORAGE_KEY = "bollo:references";

export interface StoredReference extends Reference {
  addedAt: string;
  fromPage: string;
}

export function getReferences(): StoredReference[] { /* localStorage 读取 */ }
export function addReference(ref: StoredReference): void { /* 去重添加 */ }
export function removeReference(id: string): void { /* 删除 */ }
export function clearReferences(): void { /* 清空 */ }
```

### 项目工作台「引用」tab

`ProjectTab` 增加 `references`：
```typescript
export type ProjectTab =
  | "overview" | "script" | "evaluation" | "rewrite"
  | "assets" | "breakdown" | "references";  // 新增
```

ReferencesTab 内容：
- 顶部：引用列表（卡片形式，显示来源、证据等级、添加时间）
- 操作：移除、查看原文、生成对标分析
- 底部：清空引用 / 导出为 Markdown

### 广场卡片引用联动

Loop A 的「+ 引用」按钮调用 `addReference()`，引用列表实时更新。
在 `/project/new` 创建项目时，引用列表自动带入项目 `config.references`。

### 验收标准
- [ ] `/comic` 访问自动跳转 `/project`
- [ ] 项目卡片支持 5 类型 + 5 状态筛选
- [ ] 搜索框实时过滤
- [ ] 引用 tab 显示从广场加入的引用
- [ ] 引用可移除、清空
- [ ] 创建项目时引用自动带入
- [ ] `npx tsc --noEmit` 零错误
- [ ] curl 6 路由 HTTP 200
- [ ] agent-browser 验证筛选交互

---

## Loop C：长任务 + 多智能体可视化

### 目标
让评估/改写/拉片的长任务有明确的状态机、进度展示、Agent 可视化，并打通评估→改稿闭环。

### ProjectStatus 状态机可视化

在 ProjectWorkspace 新增「Agent 状态」面板：
- 当前状态（draft → planning → processing → in_progress → completed/failed）
- 进度条（已完成步骤 / 总步骤）
- 预计剩余时间
- 积分消耗（已扣 / 预计）
- 失败时显示原因 + 重试按钮

```typescript
// src/components/project/agent-status-panel.tsx
export function AgentStatusPanel({ project }: { project: Project }) {
  // 状态时间线
  // 进度条
  // 当前 Agent 名称（如「评估 Agent · 维度分析中」）
  // 步骤列表（已完成✓ / 进行中 spinner / 待处理）
}
```

### 评估 → 改稿闭环

EvaluationTab 增加「驱动改稿」按钮：
1. 用户勾选要采纳的 issues
2. 点击「驱动改稿」
3. 弹出确认框（显示预计消耗 30 积分）
4. 确认后跳转 `/project/[id]?tab=rewrite&from=evaluation&issues=xxx`
5. RewriteTab 自动加载评估 issues 作为改写目标

### 版本对比 + 回滚

RewriteTab 增强：
- 版本树每个版本支持「对比」按钮
- 选中两个版本后展示 diff（左右分栏）
- 每个 diff 卡片支持「回滚到此版本」按钮
- 回滚需二次确认

### 拉片任务增强

BreakdownTab 增强：
- 顶部增加任务状态卡（如果是 processing 状态）
- 失败任务显示原因 + 重试按钮
- 单集 vs 全剧切换器
- 计费明细：每 15 秒 5 积分 / 固定 2000 积分

### 多智能体可视化（轻量版）

在 AgentStatusPanel 显示当前活跃的 Agent：
- 评估 Agent（剧本评估时）
- 改写 Agent（剧本改写时）
- 拉片 Agent（视频分析时）
- 引用 Agent（添加引用时）

每个 Agent 显示：名称 + 当前任务 + 进度 + 状态徽章

### 验收标准
- [ ] AgentStatusPanel 在 3 种项目类型中正确显示
- [ ] 评估「驱动改稿」跳转 RewriteTab 并加载 issues
- [ ] 版本对比模式可选择两个版本 diff
- [ ] 回滚操作有二次确认
- [ ] 拉片失败任务可重试
- [ ] `npx tsc --noEmit` 零错误
- [ ] curl 3 项目路由 HTTP 200
- [ ] agent-browser 验证状态机交互

---

## 实施顺序

1. **Loop A**（广场 + AI 助手）：~8 个文件改动
   - `src/types/plaza.ts`（新建）
   - `src/lib/plaza-data.ts`（扩展 3 分区数据）
   - `src/app/plaza/page.tsx`（4 tab 改造）
   - `src/components/layout/agent-dock.tsx`（新建）
   - `src/components/layout/app-shell.tsx`（接入 AgentDock）
   - `src/components/layout/top-bar.tsx`（增加 AgentDock 触发按钮）
   - `src/components/ui/evidence-badge.tsx`（新建）
   - `src/lib/reference-store.ts`（新建，Loop B 也会用）

2. **Loop B**（项目中心 + 引用）：~6 个文件改动
   - `src/app/comic/page.tsx`（删除，改 redirect）
   - `src/app/project/page.tsx`（增强筛选）
   - `src/components/layout/sidebar.tsx`（更新链接）
   - `src/types/project.ts`（ProjectTab 加 references）
   - `src/app/project/[id]/page.tsx`（新增 ReferencesTab）
   - `src/app/project/new/page.tsx`（引用带入）

3. **Loop C**（长任务 + 多智能体）：~5 个文件改动
   - `src/components/project/agent-status-panel.tsx`（新建）
   - `src/app/project/[id]/page.tsx`（接入 AgentStatusPanel + 评估驱动改稿 + 版本对比）
   - `src/lib/project-store.ts`（加 Agent 步骤 mock）
   - `src/types/project.ts`（加 AgentStep 类型）

## 验收闭环效率参考

每个 Loop 的验收流程统一为：
1. `npx tsc --noEmit` 零错误
2. 启动 dev server
3. curl 路由验证 HTTP 200
4. agent-browser DOM 验证可交互元素
5. 关键字 grep 验证渲染
6. 停止 dev server 释放内存

预计每 Loop 闭环时间：A ~30min, B ~25min, C ~30min
