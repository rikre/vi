import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { resolveAdminSession, type AdminSession } from "@/lib/admin/session";
import { hasPermission, type AdminPermission } from "@/lib/admin/rbac";

/** 管理后台统一业务错误：携带 HTTP 状态码与机器可读 code。 */
export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function jsonError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * 服务端校验管理员会话与权限。
 * 不信任请求体中的 userId / roles / 管理员标记，只使用服务端解析出的会话。
 */
export async function requirePermission(
  request: Request,
  permission: AdminPermission,
): Promise<AdminSession> {
  const session = await resolveAdminSession(request);
  if (!session) {
    throw new AdminApiError(401, "UNAUTHORIZED", "登录状态已失效，请重新登录");
  }
  if (!hasPermission(session.roles, permission)) {
    throw new AdminApiError(403, "FORBIDDEN", "当前管理员角色无权执行该操作");
  }
  return session;
}

export function readIdempotencyKey(request: Request): string | null {
  const raw = request.headers.get("idempotency-key");
  if (!raw) return null;
  const key = raw.trim();
  if (key.length < 8 || key.length > 128) {
    throw new AdminApiError(400, "INVALID_IDEMPOTENCY_KEY", "幂等键长度应为 8–128 个字符");
  }
  return key;
}

function isPrismaError(error: unknown): error is { code?: string; message?: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

/** 统一错误出口：业务错误原样透出，Prisma 连接错误映射为 503。 */
export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AdminApiError) {
    return jsonError(error.status, error.code, error.message);
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    return jsonError(
      400,
      "VALIDATION_ERROR",
      issue ? `${issue.path.join(".")}: ${issue.message}` : "请求参数不合法",
    );
  }
  if (isPrismaError(error)) {
    const code = error.code ?? "";
    if (code.startsWith("P1")) {
      return jsonError(
        503,
        "DATABASE_UNAVAILABLE",
        "数据库暂不可用：请先运行 docker compose up -d 并执行 npm run db:setup",
      );
    }
    if (code === "P2002") {
      return jsonError(409, "CONFLICT", "唯一性冲突，请刷新后重试");
    }
    if (code === "P2025") {
      return jsonError(404, "NOT_FOUND", "目标资源不存在");
    }
  }
  console.error("[admin-api] unhandled error:", error);
  return jsonError(500, "INTERNAL_ERROR", "服务内部错误，请稍后重试");
}
