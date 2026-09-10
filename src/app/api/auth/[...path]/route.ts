import { NextResponse } from "next/server";
import {
  failure,
  handleCreateWechatQr,
  handleLogin,
  handleLogout,
  handleMe,
  handleSendCode,
  handleWechatStatus,
} from "@/lib/auth-server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const route = path.join("/");
  if (route === "wechat/status") return handleWechatStatus(request);
  if (route === "me") return handleMe(request);
  return failure("认证接口不存在", "NOT_FOUND", 404);
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const route = path.join("/");
  if (route === "code/send") return handleSendCode(request);
  if (route === "login/code") return handleLogin(request, "code");
  if (route === "login/password") return handleLogin(request, "password");
  if (route === "wechat/qr") return handleCreateWechatQr(request);
  if (route === "logout") return handleLogout(request);
  return failure("认证接口不存在", "NOT_FOUND", 404);
}
