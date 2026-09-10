# 商业化控制台后台接口文档

管理后台 `/admin` 的生产级数据层与 API 说明。前端深色 UI 保持不变，数据源已从 localStorage 迁移到 PostgreSQL（Prisma ORM）。

## 1. 本地开发环境

```bash
# 1. 启动 PostgreSQL（docker-compose.yml）
docker compose up -d

# 2. 应用迁移 + 写入种子数据（可重复执行）
npm run db:setup

# 仅执行迁移 / 仅重新播种
npm run db:migrate
npm run db:seed
```

`.env` 关键变量（参考 `.env.example`）：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串（本地默认 `postgresql://bollo:bollo@localhost:5432/bollo_admin`） |
| `AUTH_API_BASE_URL` | 生产认证服务地址；服务端用它校验管理员角色 |
| `AUTH_MOCK_ENABLED` | 仅开发环境使用 mock 登录 |
| `KMS_API_BASE_URL` / `KMS_API_KEY` | 生产密钥管理服务（模型 API Key 写入目标） |
| `ADMIN_SECRET_ENCRYPTION_KEY` | 本地开发密钥加密适配器的 32 字节 base64 密钥 |

## 2. 数据库结构（12 个实体）

| 实体 | 说明 |
|------|------|
| `User` | 用户：手机/邮箱/昵称/状态(active/risk/disabled)、组织、会员套餐与到期、并发与月算力额度 |
| `AdminRole` / `UserRole` | 管理角色（6 类）与业务角色，服务端 RBAC 的唯一权威来源 |
| `Organization` | 企业客户：名称、状态、合同编号、席位数、企业积分、并发、月算力、到期时间 |
| `CreditAccount` | 四类积分账户（recharge/member/gift/enterprise）：balance、expiresAt、乐观锁 version |
| `CreditLedger` | 积分账本（grant/consume/refund/expire/recharge/membership_reset）：before/after 余额、幂等键，**只允许追加** |
| `Order` | 订单（recharge/membership/enterprise）：金额（分）、积分、渠道、商品与价格快照、支付/退款流水号 |
| `UsageLedger` | 任务用量流水：模型、价格快照、积分、供应商成本（分）、状态 |
| `Plan` / `PlanEntitlement` | 套餐：月付/年付价格（分）、月积分、席位、并发、队列、功能白名单、version |
| `RechargeTier` | 充值档位：售价（分）、基础积分、赠送积分、首充限制、version |
| `ModelConfig` | 模型配置：供应商、endpoint、secretRef + apiKeyLast4（不存明文）、计费、并发、健康度、version |
| `CreditPolicy` | 积分策略：汇率、扣减顺序、赠送过期天数、会员重置日、最低发放、失败退款、负余额开关 |
| `AdminAuditLog` | 管理审计日志：before/after 快照、IP、UA、幂等键，**只允许追加** |

不变量（由数据库触发器强制）：
- `CreditLedger` 与 `AdminAuditLog` 的 `UPDATE` / `DELETE` 被拒绝（append-only）
- 金额一律以“分”存储整数；积分一律整数，禁止浮点记账
- 历史订单与用量流水保存价格快照，改价不影响历史

## 3. API 清单（`/api/admin/*`）

| 方法与路径 | 权限 | 说明 |
|------------|------|------|
| `GET /api/admin/dashboard` | dashboard:view | 经营概览指标 |
| `GET /api/admin/users` | users:read | 用户列表（分页/搜索/状态筛选/时间范围） |
| `GET /api/admin/users/:id` | users:read | 用户详情 |
| `POST /api/admin/users/:id/grants` | users:grant | 定向加积分 / 配会员 / 配算力（写账本 + 审计） |
| `PATCH /api/admin/users/:id/status` | users:status | 用户状态变更（必填原因） |
| `GET /api/admin/orders` | orders:read | 订单列表（分页/筛选） |
| `GET /api/admin/usage-ledger` | usage:read | 用量流水列表 |
| `GET /api/admin/plans` / `POST /api/admin/plans` | plans:read / plans:write | 套餐列表 / 新建 |
| `GET`、`PATCH /api/admin/plans/:id` | plans:read / plans:write | 套餐详情 / 更新 |
| `GET`、`POST /api/admin/recharge-tiers` | recharge-tiers:read / write | 充值档位列表 / 新建 |
| `GET`、`PATCH /api/admin/recharge-tiers/:id` | 同上 | 档位详情 / 更新 |
| `GET`、`POST /api/admin/models` | models:read / models:write | 模型列表 / 接入新模型 |
| `GET`、`PATCH /api/admin/models/:id` | models:read / models:write | 模型详情 / 更新 |
| `POST /api/admin/models/:id/secret` | models:secret | 写入模型 API Key（仅返回 secretRef + last4） |
| `GET`、`PATCH /api/admin/credit-policy` | credit-policy:read / write | 积分策略读取 / 更新 |
| `GET /api/admin/audit-logs` | audit-logs:read | 审计日志列表 |

通用约定：
- 响应包络 `{ data }` 或 `{ error: { code, message } }`
- 所有列表接口支持 `page`、`pageSize`、`q`、`status`、`from`、`to`
- 所有写接口接受 `Idempotency-Key` 请求头（8–128 字符）；服务端以 `operatorId:key` 存储，重复请求幂等重放并返回 `replayed: true`
- 输入校验使用 zod（金额两位小数上限、HTTPS endpoint、正整数等），校验失败返回 400 `VALIDATION_ERROR`

## 4. RBAC 权限矩阵

| 角色 | 权限 |
|------|------|
| `platform_admin` | 全部权限（含模型密钥写入、积分策略修改） |
| `enterprise_admin` | 用户、企业权益（发放/状态）、套餐读写、模型读写（不含密钥） |
| `commercial_ops` | 套餐、充值档位、权益发放；**不能查看或修改模型密钥** |
| `finance` | 订单、用量流水、审计日志只读 |
| `support` | 用户与流水只读 + 小额补偿（仅 gift 账户、上限 5,000 积分） |
| `auditor` | 仅审计日志只读 |

鉴权实现（`src/lib/admin/session.ts` + `http.ts`）：
- 角色永远由服务端解析：生产模式通过 `AUTH_API_BASE_URL` 的 `auth/me` 返回的用户角色校验；开发 mock 模式解析 `bollo_auth` 签名 token 载荷
- **不信任**请求体、Cookie 之外或 localStorage 中的 userId / roles / 管理员标记
- 前端 `/admin` 页面的角色判断仅为 UX 引导，最终校验在 API 层

## 5. 关键业务规则

- **事务**：所有写操作（权益发放、状态变更、套餐/档位/模型保存、积分策略更新）在 `prisma.$transaction` 内完成
- **乐观锁**：积分余额更新走 `version` 字段 + `updateMany` 条件更新，冲突自动重试 3 次，仍失败返回 409
- **扣减顺序**：按 `CreditPolicy.deductionOrder` 依次扣减四类账户；`negativeBalanceAllowed=false` 时余额不足抛 `INSUFFICIENT_BALANCE` 并回滚
- **失败任务退款**：由 `CreditPolicy.failedTaskRefund` 控制
- **大额发放**：单次发放 ≥ 1,000,000 积分进入 `approvalStatus=pending`，记录 `approverId` 字段，不直接入账
- **审计**：所有权益、状态、价格、模型、策略变更写 `AdminAuditLog`（含 before/after 快照与 IP/UA）
- **模型密钥**：`POST /models/:id/secret` 仅接受明文一次，服务端写入 KMS（生产）或本地加密适配器（开发）；数据库只保存 `secretRef` + `apiKeyLast4`，任何 API 不返回明文

## 6. 前端接入

- `src/lib/admin-api-client.ts`：类型安全的 API 客户端（统一错误包络、自动携带 Idempotency-Key）
- `src/lib/admin-store.ts`：`useSyncExternalStore` 订阅模式保留；首次进入后台并行拉取全部数据，写操作成功后自动刷新
- 组件级：loading（骨架屏）/ error（重试卡片）/ empty / toast 状态齐备；用户状态变更与权益发放强制填写原因；API Key 表单提交后立即清空，界面只显示 `apiKeyLast4`

## 7. 测试

```bash
npm test   # vitest run
```

覆盖：RBAC 权限矩阵（rbac.test.ts）、输入校验（validation.test.ts）、积分扣减顺序与负余额（credit.test.ts）、store 写操作与幂等键传递（admin-store.test.ts）。全量 15 个文件 / 101 个用例通过。

## 8. 生产环境待配置项

| 类别 | 待办 |
|------|------|
| 支付平台 | 接入微信支付/支付宝；`Order.channel` 目前为种子模拟值，支付与退款回调需对接真实支付流水号 |
| KMS | 配置 `KMS_API_BASE_URL` / `KMS_API_KEY`（如火山引擎 KMS / Vault）；`src/lib/admin/secret-adapter.ts` 已预留生产适配分支 |
| 模型供应商凭据 | 各模型 `endpoint` + 真实 API Key（通过 `/api/admin/models/:id/secret` 写入，不落代码库） |
| 认证服务 | `AUTH_API_BASE_URL` 指向生产认证服务，`AUTH_MOCK_ENABLED=false`；确保 `auth/me` 返回管理员角色 |
| 数据库 | 生产 `DATABASE_URL`（托管 PostgreSQL）+ `prisma migrate deploy`；建议开启 PITR 备份 |
| 定时任务 | 赠送积分过期（`giftExpiryDays`）、会员积分重置（`memberResetDay`）需接入 cron 任务消费账本 |
| 审批流 | 大额发放 `pending` 记录目前无审批界面，需补充审批工作台或由 platform_admin SQL 审批 |
| 导出 | 财务对账导出（CSV/Excel）接口未实现，数据模型已支持 |
