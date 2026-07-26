"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

type Campaign = {
  id: string;
  title: string;
  coverUrl: string;
  endsInLabel: string;
  participantsLabel: string;
  kind: "ongoing" | "past";
  specialRouteKey: string | null;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "68046b0d-1b37-4de1-8f69-04103132a63e",
    title: "bollo “一键出海” 玩法介绍",
    coverUrl:
      "https://placehold.co/600x400/141414/D4FF3F?text=bollo",
    endsInLabel: "184天后结束",
    participantsLabel: "成为第一个参与者",
    kind: "ongoing",
    specialRouteKey:
      "https://ecncw7du1qtr.feishu.cn/wiki/UrTQwWgeLiLALAkb4AWcltpvnOe?from=from_copylink",
  },
  {
    id: "1fee866f-135e-49bd-ae6e-423df7a5ac7f",
    title: "bollo超创计划 纳新啦",
    coverUrl:
      "https://placehold.co/600x400/141414/D4FF3F?text=bollo",
    endsInLabel: "163天后结束",
    participantsLabel: "738 人已参与",
    kind: "ongoing",
    specialRouteKey: null,
  },
  {
    id: "d1c2134c-35fd-44c4-b3c1-24b9c182e060",
    title: "bollo 2.0 使用说明书",
    coverUrl:
      "https://placehold.co/600x400/141414/D4FF3F?text=bollo",
    endsInLabel: "10天后结束",
    participantsLabel: "1 人已参与",
    kind: "ongoing",
    specialRouteKey:
      "https://ecncw7du1qtr.feishu.cn/wiki/OHXrwS10Ni7bUZkzuXicT55Jn3g?from=from_copylink",
  },
  {
    id: "57fbbe31-a97f-4a90-a521-3c216cc0e77c",
    title: "「用bollo让主队夺冠」内容征集大赛",
    coverUrl:
      "https://placehold.co/600x400/141414/D4FF3F?text=bollo",
    endsInLabel: "12小时前结束",
    participantsLabel: "381 人已参与",
    kind: "past",
    specialRouteKey: null,
  },
  {
    id: "19d0eabe-22aa-48a9-94dd-2a571a4ef86a",
    title: "算力锦鲤来袭！",
    coverUrl:
      "https://placehold.co/600x400/141414/D4FF3F?text=bollo",
    endsInLabel: "20天前结束",
    participantsLabel: "成为第一个参与者",
    kind: "past",
    specialRouteKey: "lucky-draw",
  },
  {
    id: "9980fa0c-8663-4073-9be9-8b32148664b4",
    title: "我用bollo复刻经典名场面",
    coverUrl:
      "https://placehold.co/600x400/141414/D4FF3F?text=bollo",
    endsInLabel: "21天前结束",
    participantsLabel: "200 人已参与",
    kind: "past",
    specialRouteKey: null,
  },
];

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
            return (
              <Link
                key={c.id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group relative flex h-[220px] w-[668px] shrink-0 items-end overflow-hidden rounded-xl text-left"
                style={{
                  scrollSnapAlign: "start",
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%), url(${c.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="relative w-full p-4">
                  <h3 className="text-base font-semibold text-white">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-white/70">
                    {c.endsInLabel} · {c.participantsLabel}
                  </p>
                </div>
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
