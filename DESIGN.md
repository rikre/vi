---
version: alpha
name: bollo
description: Dark-first AI 短剧/漫剧创作工作台。荧光柠檬品牌色 + 深灰层级表面 + 语义状态色。
colors:
  primary: "#c8ff71"
  primary-foreground: "#11130f"
  secondary: "#d4ff85"
  background: "oklch(0.18 0 0)"
  surface: "oklch(0.23 0 0)"
  surface-elevated: "oklch(0.27 0 0)"
  foreground: "#ffffff"
  muted-foreground: "oklch(1 0 0 / 0.58)"
  border: "oklch(1 0 0 / 0.1)"
  success: "oklch(0.72 0.15 145)"
  warning: "oklch(0.80 0.15 85)"
  danger: "oklch(0.65 0.22 25)"
  info: "oklch(0.78 0.10 220)"
  cyan: "oklch(0.93 0.1 200deg)"
typography:
  h1:
    fontFamily: MiSansVF
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: MiSansVF
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: MiSansVF
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: MiSansVF
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: MiSansVF
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: Geist Mono
    fontSize: 0.8125rem
rounded:
  sm: 7px
  md: 10px
  lg: 12px
  xl: 17px
  2xl: 22px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: 10px 16px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "oklch(1 0 0 / 0.08)"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 8px 12px
  button-secondary-hover:
    backgroundColor: "oklch(1 0 0 / 0.12)"
    textColor: "{colors.foreground}"
  card:
    backgroundColor: "#141414"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: 20px
  input:
    backgroundColor: "oklch(1 0 0 / 0.06)"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 10px 16px
  badge-success:
    backgroundColor: "oklch(0.72 0.15 145 / 0.15)"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-warning:
    backgroundColor: "oklch(0.80 0.15 85 / 0.15)"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-danger:
    backgroundColor: "oklch(0.65 0.22 25 / 0.15)"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-info:
    backgroundColor: "oklch(0.78 0.10 220 / 0.15)"
    textColor: "{colors.info}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  tag-ref:
    backgroundColor: "oklch(0.93 0.1 200deg / 0.1)"
    textColor: "{colors.cyan}"
    rounded: "{rounded.full}"
    padding: 2px 6px
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.border}"
  tab-active:
    backgroundColor: "oklch(1 0 0 / 0)"
    textColor: "{colors.foreground}"
  tab-inactive:
    backgroundColor: "oklch(1 0 0 / 0)"
    textColor: "{colors.muted-foreground}"
  popover:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: 8px
---

## Overview

bollo 是一个 dark-first 的 AI 短剧/漫剧创作工作台。视觉语言：**深灰层级表面 + 荧光柠檬品牌色 + 极简信息密度**。

核心原则：
- 深色为默认且唯一主题（无 light mode）
- 品牌色 `#c8ff71` 是页面中唯一的高饱和交互色，仅用于主操作、激活态、进度
- 表面通过明度层级区分（background → surface → surface-elevated），而非边框
- 所有状态色必须使用语义 token，禁止 Tailwind 默认色板

## Colors

| Token | 值 | 用途 |
|-------|-----|------|
| `brand` | `#c8ff71` | 主按钮、激活 tab、进度条、品牌强调 |
| `brand-foreground` | `#11130f` | 品牌色上的文字（黑底柠檬） |
| `background` | `oklch(0.18 0 0)` | 页面底色 |
| `surface` | `oklch(0.23 0 0)` | 侧边栏、面板 |
| `surface-elevated` | `oklch(0.27 0 0)` | 弹层、浮起卡片 |
| `success` | `oklch(0.72 0.15 145)` | 已完成、已生成、已绑定 |
| `warning` | `oklch(0.80 0.15 85)` | 生成中、上传中、进行中 |
| `danger` | `oklch(0.65 0.22 25)` | 失败、删除、错误 |
| `info` | `oklch(0.78 0.10 220)` | 场景/道具标签、信息提示 |

**禁止**：`text-red-400`、`bg-green-500` 等 Tailwind 默认色板。ESLint 已配置 `no-restricted-syntax` 规则拦截。

## Typography

- **字体栈**：`MiSansVF → Google Sans Flex → PingFang SC → system-ui`
- **等宽**：`Geist Mono`（仅代码/数据场景）
- 页面标题 32px/bold，区块标题 16-18px/semibold，正文 13-14px，辅助文字 11-12px
- 中文排版：行高 ≥ 1.5，字间距默认，不加 letter-spacing

## Layout

- 列表页 max-width：`1400px`（`max-w-[1400px]`）
- 详情页 max-width：`960px`（`max-w-[960px]`）
- 页面水平 padding：`24px`（`px-6`）
- 卡片网格 gap：`16px`（`gap-4`）
- 移动端侧边栏收起为 `64px`（`w-[64px] md:w-[108px]`）

## Elevation & Depth

- 层级通过背景明度表达，**不使用 box-shadow**（除品牌按钮的 `shadow-brand/20` 光晕）
- 卡片边框：`ring-1 ring-white/[0.08]`（1px 白色 8% 透明度）
- 弹层遮罩：`bg-black/80 backdrop-blur-sm`
- hover 升起：`hover:-translate-y-0.5` + `hover:ring-white/20`

## Shapes

- 基础圆角 `--radius: 0.75rem`（12px）
- 按钮：主操作用 `rounded-full`（胶囊），次操作用 `rounded-lg`
- 卡片：`rounded-2xl`（≈22px）
- 头像/图标容器：`rounded-xl` 或 `rounded-full`
- 输入框：`rounded-lg` 或 `rounded-xl`

## Components

### Button

- **Primary**：`bg-brand text-black rounded-full h-9 px-4 text-[13px] font-semibold`，hover 加亮
- **Secondary**：`bg-white/[0.08] text-white rounded-lg`，hover `bg-white/[0.12]`
- **Ghost/Icon**：`bg-white/[0.04] ring-1 ring-white/[0.08] rounded-full size-8`
- 禁用态：`opacity-60 cursor-not-allowed`

### Card

- 容器：`bg-[#141414] ring-1 ring-white/[0.08] rounded-2xl p-5`
- hover：`hover:-translate-y-0.5 hover:ring-white/20 transition-all duration-300`

### Status Badge

- 结构：`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium`
- 带 `size-1.5 rounded-full` 状态圆点
- 颜色映射：已完成→`text-brand bg-brand/10`，进行中→`text-warning bg-warning/10`，失败→`text-danger bg-danger/10`

### Tab

- 激活：`text-white` + 底部 2px `border-brand` 或渐变下划线
- 未激活：`text-white/45 hover:text-white/75`

### Input

- `bg-white/[0.06] border-0 rounded-xl h-12 pl-12 text-[15px] focus:ring-2 focus:ring-brand/30`

## Do's and Don'ts

**Do:**
- 使用语义 token：`text-brand`、`text-danger`、`bg-success/10`
- 图标统一从 `@/components/icons` 导入
- 卡片 hover 用 translate + ring 变化，不用 shadow
- 状态用 badge 组件（圆点 + 文字），不用纯色文字

**Don't:**
- ❌ 使用 Tailwind 默认色板（`red-400`、`green-500`、`blue-600`）
- ❌ 从 `lucide-react` 直接导入图标
- ❌ 使用 `box-shadow` 做层级（除品牌光晕）
- ❌ 引入 light mode 或白色背景
- ❌ 在品牌色按钮上使用白色文字（必须用 `text-brand-foreground` 即近黑）
