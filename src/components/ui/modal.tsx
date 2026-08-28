"use client";

import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** 用于生成 aria-labelledby 关联的隐藏标题文本 */
  title?: string;
  /** 自定义 aria-labelledby，指向调用方渲染的可见标题元素 id */
  labelledby?: string;
  children: React.ReactNode;
  /** 模态内容区自定义样式，会与默认样式合并 */
  className?: string;
  /** 是否显示内置关闭按钮，默认 true */
  showCloseButton?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  labelledby,
  children,
  className,
  showCloseButton = true,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const generatedId = useId();
  const titleId = labelledby ?? (title ? generatedId : undefined);

  useEffect(() => {
    if (!open) return;

    // 记录触发元素，关闭后恢复焦点
    triggerRef.current = document.activeElement;

    const content = contentRef.current;
    if (content) {
      const firstFocusable =
        content.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && content) {
        const nodes = Array.from(
          content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        const inside = content.contains(active);
        if (e.shiftKey) {
          if (active === first || !inside) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !inside) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // 锁定背景滚动并防止滚动穿透
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative overscroll-contain bg-[#141414] border border-white/[0.06] rounded-2xl outline-none",
          className
        )}
      >
        {title && titleId ? (
          <span id={titleId} className="sr-only">
            {title}
          </span>
        ) : null}
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white motion-reduce:transition-none"
          >
            <CloseIcon className="size-5" />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
