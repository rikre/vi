"use client";

import { AppShell } from "@/components/layout/app-shell";
import {
  UserIcon,
  SettingsIcon,
  LogoutIcon,
  CoinsIcon,
  EditIcon,
  CameraIcon,
  ChevronRightIcon,
  CrownIcon,
  HeartIcon,
  SparkleIcon,
  FolderIcon,
  HelpCircleIcon,
  MessageSquareIcon,
  InfoIcon,
  GiftIcon,
} from "@/components/icons";

const STATS = [
  { label: "作品", value: 12, icon: FolderIcon },
  { label: "技能", value: 48, icon: SparkleIcon },
  { label: "资产", value: 128, icon: HeartIcon },
];

const MENU_ITEMS = [
  {
    id: "profile",
    label: "个人资料",
    Icon: UserIcon,
    desc: "编辑昵称、头像、个人简介",
  },
  {
    id: "account",
    label: "账号设置",
    Icon: SettingsIcon,
    desc: "密码、绑定、安全设置",
  },
  {
    id: "membership",
    label: "会员中心",
    Icon: CrownIcon,
    desc: "查看会员权益、升级方案",
    badge: "首月5折",
  },
  {
    id: "credits",
    label: "我的积分",
    Icon: CoinsIcon,
    desc: "积分余额、充值、消费记录",
    value: "2,580",
  },
  {
    id: "invite",
    label: "邀请好友",
    Icon: GiftIcon,
    desc: "邀请好友得积分奖励",
  },
];

const BOTTOM_MENU = [
  { id: "help", label: "帮助中心", Icon: HelpCircleIcon },
  { id: "feedback", label: "意见反馈", Icon: MessageSquareIcon },
  { id: "about", label: "关于 bollo", Icon: InfoIcon },
];

export default function SpaceNewPage() {
  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        <div className="mt-8 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
              个人中心
            </h1>
            <p className="mt-2 text-[14px] text-white/50">
              管理你的账号和偏好设置
            </p>
          </div>
        </div>

        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand/15 via-white/[0.06] to-white/[0.02] p-6 ring-1 ring-white/[0.08]">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-brand/5 blur-2xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative">
              <div className="relative size-24 overflow-hidden rounded-2xl bg-white/10 ring-4 ring-brand/20">
                <img
                  src="https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=cute%20anime%20avatar%20mascot%20character%20bollo%20lime%20green%20theme%20simple%20design%20friendly%20chibi%20style&image_size=square"
                  alt="用户头像"
                  className="size-full object-cover"
                />
              </div>
              <button
                type="button"
                className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:scale-105 hover:bg-brand-hover"
                aria-label="更换头像"
              >
                <CameraIcon className="size-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">bollo 用户</h2>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-all hover:bg-white/15 hover:text-white"
                  aria-label="编辑昵称"
                >
                  <EditIcon className="size-4" />
                </button>
              </div>
              <p className="mb-4 text-sm text-white/50">ID: 10086420</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  <CrownIcon className="size-3.5 text-white/60" />
                  普通用户
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:shadow-md hover:shadow-brand/20"
                >
                  <CrownIcon className="size-3" />
                  升级会员 →
                </button>
              </div>
            </div>

            <div className="flex gap-6 md:gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-1 flex justify-center">
                    <stat.icon className="size-4 text-white/40" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-brand/20 via-brand/10 to-transparent p-5 ring-1 ring-brand/20">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand/20 text-brand">
              <CoinsIcon className="size-6" />
            </div>
            <div>
              <p className="text-xs text-white/60">可用积分</p>
              <p className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">2,580</span>
                <span className="text-xs text-white/50">积分</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded-xl bg-white/10 px-4 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/15"
            >
              消费记录
            </button>
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded-xl bg-brand px-5 text-[13px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20"
            >
              立即充值
            </button>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl bg-card ring-1 ring-white/[0.05]">
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] ${
                index !== MENU_ITEMS.length - 1
                  ? "border-b border-white/[0.04]"
                  : ""
              }`}
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-white/[0.06] text-white/70 transition-all group-hover:bg-brand/15 group-hover:text-brand">
                <item.Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-medium text-white">{item.label}</p>
                  {item.badge && (
                    <span className="rounded-md bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-white/40">{item.desc}</p>
              </div>
              {item.value && (
                <span className="mr-2 text-[15px] font-semibold text-brand">{item.value}</span>
              )}
              <ChevronRightIcon className="size-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/50" />
            </button>
          ))}
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl bg-card ring-1 ring-white/[0.05]">
          {BOTTOM_MENU.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`flex w-full items-center gap-3 px-5 py-4 text-left text-[14px] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white ${
                index !== BOTTOM_MENU.length - 1
                  ? "border-b border-white/[0.04]"
                  : ""
              }`}
            >
              <item.Icon className="size-4 text-white/40" />
              <span className="flex-1">{item.label}</span>
              <ChevronRightIcon className="size-4 text-white/20" />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.04] py-4 text-[15px] font-medium text-red-400/80 ring-1 ring-white/[0.04] transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogoutIcon className="size-5" />
          退出登录
        </button>

        <p className="mt-8 text-center text-[11px] text-white/20">
          bollo AI · Version 1.0.0 · © 2024
        </p>
      </div>
    </AppShell>
  );
}
