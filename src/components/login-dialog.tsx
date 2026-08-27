"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon, WeChatIcon } from "@/components/icons";
import {
  sendVerificationCode,
  loginWithCode,
  type LoginMethod,
} from "@/lib/auth-api";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const TABS: { id: LoginMethod; label: string }[] = [
  { id: "phone", label: "手机号" },
  { id: "email", label: "邮箱" },
];

/** 青柠绿卡通吉祥物 */
function LoginMascot() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 主体：圆润的青柠绿火焰/精灵 */}
      <path
        d="M24 4C24 4 10 18 10 30C10 38.8366 16.1634 45 24 45C31.8366 45 38 38.8366 38 30C38 18 24 4 24 4Z"
        fill="#D4FF3F"
      />
      {/* 顶部小火苗 */}
      <circle cx="34" cy="12" r="5" fill="#D4FF3F" />
      <circle cx="36" cy="8" r="2.5" fill="#D4FF3F" />
      {/* 左眼 */}
      <ellipse cx="18" cy="29" rx="3.5" ry="4.5" fill="#0D0D0D" />
      <circle cx="19" cy="27.5" r="1.5" fill="white" />
      {/* 右眼 */}
      <ellipse cx="30" cy="29" rx="3.5" ry="4.5" fill="#0D0D0D" />
      <circle cx="31" cy="27.5" r="1.5" fill="white" />
      {/* 微笑 */}
      <path
        d="M20 36C20 36 22 39 24 39C26 39 28 36 28 36"
        stroke="#0D0D0D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 腮红 */}
      <circle cx="14" cy="34" r="2.5" fill="#0D0D0D" opacity="0.12" />
      <circle cx="34" cy="34" r="2.5" fill="#0D0D0D" opacity="0.12" />
    </svg>
  );
}

export function LoginDialog({ open, onClose, onLogin }: LoginDialogProps) {
  const [method, setMethod] = useState<LoginMethod>("phone");
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setTarget("");
      setCode("");
      setError("");
      setCountdown(0);
    }
  }, [open]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const targetPlaceholder = useMemo(() => {
    return method === "phone" ? "请输入手机号" : "请输入邮箱";
  }, [method]);

  const targetLabel = useMemo(() => {
    return method === "phone" ? "手机号" : "邮箱";
  }, [method]);

  const canSend = useMemo(() => {
    if (countdown > 0 || sending) return false;
    if (method === "phone") return /^1\d{10}$/.test(target);
    return /^\S+@\S+\.\S+$/.test(target);
  }, [countdown, method, sending, target]);

  const handleSendCode = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const res = await sendVerificationCode({ method, target });
      if (res.success) {
        setCountdown(60);
        // mock 场景自动填充验证码，方便测试
        if (res.mockCode) setCode(res.mockCode);
      } else {
        setError(res.message || "发送失败");
      }
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !code) {
      setError("请填写完整信息");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginWithCode({ method, target, code });
      if (res.success) {
        onLogin();
      } else {
        setError(res.message || "登录失败");
      }
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleWeChatLogin = () => {
    // TODO: 对接微信登录 SDK / OAuth
    window.alert("微信登录接入中，敬请期待");
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] shadow-2xl"
      >
        {/* 右上角关闭按钮 */}
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        {/* 头部：吉祥物 + 标题 */}
        <div className="mb-6 flex items-center justify-center gap-3 pt-2">
          <LoginMascot />
          <div className="rounded-full bg-white/[0.08] px-4 py-2 ring-1 ring-white/[0.08]">
            <h2
              id="login-dialog-title"
              className="text-[16px] font-bold text-white"
            >
              注册 / 登录领积分哦
            </h2>
          </div>
        </div>

        {/* 登录方式 Tab */}
        <div className="mb-5 flex justify-center">
          <div className="flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/[0.08]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMethod(tab.id);
                  setTarget("");
                  setCode("");
                  setError("");
                }}
                className={cn(
                  "px-5 py-1.5 text-[13px] font-medium transition-all rounded-full",
                  method === tab.id
                    ? "bg-white/[0.12] text-white"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 手机号 / 邮箱 */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-white/80">
              {targetLabel}
            </label>
            <div className="flex overflow-hidden rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08] transition-colors focus-within:ring-brand/50">
              {method === "phone" && (
                <span className="flex items-center border-r border-white/[0.08] px-4 text-[14px] text-white/60">
                  +86
                </span>
              )}
              <input
                type={method === "phone" ? "tel" : "email"}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={targetPlaceholder}
                autoFocus
                className="h-11 flex-1 bg-transparent px-4 text-[14px] text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </div>

          {/* 验证码 */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-white/80">
              验证码
            </label>
            <div className="flex overflow-hidden rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08] transition-colors focus-within:ring-brand/50">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="请输入验证码"
                className="h-11 flex-1 bg-transparent px-4 text-[14px] text-white placeholder:text-white/30 outline-none"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={!canSend}
                className={cn(
                  "border-l border-white/[0.08] px-4 text-[13px] font-medium transition-colors",
                  canSend
                    ? "text-brand hover:bg-white/[0.04]"
                    : "cursor-not-allowed text-white/30"
                )}
              >
                {countdown > 0 ? `${countdown}s 后重发` : sending ? "发送中..." : "获取验证码"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-[#ff5c8a]">{error}</p>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-bold text-black transition-all hover:bg-[#e6ff4d] hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "登录中..." : "创建账户 / 登录"}
          </button>
        </form>

        {/* 其他登录方式：仅微信 */}
        <div className="mt-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>
            <span className="relative bg-[#141414] px-3 text-[12px] text-white/40">
              其他登录方式
            </span>
          </div>

          <button
            type="button"
            onClick={handleWeChatLogin}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#07C160] text-[14px] font-semibold text-white transition-colors hover:bg-[#06ad56]"
          >
            <WeChatIcon className="size-5" />
            微信登录
          </button>
        </div>

        {/* 协议 */}
        <p className="mt-5 text-center text-[11px] text-white/40">
          继续即表示您同意
          <a href="#" className="mx-1 text-white/70 underline hover:text-white">
            用户协议
          </a>
          与
          <a href="#" className="mx-1 text-white/70 underline hover:text-white">
            隐私政策
          </a>
        </p>
      </div>
    </div>
  );
}
