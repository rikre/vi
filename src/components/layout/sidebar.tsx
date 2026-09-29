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
  CrownIcon,
  SettingsIcon,
} from "@/components/icons";
import { PublishDialog } from "@/components/publish-dialog";
import { TeamDialog } from "@/components/team-dialog";
import { InviteCampaignDialog } from "@/components/invite-campaign-dialog";
import { AccountDropdown } from "@/components/account-dropdown";
import { AccountDialog, AiWatermarkDialog, type AccountTab } from "@/components/account-dialog";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/components/auth-provider";
import { normalizeAdminRoles } from "@/lib/admin/rbac";
import { FeedbackDialog } from "@/components/feedback-dialog";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  action?: "publish";
};

const NAV_ITEMS: NavItem[] = [
  { label: "广场", href: "/plaza", Icon: PlazaIcon },
  { label: "创作", href: "/home", Icon: SparkleIcon },
  { label: "项目", href: "/project", Icon: FolderOpenIcon },
  { label: "资产", href: "/library", Icon: AssetIcon },
  { label: "技能", href: "/skill", Icon: BookOpenIcon },
  { label: "发布", href: "#", Icon: PublishIcon, action: "publish" },
];

type SidebarProps = {
  onOpenMessages: () => void;
};

const ICON_BTN =
  "flex size-9 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white";

export function Sidebar({ onOpenMessages }: SidebarProps) {
  const pathname = usePathname();
  const { status, user, showLogin } = useAuth();
  const isAdmin = normalizeAdminRoles(user?.roles ?? []).length > 0;
  const [publishOpen, setPublishOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab | null>(null);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [inviteCampaignOpen, setInviteCampaignOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Home v2 side navigation"
        className="relative flex h-full w-[64px] shrink-0 flex-col items-stretch bg-black md:w-[108px]"
      >
        {/* Logo（顶部固定） */}
        <div className="flex shrink-0 justify-center px-2 pt-[20px] md:px-3">
          <Link
            href="/home"
            aria-label="bollo 首页"
            title="回到首页"
            className="inline-flex w-full items-center justify-center text-foreground"
          >
            <BolloLogo className="w-[36px] h-auto md:w-full md:h-auto" />
          </Link>
        </div>

        {/* 主导航（弹性伸展，条目多时可独立滚动） */}
        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-2 pt-[24px] md:px-[12px]">
          {NAV_ITEMS.map((item) => {
            const active =
              !item.action &&
              (pathname === item.href ||
                (item.href === "/project" && pathname.startsWith("/comic")));
            const { Icon } = item;
            const content = (
              <>
                {/* active 左侧指示条 */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[-4px] top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-full bg-brand transition-all duration-200",
                    active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                  )}
                />
                <span className="flex shrink-0 items-center justify-center text-current transition-transform duration-200 group-hover:scale-110">
                  <Icon className="size-4" />
                </span>
                <span className="hidden text-[14px] leading-none md:inline">{item.label}</span>
              </>
            );
            const cls = cn(
              "group relative flex h-[54px] w-[48px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[12px] px-2 py-[8px] transition-all duration-150 active:scale-[0.96] md:w-[84px]",
              active
                ? "bg-brand/10 text-brand"
                : "text-white/60 hover:bg-white/[0.05] hover:text-white"
            );

            if (item.action === "publish") {
              return (
                <button
                  key="publish"
                  type="button"
                  onClick={() => status === "authenticated" ? setPublishOpen(true) : showLogin()}
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

        {/* 底部用户区（mt-auto 固定贴底：订阅会员 + 帮助 + 头像） */}
        <div className="flex shrink-0 flex-col items-center gap-1 px-2 pb-[20px] pt-3 md:px-[12px]">
          {isAdmin && (
            <Link href="/admin" aria-label="企业管理后台" title="企业管理后台" className={ICON_BTN}>
              <SettingsIcon className="size-[18px]" />
            </Link>
          )}
          {/* 订阅会员入口（参考站左下角「订阅会员」常驻位） */}
          <Link
            href="/pricing#membership"
            aria-label="订阅会员"
            title="订阅会员"
            className="group relative flex size-9 items-center justify-center rounded-[10px] text-brand ring-1 ring-brand/25 transition-all duration-150 hover:bg-brand/10 hover:ring-brand/50 active:scale-90"
          >
            <CrownIcon className="size-[18px] transition-transform duration-200 group-hover:scale-110" />
          </Link>

          {/* 帮助与反馈（反馈中心 + 站内公告） */}
          <button
            type="button"
            onClick={() => {
              setFeedbackOpen(true);
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
              aria-haspopup="menu"
              className="flex size-9 items-center justify-center rounded-[10px] overflow-hidden ring-1 ring-white/10 transition-all duration-150 hover:ring-white/25 active:scale-90"
            >
              <UserAvatar />
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

      <PublishDialog open={publishOpen} onClose={() => setPublishOpen(false)} />
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
