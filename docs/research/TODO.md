# TODO 板 — 全库质量审查 + 功能校验（2026-10-25）

> 来源：代码质量审查（lint/tsc/死代码/一致性）+ 全站功能走查（8 路由浏览器实测）+ AppShell 对齐遗留。
> 规则：P0 阻断体验/正确性 → P1 结构性债务 → P2 打磨项。完成后划线并记日期。

## P0 — 严重（视觉主体缺失 / lint error / 死按钮）

- [ ] **图片系统性裂图**：/library(6/6)、/skill(46/49)、/plaza(16/16) 卡片封面全部加载失败。根因：源码 10 处硬编码 `console.enterprise.trae.cn/api/ide/v1/text_to_image` 外部 API（如 `src/app/library/data.ts:390`）。**修法：批量下载为本地静态资源放 `public/images/`，替换 URL**。规模 M
- [ ] **死按钮**：/library 音色库"使用音色"点击无任何反馈。**修法：加 toast 或跳转**。规模 S
- [ ] **lint 23 errors 清零**：集中在 `src/components/project/agent-status-panel.tsx` + `src/app/project/[id]/page.tsx`，20 处 `text-red-4/bg-red-5/amber-4` 硬编码色板 → 换语义 token。规模 S
- [ ] **setState-in-effect 3 处**：`ranking-drawer.tsx:370`、`share-dialog.tsx:54` 等 → 改事件回调重置。规模 S

## P1 — 结构性债务（死代码 2400 行 / 大文件 / 数据层）

- [ ] **死代码链删除（约 2400 行，占全库 9%）**：library 5 文件（987 行）+ plaza 4 文件（784 行）+ 孤儿组件 4 个（683 行：account-drawer/publish-dialog/redeem-dialog/team-invite-dialog）。注意 `script-card.test.tsx` 测的是死代码，同步处理。规模 S
- [ ] **大文件拆分**：library/page.tsx(1355) → 拆子组件；project/page.tsx(1166)；account-dialog.tsx(1010) 拆 AiWatermarkDialog。规模 M
- [ ] **双轨实现收敛**：project/[id]/page.tsx 内部重实现 vs `src/components/project-detail/*`，二选一。规模 L
- [ ] **mock 数据集中化**：skill/asset/publish/team 页面内联 mock → 迁 `src/lib/`（对齐 plaza-data 模式）；Script 类型双形态统一进 `src/types/`。规模 M
- [ ] **AppShell 全局对齐**（R3 遗留）：侧栏 108→72px、顶栏 56px→贴顶全宽、内容宽 1284→1360px。先改 DESIGN.md token 再改 sidebar.tsx。规模 M
- [ ] **图片懒加载**：19 处缺 `loading="lazy"`；3 处 next/image。规模 M

## P2 — 打磨

- [ ] /script/market 占位页 → 完整实现（已在 Round 4 队列）
- [ ] /project 搜索无结果缺空态提示
- [ ] /pricing 权益文案"限时不限"疑缺字 → "限时不限量"
- [ ] /home IP库卡片 9-11 链接循环复用（mock 数据循环）→ 改为不可点或补足数据
- [ ] icons.tsx 8 个未引用图标删除（含本轮新加但未用的 ToolsIcon）
- [ ] 6 处 `href="#"` 死链接（project/new、zaohua）
- [ ] 16 处 `key={index}` → 稳定 id
- [ ] 弹窗双体系收敛：26 处手写 overlay → ui/modal
- [ ] zaohua three.js 静态引入 → next/dynamic；17 页整页 "use client" 拆边界
- [ ] 17 处 unused vars + 2 处失效 eslint-disable

## 商业化模块（管理后台）专项 — 见下方调研结论

- [ ] 本项目商业化面（pricing/积分/订阅/收银台）当前为纯前端 mock，无后端。**决策项：是否要接真实商业化内核**（权限/审计/多租户/订单状态机），还是保持演示形态。待产品决策。

---
*功能走查基线：8 路由全 200；交互正常项 —— home 4/4、project 6/6、tools 5/5、pricing 4/4、plaza 3/3、skill 3/3、library 4/5。*
