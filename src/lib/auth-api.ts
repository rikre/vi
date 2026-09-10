/** Compatibility adapter for the earlier UI; all authentication uses the shared API. */
import { authApi, AuthApiError } from "@/lib/auth-client";

export type LoginMethod = "phone" | "email";
export interface SendCodePayload {
  method: LoginMethod;
  target: string;
}
export interface SendCodeResult {
  success: boolean;
  message?: string;
  mockCode?: string;
}
export interface LoginPayload extends SendCodePayload {
  code: string;
}
export interface LoginResult {
  success: boolean;
  message?: string;
  token?: string;
}

export async function sendVerificationCode(payload: SendCodePayload): Promise<SendCodeResult> {
  try {
    const result = await authApi.sendCode({ channel: payload.method, target: payload.target });
    return { success: true, message: "验证码已发送", mockCode: result.devCode };
  } catch (error) {
    return { success: false, message: error instanceof AuthApiError ? error.message : "验证码发送失败" };
  }
}

export async function loginWithCode(payload: LoginPayload): Promise<LoginResult> {
  try {
    const session = await authApi.loginWithCode({
      channel: payload.method,
      target: payload.target,
      code: payload.code,
    });
    return { success: true, token: session.accessToken };
  } catch (error) {
    return { success: false, message: error instanceof AuthApiError ? error.message : "登录失败" };
  }
}
