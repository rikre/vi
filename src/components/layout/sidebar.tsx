"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BolloLogo,
  SparkleIcon,
  BookOpenIcon,
  FolderOpenIcon,
  PlazaIcon,
  AssetIcon,
  PublishIcon,
  HelpIcon,
  MessageIcon,
  UserIcon,
  GiftIcon,
} from "@/components/icons";
import { PublishDialog } from "@/components/publish-dialog";
import { AccountDropdown } from "@/components/account-dropdown";
import { AccountDialog, AiWatermarkDialog, type AccountTab } from "@/components/account-dialog";
import { RedeemDialog } from "@/components/redeem-dialog";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  action?: "publish";
};

const NAV_ITEMS: NavItem[] = [
  { label: "广场", href: "/plaza", Icon: PlazaIcon },
  { label: "创作", href: "/home", Icon: SparkleIcon },
  { label: "项目", href: "/comic", Icon: FolderOpenIcon },
  { label: "资产", href: "/library", Icon: AssetIcon },
  { label: "技能", href: "/skill", Icon: BookOpenIcon },
  { label: "发布", href: "#", Icon: PublishIcon },
];

type SidebarProps = {
  onOpenMessages: () => void;
};

const ICON_BTN =
  "flex size-9 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white";

export function Sidebar({ onOpenMessages }: SidebarProps) {
  const pathname = usePathname();
  const [publishOpen, setPublishOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab | null>(null);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Home v2 side navigation"
        className="relative flex h-full w-[64px] shrink-0 flex-col items-stretch overflow-y-auto bg-black md:w-[108px]"
      >
        {/* Logo */}
        <div className="flex justify-center px-2 pt-[20px] md:px-3">
          <Link
            href="/home"
            aria-label="bollo 首页"
            title="回到首页"
            className="inline-flex w-full items-center justify-center text-foreground"
          >
            <BolloLogo className="w-[36px] h-auto md:w-full md:h-auto" />
          </Link>
        </div>

        {/* Top nav group */}
        <div className="flex flex-col items-center gap-1 px-2 pt-[24px] md:px-[12px]">
          {NAV_ITEMS.map((item) => {
            const active = !item.action && pathname === item.href;
            const { Icon } = item;
            const content = (
              <>
                <span className="flex shrink-0 items-center justify-center text-current">
                  <Icon className="size-4" />
                </span>
                <span className="hidden text-[14px] leading-none md:inline">{item.label}</span>
              </>
            );
            const cls = cn(
              "flex h-[54px] w-[48px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[12px] px-2 py-[8px] transition-colors md:w-[84px]",
              active
                ? "bg-brand/10 text-brand"
                : "text-white/60 hover:bg-white/[0.05] hover:text-white"
            );

            if (item.action === "publish") {
              return (
                <button
                  key="publish"
                  type="button"
                  onClick={() => setPublishOpen(true)}
                  title={item.label}
                  className={cls}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cls}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* Divider line */}
        <div className="mx-2 my-2 h-px bg-white/10 md:mx-[12px]" />

        {/* Bottom group — help, avatar, messages (vertical stack) */}
        <div className="flex flex-col items-center gap-1 px-2 pb-[20px] md:px-[12px]">
          {/* Help / QR */}
          <button
            type="button"
            onClick={() => {
              setQrOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label="帮助与反馈"
            title="帮助与反馈"
            className={cn(
              ICON_BTN,
              qrOpen && "bg-white/[0.08] text-white"
            )}
          >
            <HelpIcon className="size-[18px]" />
          </button>

          {/* 账户管理 */}
          <button
            type="button"
            onClick={() => {
              setAccountTab("profile");
              setQrOpen(false);
              setMenuOpen(false);
            }}
            aria-label="账户管理"
            title="账户管理"
            className={ICON_BTN}
          >
            <UserIcon className="size-[18px]" />
          </button>

          {/* 兑换码 */}
          <button
            type="button"
            onClick={() => {
              setRedeemOpen(true);
              setQrOpen(false);
              setMenuOpen(false);
            }}
            aria-label="兑换码"
            title="兑换码"
            className={ICON_BTN}
          >
            <GiftIcon className="size-[18px]" />
          </button>

          {/* Avatar / account */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
                setQrOpen(false);
              }}
              aria-label="个人中心"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex size-9 items-center justify-center rounded-[10px] overflow-hidden ring-1 ring-white/10 transition-all hover:ring-white/25"
            >
              <img
                src="https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=cute%20anime%20avatar%20mascot%20character%20bollo%20lime%20green%20theme%20simple%20design&image_size=square"
                alt="用户头像"
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
            {/* dropdown rendered outside, positioned upward and right */}
            <div className="absolute bottom-[calc(100%+8px)] left-[calc(100%+8px)]">
              <AccountDropdown
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                placement="top-center"
                onOpenAccount={(tab) => setAccountTab(tab)}
                onOpenWatermark={() => setWatermarkOpen(true)}
              />
            </div>
          </div>

          {/* Messages */}
          <button
            type="button"
            onClick={() => {
              onOpenMessages();
              setQrOpen(false);
              setMenuOpen(false);
            }}
            aria-label="消息"
            title="消息"
            className={ICON_BTN}
          >
            <MessageIcon className="size-[18px]" />
          </button>
        </div>

        {/* QR popup */}
        {qrOpen && (
          <div className="absolute bottom-[72px] left-[100px] z-50">
            <QrPopupContent onClose={() => setQrOpen(false)} />
          </div>
        )}
      </nav>

      <PublishDialog open={publishOpen} onClose={() => setPublishOpen(false)} />

      {accountTab !== null && (
        <AccountDialog
          open
          initialTab={accountTab}
          onClose={() => setAccountTab(null)}
          onOpenWatermark={() => setWatermarkOpen(true)}
        />
      )}
      {watermarkOpen && <AiWatermarkDialog onClose={() => setWatermarkOpen(false)} />}
      {redeemOpen && <RedeemDialog onClose={() => setRedeemOpen(false)} />}
    </>
  );
}

function QrPopupContent({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="relative" role="dialog" aria-label="二维码">
      {/* Arrow pointing down-left toward sidebar */}
      <div className="absolute -bottom-1.5 left-[-14px] size-3 rotate-45 bg-[#1a1a1a] border-r border-b border-white/[0.08]" />
      <div className="w-[380px] rounded-2xl border border-white/[0.08] bg-[#1a1a1a] p-5 shadow-2xl">
        {/* Top link */}
        <div className="mb-4 text-right">
          <a
            href="https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium text-brand transition-colors hover:text-brand-hover"
          >
            点击跳转至客服系统
          </a>
        </div>
        {/* QR grid */}
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="size-[130px] overflow-hidden rounded-lg bg-white p-1.5">
              <QrCodeSvg center="wechat" />
            </div>
            <p className="text-[14px] font-semibold text-white/90">商务合作李经理</p>
            <p className="text-[12px] text-white/40">合作对接、大额采购等</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="size-[130px] overflow-hidden rounded-lg bg-white p-1.5">
              <QrCodeSvg center="chat" />
            </div>
            <p className="text-[14px] font-semibold text-white/90">官方交流群</p>
            <p className="text-[12px] text-white/40">创作答疑、官方活动等</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrCodeSvg({ center }: { center: "wechat" | "chat" }) {
  const S = 21;
  const cells: boolean[] = [];
  let seed = center === "wechat" ? 42 : 73;
  const rng = () => {
    seed = (seed * 16807 + 13) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < S * S; i++) cells.push(rng() > 0.48);
  const setFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[(oy + y) * S + (ox + x)] = edge || inner;
      }
  };
  setFinder(0, 0);
  setFinder(S - 7, 0);
  setFinder(0, S - 7);
  const cx = Math.floor(S / 2) - 2,
    cy = Math.floor(S / 2) - 2;
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++)
      cells[(cy + y) * S + (cx + x)] = false;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="size-full" shapeRendering="crispEdges">
      <rect width={S} height={S} fill="#fff" />
      {cells.map((on, i) =>
        on ? (
          <rect key={i} x={i % S} y={Math.floor(i / S)} width={1} height={1} fill="#000" />
        ) : null
      )}
      {center === "wechat" ? (
        <g transform={`translate(${cx},${cy})`}>
          <rect width={5} height={5} rx={0.8} fill="#fff" />
          <circle cx={1.7} cy={2.2} r={0.55} fill="#07c160" />
          <circle cx={3.3} cy={2.2} r={0.55} fill="#07c160" />
          <path
            d="M1.2 3.2 Q2.5 4.3 3.8 3.2"
            stroke="#07c160"
            strokeWidth={0.35}
            fill="none"
          />
        </g>
      ) : (
        <g transform={`translate(${cx},${cy})`}>
          <rect width={5} height={5} rx={0.8} fill="#fff" />
          <circle cx={2.5} cy={2.2} r={1.1} fill="none" stroke="#333" strokeWidth={0.35} />
          <path d="M1.8 3.1 L1.4 3.8" stroke="#333" strokeWidth={0.35} />
        </g>
      )}
    </svg>
  );
}
