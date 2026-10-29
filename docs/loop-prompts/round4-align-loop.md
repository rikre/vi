# Round 4 — UI/功能对齐 Loop

> **参考站**：https://bollo.video ｜ **本地**：/Users/rikre/Documents/trae_projects/vi
> **账本**：`docs/research/SITE_MAP.md` ｜ **对照截图**：`docs/design-references/bollo-audit/`

## 主提示词（复制整段即用）

```text
你是 UI/功能对齐 Agent。把本地项目（Next.js 16 + Tailwind v4 + shadcn/ui）与
https://bollo.video 逐页对齐：UI 像素一致、行为一致。

先读：docs/research/SITE_MAP.md（页面账本）、AGENTS.md、DESIGN.md（token 唯一来源）。

循环执行以下步骤，每轮只做一个页面，做完打满测试门槛才进下一轮：

1 选任务
  从 SITE_MAP.md 优先级队列取最上面非 ✅ 项。

2 提取
  浏览器打开线上对应页（登录页以 bollo-audit/ 截图为基线）。
  - 区块清单 → docs/research/components/<page>-blocks.md（B01…Bn + 交互模型 + 状态数）
  - 每区块记录：getComputedStyle 精确值、多状态前后样式、真实文本、图片
  - 交互模型判定：先慢滚动观察，再点击/悬停。scroll 驱动禁止建成 click 驱动。
  - 图片 → public/images/<page>/；SVG 图标 → src/components/icons.tsx

3 实现
  - 页面：src/app/<route>/page.tsx；区块组件：src/components/<page>/
  - 只用 DESIGN.md 语义 token，禁止硬编码色值、Tailwind 默认色板、lucide 直导
  - 套 app-shell，页面内不写导航；交互元素必须有真实 onClick，禁止死按钮
  - 需要交互的组件才加 "use client"；弹窗带 role="dialog" + aria-modal
  - mock 数据对齐线上展示字段

4 测试门槛（任一失败即修复重测）
  a. npx tsc --noEmit
  b. npm run check
  c. 走查：每 tab、每按钮、hover、空状态各过一遍
  d. 视觉：与 bollo-audit/ 截图逐区块 diff（1440 + 390），差异归类：
     spec 错→重提取 / 实现错→修 / 可接受→记录
  e. 行为：逐区块核对触发机制与 transition

5 记账
  - SITE_MAP.md 状态改 ✅ + commit 链接
  - 截图存 docs/qa-screenshots/<page>/（before/after）
  - 本文件末尾「Loop 日志」追加一行：任务 / 测试结果 / 遗留
  - 一任务一 commit

6 回到 1。

约束：
- 遵守 resource-budget：只用 npm run dev，验证完立即停服务；不并行构建+测试+dev
- /script/market 线上是 iframe → 本地原生重建 tab+筛选+列表+悬浮按钮
- 不删 /plaza 等线上已下线页面，标"待决策"
- 同一任务失败重试 ≤2 次，仍失败标 🚧 写明原因，跳下一任务

终止：队列全部 ✅ 且最后一轮测试门槛通过。
输出：完成页数 / 遗留偏差 / 待产品决策项。
```

## 状态机

```
选任务 → 提取 → 实现 → 测试 ─┬─ 通过 → 记账 → 下一任务
                            └─ 失败 → 修复（≤2 次）→ 🚧 挂起，跳下一任务
```

## 单步提示词

- 只提取：`执行 Round 4 STEP 2，目标页 <路由>，产出 spec 后停下等我确认`
- 只修复：`按 Round 4 规则修复以下差异并重跑测试门槛：<差异清单>`
- 刷新盘点：`执行 Auditor（round3 任务 A），刷新 SITE_MAP diff，不动代码`

## Loop 日志

| 轮次 | 任务 | 结果 | 测试 | 遗留 |
|------|------|------|------|------|
| R1 | 侧栏对齐 6 项 + /tools、/script/market 占位页 | ✅ | tsc ✅ build ✅ 三路由 200 ✅ 截图走查 ✅（docs/qa-screenshots/sidebar-round1-*.png） | 占位页待完整实现；/plaza、发布入口去留待产品决策 |
| R2 | `/tools` 工具工作台完整实现与三档 QA | ✅ 页面实现完成；五种创作模式、素材库、反馈中心及本地 mock 生成/上传/反馈均可交互；素材库按钮按真实参考图置于右侧上方 | 相关 13 项 Vitest ✅ tsc ✅ 改动文件 ESLint ✅ 生产构建 ✅ 真实 Chrome 交互 ✅ 1440/768/390 无横向溢出及素材/生成按钮遮挡 ✅（docs/qa-screenshots/tools-local-{1440,768,390}.png） | 共享侧栏桌面宽度与移动外壳仍和线上有差异；截图中的 Next.js 开发指示器非产品 UI；全量既有 lint 23 errors/66 warnings 与 Round 4 全站总门槛仍未通过；本轮未 commit |
| R3 | /home 创作首页整体复刻（Web Clone 路径） | ✅ 新增 4 组件 + 重写 page.tsx + 删除 8 个死文件；7 区块结构对齐（轮播/双模式/快捷入口/双热榜/IP库/艺人/剧场） | tsc ✅ build ✅ 路由 200 ✅ 功能走查 ✅（docs/qa-screenshots/home-round2-after.png） | 像素残差 32.6% 源于 AppShell 全局差异（侧栏 108 vs 72px、顶栏 56px vs 贴顶全宽、内容宽 1284 vs 1360px）——需一轮全局 shell 对齐 |
| R4 | 队列 #0 外壳对齐（侧栏/顶栏/内容宽度/移动抽屉） | ✅ 浏览器实测线上后对齐：侧栏 64px + `#1d201e`；删除 56px 全局顶栏；移动端 <768 改 112px 抽屉 + 42px 汉堡；`/home` 活动条上移为 43px 外壳 banner；首页容器实测 x=72 / w=1360；顺带修 390 底部工具栏换行溢出 | tsc ✅ 改动文件 ESLint ✅（0 error）Sidebar 7 项 Vitest ✅ build ✅ 生产构建路由表正常 ✅ 实测 localhost:3000：nav 64@43、main 1376、wrapper 1360、390 抽屉 112/首项 y=90、关活动条后汉堡回 top=16、点导航自动收起 ✅ 截图 shell-round4-* | ① 侧栏底部仍是订阅会员/帮助/登录，线上为文档/备案；② 移动活动条单行 43px，线上两行 59px；③ 首页快捷入口卡文案被素材图遮挡（R3 遗留）；④ 未 commit：工作区已有 27 项其他任务未提交改动（删页/后台），避免混提交；⑤ 全量 lint 仍有 5 个既定错误（admin-organizations/showcase-carousel/share-dialog），不在本轮改动内 |
