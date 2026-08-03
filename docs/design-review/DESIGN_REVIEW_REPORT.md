# bollo 平台 UI/UX 设计走查报告

> 走查日期：2026-07-22
> 走查范围：/home、/skill、/asset、/project、/space/new 共 5 个页面
> 截图目录：`/Users/rikre/Documents/trae_projects/vi/docs/design-review/`
> 项目技术栈：Next.js 16 + Tailwind CSS v4 + shadcn/ui（暗色优先设计）

---

## 修复状态（Round 1 更新 — 2026-07-31）

| 编号 | 问题 | 状态 | 修复方式 |
|------|------|------|---------|
| CRIT-1 | --brand-foreground 未定义 | ✅ 已修复 | globals.css 定义 #11130f + @theme inline 映射 |
| CRIT-2 | 空状态缺失 | ⚠️ /comic 已修复，/asset 待处理 | 移至 Round 2 |
| CRIT-3 | 移动端无响应式 | ✅ Round 1 修复 | 侧边栏 <768px 收起为 64px，文字标签隐藏 |
| CRIT-4 | 彩虹渐变 | ✅ 已修复 | 已替换为品牌色渐变 |
| CRIT-5 | emoji 图标 | ✅ 已修复 | 替换为自定义 SVG |
| CRIT-6 | font-[834] 字重 | ✅ 已修复 | 统一为 font-bold |
| MED-1 | 图标库混用 | ✅ 已修复 | lucide-react 导入已清零 |
| MED-2 | Tailwind 色板泄漏 | ✅ Round 1 修复 | 50 处 → 语义 token（success/warning/danger/info） |
| MED-4 | max-width 不统一 | ✅ 已统一 | 页面级统一 1400px |
| MED-5 | 语义状态色未令牌化 | ✅ Round 1 修复 | 新增 4 个语义 token + @theme inline 映射 |
| MED-3 | 卡片宽高比不统一 | ⚠️ 待处理 | 移至 Round 2 |
| MED-6 | "我的技能"按钮低可见度 | ⚠️ 待处理 | 移至 Round 2 |
| MED-7 | 语义图标误用 | ⚠️ 待处理 | 移至 Round 2 |

---

## 一、各页面视觉问题详述

### 1. /home（发现页）
**截图**：`01-home-full.png`、`07-home-mobile-375.png`

| # | 问题 | 位置 | 严重度 |
|---|------|------|--------|
| H1 | 标题"凌晨好，导演！"使用 `font-[834]`（非标准字重 834），其他页面标题用 `font-bold`（700），字重体系不一致 | `src/components/home/greeting.tsx:21` | 🔴 高 |
| H2 | "进入创作"卡片使用 `conic-gradient(from 180deg, #f35b8b, #ff7ee3, #8e4df7, #5e8eff, #00d4ff, #00ff9d, #d2ff5e, #f35b8b)` 彩虹渐变（粉/紫/蓝/青），与 bollo 柠檬绿品牌色（#F0FF8C）严重冲突 | `src/components/home/projects-section.tsx:16,34` | 🔴 高 |
| H3 | `features-section.tsx` 的 SmallCard "新"徽标用 `bg-lime text-black`（Tailwind 默认色板），其他卡片用 `bg-brand text-brand-foreground`（设计令牌） | `src/components/home/features-section.tsx:116` | 🟠 中 |
| H4 | `activity-section.tsx` 从 `lucide-react` 引入 `ChevronLeft/ChevronRight`，`video-grid.tsx` 引入 `Play`，与项目自定义 `@/components/icons` 图标体系混用 | `activity-section.tsx:4`、`video-grid.tsx:4` | 🟠 中 |
| H5 | Greeting 区 `mt-20`（80px），其他 section 用 `mt-10`（40px），页面顶部留白与内容区间距不成体系 | `src/components/home/greeting.tsx:15` | 🟡 低 |
| H6 | Footer 使用 `py-20`（80px）+ `mt-20`，与页面其他 `pb-10` 间距体系不匹配 | `src/components/layout/footer.tsx:19` | 🟡 低 |
| H7 | 375px 移动端下侧边栏（108px）未收起，内容区仅剩 ~267px，横向滚动卡片溢出严重，无响应式适配 | `src/components/layout/sidebar.tsx` | 🔴 高 |

### 2. /skill（技能广场）
**截图**：`02-skill-full.png`

| # | 问题 | 位置 | 严重度 |
|---|------|------|--------|
| S1 | 主按钮"创建我的 Skill"使用 `text-brand-foreground`，但 CSS 中未定义 `--brand-foreground` 变量，文字色回退为白色，在柠檬绿（#F0FF8C）背景上对比度不足（WCAG AA 不通过） | `src/app/skill/page.tsx:79` | 🔴 高 |
| S2 | "我的技能"按钮使用 `bg-brand/15 text-brand`，与同行的分类按钮（`bg-white/[0.1] text-white`）视觉风格不统一，且品牌色透明度 15% 在暗背景上几乎不可见 | `src/app/skill/page.tsx:91` | 🟠 中 |
| S3 | 技能卡网格在 1440px 下为 6 列，卡片宽度仅约 200px，`line-clamp-2` 的描述文字显得拥挤 | `src/components/skill/skill-grid.tsx:89` | 🟡 低 |
| S4 | 技能卡内"使用"按钮 hover 时变 `bg-brand`，但非 hover 态为 `bg-white/[0.08]`，按钮主次层级在多卡片场景下不够清晰 | `src/components/skill/skill-grid.tsx:73` | 🟡 低 |

### 3. /asset（我的资产）
**截图**：`03-asset-full.png`、`06-asset-empty-search.png`

| # | 问题 | 位置 | 严重度 |
|---|------|------|--------|
| A1 | 资产分类 Tab 使用 emoji 图标（`👤 角色`、`🏞️ 场景`、`🎭 道具`、`❤️ 我的收藏`），与全站自定义 SVG 图标体系完全不一致，emoji 在不同系统渲染差异大 | `src/app/asset/page.tsx:8-13` | 🔴 高 |
| A2 | 搜索"zzzznomatch"无结果时，页面仅显示一个"新角色"虚线框按钮，无任何空状态提示（无"未找到结果"文案、无插图、无清空搜索建议） | `src/app/asset/page.tsx` + `asset-grid.tsx` | 🔴 高 |
| A3 | 主按钮"AI 生成"使用 `text-brand-foreground`（未定义变量），同 S1 问题 | `src/app/asset/page.tsx:117` | 🔴 高 |
| A4 | 资产卡为正方形（`aspect-square`），技能卡为 4:3，项目卡为 16:9，三种卡片宽高比不统一，跨页面视觉一致性差 | `src/components/asset/asset-grid.tsx:30` | 🟠 中 |
| A5 | 资产卡标题用 `text-[13px] font-medium`，技能卡标题用 `text-[14px] font-semibold`，项目卡标题用 `text-[14px] font-semibold`，字号/字重不完全统一 | `src/components/asset/asset-grid.tsx:65` | 🟡 低 |
| A6 | 资产卡 tag 用 `bg-brand/90`（90% 不透明），技能卡"新"标签用 `bg-brand`（100%），透明度处理不一致 | `src/components/asset/asset-grid.tsx:59` vs `skill-grid.tsx:38` | 🟡 低 |

### 4. /project（我的项目）
**截图**：`04-project-full.png`

| # | 问题 | 位置 | 严重度 |
|---|------|------|--------|
| P1 | 主按钮"进入创作"使用 `text-brand-foreground`（未定义变量），同 S1/A3 问题 | `src/app/project/page.tsx:110` | 🔴 高 |
| P2 | 项目状态色使用 Tailwind 默认色板：`bg-green-500/20 text-green-400`（已完成）、`bg-white/20 text-white/80`（草稿）、`bg-brand/20 text-brand`（生成中），未在设计令牌中定义语义状态色 | `src/components/project/project-grid.tsx:43-45` | 🟠 中 |
| P3 | 项目卡右下角放置了一个孤立的 `FolderIcon`（`size-3.5 text-white/30`），无任何功能或信息含义，疑似遗留代码 | `src/components/project/project-grid.tsx:98` | 🟡 低 |
| P4 | 项目网格最多 4 列（`lg:grid-cols-4`），技能/资产网格最多 6 列，同分辨率下卡片密度不一致 | `src/components/project/project-grid.tsx:112` | 🟡 低 |
| P5 | 与 /asset 页面同样存在空状态缺失问题（搜索无结果无提示） | `src/app/project/page.tsx` | 🔴 高 |

### 5. /space/new（个人中心）
**截图**：`05-space-new-full.png`

| # | 问题 | 位置 | 严重度 |
|---|------|------|--------|
| U1 | 多处使用 `text-brand-foreground`（未定义变量），包括头像编辑按钮、升级会员按钮、立即充值按钮 | `src/app/space/new/page.tsx:99,125,169` | 🔴 高 |
| U2 | "首月5折"徽标使用 `bg-red-500/20 text-red-400`（Tailwind 红色），"退出登录"使用 `text-red-400/80` + `hover:bg-red-500/10`，引入了设计系统外的红色，且红色在柠檬绿品牌色体系下显得突兀 | `src/app/space/new/page.tsx:194,229` | 🟠 中 |
| U3 | 页面宽度限制 `max-w-[880px]`，而其他列表页用 `max-w-[1400px]`，home 用 `max-w-[1332px]`，三套宽度标准 | `src/app/space/new/page.tsx:72` | 🟠 中 |
| U4 | 用户头像容器用 `rounded-2xl`（圆角 ~1.35rem），TopBar 头像用 `rounded-full`，个人中心卡片用 `rounded-2xl`，菜单列表也用 `rounded-2xl`，圆角使用过度统一为 2xl，缺乏层级区分 | 多处 | 🟡 低 |
| U5 | 版本信息"bollo AI · Version 1.0.0 · © 2024"年份为 2024，与 Footer 的"© 2025"不一致 | `src/app/space/new/page.tsx:236` | 🟡 低 |
| U6 | STATS 区域用 `HeartIcon` 表示"资产"数量（128），语义不符（Heart 通常表收藏），应用 `AssetIcon` | `src/app/space/new/page.tsx:25` | 🟠 中 |

---

## 二、按严重程度分级的问题清单

### 🔴 高严重度（影响可用性/可读性/品牌一致性，需立即修复）

| 编号 | 问题 | 影响 |
|------|------|------|
| CRIT-1 | **`--brand-foreground` CSS 变量未定义**：全局 11 处使用 `text-brand-foreground`，但 `globals.css` 未定义该变量，导致所有品牌色按钮上的文字颜色失效（回退为继承色，通常为白色），在 #F0FF8C 柠檬绿背景上对比度不足 | 涉及 `/skill`、`/asset`、`/project`、`/space/new` 所有主按钮 + 卡片标签 |
| CRIT-2 | **空状态完全缺失**：`/asset` 和 `/project` 搜索无结果时无任何提示，用户无法区分"无数据"和"加载中" | `/asset`、`/project` |
| CRIT-3 | **移动端无响应式适配**：375px 宽度下侧边栏（108px）仍占满，内容区仅 ~267px，卡片横向溢出，无汉堡菜单/底部导航 | `/home`（推测全站） |
| CRIT-4 | **品牌色被彩虹渐变破坏**：`/home` "进入创作"卡片使用 8 色彩虹 conic-gradient（粉紫蓝青绿），与 bollo 柠檬绿品牌色严重冲突 | `/home` |
| CRIT-5 | **emoji 与 SVG 图标混用**：`/asset` 分类 Tab 使用 emoji（👤🏞️🎭❤️），全站其他地方用自定义 SVG，跨平台渲染不一致 | `/asset` |
| CRIT-6 | **标题字重体系不一致**：`/home` Greeting 用 `font-[834]`，其他 4 个页面用 `font-bold`（700） | `/home` vs 其他 |

### 🟠 中严重度（影响视觉一致性，建议近期修复）

| 编号 | 问题 | 影响 |
|------|------|------|
| MED-1 | **图标库混用**：3 个 home 子组件从 `lucide-react` 引入图标，其他全用 `@/components/icons` | `/home` |
| MED-2 | **Tailwind 默认色板泄漏**：`bg-lime`、`text-black`、`bg-red-500/*`、`text-green-400`、`bg-green-500/20` 等绕过设计令牌 | `/home`、`/project`、`/space/new` |
| MED-3 | **三种卡片宽高比不统一**：资产卡 `aspect-square`、技能卡 `aspect-[4/3]`、项目卡 `aspect-video` | 跨页面 |
| MED-4 | **三套最大宽度标准**：home `max-w-[1332px]`、列表页 `max-w-[1400px]`、个人中心 `max-w-[880px]` | 跨页面 |
| MED-5 | **状态色未令牌化**：项目状态、会员徽标、退出登录用 Tailwind 默认红/绿，未在 `globals.css` 定义语义状态色（success/warning/danger） | `/project`、`/space/new` |
| MED-6 | **"我的技能"按钮低可见度**：`bg-brand/15`（15% 透明柠檬绿）在暗背景上几乎不可见 | `/skill` |
| MED-7 | **语义图标误用**：个人中心用 `HeartIcon` 表示"资产"数量 | `/space/new` |

### 🟡 低严重度（细节打磨，可迭代优化）

| 编号 | 问题 |
|------|------|
| LOW-1 | Greeting `mt-20` 与其他 section `mt-10` 间距不成体系 |
| LOW-2 | Footer `py-20 mt-20` 与页面 `pb-10` 间距体系不匹配 |
| LOW-3 | 三种卡片标题字号/字重不完全统一（13px/14px、medium/semibold） |
| LOW-4 | 品牌色 tag 透明度不一致（`bg-brand` vs `bg-brand/90`） |
| LOW-5 | 项目卡右下角孤立 FolderIcon 疑似遗留代码 |
| LOW-6 | 网格列数不一致（项目 4 列 vs 技能/资产 6 列） |
| LOW-7 | 圆角过度使用 `rounded-2xl`，缺乏层级区分 |
| LOW-8 | 版权年份不一致（2024 vs 2025） |
| LOW-9 | `skill-section.tsx` 为死代码（未被引用） |
| LOW-10 | 技能卡"使用"按钮主次层级在密集网格中不够清晰 |

---

## 三、设计规范改进建议

### 3.1 立即修复（阻断性问题）

#### 修复 1：定义 `--brand-foreground` 变量
在 `src/app/globals.css` 的 `:root, .dark` 块中添加：
```css
/* 品牌色文字前景色 - 深色，用于品牌色背景上 */
--brand-foreground: oklch(0.18 0 0);  /* 与 --primary-foreground 一致 */
```
并在 `@theme inline` 中添加映射：
```css
--color-brand-foreground: var(--brand-foreground);
```
**影响文件**：`src/app/globals.css`（仅此一处修复，11 处使用即可生效）

#### 修复 2：添加空状态组件
为 `/asset` 和 `/project` 的网格添加空状态：
```tsx
{filteredAssets.length === 0 && (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <SearchIcon className="size-12 text-white/20" />
    <p className="mt-4 text-[15px] font-medium text-white/60">未找到相关结果</p>
    <p className="mt-1 text-[13px] text-white/40">尝试调整搜索关键词或清除筛选</p>
    <button onClick={() => setSearchQuery("")} className="mt-4 ...">清除搜索</button>
  </div>
)}
```

#### 修复 3：移动端响应式侧边栏
- < 768px：侧边栏收起为图标条（48px）或转换为底部 Tab Bar
- ≥ 768px：保持当前 108px 侧边栏

#### 修复 4：移除彩虹渐变
将 `CREATE_GRADIENT` 改为品牌色渐变：
```ts
const CREATE_GRADIENT = "linear-gradient(135deg, #f0ff8c 0%, #f5ffb3 100%)";
```

#### 修复 5：替换 emoji 为 SVG 图标
在 `src/components/icons.tsx` 中新增 `CharacterIcon`、`SceneIcon`、`PropIcon`，替换 `/asset` 页面的 emoji。

#### 修复 6：统一标题字重
将 `greeting.tsx` 的 `font-[834]` 改为 `font-bold`（与其他页面一致）。

### 3.2 近期优化（一致性问题）

#### 统一图标来源
移除 `lucide-react` 依赖，在 `@/components/icons.tsx` 中补充 `ChevronLeftIcon`、`ChevronRightIcon`、`PlayIcon`（已有 `PlayCircleIcon` 可复用）、`ArrowRightIcon`。

#### 令牌化语义状态色
在 `globals.css` 中扩展设计令牌：
```css
--success: oklch(0.7 0.15 145);       /* 绿 */
--success-foreground: oklch(1 0 0);
--warning: oklch(0.8 0.15 85);        /* 黄 */
--danger: oklch(0.65 0.22 25);        /* 与 destructive 一致 */
--danger-foreground: oklch(1 0 0);
```

#### 统一卡片体系
建议制定卡片设计规范：
| 属性 | 规范值 |
|------|--------|
| 圆角 | `rounded-xl`（0.75rem）统一 |
| 内边距 | 内容区 `p-4` |
| 标题 | `text-[14px] font-semibold` |
| 描述 | `text-[12px] text-white/50` |
| hover | `hover:-translate-y-1 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-black/20` |
| 网格列数 | 统一为 `lg:grid-cols-4 xl:grid-cols-5`（项目卡 16:9 可适当少列） |

#### 统一页面宽度
- 列表页（skill/asset/project）：`max-w-[1400px]`
- 详情/表单页（space/new）：`max-w-[880px]`
- 首页（home）：`max-w-[1400px]`（与列表页统一）

### 3.3 长期演进

1. **建立设计系统文档**：在 `docs/` 下维护设计令牌表、组件规范、间距系统说明
2. **引入 Storybook**：对卡片、按钮、Tab 等核心组件进行可视化回归测试
3. **添加 ESLint 规则**：禁止直接使用 Tailwind 默认色板（`text-red-*`、`bg-green-*` 等），强制使用设计令牌
4. **暗色模式审计**：当前为暗色优先，若未来支持亮色，需在 `:root`（非 `.dark`）中定义全套令牌

---

## 四、截图清单

| 文件名 | 说明 |
|--------|------|
| `01-home-full.png` | /home 全页截图（1440×900） |
| `02-skill-full.png` | /skill 技能广场全页截图 |
| `03-asset-full.png` | /asset 我的资产全页截图 |
| `04-project-full.png` | /project 我的项目全页截图 |
| `05-space-new-full.png` | /space/new 个人中心全页截图 |
| `06-asset-empty-search.png` | /asset 搜索无结果状态（空状态缺失证据） |
| `07-home-mobile-375.png` | /home 移动端 375px 响应式问题证据 |

---

## 五、总结

bollo 平台整体设计语言明确（暗色 + 柠檬绿品牌色），但存在 **6 个高严重度问题** 影响可用性和品牌一致性，其中最关键的是：

1. **`--brand-foreground` 变量未定义**（影响全站 11 处主按钮文字可读性）—— 一行 CSS 修复即可
2. **空状态完全缺失**（影响搜索体验）
3. **移动端无响应式适配**（侧边栏不收起）
4. **品牌色被彩虹渐变破坏**（/home 进入创作卡片）

建议优先修复 CRIT 级别的 6 个问题，其中 CRIT-1（变量未定义）投入最小、收益最大。
