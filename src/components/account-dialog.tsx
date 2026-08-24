"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CoinsIcon,
  DocumentIcon,
  EditIcon,
  GiftIcon,
  LayersIcon,
  LogoutIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";

/* ---------- Mock 数据 ---------- */

const CHARGE_ROWS = [
  { order: "22593283300458096302", type: "银行转账", amount: 0, credits: 1000000, status: "已完成", created: "2026-05-21 16:50:22", paid: "2026-05-21 15:50:22" },
  { order: "22593283300445053032", type: "赠送派送", amount: 0, credits: 60000, status: "已完成", created: "2026-05-21 16:50:22", paid: "2026-05-21 15:50:22" },
  { order: "22593286045108383821", type: "银行转账", amount: 0, credits: 1590000, status: "已取消", created: "2026-05-21 15:46:02", paid: "2026-05-21 15:47:04" },
  { order: "22586258470828345284", type: "银行转账", amount: 0, credits: 6000, status: "已完成", created: "2026-05-19 11:38:51", paid: "2026-05-19 11:38:51" },
  { order: "22575052026947602252", type: "微信支付", amount: 0, credits: 200000, status: "已完成", created: "2026-05-08 17:16:21", paid: "2026-05-08 17:16:21" },
  { order: "22575052026947601253", type: "赠送派送", amount: 0, credits: 12500, status: "已完成", created: "2026-05-08 17:16:21", paid: "2026-05-08 17:16:21" },
  { order: "22575032042736753711", type: "微信支付", amount: 10000, credits: 6000, status: "已取消", created: "2026-05-08 16:51:19", paid: "-" },
  { order: "22542535659234015147", type: "银行转账", amount: 10000, credits: 5000, status: "已完成", created: "2026-04-17 13:59:09", paid: "2026-04-17 13:59:09" },
  { order: "20121869203153881581", type: "银行转账", amount: 108000, credits: 540000, status: "已完成", created: "2025-11-20 19:27:40", paid: "2025-11-20 18:27:40" },
  { order: "20121869203171578081", type: "银行转账", amount: 2000, credits: 1000, status: "已完成", created: "2025-11-14 15:31:34", paid: "2025-11-14 15:31:34" },
];

const POINTS_ROWS = [
  { time: "2026-05-19 16:56:00", type: "编辑图片", order: 145303, points: -3, balance: 145300, detail: "角色[黑衣男]：生成一个新，图-基础图片-1" },
  { time: "2026-05-10 17:39:14", type: "剧本积分", order: 145313, points: -10, balance: 145323, detail: "片场[第17集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:38:23", type: "剧本积分", order: 145323, points: -10, balance: 146313, detail: "片场[第19集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:38:05", type: "剧本积分", order: 145333, points: -10, balance: 145323, detail: "片场[第12集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:37:41", type: "剧本积分", order: 145343, points: -10, balance: 146333, detail: "片场[第24集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:37:09", type: "剧本积分", order: 145353, points: -10, balance: 146343, detail: "片场[第17集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:37:05", type: "剧本积分", order: 145363, points: -10, balance: 146363, detail: "片场[第12集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:36:56", type: "剧本积分", order: 145373, points: -10, balance: 146383, detail: "片场[第12集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:36:50", type: "剧本积分", order: 145383, points: -10, balance: 146373, detail: "片场[第21集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:36:48", type: "剧本积分", order: 145393, points: -10, balance: 146383, detail: "片场[第22集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:36:24", type: "剧本积分", order: 145403, points: -10, balance: 146393, detail: "片场[第20集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:36:09", type: "剧本积分", order: 145413, points: -10, balance: 145403, detail: "片场[第41集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:35:55", type: "剧本积分", order: 145423, points: -10, balance: 145413, detail: "片场[第42集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:35:50", type: "剧本积分", order: 145433, points: -10, balance: 145423, detail: "片场[第43集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:35:50", type: "剧本积分", order: 145443, points: -10, balance: 145433, detail: "片场[第44集]：文本转剧本-蓝天1.0" },
  { time: "2026-05-10 17:35:41", type: "剧本积分", order: 145453, points: -10, balance: 145443, detail: "片场[第45集]：文本转剧本-蓝天1.0" },
];

const INVOICE_ROWS = [
  { order: "ORD17746137907387407", time: "2026-03-27 20:16", type: "积分充值", amount: "¥1.00", status: "已完成", downloadable: true },
  { order: "ORD17740829766024313", time: "2026-03-21 16:49", type: "积分充值", amount: "¥1.00", status: "已退款", downloadable: false },
  { order: "ORD17740824448286622", time: "2026-03-21 16:40", type: "积分充值", amount: "¥0.50", status: "已退款", downloadable: false },
];

const TASK_ROWS = [
  { time: "2026-05-21 16:42:10", task: "Seedance 2.5 · 视频生成 10s", status: "成功", credits: -830 },
  { time: "2026-05-21 15:12:44", task: "Seedance 2.0 mini · 视频生成 5s", status: "成功", credits: -140 },
  { time: "2026-05-20 19:03:27", task: "文本转图片 · 蓝天1.0 ×10", status: "成功", credits: -100 },
  { time: "2026-05-20 18:47:52", task: "Seedance 2.5 · 视频生成 15s", status: "失败", credits: 0 },
];

/* ---------- 通用 UI ---------- */

function StatusPill({ status }: { status: string }) {
  const ok = status === "已完成" || status === "成功";
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[11px] font-medium",
        ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
      )}
    >
      {status}
    </span>
  );
}

function Pager({ from, to, total, pages = 1 }: { from: number; to: number; total: number; pages?: number }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-3 text-[12px] text-white/45">
      <span>
        第 {from}-{to} 条/总共 {total} 条
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            className={cn(
              "size-6 rounded-md text-[11px] transition-colors",
              p === 1 ? "bg-brand font-bold text-black" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.1]",
            )}
          >
            {p}
          </button>
        ))}
        {pages > 5 && <span className="text-white/40">… {pages}</span>}
      </div>
    </div>
  );
}

const TH = "px-4 py-2.5 text-left text-[12px] font-medium text-white/50";
const TD = "px-4 py-3 text-[13px] text-white/80";

/* ---------- 子页：个人资料 ---------- */

function ProfileTab({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="max-w-[720px]">
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-5">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.08] text-[18px] font-bold text-white">
          b
        </div>
        <span className="text-[15px] font-semibold text-white">bollo 用户</span>
        <button type="button" aria-label="编辑昵称" className="text-white/40 transition-colors hover:text-white">
          <EditIcon className="size-4" />
        </button>
      </div>

      {[
        { label: "手机", value: "166****8669", action: "更换手机" },
        { label: "邮箱", value: "未绑定", action: "绑定邮箱" },
      ].map((row) => (
        <div key={row.label} className="flex items-center justify-between border-b border-white/[0.08] py-5">
          <div>
            <p className="text-[14px] font-medium text-white">{row.label}</p>
            <p className="mt-1 text-[13px] text-white/45">{row.value}</p>
          </div>
          <button
            type="button"
            onClick={() => console.log(row.action)}
            className="rounded-lg border border-white/15 px-4 py-2 text-[13px] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {row.action}
          </button>
        </div>
      ))}

      {/* 退出登录（原「密码设置 / 账号注销」已移除） */}
      <div className="flex items-center justify-between py-5">
        <div>
          <p className="text-[14px] font-medium text-white">退出登录</p>
          <p className="mt-1 text-[13px] text-white/45">退出后返回登录页，账号数据不受影响</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-lg border border-danger/40 px-4 py-2 text-[13px] text-danger transition-colors hover:bg-danger/10"
        >
          <LogoutIcon className="size-3.5" />
          退出登录
        </button>
      </div>
    </div>
  );
}

/* ---------- 子页：积分充值（充值记录） ---------- */

function ChargeTab() {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-white">充值记录</h3>
      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        <table className="w-full border-collapse bg-white/[0.02]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className={TH}>订单号</th>
              <th className={TH}>可用类型</th>
              <th className={TH}>充值金额</th>
              <th className={TH}>充值积分</th>
              <th className={TH}>支付状态</th>
              <th className={TH}>创建时间</th>
              <th className={TH}>支付时间</th>
            </tr>
          </thead>
          <tbody>
            {CHARGE_ROWS.map((r) => (
              <tr key={r.order} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className={cn(TD, "font-mono text-[12px] text-white/60")}>{r.order}</td>
                <td className={TD}>{r.type}</td>
                <td className={TD}>¥{r.amount.toLocaleString()}</td>
                <td className={cn(TD, "text-success")}>+{r.credits.toLocaleString()}</td>
                <td className={TD}>
                  <StatusPill status={r.status} />
                </td>
                <td className={cn(TD, "text-white/55")}>{r.created}</td>
                <td className={cn(TD, "text-white/55")}>{r.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager from={1} to={10} total={10} />
    </div>
  );
}

/* ---------- 子页：账单发票 ---------- */

function InvoiceTab() {
  return (
    <div>
      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.08]">
        <p className="text-[13px] text-white/70">
          <span className="font-semibold text-white">发票信息</span>
          <span className="ml-2 text-white/45">更新您的付款和发票信息</span>
        </p>
        <button
          type="button"
          onClick={() => console.log("刷新发票")}
          className="rounded-lg border border-white/15 px-3.5 py-1.5 text-[12px] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          刷新
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        <table className="w-full border-collapse bg-white/[0.02]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className={TH}>订单号</th>
              <th className={TH}>时间</th>
              <th className={TH}>类型</th>
              <th className={TH}>金额</th>
              <th className={TH}>状态</th>
              <th className={TH}>发票</th>
            </tr>
          </thead>
          <tbody>
            {INVOICE_ROWS.map((r) => (
              <tr key={r.order} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className={cn(TD, "font-mono text-[12px] text-white/60")}>{r.order}</td>
                <td className={cn(TD, "text-white/55")}>{r.time}</td>
                <td className={TD}>{r.type}</td>
                <td className={TD}>{r.amount}</td>
                <td className={TD}>
                  <StatusPill status={r.status} />
                </td>
                <td className={TD}>
                  {r.downloadable ? (
                    <button
                      type="button"
                      onClick={() => console.log("下载发票", r.order)}
                      className="text-[13px] font-medium text-info transition-colors hover:underline"
                    >
                      下载
                    </button>
                  ) : (
                    <span className="text-white/25">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager from={1} to={3} total={3} />
    </div>
  );
}

/* ---------- 子页：积分明细 ---------- */

function PointsTab() {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-white">积分明细</h3>

      {/* 筛选栏 */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.08]">
        <span className="text-[12px] text-white/50">时间&日期：</span>
        <input
          type="date"
          aria-label="开始日期"
          className="rounded-md bg-white/[0.05] px-2.5 py-1.5 text-[12px] text-white/70 ring-1 ring-white/[0.08] focus:outline-none focus:ring-brand/40"
        />
        <span className="text-white/30">→</span>
        <input
          type="date"
          aria-label="结束日期"
          className="rounded-md bg-white/[0.05] px-2.5 py-1.5 text-[12px] text-white/70 ring-1 ring-white/[0.08] focus:outline-none focus:ring-brand/40"
        />
        <span className="ml-2 text-[12px] text-white/50">类型：</span>
        <select
          aria-label="类型筛选"
          className="rounded-md bg-white/[0.05] px-2.5 py-1.5 text-[12px] text-white/70 ring-1 ring-white/[0.08] focus:outline-none focus:ring-brand/40"
        >
          <option>请选择</option>
          <option>剧本积分</option>
          <option>编辑图片</option>
          <option>视频生成</option>
        </select>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/15 px-3.5 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            重置
          </button>
          <button
            type="button"
            className="rounded-lg bg-brand px-4 py-1.5 text-[12px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
          >
            查询
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        <table className="w-full border-collapse bg-white/[0.02]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className={TH}>时间&日期</th>
              <th className={TH}>类型</th>
              <th className={TH}>交易单号</th>
              <th className={TH}>积分</th>
              <th className={TH}>交易后余额</th>
              <th className={TH}>交易详情</th>
            </tr>
          </thead>
          <tbody>
            {POINTS_ROWS.map((r, i) => (
              <tr key={`${r.order}-${i}`} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className={cn(TD, "text-white/55")}>{r.time}</td>
                <td className={TD}>{r.type}</td>
                <td className={cn(TD, "font-mono text-[12px] text-white/60")}>{r.order}</td>
                <td className={cn(TD, "text-danger")}>{r.points}</td>
                <td className={TD}>{r.balance.toLocaleString()}</td>
                <td className={cn(TD, "max-w-[280px] truncate text-white/55")}>{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager from={1} to={16} total={553} pages={37} />
    </div>
  );
}

/* ---------- 子页：任务明细 ---------- */

function TaskTab() {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-white">任务明细</h3>
      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        <table className="w-full border-collapse bg-white/[0.02]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className={TH}>时间</th>
              <th className={TH}>任务</th>
              <th className={TH}>状态</th>
              <th className={TH}>积分消耗</th>
            </tr>
          </thead>
          <tbody>
            {TASK_ROWS.map((r, i) => (
              <tr key={i} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className={cn(TD, "text-white/55")}>{r.time}</td>
                <td className={TD}>{r.task}</td>
                <td className={TD}>
                  <StatusPill status={r.status} />
                </td>
                <td className={cn(TD, r.credits < 0 ? "text-danger" : "text-white/40")}>
                  {r.credits < 0 ? r.credits : "不扣费（失败返还）"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager from={1} to={4} total={4} />
    </div>
  );
}

/* ---------- 子页：问题反馈 ---------- */

function FeedbackTab() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-[560px]">
      <h3 className="text-[15px] font-semibold text-white">问题反馈</h3>
      <p className="mt-1 text-[12px] text-white/45">告诉我们你遇到的问题或建议，我们会在 1-2 个工作日内回复</p>
      <select
        aria-label="反馈类型"
        className="mt-4 w-full rounded-lg bg-white/[0.05] px-3 py-2.5 text-[13px] text-white/75 ring-1 ring-white/[0.08] focus:outline-none focus:ring-brand/40"
      >
        <option>生成质量问题</option>
        <option>积分/账单问题</option>
        <option>功能建议</option>
        <option>其他</option>
      </select>
      <textarea
        rows={5}
        placeholder="请详细描述你的问题…"
        className="mt-3 w-full resize-none rounded-lg bg-white/[0.05] px-3 py-2.5 text-[13px] text-white/85 ring-1 ring-white/[0.08] placeholder:text-white/30 focus:outline-none focus:ring-brand/40"
      />
      <button
        type="button"
        onClick={() => setSent(true)}
        className="mt-3 rounded-lg bg-brand px-5 py-2 text-[13px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
      >
        {sent ? "已提交，感谢反馈" : "提交反馈"}
      </button>
    </div>
  );
}

/* ---------- 子页：邀请好友 ---------- */

function InviteTab() {
  const [copied, setCopied] = useState(false);
  const code = "MIV7AL56CFXRMVT";

  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(true);
  };

  return (
    <div className="max-w-[760px]">
      <h3 className="text-[16px] font-bold text-white">邀请好友</h3>
      <p className="mt-1.5 text-[12px] text-white/45">
        每邀请 1 位好友注册并订阅会员，可获得 200 积分，30 天有效；好友获得 100 积分。
      </p>

      {/* 统计 */}
      <div className="mt-5 rounded-xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
        <div className="grid grid-cols-3">
          {[
            { label: "累计被邀请注册人数", value: "0" },
            { label: "累计达标人数", value: "0" },
            { label: "累计获得积分", value: "0" },
          ].map((s, i) => (
            <div key={s.label} className={cn("flex flex-col items-center", i > 0 && "border-l border-white/[0.06]")}>
              <span className="mb-3 size-1 rounded-full bg-white/30" />
              <span className="text-[12px] text-white/55">{s.label}</span>
              <span className="mt-2 text-[20px] font-bold tabular-nums text-white">{s.value}</span>
            </div>
          ))}
        </div>

        {/* 邀请码 */}
        <div className="mt-5 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/50">邀请码</p>
              <p className="mt-1.5 font-mono text-[20px] font-bold tracking-wide text-white">{code}</p>
            </div>
            <button
              type="button"
              onClick={copy}
              className="rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-black transition-transform hover:brightness-95 active:scale-95"
            >
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          <p className="mt-2.5 text-[11px] text-white/35">被邀请用户超过 30 天未订阅会员则邀请失效</p>
        </div>
      </div>

      {/* 记录 */}
      <h4 className="mt-6 text-[14px] font-semibold text-white">邀请好友记录</h4>
      <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        <table className="w-full border-collapse bg-white/[0.02]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className={TH}>好友</th>
              <th className={TH}>日期</th>
              <th className={TH}>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="px-4 py-10 text-center text-[13px] text-white/35">
                暂无记录
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- AI 水印子弹框 ---------- */

export function AiWatermarkDialog({ onClose }: { onClose: () => void }) {
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI 生成水印设置"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.1]"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 transition-colors hover:text-white"
        >
          <XIcon className="size-4" />
        </button>

        <h3 className="text-center text-[16px] font-bold text-white">AI 生成水印设置</h3>

        <div className="mt-4 space-y-4 text-[13px] leading-relaxed text-white/70">
          <p>
            根据法律法规要求，为提醒用户内容由人工智能生成合成，bollo 平台（“平台”）在人工智能生成内容中添加显式标识及隐式标识。经过您的申请，平台可以向您提供未添加显式标识的
            AI 生成合成内容。如您后续使用网络信息内容传播服务发布 AI
            生成合成内容，请注意您还需主动声明并使用传播平台提供的标识功能进行标识。您理解并承诺，如您未按照法律法规要求在 AI
            生成合成内容上添加显式标识，导致公众混淆或者误认，因此所发生的后果和责任均由您自行承担。
          </p>
          <p>
            打开去除水印开关后，您使用 bollo 前述账号所创作、生成的 AI 生成合成内容将不再添加“AI 生成”明水印，但仍将保留“bollo”品牌水印。
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="text-[14px] font-semibold text-white">去 AI 水印</span>
          <button
            type="button"
            role="switch"
            aria-checked={removeWatermark}
            aria-label="去 AI 水印"
            onClick={() => setRemoveWatermark((v) => !v)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              removeWatermark ? "bg-brand" : "bg-white/[0.15]",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                removeWatermark ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-white/40">
          去除水印打开开关并点击保存设置，代表您已确认充分了解了上述情况并同意
          <br />
          可以在头像 -&gt; AI 生成水印设置 里面修改水印设置
        </p>

        <button
          type="button"
          onClick={() => setSaved(true)}
          className="mt-5 w-full rounded-lg bg-brand py-2.5 text-[14px] font-bold text-black transition-transform hover:brightness-105 active:scale-[0.99]"
        >
          {saved ? "已保存" : "保存"}
        </button>
      </div>
    </div>
  );
}

/* ---------- 账户管理主弹框 ---------- */

export type AccountTab = "profile" | "charge" | "invoice" | "points" | "task" | "invite" | "feedback";

const ACCOUNT_TABS: { id: AccountTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "个人资料", Icon: UserIcon },
  { id: "charge", label: "积分充值", Icon: CoinsIcon },
  { id: "invoice", label: "账单发票", Icon: DocumentIcon },
  { id: "points", label: "积分明细", Icon: RefreshCwIcon },
  { id: "task", label: "任务明细", Icon: LayersIcon },
  { id: "invite", label: "邀请好友", Icon: GiftIcon },
  { id: "feedback", label: "问题反馈", Icon: MessageSquareIcon },
];

export function AccountDialog({
  open,
  onClose,
  onOpenWatermark,
  initialTab = "profile",
}: {
  open: boolean;
  onClose: () => void;
  onOpenWatermark: () => void;
  initialTab?: AccountTab;
}) {
  const [tab, setTab] = useState<AccountTab>(initialTab);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="账户管理"
      className="fixed inset-0 z-50 flex flex-col bg-[#0d0d0d]"
    >
      {/* 顶栏 */}
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-[15px] font-bold text-white">账户管理</h2>
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="text-white/50 transition-colors hover:text-white"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 左侧菜单 */}
        <aside className="w-[168px] shrink-0 space-y-1 border-r border-white/[0.06] px-3 pt-2">
          {ACCOUNT_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                tab === id ? "bg-white/[0.08] font-medium text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenWatermark}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <EditIcon className="size-4" />
            AI 水印
          </button>
        </aside>

        {/* 右侧内容 */}
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          {tab === "profile" && <ProfileTab onLogout={onClose} />}
          {tab === "charge" && <ChargeTab />}
          {tab === "invoice" && <InvoiceTab />}
          {tab === "points" && <PointsTab />}
          {tab === "task" && <TaskTab />}
          {tab === "invite" && <InviteTab />}
          {tab === "feedback" && <FeedbackTab />}
        </main>
      </div>
    </div>
  );
}
