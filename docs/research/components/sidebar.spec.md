# 共享侧栏提取与实施 Spec（2026-10-25）

## 证据来源

- 线上页面：`https://bollo.video/zh/home`。
- 新增截图：`docs/design-references/bollo-audit/home-1440.png`、`home-390.png`。
- 既有登录后截图：`home-logged-in.png`、`project.png`、`library.png`、`tools.png`、`skills.png`、`script-market.png`。
- 桌面数据来自浏览器 `getComputedStyle()`；hover 在停留 250ms 后读取。

## B02 线上提取值

| 项目 | 桌面提取值 |
|---|---|
| 菜单 | 创作 / 项目 / 剧本 / 资产 / 工具 / Skills |
| 容器 | 64px 宽，`rgb(29, 32, 30)`，上下 padding 24px |
| 菜单项 | CSS 56×54px，`transform: scale(0.9)`，纵向 flex，gap 4px，圆角 12px |
| 默认文字 | `rgba(255, 255, 255, 0.54)` |
| hover | `rgba(255, 255, 255, 0.82)`，背景 `rgba(255, 255, 255, 0.05)` |
| 当前页 | `rgb(200, 255, 113)`，背景透明，无独立指示条 |
| 标签 | 11px / 12px，weight 700，居中 |
| 动效 | color / background-color / opacity 160ms |
| 图标容器 | 创作、项目、资产 24×24px；剧本、工具、Skills 16×16px |

线上新增图标资源：

- 剧本：`https://bollo.video/icons/icon_sidebar_scripts.svg`
- 工具：`https://bollo.video/icons/icon_sidebar_tools.svg`
- Skills：`https://bollo.video/icons/icon_sidebar_skills.svg`
- 创作当前态：`https://bollo.video/images/home-v2/ICON%20HL.svg`
- 项目/资产精灵图：`https://bollo.video/images/home-v2/ICON.svg`

本轮复用本地 `@/components/icons` 中已有的同类图标，不新增图片依赖；剧本使用 `ScriptIcon`，工具使用 `LayoutGridIcon`，Skills 使用 `SkillIcon`。

## 本地实施契约

1. `NAV_ITEMS` 只保留上述六项，顺序与线上一致。
2. 本地 href 依次为 `/home`、`/project`、`/script/market`、`/library`、`/tools`、`/skill`。
3. 当前页使用 `text-brand` 和透明背景，移除品牌色左侧指示条；非当前态保留语义化白色透明度与 hover 背景。
4. 移除 `PublishDialog`、发布按钮分支和不再使用的广场/发布导入，不删除 `/plaza`、`/publish` 页面或发布组件本身。
5. 保留 `w-[64px] md:w-[108px]` 外壳、Logo、底部工作区和 `/comic/* → 项目` 规则。
6. 保留 `next/link` 和 `aria-current="page"`；不添加页面内导航复制品。

## 已知边界

- `/script/market`、`/tools` 由优先级队列后续任务新建；本轮只建立导航映射，不宣称页面已经实现。
- Skills 暂用现有 `/skill`，避免产生不存在的新路由；后续专项任务再切换 `/skills?tab=skills`。
- 线上桌面 64px、移动抽屉与本地响应式外壳不同，属于项目硬约束下的已记录偏差。
- 本轮为主导航专项，不重做图标精灵、Logo、底部账户区或页面主体。

## 验收

- 组件测试覆盖六项顺序、href、当前页、广场/发布入口消失。
- `npx tsc --noEmit`、相关测试、`npm run check` 串行通过。
- 本地 1440px 与 390px 截图核对菜单；外壳差异按本 spec 记录。
