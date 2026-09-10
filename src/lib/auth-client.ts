import type {
  ApiFailure,
  ApiSuccess,
  AuthSession,
  AuthUser,
  CodeLoginInput,
  PasswordLoginInput,
  SendCodeInput,
  WechatQrSession,
  WechatQrStatus,
} from "@/types/auth";

export class AuthApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "UNKNOWN_ERROR", status = 500) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
  }
}

async function authRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api/auth/${path}`, {
      ...init,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new AuthApiError("网络连接失败，请检查网络后重试", "NETWORK_ERROR", 0);
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!response.ok) {
    const failure = payload && "error" in payload ? payload.error : null;
    throw new AuthApiError(
      failure?.message ?? "服务暂时不可用，请稍后重试",
      failure?.code ?? "REQUEST_FAILED",
      response.status,
    );
  }

  if (!payload || !("data" in payload)) {
    throw new AuthApiError("认证服务返回了无效数据", "INVALID_RESPONSE", 502);
  }

  return payload.data;
}

export const authApi = {
  sendCode(input: SendCodeInput) {
    return authRequest<{ retryAfter: number; devCode?: string }>("code/send", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  loginWithCode(input: CodeLoginInput) {
    return authRequest<AuthSession>("login/code", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  loginWithPassword(input: PasswordLoginInput) {
    return authRequest<AuthSession>("login/password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  createWechatQr() {
    return authRequest<WechatQrSession>("wechat/qr", { method: "POST" });
  },
  pollWechatQr(sceneId: string, signal?: AbortSignal) {
    return authRequest<WechatQrStatus>(
      `wechat/status?sceneId=${encodeURIComponent(sceneId)}`,
      { signal },
    );
  },
  getCurrentUser() {
    return authRequest<AuthUser>("me");
  },
  logout() {
    return authRequest<{ success: true }>("logout", { method: "POST" });
  },
};
