# Loop Round 3 — 页面克隆框架（不漏页 · 不缺元素 · 一致性）

> **目标**：把 bollo.video 线上站完整复刻到本地，三条硬保障：
> **页面不漏**（SITEMAP 清单制）、**元素不缺**（区块清单制）、**一致性**（四统一 + QA diff）。
> **前置条件**：Round 1 设计 Token 层已完成；`docs/research/SITE_MAP.md` 为页面清单唯一来源。

---

## 一、三层保障体系（框架核心）

### 层 1 — 页面不漏：SITEMAP 清单制

- `docs/research/SITE_MAP.md` 是所有页面的**唯一登记表**。任何页面动工前必须先在表中登记（路由、状态、优先级），完工后回写状态。
- 盘点方法（Auditor Agent 执行）：
  1. 打开线上站登录态，枚举侧栏全部菜单项（文字 + href + 图标）
  2. 依次点击每个菜单项 + 头像下拉菜单，记录所有可达路由
  3. 对每个路由截图存 `docs/design-references/bollo-audit/<路由末段>.png`
  4. 与 SITEMAP 现表 diff，输出三列结果：**新增 / 改版 / 无变化**
- 验收：`SITEMAP 表中每个"❌/⚠️"项都有对应的克隆任务或明确的产品决策（如保留 /plaza）`，不允许出现"线上有、表里无"的路由。

### 层 2 — 元素不缺：区块清单制（Block Inventory）

每个页面在提取阶段产出**区块清单**，写入 `docs/research/components/<page>-blocks.md`：

```markdown
# <页面> 区块清单（从上到下）
| # | 区块名 | DOM 锚点 | 交互模型 | 状态数 | 资产 | 截图 |
|---|--------|---------|---------|--------|------|------|
| B01 | 活动轮播 | header .banner | time+click | 2(展开/收起) | 2图 | home-b01.png |
| B02 | Hero 创建器 | main .hero | click | 4(模式×2) | 0 | home-b02.png |
...
```

- **交互模型**必须先判定：`static / click / scroll / time`（先滚动观察再点击测试，防止把滚动驱动错建成点击驱动——这是最贵的返工）
- **状态数** = 该区块所有可视状态的个数（tab 数、hover、滚动前后），每个状态都要提取一份样式与内容
- 验收：`实现的区块数 == 清单区块数`，且每区块内元素（按钮/输入/图标/文本）逐项勾选。QA 阶段拿清单反向核对。

### 层 3 — 一致性：四统一 + 截图 diff

| 统一项 | 规则 | 检查方式 |
|--------|------|---------|
| Token 统一 | 颜色/圆角/间距只允许来自 DESIGN.md 语义 token，禁止硬编码色值 | `npx @google/design.md lint DESIGN.md` + 代码 review 禁 `#[0-9a-f]{3,8}`（globals.css 除外） |
| 布局统一 | 所有页面套 `app-shell`（sidebar + topbar），页面只写 main 区内容 | 页面文件不得出现 `<nav>`/侧栏复制品 |
| 图标统一 | 全部走 `@/components/icons`，禁止 lucide-react 直导、禁止内联重复 SVG | `rg "lucide-react" src/` 为空 |
| 组件统一 | 卡片/标签/筛选器等复用 `ui/` 原语与既有组件，同形状不允许两种实现 | QA Agent diff 时检查重复造轮子 |

QA diff：本地 `npm run build && npm run start`（验证后立即停止，遵守 resource-budget），1440px 与 390px 双宽度，与 `bollo-audit/` 截图逐区块并排比对。

---

## 二、Page Clone Loop（每页跑一次）

```
Phase 0 盘点   Auditor：更新 SITEMAP，登记任务，拉差距
Phase 1 提取   Extractor：截图 → 区块清单 → 每区块 getComputedStyle + 状态 + 资产 + 文本
Phase 2 Spec   写 <page>.spec.md + 复杂区块拆子 spec（>150 行必须拆）
Phase 3 派发   Builder：一区块一任务（或简单页一页一任务），worktree 并行
Phase 4 装配   页面文件组装区块组件 + 接路由 + 接 mock 数据
Phase 5 QA     截图 diff + 三层 checklist + `npm run check`
```

铁律（继承 clone-website skill 教训）：
- Spec 是 Builder 的唯一输入，**内联进 prompt**，不让 Builder 自己去翻文档
- Builder 完工前必须 `npx tsc --noEmit` 通过
- 提取的是**真实内容**（线上文本/图片下载到 public/），不是占位符
- 每个状态都要提取：tab 逐个点、滚动前后各采一次样式、hover 前后各采一次

---

## 三、Agent 任务书（可直接派发）

### 任务 A — Auditor（盘点）

```text
你是站点盘点员。用浏览器自动化访问 https://bollo.video/zh/home（已登录态）。
1. 枚举左侧栏全部菜单项（文字+href+图标）与头像下拉全部入口
2. 依次点击每个菜单，记录跳转 URL、页面标题、顶层区块（从上到下）
3. 每页整页截图存 docs/design-references/bollo-audit/<路由末段>.png
4. 有 tab 的页面逐个点击 tab，记录 tab 名与内容形态
输出：与 docs/research/SITE_MAP.md 的 diff 报告——新增/改版/无变化三列，
改版项列出缺失区块名。只调研，不写代码。
```

### 任务 B — Extractor（提取）

```text
你是页面提取员。目标页：<URL>（审计截图：docs/design-references/bollo-audit/<x>.png）。
对每个区块：
1. 截图该区块 → docs/design-references/bollo-audit/<page>-b<NN>.png
2. getComputedStyle 提取容器及子元素全部样式（用标准提取脚本，深度≤4）
3. 判定交互模型：先慢滚动观察是否自动变化，再点击/悬停测试
4. 多状态组件：逐状态采集（tab 每项、滚动前后、hover 前后），记录
   "属性X: 值A→值B，触发=<机制>，transition=<值>"
5. 提取全部真实文本、图片 URL、内联 SVG
6. 图片下载脚本存 public/images/<page>/，SVG 去重后登记到 icons 清单
输出：docs/research/components/<page>-blocks.md（区块清单表）
      + <page>.spec.md（每区块一节：DOM/样式/状态/资产/文本/响应式）
复杂区块（子组件≥3）拆独立 spec 文件。不写业务代码。
```

### 任务 C — Builder（构建，每区块/每页一个实例）

```text
你是组件构建者。在 worktree 分支 build/<page>-<block> 上工作。
目标文件：src/components/<page>/<BlockName>.tsx
规格（唯一输入，逐条实现）：<此处内联该区块 spec 全文>
约束：
- 样式只用 DESIGN.md 语义 token（text-brand/bg-muted/…），禁止硬编码色值
- 图标从 @/components/icons 导入；缺的先补到 icons.tsx 再用
- 复用 ui/ 原语与既有组件；文本/图片用 spec 中的真实内容（public/images/<page>/）
- 交互模型按 spec 实现：<click|scroll|time>，触发阈值与 transition 用提取值
- 响应式：1440 / 768 / 390，断点与变化按 spec
- 完工自检：npx tsc --noEmit 必须通过；对照截图自查一遍
不新增依赖，不改全局文件（globals.css/layout.tsx 需要改时在报告中说明）。
```

### 任务 D — QA（验收）

```text
你是 QA 审查员。本地已 build 并 start（验证完立刻停掉）。
对照物：docs/design-references/bollo-audit/<x>.png（1440 与 390 两种宽度）
被测页：/<route>
1. 逐区块并排截图 diff（B01…Bn 顺序对照区块清单）
2. 每个差异分类：spec 错（回提取）/ builder 错（回构建）/ 可接受偏差（记录）
3. 交互走查：滚动、逐 tab 点击、hover、空状态——与线上行为逐条核对
4. 一致性检查：无硬编码色值、无 lucide 直导、无页面内私造侧栏、无死按钮
5. 三层验收：SITEMAP 状态已回写 ✅；区块数 == 清单数；四统一全部通过
输出：差异清单（位置/期望/实际/分类/修复建议）+ 通过/不通过结论。
```

---

## 四、执行队列（当前差距 → 派发顺序）

按 `SITE_MAP.md` 第三节优先级：侧栏改版(S) → `/tools`(L) → `/script/market`(M) → `/skills` 改版(L) → `/home` 改版(L) → `/library` 改版(M) → `/project`(S)。

规模 L 的页面拆 3–5 个 Builder 并行（按区块清单分组），M 拆 2 个，S 单个。每完成一页：merge → `npm run check` → SITEMAP 回写状态 → 下一页。

## 五、特殊情况决策

- **script/market 是跨域 iframe**：本地原生重建（tab + 筛选 + 列表 + 悬浮按钮），不做 iframe 嵌套
- **外链（飞书文档）**：原生 `<a>` 新窗口打开，不克隆
- **登录墙页面**：以审计截图（登录态）为提取基线；本地按现有 auth-provider 逻辑走
- **线上已下线但本地存在的页面（/plaza、发布）**：等产品决策，SITEMAP 中标注，不擅自删除
