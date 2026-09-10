"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckIcon, InfoIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID();
    setItems((current) => [...current.slice(-2), { ...input, id }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 4_500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-[360px]"
      >
        {items.map((item) => {
          const Icon = item.tone === "success" ? CheckIcon : InfoIcon;
          return (
            <div
              key={item.id}
              role={item.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl bg-surface-elevated p-4 ring-1 ring-white/[0.1]"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                  item.tone === "success" && "bg-success/15 text-success",
                  item.tone === "error" && "bg-danger/15 text-danger",
                  (!item.tone || item.tone === "info") && "bg-info/15 text-info",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-white">{item.title}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-white/55">
                    {item.description}
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                aria-label="关闭提示"
                onClick={() => dismiss(item.id)}
                className="text-white/35 transition-colors hover:text-white/70"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}
