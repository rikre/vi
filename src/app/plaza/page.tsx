"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import {
  SearchIcon,
  CoinsIcon,
  DocumentIcon,
  CloseIcon,
} from "@/components/icons";
import {
  SCRIPTS as SCRIPTS_DATA,
  SCRIPT_TYPE_META,
  type Script,
  type ScriptType,
} from "@/lib/plaza-data";

// 广场只承载商务合作：题材剧本库 / 项目接单
// 数据榜单（爆款榜/网文风向标/热点信号）已迁移到「榜单大抽屉」组件，从首页 HotRanking「查看更多」触发
const PLAZA_TABS: { id: string; label: string }[] = [
  { id: "scripts", label: "题材剧本库" },
  { id: "orders", label: "项目接单" },
];

const VALID_TABS = PLAZA_TABS.map((t) => t.id) as readonly string[];

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

/* ─── 题材剧本库卡片 ────────────────────────────────────────────────────── */

const SCRIPTS: Script[] = SCRIPTS_DATA;

function TypeBadge({ type, className }: { type: ScriptType; className?: string }) {
  const meta = SCRIPT_TYPE_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1",
        meta.color,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

function ScriptCard({ script }: { script: Script }) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300",
        script.sold
          ? "opacity-60"
          : "hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20"
      )}
    >
      <Link
        href={`/plaza/script/${script.id}`}
        aria-label={`查看剧本「${script.title}」详情`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-2xl"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={txi(script.prompt, "portrait_4_3")}
            alt={script.title}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute left-2 top-2">
            <TypeBadge type={script.type} />
          </div>
          <div className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur">
            {script.episodes}集 | {script.words}
          </div>
          {script.sold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/40 bg-black/40">
                <span className="text-[13px] font-bold text-white/80">已售出</span>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="line-clamp-1 text-[14px] font-bold text-white">{script.title}</div>
            {script.subtitle && (
              <p className="mt-0.5 line-clamp-1 text-[11px] text-white/55">{script.subtitle}</p>
            )}
            {script.source && (
              <p className="mt-0.5 line-clamp-1 text-[10px] text-white/40">来源：{script.source}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
              {script.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-white/55">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[12px] font-bold text-brand">
              <CoinsIcon className="size-3.5" />
              {script.price.toLocaleString()}
            </span>
            <span
              className={cn(
                "rounded-lg px-3 py-1 text-[11px] font-semibold",
                script.sold
                  ? "bg-white/[0.05] text-white/35"
                  : "bg-brand text-black group-hover:bg-[#e6ff4d] transition-colors"
              )}
            >
              {script.sold ? "已售出" : "试读剧本"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ─── 榜单卡片（爆款榜/网文/热点）已迁移至 ranking-drawer.tsx ─────────── */


/* ─── 项目接单（保留原逻辑） ────────────────────────────────────────────── */

type Order = {
  id: string;
  title: string;
  tags: string[];
  income: string;
  model: string;
  perMin: string;
  total: string;
  cycle: string;
  region: string;
  status: "open" | "full" | "pending";
  synopsis: string;
  prompt: string;
};

const ORDERS: Order[] = [
  {
    id: "1",
    title: "买下黑市后，暴君继子强夺了我",
    tags: ["女频", "打脸逆袭"],
    income: "¥58,500.00",
    model: "保底+分成",
    perMin: "保底1300元/min",
    total: "每集1.5min 共30集",
    cycle: "海外",
    region: "A级及以上可接",
    status: "full",
    synopsis:
      "女主重生后利用前世记忆，在黑市拍卖会上买下关键情报，一步步瓦解暴君继子的势力，最终夺回属于自己的一切。",
    prompt: "chinese dark romance drama poster, powerful villain and heroine, no text",
  },
  {
    id: "2",
    title: "飞升后，误入低武世界",
    tags: ["男频", "打脸逆袭"],
    income: "¥135,000.00",
    model: "保底+分成",
    perMin: "保底1500元/min",
    total: "每集1.5min 共60集",
    cycle: "国内",
    region: "A级及以上可接",
    status: "full",
    synopsis:
      "大乘期修士飞升失败，意外进入灵气枯竭的低武世界。面对蝼蚁般的武者，他如何用仙家手段碾压一切，重建飞升之路。",
    prompt: "chinese xianxia fantasy poster, immortal in low martial world, no text",
  },
  {
    id: "3",
    title: "兽王的猎物",
    tags: ["女频", "奇幻虐恋"],
    income: "¥29,700.00",
    model: "保底+分成",
    perMin: "保底600元/min",
    total: "每集1.5min 共33集",
    cycle: "海外",
    region: "A级及以上可接",
    status: "open",
    synopsis:
      "被献祭给兽王的少女，意外发现这位传说中的暴君竟是幼年救过自己的少年。在权力与情感的漩涡中，两人逐渐靠近。",
    prompt: "chinese fantasy beast king romance poster, heroine and beast king, no text",
  },
  {
    id: "4",
    title: "恶魔勋爵的禁忌游戏",
    tags: ["女频", "复仇虐甜"],
    income: "¥30,000.00",
    model: "保底+分成",
    perMin: "保底500元/min",
    total: "每集1.5min 共40集",
    cycle: "海外",
    region: "A级及以上可接",
    status: "pending",
    synopsis:
      "为报家族血仇，她主动接近恶魔勋爵，却在步步为营中动了真心。当真相揭开，这场禁忌游戏究竟谁才是猎物。",
    prompt: "western gothic noble romance poster, demon lord and heroine, no text",
  },
];

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const config = {
    open: { label: "可申请", color: "text-brand bg-brand/15 ring-brand/30", dot: "bg-brand" },
    full: { label: "名额已满", color: "text-[#fb923c] bg-[#fb923c]/15 ring-[#fb923c]/30", dot: "bg-[#fb923c]" },
    pending: { label: "审核中", color: "text-[#facc15] bg-[#facc15]/15 ring-[#facc15]/30", dot: "bg-[#facc15]" },
  };
  const { label, color, dot } = config[status];
  return (
    <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1", color)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20">
      <div className="relative h-[140px] overflow-hidden">
        <img
          src={txi(order.prompt, "landscape_4_3")}
          alt={order.title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {order.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80 backdrop-blur">
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="line-clamp-1 text-[15px] font-bold text-white">{order.title}</div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/40">预估收益</div>
            <div className="text-[16px] font-bold text-brand">{order.income}<span className="text-[11px] font-normal text-white/50"> /部</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/40">合作模式</div>
            <div className="text-[12px] font-medium text-white/80">{order.model}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-[11px] text-white/55">
          <div>{order.perMin}</div>
          <div>{order.total}</div>
          <div>{order.cycle}</div>
          <div>{order.region}</div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <OrderStatusBadge status={order.status} />
          <button
            type="button"
            onClick={onClick}
            className="rounded-lg bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const [notice, setNotice] = useState<string | null>(null);
  // ESC 关闭 — 仅在有 order 时挂载监听
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  if (!order) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="接单详情"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] p-6"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-white">{order.title}</h2>
            <div className="mt-2 flex gap-2">
              {order.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/40">预估收益</div>
            <div className="text-[20px] font-bold text-brand tabular-nums">{order.income}<span className="text-[12px] font-normal text-white/50"> /部</span></div>
            <div className="mt-1 text-[11px] text-white/60">{order.model}</div>
          </div>
        </div>

        {notice && (
          <p className="mt-5 text-right text-[12px] text-brand" role="status" aria-live="polite">
            {notice}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={order.status !== "open"}
            onClick={() => setNotice("申请流程将在合作接口接入后开放，当前为演示数据")}
            className={cn(
              "rounded-xl px-6 py-2.5 text-[14px] font-semibold transition-colors",
              order.status === "open"
                ? "bg-brand text-black hover:bg-[#e6ff4d]"
                : "bg-white/[0.06] text-white/35"
            )}
          >
            {order.status === "open" ? "立即申请" : order.status === "full" ? "名额已满" : "审核中"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function PlazaPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const validInitial = initialTab && VALID_TABS.includes(initialTab) ? initialTab : "scripts";

  const [activeTab, setActiveTab] = useState<string>(validInitial);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // URL 同步：tab 变化时更新 ?tab=xxx
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", tabId);
    router.replace(`/plaza?${params.toString()}`, { scroll: false });
  };

  // 外部（浏览器后退/前进）改变 URL 时同步 tab
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && VALID_TABS.includes(t) && t !== activeTab) {
      // 这里是 URL 与本地 tab 状态的单向同步，避免后退/前进后页面仍停留在旧标签。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredScripts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SCRIPTS;
    return SCRIPTS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        (s.source?.toLowerCase().includes(q) ?? false) ||
        (s.author?.toLowerCase().includes(q) ?? false)
    );
  }, [searchQuery]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ORDERS;
    return ORDERS.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q)) ||
        o.model.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const searchPlaceholder = useMemo(() => {
    switch (activeTab) {
      case "orders":
        return "搜索项目、合作模式、题材...";
      default:
        return "搜索剧本名称、题材、标签、来源、编剧...";
    }
  }, [activeTab]);

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-4 pb-10 sm:px-6">
        {/* Header — 响应式：小屏堆叠 */}
        <div className="mt-8 flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">
              广场
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/project/new?action=original")}
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-semibold text-black transition-all hover:bg-[#e6ff4d] hover:shadow-lg hover:shadow-brand/20"
          >
            <DocumentIcon className="size-4" />
            发布剧本
          </button>
        </div>

        {/* Tabs — ARIA tablist */}
        <div
          role="tablist"
          aria-label="广场分类"
          className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-white/[0.08] pb-1"
        >
          {PLAZA_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`plaza-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`plaza-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-[14px] font-semibold transition-colors",
                activeTab === tab.id ? "text-white" : "text-white/45 hover:text-white/75"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <SearchIcon className="size-[18px]" />
          </div>
          <input
            type="text"
            aria-label="搜索广场"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-12 w-full rounded-xl border-0 bg-white/[0.06] pl-12 pr-4 text-[15px] text-white placeholder:text-white/40 transition-all focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* 二级筛选（爆款榜/网文/热点的筛选已迁移到 ranking-drawer） */}

        {/* Content — tabpanel */}
        <div
          role="tabpanel"
          id={`plaza-panel-${activeTab}`}
          aria-labelledby={`plaza-tab-${activeTab}`}
          tabIndex={0}
        >
          {activeTab === "scripts" && (
            <>
              {filteredScripts.length === 0 ? (
                <EmptyState onClear={() => setSearchQuery("")} />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {filteredScripts.map((script) => (
                    <ScriptCard key={script.id} script={script} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "orders" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
              ))}
            </div>
          )}

        </div>
      </div>

      <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </AppShell>
  );
}

export default function PlazaPage() {
  return (
    <Suspense fallback={null}>
      <PlazaPageInner />
    </Suspense>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-3 text-3xl text-white/30">🔍</div>
      <p className="text-[15px] font-medium text-white/70">没有找到相关内容</p>
      <p className="mt-1 text-[13px] text-white/40">试试调整搜索词或筛选条件</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex h-9 items-center rounded-lg bg-white/[0.08] px-4 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white"
      >
        清除搜索
      </button>
    </div>
  );
}
