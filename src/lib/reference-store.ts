"use client";

// ─── 引用存储（localStorage）───────────────────────────────────────────────
// 跨模块数据流动的核心：广场 → 引用 → 项目

import { useState, useEffect } from "react";
import type { Reference, EvidenceType } from "@/types/project";

const STORAGE_KEY = "bollo:references";
const REFS_EVENT = "bollo:references-changed";

export interface StoredReference extends Reference {
  addedAt: string;
  fromPage: string;
  sourceUrl?: string;
  summary?: string;
}

// 去紫化：5 色证据徽章 — lime/sky/teal/amber/red，色相均匀分布
const EVIDENCE_META: Record<EvidenceType, { label: string; color: string }> = {
  real_data: { label: "真实数据", color: "bg-brand/15 text-brand ring-1 ring-brand/30" },
  internal_asset: { label: "站内资产", color: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30" },
  model_analysis: { label: "模型分析", color: "bg-[#7dffe6]/15 text-[#7dffe6] ring-1 ring-[#7dffe6]/30" },
  market_estimate: { label: "市场估算", color: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30" },
  missing: { label: "信息缺失", color: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30" },
};

export function getEvidenceMeta(type: EvidenceType) {
  return EVIDENCE_META[type];
}

export function getReferences(): StoredReference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as StoredReference[];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("[reference-store] localStorage read failed", e);
    return [];
  }
}

export function addReference(ref: StoredReference): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getReferences();
    // 去重：相同 type + id 不重复加入
    if (list.some((r) => r.type === ref.type && r.id === ref.id)) {
      return false;
    }
    list.push(ref);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // 触发事件让其他组件感知
    window.dispatchEvent(new CustomEvent(REFS_EVENT));
    return true;
  } catch (e) {
    console.warn("[reference-store] localStorage write failed", e);
    return false;
  }
}

export function removeReference(type: string, id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getReferences().filter((r) => !(r.type === type && r.id === id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(REFS_EVENT));
  } catch (e) {
    console.warn("[reference-store] localStorage remove failed", e);
  }
}

export function clearReferences(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(REFS_EVENT));
  } catch (e) {
    console.warn("[reference-store] localStorage clear failed", e);
  }
}

export function getReferenceCount(): number {
  return getReferences().length;
}

// 判断某引用是否已存在（用于 UI 状态同步）
export function hasReference(type: string, id: string): boolean {
  return getReferences().some((r) => r.type === type && r.id === id);
}

// ─── Hook: 跨组件订阅引用列表 ────────────────────────────────────────────────
// 解决 CustomEvent 无消费者问题：任意组件 useReferences() 即可实时同步
export function useReferences(): {
  references: StoredReference[];
  count: number;
  remove: (type: string, id: string) => void;
  clear: () => void;
} {
  const [references, setReferences] = useState<StoredReference[]>([]);

  useEffect(() => {
    const update = () => setReferences(getReferences());
    update();
    window.addEventListener(REFS_EVENT, update);
    // 跨 tab 同步
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(REFS_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return {
    references,
    count: references.length,
    remove: removeReference,
    clear: clearReferences,
  };
}
