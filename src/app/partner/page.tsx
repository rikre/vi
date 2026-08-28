"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CrownIcon, MessageIcon, UsersIcon } from "@/components/icons";
import { PartnerContactDialog } from "@/components/partner-contact-dialog";

const PARTNER_HERO =
  "https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=" +
  encodeURIComponent(
    "wide cinematic anime ensemble poster for a creative AI short drama studio, five distinct characters in vertical panels, deep navy and violet atmosphere, subtle warm red glow, premium editorial composition, no text, no logos"
  ) +
  "&image_size=landscape_16_9";

type InfoPanelProps = {
  title: string;
  items: string[];
  Icon: typeof UsersIcon;
};

function InfoPanel({ title, items, Icon }: InfoPanelProps) {
  return (
    <article className="rounded-3xl bg-white/[0.075] p-6 ring-1 ring-white/[0.14] backdrop-blur-md sm:p-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#d8a8ff]/10 text-[#e0b7ff] ring-1 ring-[#d8a8ff]/25">
          <Icon className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
          {title}
        </h2>
      </div>

      <ul className="mt-7 space-y-4 border-t border-white/[0.1] pt-6 text-sm leading-6 text-white/75 sm:text-base">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-[9px] size-1.5 shrink-0 rounded-full bg-[#d8a8ff]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function PartnerPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <AppShell>
      <div className="relative h-full overflow-y-auto overflow-x-hidden bg-[#08090e] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${PARTNER_HERO})` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(172,76,70,0.26),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(58,105,255,0.25),transparent_40%),linear-gradient(180deg,rgba(5,7,16,0.06)_0%,rgba(8,9,14,0.6)_48%,#08090e_76%)]"
        />

        <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
          <header className="mx-auto max-w-[980px] text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-[-0.04em] text-[#dfafff] sm:text-6xl">
              超创合伙人中心
            </h1>
            <p className="mx-auto mt-6 max-w-[900px] text-sm leading-7 text-white/70 sm:text-lg sm:leading-8">
              合伙人计划是超创的推广合作项目，参与者将以合作伙伴身份推广创作工具，成功邀请客户使用产品即可获得相应激励，共同构建“教学 + 工具”的可持续生态。
            </p>

            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="mt-9 inline-flex h-14 w-full max-w-[500px] items-center justify-center gap-2 rounded-2xl bg-[#a855f7] px-8 text-base font-semibold text-white transition-colors hover:bg-[#b86cff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090e] sm:mt-11 sm:h-[68px] sm:text-lg"
            >
              <MessageIcon className="size-5" />
              联系合作顾问
            </button>
          </header>

          <section
            aria-label="合伙人计划信息"
            className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-2 lg:gap-6"
          >
            <InfoPanel
              title="招募对象"
              Icon={UsersIcon}
              items={[
                "合法注册的企业或个体工商户，具备开票资质",
                "拥有 AI 短剧相关客源，具备完整客户服务能力",
                "熟悉产品操作，理解产品核心价值与应用场景",
              ]}
            />
            <InfoPanel
              title="合伙人权益"
              Icon={CrownIcon}
              items={[
                "高额返利：提供合伙人阶梯式返点政策，利润丰厚",
                "行业红利：踩准 AI + 短剧行业风口，共享市场红利",
                "培训赋能：官方定期培训，快速掌握卖点和市场动态",
              ]}
            />
          </section>
        </div>
      </div>
      <PartnerContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
    </AppShell>
  );
}
