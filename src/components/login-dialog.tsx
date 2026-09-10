"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  BolloLogo,
  CheckIcon,
  ChevronDownIcon,
  WeChatIcon,
  XIcon,
} from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { authApi, AuthApiError } from "@/lib/auth-client";
import {
  isValidCode,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  normalizePhone,
} from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import type { AuthSession, WechatQrSession } from "@/types/auth";

type LoginTab = "phone" | "email";
type LoginMode = "password" | "code";
type FormErrors = Partial<Record<"target" | "credential" | "agreement", string>>;

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
  onLogin?: () => void;
};

function errorMessage(error: unknown): string {
  return error instanceof AuthApiError
    ? error.message
    : "发生未知错误，请稍后重试";
}

export function LoginDialog({ open, onClose, onLogin }: LoginDialogProps) {
  const { completeLogin } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<LoginTab>("phone");
  const [mode, setMode] = useState<LoginMode>("code");
  const [countryCode] = useState("+86");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [showWechatQr, setShowWechatQr] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onClose, open]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1_000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const target = tab === "phone" ? phone : email.trim();
  const validateTarget = useCallback((): string | null => {
    if (tab === "phone") {
      return isValidPhone(phone) ? null : "请输入正确的 11 位手机号";
    }
    return isValidEmail(email) ? null : "请输入正确的邮箱地址";
  }, [email, phone, tab]);

  const handleSuccess = useCallback((session: AuthSession) => {
    completeLogin(session);
    toast({
      title: "登录成功",
      description: `欢迎回来，${session.user.nickname}`,
      tone: "success",
    });
    onLogin?.();
    onClose();
  }, [completeLogin, onClose, onLogin, toast]);

  const sendCode = async () => {
    if (countdown > 0 || sendingCode) return;
    const targetError = validateTarget();
    if (targetError) {
      setErrors((current) => ({ ...current, target: targetError }));
      return;
    }

    setSendingCode(true);
    setErrors((current) => ({ ...current, target: undefined }));
    try {
      const result = await authApi.sendCode({
        channel: tab,
        target,
        ...(tab === "phone" ? { countryCode } : {}),
      });
      setCountdown(result.retryAfter);
      toast({
        title: "验证码已发送",
        description: result.devCode
          ? `开发环境验证码：${result.devCode}`
          : `请查看${tab === "phone" ? "短信" : "邮箱"}并在有效期内输入`,
        tone: "success",
      });
    } catch (error) {
      toast({ title: "验证码发送失败", description: errorMessage(error), tone: "error" });
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors: FormErrors = {};
    const targetError = validateTarget();
    if (targetError) nextErrors.target = targetError;
    if (mode === "code" && !isValidCode(code)) {
      nextErrors.credential = "请输入 6 位数字验证码";
    }
    if (mode === "password" && !isValidPassword(password)) {
      nextErrors.credential = "密码长度应为 6–128 位";
    }
    if (!agreed) nextErrors.agreement = "请先阅读并同意用户协议和隐私政策";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const common = {
        channel: tab,
        target,
        ...(tab === "phone" ? { countryCode } : {}),
      };
      const session = mode === "code"
        ? await authApi.loginWithCode({ ...common, code })
        : await authApi.loginWithPassword({ ...common, password });
      handleSuccess(session);
    } catch (error) {
      const message = errorMessage(error);
      setErrors((current) => ({ ...current, credential: message }));
      toast({ title: "登录失败", description: message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="登录"
      onClick={() => {
        if (!loading) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[420px] overflow-y-auto rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] sm:p-8"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          disabled={loading}
          className="absolute right-5 top-5 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <XIcon className="size-5" />
        </button>

        <div className="mb-8 flex flex-col items-center">
          <BolloLogo className="mb-4 w-[72px]" />
          <h1 className="text-[24px] font-bold text-white">欢迎来到 Bollo</h1>
          <p className="mt-1 text-[13px] text-white/45">登录后开启你的 AI 创作之旅</p>
        </div>

        {showWechatQr ? (
          <WechatQrPanel onBack={() => setShowWechatQr(false)} onSuccess={handleSuccess} />
        ) : (
          <>
            <div className="relative mb-6 flex border-b border-white/[0.08]">
              {(["phone", "email"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setTab(item);
                    setErrors({});
                  }}
                  className={cn(
                    "relative flex-1 pb-3 text-[15px] font-medium transition-colors",
                    tab === item ? "text-white" : "text-white/40 hover:text-white/60",
                  )}
                >
                  {item === "phone" ? "手机号登录" : "邮箱登录"}
                  {tab === item ? (
                    <span className="absolute bottom-[-1px] left-1/2 h-[2px] w-12 -translate-x-1/2 rounded-full bg-brand" />
                  ) : null}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                {tab === "phone" ? (
                  <div className={cn(
                    "flex h-12 overflow-hidden rounded-xl bg-white/[0.04] ring-1 focus-within:ring-2",
                    errors.target ? "ring-danger/60 focus-within:ring-danger/60" : "ring-white/[0.12] focus-within:ring-brand/30",
                  )}>
                    <button
                      type="button"
                      aria-label="国家或地区代码，中国大陆 +86"
                      className="flex items-center gap-1.5 border-r border-white/[0.08] px-3 text-[14px] text-white/70"
                    >
                      {countryCode}
                      <ChevronDownIcon className="size-3.5" />
                    </button>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      aria-invalid={Boolean(errors.target)}
                      placeholder="请输入手机号"
                      value={phone}
                      onChange={(event) => {
                        setPhone(normalizePhone(event.target.value));
                        setErrors((current) => ({ ...current, target: undefined }));
                      }}
                      onBlur={() => {
                        if (phone) setErrors((current) => ({ ...current, target: validateTarget() ?? undefined }));
                      }}
                      className="min-w-0 flex-1 bg-transparent px-4 text-[14px] text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                ) : (
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.target)}
                    placeholder="请输入邮箱地址"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((current) => ({ ...current, target: undefined }));
                    }}
                    onBlur={() => {
                      if (email) setErrors((current) => ({ ...current, target: validateTarget() ?? undefined }));
                    }}
                    className={cn(
                      "h-12 w-full rounded-xl bg-white/[0.04] px-4 text-[14px] text-white outline-none ring-1 placeholder:text-white/30 focus:ring-2",
                      errors.target ? "ring-danger/60 focus:ring-danger/60" : "ring-white/[0.12] focus:ring-brand/30",
                    )}
                  />
                )}
                <FieldError message={errors.target} />
              </div>

              <div>
                {mode === "code" ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-invalid={Boolean(errors.credential)}
                      placeholder="6 位验证码"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                        setErrors((current) => ({ ...current, credential: undefined }));
                      }}
                      maxLength={6}
                      className={cn(
                        "h-12 min-w-0 flex-1 rounded-xl bg-white/[0.04] px-4 text-[14px] text-white outline-none ring-1 placeholder:text-white/30 focus:ring-2",
                        errors.credential ? "ring-danger/60 focus:ring-danger/60" : "ring-white/[0.12] focus:ring-brand/30",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => void sendCode()}
                      disabled={countdown > 0 || sendingCode}
                      className="h-12 shrink-0 rounded-full px-4 text-[13px] font-medium text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:bg-white/[0.04] disabled:text-white/25 disabled:ring-transparent"
                    >
                      {sendingCode ? "发送中..." : countdown > 0 ? `${countdown}s 后重试` : "获取验证码"}
                    </button>
                  </div>
                ) : (
                  <input
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.credential)}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((current) => ({ ...current, credential: undefined }));
                    }}
                    className={cn(
                      "h-12 w-full rounded-xl bg-white/[0.04] px-4 text-[14px] text-white outline-none ring-1 placeholder:text-white/30 focus:ring-2",
                      errors.credential ? "ring-danger/60 focus:ring-danger/60" : "ring-white/[0.12] focus:ring-brand/30",
                    )}
                  />
                )}
                <FieldError message={errors.credential} />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "code" ? "password" : "code");
                    setErrors((current) => ({ ...current, credential: undefined }));
                  }}
                  className="text-[12px] text-white/40 transition-colors hover:text-white/70"
                >
                  {mode === "code" ? "密码登录" : "验证码登录"}
                </button>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => {
                      setAgreed(event.target.checked);
                      setErrors((current) => ({ ...current, agreement: undefined }));
                    }}
                    className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand"
                  />
                  <span className="text-[12px] leading-relaxed text-white/45">
                    我已阅读并同意
                    <a
                      href="https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand transition-colors hover:underline"
                    >《用户协议》</a>
                    和
                    <a
                      href="https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand transition-colors hover:underline"
                    >《隐私政策》</a>
                  </span>
                </label>
                <FieldError message={errors.agreement} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full rounded-full bg-brand text-[15px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "登录中..." : "登录 / 注册"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-[11px] text-white/25">其他登录方式</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowWechatQr(true)}
                className="group flex flex-col items-center gap-2 transition-transform hover:scale-105"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/20 transition-colors group-hover:bg-success/25">
                  <WeChatIcon className="size-5" />
                </span>
                <span className="text-[11px] text-white/40">微信登录</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-[12px] text-danger">{message}</p> : null;
}

function WechatQrPanel({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (session: AuthSession) => void;
}) {
  const { toast } = useToast();
  const [qr, setQr] = useState<WechatQrSession | null>(null);
  const [status, setStatus] = useState<"loading" | "pending" | "scanned" | "expired" | "error">("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const creationRef = useRef<Promise<WechatQrSession> | null>(null);

  useEffect(() => {
    let active = true;
    creationRef.current ??= authApi.createWechatQr();
    creationRef.current
      .then((result) => {
        if (!active) return;
        setQr(result);
        setStatus("pending");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus("error");
        toast({ title: "二维码获取失败", description: errorMessage(error), tone: "error" });
      });
    return () => {
      active = false;
    };
  }, [refreshKey, toast]);

  useEffect(() => {
    if (!qr || status === "expired" || status === "error") return;
    const controller = new AbortController();
    let timer = 0;
    let active = true;

    const poll = async () => {
      try {
        const result = await authApi.pollWechatQr(qr.sceneId, controller.signal);
        if (!active) return;
        if (result.status === "confirmed") {
          onSuccess(result.session);
          return;
        }
        setStatus(result.status);
        if (result.status !== "expired") {
          timer = window.setTimeout(() => void poll(), qr.pollIntervalMs);
        }
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setStatus("error");
        toast({ title: "微信登录失败", description: errorMessage(error), tone: "error" });
      }
    };

    timer = window.setTimeout(() => void poll(), qr.pollIntervalMs);
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [onSuccess, qr, status, toast]);

  const message = status === "scanned"
    ? "扫码成功，请在手机上确认"
    : status === "loading"
      ? "正在生成安全二维码"
      : "请使用微信扫描二维码登录";

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 self-start text-[13px] text-white/40 transition-colors hover:text-white/70"
      >
        ← 返回其他登录方式
      </button>

      <h2 className="mb-1 text-[18px] font-semibold text-white">微信扫码登录</h2>
      <p className="mb-6 text-[12px] text-white/40">{message}</p>

      <div className="relative flex size-[200px] items-center justify-center rounded-xl bg-white p-3">
        {status === "loading" ? (
          <span className="size-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        ) : qr?.qrUrl ? (
          <img src={qr.qrUrl} alt="微信登录二维码" className="size-full object-contain" />
        ) : (
          <QrCodeSvg />
        )}

        {status === "expired" || status === "error" ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
            <p className="mb-3 text-[13px] text-white/80">
              {status === "expired" ? "二维码已过期" : "二维码加载失败"}
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setQr(null);
                creationRef.current = null;
                setRefreshKey((current) => current + 1);
              }}
              className="rounded-full bg-brand px-4 py-1.5 text-[12px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              点击刷新
            </button>
          </div>
        ) : null}

        {status === "scanned" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
            <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-success text-success-foreground">
              <CheckIcon className="size-6" />
            </span>
            <p className="text-[13px] text-white">扫码成功</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-[12px] text-white/35">
        <WeChatIcon className="size-3.5 text-success" />
        <span>安全登录 · 微信授权</span>
      </div>
    </div>
  );
}

function QrCodeSvg() {
  const size = 21;
  const cells: boolean[] = [];
  let seed = 42;
  const random = () => {
    seed = (seed * 16807 + 13) % 2147483647;
    return seed / 2147483647;
  };
  for (let index = 0; index < size * size; index++) cells.push(random() > 0.48);
  const setFinder = (offsetX: number, offsetY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[(offsetY + y) * size + (offsetX + x)] = edge || inner;
      }
    }
  };
  setFinder(0, 0);
  setFinder(size - 7, 0);
  setFinder(0, size - 7);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-full" shapeRendering="crispEdges" aria-hidden="true">
      <rect width={size} height={size} fill="#fff" />
      {cells.map((on, index) => on ? (
        <rect key={index} x={index % size} y={Math.floor(index / size)} width={1} height={1} fill="#000" />
      ) : null)}
    </svg>
  );
}
