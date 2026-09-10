export type AuthChannel = "phone" | "email";

export type AuthUser = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
  credits: number;
  tier: string;
  roles: string[];
  pointsBreakdown?: {
    recharge: number;
    member: number;
    gift: number;
  };
  team?: {
    name: string;
    role: string;
  } | null;
};

export type AuthSession = {
  accessToken: string;
  expiresAt: number | null;
  user: AuthUser;
};

export type SendCodeInput = {
  channel: AuthChannel;
  target: string;
  countryCode?: string;
};

export type CodeLoginInput = SendCodeInput & {
  code: string;
};

export type PasswordLoginInput = SendCodeInput & {
  password: string;
};

export type WechatQrSession = {
  sceneId: string;
  qrUrl: string | null;
  expiresAt: number;
  pollIntervalMs: number;
};

export type WechatQrStatus =
  | { status: "pending" | "scanned" | "expired" }
  | { status: "confirmed"; session: AuthSession };

export type ApiSuccess<T> = {
  data: T;
};

export type ApiFailure = {
  error: {
    code: string;
    message: string;
  };
};
