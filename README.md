# bollo — AI 动画创作工作台

> 想象力，即刻呈现。一站式 AI 短剧/动画生产平台：从剧本、资产、分镜到成片发布的全流程工作台，内置完整的积分制商业化体系（充值 / 会员 / 团队席位）。

**技术栈**：Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · Vitest · Playwright

---

## 目录

- [核心功能](#核心功能)
- [商业化体系](#商业化体系)
  - [计费模型总览](#计费模型总览)
  - [积分充值](#积分充值)
  - [会员订阅（个人版）](#会员订阅个人版)
  - [团队版与席位加购](#团队版与席位加购)
  - [首充权益与二次转化](#首充权益与二次转化)
  - [收银台与支付流程](#收银台与支付流程)
  - [活动运营组件](#活动运营组件)
  - [商业化配置修改指引](#商业化配置修改指引)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [质量保障](#质量保障)

## 核心功能

### 创作流程

| 模块 | 路由 | 说明 |
|------|------|------|
| 创作空间 | `/project` `/create` | 项目列表与创建入口，localStorage 持久化 |
| 项目创建 | `/new` | 单 Modal 表单，三种创建模式（见下） |
| 项目工作台 | `/comic/[id]` | 按创建模式动态组合：剧本模式 5 Tab（概览/剧本/资产/分镜/成片）、自由模式 4 Tab、AI 重绘 4 步 Stepper |
| 剧本编辑器 | 工作台内 | 剧本编辑 + 一键提取资产（角色/场景/道具）模拟 |
| 资产管理 | 工作台内 | 资产 CRUD、批量生成、图片资产库 |
| 分镜工作台 | 工作台内 | 分镜编排、批量生视频任务模拟 |
| 成片组装 | 工作台内 | 片段拼接、字幕配置、导出模拟 |
| AI 重绘向导 | 工作台内 | 四步流程：原片 → 设定 → 分镜 → 视频 |
| 广场 | `/plaza` | 剧本广场，搜索/筛选/详情（`/plaza/script/[id]`） |
| 技能市场 | `/skill` | 技能浏览与筛选 |
| 资产库 | `/library` `/asset` | 公共资产库浏览 |
| 发布中心 | `/publish` | 多平台绑定与发布模拟 |
| 数字人 | `/agent` | 数字人卡片（悬停自动播放视频）、AI 试戏 / AI 试装对话 |
| 团队管理 | `/team` | 效能看板 / 团队 / 成员 / 流水四 Tab，团队版订阅引导入口 |

**三种项目创建模式**：

1. **剧本模式** — 上传剧本文件（`.txt` 自动读取内容存入 `scriptContent`），进入 5 Tab 工作台
2. **自由模式** — 指定集数（≥1）直接开工，进入 4 Tab 工作台
3. **AI 重绘** — 上传原片视频，提交按钮变为「创建重制项目」，进入 4 步 Stepper 工作台

## 商业化体系

所有定价数据集中在 `src/app/pricing/data.ts`，页面逻辑在 `src/app/pricing/page.tsx`，收银台组件为 `src/components/checkout-dialog.tsx`。

### 计费模型总览

**积分是平台统一算力货币**：`1 元 = 10 积分`。所有模型消耗统一扣积分（视频按秒、图片按张），生成失败不扣费。

三种获取方式与扣除顺序：

```
获取：充值（按量付费） / 会员订阅（每月发放） / 每日签到（赠送）
扣除顺序：赠送积分 → 会员积分 → 充值积分（优先消耗有效期短的，保障用户利益）
```

定价页双 Tab 设计（`/pricing?tab=credits|membership`，URL 参数为单一事实来源，支持深链）：
- **积分充值** — 按量付费心智，用多少买多少
- **会员订阅** — 订阅心智，月度积分 + 模型折扣 + 队列权益

### 积分充值

6 档锚定定价（`RECHARGE_TIERS`），加赠比例随档位递增：

| 档位 | 价格 | 到账积分 | 加赠 | 备注 |
|------|------|---------|------|------|
| 首充专享 | ¥10 | 150 | +50% | 终身一次，账号级权益 |
| 基础档 | ¥50 | 500 | — | |
| 入门档 | ¥100 | 1,100 | +10% | |
| 进阶档 | ¥300 | 3,450 | +15% | |
| 推荐档 | ¥600 | 7,200 | +20% | 标记「推荐」 |
| 大额档 | ¥950 | 10,500 | 送 1,000 等值 | |

活动期间充值加赠最高 70%（见定价页顶部模型特价 Banner）。

### 会员订阅（个人版）

3 档套餐 × 3 种周期（月付原价 / 季付 85 折 / 年付低至 49 折）：

| 权益 | 轻量版 | 专业版 | 旗舰版 |
|------|--------|--------|--------|
| 月付原价 | ¥133/月 | ¥399/月 | ¥1,064/月 |
| **年付折合月价** | **¥86/月（65 折）** | **¥239/月（60 折）** | **¥519/月（49 折）** |
| 年付立省 | ¥564/年 | ¥1,920/年 | ¥6,540/年 |
| 月度积分 | 1,620 | 3,920 | 9,240 |
| 视频模型折扣 | 最低 7 折 | 最低 6.7 折 | 最低 6.4 折 |
| 图片模型折扣 | 6.4 折 | 6.4 折 | 6.4 折 |
| 并发任务数 | 10 | 13 | 20 |
| 队列 | 标准 | 优先 | 专属 |
| 1080P / 4K | — / — | ✅ / — | ✅ / ✅ |
| 去水印 | ✅ | ✅ | ✅ |

设计要点：

- **年付为默认选中周期**，按钮直接展示数据驱动的折扣徽标（`yearlyDiscountLabel()` 取最低档折扣率，当前为「低至49折」，避免硬编码文案）
- 年付专属权益：加赠 2 个月等值积分 + 折扣锁定
- 订阅默认开启自动续费，「个人中心-订阅管理」可随时取消

### 团队版与席位加购

会员订阅 Tab 内切换「个人 / 团队」身份，团队版 = 同档个人版权益的席位化打包：

**计价公式**（定价策略：第 4 席起每席 = 个人版当前周期月价 × 1/2）：

```
团队月价 = 个人周期月价 × 2 + (席位数 − 3) × round(个人周期月价 × 0.5)
积分池/月 = 个人月积分 × (2 + 0.5 × (席位数 − 3))
席位范围：3 ~ 10 席
```

**示例**（专业版 · 年付 · 5 席）：

```
月价 = 239 × 2 + 2 × round(239 × 0.5) = 478 + 240 = ¥718/月 → 年付 ¥8,616
积分池 = 3,920 × (2 + 0.5 × 2) = 11,760 积分/月
```

功能实现：

- 席位步进器（`TEAM_BASE_SEATS=3` 下限 / `TEAM_MAX_SEATS=10` 上限，越界禁用）
- 价格、积分池、图片/视频额度随席位数实时联动
- 团队版含 3 席位起售，积分池全员共享、按席位线性扩容
- `/team` 页常驻引导卡片，CTA 直达 `/pricing?tab=membership`

### 首充权益与二次转化

- **一次性账号级权益**：¥10 得 150 积分（+50%），支付成功后写入 `localStorage`（key: `first_charge_done`），卡片按钮置灰显示「已使用」，永不复购
- **SSR 安全**：首充状态通过 `useSyncExternalStore` + 自定义事件订阅读取，服务端恒返回 `false`，杜绝 hydration error
- **二次转化闭环**：首充支付成功页展示「升级年费会员」CTA，一键跳转会员订阅 Tab

### 收银台与支付流程

三步标准流程（`CheckoutDialog` 组件，订单结构 `CheckoutOrder`）：

```
① 订单确认：商品标题 + 权益清单（积分/席位/折扣明细）+ 应付金额 + 支付方式
② 支付处理：1.2s 模拟网关（预留真实支付网关接入点，替换 pay() 即可）
③ 支付成功：结果提示 + 二次转化 CTA（仅首充场景）
```

- 支持微信支付 / 支付宝 / 余额支付三种方式（前端模拟）
- 团队订单自动展示「N 席位 · 含加席 ×M · 积分池」明细
- ESC / 遮罩关闭，支付处理中防误触

### 活动运营组件

| 组件 | 位置 | 策略 |
|------|------|------|
| 活动 Banner | `/home` 顶部 sticky | 关闭后写 Cookie 持久 1 年，不再打扰 |
| 活动弹窗 | `/home` 首屏 | 双页轮播，每日一次频控（localStorage 按日去重） |

两者均通过 `next/dynamic ssr:false` 加载，避免 SSR 访问 Cookie/localStorage。

### 商业化配置修改指引

**1. 调整充值档位** — 编辑 `src/app/pricing/data.ts` 的 `RECHARGE_TIERS` 数组：

```ts
{ id: "t600", price: 600, credits: 7200, bonusLabel: "+20%", recommended: true }
// id 唯一即可；bonusLabel/note/recommended 均为可选展示字段
```

**2. 调整会员档位/价格** — 编辑 `MEMBER_PLANS` 数组（`monthlyOriginal` 月付原价、`yearlyMonthly` 年付折合月价、`monthlyCredits` 月积分；年付折扣徽标由 `yearlyDiscountLabel()` 自动重算，无需手改文案）。

**3. 调整团队席位规则** — 修改以下导出：

```ts
export const TEAM_BASE_SEATS = 3;   // 基础席位数
export const TEAM_MAX_SEATS = 10;   // 席位上限
export function extraSeatPrice(plan, cycle) { ... }  // 加席单价（当前：个人价 × 0.5）
export function teamCredits(plan, seats) { ... }     // 积分池（当前：× (2 + 0.5 × 加席数)）
```

**4. 接入真实支付** — 替换 `src/components/checkout-dialog.tsx` 中的 `pay()` 模拟逻辑；订单结构已含席位/积分池字段，`onSuccess` 回调已区分首充标记。

## 快速开始

```bash
# 环境要求：Node.js ≥ 24
npm install
npm run dev        # http://localhost:3000
```

常用命令：

```bash
npm run dev        # 开发服务器
npm run build      # 生产构建
npm run lint       # ESLint 检查
npm run typecheck  # TypeScript 类型检查（strict）
npm test           # Vitest 单元测试（69 用例）
npm run test:e2e   # Playwright 端到端测试
npm run check      # lint + typecheck + build 全量门禁
```

## 项目结构

```
src/
  app/                    # Next.js App Router 路由
    pricing/              # 定价页（积分充值 + 会员订阅）
      data.ts             # ★ 商业化定价唯一数据源
      page.tsx            # 定价页 UI 与交互逻辑
    team/                 # 团队管理页（效能/团队/成员/流水）
    comic/[id]/           # 项目工作台（动态路由，按创建模式组合 Tab）
    plaza/                # 剧本广场
    home/                 # 首页（活动 Banner + 弹窗）
    ...
  components/
    checkout-dialog.tsx   # 收银台（三步支付流程）
    campaign-banner.tsx   # 活动 Banner（Cookie 1 年持久）
    campaign-popup.tsx    # 活动弹窗（每日频控）
    layout/               # 应用外壳与导航
    icons.tsx             # 统一图标出口
    ui/                   # shadcn/ui 基础组件
  hooks/                  # 业务 Hook（useScriptEditor / useAssetManager /
                          #   useStoryboard / useFilmAssembly / useRemakeStudio 等，均含测试）
  lib/
    mock-projects.ts      # 项目共享数据与类型
    project-store.ts      # 项目存取（localStorage）
  types/                  # TypeScript 接口定义
docs/
  research/components/    # 商业化 spec / QA 报告 / 商业测算报告
```

## 质量保障

- **TypeScript strict**，`tsc --noEmit` 零错误
- **69 个单元测试**覆盖全部核心业务 Hook（项目创建/剧本编辑/资产管理/分镜/成片组装/商业化定价）
- **ESLint** 零 error（含语义色 token 与 `set-state-in-effect` 等自定义规则防护）
- 设计规范以 `DESIGN.md` 为 single source of truth（YAML front matter → `globals.css` token 同步）

## License

MIT
