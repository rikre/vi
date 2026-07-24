"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import {
  SearchIcon,
  CoinsIcon,
  DocumentIcon,
} from "@/components/icons";

const PLAZA_TABS = [
  { id: "scripts", label: "剧本市场" },
  { id: "orders", label: "项目接单" },
  { id: "writers", label: "编剧推荐" },
];

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

/* ------------------------------------------------------------------ */
/*  剧本市场                                                          */
/* ------------------------------------------------------------------ */
type Script = {
  id: string;
  title: string;
  tags: string[];
  episodes: number;
  words: string;
  price: number;
  sold: boolean;
  prompt: string;
};

const SCRIPTS: Script[] = [
  {
    id: "1",
    title: "画灵觉醒",
    tags: ["男频", "都市异能", "中式美学"],
    episodes: 20,
    words: "1.2万字",
    price: 5800,
    sold: true,
    prompt: "chinese ink fantasy drama poster, mystical painter awakening powers, no text",
  },
  {
    id: "2",
    title: "纸扎铺凌晨开门",
    tags: ["女频", "影视", "权谋"],
    episodes: 20,
    words: "6537字",
    price: 4200,
    sold: true,
    prompt: "dark chinese supernatural drama poster, paper effigy shop at night, no text",
  },
  {
    id: "3",
    title: "雨夜追赃",
    tags: ["男频", "权谋", "影视"],
    episodes: 20,
    words: "6381字",
    price: 3600,
    sold: false,
    prompt: "rainy night chinese crime thriller poster, detective chase, no text",
  },
  {
    id: "4",
    title: "夜校焚心",
    tags: ["女频", "世家", "职场"],
    episodes: 20,
    words: "6534字",
    price: 4800,
    sold: true,
    prompt: "chinese campus mystery romance drama poster, night school fire, no text",
  },
  {
    id: "5",
    title: "她在凶宅直播",
    tags: ["女频", "末日", "双强"],
    episodes: 20,
    words: "1.8万字",
    price: 5200,
    sold: false,
    prompt: "chinese livestream horror comedy poster, girl in haunted house, no text",
  },
  {
    id: "6",
    title: "雾港归航",
    tags: ["女频", "权谋", "群像"],
    episodes: 20,
    words: "1.1万字",
    price: 4500,
    sold: true,
    prompt: "chinese maritime mystery drama poster, foggy harbor ship, no text",
  },
];

function ScriptCard({ script }: { script: Script }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={txi(script.prompt, "portrait_4_3")}
          alt={script.title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur">
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
          <div className="mt-1 flex flex-wrap gap-1">
            {script.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-white/55">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.06] p-3">
        <span className="flex items-center gap-1 text-[12px] font-bold text-[#D4FF3F]">
          <CoinsIcon className="size-3.5" />
          {script.price.toLocaleString()}
        </span>
        <button
          type="button"
          disabled={script.sold}
          className={cn(
            "rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors",
            script.sold
              ? "bg-white/[0.05] text-white/35"
              : "bg-[#D4FF3F] text-black hover:bg-[#e6ff4d]"
          )}
        >
          {script.sold ? "已售出" : "立即购买"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  项目接单                                                          */
/* ------------------------------------------------------------------ */
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
    open: { label: "可申请", color: "text-[#7dffe6] bg-[#00e5c8]/15 ring-[#00e5c8]/30" },
    full: { label: "名额已满", color: "text-white/60 bg-white/[0.06] ring-white/10" },
    pending: { label: "暂不可申请", color: "text-white/60 bg-white/[0.06] ring-white/10" },
  };
  const { label, color } = config[status];
  return (
    <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1", color)}>
      <span className={cn("size-1.5 rounded-full", status === "open" ? "bg-[#00e5c8]" : "bg-white/40")} />
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
            <div className="text-[16px] font-bold text-[#00e5c8]">{order.income}<span className="text-[11px] font-normal text-white/50"> /部</span></div>
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
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          ✕
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
            <div className="text-[20px] font-bold text-[#00e5c8]">{order.income}<span className="text-[12px] font-normal text-white/50"> /部</span></div>
            <div className="mt-1 text-[11px] text-white/60">{order.model}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-3 rounded-xl bg-white/[0.03] p-4">
          <div>
            <div className="text-[11px] text-white/40">单位时长</div>
            <div className="mt-1 text-[13px] font-semibold text-white">{order.perMin}</div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">交付总量</div>
            <div className="mt-1 text-[13px] font-semibold text-white">{order.total}</div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">交付周期</div>
            <div className="mt-1 text-[13px] font-semibold text-white">{order.cycle}</div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">题材地区</div>
            <div className="mt-1 text-[13px] font-semibold text-white">{order.region}</div>
          </div>
          <div>
            <div className="text-[11px] text-white/40">当前状态</div>
            <div className="mt-1 text-[13px] font-semibold text-[#00e5c8]">● {order.status === "open" ? "可申请" : order.status === "full" ? "名额已满" : "暂不可申请"}</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-white">
              <span className="h-3 w-1 rounded-full bg-[#00e5c8]" />
              剧本简介
            </h3>
            <button type="button" className="rounded-lg bg-[#00e5c8]/15 px-3 py-1 text-[11px] font-semibold text-[#7dffe6]">
              试读剧本
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-white/60">{order.synopsis}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/[0.03] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-white">
              <span className="flex size-5 items-center justify-center rounded-md bg-[#00e5c8]/15 text-[10px] font-bold text-[#7dffe6]">01</span>
              项目简介
            </h3>
            <p className="text-[12px] leading-relaxed text-white/55">
              平台精选优质剧本资源，为制作方提供稳定制作机会。制作方无需自行寻找剧本，只需按照项目要求完成短剧制作，经平台验收通过后即可获得保底制作收益。适合具备成熟短剧制作能力的团队参与。
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-white">
              <span className="flex size-5 items-center justify-center rounded-md bg-[#00e5c8]/15 text-[10px] font-bold text-[#7dffe6]">02</span>
              审核和结算
            </h3>
            <p className="text-[12px] leading-relaxed text-white/55">
              项目采用保底制作费用结算模式。制作方完成约定内容制作并通过平台验收后，平台按照双方确认的保底单价及实际交付有效分钟数进行费用结算。结算金额 = 实际验收通过的成片分钟数 × 保底单价。
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={order.status !== "open"}
            className={cn(
              "rounded-xl px-6 py-2.5 text-[14px] font-semibold transition-colors",
              order.status === "open"
                ? "bg-[#D4FF3F] text-black hover:bg-[#e6ff4d]"
                : "bg-white/[0.06] text-white/35"
            )}
          >
            {order.status === "open" ? "立即申请" : order.status === "full" ? "名额已满" : "暂不可申请"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  编剧推荐                                                          */
/* ------------------------------------------------------------------ */
type Writer = {
  id: string;
  name: string;
  avatar: string;
  level: string;
  works: number;
  sold: number;
  tags: string[];
};

const WRITERS: Writer[] = [
  { id: "1", name: "墨染青衣", avatar: "elegant chinese writer portrait", level: "金牌编剧", works: 23, sold: 18, tags: ["都市", "甜宠", "复仇"] },
  { id: "2", name: "北风知我", avatar: "cool chinese male writer portrait", level: "资深编剧", works: 41, sold: 32, tags: ["男频", "逆袭", "玄幻"] },
  { id: "3", name: "小楼听雨", avatar: "gentle chinese female writer portrait", level: "银牌编剧", works: 15, sold: 9, tags: ["古言", "权谋", "虐恋"] },
  { id: "4", name: "青锋照影", avatar: "determined chinese screenwriter portrait", level: "金牌编剧", works: 36, sold: 28, tags: ["悬疑", "刑侦", "短剧"] },
];

function WriterCard({ writer }: { writer: Writer }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#141414] p-4 ring-1 ring-white/[0.08] transition-all duration-300 hover:ring-white/20">
      <img
        src={txi(writer.avatar, "square")}
        alt={writer.name}
        loading="lazy"
        className="size-14 rounded-xl object-cover ring-1 ring-white/10"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-white">{writer.name}</span>
          <span className="rounded-md bg-[#D4FF3F]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#D4FF3F]">{writer.level}</span>
        </div>
        <div className="mt-1 flex gap-3 text-[11px] text-white/50">
          <span>作品 {writer.works}</span>
          <span>售出 {writer.sold}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {writer.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/60">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/15"
      >
        查看主页
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function PlazaPage() {
  const [activeTab, setActiveTab] = useState("scripts");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        {/* Header */}
        <div className="mt-8 flex items-center justify-between pb-6">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
              广场
            </h1>
            <p className="mt-2 text-[14px] text-white/50">
              剧本交易、项目接单、编剧推荐一站式服务平台
            </p>
          </div>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-xl bg-[#D4FF3F] px-5 text-[14px] font-semibold text-black transition-all hover:bg-[#e6ff4d] hover:shadow-lg hover:shadow-[#D4FF3F]/20"
          >
            <DocumentIcon className="size-4" />
            发布剧本
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-white/[0.08] pb-1">
          {PLAZA_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-3 text-[14px] font-medium transition-colors",
                activeTab === tab.id ? "text-white" : "text-white/45 hover:text-white/75"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#F0FF8C] to-[#00e5c8]" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <SearchIcon className="size-[18px]" />
          </div>
          <input
            type="text"
            aria-label="搜索广场"
            placeholder={
              activeTab === "scripts"
                ? "搜索剧本名称、题材、标签..."
                : activeTab === "orders"
                ? "搜索项目、合作模式、题材..."
                : "搜索编剧名称、擅长题材..."
            }
            className="h-12 w-full rounded-xl border-0 bg-white/[0.06] pl-12 pr-4 text-[15px] text-white placeholder:text-white/40 transition-all focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#D4FF3F]/30"
          />
        </div>

        {/* Content */}
        {activeTab === "scripts" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {SCRIPTS.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ORDERS.map((order) => (
              <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
            ))}
          </div>
        )}

        {activeTab === "writers" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {WRITERS.map((writer) => (
              <WriterCard key={writer.id} writer={writer} />
            ))}
          </div>
        )}
      </div>

      <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </AppShell>
  );
}
