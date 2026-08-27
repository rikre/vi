"use client";

import { ParticleScene } from "@/components/zaohua/particle-scene";
import { useState } from "react";

function FlameLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 0C20 0 8 12 8 24C8 30.627 13.373 36 20 36C26.627 36 32 30.627 32 24C32 20 30 16 28 14C28 18 24 20 22 20C22 12 26 6 20 0Z"
        fill="#C8FF72"
      />
      <path
        d="M14 28C14 34.627 16.686 40 20 40C23.314 40 26 34.627 26 28C26 24 24 22 22 22C22 26 18 26 14 28Z"
        fill="#8FD42C"
      />
      <path
        d="M0 20C0 20 4 24 8 24C8 18 12 12 20 0C20 0 10 8 6 14C2 20 0 20 0 20Z"
        fill="#C8FF72"
      />
      <path
        d="M40 20C40 20 36 24 32 24C32 18 28 12 20 0C20 0 30 8 34 14C38 20 40 20 40 20Z"
        fill="#C8FF72"
      />
    </svg>
  );
}

function GamepadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21 6H3a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1a2 2 0 0 0 1.73-1l1.5-2.5a2 2 0 0 1 1.74-1h6.06a2 2 0 0 1 1.74 1l1.5 2.5A2 2 0 0 0 20 18h1a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3zM8 13H6v2H5v-2H3v-1h2v-2h1v2h2v1zm8-1a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4h-4z" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function QQIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.331 14.372c-.375-1.205-.806-2.217-1.47-3.874.103-4.352-1.706-7.875-5.873-7.875-4.214 0-5.984 3.591-5.871 7.873-.666 1.66-1.095 2.665-1.47 3.874-.797 2.566-.539 3.628-.342 3.652.422.051 1.643-1.932 1.643-1.932 0 1.149.59 2.646 1.87 3.727-.619.19-1.989.702-1.678 1.261.268.453 4.6-.164 5.84-.305 1.25.14 5.57.758 5.84.305.33-.558-1.063-1.072-1.678-1.261 1.28-1.083 1.87-2.579 1.87-3.727 0 0 1.221 1.983 1.643 1.932.199-.026.457-1.088-.342-3.651z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
    </svg>
  );
}

const navItems = [
  { icon: HomeIcon, label: "首页", active: true },
  { icon: GamepadIcon, label: "漫剧", active: false },
  { icon: FlagIcon, label: "发现", active: false },
  { icon: SearchIcon, label: "搜索", active: false },
  { icon: UserIcon, label: "我的", active: false },
];

export default function ZaohuaPage() {
  const [activeTab, setActiveTab] = useState<"game" | "interactive">("game");
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="relative min-h-screen bg-[#0b1006] text-white overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 115%, rgba(200, 255, 114, 0.10) 0%, rgba(200, 255, 114, 0) 60%), linear-gradient(135deg, rgba(200, 255, 114, 0.15) 9.4%, rgba(200, 255, 114, 0.07) 42%, rgba(200, 255, 114, 0) 86.433%)",
        }}
      />

      <ParticleScene />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <FlameLogo className="h-9 w-auto" />
            <span
              className="text-2xl font-bold tracking-tight"
              style={{
                fontFamily:
                  '"TencentSans W7", "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
              造化工坊
            </span>
          </div>

          <button
            data-no-drag
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-black transition hover:bg-white/90"
          >
            <QQIcon className="h-5 w-5" />
            加入官方Q群
          </button>
        </header>

        <aside className="fixed left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                data-no-drag
                className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition ${
                  item.active
                    ? "text-[#C8FF72]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100">
                  {item.label}
                </span>
              </button>
            );
          })}
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-8">
          <div className="flex flex-col items-center text-center">
            <h1
              className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
              style={{
                fontFamily:
                  '"TencentSans W7", "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
              <span className="text-[#C8FF72]">造化</span>
              <span className="text-[#EBEBEB]">随心 一语成境</span>
            </h1>

            <p className="mb-10 max-w-md text-base text-white/50">
              AI驱动的漫剧梦工厂，输入一段故事，0门槛生成角色、分镜与成片
            </p>

            <div
              data-no-drag
              className="mb-5 inline-flex rounded-full bg-white/[0.08] p-1 ring-1 ring-white/10"
            >
              <button
                onClick={() => setActiveTab("game")}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition ${
                  activeTab === "game"
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <FilmIcon className="h-4 w-4" />
                漫剧创作
              </button>
              <button
                onClick={() => setActiveTab("interactive")}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition ${
                  activeTab === "interactive"
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <GamepadIcon className="h-4 w-4" />
                互动影游
              </button>
            </div>

            <div
              data-no-drag
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[#141416]/90 text-left shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-md transition focus-within:ring-[#C8FF72]/50"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#C8FF72] shadow-[0_0_8px_rgba(200,255,114,0.9)]" />
                  <span className="text-[13px] font-semibold text-white/80">
                    AI 漫剧助手
                  </span>
                </div>
                <span className="text-[11px] text-white/30">造化大模型 1.0 驱动</span>
              </div>

              <div className="px-5 pt-4">
                <textarea
                  rows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="描述你的漫剧故事，例如：重生归来的千金，在豪门晚宴上揭穿假千金的真面目……"
                  className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder:text-white/35 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-white/55 ring-1 ring-white/[0.08] transition hover:bg-white/[0.08] hover:text-white">
                    <UsersIcon className="h-3.5 w-3.5" />
                    角色设计
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-white/55 ring-1 ring-white/[0.08] transition hover:bg-white/[0.08] hover:text-white">
                    <GridIcon className="h-3.5 w-3.5" />
                    分镜脚本
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-white/55 ring-1 ring-white/[0.08] transition hover:bg-white/[0.08] hover:text-white">
                    <MicIcon className="h-3.5 w-3.5" />
                    配音配乐
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-white/55 ring-1 ring-white/[0.08] transition hover:bg-white/[0.08] hover:text-white">
                    <FilmIcon className="h-3.5 w-3.5" />
                    一键成片
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/60 ring-1 ring-white/10 transition hover:bg-white/[0.1]">
                    造化 1.0
                    <ChevronDownIcon className="h-3 w-3" />
                  </button>
                  <button className="rounded-xl bg-[#C8FF72] px-5 py-2 text-[14px] font-semibold text-black transition hover:bg-[#d8ff96]">
                    开启创作
                  </button>
                </div>
              </div>
            </div>

            <div
              data-no-drag
              className="mt-4 flex flex-wrap items-center justify-center gap-2"
            >
              <span className="text-[12px] text-white/30">热门灵感</span>
              {["重生复仇", "玄幻修仙", "甜宠虐恋", "悬疑反转"].map((s) => (
                <button
                  key={s}
                  className="rounded-full bg-white/[0.05] px-3 py-1 text-[12px] text-white/50 ring-1 ring-white/[0.08] transition hover:text-[#C8FF72] hover:ring-[#C8FF72]/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </main>

        <section className="relative z-10 px-6 pb-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2
                className="mb-3 text-2xl font-bold md:text-3xl"
                style={{
                  fontFamily:
                    '"TencentSans W7", "PingFang SC", "Microsoft YaHei", sans-serif',
                }}
              >
                漫剧的世界
              </h2>
              <p className="text-white/50">
                创作者用想象力构建的漫剧宇宙，正在被千万人观看。
              </p>
              <p className="mt-1 text-xs text-white/30">
                本网站内漫剧由AI辅助生成，托举想象，无限可能
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "重生逆袭", desc: "一朝重生，改写豪门命运", tag: "都市" },
                { title: "玄幻修仙", desc: "废柴少年的逆天改命之路", tag: "玄幻" },
                { title: "悬疑反转", desc: "深夜来电揭开尘封真相", tag: "悬疑" },
                { title: "甜宠虐恋", desc: "高冷总裁的追妻火葬场", tag: "恋爱" },
              ].map((card, i) => (
                <div
                  key={i}
                  data-no-drag
                  className="group cursor-pointer overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08] transition hover:-translate-y-1 hover:bg-white/[0.06] hover:ring-white/20"
                >
                  <div
                    className="h-40 w-full"
                    style={{
                      background: `linear-gradient(135deg, rgba(200, 255, 114, ${0.12 + i * 0.05}), rgba(143, 212, 44, ${0.04 + i * 0.03}))`,
                    }}
                  />
                  <div className="p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-semibold">{card.title}</h3>
                      <span className="rounded-full bg-[#C8FF72]/15 px-2 py-0.5 text-[11px] text-[#C8FF72]">
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-[13px] text-white/45">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-white/40">
              <a data-no-drag href="#" className="transition hover:text-white/70">
                关于腾讯
              </a>
              <a data-no-drag href="#" className="transition hover:text-white/70">
                隐私协议
              </a>
              <a data-no-drag href="#" className="transition hover:text-white/70">
                服务条款
              </a>
              <a data-no-drag href="#" className="transition hover:text-white/70">
                粤B2-20090059-5
              </a>
              <a data-no-drag href="#" className="transition hover:text-white/70">
                粤公网安备44030002000001号
              </a>
            </div>
            <div className="text-center text-[12px] leading-relaxed text-white/25">
              <p>公司地址：深圳市南山区粤海街道麻岭社区科技中一路腾讯大厦35层 联系电话：4006 700 700</p>
              <p className="mt-1">Copyright © 1998 - 2026 Tencent. All Rights Reserved</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
