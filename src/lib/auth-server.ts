import "server-only";

import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_GUARD_COOKIE_NAME,
} from "@/lib/auth-constants";
import {
  isValidCode,
  isValidEmail,
  isValidPassword,
  isValidPhone,
} from "@/lib/auth-validation";
import type {
  ApiFailure,
  ApiSuccess,
  AuthSession,
  AuthUser,
  WechatQrSession,
  WechatQrStatus,
} from "@/types/auth";

type JsonRecord = Record<string, unknown>;

const MOCK_CODE = "123456";
const MOCK_QR_DELAY_MS = 8_000;
const MOCK_QR_SCANNED_MS = 5_000;
const MOCK_QR_TTL_MS = 120_000;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function readString(record: JsonRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function readNumber(record: JsonRecord, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function normalizeTimestamp(value: number | null): number | null {
  if (value === null) return null;
  return value < 1_000_000_000_000 ? value * 1_000 : value;
}

function unwrapData(payload: unknown): JsonRecord {
  if (!isRecord(payload)) return {};
  return isRecord(payload.data) ? payload.data : payload;
}

function normalizeUser(payload: unknown): AuthUser {
  const root = unwrapData(payload);
  const user = isRecord(root.user) ? root.user : root;
  const points = isRecord(user.pointsBreakdown)
    ? user.pointsBreakdown
    : isRecord(user.points_breakdown)
      ? user.points_breakdown
      : null;
  const team = isRecord(user.team) ? user.team : null;
  const roles = Array.isArray(user.roles)
    ? user.roles.filter((role): role is string => typeof role === "string")
    : typeof user.role === "string"
      ? [user.role]
      : [];

  return {
    id: readString(user, "id", "userId", "user_id") ?? "unknown",
    nickname: readString(user, "nickname", "name", "displayName") ?? "bollo 用户",
    avatarUrl: readString(user, "avatarUrl", "avatar", "avatar_url"),
    phone: readString(user, "phone", "mobile"),
    email: readString(user, "email"),
    credits: readNumber(user, "credits", "points", "balance") ?? 0,
    tier: readString(user, "tier", "membership", "planName") ?? "普通用户",
    roles,
    pointsBreakdown: points
      ? {
          recharge: readNumber(points, "recharge") ?? 0,
          member: readNumber(points, "member") ?? 0,
          gift: readNumber(points, "gift") ?? 0,
        }
      : undefined,
    team: team
      ? {
          name: readString(team, "name") ?? "我的团队",
          role: readString(team, "role") ?? "成员",
        }
      : null,
  };
}

function normalizeSession(payload: unknown): AuthSession | null {
  const data = unwrapData(payload);
  const accessToken = readString(data, "accessToken", "access_token", "token");
  if (!accessToken) return null;
  const rawUser = data.user ?? data.profile;
  if (!rawUser) return null;
  const expiresIn = readNumber(data, "expiresIn", "expires_in");
  const expiresAt = normalizeTimestamp(readNumber(data, "expiresAt", "expires_at"));

  return {
    accessToken,
    expiresAt: expiresAt ?? (expiresIn ? Date.now() + expiresIn * 1_000 : null),
    user: normalizeUser(rawUser),
  };
}

function base64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function createMockToken(user: AuthUser): string {
  const now = Math.floor(Date.now() / 1_000);
  const header = base64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    sub: user.id,
    iat: now,
    exp: now + AUTH_COOKIE_MAX_AGE_SECONDS,
    user,
  }));
  return `${header}.${payload}.mock`;
}

function mockUser(target = "wechat"): AuthUser {
  const isEmail = target.includes("@");
  return {
    id: "10086420",
    nickname: isEmail ? target.split("@")[0] || "bollo 用户" : "bollo 用户",
    avatarUrl: null,
    phone: /^\d{11}$/.test(target) ? target : null,
    email: isEmail ? target : "bollo@bollo.video",
    credits: 2_580,
    tier: "普通用户",
    roles: ["platform_admin", "enterprise_admin"],
    pointsBreakdown: { recharge: 1_580, member: 800, gift: 200 },
    team: { name: "星河短剧工作室", role: "管理员" },
  };
}

function mockSession(target?: string): AuthSession {
  const user = mockUser(target);
  return {
    accessToken: createMockToken(user),
    expiresAt: Date.now() + AUTH_COOKIE_MAX_AGE_SECONDS * 1_000,
    user,
  };
}

function mockUserFromRequest(request: Request): AuthUser | null {
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(AUTH_COOKIE_NAME.length + 1);
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString()) as unknown;
    if (!isRecord(payload) || !isRecord(payload.user)) return null;
    return normalizeUser(payload.user);
  } catch {
    return null;
  }
}

function isMockEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && (
    process.env.AUTH_MOCK_ENABLED === "true" || !process.env.AUTH_API_BASE_URL
  );
}

function success<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data }, { status });
}

export function failure(message: string, code: string, status: number): NextResponse<ApiFailure> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function setSessionCookie(response: NextResponse, session: AuthSession): void {
  const maxAge = session.expiresAt
    ? Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1_000))
    : AUTH_COOKIE_MAX_AGE_SECONDS;
  response.cookies.set(AUTH_COOKIE_NAME, session.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  response.cookies.set(AUTH_GUARD_COOKIE_NAME, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(AUTH_GUARD_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

async function parseJson(request: Request): Promise<JsonRecord | null> {
  const payload = (await request.json().catch(() => null)) as unknown;
  return isRecord(payload) ? payload : null;
}

function validateIdentity(body: JsonRecord): string | null {
  const channel = body.channel;
  const target = typeof body.target === "string" ? body.target.trim() : "";
  if (channel === "phone" && isValidPhone(target)) return null;
  if (channel === "email" && isValidEmail(target)) return null;
  return channel === "phone"
    ? "请输入正确的 11 位手机号"
    : "请输入正确的邮箱地址";
}

function upstreamUrl(path: string, request: Request): URL | null {
  const baseUrl = process.env.AUTH_API_BASE_URL;
  if (!baseUrl) return null;
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  url.search = new URL(request.url).search;
  return url;
}

async function callUpstream(
  request: Request,
  path: string,
  body?: JsonRecord | null,
): Promise<{ payload: unknown; status: number; ok: boolean }> {
  const url = upstreamUrl(path, request);
  if (!url) return { payload: null, status: 503, ok: false };
  const cookieToken = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(AUTH_COOKIE_NAME.length + 1);
  const authorization = request.headers.get("authorization") ??
    (cookieToken ? `Bearer ${decodeURIComponent(cookieToken)}` : null);

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return {
      payload: (await response.json().catch(() => null)) as unknown,
      status: response.status,
      ok: response.ok,
    };
  } catch {
    return { payload: null, status: 503, ok: false };
  }
}

function upstreamMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.message === "string") return payload.message;
  if (isRecord(payload.error) && typeof payload.error.message === "string") {
    return payload.error.message;
  }
  return null;
}

export async function handleSendCode(request: Request): Promise<NextResponse> {
  const body = await parseJson(request);
  if (!body) return failure("请求参数无效", "INVALID_REQUEST", 400);
  const identityError = validateIdentity(body);
  if (identityError) return failure(identityError, "INVALID_IDENTITY", 400);

  if (isMockEnabled()) {
    return success({ retryAfter: 60, devCode: MOCK_CODE });
  }

  const upstream = await callUpstream(request, "auth/code/send", body);
  if (!upstream.ok) {
    return failure(upstreamMessage(upstream.payload) ?? "验证码发送失败，请稍后重试", "SEND_CODE_FAILED", upstream.status);
  }
  const data = unwrapData(upstream.payload);
  return success({ retryAfter: readNumber(data, "retryAfter", "retry_after") ?? 60 });
}

export async function handleLogin(
  request: Request,
  method: "code" | "password",
): Promise<NextResponse> {
  const body = await parseJson(request);
  if (!body) return failure("请求参数无效", "INVALID_REQUEST", 400);
  const identityError = validateIdentity(body);
  if (identityError) return failure(identityError, "INVALID_IDENTITY", 400);
  if (method === "code" && (typeof body.code !== "string" || !isValidCode(body.code))) {
    return failure("请输入 6 位数字验证码", "INVALID_CODE", 400);
  }
  if (method === "password" && (typeof body.password !== "string" || !isValidPassword(body.password))) {
    return failure("密码长度应为 6–128 位", "INVALID_PASSWORD", 400);
  }

  if (isMockEnabled()) {
    if (method === "code" && body.code !== MOCK_CODE) {
      return failure("验证码错误，请重新输入", "INVALID_CODE", 401);
    }
    if (method === "password" && body.password !== "bollo123") {
      return failure("账号或密码错误", "INVALID_CREDENTIALS", 401);
    }
    const target = typeof body.target === "string" ? body.target : undefined;
    const session = mockSession(target);
    const response = success(session);
    setSessionCookie(response, session);
    return response;
  }

  const upstream = await callUpstream(request, `auth/login/${method}`, body);
  if (!upstream.ok) {
    return failure(upstreamMessage(upstream.payload) ?? "登录失败，请检查输入后重试", "LOGIN_FAILED", upstream.status);
  }
  const session = normalizeSession(upstream.payload);
  if (!session) return failure("认证服务返回了无效会话", "INVALID_UPSTREAM_RESPONSE", 502);
  const response = success(session);
  setSessionCookie(response, session);
  return response;
}

export async function handleCreateWechatQr(request: Request): Promise<NextResponse> {
  if (isMockEnabled()) {
    const createdAt = Date.now();
    const data: WechatQrSession = {
      sceneId: `mock-${createdAt}-${crypto.randomUUID()}`,
      qrUrl: null,
      expiresAt: createdAt + MOCK_QR_TTL_MS,
      pollIntervalMs: 1_500,
    };
    return success(data);
  }

  const upstream = await callUpstream(request, "auth/wechat/qr");
  if (!upstream.ok) {
    return failure(upstreamMessage(upstream.payload) ?? "微信二维码获取失败", "WECHAT_QR_FAILED", upstream.status);
  }
  const data = unwrapData(upstream.payload);
  const sceneId = readString(data, "sceneId", "scene_id", "id");
  if (!sceneId) return failure("认证服务返回了无效二维码", "INVALID_UPSTREAM_RESPONSE", 502);
  return success<WechatQrSession>({
    sceneId,
    qrUrl: readString(data, "qrUrl", "qr_url", "url"),
    expiresAt: normalizeTimestamp(readNumber(data, "expiresAt", "expires_at")) ?? Date.now() + MOCK_QR_TTL_MS,
    pollIntervalMs: readNumber(data, "pollIntervalMs", "poll_interval_ms") ?? 2_000,
  });
}

export async function handleWechatStatus(request: Request): Promise<NextResponse> {
  const sceneId = new URL(request.url).searchParams.get("sceneId");
  if (!sceneId) return failure("缺少二维码会话标识", "INVALID_REQUEST", 400);

  if (isMockEnabled()) {
    const createdAt = Number(sceneId.split("-")[1]);
    if (!Number.isFinite(createdAt)) return failure("二维码会话无效", "INVALID_QR", 400);
    const age = Date.now() - createdAt;
    if (age >= MOCK_QR_TTL_MS) return success<WechatQrStatus>({ status: "expired" });
    if (age < MOCK_QR_SCANNED_MS) return success<WechatQrStatus>({ status: "pending" });
    if (age < MOCK_QR_DELAY_MS) return success<WechatQrStatus>({ status: "scanned" });
    const session = mockSession();
    const response = success<WechatQrStatus>({ status: "confirmed", session });
    setSessionCookie(response, session);
    return response;
  }

  const upstream = await callUpstream(request, "auth/wechat/status");
  if (!upstream.ok) {
    return failure(upstreamMessage(upstream.payload) ?? "微信登录状态查询失败", "WECHAT_STATUS_FAILED", upstream.status);
  }
  const data = unwrapData(upstream.payload);
  const status = readString(data, "status");
  if (status === "confirmed" || status === "authorized" || status === "success") {
    const session = normalizeSession(data.session ?? data);
    if (!session) return failure("认证服务返回了无效会话", "INVALID_UPSTREAM_RESPONSE", 502);
    const response = success<WechatQrStatus>({ status: "confirmed", session });
    setSessionCookie(response, session);
    return response;
  }
  if (status === "scanned") return success<WechatQrStatus>({ status: "scanned" });
  if (status === "expired") return success<WechatQrStatus>({ status: "expired" });
  return success<WechatQrStatus>({ status: "pending" });
}

export async function handleMe(request: Request): Promise<NextResponse> {
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!token) return failure("登录状态已失效，请重新登录", "UNAUTHORIZED", 401);

  if (isMockEnabled()) {
    const user = mockUserFromRequest(request);
    return user
      ? success(user)
      : failure("登录状态已失效，请重新登录", "UNAUTHORIZED", 401);
  }

  const upstream = await callUpstream(request, "auth/me");
  if (!upstream.ok) {
    const response = failure(upstreamMessage(upstream.payload) ?? "登录状态已失效，请重新登录", "UNAUTHORIZED", upstream.status);
    if (upstream.status === 401 || upstream.status === 403) clearSessionCookie(response);
    return response;
  }
  return success(normalizeUser(upstream.payload));
}

export async function handleLogout(request: Request): Promise<NextResponse> {
  if (!isMockEnabled() && process.env.AUTH_API_BASE_URL) {
    await callUpstream(request, "auth/logout", {});
  }
  const response = success({ success: true as const });
  clearSessionCookie(response);
  return response;
}
