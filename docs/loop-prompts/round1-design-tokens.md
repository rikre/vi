# Loop Round 1 — 设计 Token 层硬化（架构分层驱动）

> **模式**：方案 B（架构分层驱动），覆盖所有模块的单一架构层
> **目标**：消除全站硬编码色板、统一宽度规范、建立移动端地基、植入防护规则
> **验收方式**：`npm run check` 通过 + agent-browser 逐路由截图回归

---

## 前置条件

- [ ] `npm run dev` 已启动，`http://localhost:3000` 可访问
- [ ] `docs/DESIGN_SYSTEM.md` 已通读（设计令牌权威来源）
- [ ] `docs/design-review/DESIGN_REVIEW_REPORT.md` 已通读（已知问题清单）

## 已修复项（无需重做）

| CRIT 编号 | 问题 | 状态 |
|-----------|------|------|
| CRIT-1 | `--brand-foreground` 未定义 | 已修复（globals.css:78, `#11130f`） |
| CRIT-4 | 彩虹 conic-gradient | 已修复（搜索零结果） |
| CRIT-5 | emoji 图标混用 | 已修复（搜索零结果） |
| CRIT-6 | `font-[834]` 字重 | 已修复（搜索零结果） |

## 本轮目标项

| 编号 | 问题 | 影响范围 |
|------|------|---------|
| MED-2 | Tailwind 默认色板泄漏（77 处，15+ 文件） | 全站 |
| MED-5 | 语义状态色未令牌化（无 `--success`/`--warning`/`--danger`/`--info`） | globals.css |
| MED-4 | 三套 max-width 标准（28 个不同值） | 全站 |
| CRIT-3 | 移动端无响应式（侧边栏 108px 固定） | 全站 |
| MED-1 | 图标库混用（lucide-react vs 自定义） | home 子组件 |

---

## Phase 1 — 全局审计（产出差距矩阵）

**目标**：精确扫描所有违规点，产出可追溯的差距矩阵。

### 1.1 色板泄漏扫描

```bash
# 扫描所有使用 Tailwind 默认色板的文件（排除 chart 语义色和 icons.tsx）
rg "bg-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]" src/ --include="*.tsx" -n
rg "text-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]" src/ --include="*.tsx" -n
rg "border-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]" src/ --include="*.tsx" -n
rg "ring-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]" src/ --include="*.tsx" -n
```

### 1.2 max-width 扫描

```bash
rg "max-w-\[" src/ --include="*.tsx" -n
```

### 1.3 图标来源扫描

```bash
rg "from \"lucide-react\"|from 'lucide-react'" src/ --include="*.tsx" -n
```

### 1.4 产出格式

将扫描结果整理为 `docs/loop-prompts/round1-audit.md`，格式：

```markdown
## 差距矩阵：色板泄漏

| 文件 | 行号 | 当前值 | 替换为 | 确定性 |
|------|------|--------|--------|--------|
| src/app/comic/page.tsx | 741 | text-red-400 | text-danger | ✅ 机械替换 |
| src/components/project-detail/remake-studio.tsx | 252 | bg-amber-500/10 | bg-warning/10 | ✅ |
| src/components/project-detail/remake-studio.tsx | 678 | text-cyan-300 | text-info | ⚠️ 需视觉确认 |
| ... | ... | ... | ... | ... |

## 差距矩阵：max-width

| 文件 | 行号 | 当前值 | 替换为 | 理由 |
|------|------|--------|--------|------|
| src/app/comic/[id]/page.tsx | 19 | max-w-[960px] | 保留（详情页标准） | 详情页 |
| src/components/home/hero-section.tsx | 281 | max-w-[880px] | 保留（表单区标准） | 表单区 |
| ... | ... | ... | ... | ... |
```

**Karpathy 原则 — 先看数据再动代码**：不要跳过审计直接开始改。先彻底理解违规的分布、模式、频次，再决定替换策略。70% 的 bug 来源于对现状的错误假设。

---

## Phase 2 — 令牌定义（globals.css 扩展）

**目标**：在 `globals.css` 的 `:root, .dark` 块中定义语义状态色，并在 `@theme inline` 中映射。

### 2.1 新增语义状态色

在 `globals.css` 的 `:root, .dark` 块中，`--destructive` 之后添加：

```css
/* Semantic status colors — 对齐 DESIGN_SYSTEM.md chart palette */
--success: oklch(0.72 0.15 145);          /* 绿 — 成功/已完成/有效 */
--success-foreground: oklch(1 0 0);
--warning: oklch(0.80 0.15 85);           /* 黄/琥珀 — 进行中/待接受/生成中 */
--warning-foreground: oklch(0.20 0 0);
--danger: oklch(0.65 0.22 25);            /* 与 --destructive 一致 — 删除/失败/错误 */
--danger-foreground: oklch(1 0 0);
--info: oklch(0.78 0.10 220);            /* 蓝/青 — 信息/提示 */
--info-foreground: oklch(0.15 0 0);
```

### 2.2 映射到 @theme inline

在 `@theme inline` 块中添加：

```css
--color-success: var(--success);
--color-success-foreground: var(--success-foreground);
--color-warning: var(--warning);
--color-warning-foreground: var(--warning-foreground);
--color-danger: var(--danger);
--color-danger-foreground: var(--danger-foreground);
--color-info: var(--info);
--color-info-foreground: var(--info-foreground);
```

### 2.3 替换映射表

| Tailwind 原生色 | 语义 token | 说明 |
|----------------|-----------|------|
| `text-red-400` / `text-red-300` / `text-red-500` | `text-danger` | 删除按钮、失败状态、错误提示 |
| `bg-red-500` / `bg-red-600` / `bg-red-500/10` | `bg-danger` / `bg-danger/10` | 危险操作按钮、危险背景 |
| `hover:bg-red-500/10` / `hover:bg-red-400/10` | `hover:bg-danger/10` | 危险 hover 态 |
| `text-emerald-400` / `text-green-400` | `text-success` | 成功状态、已完成、有效 |
| `bg-emerald-400/10` / `bg-green-500/20` | `bg-success/10` / `bg-success/20` | 成功背景 |
| `text-amber-300` / `text-amber-400` | `text-warning` | 进行中、待接受、生成中 |
| `bg-amber-400` / `bg-amber-500/10` / `bg-amber-500/20` | `bg-warning` / `bg-warning/10` / `bg-warning/20` | 警告背景 |
| `ring-amber-500/20` / `ring-amber-500/30` | `ring-warning/20` / `ring-warning/30` | 警告环 |
| `text-cyan-300` / `text-cyan-400` | `text-info` | 信息提示 |
| `bg-cyan-500/10` | `bg-info/10` | 信息背景 |
| `text-blue-400` | `text-info` | 蓝色信息 → 统一到 info |
| `bg-blue-400/10` | `bg-info/10` | 蓝色背景 |
| `text-purple-400` / `text-purple-300` | `text-info` | 暂归入 info（后续可扩展为 `--accent-secondary`） |
| `bg-purple-500/10` | `bg-info/10` | 同上 |
| `text-pink-400` / `text-pink-300` | `text-info` | 暂归入 info |
| `bg-pink-500/12` / `bg-pink-500` | `bg-info/10` | 同上 |
| `text-orange-300` | `text-warning` | 奖励类 → 归入 warning |
| `border-red-500/30` | `border-danger/30` | 危险边框 |
| `ring-red-500/30` | `ring-danger/30` | 危险环 |

**Karpathy 原则 — Don't be a hero**：不要一次定义 20 个语义色。先只定义 4 个（success/warning/danger/info），覆盖当前所有用例。如果后续出现新的语义需求（如 `--accent-secondary`），再扩展。过早抽象比代码重复更危险。

### 2.4 色板语义例外

以下颜色**不替换**，保留原样：
- `chart-1` ~ `chart-5`（已在 globals.css 定义为 token）
- `icons.tsx` 中的 SVG fill/stroke（图标定义不涉及语义状态）
- `team-dashboard.tsx` 的 `TONE_MAP`（图表配色，非状态色）

---

## Phase 3 — 全局替换（逐文件机械替换）

**目标**：按差距矩阵逐文件替换色板，每个文件替换后立即 typecheck。

### 3.1 执行顺序（按影响面从大到小）

1. `src/components/project-detail/remake-studio.tsx`（最多违规，~15 处）
2. `src/app/comic/page.tsx`（~5 处）
3. `src/app/team/page.tsx`（~6 处）
4. `src/components/team/team-dashboard.tsx`（~7 处）
5. `src/components/project-detail/film-tab.tsx`（~6 处）
6. `src/components/project-detail/asset-tab.tsx`（~3 处）
7. `src/components/project-detail/storyboard-tab.tsx`（~3 处）
8. `src/components/project-detail/script-tab.tsx`（~3 处）
9. `src/components/project-detail/workbench.tsx`（~2 处）
10. `src/components/project/project-grid.tsx`（~1 处）
11. `src/components/publish-dialog.tsx`（~5 处 text-pink-400 → text-danger）
12. `src/components/asset-detail.tsx`（~2 处）
13. `src/components/message-center.tsx`（~1 处 text-orange-300）

### 3.2 每文件替换后验证

```bash
# 每替换一个文件后运行
npm run typecheck
```

### 3.3 全部替换后验证

```bash
# 确认零残留
rg "bg-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]" src/ --include="*.tsx"
rg "text-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]" src/ --include="*.tsx"
# 应返回空结果（icons.tsx 除外）
```

**Karpathy 原则 — 确定性标记**：每个替换标注：
- ✅ 机械替换（`text-red-400 → text-danger`，语义明确）
- ⚠️ 需视觉确认（`text-purple-400 → text-info`，紫色和蓝色视觉差异较大，需截图对比）

---

## Phase 4 — 宽度规范统一

**目标**：统一页面级 max-width，消除碎片化。

### 4.1 规范定义

| 场景 | 标准 max-width | 说明 |
|------|---------------|------|
| 列表页（comic/skill/asset/plaza/publish/team） | `max-w-[1400px]` | 统一列表页宽度 |
| 首页（home） | `max-w-[1400px]` | 与列表页统一（原 1332px 修改） |
| 详情页-剧本类型（comic/[id] ScriptProjectDetail） | `max-w-[960px]` | 阅读型窄宽度 |
| 详情页-工作台（comic/[id] Workbench） | `max-w-[1400px]` | 工作台宽宽度 |
| 创作页（create） | `max-w-[1400px]` 外层 + `max-w-[1094px]` 输入区 | 保留输入区收窄 |
| 表单区（hero-section 输入/快捷入口） | `max-w-[880px]` | 表单收窄 |
| 模态 | 各自合理值（不统一） | 520px / 720px / 880px 等按内容 |

### 4.2 执行方式

按 `docs/loop-prompts/round1-audit.md` 的 max-width 差距矩阵，逐个将不符合规范的 `max-w-[...]` 替换为标准值。

### 4.3 验证

```bash
# 确认页面级 max-w 只使用标准值
rg "max-w-\[" src/ --include="*.tsx" -n | grep -v "max-w-\[1400px\]\|max-w-\[960px\]\|max-w-\[880px\]\|max-w-\[1094px\]\|max-w-\[92vw\]\|max-w-\[90vw\]\|max-w-\[calc"
# 模态的 vw 值和 calc 值保留
```

---

## Phase 5 — 移动端响应式地基

**目标**：侧边栏在 <768px 下收起，内容区不溢出。

### 5.1 侧边栏 collapse 策略

在 `src/components/layout/sidebar.tsx` 中：

**当前**：固定 `w-[108px]`，所有断点不变。

**目标**：
- `>= 768px`：保持 `w-[108px]`
- `< 768px`：收起为 `w-[64px]`，隐藏文字标签，仅显示图标 + logo

### 5.2 实现要点

```tsx
// sidebar.tsx — nav 元素的 className
// 当前：
className="relative flex h-full w-[108px] shrink-0 flex-col items-stretch overflow-y-auto bg-black"

// 目标：
className="relative flex h-full w-[64px] shrink-0 flex-col items-stretch overflow-y-auto bg-black md:w-[108px]"

// nav item 的 label span：
// 当前：
<span className="text-[14px] leading-none">{item.label}</span>

// 目标：隐藏文字，md 以上显示
<span className="hidden text-[14px] leading-none md:inline">{item.label}</span>

// nav item 的容器：
// 当前：
className="flex h-[54px] w-[84px] shrink-0 ..."

// 目标：md 以上恢复完整尺寸
className="flex h-[54px] w-[64px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[12px] px-2 py-[8px] transition-colors md:w-[84px]"
```

### 5.3 AccountDropdown 定位

```tsx
// 当前定位：
className="absolute bottom-[calc(100%+8px)] left-[calc(100%+8px)]"

// 目标：<768px 时从右侧弹出（因为侧边栏变窄）
// 这个定位在 64px 侧边栏下仍可用，不需要额外调整
```

### 5.4 验证

```bash
# 用 agent-browser 在 375px 宽度下截图
agent-browser set viewport 375 812
agent-browser open http://localhost:3000/home
agent-browser screenshot /Users/rikre/vi/docs/loop-prompts/screenshots/mobile-home-375.png --full
agent-browser open http://localhost:3000/comic
agent-browser screenshot /Users/rikre/vi/docs/loop-prompts/screenshots/mobile-comic-375.png --full
# 确认：侧边栏 64px，内容区 ~311px，无横向溢出
```

**Karpathy 原则 — 尾部测试**：移动端是最难的 5% 场景。不只是看首页——测每个路由在 375px 下的表现。特别关注：
- `/comic` 的项目卡片网格在 375px 下是否变成单列
- `/plaza/script/[id]` 的三栏布局是否溢出
- `/comic/[id]` 工作台的工作区是否可横向滚动
- AccountDropdown 从 64px 侧边栏弹出时是否被截断

---

## Phase 6 — ESLint 防护规则

**目标**：植入自定义 ESLint 规则，防止色板泄漏再次出现。

### 6.1 实现方式

在 `eslint.config.mjs` 中添加自定义规则（或使用 `no-restricted-syntax`）：

```javascript
// eslint.config.mjs
{
  rules: {
    "no-restricted-syntax": [
      "warn",
      {
        // 禁止 className 中使用 Tailwind 默认色板
        selector: "Literal[value=/\\b(text|bg|border|ring)-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]/]",
        message: "禁止使用 Tailwind 默认色板。请使用语义 token：text-danger, text-success, text-warning, text-info, bg-brand 等。"
      }
    ],
    "no-restricted-imports": [
      "warn",
      {
        paths: [{
          name: "lucide-react",
          message: "请使用 @/components/icons 中的自定义图标，保持全站图标体系统一。"
        }]
      }
    ]
  }
}
```

### 6.2 验证

```bash
npm run lint
# 确认无新增色板泄漏 warning（已有的应已全部替换）
```

**Karpathy 原则 — 复杂度守门**：ESLint 规则先只设为 `warn` 而非 `error`。确认规则不会误报（如 chart 配色、icons.tsx 中的 SVG）后再升级为 `error`。先跑通再收紧。

---

## Phase 7 — 视觉回归（agent-browser 逐路由截图）

**目标**：确认 token 替换没有引入视觉差异。

### 7.1 截图清单

| 路由 | 桌面 1440px | 移动 375px |
|------|------------|-----------|
| `/home` | ✅ | ✅ |
| `/create` | ✅ | ✅ |
| `/comic` | ✅ | ✅ |
| `/comic/1` | ✅ | — |
| `/comic/2` | ✅ | — |
| `/plaza` | ✅ | ✅ |
| `/plaza/script/1` | ✅ | — |
| `/skill` | ✅ | — |
| `/library` | ✅ | — |
| `/asset` | ✅ | — |
| `/team` | ✅ | — |
| `/agent` | ✅ | — |
| `/publish` | ✅ | — |

### 7.2 对比基准

将截图与 `docs/design-references/` 下的参考截图逐像素对比。重点检查：
- 按钮文字在品牌色背景上的对比度（之前 `text-brand-foreground` 已修复，确认仍正确）
- `text-danger` 替换 `text-red-400` 后视觉是否一致（oklch 与 rgb 可能有微小色差）
- `text-success` 替换 `text-emerald-400` 后视觉是否一致
- `text-warning` 替换 `text-amber-300` 后视觉是否一致

### 7.3 验证脚本

```bash
# 桌面截图
agent-browser set viewport 1440 900
for route in home create comic "comic/1" "comic/2" plaza "plaza/script/1" skill library asset team agent publish; do
  agent-browser open "http://localhost:3000/$route"
  agent-browser screenshot "/Users/rikre/vi/docs/loop-prompts/screenshots/desktop-${route//\//-}.png" --full
done

# 移动截图
agent-browser set viewport 375 812
for route in home create comic; do
  agent-browser open "http://localhost:3000/$route"
  agent-browser screenshot "/Users/rikre/vi/docs/loop-prompts/screenshots/mobile-${route//\//-}.png" --full
done
```

---

## Phase 8 — 文档更新

**目标**：更新设计走查报告，标记已修复项；记录本轮技术决策。

### 8.1 更新 DESIGN_REVIEW_REPORT.md

在文件顶部添加：

```markdown
## 修复状态（Round 1 更新）

| 编号 | 问题 | 状态 | 修复方式 |
|------|------|------|---------|
| CRIT-1 | --brand-foreground 未定义 | ✅ 已修复 | globals.css 定义 #11130f |
| CRIT-2 | 空状态缺失 | ⚠️ /comic 已修复，/asset 待处理 | 移至 Round 2 |
| CRIT-3 | 移动端无响应式 | ✅ Round 1 修复 | 侧边栏 <768px 收起为 64px |
| CRIT-4 | 彩虹渐变 | ✅ 已修复 | 已替换为品牌色渐变 |
| CRIT-5 | emoji 图标 | ✅ 已修复 | 替换为自定义 SVG |
| CRIT-6 | font-[834] 字重 | ✅ 已修复 | 统一为 font-bold |
| MED-1 | 图标库混用 | ✅ Round 1 修复 | ESLint 规则 + 迁移 |
| MED-2 | Tailwind 色板泄漏 | ✅ Round 1 修复 | 77 处 → 语义 token |
| MED-4 | max-width 不统一 | ✅ Round 1 修复 | 三套 → 两套标准 |
| MED-5 | 语义状态色未令牌化 | ✅ Round 1 修复 | 新增 4 个语义 token |
```

### 8.2 更新 AGENTS.md

在 AGENTS.md 的 Code Style 部分追加：

```markdown
## Design Token 规范（Round 1 确立）

- **禁止**使用 Tailwind 默认色板（`text-red-400`、`bg-green-500` 等）
- **必须**使用语义 token：`text-danger`、`text-success`、`text-warning`、`text-info`
- 品牌色使用 `text-brand` / `bg-brand` / `text-brand-foreground`
- 页面级 max-width：列表页 `max-w-[1400px]`，详情页 `max-w-[960px]`
- 图标统一使用 `@/components/icons`，禁止从 `lucide-react` 直接导入
```

### 8.3 记录技术决策

在 `docs/loop-prompts/round1-decisions.md` 中记录：

```markdown
## 技术决策记录

### TD-1: 语义状态色使用 oklch 而非 hex
- 决策：success/warning/danger/info 使用 oklch 色值
- 理由：与 globals.css 现有 token 体系一致（所有中性色已用 oklch）
- ✅ 已验证：Safari 16.4+ 支持 oklch，Tailwind v4 原生支持

### TD-2: purple/pink 暂归入 info
- 决策：text-purple-400 和 text-pink-400 暂时替换为 text-info
- 理由：当前使用量少（<5 处），不值得单独定义 --accent-secondary
- ⚠️ 推断可用：视觉上有色差，后续如需区分可扩展
- 验证：Phase 7 截图对比确认

### TD-3: ESLint 规则先 warn 后 error
- 决策：no-restricted-syntax 先设为 warn
- 理由：确认无误报后再升级
- ✅ 已验证：Round 2 开始前升级为 error

### TD-4: 移动端侧边栏收起为 64px 而非底部导航
- 决策：使用 md:w-[108px] + w-[64px] 方案
- 理由：实现成本最低，不引入新组件
- ⚠️ 推断可用：64px 图标条在小屏上的可用性未经过用户测试
```

---

## Karpathy 检查清单（每 Phase 结束时逐项确认）

### 尾部测试（March of Nines）

- [ ] token 替换后，检查 oklch() 在旧浏览器/Safari 的 fallback 行为
- [ ] 移动端不仅测首页——测每个路由在 375px 下的表现
- [ ] 特别测试边界场景：
  - `/comic` 搜索无结果时的空状态在 375px 下是否正常
  - `/plaza/script/[id]` 三栏布局在 375px 下是否溢出
  - AccountDropdown 从 64px 侧边栏弹出时是否被截断
  - localStorage 已有项目时，移动端列表渲染是否正常

### 复杂度守门（Don't be a hero）

- [ ] ESLint 规则本身不要过度复杂——先只禁最严重的色板，不要一次禁全部 Tailwind 功能
- [ ] 语义 token 只定义 4 个（success/warning/danger/info），不要一次定义 10 个
- [ ] 移动端方案选最简方案（CSS 响应式），不引入 JS 检测或状态管理

### 确定性标记（imo 标记）

- [ ] 差距矩阵每个替换项标注 ✅（机械替换）或 ⚠️（需视觉确认）
- [ ] 技术决策记录中每条标注 ✅（已验证）或 ⚠️（推断可用）
- [ ] DESIGN_REVIEW_REPORT.md 修复状态标注准确

---

## 完成标准

| 检查项 | 命令 | 预期结果 |
|--------|------|---------|
| TypeScript | `npm run typecheck` | 零错误 |
| ESLint | `npm run lint` | 零色板泄漏 warning |
| 构建 | `npm run build` | 成功 |
| 色板残留 | `rg "text-(red\|emerald\|amber\|cyan\|purple\|pink)-[0-9]" src/ --include="*.tsx"` | 仅 icons.tsx |
| lucide-react 残留 | `rg "from \"lucide-react\"" src/ --include="*.tsx"` | 零结果 |
| 移动端 | agent-browser 375px 截图 | 无横向溢出 |
| 桌面回归 | agent-browser 1440px 截图 | 与参考截图视觉一致 |
