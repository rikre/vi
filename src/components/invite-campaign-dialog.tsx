"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  CloseIcon,
  DownloadIcon,
  GiftIcon,
  LinkIcon,
  ShareIcon,
  UserGroupIcon,
} from "@/components/icons";
import { Modal } from "@/components/ui/modal";

const INVITE_LINK = "https://bollo.ai/i/MIV7AL56CFXRMVT";

const STEPS = [
  { Icon: ShareIcon, step: "步骤1", title: "分享给好友", desc: "发送专属链接或二维码给TA" },
  { Icon: UserGroupIcon, step: "步骤2", title: "好友注册", desc: "官网自动识别并绑定邀请关系" },
  { Icon: GiftIcon, step: "步骤3", title: "双方得积分", desc: "注册成功后双方立即到账" },
];

const REWARD_TIERS = [
  { range: "第1-10人（当前）", reward: "60积分/人", current: true },
  { range: "第11-20人", reward: "120积分/人", current: false },
  { range: "第21-50人", reward: "150积分/人", current: false },
];

export function InviteCampaignDialog({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<"main" | "qr">("main");
  const [copied, setCopied] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const copyLink = () => {
    navigator.clipboard?.writeText(INVITE_LINK).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="邀请好友赚积分活动"
      showCloseButton={false}
      className="no-scrollbar max-h-[calc(100vh-32px)] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-[#141414] p-0 ring-1 ring-white/[0.1]"
    >
      <div className="relative">
        {/* 顶部品牌色氛围光 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/[0.08] to-transparent"
        />
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        {view === "main" ? (
          <MainView
            copied={copied}
            onCopy={copyLink}
            onShowQr={() => setView("qr")}
            rulesOpen={rulesOpen}
            onToggleRules={() => setRulesOpen((v) => !v)}
          />
        ) : (
          <QrView onBack={() => setView("main")} />
        )}
      </div>
    </Modal>
  );
}

/* ---------- 主视图 ---------- */

function MainView({
  copied,
  onCopy,
  onShowQr,
  rulesOpen,
  onToggleRules,
}: {
  copied: boolean;
  onCopy: () => void;
  onShowQr: () => void;
  rulesOpen: boolean;
  onToggleRules: () => void;
}) {
  return (
    <div className="relative p-6">
      <p className="text-[12px] text-white/45">截止至 2026.09.27</p>

      <h2 className="mt-6 text-center text-[24px] font-bold text-white">
        邀请好友赚积分！
      </h2>
      <p className="mt-2 text-center text-[13px] text-white/70">
        好友注册得 <span className="font-semibold text-brand">100积分</span>
        ，你最高得 <span className="font-semibold text-brand">150积分/人</span>
      </p>
      <div className="mt-3 flex justify-center">
        <span className="rounded-full px-4 py-1.5 text-[12px] font-medium text-white/80 ring-1 ring-white/[0.15]">
          活动累计最高可得 <span className="font-bold text-white">3,000</span> 积分
        </span>
      </div>

      {/* 双 CTA */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-[#ffb03d] py-3 text-[13px] font-bold text-black transition-all hover:brightness-105 active:scale-[0.97]"
        >
          <LinkIcon className="size-4" />
          {copied ? "链接已复制" : "复制邀请链接"}
        </button>
        <button
          type="button"
          onClick={onShowQr}
          className="flex items-center justify-center gap-2 rounded-full bg-white/[0.06] py-3 text-[13px] font-semibold text-white ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.1]"
        >
          <DownloadIcon className="size-4 rotate-90" />
          生成邀请二维码
        </button>
      </div>
      <p className="mt-3 text-center text-[12px] text-white/40">
        好友打开链接或扫描二维码，注册后自动绑定邀请关系
      </p>

      {/* 邀请步骤 */}
      <h3 className="mt-7 text-[14px] font-bold text-white">邀请步骤</h3>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {STEPS.map(({ Icon, step, title, desc }) => (
          <div key={step} className="rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.07]">
            <div className="flex items-center gap-1.5">
              <Icon className="size-4 text-brand" />
              <span className="text-[11px] font-medium text-brand">{step}</span>
            </div>
            <p className="mt-2.5 text-[13px] font-bold text-white">{title}</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">{desc}</p>
          </div>
        ))}
      </div>

      {/* 我的奖励 */}
      <h3 className="mt-7 text-[14px] font-bold text-white">我的奖励</h3>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.07]">
          <p className="text-[11px] text-white/50">累计获得</p>
          <p className="mt-2 text-[20px] font-bold text-white">
            0 <span className="text-[11px] font-normal text-white/50">积分</span>
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.07]">
          <p className="text-[11px] text-white/50">成功邀请</p>
          <p className="mt-2 text-[20px] font-bold text-white">
            0 <span className="text-[11px] font-normal text-white/50">人</span>
          </p>
        </div>
        <div className="rounded-xl bg-brand/[0.06] p-3.5 ring-1 ring-brand/40">
          <p className="text-[11px] text-brand/80">当前奖励</p>
          <p className="mt-2 text-[20px] font-bold text-white">
            60 <span className="text-[11px] font-normal text-white/60">积分/人</span>
          </p>
          <p className="mt-1 text-[10px] text-white/40">再邀11人升至120积分/人</p>
        </div>
      </div>

      {/* 活动规则 */}
      <h3 className="mt-7 text-[14px] font-bold text-white">活动规则</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-white/60">
        好友注册得 <span className="font-semibold text-brand">100积分/人</span>
        ，你当前得 <span className="font-semibold text-brand">60积分/人</span>
        ，活动累计最高可得 <span className="font-semibold text-brand">3,000积分</span>。
      </p>
      <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        <button
          type="button"
          onClick={onToggleRules}
          aria-expanded={rulesOpen}
          className="flex w-full items-center justify-between bg-white/[0.03] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.06]"
        >
          查看详细规则
          <ChevronDownIcon
            className={cn("size-4 text-white/50 transition-transform", rulesOpen && "rotate-180")}
          />
        </button>
        {rulesOpen && (
          <div className="border-t border-white/[0.06]">
            {REWARD_TIERS.map((t) => (
              <div
                key={t.range}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 text-[12px]",
                  t.current ? "bg-brand/[0.06] text-white" : "text-white/60",
                )}
              >
                <span>{t.range}</span>
                <span className={cn("font-semibold", t.current ? "text-brand" : "text-white/70")}>
                  {t.reward}
                </span>
              </div>
            ))}
            <p className="border-t border-white/[0.06] px-4 py-3 text-[11px] leading-relaxed text-white/40">
              奖励以好友注册成功时的活动规则为准；达到活动累计上限后仍可建立邀请关系，但不再发放邀请奖励。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 二维码视图 ---------- */

function QrView({ onBack }: { onBack: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(INVITE_LINK, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setQrDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "bollo-invite-qrcode.png";
    a.click();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="relative p-6">
      <button
        type="button"
        onClick={onBack}
        className="text-[12px] text-white/50 transition-colors hover:text-white"
      >
        ← 返回活动
      </button>
      <h2 className="mt-4 text-[18px] font-bold text-white">分享邀请二维码</h2>
      <p className="mt-1.5 text-[12px] text-white/50">
        好友扫码打开官网，注册后自动绑定邀请关系
      </p>

      <div className="mt-6 flex flex-col items-center">
        <p className="text-[16px] font-bold tracking-wide text-brand">bollo</p>
        <div className="mt-4 rounded-xl bg-white p-3">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="bollo 邀请链接二维码"
              width={200}
              height={200}
              unoptimized
              className="size-[200px]"
            />
          ) : (
            <div
              role="status"
              className="flex size-[200px] items-center justify-center text-center text-[12px] text-black/55"
            >
              二维码生成中…
            </div>
          )}
        </div>
        <p className="mt-4 text-[12px] text-white/50">扫码注册，双方得积分</p>
      </div>

      <button
        type="button"
        onClick={saveQr}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-[#ffb03d] py-3 text-[13px] font-bold text-black transition-all hover:brightness-105 active:scale-[0.98]"
      >
        <DownloadIcon className="size-4" />
        {saved ? "已保存" : qrDataUrl ? "保存二维码" : "生成中"}
      </button>
    </div>
  );
}
