# 测试报告 — bollo AI 短剧创作工作台

> 测试日期：2026-08-01 | 环境：Next.js 16 + Tailwind v4 + Vitest 4.1 + Playwright 1.61

---

## 一、测试总览

| 维度 | 结果 |
|------|------|
| 单元测试 | **64/64 通过**（10 个测试文件，0 个失败） |
| E2E 测试 | **17/17 通过**（Playwright + Chromium） |
| 语句覆盖率 | **93.27%**（阈值 ≥90%） |
| 分支覆盖率 | **75.69%**（阈值 ≥70%） |
| 函数覆盖率 | **93.98%**（阈值 ≥90%） |
| 行覆盖率 | **95.77%**（阈值 ≥90%） |
| Lint 错误 | **0**（ESLint 色板规则已升级为 error 级别） |
| TypeScript | **0 错误** |
| Build | **成功**（16/16 静态页面生成） |

---

## 二、测试范围与用例明细

### 2.1 数据层：`project-store.ts`（16 用例）

| 测试文件 | 用例数 | 覆盖内容 |
|---------|--------|---------|
| `project-store.test.ts` | 12 | CRUD、订阅通知、episodeList/members 更新 |
| `project-store.tail.test.ts` | 4 | 尾部异常：localStorage 溢出（vi.spyOn）、损坏 JSON、ID 碰撞、SSR 无 window |

### 2.2 Hook 层：6 个自定义 Hook（40 用例）

| Hook | 用例数 | 覆盖内容 |
|------|--------|---------|
| `use-project-overview` | 7 | 进度计算、markAllEpisodesDone、saveOverview、邀请流程 |
| `use-script-editor` | 5 | 章节管理、isAnalyzingScript 自动关闭、extractAssets 分阶段进度 |
| `use-asset-manager` | 8 | CRUD、筛选、regenerateAsset、batchGenerate、bindVoice、extractAssets |
| `use-storyboard` | 7 | 镜头 CRUD、episodeProgress、generateShot、batchGenerate |
| `use-film-assembly` | 4 | exportVideo 三阶段、generateShotVideo、setSubtitles |
| `use-remake-studio` | 9 | 步骤导航、retryEpisode、batchGenerateMappings、generateShot、downloadVideo |

### 2.3 组件层：2 个页面组件（8 用例）

| 测试文件 | 用例数 | 覆盖内容 |
|---------|--------|---------|
| `publish/page.test.tsx` | 3 | 渲染 6 平台、绑定状态机（绑定中→已绑定）、按钮禁用态 |
| `plaza/script-card.test.tsx` | 5 | 渲染标题/价格/标签、立即购买/已售出、详情链接、试读按钮 |

### 2.4 E2E 层：Playwright + Chromium（17 用例）

| 页面 | 用例数 | 验证项 |
|------|--------|--------|
| `/comic` | 3 | 项目卡片列表、搜索过滤、点击导航 |
| `/comic/2` | 4 | 剧本模式 Tab 导航、剧本/资产/成片 Tab 切换 |
| `/comic/1` | 1 | AI重绘 stepper（原片/设定/分镜/视频） |
| `/library` | 3 | 5 个分类 Tab、艺人卡片、音色库切换 |
| `/plaza` | 4 | 三个 Tab、搜索过滤、项目接单、编剧推荐 |
| `/publish` | 2 | 6 平台渲染、绑定中→已绑定状态机 |

---

## 三、已实施的优化项

### 优化 1：组件级渲染测试（建议 1）
- 新增 `@testing-library/user-event` 依赖
- `publish/page.test.tsx` — 验证平台渲染和绑定状态机
- `plaza/script-card.test.tsx` — 验证卡片渲染、链接、售出状态

### 优化 2：Playwright E2E 测试（建议 2）
- 新增 `@playwright/test` 依赖 + Chromium 浏览器
- `playwright.config.ts` — 配置 baseURL、webServer 复用
- `e2e/app.spec.ts` — 17 个端到端测试覆盖 5 个页面
- `package.json` 新增 `test:e2e` 脚本

### 优化 3：advanceChain helper（建议 3）
- `src/test/helpers.ts` — 封装 `advanceChain` 和 `advanceExtractChain`
- 更新 `use-asset-manager.test.ts` 使用 helper，消除 fake timer 边界 flake

### 优化 4：ESLint 色板规则升级为 error（建议 4）
- `eslint.config.mjs` — `no-restricted-syntax` 和 `no-restricted-imports` 从 `"warn"` 升级为 `"error"`
- CI 阶段将阻断违规代码提交

### 优化 5：Vitest coverage 阈值门禁（建议 5）
- `vitest.config.ts` — 添加 coverage provider 和 thresholds（90%/70%/90%/90%）
- 覆盖率低于阈值时测试将失败

### 优化 6：vi.spyOn 安全 mock（建议 6）
- `project-store.tail.test.ts` — 改用 `vi.spyOn(Storage.prototype, "setItem")`
- 通过 `afterEach(vi.restoreAllMocks)` 自动恢复，避免测试间状态泄漏

---

## 四、测试文件清单

| 文件 | 用例数 | 类型 |
|------|--------|------|
| `src/lib/project-store.test.ts` | 12 | 单元 |
| `src/lib/project-store.tail.test.ts` | 4 | 单元 |
| `src/hooks/use-project-overview.test.ts` | 7 | 单元 |
| `src/hooks/use-script-editor.test.ts` | 5 | 单元 |
| `src/hooks/use-asset-manager.test.ts` | 8 | 单元 |
| `src/hooks/use-storyboard.test.ts` | 7 | 单元 |
| `src/hooks/use-film-assembly.test.ts` | 4 | 单元 |
| `src/hooks/use-remake-studio.test.ts` | 9 | 单元 |
| `src/app/publish/page.test.tsx` | 3 | 组件 |
| `src/app/plaza/script-card.test.tsx` | 5 | 组件 |
| `e2e/app.spec.ts` | 17 | E2E |
| **总计** | **81** | — |

---

## 五、剩余优化建议

| 优先级 | 建议 | 状态 |
|--------|------|------|
| 高 | 补充更多组件渲染测试（workbench、asset-tab、overview-tab） | 待实施 |
| 中 | E2E 测试加入 CI pipeline（GitHub Actions） | 待实施 |
| 中 | Playwright 多浏览器测试（Firefox、WebKit） | 待实施 |
| 低 | 视觉回归测试（Playwright screenshot comparison） | 待评估 |
