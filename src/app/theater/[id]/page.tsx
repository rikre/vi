"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  TheaterPlayer,
  type TheaterDetail,
  type TheaterEpisode,
  type TheaterService,
  type TheaterWork,
} from "@/components/theater/theater-player";
import { THEATERS } from "@/components/home/home-data";

/** 数字剧场演示片源（与 /create 轮播同一个 CDN 样片） */
const DEMO_VIDEO =
  "https://store.cdn.bollo.video/media/3e373f32289841fda24e32096f5a917e/6dc02e9b328ab2b2/outputs/final_video_1779181877.mp4";

/** 本地剧目数据 → 九霄 DramaDetail 结构：每部剧目即一个可切换条目，各自保持封面 */
function buildWorks(id: string): TheaterDetail | null {
  const index = THEATERS.findIndex((_, i) => String(i + 1) === id);
  if (index < 0) return null;

  // 每部剧目一个「正片」条目：卡片间即不同剧目的切换
  const makeEpisodes = (workIndex: number): TheaterEpisode[] => [
    {
      id: `ep-${workIndex + 1}`,
      name: THEATERS[workIndex].title,
      time: `2026.10.${20 + (workIndex % 9)}`,
      poster: THEATERS[workIndex].img,
      src: DEMO_VIDEO,
      pending: null,
    },
  ];

  const works: TheaterWork[] = THEATERS.map((theater, i) => ({
    id: String(i + 1),
    title: theater.title,
    author: theater.author,
    type: "AI短剧",
    ai: true,
    poster: theater.img,
    epCount: "正片",
    liked: false,
    likeCount: 1234 * (i + 3),
    episodes: makeEpisodes(i),
  }));

  return { work: works[index], works };
}

/** 模拟详情接口：400ms 延迟 + 未知 ID 报错（对齐九霄 service 语义） */
function createLocalService(): TheaterService {
  return {
    async getDrama(id: string) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const detail = buildWorks(id);
      if (!detail) throw new Error("剧目不存在或已下架");
      return detail;
    },
  };
}

/** 数字剧场沉浸播放页：公开页，不进 AppShell 与登录守卫（与 /plaza 一致） */
export default function TheaterWatchPage() {
  const params = useParams<{ id: string }>();
  const dramaId = typeof params?.id === "string" ? params.id : "";
  const service = useMemo(() => createLocalService(), []);

  return <TheaterPlayer dramaId={dramaId} service={service} />;
}
