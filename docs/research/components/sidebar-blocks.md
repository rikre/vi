# 共享侧栏区块清单（2026-10-25）

基线：`bollo.video/zh/home`、`docs/design-references/bollo-audit/home-1440.png`、`home-390.png` 与登录后审计截图。旧 `HOME_SECTIONS.spec.md` 不作为本轮依据。

## B01 品牌入口

- 内容：Bollo 标识，点击回到创作首页。
- 状态：默认、hover、focus-visible。
- 本轮边界：保留现有实现，不改品牌资源与尺寸。

## B02 主导航（本轮任务）

- 顺序与真实文本：创作、项目、剧本、资产、工具、Skills。
- 线上路由：`/zh/home`、`/zh/project`、`/zh/script/market`、`/zh/library`、`/zh/tools`、`/zh/skills?tab=skills`。
- 本地路由：`/home`、`/project`、`/script/market`、`/library`、`/tools`、`/skill`；Skills 路由在后续 `/skill → /skills` 任务中处理。
- 交互模型：内部链接客户端导航；不是弹窗、tab 或 scroll 驱动。
- 单状态数：默认、hover、当前页、键盘 focus；六个入口共用同一交互模型。
- 当前页：线上以品牌色文本/图标表示；本地额外保留 `aria-current="page"`，并保留 `/comic/*` 归属“项目”的既有规则。
- 移除项：侧栏不再出现“广场”和“发布”；对应路由与页面代码不删除。

## B03 底部工作区

- 内容：文档/备案/登录或头像；本地已有管理、订阅、反馈、头像及账户菜单。
- 状态：各入口拥有独立弹窗或菜单状态。
- 本轮边界：不重排、不增删底部功能。

## B04 响应式形态

- 线上 1440px：64px 固定侧栏，图标在上、文字在下。
- 线上 390px：侧栏收起，页面左上方显示汉堡按钮。
- 本轮偏差：按项目硬约束保留本地 `w-[64px] md:w-[108px]`，不新增移动抽屉；390px 核对时单独记录，不宣称与线上外壳像素一致。
