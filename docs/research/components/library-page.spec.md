# LibraryPage Specification (`/zh/library` — 资产库页)

## Overview
- **Target file**: `src/app/library/page.tsx`
- **Screenshot**: `docs/design-references/bollo.video/library-desktop-logged.png`
- **Interaction model**: mixed (click-driven tabs + filter dropdowns + click-driven cards)
- **Page title**: "VibeVideo IO | 你的 AI 短视频工作室"
- **需要登录**：未登录时重定向到登录页

## DOM Structure
```
div.flex.bg-primary.h-screen.overflow-hidden (#131313, 1280×633)
├── Sidebar (64px, shared component — see Sidebar spec below)
└── div.bg-primary.h-screen.overflow-hidden (#131313, 1216×633, x=64)
    └── main (内容容器, 1216×633)
        ├── 顶部行 (y=44, 高 46)
        │   ├── Tabs (角色库4 / 场景库1 / 道具库0) — 左对齐 x=106
        │   ├── 搜索框 "搜索标题、提示词或标签..." (288×40, x=854, y=47)
        │   └── 导出 button (84×36, x=1154, y=49, 品牌色)
        ├── 筛选行 + 创建角色 (y=127, 高 40)
        │   ├── 7 个筛选下拉按钮 (x=106 起始, 各 40px 高)
        │   │   ├── 范围: 全部资产▾ (134×40)
        │   │   ├── 地区: 全部▾ (106×40)
        │   │   ├── 性别: 全部▾ (106×40)
        │   │   ├── 年龄阶段: 全部▾ (134×40)
        │   │   ├── 风格: 全部▾ (106×40)
        │   │   ├── 是否有参考音色: 全部▾ (176×40)
        │   │   └── 项目筛选: 全部▾ (134×40)
        │   └── 创建角色 button (112×36, x=1126, y=129, 品牌色)
        └── 卡片网格 (y=183)
            └── 4 个资产卡片 (5列网格, 仅 4 个有数据)
                ├── 版本历史 button (207×117, aspect-video, 含 img)
                ├── 标题行 (flex row gap-1, 22px 高)
                │   ├── 标题文本 (从 img.alt 推断)
                │   ├── 编辑资产 button (30×22, title="编辑资产")
                │   └── 删除角色 button (30×22, title="删除角色", 含 icon_delete_dark.svg)
```

## Computed Styles (exact values from getComputedStyle)

### 全局容器
- 外层 `div.flex.bg-primary.h-screen.overflow-hidden`: 1280×633, bg `#131313`, flex row
- Sidebar (64px wide): bg `rgba(255,255,255,0.1)` (bg-primary-5)
- 主内容区 `div.bg-primary.h-screen.overflow-hidden`: 1216×633 (x=64), bg `#131313`

### Tabs (角色库4 / 场景库1 / 道具库0)

#### 选中态 (角色库4)
- classes: `px-4 py-3 text-sm font-medium border-b-2 transition-colors border-primary color-primary`
- fontSize: 14px, fontWeight: 500
- color: `rgb(255, 255, 255)`
- borderBottom: `2px solid rgb(240, 255, 140)` (品牌色)
- borderColor: `rgb(240, 255, 140)`
- padding: `12px 16px`
- 尺寸: 88.84 × 46
- 位置: x=106, y=44

#### 未选中态 (场景库1 / 道具库0)
- classes: `px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent color-primary-60 hover:color-primary`
- fontSize: 14px, fontWeight: 500
- color: `rgba(255, 255, 255, 0.6)`
- borderBottom: `2px solid rgba(0, 0, 0, 0)` (透明)
- borderColor: `rgba(0, 0, 0, 0)`
- padding: `12px 16px`
- 尺寸: 88.84 × 46

#### Tabs 数据
| Tab | 文本 | 位置 |
|-----|------|------|
| 1 | 角色库4 | x=106, y=44 (选中态) |
| 2 | 场景库1 | x=202.84, y=44 |
| 3 | 道具库0 | x=299.69, y=44 |

### 搜索框
- placeholder: "搜索标题、提示词或标签..."
- type: search (input)
- classes: `app-search-input h-10 w-full rounded-lg border border-secondary bg-primary-5 py-2 pl-9 pr-9 text-sm color-primary outline-none transition-colors placeholder:color-primary-60 focus:border-primary`
- bg: `rgba(255, 255, 255, 0.1)` (bg-primary-5)
- color: `rgb(255, 255, 255)`
- border: `1px solid rgba(255, 255, 255, 0.2)` (border-secondary)
- borderRadius: 8px
- padding: `8px 36px` (pl-9 pr-9)
- fontSize: 14px
- 尺寸: 288 × 40
- 位置: x=854, y=47

### 导出按钮
- text: "导出"
- classes: `flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium color-black transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60`
- bg: `rgb(240, 255, 140)` (品牌色, bg-secondary)
- color: `rgb(0, 0, 0)` (color-black)
- borderRadius: 8px
- padding: `8px 16px`
- fontSize: 14px, fontWeight: 500
- 尺寸: 84 × 36
- 位置: x=1154, y=49

### 创建角色按钮
- text: "创建角色"
- classes: `px-4 py-2 bg-secondary color-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2`
- bg: `rgb(240, 255, 140)` (品牌色)
- color: `rgb(0, 0, 0)`
- borderRadius: 8px
- padding: `8px 16px`
- fontSize: 14px, fontWeight: 500
- 尺寸: 112 × 36
- 位置: x=1126, y=129

### 筛选下拉按钮 (7 个)

#### 通用样式
- classes: `flex h-10 w-fit max-w-full items-center justify-between gap-2 rounded-lg border border-secondary px-3 py-2 text-left text-sm color-primary bg-primary-5`
- bg: `rgba(255, 255, 255, 0.1)` (bg-primary-5)
- color: `rgb(255, 255, 255)`
- border: `1px solid rgba(255, 255, 255, 0.2)` (border-secondary)
- borderRadius: 8px
- padding: `8px 12px`
- fontSize: 14px
- height: 40px

#### 7 个筛选按钮 (verbatim 文本 + 位置)
| # | ariaLabel | 文本 | 宽度 | 位置 |
|---|-----------|------|------|------|
| 1 | 范围 | 范围: 全部资产▾ | 134.31 | x=106, y=127 |
| 2 | 地区 | 地区: 全部▾ | 106.31 | x=248.31, y=127 |
| 3 | 性别 | 性别: 全部▾ | 106.31 | x=362.63, y=127 |
| 4 | 年龄阶段 | 年龄阶段: 全部▾ | 134.31 | x=476.94, y=127 |
| 5 | 风格 | 风格: 全部▾ | 106.31 | x=619.25, y=127 |
| 6 | 是否有参考音色 | 是否有参考音色: 全部▾ | 176.31 | x=733.56, y=127 |
| 7 | 项目筛选 | 项目筛选: 全部▾ | 134.31 | x=917.88, y=127 |

### 资产卡片网格
- 容器 classes: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6`
- display: grid
- gridTemplateColumns: `207.188px 207.203px 207.203px 207.203px 207.188px` (xl: 5 列)
- gap: 24px (gap-6)
- 网格尺寸: 1132 × 170.55
- 位置: x=106, y=183

### 资产卡片
- cardClasses: `bg-primary-5 rounded-lg overflow-hidden`
- bg: `rgba(255, 255, 255, 0.1)` (bg-primary-5)
- border: 0 (无显式边框)
- borderRadius: 8px (rounded-lg)
- padding: 0
- 尺寸: 207.2 × 170.55
- 内部结构:
  1. 版本历史按钮 (image 容器)
  2. 标题行 (含标题文本 + 编辑资产 + 删除角色 按钮)

### 版本历史按钮 (image 容器)
- ariaLabel: "版本历史"
- classes: `relative w-full aspect-video cursor-pointer bg-primary`
- bg: `rgb(19, 19, 19)` (bg-primary)
- borderRadius: 0 (在卡片内被父 rounded-lg 裁剪)
- aspectRatio: `16 / 9`
- cursor: pointer
- 尺寸: 207.2 × 116.55
- 内部含 `<img>` (objectFit: contain)

### 卡片图片
- classes: `object-contain`
- objectFit: contain
- borderRadius: 0
- 尺寸: 207.2 × 116.55 (与版本历史按钮同尺寸)
- alt: 角色名称

### 标题行
- tag: div
- classes: `flex flex-shrink-0 items-center gap-1`
- display: flex, flexDirection: row
- gap: 4px
- padding: 0
- 尺寸: 64 × 22
- 位置: 紧贴卡片底部右侧 (例如 x=237.19, y=319.53)
- 注意: 标题文本不在 titleRow 内部 (titleText 为空), 标题文本实际位于卡片图片下方的独立 div

### 编辑资产按钮
- title: "编辑资产"
- ariaLabel: "编辑资产"
- classes: `px-2 py-1 color-primary hover:opacity-80 flex-shrink-0`
- color: `rgb(255, 255, 255)`
- fontSize: 16px
- padding: `4px 8px`
- 尺寸: 30 × 22
- 无文字, 仅 SVG 图标

### 删除角色按钮
- title: "删除角色"
- ariaLabel: "删除角色"
- classes: `px-2 py-1 hover:opacity-80 flex-shrink-0`
- color: `rgb(23, 23, 23)`
- fontSize: 16px
- padding: `4px 8px`
- 尺寸: 30 × 22
- 含 `<img src="https://bollo.video/icons/icon_delete_dark.svg" alt="">` (14×14 删除图标)

## 4 个资产卡片数据 (verbatim)

| # | 名称 (img.alt) | 图片 URL |
|---|----------------|----------|
| 1 | 虾兵 | https://store2.cdn.bollo.video/media/ce74d3b4a93c490381208a79ee78f952/characters/a7aa89ab11c44a918e089e6481a1ffaa_1.png?auth_key=... |
| 2 | 纪川 | https://store2.cdn.bollo.video/media/ce74d3b4a93c490381208a79ee78f952/characters/ff6d963a8ae742059e57dc02c5c57882_1.png?auth_key=... |
| 3 | 霍云峥 | https://store2.cdn.bollo.video/media/ce74d3b4a93c490381208a79ee78f952/characters/794973f8e2dc47e59be3883ddd4a5c00/original_1.jpg?auth_key=... |
| 4 | 萧世昌 幕后主使 | https://store2.cdn.bollo.video/media/ce74d3b4a93c490381208a79ee78f952/characters/a52b7caeae3b40c69b3e23f92ccce5b4_1.png?auth_key=... |

**注意**: 图片 URL 含 `auth_key` 参数 (有时效性), 复刻时需下载并去除 query string 保存到本地 `public/images/library/characters/`。

## Sidebar 规范 (所有页共享, 64px 宽)

### Sidebar 容器
- tag: div (非 nav)
- classes: `bg-primary-5 flex flex-col justify-between items-center h-screen py-6 relative w-16`
- bg: `rgba(255, 255, 255, 0.1)` (bg-primary-5)
- width: 64px
- height: 100vh (633px in viewport)
- padding: `24px 0` (py-6)
- display: flex, flexDirection: column
- justify-content: space-between, align-items: center

### 顶层结构
- 2 个子 div:
  1. **顶部组**: `flex flex-col items-center gap-12` (gap-12 = 48px), 520×73, y=24
  2. **底部组**: `flex flex-col items-center px-3 w-full` (px-3 = 12px), 132×64, y=544

### 顶部组导航项 (从上到下)
| # | 类型 | text | ariaLabel | title | href | img alt | img src | opacity | 选中 |
|---|------|------|-----------|-------|------|---------|---------|---------|------|
| 1 | a | (logo) | 产品概览 | 产品概览 | /zh/overview | Bollo 标志 | /images/bollo.png | - | - |
| 2 | a | 首页 | - | 首页 | /zh/home | 首页 | /icons/icon_sidebar_home.svg | 60% | |
| 3 | a | 创作 | - | 创作 | /zh/create | 创作 | /icons/icon_sidebar_create.svg | 60% | |
| 4 | a | 剧本 | - | 剧本 | /zh/my-scripts | 剧本 | /icons/icon_sidebar_scripts.svg | 60% | |
| 5 | a | 项目 | - | 项目 | /zh/comic | 项目 | /icons/icon_sidebar_project.svg | 60% | |
| 6 | a | 资产 | - | 资产 | /zh/library | 资产 | /icons/icon_sidebar_library_highlight.svg | 100% | ✓ (高亮) |
| 7 | button | 消息 | - | 消息 | - | 消息 | /icons/icon_sound_nobg.svg | 80% | |
| 8 | button | 积分999193 | - | - | - | (无 img) | - | 60% | |

### 通用导航项样式 (顶部组)
- classes: `flex flex-col items-center gap-1 cursor-pointer transition-opacity opacity-60 hover:opacity-80`
- 选中态 classes: `flex flex-col items-center gap-1 cursor-pointer transition-opacity` (无 opacity 类, 默认 100%)
- 消息按钮 classes: `... opacity-80 hover:opacity-100`
- 尺寸: 24 × 32 (24px 宽, 32px 高)
- 位置 x=20 (居中, sidebar 64px)
- 间距: gap-12 = 48px

### Logo
- tag: a, href: /zh/overview
- ariaLabel: 产品概览, title: 产品概览
- classes: `w-6 h-6 flex-shrink-0 mt-2`
- 尺寸: 24 × 24, mt-2 (8px 上间距)
- 位置: x=20, y=32
- 含 `<img>` alt="Bollo 标志" src="/images/bollo.png"

### 底部组
- 含 3 个元素 (从上到下):
  1. **文档按钮** (a, href="/zh/posts/category/tutorials/")
     - text: "文档"
     - classes: `flex items-center color-secondary hover:color-secondary rounded-full transition-all duration-200 hover:bg-primary-5 bg-primary-5 justify-center px-2 py-2 mb-4 mt-4 w-full`
     - color: `rgb(240, 255, 140)` (color-secondary 品牌色)
     - bg: `rgba(255, 255, 255, 0.1)` (bg-primary-5)
     - borderRadius: full
     - padding: `8px 8px` (px-2 py-2)
     - margin: `16px 0` (mt-4 mb-4)
     - 尺寸: 40 × 28
     - 位置: x=12, y=560
  2. **用户头像按钮** (button, text="欢", title="欢瑞漫剧管理员")
     - classes: `flex flex-col items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 p-1`
     - color: `rgb(23, 23, 23)`
     - 尺寸: 44 × 44
     - 位置: x=10, y=632
     - 无 img, 圆形头像 (推测带 bg-primary-5)

### Sidebar 选中态判定
- 通过 `opacity` 控制: 选中项无 opacity 类 (100%), 未选中项 opacity-60 (60%)
- 资产图标使用 highlight 版本: `icon_sidebar_library_highlight.svg` (其他用普通 svg)
- **实现**: 通过 usePathname() 匹配当前路由, 选中项不应用 opacity 类

## States & Behaviors

### Tab 切换 (角色库 ↔ 场景库 ↔ 道具库)
- **Interaction model**: click-driven
- **Trigger**: click on tab button
- **State A (角色库 selected, 默认)**:
  - 角色库4: borderBottom 2px solid #F0FF8C, color white
  - 场景库1: borderBottom transparent, color white/60
  - 道具库0: borderBottom transparent, color white/60
- **State B (场景库 selected)**: 反之 (场景库1 active)
- **State C (道具库 selected)**: 反之 (道具库0 active)
- **Transition**: `transition-colors` (CSS transition)
- **数据切换**: 点击不同 Tab 时, 卡片网格切换为对应类型 (4/1/0 张卡)

### 筛选下拉按钮
- **Interaction model**: click-driven (推测打开下拉菜单)
- **Trigger**: click on filter button
- **State A**: 下拉箭头 ▾, "全部" 默认值
- **State B**: 点击展开下拉选项 (未提取具体选项内容)
- **Position**: 展开后浮于筛选行下方
- **注意**: 7 个筛选按钮的具体下拉选项内容未提取

### 创建角色按钮
- **Trigger**: click
- **Action**: 跳转创作页或弹出创建角色对话框 (未验证)

### 导出按钮
- **Trigger**: click
- **Action**: 导出当前 Tab 下的所有资产 (未验证具体行为)
- **Disabled 状态**: 推测当无资产时 disabled, opacity-60

### 卡片 hover
- **Trigger**: mouseenter
- **State A**: 编辑/删除按钮可见 (推测始终可见, 因没有 hover:hidden 类)
- **State B**: 卡片整体 opacity 变化 (推测, 待验证)
- **Transition**: hover:opacity-80 (编辑/删除按钮)

### 卡片图片 (版本历史按钮)
- **Trigger**: click
- **Action**: 打开版本历史弹窗 (推测, 跳转资产详情页)

## Assets Needed

### SVG 图标
- 消息图标: `https://bollo.video/icons/icon_sound_nobg.svg`
- 删除图标: `https://bollo.video/icons/icon_delete_dark.svg`
- 首页图标: `https://bollo.video/icons/icon_sidebar_home.svg`
- 创作图标: `https://bollo.video/icons/icon_sidebar_create.svg`
- 剧本图标: `https://bollo.video/icons/icon_sidebar_scripts.svg`
- 项目图标: `https://bollo.video/icons/icon_sidebar_project.svg`
- 资产图标 (highlight): `https://bollo.video/icons/icon_sidebar_library_highlight.svg`
- 资产图标 (normal): 需另外提取
- 编辑资产图标: 需从编辑按钮内部提取 (推测在 button 内有 svg, 当前未提取到)
- Logo: `https://bollo.video/images/bollo.png`

### 资产图片 (4 张, 已知 URL)
需下载到 `public/images/library/characters/`:
- 虾兵: `ce74d3b4a93c490381208a79ee78f952_a7aa89ab11c44a918e089e6481a1ffaa_1.png`
- 纪川: `ce74d3b4a93c490381208a79ee78f952_ff6d963a8ae742059e57dc02c5c57882_1.png`
- 霍云峥: `ce74d3b4a93c490381208a79ee78f952_794973f8e2dc47e59be3883ddd4a5c00_original_1.jpg`
- 萧世昌: `ce74d3b4a93c490381208a79ee78f952_a52b7caeae3b40c69b3e23f92ccce5b4_1.png`

## Text Content (verbatim)

### 顶部 Tabs
- "角色库4" "场景库1" "道具库0"

### 搜索框
- placeholder: "搜索标题、提示词或标签..."

### 顶部按钮
- "导出"

### 筛选按钮
- "范围: 全部资产▾"
- "地区: 全部▾"
- "性别: 全部▾"
- "年龄阶段: 全部▾"
- "风格: 全部▾"
- "是否有参考音色: 全部▾"
- "项目筛选: 全部▾"

### 主操作按钮
- "创建角色"

### 卡片
- 名称 (img.alt): "虾兵" "纪川" "霍云峥" "萧世昌 幕后主使"
- 操作按钮 title: "编辑资产" "删除角色" "版本历史"

### Sidebar 文本
- Logo ariaLabel: "产品概览"
- 导航: "首页" "创作" "剧本" "项目" "资产" "消息" "积分999193" "文档"
- 用户头像: "欢" (title="欢瑞漫剧管理员")

## Responsive Behavior

### Desktop (1280px+)
- 网格 5 列 (xl:grid-cols-5)
- 完整筛选行单行排列

### Tablet (768-1023px)
- 网格 4 列 (lg:grid-cols-4)
- 筛选行可能换行 (未验证)

### Tablet 小 (640-767px)
- 网格 3 列 (sm:grid-cols-3)
- 顶部按钮可能折叠

### Mobile (<640px)
- 网格 2 列 (grid-cols-2)
- 移动端提示 "为获得最佳体验，请访问网页版" (推测, 同 create 页)

## 已知限制
- 7 个筛选下拉按钮的具体下拉选项内容未提取 (需登录后逐个点击展开)
- 场景库1 / 道具库0 Tab 下的卡片数据未提取 (点击切换后未重新提取)
- 编辑资产按钮内部 SVG 图标未单独提取
- 资产图标 normal 版本 (非 highlight) 未提取
- 创建角色按钮的点击行为未验证
- 版本历史按钮的点击行为未验证
- 移动端布局的实际断点未验证

## 实现备注

### 路由对应
- Sidebar 路由: 首页 → /zh/home, 创作 → /zh/create, 剧本 → /zh/my-scripts, 项目 → /zh/comic, 资产 → /zh/library
- 在本项目中, 对应映射为: /home, /create, /scripts (或 /my-scripts), /project (或 /comic), /asset (或 /library)
- 由于现有项目路由为 /asset, 建议保留 /asset 路径, 但需更新内容为 library 页的真实结构

### 颜色变量映射 (基于本项目的 globals.css)
- `bg-primary-5` → `bg-white/[0.05]` 或 `bg-white/[0.1]` (实际取 0.1)
- `bg-primary-10` → `bg-white/[0.1]`
- `border-secondary` → `border-white/[0.2]`
- `bg-secondary` (品牌色背景) → `bg-brand` (#F0FF8C)
- `color-secondary` (品牌色文字) → `text-brand`
- `color-primary` → `text-white`
- `color-primary-60` → `text-white/60`
- `color-black` → `text-black`
- `bg-primary` → `bg-background` (项目 --background 值 oklch(0.18 0 0) ≈ #2a2a2a, 接近但非 #131313; 需调整或单独使用 #131313)

### 关键差异点 (与现有项目 /asset 页对比)
1. **现有 /asset 页有 H1 "我的资产"**, 真实库页无 H1, 用 Tabs 作为页面身份
2. **现有 /asset 页有 4 个 Tab (角色/场景/道具/我的收藏)**, 真实库页只有 3 个 Tab (角色库4/场景库1/道具库0), 数量带在每个 Tab 文本后
3. **现有 /asset 页 Tab 圆角矩形 (rounded-xl bg-white/[0.1])**, 真实库页 Tab 为下划线式 (border-b-2)
4. **现有 /asset 页无筛选下拉**, 真实库页有 7 个筛选下拉按钮
5. **现有 /asset 页卡片 259×152 圆角 16px**, 真实库页卡片 207×170 圆角 8px, 且布局为 16:9 aspect-video
6. **现有 /asset 页卡片有 tag "热门"/"新"**, 真实库页无 tag
7. **现有 /asset 页操作按钮 (回收站/AI生成/上传) 在顶部右侧**, 真实库页操作按钮 (导出/创建角色) 分散在顶部和筛选行右端
8. **Sidebar**: 现有项目 108px 宽, 真实站 64px 宽; 现有 6 项 + 3 底项, 真实站 5 项 + 4 底项 (消息/积分/文档/头像)
