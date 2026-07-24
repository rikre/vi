# CreatePage Specification (`/zh/create`)

## Overview
- **Target file**: `src/app/create/page.tsx`
- **Screenshot**: `docs/design-references/bollo.video/create-desktop-clean.png`
- **Interaction model**: mixed (click-driven buttons + contenteditable input + hover cards)
- **Page title**: "VibeVideo IO | Start AI Video Creation"
- **Meta description**: "进入 VibeVideo 工作台，创建项目、选择创作模式，并以镜头级控制高效完成故事视频制作。"

## DOM Structure
```
locale-layout-container
└── flex.h-screen.bg-primary.overflow-hidden (#131313, 1280×633)
    ├── Sidebar (64px, shared component)
    └── main.route-transition-enter.flex-1.min-h-0.overflow-y-auto.scrollbar-hide (1216×633)
        └── 内容容器
            ├── 移动端提示 (hidden on desktop, "为获得最佳体验，请访问网页版")
            ├── 创作输入区
            │   ├── h1 "今天想创作什么？" (居中, 40px)
            │   ├── 输入框容器 (1094px wide)
            │   │   ├── contenteditable div (14px, 60% white)
            │   │   ├── 工具栏行
            │   │   │   ├── 上传剧本 button (12px, gray bg)
            │   │   │   ├── 风格选择 button
            │   │   │   ├── 场景 button
            │   │   │   ├── 16:9 button (默认未选中, 透明 bg)
            │   │   │   ├── 9:16 button (选中, #F0FF8C bg, 黑字)
            │   │   │   ├── 创作助理 button (gray bg)
            │   │   │   ├── 选择项目 button (gray bg)
            │   │   │   ├── 影棚模式 button (brand bg, 黑字)
            │   │   │   └── Send button (brand bg, 黑字, 圆形)
            │   │   └── 快捷入口行
            │   │       ├── AI拉片 (clickable div)
            │   │       ├── 剧本大师 (link)
            │   │       └── 儿童创作 (link)
            │   └── (输入区可能是一个卡片容器)
            └── 发现更多 section
                ├── h2 "发现更多"
                └── 卡片网格 (7张, 每张 224×248.875, 横向滚动或网格)
                    ├── 卡片: 水上同行 / 星际觉醒 / 先知弥迦 / 以斯帖记 / 授时中心 / 被爱，无需理由 / 心光
                    └── 每张卡: video + img (poster) + 渐变遮罩 + 标题

## Computed Styles (exact values from getComputedStyle)

### 全局
- body: `bg-primary` `#131313`, `color: #171717`, font `"HarmonyOS Sans SC Regular", sans-serif`
- main: `1216×633`, overflow-y-auto, scrollbar-hide, position static

### H1 "今天想创作什么？"
- fontSize: 40px
- fontWeight: 400
- lineHeight: 40px
- color: `rgb(23, 23, 23)` (#171717)
- textAlign: center
- margin: 0
- padding: 0
- position: y=128 (距顶 128px)

### 创作输入框 (contenteditable div)
- fontSize: 14px
- fontWeight: 400
- lineHeight: 20px
- color: `rgba(255, 255, 255, 0.6)` (60% 白)
- bg: transparent
- width: 1094px
- height: 86px
- position: y=258

### 按钮组样式（统一规律）

#### 灰色工具按钮 (上传剧本/风格选择/创作助理/选择项目)
- fontSize: 12px
- fontWeight: 500
- lineHeight: 16px
- color: `rgba(255, 255, 255, 0.6)`
- bg: `rgba(255, 255, 255, 0.05)`
- padding: `8px 12px`
- borderRadius: full (3.35544e+07px, 即完全圆角)
- display: flex, gap: 8px, alignItems: center
- 尺寸: ~96×32

#### 比例切换按钮 (16:9 / 9:16)
- fontSize: 12px / 500 / 16px
- padding: `4px 12px`
- borderRadius: full
- 未选中 (16:9): color `rgba(255,255,255,0.6)`, bg transparent
- 选中 (9:16): color `#000`, bg `#F0FF8C` (品牌色)
- 尺寸: 47.59×24

#### 影棚模式按钮 (主 CTA)
- fontSize: 14px / 500 / 20px
- color: `#000`
- bg: `#F0FF8C`
- padding: `6px 16px`
- borderRadius: full
- display: flex, gap: 6px
- 尺寸: 110×32

#### Send 按钮
- fontSize: 12px / 500
- color: `#000`
- bg: `#F0FF8C`
- padding: `8px 12px`
- borderRadius: full
- 尺寸: ~96×32

### 发现更多卡片
- 容器 classes: `w-full bg-gray-900 rounded-2xl relative cursor-pointer`
- bg: `oklch(0.21 0.034 264.665)` (gray-900)
- borderRadius: 16px (rounded-2xl)
- padding: 0
- width: 224px
- height: 248.875px
- aspectRatio: 0.9 / 1
- overflow: hidden
- position: relative
- 内部:
  - `<video>` (主视频源, mp4)
  - `<img>` (poster 图)
  - 渐变遮罩 div
  - 标题 div (含 h3)
  - 角标 div (Bollo logo 角标)

### 卡片标题 (h3)
- fontSize: 12px
- fontWeight: 500
- color: `rgb(255, 255, 255)`
- text: 各项目名

## 7 张卡片数据（verbatim）
| # | 标题 | 视频源 |
|---|------|--------|
| 1 | 水上同行 | https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1d3e7c6defd846249ed9b5aaf9981038/69a99f8e1f820539/outputs/final_video_1763566011.mp4 |
| 2 | 星际觉醒：岩石战神的太空绝地反击 | https://store.cdn.bollo.video/media/3e373f32289841fda24e32096f5a917e/6dc02e9b328ab2b2/outputs/final_video_1779181877.mp4 |
| 3 | 先知弥迦：从摩利设加特到伯利恒的公义与怜悯 | https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1d3e7c6defd846249ed9b5aaf9981038/54daf7d8058e4e40/outputs/final_video_1762230516.mp4 |
| 4 | 以斯帖记：波斯王宫里的生死豪赌与民族救赎 | https://store.cdn.bollo.video/media/66a43f7f7b25453b981ffb6803285a2a/3aa1fd7beab08226/outputs/final_video_1776509607.mp4 |
| 5 | 授时中心 | https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/686db70e930740d8a5698450e435ea45/4b62b9dc6bf0c060/outputs/final_video_1764765522.mp4 |
| 6 | 被爱，无需理由 | https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1d3e7c6defd846249ed9b5aaf9981038/0fdebea15dcb6bf7/outputs/final_video_1760507562.mp4 |
| 7 | 心光 | https://vibevideononprod.sfo3.cdn.digitaloceanspaces.com/media/1fccece2e713471392f9e773f7e02cbb/fe1130aed9d7ea83/outputs/final_video_1764655726.mp4 |

## 快捷入口
- AI拉片：`<div>` clickable, cursor pointer
- 剧本大师：`<a>` link
- 儿童创作：`<a>` link

## 顶部导航栏 (Sidebar 64px) 详细
- 容器: width 64px, bg `rgba(255,255,255,0.1)`, padding `24px 0`, flex column
- Logo: `<a href="/zh">`, classes `w-6 h-6 flex-shrink-0 mt-2`, 24×24, margin-top 8px
- 导航项 (首页/创作/工具/剧本/项目/资产): 
  - `<a>` tag, classes `flex flex-col items-center gap-1 cursor-pointer`
  - 24×32, color `#171717`, bg transparent
  - 路由见 PAGE_TOPOLOGY.md
- 文档按钮 (特殊):
  - classes `flex items-center color-secondary hover:color-secondary rounded-full`
  - color `#F0FF8C` (品牌色)
  - bg `rgba(255,255,255,0.1)`
  - padding 8px, margin 16px 0
  - borderRadius full
  - 40×28
- 登录: 同导航项样式, 24×36

## States & Behaviors

### 比例切换 (16:9 ↔ 9:16)
- **Interaction model**: click-driven
- **Trigger**: click on 16:9 or 9:16 button
- **State A (9:16 选中, 默认)**: 9:16 bg=`#F0FF8C` color=`#000`; 16:9 bg=transparent color=`rgba(255,255,255,0.6)`
- **State B (16:9 选中)**: 反之
- **Transition**: 需进一步验证（推测 CSS transition）

### 卡片 hover
- **Trigger**: mouseenter
- **State A**: 静态 poster 图显示
- **State B**: 视频开始播放（推测）
- **Transition**: 需进一步验证

### Send 按钮
- **Trigger**: click
- **Action**: 提交创作请求（需登录才能触发，未提取到实际行为）

## Assets Needed
- Logo SVG: `/zh` 链接内的 svg（需提取）
- 卡片视频: 7 个 mp4 (见上表)
- 卡片 poster: 7 张图片（需提取 img src）
- 上传剧本/风格选择/场景等按钮图标：内部 svg（需提取）
- 文档按钮图标：内部 svg（需提取）

## Text Content (verbatim)
- H1: "今天想创作什么？"
- 按钮: "上传剧本" "风格选择" "场景" "16:9" "9:16" "创作助理" "选择项目" "影棚模式" "Send"
- 快捷入口: "AI拉片" "剧本大师" "儿童创作"
- H2: "发现更多"
- 卡片标题: 水上同行 / 星际觉醒：岩石战神的太空绝地反击 / 先知弥迦：从摩利设加特到伯利恒的公义与怜悯 / 以斯帖记：波斯王宫里的生死豪赌与民族救赎 / 授时中心 / 被爱，无需理由 / 心光
- 导航: 首页 / 创作 / 工具 / 剧本 / 项目 / 资产 / 文档 / 登录
- 移动端提示: "为获得最佳体验，请访问网页版" "在桌面端使用完整功能创作 AI 视频"
- Cookie: "🍪 我们重视您的隐私" "拒绝非必要" "管理设置" "全部接受"

## Responsive Behavior
- Desktop (1440px): 主创作区居中，卡片网格 7 列横向排列
- Tablet (768px): 待验证
- Mobile (390px): 显示"为获得最佳体验，请访问网页版"提示，功能受限

## 已知限制
- 创作助理/影棚模式等按钮的真实点击行为需登录才能触发
- 卡片视频播放行为（hover 自动播放 or 点击播放）需进一步验证
- 风格选择/选择项目按钮的弹出面板内容需登录后才能查看
