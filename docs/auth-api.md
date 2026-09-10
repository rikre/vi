# Auth API 接入契约

前端只访问同源 `/api/auth/*`。Next.js Route Handler 会把请求转发到
`AUTH_API_BASE_URL` 下的对应 `/auth/*` 接口，并统一返回 `{ data }` 或
`{ error: { code, message } }`。

## 上游接口

| 方法 | 路径 | 请求 / 说明 |
| --- | --- | --- |
| POST | `/auth/code/send` | `{ channel, target, countryCode? }` |
| POST | `/auth/login/code` | 上述字段 + `{ code }` |
| POST | `/auth/login/password` | 上述字段 + `{ password }` |
| POST | `/auth/wechat/qr` | 创建扫码会话 |
| GET | `/auth/wechat/status?sceneId=...` | 查询 `pending/scanned/expired/confirmed` |
| GET | `/auth/me` | 使用 `Authorization: Bearer <token>` 获取用户 |
| POST | `/auth/logout` | 注销当前 token |

登录接口返回字段支持 camelCase 和 snake_case：

```json
{
  "data": {
    "accessToken": "jwt",
    "expiresIn": 604800,
    "user": {
      "id": "10001",
      "nickname": "创作者",
      "avatarUrl": "https://...",
      "phone": "13800138000",
      "email": null,
      "credits": 2580,
      "tier": "普通用户"
    }
  }
}
```

微信二维码接口应返回 `sceneId`、可直接展示的 `qrUrl`、`expiresAt`
（毫秒时间戳）和可选的 `pollIntervalMs`。确认成功时，状态接口返回
`status: "confirmed"` 以及与普通登录相同的 session 字段。

## 环境配置

复制 `.env.example` 为部署环境变量。生产环境必须配置
`AUTH_API_BASE_URL`；模拟模式只在非生产环境生效，验证码为 `123456`，
密码为 `bollo123`，微信扫码约 5 秒进入已扫码、8 秒确认。

浏览器按产品要求把 access token 和用户信息保存在
`bollo.auth.session.v1`，同时 BFF 写入 HttpOnly token cookie 和不含敏感信息的
SameSite=Lax 路由标记 cookie，后者供 `src/proxy.ts` 做乐观路由拦截。业务数据接口仍需在服务端再次校验 token，
不能把 Proxy 当作最终授权边界。
