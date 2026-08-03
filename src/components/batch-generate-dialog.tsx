"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { SparkleIcon, CheckIcon, ChevronDownIcon, UserIcon, SceneIcon, PropIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface BatchAsset {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface BatchGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  assets: BatchAsset[];
  onConfirm: (selectedIds: string[]) => void;
}

const MODELS = ["Seedream-5.0-lite", "Seedream-5.0-pro", "Seedance-2.0"];

const TYPE_ICON: Record<string, typeof UserIcon> = {
  character: UserIcon,
  scene: SceneIcon,
  prop: PropIcon,
};

const TYPE_LABEL: Record<string, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
};

export default function BatchGenerateDialog({
  open,
  onClose,
  assets,
  onConfirm,
}: BatchGenerateDialogProps) {
  const [model, setModel] = useState("Seedream-5.0-lite");
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pending = useMemo(
    () => assets.filter((a) => a.status !== "已生成"),
    [assets]
  );

  const allSelected = pending.length > 0 && pending.every((a) => selected.has(a.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pending.map((a) => a.id)));
    }
  };

  const handleConfirm = () => {
    const ids = Array.from(selected);
    // eslint-disable-next-line no-console
    console.log("batch generate", { model, ids });
    onConfirm(ids);
    setSelected(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledby="batch-generate-title"
      className="relative w-[520px] max-w-[92vw] max-h-[82vh] overflow-hidden p-6 flex flex-col"
    >
      <header className="pr-8">
        <h3 id="batch-generate-title" className="text-[18px] font-semibold text-white">
          批量生成资产
        </h3>
      </header>

      {/* 模型选择 */}
      <div className="mt-5">
        <label className="text-[12px] text-white/50">生成模型</label>
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setModelOpen((o) => !o)}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] text-white/90 transition-colors hover:bg-white/[0.08]"
          >
            <span className="flex items-center gap-2">
              <SparkleIcon className="size-3.5 text-brand" />
              {model}
            </span>
            <ChevronDownIcon
              className={cn("size-3.5 text-white/50 transition-transform", modelOpen && "rotate-180")}
            />
          </button>
          {modelOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setModelOpen(false)} />
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1a] py-1 shadow-xl">
                {MODELS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setModel(m);
                      setModelOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-[13px] transition-colors",
                      model === m ? "bg-brand/15 text-brand" : "text-white/70 hover:bg-white/[0.05]"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <SparkleIcon className="size-3.5" />
                      {m}
                    </span>
                    {model === m && <CheckIcon className="size-3.5" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 资产列表 */}
      <div className="mt-5 flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[12px] text-white/50">
            待生成资产（{pending.length}）
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-[12px] text-white/60 hover:text-white/90"
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded border transition-all",
                allSelected
                  ? "border-brand bg-brand text-black"
                  : "border-white/20 bg-transparent"
              )}
            >
              {allSelected && <CheckIcon className="size-3" />}
            </span>
            全选
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-[13px] text-white/50">所有资产都已生成 🎉</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {pending.map((a) => {
                const Icon = TYPE_ICON[a.type] ?? PropIcon;
                const label = TYPE_LABEL[a.type] ?? a.type;
                const checked = selected.has(a.id);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => toggle(a.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        checked ? "bg-brand/[0.06]" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border transition-all",
                          checked
                            ? "border-brand bg-brand text-black"
                            : "border-white/20 bg-transparent"
                        )}
                      >
                        {checked && <CheckIcon className="size-3" />}
                      </span>
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          checked ? "bg-brand/15 text-brand" : "bg-white/[0.05] text-white/50"
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-[13px]", checked ? "text-white" : "text-white/80")}>
                          {a.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-white/40">{label}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleClose}
          className="h-9 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 text-[13px] text-white/70 transition-colors hover:bg-white/[0.08]"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selected.size === 0}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-[13px] font-semibold text-black shadow-lg shadow-brand/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <SparkleIcon className="size-3.5" />
          生成 {selected.size} 个资产
        </button>
      </div>
    </Modal>
  );
}
