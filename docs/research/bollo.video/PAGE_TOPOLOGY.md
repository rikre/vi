# bollo.video 页面拓扑总览

## 站点信息
- **域名**：bollo.video（前身 oiioii.ai）
- **语言**：中文 (`/zh/` 前缀)
- **品牌色**：`#F0FF8C` (柠檬黄)
- **背景色**：`#131313` (深黑)
- **字体**：`"HarmonyOS Sans SC"` / `"PingFang SC"` fallback
- **无 Lenis/平滑滚动库**

## 全站布局
```
locale-layout-container (白底 #fff, 1280×633)
└── flex.h-screen.bg-primary.overflow-hidden (#131313)
    ├── Sidebar (64px, bg rgba(255,255,255,0.1))
    │   ├── Logo (/zh) 24×24 mt-2
    │   ├── 首页 (/zh/home)
    │   ├── 创作 (/zh/create)  ← 复刻目标 1
    │   ├── 工具 (/zh/tools)
    │   ├── 剧本 (/zh/my-scripts)
    │   ├── 项目 (/zh/comic)   ← 复刻目标 3
    │   ├── 资产 (/zh/library) ← 复刻目标 2
    │   ├── 文档 (圆形按钮, 品牌色文字)
    │   └── 登录 (/zh/login)
    └── Main (flex-1, overflow-y-auto, scrollbar-hide)
```

## 侧边栏样式（所有页共享）
- 宽度：64px
- 背景：`rgba(255, 255, 255, 0.1)`
- 内边距：`24px 0`
- 导航项：`flex flex-col items-center gap-1 cursor-pointer`，无背景，24×32
- 文档按钮（特殊）：圆形 `rounded-full`，padding `8px`，品牌色文字 `#F0FF8C`，bg `rgba(255,255,255,0.1)`，margin `16px 0`
- 选中态：根据 URL 匹配（需进一步验证 active 样式）

## 复刻目标 3 个页面
| 顺序 | URL | 用途 |
|------|-----|------|
| 1 | `/zh/create` | 创作工作台 — 主创作输入区 + 发现更多 |
| 2 | `/zh/library` | 资源库 — 资产管理 |
| 3 | `/zh/comic` | 项目 — 漫画/视频项目列表 |

## 全局 CSS 变量（推断）
```css
--primary: #131313;        /* 主背景 */
--primary-foreground: #171717; /* 主文字 */
--brand: #F0FF8C;          /* 品牌柠檬黄 */
--brand-foreground: #000000;
--secondary: #F0FF8C;      /* 次要色 = 品牌色 */
--card: rgba(255,255,255,0.05);
--card-foreground: rgba(255,255,255,0.6);
--border: rgba(255,255,255,0.1);
--muted: oklch(0.21 0.034 264.665); /* gray-900 */
```
