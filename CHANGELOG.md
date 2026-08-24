# Changelog

本项目的所有重要变更记录。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [2026-08-23] 商业化体系上线 + 数字人/AI 重绘迭代

> 本次推送包含 2 个 commit（`56fb124`、`10fa33d`），共 26 个文件变更（+2,889 / -460）。
> 质量门禁：69 单元测试全通过 · typecheck 0 errors · ESLint 0 errors。

### 新增（Added）

**商业化体系（本次核心）**

- **定价页 `/pricing`**：积分充值与会员订阅双 Tab（URL 参数 `?tab=credits|membership` 深链）
  - 积分充值 6 档：¥10 首充专享（150 积分，账号级一次性）→ ¥950 大额档（10,500 积分），加赠 10%–70% 递增
  - 会员订阅 3 档 × 3 周期：轻量（¥133/月）、专业（¥399/月）、旗舰（¥1,064/月）；季付 85 折、年付低至 49 折（数据驱动计算，非硬编码）
  - 团队版席位加购：3–10 席步进器，计价公式 `个人月价 × 2 + (席位−3) × 个人月价 × 1/2`，积分池按 `×(2 + 0.5×加席数)` 线性扩容
- **收银台组件 `CheckoutDialog`**：三步标准流程（订单确认 → 支付处理 → 成功），支持微信/支付宝/余额支付（前端模拟，`pay()` 预留真实网关接入点）
- **首充权益与二次转化**：首充 ¥10 得 150 积分（+50%）账号级一次性；支付成功页「升级年费会员」CTA 一键跳转会员订阅
- **活动运营组件**：`campaign-banner`（关闭后 Cookie 持久 1 年）、`campaign-popup`（双页轮播 + 每日频控），均 `ssr:false` 避免 SSR 副作用
- **`/team` 团队版订阅引导卡片**：权益摘要 + CTA 直达定价页会员订阅 Tab
- **定价数据层 `src/app/pricing/data.ts`**：全部档位/价格/席位规则集中配置（修改定价只改这一个文件）

**数字人（Digital Artist）**

- 详情对话框 AI 试戏/AI 试装对话交互增强，数字人数据扩展（library/data.ts）

**AI 重绘向导（Remake Studio）**

- 映射步骤（mapping-step）与分镜步骤（storyboard-step）重构，`use-remake-studio` 能力扩展（+156 行逻辑，+61 行测试）

**文档**

- `README.md`：开源项目说明（功能矩阵、快速开始、项目结构、商业化配置修改指引）
- `docs/research/components/monetization.spec.md`：商业化产品 spec
- `docs/research/components/monetization.qa-report.md` / `qa-report-v2.md`：两轮 QA 迭代报告（含卡点分级与回归验证）
- `docs/research/components/monetization.business-plan.md`：商业测算报告（各业务线利润率、盈亏平衡使用率、政府补贴情景、breakage 模型）

### 修复（Fixed）

- **团队订单计价错误（P1）**：订阅按钮回调漏传 `seats` 参数，导致收银台恒按默认 3 席计价——选 5 席下单金额错误。已补传并实测验证（专业版年付 5 席 = ¥8,616，收银台五项断言全匹配）
- **会员卡片席位行不渲染**：引用了从未赋值的 `plan.seats` 死字段，改用步进器实时状态并显示「含加席 ×N」
- **`/pricing` hydration error**：首充状态改用 `useSyncExternalStore` 订阅 localStorage，服务端恒返回 `false`
- **季付团队价格舍入误差**：统一「个人价先 round，再按团队公式累加」的计价口径
- **移动端周期按钮换行**（375px）：加 `whitespace-nowrap`
- **年付折扣文案硬编码**：「67 折」静态文案改为 `yearlyDiscountLabel()` 数据驱动（实际最低 49 折）
- **`use-film-assembly.test.ts` 类型错误**（存量遗留）：`Project` 联合类型未收窄，按 `type === "short"` 模式修复并加前置断言防假阴性

### 变更（Changed）

- 个人中心下拉菜单：订阅入口跳转由旧弹窗改为 `/pricing` 定价页
- 侧边栏 / AppShell：清理旧订阅弹窗调用链路

### 移除（Removed）

- `src/components/subscription-dialog.tsx`：功能已由定价页 + 收银台完全替代

---

## [2026-08-03] R2.1–R2.8 功能环 + 设计规范

- R2.1 项目工作台-概览（`useProjectOverview` + 持久化）
- R2.2 剧本编辑器（`useScriptEditor` + 资产提取）
- R2.3 资产管理（`useAssetManager`，CRUD / 批量生成）
- R2.4 分镜工作台（`useStoryboard` + 批量生视频）
- R2.5 成片组装（`useFilmAssembly` + 导出）
- R2.6 AI 重绘向导（`useRemakeStudio` 四步拆分）
- R2.7 广场 / 技能 / 资产库（搜索 / 筛选 / 详情 + 孤儿清理）
- R2.8 发布中心（平台绑定）
- 设计 Token 体系：`DESIGN.md` 作为 single source of truth，语义色 token + ESLint 防护 + 移动端适配
- Vitest 测试套件接入

## [2026-07-28] 短剧工作台完整实现 + UI 统一重构

- 项目创建 Modal（剧本 / 自由 / AI 重绘三种模式）与项目列表
- 工作台按创建模式动态组合 Tab / Stepper
- 组件视觉统一（ring / 圆角 / 宇宙渐变背景体系）

## [2026-07-27] 剧本市场迭代 + 品牌色统一

- 剧本广场（`/plaza`）搜索、筛选与详情页
- 品牌色（brand token）全站统一，极简设计走查修复

## [2026-07-24] 创作工作台完整迭代

- 工作台骨架、概览 / 剧本 / 资产核心交互链路
- 动态路由 `/comic/[id]` 与项目数据层（`mock-projects.ts` / `project-store.ts`）

## [2026-07-23] 初始版本

- 项目脚手架：Next.js 16 + React 19 + TypeScript strict + Tailwind v4 + shadcn/ui
- 应用外壳、路由结构与基础组件库
