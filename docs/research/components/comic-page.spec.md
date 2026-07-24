# ComicPage Specification (`/zh/comic` — 项目页)

## Overview
- **Target file**: `src/app/comic/page.tsx`
- **Screenshot**: `docs/design-references/bollo.video/comic-desktop-logged.png`
- **Interaction model**: click-driven (卡片点击 + 按钮操作)
- **Page title**: "VibeVideo IO | 你的 AI 短视频工作室"
- **需要登录**：未登录时重定向到登录页

## DOM Structure
```
main (flex-1, overflow-y-auto, scrollbar-hide)
└── 内容容器 (padding 88px 24px 32px 24px)
    ├── 头部行
    │   ├── h1 "项目" (30px/700/white)
    │   ├── 项目类型筛选 button (右侧)
    │   ├── 搜索框 "搜索项目" (288×40)
    │   └── 创建项目 button (88×36, 品牌色)
    └── 项目网格 (5列)
        └── 项目卡片 × 11
            ├── 封面区 (aspect-video, 16:9, 含 SVG 占位图标)
            │   └── 模式标签 "自由模式60 集"
            └── 标题区 (px-4 py-2.5)
                ├── h3 标题 (16px/600/white)
                └── 3 个操作按钮 (编辑项目/设置封面图/删除项目, 仅 hover 显示)
```

## Computed Styles (exact values)

### H1 "项目"
- fontSize: 30px
- fontWeight: 700
- color: `rgb(255, 255, 255)`
- 位置: (88, 32), 60×36

### 创建项目按钮
- text: "创建项目"
- bg: `rgb(240, 255, 140)` (品牌色)
- color: `rgb(0, 0, 0)`
- padding: `8px 16px`
- borderRadius: `8px`
- fontSize: `14px`
- 位置: (1168, 102), 88×36

### 搜索框
- placeholder: "搜索项目"
- bg: `rgba(255, 255, 255, 0.1)`
- color: `rgb(255, 255, 255)`
- padding: `8px 36px`
- borderRadius: `8px`
- fontSize: `14px`
- 位置: (260, 100), 288×40

### 项目卡片
- classes: `bg-primary-5 border border-secondary rounded-2xl overflow-hidden hover:bg-primary-10 transition-colors cursor-pointer group`
- bg: `rgba(255, 255, 255, 0.1)` (bg-primary-5)
- border: `1px solid #F0FF8C` (border-secondary, 品牌色边框)
- borderRadius: `16px` (rounded-2xl)
- 尺寸: 220.8 × 169px
- overflow: hidden
- hover: bg 变深 (bg-primary-10)

### 卡片封面区
- classes: `relative aspect-video bg-primary-10`
- 比例: 16:9 (aspect-video)
- 含 SVG 占位图标 (60×60 圆角方形, 品牌色边框)
- 模式标签文字: "自由模式{N} 集"

### 卡片标题区
- classes: `relative px-4 py-2.5`
- padding: `10px 16px`
- 高度: 44px

### 卡片 H3 标题
- fontSize: 16px
- fontWeight: 600
- color: `rgb(255, 255, 255)`

### 操作按钮（3个, 仅 hover 显示）
- 编辑项目 (title="编辑项目")
- 设置封面图 (title="设置封面图")
- 删除项目 (title="删除项目")
- 都无文字内容，仅图标

## 11 个项目数据（verbatim）
| # | 标题 | 模式 | 集数 |
|---|------|------|------|
| 1 | 小福星 | 自由模式 | 60 集 |
| 2 | 我妈归来demo | 自由模式 | 1 集 |
| 3 | 清白入席 | 自由模式 | 1 集 |
| 4 | 二哈项目 | 自由模式 | 1 集 |
| 5 | 44 | 自由模式 | 1 集 |
| 6 | 未分类 | 自由模式 | 1 集 |
| 7 | 双姝项目 | 自由模式 | 1 集 |
| 8 | 7-2  9 -亮 | 自由模式 | 1 集 |
| 9-11 | (其余 3 个未完整提取) | | |

## 顶部状态栏（登录后）
- 消息按钮 (带图标)
- 积分显示 "积分 999463"
- 文档按钮 (圆形, 品牌色)
- 用户头像按钮 "欢"

## States & Behaviors

### 卡片 hover
- **Trigger**: mouseenter
- **State A**: bg `rgba(255,255,255,0.1)`
- **State B**: bg `rgba(255,255,255,0.05)` (bg-primary-10 更深)
- **Transition**: `transition-colors`
- **显示**: 3 个操作按钮（编辑/封面/删除）从隐藏变为可见

### 卡片点击
- **Trigger**: click
- **Action**: 进入项目编辑器（未验证具体路由）

### 创建项目按钮
- **Trigger**: click
- **Action**: 跳转创作页或弹出创建项目对话框

## Assets Needed
- 消息图标 SVG
- 积分图标 SVG
- 项目占位图标 SVG (卡片封面区)
- 编辑/封面/删除 3 个操作图标 SVG
- 搜索图标 SVG

## Text Content (verbatim)
- H1: "项目"
- 按钮: "创建项目" "项目类型筛选"
- 搜索: "搜索项目"
- 模式标签: "自由模式{N} 集"
- 操作按钮 title: "编辑项目" "设置封面图" "删除项目"
- 顶部: "消息" "积分 999463" "文档"

## Responsive Behavior
- Desktop (1280px): 5 列网格
- 待验证: tablet / mobile 布局

## 已知限制
- 项目类型筛选下拉菜单内容未提取
- 卡片点击后的编辑器页面未提取
- 创建项目按钮的具体行为未验证
