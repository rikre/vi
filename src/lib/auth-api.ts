/**
 * 登录相关 API（当前为 mock 实现，后续对接真实后端）
 */

export type LoginMethod = "phone" | "email";

export interface SendCodePayload {
  method: LoginMethod;
  target: string;
}

export interface SendCodeResult {
  success: boolean;
  message?: string;
  /** mock 场景下返回固定验证码，方便测试 */
  mockCode?: string;
}

export interface LoginPayload {
  method: LoginMethod;
  target: string;
  code: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  token?: string;
}

/**
 * 发送验证码
 * TODO: 替换为真实接口调用
 */
export async function sendVerificationCode(payload: SendCodePayload): Promise<SendCodeResult> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!payload.target || payload.target.trim().length === 0) {
    return { success: false, message: "请输入手机号或邮箱" };
  }

  // mock 成功，固定验证码 888888
  return {
    success: true,
    message: "验证码已发送",
    mockCode: "888888",
  };
}

/**
 * 验证码登录 / 注册
 * TODO: 替换为真实接口调用
 */
export async function loginWithCode(payload: LoginPayload): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!payload.target || !payload.code) {
    return { success: false, message: "请填写完整信息" };
  }

  // mock 校验：任意 6 位验证码即可通过，方便演示
  if (!/^\d{6}$/.test(payload.code)) {
    return { success: false, message: "验证码格式错误" };
  }

  return {
    success: true,
    message: "登录成功",
    token: `mock_token_${Date.now()}`,
  };
}
