# bolloAgent 本地恢复交接

## 已知事实（2026-10-25）

- 项目：bolloAgent（bollo AI 动画创作工作台）；包名 `bollo-agent`。Next.js 16.2.1、React 19、Node >=24。
- TRAE 路径 `/Users/rikre/Documents/trae_projects/vi` 是符号链接，实际目录 `/Users/rikre/Projects/Code/video-creation/bollo-agent`（2026-10-25 由 `bollo-animation-studio` 改名，GitHub 远程仓同步由 `rikre/vi` 改名为 `rikre/bollo-agent`，旧 URL 自动重定向）。
- 本次开始时 Git 在 `main` 的 `20636b3`，工作区干净。当前修复尚未提交；不要用 reset/checkout 覆盖。
- 本机内存 16GB，修复开始时 swap 已用约 4GB。磁盘剩余约 92GiB，不能把磁盘缓存体积当成运行内存。
- 旧 TRAE 任务反复启动 `npm run dev`、请求编译中的页面，并记录过 load 500+、72 个 Node 进程。该数字来自历史对话，尚不足以单独确定每个进程的归属，也不能据此断言只是其他应用导致。
- `.next` 产物约 2.5GiB、依赖约 45,792 个文件；已有 `.gitignore`，现补 `.trae/.ignore`。该补充规则按官方流程在重新构建代码索引后生效；本次未触发全量索引重建。聊天历史与 TRAE 数据库保留。

## 本次处理

- `npm run dev` 改用 `scripts/dev-safe.mjs`：固定端口，不自动换端口；用 Webpack；每个 Node 进程 V8 堆上限 2048MiB；原生线程池设为 2。
- 每 5 秒检查此启动器创建的进程组，RSS 超 4096MiB 或进程数超 24 时停止。此为采样式保护，不是全系统内存配额，也不是对所有原生分配的硬上限。
- `.dev-runtime/status-3000.json` 存当前采样及峰值。保护触发后必须检查原因，不自动重启。
- 生产构建命令保留；新增配置只在 `VI_SAFE_DEV=1` 时启用 Webpack 限并发。
- TypeScript 排除嵌套参考项目；编辑器文件监听与搜索排除产物；TRAE 常驻规则限制重试和上下文范围。

## 操作顺序

1. 先读本文件、`package.json` 与必要的 Git 状态，不要遍历依赖、素材或参考仓库。
2. `lsof -nP -iTCP:3000 -sTCP:LISTEN` 检查端口。若已有本项目服务，直接复用；若被其他项目占用，先说明占用者，不终止其他项目。
3. 如未启动，在项目目录执行 `npm run dev`，保留一个终端。后台启动需要记录启动器 PID、日志路径，不重复执行。
4. 等待 Ready，然后依次请求 `/home` 与 `/library`，每次有 60 秒超时。例如 `curl --max-time 60 -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/home`。不要并发压编译器。未登录访问 `/library` 可能返回 307 到 `/home?login=1&next=%2Flibrary`；必须报告登录跳转，不能将跳转后首页的 200 说成资产库页面验证通过。
5. 一次超时后先检查日志与资源状态；同一路径最多两次。Ready 或根路径 307 不能证明实际页面可用，实际页面返回 200 才算启动验证通过。
6. 停止服务时在其前台终端按 Ctrl+C；后台启动时向 `.dev-runtime/status-3000.json` 中核实过的 supervisorPid 发 SIGTERM。仅操作本项目进程。
7. 不在该开发服务运行时做 `npm run check` 或生产构建；按需要串行做 lint/typecheck。

## 给 TRAE 的新任务提示词

> 从新的会话恢复 vi 项目本地运行。先读取 docs/LOCAL_RECOVERY.md 和 .trae/rules/resource-budget.md，仅以其中事实、当前文件和实际检查为依据，不继承旧对话的命令重试循环。目标只限本地页面可访问。先检查 3000 端口；已有服务就复用，否则只启动一次 npm run dev。串行验证 /home 和 /library，检查 .dev-runtime/status-3000.json，简短汇报 HTTP 状态、资源采样及下一步。如果已经验证通过，直接汇报并停止，不重新安装依赖、不启动第二个服务、不扩展开发范围。失败时先查日志，同一路径最多重试一次；不要全仓扫描或读取 .env 的值。

## 本次验证

- 首页 `/home`：HTTP 200，首次请求 2.156 秒，浏览器已显示「一人一座梦工厂」首页。
- 未登录 `/library`：HTTP 307；跟随跳转后为 `/home?login=1&next=%2Flibrary`，HTTP 200。资产库登录后的内容尚未验证，不需要为启动恢复修改或绕过鉴权。
- 开发服务进程组：2 个进程；本轮启动与页面验证的 RSS 采样峰值 856MiB。该数字不包含 TRAE 和其他应用，也不代表以后所有页面的峰值。
- 重复运行启动器：以 EADDRINUSE 退出，原服务继续运行，未自动切换端口。
- TypeScript 检查和所改脚本/config 的 ESLint 检查已通过；未跑生产构建与全套测试。
- 启动日志 `.dev-runtime/dev.log`；实时 PID 与采样见 `.dev-runtime/status-3000.json`，重启后 PID 会改变。

- 资源保护测试：在隔离临时目录以轻量子进程和模拟超额 RSS 验证自动停止；3000 上的真实服务保持运行。
- TRAE 已新建「执行本地恢复验证检查」任务；可见已加载 resource-budget.md，只读取交接资料、状态文件，执行一次限时首页检查并结束，结果 HTTP 200。旧任务保留。

## 配置依据

- [TRAE 忽略文件：.trae/.ignore 与重建索引](https://docs.trae.cn/ide_ignore-files?lang=zh)
- [TRAE 项目规则](https://docs.trae.cn/ide_rules)
- Next.js 配置与 Webpack 选项按本项目 node_modules/next/dist/docs/ 中的 16.2.1 文档核对。
