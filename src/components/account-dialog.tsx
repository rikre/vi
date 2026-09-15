"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import {
  CameraIcon,
  CheckIcon,
  CoinsIcon,
  EditIcon,
  GiftIcon,
  LayersIcon,
  LogoutIcon,
  MailIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  UserIcon,
  WeChatIcon,
  CloseIcon,
} from "@/components/icons";

/* ---------- Mock 数据 ---------- */

const CHARGE_ROWS = [
  { order: "22593283300458096302", type: "银行转账", amount: 100000, credits: 1000000, status: "已完成", created: ago(0, "16:50"), paid: ago(0, "15:50") },
  { order: "22593283300445053032", type: "支付宝自动订阅", amount: 198, credits: 60000, status: "已完成", created: ago(3, "16:50"), paid: ago(3, "15:50") },
  { order: "22593286045108383821", type: "银行转账", amount: 159000, credits: 1590000, status: "已取消", created: ago(5, "15:46"), paid: ago(5, "15:47") },
  { order: "22586258470828345284", type: "支付宝充值", amount: 600, credits: 6000, status: "已完成", created: ago(9, "11:38"), paid: ago(9, "11:38") },
  { order: "22575052026947602252", type: "微信充值", amount: 20000, credits: 200000, status: "已完成", created: ago(14, "17:16"), paid: ago(14, "17:16") },
  { order: "22575052026947601253", type: "支付宝充值", amount: 1250, credits: 12500, status: "已完成", created: ago(18, "17:16"), paid: ago(18, "17:16") },
  { order: "22575032042736753711", type: "微信充值", amount: 600, credits: 6000, status: "已取消", created: ago(22, "16:51"), paid: "-" },
  { order: "22542535659234015147", type: "支付宝自动订阅", amount: 198, credits: 60000, status: "已完成", created: ago(27, "13:59"), paid: ago(27, "13:59") },
  { order: "20121869203153881581", type: "银行转账", amount: 54000, credits: 540000, status: "已完成", created: ago(45, "19:27"), paid: ago(45, "18:27") },
  { order: "20121869203171578081", type: "银行转账", amount: 100, credits: 1000, status: "已完成", created: ago(60, "15:31"), paid: ago(60, "15:31") },
];

/* ---------- 日期工具（相对今天生成演示数据） ---------- */

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

/** n 天前、指定时分的时间字符串，格式 YYYY-MM-DD HH:mm:ss */
function ago(days: number, hm: string) {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return `${isoDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
}

const POINTS_ROWS = [
  { time: ago(0, "16:56"), type: "编辑图片", order: 145303, points: -3, balance: 145300, detail: "角色[黑衣男]：生成一个新，图-基础图片-1" },
  { time: ago(1, "17:39"), type: "剧本积分", order: 145313, points: -10, balance: 145323, detail: "片场[第17集]：文本转剧本-蓝天1.0" },
  { time: ago(2, "17:38"), type: "剧本积分", order: 145323, points: -10, balance: 146313, detail: "片场[第19集]：文本转剧本-蓝天1.0" },
  { time: ago(3, "10:12"), type: "视频生成", order: 145463, points: -830, balance: 145200, detail: "片场[第3集]：Seedance 2.5 视频生成 10s" },
  { time: ago(5, "17:37"), type: "剧本积分", order: 145343, points: -10, balance: 146333, detail: "片场[第24集]：文本转剧本-蓝天1.0" },
  { time: ago(6, "09:24"), type: "编辑图片", order: 145473, points: -6, balance: 146100, detail: "角色[女主]：重绘面部-基础图片-2" },
  { time: ago(8, "17:37"), type: "剧本积分", order: 145353, points: -10, balance: 146343, detail: "片场[第17集]：文本转剧本-蓝天1.0" },
  { time: ago(10, "14:05"), type: "视频生成", order: 145483, points: -140, balance: 146000, detail: "片场[第5集]：Seedance 2.0 mini 视频生成 5s" },
  { time: ago(12, "17:36"), type: "剧本积分", order: 145373, points: -10, balance: 146383, detail: "片场[第12集]：文本转剧本-蓝天1.0" },
  { time: ago(15, "11:48"), type: "编辑图片", order: 145493, points: -3, balance: 146200, detail: "场景[雨夜街道]：图生图-风格化-1" },
  { time: ago(18, "17:36"), type: "剧本积分", order: 145393, points: -10, balance: 146383, detail: "片场[第22集]：文本转剧本-蓝天1.0" },
  { time: ago(21, "20:31"), type: "视频生成", order: 145503, points: -830, balance: 145900, detail: "片场[第8集]：Seedance 2.5 视频生成 10s" },
  { time: ago(24, "17:36"), type: "剧本积分", order: 145413, points: -10, balance: 145403, detail: "片场[第41集]：文本转剧本-蓝天1.0" },
  { time: ago(27, "15:22"), type: "剧本积分", order: 145423, points: -10, balance: 145413, detail: "片场[第42集]：文本转剧本-蓝天1.0" },
  { time: ago(29, "17:35"), type: "编辑图片", order: 145443, points: -3, balance: 145433, detail: "角色[反派]：生成定妆照-基础图片-1" },
  { time: ago(35, "17:35"), type: "剧本积分", order: 145453, points: -10, balance: 145443, detail: "片场[第45集]：文本转剧本-蓝天1.0" },
];

const TASK_ROWS = [
  { time: ago(0, "16:42"), task: "Seedance 2.5 · 视频生成 10s", type: "视频生成", status: "成功", credits: -830 },
  { time: ago(2, "15:12"), task: "Seedance 2.0 mini · 视频生成 5s", type: "视频生成", status: "成功", credits: -140 },
  { time: ago(4, "19:03"), task: "文本转图片 · 蓝天1.0 ×10", type: "图片生成", status: "成功", credits: -100 },
  { time: ago(6, "18:47"), task: "Seedance 2.5 · 视频生成 15s", type: "视频生成", status: "失败", credits: 0 },
  { time: ago(9, "11:20"), task: "文本转剧本 · 蓝天1.0", type: "剧本转换", status: "成功", credits: -10 },
  { time: ago(13, "09:41"), task: "文本转图片 · 蓝天1.0 ×4", type: "图片生成", status: "成功", credits: -40 },
  { time: ago(19, "20:15"), task: "Seedance 2.5 · 视频生成 10s", type: "视频生成", status: "成功", credits: -830 },
  { time: ago(26, "14:02"), task: "文本转剧本 · 蓝天1.0", type: "剧本转换", status: "成功", credits: -10 },
  { time: ago(40, "10:30"), task: "Seedance 2.0 · 视频生成 5s", type: "视频生成", status: "成功", credits: -140 },
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

function BoundBadge({ bound }: { bound: boolean }) {
  return bound ? (
    <span className="flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-black">
      <CheckIcon className="size-3" />
      已绑定
    </span>
  ) : (
    <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/50">
      未绑定
    </span>
  );
}

/* 验证码绑定/换绑流程（演示验证码 123456） */
function BindForm({
  placeholder,
  submitLabel,
  onDone,
}: {
  placeholder: string;
  submitLabel: string;
  onDone: (target: string) => void;
}) {
  const [target, setTarget] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const send = () => {
    if (!target.trim()) {
      setError("请先填写账号");
      return;
    }
    setError("");
    setSent(true);
  };

  const confirm = () => {
    if (code !== "123456") {
      setError("验证码不正确（演示验证码 123456）");
      return;
    }
    setError("");
    onDone(target.trim());
  };

  const inputCls =
    "h-9 min-w-0 flex-1 rounded-lg bg-white/[0.06] px-3 text-[13px] text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-brand/50";

  return (
    <div className="mt-3 space-y-2.5">
      <div className="flex gap-2">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={inputCls}
        />
        <button
          type="button"
          onClick={send}
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-[12px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
        >
          {sent ? "重新发送" : "发送验证码"}
        </button>
      </div>
      {sent && (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="验证码（演示：123456）"
            aria-label="验证码"
            className={inputCls}
          />
          <button
            type="button"
            onClick={confirm}
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-[12px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
          >
            {submitLabel}
          </button>
        </div>
      )}
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}

function ProfileTab({ onLogout }: { onLogout: () => void }) {
  const { user, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState(user?.nickname ?? "bollo 用户");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const [phone, setPhone] = useState<string | null>(user?.phone ?? "+86 138****7377");
  const [phoneFormOpen, setPhoneFormOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(user?.email ?? null);
  const [wechatBound, setWechatBound] = useState(true);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarUrl(URL.createObjectURL(f));
    e.target.value = "";
  };

  const saveName = () => {
    const v = draft.trim();
    if (!v) return;
    setNickname(v);
    setEditing(false);
  };

  return (
    <div className="max-w-[720px]">
      {/* 头像 + 昵称 */}
      <div className="flex items-center gap-4 border-b border-white/[0.08] pb-5">
        <div className="relative shrink-0">
          <div className="size-16 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt="头像" loading="lazy" className="size-full object-cover" />
            ) : (
              <UserAvatar className="rounded-full" />
            )}
          </div>
          <button
            type="button"
            aria-label="上传头像"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-brand text-black ring-2 ring-[#0d0d0d] transition-transform hover:brightness-105 active:scale-95"
          >
            <CameraIcon className="size-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draft}
                maxLength={20}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="输入昵称"
                aria-label="昵称"
                className="h-9 w-full max-w-[240px] rounded-lg bg-white/[0.06] px-3 text-[14px] text-white ring-1 ring-white/10 focus:outline-none focus:ring-brand/50"
              />
              <button
                type="button"
                onClick={saveName}
                className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="shrink-0 rounded-lg px-3 py-2 text-[13px] text-white/50 transition-colors hover:text-white"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="truncate text-[16px] font-semibold text-white">{nickname}</span>
              <button
                type="button"
                aria-label="修改昵称"
                onClick={() => {
                  setDraft(nickname);
                  setEditing(true);
                }}
                className="text-white/40 transition-colors hover:text-white"
              >
                <EditIcon className="size-4" />
              </button>
            </div>
          )}
          <p className="mt-1 text-[12px] text-white/40">ID: {user?.id ?? "-"}</p>
        </div>
      </div>

      {/* 账号绑定 */}
      <h3 className="mt-6 text-[14px] font-semibold text-white">账号绑定</h3>
      <div className="mt-3 divide-y divide-white/[0.06] rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
        {/* 手机号 */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SmartphoneIcon className="size-4 text-white/60" />
              <span className="text-[14px] font-medium text-white">手机号绑定</span>
            </div>
            <BoundBadge bound={!!phone} />
          </div>
          {phone ? (
            <>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[12px] text-white/45">已验证手机号</p>
                  <p className="mt-1 text-[13px] text-white/85">{phone}</p>
                </div>
                <div>
                  <p className="text-[12px] text-white/45">验证时间</p>
                  <p className="mt-1 text-[13px] text-white/85">2026年9月10日 05:23</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-white/40">
                <ShieldCheckIcon className="size-3.5" />
                更换手机号时，需要先验证当前手机号收到的短信验证码。
              </p>
              {phoneFormOpen ? (
                <BindForm
                  placeholder="新手机号"
                  submitLabel="确认更换"
                  onDone={(t) => {
                    setPhone(t);
                    setPhoneFormOpen(false);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPhoneFormOpen(true)}
                  className="mt-3 rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
                >
                  更换手机号
                </button>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-[12px] text-white/40">尚未绑定手机号，可添加为可选登录方式。</p>
              <BindForm placeholder="手机号" submitLabel="确认绑定" onDone={(t) => setPhone(t)} />
            </>
          )}
        </div>

        {/* 邮箱 */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MailIcon className="size-4 text-white/60" />
              <span className="text-[14px] font-medium text-white">邮箱绑定</span>
            </div>
            <BoundBadge bound={!!email} />
          </div>
          {email ? (
            <p className="mt-3 text-[13px] text-white/85">{email}</p>
          ) : (
            <>
              <p className="mt-2 text-[12px] text-white/40">尚未绑定邮箱，可添加为可选登录方式。</p>
              <BindForm placeholder="邮箱地址" submitLabel="确认绑定" onDone={(t) => setEmail(t)} />
            </>
          )}
        </div>

        {/* 微信 */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <WeChatIcon className="size-4 text-white/60" />
              <span className="text-[14px] font-medium text-white">微信绑定</span>
            </div>
            <BoundBadge bound={wechatBound} />
          </div>
          {wechatBound ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[13px] text-white/85">已绑定微信：bollo 微信用户</p>
              <button
                type="button"
                onClick={() => setWechatBound(false)}
                className="shrink-0 rounded-lg border border-white/15 px-4 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                解绑
              </button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-[12px] text-white/40">尚未绑定微信，绑定后可扫码快捷登录。</p>
              <button
                type="button"
                onClick={() => setWechatBound(true)}
                className="mt-3 rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
              >
                绑定微信
              </button>
            </>
          )}
        </div>
      </div>

      {/* 退出登录 */}
      <div className="flex items-center justify-between py-5">
        <div>
          <p className="text-[14px] font-medium text-white">退出登录</p>
          <p className="mt-1 text-[13px] text-white/45">退出后返回登录页，账号数据不受影响</p>
        </div>
        <button
          type="button"
          onClick={() => { onLogout(); void logout(); }}
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
  const [filter, setFilter] = useState<RecordFilter>(defaultFilter);

  const rows = CHARGE_ROWS.filter(
    (r) =>
      inRange(r.created, filter) &&
      (filter.type === "全部" || r.type === filter.type) &&
      (!filter.q || r.order.includes(filter.q)),
  );

  return (
    <div>
      <h3 className="text-[15px] font-semibold text-white">充值记录</h3>

      <RecordFilterBar
        types={["银行转账", "微信充值", "支付宝充值", "支付宝自动订阅"]}
        numberPlaceholder="订单号"
        onApply={setFilter}
      />

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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-white/35">
                  该时间范围内暂无记录
                </td>
              </tr>
            ) : (
              rows.map((r) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager from={rows.length ? 1 : 0} to={rows.length} total={rows.length} />
    </div>
  );
}

/* ---------- 通用筛选栏（单号/日期/类型，默认最近 30 天） ---------- */

type RecordFilter = { from: string; to: string; type: string; q: string };

function defaultFilter(): RecordFilter {
  return { from: daysAgoIso(30), to: daysAgoIso(0), type: "全部", q: "" };
}

function inRange(time: string, f: RecordFilter) {
  const day = time.slice(0, 10);
  if (f.from && day < f.from) return false;
  if (f.to && day > f.to) return false;
  return true;
}

function RecordFilterBar({
  types,
  numberPlaceholder,
  onApply,
}: {
  types: string[];
  numberPlaceholder: string;
  onApply: (f: RecordFilter) => void;
}) {
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(daysAgoIso(0));
  const [type, setType] = useState("全部");
  const [q, setQ] = useState("");

  const inputCls =
    "rounded-md bg-white/[0.05] px-2.5 py-1.5 text-[12px] text-white/70 ring-1 ring-white/[0.08] focus:outline-none focus:ring-brand/40";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.08]">
      <span className="text-[12px] text-white/50">单号：</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={numberPlaceholder}
        aria-label="单号查询"
        className={cn(inputCls, "w-[140px]")}
      />
      <span className="text-[12px] text-white/50">时间&日期：</span>
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        aria-label="开始日期"
        className={inputCls}
      />
      <span className="text-white/30">→</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        aria-label="结束日期"
        className={inputCls}
      />
      <span className="ml-2 text-[12px] text-white/50">类型：</span>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label="类型筛选"
        className={inputCls}
      >
        <option>全部</option>
        {types.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={() => {
            setFrom(daysAgoIso(30));
            setTo(daysAgoIso(0));
            setType("全部");
            setQ("");
            onApply(defaultFilter());
          }}
          className="rounded-lg border border-white/15 px-3.5 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          重置
        </button>
        <button
          type="button"
          onClick={() => onApply({ from, to, type, q: q.trim() })}
          className="rounded-lg bg-brand px-4 py-1.5 text-[12px] font-bold text-black transition-transform hover:brightness-105 active:scale-95"
        >
          查询
        </button>
      </div>
    </div>
  );
}

/* ---------- 子页：积分明细 ---------- */

function PointsTab() {
  const [filter, setFilter] = useState<RecordFilter>(defaultFilter);

  const rows = POINTS_ROWS.filter(
    (r) =>
      inRange(r.time, filter) &&
      (filter.type === "全部" || r.type === filter.type) &&
      (!filter.q || String(r.order).includes(filter.q)),
  );

  return (
    <div>
      <h3 className="text-[15px] font-semibold text-white">积分明细</h3>

      <RecordFilterBar
        types={["剧本积分", "编辑图片", "视频生成"]}
        numberPlaceholder="交易单号"
        onApply={setFilter}
      />

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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-white/35">
                  该时间范围内暂无记录
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={`${r.order}-${i}`} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className={cn(TD, "text-white/55")}>{r.time}</td>
                  <td className={TD}>{r.type}</td>
                  <td className={cn(TD, "font-mono text-[12px] text-white/60")}>{r.order}</td>
                  <td className={cn(TD, "text-danger")}>{r.points}</td>
                  <td className={TD}>{r.balance.toLocaleString()}</td>
                  <td className={cn(TD, "max-w-[280px] truncate text-white/55")}>{r.detail}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager from={rows.length ? 1 : 0} to={rows.length} total={rows.length} />
    </div>
  );
}

/* ---------- 子页：任务明细 ---------- */

function TaskTab() {
  const [filter, setFilter] = useState<RecordFilter>(defaultFilter);

  const rows = TASK_ROWS.filter(
    (r) =>
      inRange(r.time, filter) &&
      (filter.type === "全部" || r.type === filter.type) &&
      (!filter.q || r.task.toLowerCase().includes(filter.q.toLowerCase())),
  );

  return (
    <div>
      <h3 className="text-[15px] font-semibold text-white">任务明细</h3>

      <RecordFilterBar
        types={["视频生成", "图片生成", "剧本转换"]}
        numberPlaceholder="任务名称"
        onApply={setFilter}
      />

      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        <table className="w-full border-collapse bg-white/[0.02]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className={TH}>时间</th>
              <th className={TH}>任务</th>
              <th className={TH}>类型</th>
              <th className={TH}>状态</th>
              <th className={TH}>积分消耗</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-white/35">
                  该时间范围内暂无记录
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className={cn(TD, "text-white/55")}>{r.time}</td>
                  <td className={TD}>{r.task}</td>
                  <td className={cn(TD, "text-white/55")}>{r.type}</td>
                  <td className={TD}>
                    <StatusPill status={r.status} />
                  </td>
                  <td className={cn(TD, r.credits < 0 ? "text-danger" : "text-white/40")}>
                    {r.credits < 0 ? r.credits : "不扣费（失败返还）"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager from={rows.length ? 1 : 0} to={rows.length} total={rows.length} />
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
        好友注册可得 100 积分，你按邀请阶段获得 60 / 120 / 150 积分，活动累计最高 3,000 积分。
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
          <CloseIcon className="size-4" />
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

export type AccountTab = "profile" | "charge" | "points" | "task" | "invite";

const ACCOUNT_TABS: { id: AccountTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "个人资料", Icon: UserIcon },
  { id: "charge", label: "订单充值", Icon: CoinsIcon },
  { id: "points", label: "积分明细", Icon: RefreshCwIcon },
  { id: "task", label: "任务明细", Icon: LayersIcon },
  { id: "invite", label: "邀请好友", Icon: GiftIcon },
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
          <CloseIcon className="size-5" />
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
          {tab === "points" && <PointsTab />}
          {tab === "task" && <TaskTab />}
          {tab === "invite" && <InviteTab />}
        </main>
      </div>
    </div>
  );
}
