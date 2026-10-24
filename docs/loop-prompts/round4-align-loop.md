# Round 4 — UI/功能对齐 Loop（提示词版）

> **用法**：把「主提示词」整段粘贴给新会话的 Agent，它会自动循环执行直到对齐完成。
> **参考站**：https://bollo.video（线上为准）｜**本地项目**：/Users/rikre/Documents/trae_projects/vi
> **状态追踪**：`docs/research/SITE_MAP.md`（页面登记表，Loop 的进度账本）
> **对照截图**：`docs/design-references/bollo-audit/`

---

## 主提示词（Master Loop Prompt，整段复制使用）

```text
你是本项目的 UI/功能对齐 Agent。目标：把本地项目（Next.js 16 + Tailwind v4 + shadcn/ui）
与线上参考站 https://bollo.video 逐页对齐——UI 像素级一致、功能行为一致。

先读三份文件再动手：
1. docs/research/SITE_MAP.md        —— 页面清单与状态（❌缺失/⚠️需改版/✅完成）
2. docs/loop-prompts/round3-page-clone-loop.md —— 框架与 Agent 任务书
3. AGENTS.md + DESIGN.md            —— 项目硬约束与设计 token 唯一来源

## Loop 规则（每轮执行一轮，直到终止条件）

每一轮按以下 6 步执行，不许跳步：

STEP 1 选任务
  从 SITE_MAP.md「克隆优先级队列」取最上面的非 ✅ 项。该项已有人在做（git 分支存在）则跳到下一项。

STEP 2 提取
  用浏览器自动化打开线上对应页面（需登录的页面参考 docs/design-references/bollo-audit/ 截图）。
  - 产出区块清单 docs/research/components/<page>-blocks.md（B01…Bn，含交互模型与状态数）
  - 产出 spec：每区块的 getComputedStyle 精确值、多状态前后样式、真实文本、图片 URL
  - 判定交互模型：先慢滚动观察，再点击/悬停测试。scroll 驱动严禁建成 click 驱动。
  - 新图片下载到 public/images/<page>/，新 SVG 图标补进 src/components/icons.tsx

STEP 3 实现
  - 页面文件放 src/app/<route>/page.tsx，区块组件放 src/components/<page>/
  - 样式只用 DESIGN.md 语义 token（text-brand / bg-muted…），禁止硬编码色值与 Tailwind 默认色板
  - 图标只从 @/components/icons 导入，禁止 lucide-react 直导
  - 所有页面套 app-shell（sidebar + topbar），页面内不出现导航复制品
  - 所有交互元素必须有真实 onClick 行为，禁止死按钮；外链用原生 <a>
  - "use client" 只加给需要交互的组件；弹窗带 role="dialog" + aria-modal
  - 数据用 mock（本地 types 定义），字段结构对齐线上展示所需

STEP 4 测试门槛（不过不许进入下一轮）
  a. npx tsc --noEmit 通过
  b. npm run check 通过（lint + typecheck + build）
  c. 功能走查：本页每个 tab 点一遍、每个按钮点一遍、hover 一遍、空状态渲染一遍
  d. 视觉核对：与 docs/design-references/bollo-audit/<x>.png 逐区块比对（1440px 与 390px），
     每处差异归类：spec错→回STEP2重提 / 实现错→修 / 可接受偏差→记录
  e. 交互模型核对：逐区块确认与线上行为一致（触发机制、transition 时长）

STEP 5 记账
  - SITE_MAP.md：该项状态改 ✅，附 commit 链接与完成日期
  - docs/qa-screenshots/<page>/ 存本地截图（before/after 命名）
  - 简短轮次记录追加到本文件末尾「Loop 日志」：做了什么 / 测试结果 / 遗留问题

STEP 6 下一轮
  回到 STEP 1。若剩余任务全部为 L 规模且互不依赖，可拆 worktree 并行派发 Builder。

## 硬约束
- 遵守 .trae/rules/resource-budget.md：只用 npm run dev 调试、验证完立即停服务、不同时跑构建+测试+dev
- 不修改路由文件结构除非任务就是新建路由；不删线上已下线页面（/plaza 等），只标注待决策
- script/market 线上是跨域 iframe：本地原生重建 tab+筛选+列表+悬浮按钮
- 每轮只做一个页面，做完整（含测试）再进下一个

## 终止条件
SITE_MAP.md 优先级队列全部 ✅，且最后一轮 npm run check + 全页功能走查通过。
输出最终报告：完成页数 / 遗留偏差清单 / 未做产品决策项（如 /plaza 去留）。
```

---

## 单步提示词（想手动控制节奏时用）

**只做一轮提取**（在上文 STEP 2 停住）：

```text
执行 Round 4 对齐 Loop 的 STEP 2（提取），目标页面：<URL 或路由名>。
产出区块清单 + spec 文件后停下，等我确认再继续 STEP 3。
```

**只做修复**：

```text
QA 发现以下差异，按 Round 4 Loop 的规则修复并重跑测试门槛：
<粘贴差异清单>
```

**只做盘点刷新**（线上改版后重新审计）：

```text
执行 Auditor 任务书（round3-page-clone-loop.md 任务 A），刷新 SITE_MAP.md 的 diff，
新增/改版/无变化三列报给我，不动代码。
```

---

## Loop 状态机

```
选任务 → 提取 → 实现 → 测试门槛 ─┬─ 通过 → 记账 → 下一任务
                                └─ 失败 → 修复（同任务重试，最多 2 次）
                                    └─ 仍失败 → 标记 🚧 写明阻塞原因，跳下一任务
```

- 同一任务重试 2 次不过 → 挂起标记 🚧，人介入；避免死循环
- 每轮必须留下可回滚的 commit（一任务一 commit）

## Loop 日志（每轮追加，勿删）

| 轮次 | 任务 | 结果 | 测试 | 遗留 |
|------|------|------|------|------|
| R4-01（2026-10-25） | 共享侧栏 B02 主导航 | 🚧 六项菜单、href、当前态、默认/hover、标签与图标尺寸已对齐；留存 1440px/390px after 截图 | 侧栏 Vitest 5/5、`npx tsc --noEmit`、改动文件 ESLint 通过；全量 lint 有 23 errors / 66 warnings（既有非本任务文件）；dev 未停止，`npm run check` 未执行 | `/tools`、`/script/market` 待后续新建；project/skill/library 未登录会跳转；即时 before 截图缺失；保留本地 64/108px 外壳而非线上移动抽屉 |
