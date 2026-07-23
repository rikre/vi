"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BolloLogo,
  DiscoverIcon,
  PlusIcon,
  FolderIcon,
  AssetIcon,
  SkillIcon,
  PublishIcon,
  WeChatIcon,
  DiscordIcon,
  HelpIcon,
} from "@/components/icons";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "发现", href: "/home", Icon: DiscoverIcon },
  { label: "新建", href: "/new", Icon: PlusIcon },
  { label: "项目", href: "/project", Icon: FolderIcon },
  { label: "资产", href: "/asset", Icon: AssetIcon },
  { label: "技能", href: "/skill", Icon: SkillIcon },
  { label: "发布", href: "/publish", Icon: PublishIcon },
];

const BOTTOM_ITEMS = [
  { aria: "WeChat", Icon: WeChatIcon, href: null },
  { aria: "Discord", Icon: DiscordIcon, href: "https://discord.gg/RjJ4EHS3N9" },
  { aria: "帮助", Icon: HelpIcon, href: "https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Home v2 side navigation"
      className="flex h-full w-[108px] shrink-0 flex-col bg-black"
    >
      {/* Logo */}
      <div className="flex justify-center px-[12px] pt-[20px]">
        <Link
          href="/home"
          aria-label="回到首页"
          title="回到首页"
          className="inline-flex items-center text-foreground"
        >
          <BolloLogo width={84} height={24} />
        </Link>
      </div>

      {/* Top nav group */}
      <div className="flex flex-col items-center gap-1 px-[12px] pt-[36px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const { Icon } = item;
          const content = (
            <>
              <span className="flex shrink-0 items-center justify-center text-current">
                <Icon className="size-4" />
              </span>
              <span className="text-[14px] leading-none">{item.label}</span>
            </>
          );
          const cls = cn(
            "flex h-[58px] w-[84px] shrink-0 flex-col items-center justify-center gap-2 rounded-[14px] px-2 py-[10px] transition-colors",
            active
              ? "bg-white/[0.05] text-white"
              : "text-white/60 hover:bg-white/[0.05] hover:text-white"
          );
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom group */}
      <div className="flex flex-col items-center gap-2 px-[12px] pb-[24px]">
        {BOTTOM_ITEMS.map(({ aria, Icon, href }) => {
          const cls =
            "flex size-9 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white";
          return href ? (
            <Link
              key={aria}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={aria}
              title={aria}
              className={cls}
            >
              <Icon className="size-4" />
            </Link>
          ) : (
            <button
              key={aria}
              type="button"
              aria-label={aria}
              title={aria}
              className={cls}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
