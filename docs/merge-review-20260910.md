# VI 合并记录

## 来源与交付

- 合并基线：远程 vi/main，ad336a1。
- vi2/main（f60de5a）是上述基线的祖先，无独有提交，不重复合并。
- 本地来源：/Users/rikre/vi，HEAD 9afa062 加未提交的认证、后台、Prisma、校园活动开发。
- 交付分支：codex/merge-vi-local-20260910。
- 交付工作目录：/Users/rikre/vi-merged。
- 原目录、未提交文件及其开发服务未覆盖。没有推送 GitHub。
- .env、IDE 私有配置、个人 Word 文件和临时二维码未加入合并提交。

## 冲突取舍

| 位置 | 合并结果 |
| --- | --- |
| package.json / lock | 保留远程二维码、Three.js，加入本地 Prisma、Zod、tsx；恢复测试和数据库脚本，重新生成锁文件 |
| 全局布局 | 单一 AppProviders → ToastProvider → AuthProvider |
| AuthProvider / LoginDialog | 使用本地 API 与会话恢复；兼容远程 isAnonymous/showLogin 调用；统一全局登录弹窗 |
| 旧 auth-api | 改为 shared auth-client 适配器，移除任意六位码可通过的旧模拟实现 |
| 侧边栏 / 账户菜单 | 保留会员、邀请、团队入口；加入真实会话头像昵称积分和管理员入口；恢复发布弹窗触发 |
| 个人资料 | 绑定会话昵称头像，退出按钮真正调用退出接口 |
| 活动 | 保留远程统一 campaign-data，将本地校园活动迁入共享数据源，保留独立校园活动页 |
| 页面保护 | 保留原受保护路由，补入远程新增的 /project 路由 |
| 登录回跳 | 仅允许同源路径，拒绝外部域名及协议跳转 |
| 开发工具 | Next.js 指示器移至右下，避免挡住侧栏账户按钮 |

## 验证

- TypeScript strict 检查通过。
- 单元测试 16 个文件、108 项全部通过，含新增登录返回路径测试。
- 生产构建通过，认证与管理员 API 路由均已包含。
- 新增 e2e/merge-auth.spec.ts：匿名入口、会员与校园活动入口、受保护页跳转、错误验证码拒绝、登录后返回、刷新保持、退出、匿名后台 API 拒绝。
- 三项浏览器回归全部通过；使用本地开发认证模式，不意味着真实短信、邮箱、微信服务已验收。

## 未被本次合并掩盖的问题

- 全量 ESLint 有 22 项既有错误，均位于与 origin/main 内容完全一致的四个文件：src/app/project/[id]/page.tsx、src/components/project/agent-status-panel.tsx、src/components/ranking/ranking-drawer.tsx、src/components/share-dialog.tsx。主要是默认色板与 effect 内同步 setState。未关闭规则或修改这些不相关模块。
- 新工作目录未复制私有 .env，也未启动数据库、迁移或写入数据。后台数据库读写尚未端到端验证；需要配置 DATABASE_URL 及实际认证服务。
- 继承的开发 mock 会话不是生产签名 JWT，且演示用户具备管理员角色；生产环境禁用 mock，并依赖真实认证上游验证。现有说明中称开发 token 为“签名 JWT”不准确。
- 会员购买、签到、分享及内容生成仍含原有演示逻辑，本次合并不将其升级为生产交易服务。

## 运行

Node 24+；npm ci；npm run db:generate；npm run dev -- --hostname 127.0.0.1 --port 3001。

测试：npm test；npm run typecheck；npm run build。

指定合并版执行浏览器测试：PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 npm run test:e2e -- e2e/merge-auth.spec.ts --workers=1。
