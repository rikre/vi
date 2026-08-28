"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_TABS,
  RANGE_OPTIONS,
  KPI_CARDS,
  TREND_DATA,
  PROJECT_RANK,
  GROUP_SHARE,
  MEMBER_RANK,
  GEN_TYPES,
  TEAM_KPIS,
  TEAM_LIST,
  MEMBER_LIST,
  LEDGER_LIST,
  type DashboardTab,
  type RangeKey,
} from "@/lib/team-data";

// ─── Helpers ────────────────────────────────────────────────────────────────

const compactNumber = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);

const TONE_MAP = {
  lime: { icon: "text-brand", bg: "bg-brand/10" },
  blue: { icon: "text-info", bg: "bg-info/10" },
  violet: { icon: "text-info", bg: "bg-info/10" },
} as const;

// ─── Sub-components ─────────────────────────────────────────────────────────

function TrendChart() {
  const max = Math.max(...TREND_DATA.map((d) => d.value));
  return (
    <div className="flex h-[220px] items-end gap-3 px-2">
      {TREND_DATA.map((d) => (
        <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
            {compactNumber(d.value)}
          </span>
          <div
            className="w-full rounded-t-md bg-brand/70 transition-colors group-hover:bg-brand"
            style={{ height: `${Math.max((d.value / max) * 180, 4)}px` }}
          />
          <span className="text-[10px] text-white/40">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart() {
  const total = GEN_TYPES.reduce((s, g) => s + g.share, 0);
  const segments = GEN_TYPES.reduce<Array<(typeof GEN_TYPES)[number] & { start: number; end: number }>>(
    (acc, g) => {
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      acc.push({ ...g, start, end: start + g.share / total });
      return acc;
    },
    []
  );

  const r = 70;
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 200 200" className="size-[200px]">
      {segments.map((seg) => {
        const dashLen = (seg.share / total) * circumference;
        const dashOffset = -seg.start * circumference;
        return (
          <circle
            key={seg.name}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="28"
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
            className="transition-opacity hover:opacity-80"
          />
        );
      })}
      <text x="100" y="95" textAnchor="middle" className="fill-white text-[22px] font-bold">
        8
      </text>
      <text x="100" y="115" textAnchor="middle" className="fill-white/40 text-[11px]">
        生成类型
      </text>
    </svg>
  );
}

function RankBar({ name, share, points, duration, color, rank }: {
  name: string; share: number; points: string; duration: string; color: string; rank?: number;
}) {
  return (
    <li className="flex items-center gap-3 py-2">
      {rank != null && rank > 0 && (
        <span className="flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white/50">
          {rank}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-white">{name}</div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, background: color }} />
        </div>
        <div className="mt-0.5 text-[11px] text-white/35">
          {share > 0 && <>{share}% · </>}生成时长 {duration} 秒
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-[13px] font-semibold text-white">{points}</span>
        <span className="ml-0.5 text-[10px] text-white/40">PT</span>
      </div>
    </li>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-white">{title}</h3>
        {action && <span className="text-[11px] text-white/35">{action}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Tab Panels ─────────────────────────────────────────────────────────────

function EfficiencyPanel() {
  const [range, setRange] = useState<RangeKey>("近 7 天");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-white">AI 剧制效能大盘</h2>
          <p className="mt-0.5 text-[12px] text-white/35">数据更新时间：2026/7/2 15:00:00</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-white/60 transition-colors hover:bg-white/[0.05]">
          导出报告
        </button>
      </div>

      {/* Range filter */}
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-white/40">时间维度</span>
        <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] transition-colors",
                range === r ? "bg-brand text-brand-foreground font-semibold" : "text-white/50 hover:text-white/80"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPI_CARDS.map((card) => {
          const tone = TONE_MAP[card.tone];
          return (
            <div key={card.key} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-white/45">{card.label}</span>
                <span className={cn("flex size-7 items-center justify-center rounded-lg text-[13px]", tone.bg, tone.icon)}>
                  {card.unit === "PT" ? "⚡" : card.unit === "秒" ? "⏱" : "📋"}
                </span>
              </div>
              <div className="mt-2 text-[24px] font-bold tracking-tight text-white">
                {card.value}
                <span className="ml-1 text-[12px] font-normal text-white/40">{card.unit}</span>
              </div>
              <div className={cn("mt-1.5 text-[11px] font-medium", card.up ? "text-success" : "text-danger")}>
                {card.up ? "▲" : "▼"} {Math.abs(card.delta)}% 较上一周期
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend + Project rank */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="日趋势" action="每日趋势详情">
          <TrendChart />
        </Card>
        <Card title="制剧项目能耗份额" action="Top 5">
          <ul className="divide-y divide-white/[0.04]">
            {PROJECT_RANK.map((item) => (
              <RankBar key={item.rank} {...item} />
            ))}
          </ul>
        </Card>
      </div>

      {/* Group share + Member rank */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="制剧小组分配占比">
          <ul className="divide-y divide-white/[0.04]">
            {GROUP_SHARE.map((item) => (
              <RankBar key={item.name} {...item} />
            ))}
          </ul>
        </Card>
        <Card title="成员贡献排行" action="Top 5">
          <ul className="divide-y divide-white/[0.04]">
            {MEMBER_RANK.map((item) => (
              <li key={item.rank} className="flex items-center gap-3 py-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white/50">
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-white">{item.name}</div>
                  <div className="text-[11px] text-white/35">{item.team} · 生成时长 {item.duration} 秒</div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[13px] font-semibold text-white">{item.points}</span>
                  <span className="ml-0.5 text-[10px] text-white/40">PT</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Gen type breakdown */}
      <Card title="生成类型拆分">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
          <DonutChart />
          <ul className="flex-1 space-y-2.5 pt-2">
            {GEN_TYPES.slice(0, 5).map((item) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] text-white">{item.name}</span>
                  <span className="ml-2 text-[11px] text-white/35">{item.duration} 秒 · {item.count} 次</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[13px] font-semibold text-white">{item.points}</span>
                  <span className="ml-0.5 text-[10px] text-white/40">PT</span>
                  <span className="ml-2 text-[11px] text-white/35">{item.pct}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

function TeamPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM_KPIS.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <span className="text-[12px] text-white/45">{kpi.label}</span>
            <div className="mt-1.5 text-[22px] font-bold text-white">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-brand px-3.5 py-1.5 text-[12px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover">
          新建团队
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="min-w-[860px] w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {["团队名称", "状态", "团队积分", "成员数量", "备注", "创建日期", "操作"].map((h) => (
                <th key={h} className="px-4 py-3 text-[12px] font-medium text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {TEAM_LIST.map((row) => (
              <tr key={row.name} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">有效</span>
                </td>
                <td className="px-4 py-3 font-semibold text-brand">{row.points}</td>
                <td className="px-4 py-3 text-white/60">{row.members}</td>
                <td className="px-4 py-3 text-white/35">{row.note}</td>
                <td className="px-4 py-3 text-white/35">{row.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {["管理", "分配", "回收", "移除"].map((a) => (
                      <button key={a} className={cn(
                        "rounded px-2 py-0.5 text-[11px] transition-colors",
                        a === "移除" ? "text-danger/70 hover:bg-danger/10 hover:text-danger" : "text-white/40 hover:bg-white/[0.06] hover:text-white/70"
                      )}>
                        {a}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[12px] text-white/35">
          <span>第 1/1 页 · 共 {TEAM_LIST.length} 条</span>
          <div className="flex gap-1.5">
            <button disabled className="rounded px-2 py-0.5 text-white/20">上一页</button>
            <button disabled className="rounded px-2 py-0.5 text-white/20">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberPanel() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button className="rounded-lg border border-white/10 px-3.5 py-1.5 text-[12px] text-white/60 transition-colors hover:bg-white/[0.05]">
          邮箱邀请
        </button>
        <button className="rounded-lg bg-brand px-3.5 py-1.5 text-[12px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover">
          链接邀请
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="min-w-[760px] w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {["成员", "备注", "邀请状态", "邀请方式", "邀请时间", "操作"].map((h) => (
                <th key={h} className="px-4 py-3 text-[12px] font-medium text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {MEMBER_LIST.map((row) => (
              <tr key={row.contact} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-[12px] text-white/50">
                      {row.name[0]?.toUpperCase()}
                    </span>
                    <div>
                      <div className="font-medium text-white">{row.name}</div>
                      <div className="text-[11px] text-white/35">{row.contact}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/35">-</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    row.status === "已接受" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/35">{row.channel}</td>
                <td className="px-4 py-3 text-white/35">{row.time}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {row.status === "待接受" && (
                      <button className="rounded px-2 py-0.5 text-[11px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70">
                        重发激活
                      </button>
                    )}
                    <button className="rounded px-2 py-0.5 text-[11px] text-danger/70 transition-colors hover:bg-danger/10 hover:text-danger">
                      移除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LedgerPanel() {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="min-w-[760px] w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            {["动作", "变动", "余额", "目标", "备注", "创建时间"].map((h) => (
              <th key={h} className="px-4 py-3 text-[12px] font-medium text-white/40">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {LEDGER_LIST.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-medium text-white">{row.action}</td>
              <td className={cn("px-4 py-3 font-semibold", row.change < 0 ? "text-danger" : "text-success")}>
                {row.change > 0 ? "+" : ""}{row.change.toLocaleString("en-US")}
              </td>
              <td className="px-4 py-3 font-mono text-[12px] text-white/50">{row.balance}</td>
              <td className="px-4 py-3 text-white/35">{row.target}</td>
              <td className="px-4 py-3 text-white/35">{row.note}</td>
              <td className="px-4 py-3 text-white/35">{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function TeamDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("效能");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1" role="tablist" aria-label="效能大盘导航">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors",
              activeTab === tab
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-white/50 hover:text-white/80"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panels */}
      {activeTab === "效能" && <EfficiencyPanel />}
      {activeTab === "团队" && <TeamPanel />}
      {activeTab === "成员" && <MemberPanel />}
      {activeTab === "流水" && <LedgerPanel />}
    </div>
  );
}
