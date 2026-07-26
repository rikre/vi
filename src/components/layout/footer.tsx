import Link from "next/link";

import { FooterLogo, XIcon, YouTubeIcon, InstagramIcon, RedditIcon } from "@/components/icons";

const SOCIAL = [
  { label: "X", href: "https://x.com/bollo_ai", Icon: XIcon },
  { label: "YouTube", href: "https://www.youtube.com/@bollo_ai", Icon: YouTubeIcon },
  { label: "Instagram", href: "https://www.instagram.com/bollo_ai/", Icon: InstagramIcon },
  { label: "Reddit", href: "https://www.reddit.com/u/bolloAI", Icon: RedditIcon },
] as const;

const POLICY_LINKS = [
  { label: "隐私声明", href: "https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc" },
  { label: "用户协议", href: "https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc" },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 bg-black px-0 py-20 text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-12 px-6 md:flex-row md:items-start md:justify-between">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <FooterLogo />
          <div className="space-y-1 text-xs text-white/60">
            <p>全球首个动画创作Agent，希望帮助更多人实现自己的动画梦。每一段想象力，都值得被看见。</p>
            <p className="text-[11px] text-white/40">想象力，即刻呈现。</p>
            <p className="text-[11px] text-white/40">© 2025 bollo. 保留所有权利。</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-6 text-xs md:items-end">
          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-white/40">平台协议</span>
              {POLICY_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-white/70 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-white/40">联系我们</span>
              <a
                href="mailto:contact@bollo.ai"
                className="text-[11px] text-white/70 transition-colors hover:text-white"
              >
                contact@bollo.ai
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-white/40">社媒平台</span>
            {SOCIAL.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/70 transition-colors hover:text-white"
              >
                <Icon />
              </Link>
            ))}
            <span className="text-[11px] text-white/40">简体中文</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
