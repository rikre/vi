"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { CAMPAIGNS } from "./campaign-data";

export function ActivitySection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="mt-10">
      <h2 className="text-base font-medium text-foreground/85">活动</h2>

      <div className="relative mt-3">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth"
          style={{ scrollSnapType: "x mandatory", paddingBottom: 4 }}
        >
          {CAMPAIGNS.map((c) => {
            const href = c.specialRouteKey
              ? c.specialRouteKey.startsWith("http")
                ? c.specialRouteKey
                : `/campaigns/${c.specialRouteKey}`
              : `/campaigns/${c.id}`;
            const external = c.specialRouteKey?.startsWith("http") ?? false;
            const cardCls =
              "group relative flex h-[220px] w-[668px] shrink-0 items-end overflow-hidden rounded-xl text-left";
            const cardStyle: React.CSSProperties = {
              scrollSnapAlign: "start",
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%), url(${c.coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            };
            const inner = (
              <div className="relative w-full p-4">
                <h3 className="text-base font-semibold text-white">
                  {c.title}
                </h3>
                <p className="mt-1 text-[11px] text-white/70">
                  {c.endsInLabel} · {c.participantsLabel}
                </p>
              </div>
            );
            return external ? (
              <a
                key={c.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardCls}
                style={cardStyle}
              >
                {inner}
              </a>
            ) : (
              <Link key={c.id} href={href} className={cardCls} style={cardStyle}>
                {inner}
              </Link>
            );
          })}
        </div>

        {canLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="上一张"
            className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
        )}

        {canRight && (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="下一张"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        )}
      </div>
    </section>
  );
}
