"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────
type TabKey = "效能" | "团队" | "成员" | "流水";
type RangeKey = "今日" | "昨日" | "近7天" | "近30天";

const TABS: TabKey[] = ["效能", "团队", "成员", "流水"];
const RANGES: RangeKey[] = ["今日", "昨日", "近7天", "近30天"];

// ─── Mock data ──────────────────────────────────────────────────────────────

const KPI_CARDS = [
  { label: "算力积分", value: "738,127", unit: "PT", delta: 15.4, up: true },
  { label: "生成时长", value: "12.1", unit: "小时", delta: 8.2, up: true },
  { label: "任务次数", value: "4,360", unit: "次", delta: -6.3, up: false },
];

const TREND_BARS = [62, 38, 80, 55, 72, 45, 28, 90, 66, 48, 76, 58, 84, 42];
const TREND_LABELS = Array.from({ length: 14 }, (_, i) => `${i + 1}日`);

const PROJECT_TOP = [
  { name: "朕真不想当皇帝啊AI版", value: 388655, pct: 52.7 },
  { name: "惊澜入翠微", value: 157524, pct: 21.3 },
  { name: "雾隐山城", value: 107652, pct: 14.5 },
  { name: "非项目生成", value: 63126, pct: 8.6 },
  { name: "30集短剧", value: 21170, pct: 2.9 },
];

const MEMBER_TOP = [
  { name: "王大锤", team: "王导组", value: 112340, color: "#D4FF3F" },
  { name: "费宇晨", team: "王导组", value: 99496, color: "#5f9df6" },
  { name: "陈焕林", team: "王导组", value: 86691, color: "#4cc391" },
  { name: "潘纯惠", team: "王导组", value: 84931, color: "#f0625f" },
  { name: "谢雁雄", team: "张导组", value: 76378, color: "#a78bfa" },
];

const TEAM_KPIS = [
  { label: "主账号总积分", value: "510,000" },
  { label: "已分配", value: "822,930" },
  { label: "已回收", value: "280,000" },
  { label: "团队数", value: "4" },
];

const TEAM_ROWS = [
  { name: "杭州 | 王导组", status: "有效", points: "220,212", members: 21 },
  { name: "武汉 | 世豪", status: "有效", points: "300,000", members: 5 },
  { name: "北京 | 一文组", status: "有效", points: "200,000", members: 2 },
  { name: "杭州 | 张导组", status: "有效", points: "102,718", members: 15 },
];

const MEMBER_ROWS = [
  { name: "Serendipity_WSH__", email: "wsh@wechat.local", status: "已接受" as const, channel: "邀请链接" },
  { name: "王大锤", email: "dachui@company.cn", status: "已接受" as const, channel: "邮件邀请" },
  { name: "406786768", email: "406786768@qq.com", status: "待接受" as const, channel: "邮件邀请" },
  { name: "maohongyi", email: "maohongyi@hrcentury.cn", status: "待接受" as const, channel: "邮件邀请" },
  { name: "haojinghan", email: "haojinghan@hrcentury.cn", status: "待接受" as const, channel: "邮件邀请" },
  { name: "hanjiayi", email: "hanjiayi@hrcentury.cn", status: "待接受" as const, channel: "邮件邀请" },
];

const LEDGER_ROWS = [
  { action: "分配给团队", change: -300000, target: "武汉 | 世豪", time: "2026-07-02 13:29" },
  { action: "分配给团队", change: -200000, target: "北京 | 一文组", time: "2026-07-02 13:28" },
  { action: "公司入账", change: 1000000, target: "—", time: "2026-07-01 11:16" },
  { action: "分配给团队", change: -100000, target: "杭州 | 王导组", time: "2026-07-01 11:13" },
  { action: "分配给团队", change: -100000, target: "杭州 | 张导组", time: "2026-07-01 11:12" },
  { action: "分配给团队", change: -500000, target: "杭州 | 王导组", time: "2026-06-29 18:05" },
  { action: "从团队回收", change: 280000, target: "杭州 | 王导组", time: "2026-06-27 13:22" },
  { action: "分配给团队", change: -500000, target: "杭州 | 王导组", time: "2026-06-27 13:20" },
  { action: "分配给团队", change: -50000, target: "杭州 | 王导组", time: "2026-06-27 13:19" },
  { action: "分配给团队", change: -10000, target: "杭州 | 张导组", time: "2026-06-26 11:23" },
];

// ─── Shared UI ──────────────────────────────────────────────────────────────

const CARD = "rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08]";

function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-white/[0.08] p-1 ring-1 ring-white/10",
        className
      )}
    >
      {tabs.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              active ? "bg-white text-black" : "text-white/60 hover:text-white"
            )}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

// ─── Tab: 效能 ───────────────────────────────────────────────────────────────

function EfficiencyTab() {
  const [range, setRange] = useState<RangeKey>("近7天");
  const maxBar = Math.max(...PROJECT_TOP.map((p) => p.value));

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {KPI_CARDS.map((k) => (
          <div key={k.label} className={CARD}>
            <div className="text-[13px] text-white/50">{k.label}</div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-mono text-[32px] font-extrabold text-white">{k.value}</span>
              <span className="text-[13px] text-white/40">{k.unit}</span>
            </div>
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-[12px] font-medium",
                k.up ? "text-success" : "text-danger"
              )}
            >
              <span>{k.up ? "↑" : "↓"}</span>
              <span>{Math.abs(k.delta)}%</span>
              <span className="text-white/40">环比</span>
            </div>
          </div>
        ))}
      </div>

      {/* Range filter */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-white/40">时间维度</span>
        <PillTabs tabs={RANGES} value={range} onChange={setRange} />
      </div>

      {/* Trend bar chart */}
      <div className={CARD}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-white">日趋势</h3>
          <span className="text-[12px] text-white/40">算力积分消耗</span>
        </div>
        <div className="flex h-[200px] items-end gap-2">
          {TREND_BARS.map((h, i) => (
            <div key={i} className="group flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md transition-all group-hover:opacity-100"
                style={{
                  height: `${h * 1.6}px`,
                  background: `linear-gradient(180deg, #D4FF3F 0%, rgba(212,255,63,0.3) 100%)`,
                  opacity: 0.85,
                }}
              />
              <span className="text-[10px] text-white/30">{TREND_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top projects + Top members */}
      <div className="grid grid-cols-2 gap-4">
        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-white">制剧项目能耗 Top5</h3>
            <span className="text-[12px] text-white/40">按算力积分</span>
          </div>
          <div className="space-y-4">
            {PROJECT_TOP.map((p, i) => (
              <div key={p.name}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-white/40">#{i + 1}</span>
                    <span className="text-white/90">{p.name}</span>
                  </div>
                  <span className="font-mono text-white/70">{p.value.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(p.value / maxBar) * 100}%`,
                      background: "linear-gradient(90deg, #D4FF3F 0%, rgba(212,255,63,0.6) 100%)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-white">成员贡献 Top5</h3>
            <span className="text-[12px] text-white/40">按算力积分</span>
          </div>
          <div className="space-y-3">
            {MEMBER_TOP.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    i === 0
                      ? "bg-brand text-black"
                      : i < 3
                      ? "bg-white/10 text-white/80"
                      : "bg-white/[0.04] text-white/50"
                  )}
                >
                  {i + 1}
                </span>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-black"
                  style={{ background: m.color }}
                >
                  {m.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-white">{m.name}</div>
                  <div className="text-[11px] text-white/40">{m.team}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[14px] font-semibold text-white">
                    {m.value.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-white/40">PT</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: 团队 ───────────────────────────────────────────────────────────────

function TeamTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {TEAM_KPIS.map((k) => (
          <div key={k.label} className={CARD}>
            <div className="text-[13px] text-white/50">{k.label}</div>
            <div className="mt-3 font-mono text-[28px] font-extrabold text-white">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => console.log("新建团队")}
          className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
        >
          + 新建团队
        </button>
      </div>

      <div className={CARD + " overflow-hidden p-0"}>
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-4 border-b border-white/[0.08] px-6 py-3 text-[12px] font-medium text-white/50">
          <div>团队名称</div>
          <div>状态</div>
          <div>积分</div>
          <div>成员数</div>
          <div className="text-right">操作</div>
        </div>
        {/* Rows */}
        {TEAM_ROWS.map((r) => (
          <div
            key={r.name}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr] items-center gap-4 border-b border-white/[0.05] px-6 py-4 text-[13px] transition-colors last:border-0 hover:bg-white/[0.02]"
          >
            <div className="font-medium text-white">{r.name}</div>
            <div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                {r.status}
              </span>
            </div>
            <div className="font-mono font-semibold text-brand">{r.points}</div>
            <div className="text-white/70">{r.members}</div>
            <div className="flex justify-end gap-2 text-[12px]">
              {["管理", "分配", "回收", "移除"].map((a) => (
                <button
                  key={a}
                  onClick={() => console.log(a, r.name)}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors",
                    a === "移除"
                      ? "text-danger/80 hover:bg-danger/10 hover:text-danger"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: 成员 ───────────────────────────────────────────────────────────────

function MemberTab() {
  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-2">
        <button
          onClick={() => console.log("邮箱邀请")}
          className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          邮箱邀请
        </button>
        <button
          onClick={() => console.log("链接邀请")}
          className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          链接邀请
        </button>
      </div>

      <div className={CARD + " overflow-hidden p-0"}>
        <div className="grid grid-cols-[2.5fr_1fr_1fr_1.5fr] gap-4 border-b border-white/[0.08] px-6 py-3 text-[12px] font-medium text-white/50">
          <div>成员</div>
          <div>邀请状态</div>
          <div>邀请方式</div>
          <div className="text-right">操作</div>
        </div>
        {MEMBER_ROWS.map((m) => (
          <div
            key={m.email}
            className="grid grid-cols-[2.5fr_1fr_1fr_1.5fr] items-center gap-4 border-b border-white/[0.05] px-6 py-4 text-[13px] last:border-0 hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-[13px] font-semibold text-white/80">
                {m.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium text-white">{m.name}</div>
                <div className="truncate text-[11px] text-white/40">{m.email}</div>
              </div>
            </div>
            <div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  m.status === "已接受"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                )}
              >
                {m.status}
              </span>
            </div>
            <div className="text-white/60">{m.channel}</div>
            <div className="flex justify-end gap-2 text-[12px]">
              {m.status === "待接受" && (
                <button
                  onClick={() => console.log("重发激活", m.email)}
                  className="rounded-md px-2 py-1 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  重发激活
                </button>
              )}
              <button
                onClick={() => console.log("移除", m.email)}
                className="rounded-md px-2 py-1 text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger"
              >
                移除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: 流水 ───────────────────────────────────────────────────────────────

function LedgerTab() {
  return (
    <div className={CARD + " overflow-hidden p-0"}>
      <div className="grid grid-cols-[1.2fr_1fr_2fr_1.2fr] gap-4 border-b border-white/[0.08] px-6 py-3 text-[12px] font-medium text-white/50">
        <div>动作</div>
        <div>变动金额</div>
        <div>目标团队</div>
        <div className="text-right">时间</div>
      </div>
      {LEDGER_ROWS.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.2fr_1fr_2fr_1.2fr] items-center gap-4 border-b border-white/[0.05] px-6 py-4 text-[13px] last:border-0 hover:bg-white/[0.02]"
        >
          <div className="font-medium text-white">{r.action}</div>
          <div
            className={cn(
              "font-mono font-semibold",
              r.change > 0 ? "text-success" : "text-danger"
            )}
          >
            {r.change > 0 ? "+" : ""}
            {r.change.toLocaleString()}
            <span className="ml-1 text-[11px] font-normal text-white/40">PT</span>
          </div>
          <div className="text-white/60">{r.target}</div>
          <div className="text-right font-mono text-[12px] text-white/40">{r.time}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [tab, setTab] = useState<TabKey>("效能");

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-8">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-bold text-white">团队管理</h1>
                <p className="mt-1 text-[13px] text-white/50">管理团队、成员与算力积分</p>
              </div>
              <Link
                href="/agent"
                className="shrink-0 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-black"
              >
                查看团队数据
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <PillTabs tabs={TABS} value={tab} onChange={setTab} />
          </div>

          {/* Panels */}
          {tab === "效能" && <EfficiencyTab />}
          {tab === "团队" && <TeamTab />}
          {tab === "成员" && <MemberTab />}
          {tab === "流水" && <LedgerTab />}
        </div>
      </div>
    </AppShell>
  );
}
