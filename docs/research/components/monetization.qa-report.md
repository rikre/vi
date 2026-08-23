# 商业化功能 QA 迭代报告（Monetization QA Report）

> 报告日期：2026-08-17 | 版本：V1（发布候选）
> 测试对象：商业化体系 R2 全链路（首页流量层 + `/pricing` 定价页 + 支付链路）
> 关联文档：[monetization.spec.md](./monetization.spec.md)
> 执行角色：QA 走查（测试工程师）→ 分级评审（架构师/系统工程师）→ 分优先级迭代修复 → 回归验证

---

## 一、结论速览

| 维度 | 结果 |
|------|------|
| 阻塞问题（P1） | **0 个** |
| 功能问题（P2） | 1 个 → **已修复并回归通过** |
| 体验问题（P3） | 3 个 → **已修复并回归通过** |
| 核心商业流程 | 首充支付 / 会员订阅 / 价格联动 / FAQ / 频控持久化 **全部通过** |
| 质量门禁 | lint **0 errors**；typecheck 仅剩 1 个既有无关错误（`use-film-assembly.test.ts`） |
| 发布结论 | **可发布** |

---

## 二、测试范围与环境

### 2.1 范围

| 模块 | 覆盖点 |
|------|--------|
| 首页流量层 | 吸顶通告栏（文案/CTA/关闭/Cookie 持久化）、活动弹窗（自动弹出/2页轮播/频控每日1次/CTA跳转） |
| `/pricing` 定价页 | 特价 banner、积分充值 6 档、会员订阅（个人/团队 × 月/季/年 × 3 档 + 权益矩阵）、FAQ 手风琴 |
| 支付链路 | 统一收银台（订单确认 → 3 种支付方式 → 支付中 → 成功）、首充终身一次标记、支付成功引导文案 |
| 兼容性 | 桌面 1440px + 移动端 375px 视口 |
| 稳定性 | Console error 级别日志、React hydration 一致性 |

### 2.2 环境与方法

- 环境：macOS · Chrome · `localhost:3000`（Next.js dev server）
- 方法：浏览器自动化全流程走查（截图取证）→ 问题分级 → 逐 loop 修复 → 硬刷新/状态注入回归验证
- 证据：走查截图 `qa-*.png` 系列 + 回归 console 日志与 DOM 断言

---

## 三、问题清单与分级评审

> 分级标准：P1 阻塞发布 / P2 功能缺陷（影响主流程或稳定性）/ P3 体验优化

### P2-1　`/pricing` 首充状态 SSR/CSR 不一致，触发 React Hydration Error

| 项 | 内容 |
|----|------|
| 严重程度 | **P2**（功能缺陷：error 级日志 + 已首充用户首屏闪烁 + SSR 失效） |
| 根因 | `useState` 初始化器直接读取 `localStorage`，该组件参与 SSR。服务端恒渲染「首充专享·可点击」，已首充用户客户端渲染「已使用/disabled」，二者不一致触发 hydration error 并整树客户端重建 |
| 复现 | 完成首充 → 硬刷新 `/pricing` → Console 出现 `Hydration failed because the server rendered text didn't match the client` |
| 架构评审 | 属「客户端外部状态直读」反模式；对照组：通告栏/弹窗已用 `dynamic ssr:false` 隔离，pricing 未做同等处理 |
| 解决方案 | 重构为 `useSyncExternalStore`：服务端快照恒 `false`（与 SSR 输出一致），客户端订阅 `first-charge-changed` 事件读取 localStorage。React 官方推荐的 SSR 安全外部状态模式，保留 SSR 同时消除 mismatch |
| 修复位置 | `src/app/pricing/page.tsx` |

### P3-1　团队版季付价格舍入误差，违反「团队=个人×2」联动

| 项 | 内容 |
|----|------|
| 严重程度 | P3（数据准确性） |
| 根因 | 计价顺序错误：先 `teamify` 翻倍原价，再 `Math.round(×0.85)`。旗舰版季付：round(2128×0.85)=1809 ≠ 904×2=1808，差 ¥1 |
| 解决方案 | 统一口径「个人价先 round，团队价 = 个人 round 后 ×2」；`teamify` 不再翻倍价格字段，仅翻倍积分池/图片/视频额度 |
| 修复位置 | `src/app/pricing/page.tsx` `cyclePrice()`、`src/app/pricing/data.ts` `teamify()` |

### P3-2　375px 移动端周期切换按钮文案折行

| 项 | 内容 |
|----|------|
| 严重程度 | P3（视觉体验） |
| 根因 | 月付/季付/年付按钮内「label + 折扣小字」在窄屏折成两行 |
| 解决方案 | 按钮增加 `whitespace-nowrap` |
| 修复位置 | `src/app/pricing/page.tsx` 周期切换按钮 |

### P3-3　「67折」文案与实际年付折扣不符

| 项 | 内容 |
|----|------|
| 严重程度 | P3（合规/文案准确性） |
| 根因 | 文案硬编码「最低67折」，但按数据实算：轻量 86/133≈65折、专业 239/399≈60折、旗舰 519/1064≈49折，均低于 67 折，存在价格宣传合规风险 |
| 解决方案 | 文案改数据驱动：`yearlyDiscountLabel()` 实时取最低档折扣渲染「低至49折」；周期切换按钮、首充成功引导文案全部联动；spec 同步更新 |
| 修复位置 | `src/app/pricing/page.tsx`、`docs/research/components/monetization.spec.md` |

### 附加需求（同轮交付）：会员权益矩阵强化

- 背景：产品反馈原权益维度不足，参照竞品（OiiOii）权益展示
- 新增 5 维权益：**最多约 N 张图片 / 最多约 N 秒视频 / 4K 超清导出（旗舰专属）/ 更稳定的模型服务 / 生成队列（标准/优先/专属）**
- 数据层新增 `maxImages / maxSeconds / hd4k / queue / stableService` 字段，团队版额度同步 ×2
- spec 权益矩阵表已同步

---

## 四、迭代 Loop 记录

| Loop | 优先级 | 内容 | 状态 |
|------|--------|------|------|
| Loop 1 | P2 | `useSyncExternalStore` 重构首充状态，消除 hydration error | ✅ 完成 |
| Loop 2 | P3 | 价格口径统一「先 round 后 ×2」，消除舍入误差 | ✅ 完成 |
| Loop 3 | P3 | 周期按钮 `whitespace-nowrap` | ✅ 完成 |
| Loop 4 | P3 | 折扣文案数据驱动化 + spec 同步 + 权益矩阵强化 | ✅ 完成 |
| Loop 5 | — | 全量回归验证（见下章） | ✅ 通过 |

---

## 五、回归验证结果

| # | 验证点 | 方法 | 结果 |
|---|--------|------|------|
| 1 | 首充全流程 | 点击首充档 → 收银台（金额/权益/微信/支付宝/余额）→ 支付宝 → 支付成功（含数据驱动引导文案）→ 完成 | ✅ 通过 |
| 2 | **P2-1 修复后 hydration** | 首充后硬刷新：SSR HTML 渲染「首充专享」→ 客户端正确切换「已使用」disabled；console 过滤无任何 hydration/React error，无 Next.js 错误浮层 | ✅ 通过 |
| 3 | **P3-1 价格** | 团队+季付：旗舰 **¥1808**（原 ¥1809）、专业 ¥678、轻量 ¥226，均 = 个人 round ×2 | ✅ 通过 |
| 4 | **P3-2 移动端** | 375px 下三周期按钮均 36px 单行高度 | ✅ 通过 |
| 5 | **P3-3 文案** | 年付按钮显示「低至49折」；首充成功文案同步 | ✅ 通过 |
| 6 | 权益矩阵 | 新权益行（图片/视频张数、4K、稳定服务、队列）全部渲染；团队积分池 ×2 与 3 席位文案正常 | ✅ 通过 |
| 7 | 首充持久化 | 支付后首充档置灰「已使用」，跨刷新仍生效 | ✅ 通过 |
| 8 | 通告栏 Cookie 持久化 | 关闭后刷新不再出现 | ✅ 通过（首轮走查） |
| 9 | 弹窗频控 | 每日 1 次，2 页轮播、CTA 跳转正常 | ✅ 通过（首轮走查） |
| 10 | 移动端布局 | 375px 无横向溢出（scrollWidth=clientWidth） | ✅ 通过（首轮走查） |

**Console 噪音说明**：走查中捕获的 error 级日志（`vconsoleAppInfo` / `volcfContext`）均来自测试环境注入的第三方 SDK，与应用代码无关；干净浏览器环境不出现。

---

## 六、质量门禁

| 检查项 | 结果 |
|--------|------|
| ESLint | 0 errors（51 warnings 均为既有存量，与本次改动无关） |
| TypeScript | 仅剩 1 个既有无关错误：`use-film-assembly.test.ts`（历史遗留，另行处理） |
| 页面可用性 | `/home`、`/pricing` 均 200，端到端流程回归通过 |

---

## 七、遗留事项与后续建议

| 优先级 | 事项 | 说明 |
|--------|------|------|
| 中 | `use-film-assembly.test.ts` 类型不匹配 | 既有遗留问题，与本轮商业化无关，建议单独排期 |
| 中 | R3 埋点闭环 | 弹窗曝光/CTR、各档点击分布、首充→年费升级率、支付漏斗（见 spec 第 4 章） |
| 低 | 真实支付网关接入 | 当前为前端模拟链路（收银台 `pay()` 为模拟网关），接入时替换 `checkout-dialog.tsx` 的 `pay()` 即可 |
| 低 | 价格弹性 A/B | 折扣力度、首赠比例的实验设计（spec R4） |

---

## 附：涉及文件清单

| 文件 | 变更类型 |
|------|----------|
| `src/app/pricing/page.tsx` | 修复 P2-1/P3-1/P3-2/P3-3 + 权益矩阵强化 |
| `src/app/pricing/data.ts` | 权益字段扩展 + `teamify` 口径调整 |
| `docs/research/components/monetization.spec.md` | 折扣文案与权益矩阵同步 |
