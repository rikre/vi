"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BolloMark,
  SparkleIcon,
  ScriptIcon,
  FolderOpenIcon,
  AssetIcon,
  LayoutGridIcon,
  SkillIcon,
  HelpIcon,
  UserIcon,
} from "@/components/icons";
import { TeamDialog } from "@/components/team-dialog";
import { InviteCampaignDialog } from "@/components/invite-campaign-dialog";
import { AccountDropdown } from "@/components/account-dropdown";
import { AccountDialog, AiWatermarkDialog, type AccountTab } from "@/components/account-dialog";
import { useAuth } from "@/components/auth-provider";
import { FeedbackDialog } from "@/components/feedback-dialog";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "创作", href: "/home", Icon: SparkleIcon, iconClassName: "size-6" },
  { label: "项目", href: "/project", Icon: FolderOpenIcon, iconClassName: "size-6" },
  { label: "剧本", href: "/script/market", Icon: ScriptIcon, iconClassName: "size-4" },
  { label: "资产", href: "/library", Icon: AssetIcon, iconClassName: "size-6" },
  { label: "工具", href: "/tools", Icon: LayoutGridIcon, iconClassName: "size-4" },
  { label: "Skills", href: "/skill", Icon: SkillIcon, iconClassName: "size-4" },
];

type SidebarProps = {
  onOpenMessages: () => void;
  onOpenFeedback?: () => void;
  /** 移动端抽屉展开态（受控） */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const ICON_BTN =
  "flex size-9 items-center justify-center rounded-[10px] bg-surface/35 text-white/60 ring-1 ring-white/[0.06] transition-all hover:bg-surface hover:text-white hover:ring-white/15";

export function Sidebar({ onOpenMessages, onOpenFeedback, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { status, showLogin } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab | null>(null);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [inviteCampaignOpen, setInviteCampaignOpen] = useState(false);

  const closeMobile = () => {
    setMenuOpen(false);
    onCloseMobile?.();
  };

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 767px)");
    const onBreakpointChange = () => setMenuOpen(false);
    media.addEventListener("change", onBreakpointChange);
    return () => media.removeEventListener("change", onBreakpointChange);
  }, []);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="关闭菜单"
          onClick={closeMobile}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
      <nav
        aria-label="Home v2 side navigation"
        className={cn(
          "relative flex h-full w-[64px] shrink-0 flex-col items-stretch bg-sidebar md:w-[108px] max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:w-[112px] max-md:pt-4 max-md:shadow-xl max-md:transition-transform max-md:duration-200",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        {/* Logo（顶部固定） */}
        <div className="flex shrink-0 justify-center px-2 pt-[20px] md:px-3">
          <Link
            href="/home"
            aria-label="bollo 首页"
            title="回到首页"
            className="inline-flex w-full items-center justify-center text-foreground"
          >
            <BolloMark className="h-[36px] w-[36px]" />
          </Link>
        </div>

        {/* 主导航（弹性伸展，条目多时可独立滚动） */}
        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-2 pt-[24px] md:px-[12px]">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/project" && pathname.startsWith("/comic"));
            const { Icon, iconClassName } = item;
            const content = (
              <>
                <span className="flex shrink-0 items-center justify-center text-current">
                  <Icon className={iconClassName} />
                </span>
                <span className="text-[13px] font-bold md:text-[11px] md:leading-3">{item.label}</span>
              </>
            );
            const cls = cn(
              "group relative flex h-[54px] w-[48px] shrink-0 flex-col items-center justify-center gap-1 rounded-[12px] px-2 py-[8px] transition-colors duration-[160ms] md:w-[56px] md:scale-90",
              active
                ? "text-brand"
                : "text-white/[0.54] hover:bg-white/[0.05] hover:text-white/[0.82]"
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cls}
                onClick={closeMobile}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* 底部用户区（mt-auto 固定贴底：帮助 + 个人中心） */}
        <div className="flex shrink-0 flex-col items-center gap-1 px-2 pb-[20px] pt-3 md:px-[12px]">
          {/* 帮助与反馈（反馈中心 + 站内公告） */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFeedback) {
                onOpenFeedback();
              } else {
                setFeedbackOpen(true);
              }
              setMenuOpen(false);
            }}
            aria-label="帮助与反馈"
            title="帮助与反馈"
            className={cn(ICON_BTN, "transition-transform duration-150 active:scale-90")}
          >
            <HelpIcon className="size-[18px]" />
          </button>

          {/* Avatar / 个人中心（消息、兑换码等入口收纳在下拉菜单内） */}
          {status === "authenticated" ? <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
              }}
              aria-label="个人中心"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              className="flex size-9 items-center justify-center rounded-[10px] bg-surface/35 text-white/[0.54] ring-1 ring-white/[0.06] transition-all duration-150 hover:bg-surface hover:text-white hover:ring-white/15 active:scale-90"
            >
              <UserIcon className="size-[18px]" />
            </button>
            {/* 在线状态点 */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[1px] right-[1px] size-[9px] rounded-full bg-[#2ecc71] ring-2 ring-black"
            />
            {/* dropdown rendered outside, positioned upward and right（移动端锚点对齐屏幕左缘 8px：头像容器距左缘 14px，-6px 补偿） */}
            <div className="absolute bottom-[calc(100%+8px)] left-[calc(100%+8px)] max-md:-left-1.5">
              <AccountDropdown
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                placement="top-center"
                onOpenAccount={(tab) => setAccountTab(tab)}
                onOpenWatermark={() => setWatermarkOpen(true)}
                onOpenMessages={() => {
                  setMenuOpen(false);
                  onOpenMessages();
                }}
                onOpenTeam={() => setTeamOpen(true)}
                onOpenInviteCampaign={() => setInviteCampaignOpen(true)}
              />
            </div>
          </div> : (
            <button type="button" onClick={showLogin} disabled={status === "loading"} className="rounded-full bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground">
              {status === "loading" ? "加载中" : "登录"}
            </button>
          )}
        </div>

      </nav>

      {teamOpen && <TeamDialog onClose={() => setTeamOpen(false)} />}
      {inviteCampaignOpen && (
        <InviteCampaignDialog onClose={() => setInviteCampaignOpen(false)} />
      )}

      {accountTab !== null && (
        <AccountDialog
          open
          initialTab={accountTab}
          onClose={() => setAccountTab(null)}
          onOpenWatermark={() => setWatermarkOpen(true)}
        />
      )}
      {watermarkOpen && <AiWatermarkDialog onClose={() => setWatermarkOpen(false)} />}
      {feedbackOpen && <FeedbackDialog onClose={() => setFeedbackOpen(false)} />}
    </>
  );
}
