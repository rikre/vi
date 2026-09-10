import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { normalizeAdminRoles, type AdminRoleName } from "@/lib/admin/rbac";

/**
 * 服务端管理员会话。角色来源：
 * - mock 模式（非生产 + AUTH_MOCK_ENABLED/无 AUTH_API_BASE_URL）：解析 bollo_auth_token 中的签名 JWT 载荷
 * - 生产模式：携带 Cookie 中的 token 调用 AUTH_API_BASE_URL auth/me
 * 绝不信任请求体或 localStorage 中的角色信息。
 */
export type AdminSession = {
  userId: string;
  nickname: string;
  roles: AdminRoleName[];
  ip: string | null;
  userAgent: string | null;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function readCookieToken(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${AUTH_COOKIE_NAME}=`)) {
      return decodeURIComponent(trimmed.slice(AUTH_COOKIE_NAME.length + 1));
    }
  }
  return null;
}

function isMockEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && (
    process.env.AUTH_MOCK_ENABLED === "true" || !process.env.AUTH_API_BASE_URL
  );
}

function decodeMockSession(token: string): AdminSession | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as unknown;
    if (!isRecord(payload) || !isRecord(payload.user)) return null;
    const user = payload.user;
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    if (exp !== null && exp * 1_000 < Date.now() - 30_000) return null;
    const roles = Array.isArray(user.roles)
      ? user.roles.filter((role): role is string => typeof role === "string")
      : [];
    if (roles.length === 0) return null;
    return {
      userId: typeof user.id === "string" ? user.id : "unknown",
      nickname: typeof user.nickname === "string" ? user.nickname : "管理员",
      roles: normalizeAdminRoles(roles),
      ip: null,
      userAgent: null,
    };
  } catch {
    return null;
  }
}

async function fetchUpstreamRoles(token: string): Promise<AdminSession | null> {
  const base = process.env.AUTH_API_BASE_URL;
  if (!base) return null;
  const url = new URL("auth/me", base.endsWith("/") ? base : `${base}/`);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const payload = (await response.json().catch(() => null)) as unknown;
    const root = isRecord(payload) && isRecord(payload.data) ? (payload.data as JsonRecord) : isRecord(payload) ? payload : null;
    if (!root) return null;
    const user = isRecord(root.user) ? root.user : root;
    const roles = Array.isArray(user.roles)
      ? user.roles.filter((role): role is string => typeof role === "string")
      : typeof user.role === "string"
        ? [user.role]
        : [];
    const adminRoles = normalizeAdminRoles(roles);
    if (adminRoles.length === 0) return null;
    return {
      userId: typeof user.id === "string" ? user.id : "unknown",
      nickname: typeof user.nickname === "string" ? user.nickname : "管理员",
      roles: adminRoles,
      ip: null,
      userAgent: null,
    };
  } catch {
    return null;
  }
}

export function sessionRequestMeta(request: Request): { ip: string | null; userAgent: string | null } {
  const forwarded = request.headers.get("x-forwarded-for");
  return {
    ip: forwarded ? forwarded.split(",")[0]?.trim() || null : request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
  };
}

/** 解析管理员会话；无 token、无管理员角色时返回 null。 */
export async function resolveAdminSession(request: Request): Promise<AdminSession | null> {
  const token = readCookieToken(request);
  if (!token) return null;

  let session: AdminSession | null;
  if (isMockEnabled()) {
    session = decodeMockSession(token);
  } else {
    session = await fetchUpstreamRoles(token);
  }
  if (!session) return null;

  const meta = sessionRequestMeta(request);
  return { ...session, ip: meta.ip, userAgent: meta.userAgent };
}

export const ADMIN_SESSION_COOKIE_MAX_AGE = AUTH_COOKIE_MAX_AGE_SECONDS;
