"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  CoinsIcon,
  CrownIcon,
  UserGroupIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  RefreshCwIcon,
} from "@/components/icons";

// ─── 活动配置 ────────────────────────────────────────────────────────────────

const DEADLINE = new Date("2026-10-15T23:59:59+08:00").getTime();

const PRIZES = [
  { rank: "一等奖 ×1", cash: "¥10,000", credits: "10,000 积分", extra: "旗舰版年卡" },
  { rank: "二等奖 ×3", cash: "¥2,000", credits: "5,000 积分", extra: "专业版年卡" },
  { rank: "三等奖 ×6", cash: "¥500", credits: "2,000 积分", extra: "专业版季卡" },
];

const TRACKS = [
  {
    Icon: VideoCameraIcon,
    name: "校园短剧赛道",
    mode: "bollo 剧本模式",
    desc: "以校园生活为母题的 AI 短剧：社团故事、毕业季、宿舍日常、青春群像，3 集以上连载优先",
  },
  {
    Icon: MicrophoneIcon,
    name: "AI 音乐影像赛道",
    mode: "bollo 自由模式",
    desc: "自由创作 MV、视觉短片、实验影像，鼓励风格化探索与视听语言创新",
  },
  {
    Icon: RefreshCwIcon,
    name: "AI 重绘赛道",
    mode: "bollo AI 重绘",
    desc: "用 AI 重绘复刻/重构经典校园名场面、老照片修复焕新、经典影视校园段落二创",
  },
];

const RULES = [
  "参赛作品必须全程使用 bollo 平台创作（剧本模式 / 自由模式 / AI 重绘任一模式），提交时需关联 bollo 项目 ID",
  "作品时长 30 秒 – 5 分钟，分辨率 ≥ 720P，横竖屏不限",
  "每人/每团队限投 3 部，团队参赛不超过 5 人（可绑定 bollo 团队版协作）",
  "作品须为原创，AI 生成内容需符合平台规范；使用 AI 重绘赛道须确保原素材版权合规",
  "参赛即视为授权 bollo 在赛事宣传中展示作品（署名保留）",
];

const JUDGE = [
  { label: "创意与选题", pct: 30 },
  { label: "叙事与节奏", pct: 30 },
  { label: "视觉与视听", pct: 25 },
  { label: "完成度", pct: 15 },
];

const TIMELINE = [
  { date: "09.01", label: "报名开启 · 学生认证通道开放" },
  { date: "10.15", label: "投稿截止" },
  { date: "10.31", label: "评审结束 · 入围公示" },
  { date: "11.10", label: "获奖名单公布 · 颁奖直播" },
];

// ─── 倒计时（客户端计算，防 hydration error）─────────────────────────────────

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, DEADLINE - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return { d: "--", h: "--", m: "--", s: "--" };
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
}

// ─── 通用区块 ────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brand/50" />
        <h2 className="text-[20px] font-bold tracking-widest text-white">
          <span className="text-brand">✦</span> {title} <span className="text-brand">✦</span>
        </h2>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brand/50" />
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

// ─── 页面 ────────────────────────────────────────────────────────────────────

export default function CampusCampaignPage() {
  const cd = useCountdown();

  return (
    <div className="min-h-screen bg-[#08081a] text-white">
      {/* 背景光晕 */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#4338ca]/20 blur-[120px]" />
        <div className="absolute top-[30%] -left-40 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/15 blur-[100px]" />
        <div className="absolute top-[60%] -right-40 h-[400px] w-[400px] rounded-full bg-brand/10 blur-[100px]" />
      </div>

      {/* 顶栏 */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08081a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[860px] items-center justify-between px-5 py-3">
          <Link href="/home" className="flex items-center gap-1.5 text-[13px] text-white/60 transition-colors hover:text-white">
            <ChevronLeftIcon className="size-4" />
            返回首页
          </Link>
          <span className="text-[15px] font-bold tracking-wide">
            bollo <span className="text-brand">·</span> 校园漫剧创作大赛
          </span>
          <Link
            href="/create"
            className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
          >
            立即参赛
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[860px] px-5 pb-24">
        {/* Hero */}
        <div className="pt-16 text-center">
          <p className="text-[12px] font-semibold tracking-[0.3em] text-white/50">
            CAMPUS AI MANJU COMPETITION
          </p>
          <h1 className="mt-4 text-[44px] font-black leading-tight md:text-[56px]">
            <span className="bg-gradient-to-r from-[#7dd3fc] via-[#c4b5fd] to-brand bg-clip-text text-transparent">
              AI · 剧在校园
            </span>
          </h1>
          <p className="mt-2 text-[18px] font-semibold text-white/85">
            校园版漫剧创作大赛 AMI
          </p>
          <p className="mt-3 text-[13px] text-white/55">
            主办单位：bollo × 高校数字媒体联盟 ｜ 指定创作工具：<span className="font-bold text-brand">bollo</span>
          </p>
          <p className="mt-1 text-[12px] text-white/40">
            面向全国高校在校生（专科 / 本科 / 研究生），个人与团队均可参赛
          </p>

          {/* 征稿通道 */}
          <div className="mx-auto mt-8 w-fit rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-brand/20 px-8 py-4 ring-1 ring-white/15">
            <p className="text-[13px] font-bold tracking-widest text-white">
              《 征稿通道开启 》
            </p>
            <p className="mt-1 text-[12px] text-white/60">
              9 月 1 日 – 10 月 15 日 ｜ 全程在 bollo 平台创作并提交
            </p>
          </div>
        </div>

        {/* 奖金池 */}
        <Section title="奖金设置">
          <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.08]">
            <div className="flex items-center justify-center gap-3">
              <CrownIcon className="size-7 text-brand" />
              <p className="text-[15px] text-white/70">总奖金池</p>
              <p className="font-mono text-[36px] font-black text-brand">¥20,000</p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {PRIZES.map((p, i) => (
                <div
                  key={p.rank}
                  className={
                    "rounded-xl p-4 text-center ring-1 " +
                    (i === 0
                      ? "bg-brand/10 ring-brand/40"
                      : "bg-white/[0.03] ring-white/[0.08]")
                  }
                >
                  <p className="text-[12px] font-semibold text-white/60">{p.rank}</p>
                  <p className="mt-2 font-mono text-[20px] font-black text-white">{p.cash}</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-[12px] font-semibold text-brand">
                    <CoinsIcon className="size-3.5" />
                    {p.credits}
                  </p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-white/50">
                    <CrownIcon className="size-3" />
                    {p.extra}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[12px] text-white/45">
              另设「最佳人气奖」×10：1,000 积分 ｜ 「参与奖」：完赛即得 200 积分
            </p>
          </div>
        </Section>

        {/* 百万积分补贴 */}
        <Section title="校园创作补贴">
          <div className="rounded-2xl bg-gradient-to-r from-brand/[0.12] to-transparent p-6 ring-1 ring-brand/30">
            <p className="text-[16px] font-bold text-white">
              百万积分创作补贴池 <span className="text-brand">· 学生认证专享</span>
            </p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-white/70">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand" />
                完成学生认证（学信网 / 学生证）即领 <b className="text-brand">1,000 积分</b> 创作启动金
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand" />
                参赛作品过初审追加 <b className="text-brand">500 积分</b> 渲染补贴
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand" />
                赛事期间学生账号享 Seedance 2.0 mini <b className="text-brand">4 折</b> 生成特权
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand" />
                高校社团 / 团队版 3 席起购享 <b className="text-brand">9 折</b> 结算价
              </li>
            </ul>
          </div>
        </Section>

        {/* 创作方向（三赛道 = bollo 三模式） */}
        <Section title="创作方向">
          <div className="grid gap-4 md:grid-cols-3">
            {TRACKS.map((t) => (
              <div key={t.name} className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08] transition-colors hover:ring-brand/40">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand/15">
                  <t.Icon className="size-5 text-brand" />
                </div>
                <h3 className="mt-3 text-[15px] font-bold text-white">{t.name}</h3>
                <p className="mt-1 w-fit rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-brand">
                  {t.mode}
                </p>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/60">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[12px] text-white/40">
            三大赛道对应 bollo 三种创作模式，参赛即深度体验完整 AI 制片流水线
          </p>
        </Section>

        {/* 技术要求 */}
        <Section title="技术要求">
          <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.08]">
            <ul className="space-y-3 text-[13px] text-white/70">
              {RULES.map((r, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-[12px] font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 作品规范 + 评审 */}
        <Section title="作品规范与评审">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.08]">
              <h3 className="flex items-center gap-2 text-[14px] font-bold text-white">
                <UserGroupIcon className="size-4 text-brand" />
                投稿流程
              </h3>
              <ol className="mt-4 space-y-3 text-[13px] text-white/65">
                <li>① 注册 bollo 并完成学生认证</li>
                <li>② 创建项目（选择对应赛道模式）完成创作</li>
                <li>③ 成片页点击「参赛」，带 #校园漫剧AMI 标签提交</li>
                <li>④ 初审入围作品进入首页「校园专区」展映拉票</li>
              </ol>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.08]">
              <h3 className="flex items-center gap-2 text-[14px] font-bold text-white">
                <CrownIcon className="size-4 text-brand" />
                评审维度
              </h3>
              <div className="mt-4 space-y-3">
                {JUDGE.map((j) => (
                  <div key={j.label}>
                    <div className="flex justify-between text-[12px] text-white/60">
                      <span>{j.label}</span>
                      <span className="font-mono font-bold text-brand">{j.pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-[#7dff8c]" style={{ width: `${j.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 赛程 */}
        <Section title="赛程日历">
          <div className="grid grid-cols-4 gap-3">
            {TIMELINE.map((t, i) => (
              <div key={t.date} className="relative rounded-xl bg-white/[0.03] p-4 text-center ring-1 ring-white/[0.08]">
                <p className="font-mono text-[20px] font-black text-brand">{t.date}</p>
                <p className="mt-2 text-[11.5px] leading-snug text-white/60">{t.label}</p>
                {i < TIMELINE.length - 1 && (
                  <span aria-hidden className="absolute -right-2.5 top-1/2 hidden text-white/25 md:block">→</span>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 倒计时 + CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-b from-indigo-500/15 to-transparent p-8 text-center ring-1 ring-white/10">
          <p className="text-[13px] tracking-widest text-white/50">距投稿截止</p>
          <div className="mt-4 flex items-center justify-center gap-2 font-mono">
            {[
              { v: cd.d, u: "天" },
              { v: cd.h, u: "时" },
              { v: cd.m, u: "分" },
              { v: cd.s, u: "秒" },
            ].map((x, i) => (
              <div key={x.u} className="flex items-center gap-2">
                <div className="rounded-lg bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
                  <span className="text-[26px] font-black text-white">{x.v}</span>
                </div>
                <span className="text-[12px] text-white/45">{x.u}</span>
                {i < 3 && <span className="text-white/30">:</span>}
              </div>
            ))}
          </div>
          <Link
            href="/create"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-[#00e5c8] to-[#7dff8c] px-10 py-3 text-[15px] font-black text-black shadow-lg shadow-brand/20 transition-transform hover:brightness-105 active:scale-95"
          >
            用 bollo 立即参赛 →
          </Link>
          <p className="mt-3 text-[11px] text-white/40">
            参赛即视为同意《赛事规则》｜ 活动最终解释权归 bollo 所有
          </p>
        </div>
      </main>
    </div>
  );
}
