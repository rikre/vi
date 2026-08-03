"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import { SearchIcon, DocumentIcon } from "@/components/icons";
import { SCRIPTS } from "@/lib/plaza-data";
import { ScriptCard } from "./script-card";
import { OrderCard, ORDERS, type Order } from "./order-card";
import { OrderDetailDialog } from "./order-detail-dialog";
import { WriterCard, WRITERS } from "./writer-card";

const PLAZA_TABS = [
  { id: "scripts", label: "剧本市场" },
  { id: "orders", label: "项目接单" },
  { id: "writers", label: "编剧推荐" },
];

export default function PlazaPage() {
  const [activeTab, setActiveTab] = useState("scripts");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScripts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SCRIPTS;
    return SCRIPTS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        (s.source?.toLowerCase().includes(q) ?? false) ||
        (s.author?.toLowerCase().includes(q) ?? false),
    );
  }, [searchQuery]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ORDERS;
    return ORDERS.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q)) ||
        o.model.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const filteredWriters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return WRITERS;
    return WRITERS.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

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
            onClick={() => console.log("publish script")}
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-semibold text-black transition-all hover:bg-[#e6ff4d] hover:shadow-lg hover:shadow-brand/20"
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
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/45 hover:text-white/75",
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "scripts"
                ? "搜索剧本名称、题材、标签、来源、编剧..."
                : activeTab === "orders"
                  ? "搜索项目、合作模式、题材..."
                  : "搜索编剧名称、擅长题材..."
            }
            className="h-12 w-full rounded-xl border-0 bg-white/[0.06] pl-12 pr-4 text-[15px] text-white placeholder:text-white/40 transition-all focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Content */}
        {activeTab === "scripts" && (
          <>
            {filteredScripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-3 text-3xl text-white/30">🔍</div>
                <p className="text-[15px] font-medium text-white/70">
                  没有找到相关剧本
                </p>
                <p className="mt-1 text-[13px] text-white/40">
                  试试调整搜索词
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 inline-flex h-9 items-center rounded-lg bg-white/[0.08] px-4 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white"
                >
                  清除搜索
                </button>
              </div>
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
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        )}

        {activeTab === "writers" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredWriters.map((writer) => (
              <WriterCard key={writer.id} writer={writer} />
            ))}
          </div>
        )}
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </AppShell>
  );
}
