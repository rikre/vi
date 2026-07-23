"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { PlayIcon } from "@/components/icons";

type VideoItem = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  previewVideoUrl: string;
  description?: string;
};

const GRID_VIDEOS: VideoItem[] = [
  {
    id: "6b0f748d-edbb-410b-b60c-0a5418d6d237",
    title: "水果庄园",
    author: "18995680247",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/85f228f4-bc8b-48fb-93fd-9d33d38dc4cb_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/fcf60aeb-dda8-420f-9e00-ae18b1875f12_video.mp4",
    description: "111",
  },
  {
    id: "5b050f1f-f9b3-42f6-8610-29b3d91e767b",
    title: "九州明君录",
    author: "霓凰",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/78405b19-a92f-49d2-911a-7c660449bb8b_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/4391f239-64e2-4a50-88a1-b6f8507b9b17_video.mp4",
    description:
      "大周历372年，开国明君姬文渊于牧野之战力竭崩殂，临终命重臣裴守约将轩辕剑沉入洛水，以待后世明君。",
  },
  {
    id: "6cac390c-0a29-41da-9f7e-47cfc18c7856",
    title: "天降绝症：我反手整顿全世界",
    author: "文化火焰AIGC",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/f16a2c9f-0bc9-411b-ba02-3c8d0f03a737_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/afcd1905-a7be-4b49-b992-26f5ce1b2786_video.mp4",
    description:
      "当一张肺癌晚期的诊断书彻底撕碎了社畜林默三十年的懦弱，他决定用生命最后的倒计时，向油腻的上司、势利的亲属和霸凌的社会发起最疯狂的还击。",
  },
  {
    id: "34622f24-4c8a-4e2c-8643-1c628fea40a8",
    title: "终末地丨在超市后门喝酒的二人",
    author: "多兰克斯",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/5c989b5c-8609-4fc7-a0b3-ab39bb8eb5ae_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/4e9d3dde-4f46-4c0d-a21b-015c2fcc0f53_video.mp4",
    description: "ed的风格是这样，主要是图片处理麻烦一点，视频生成用到的较少~",
  },
  {
    id: "76c68868-eed6-4eec-904d-8d4e9c643539",
    title: "人间善话",
    author: "17716637375",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/24fc3c6c-4424-4e82-bfac-6462dd9a2cf2_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/1739e482-1c18-4030-9b2d-d33923f9556a_video.mp4",
    description: "一群人温暖一座城",
  },
  {
    id: "e836eafc-dca3-4a00-bfdb-8b045964328a",
    title: "牛马鬼差之天师钟馗",
    author: "18687122002",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/63fe6915-3638-4fe2-9ab8-4c80862394a7_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/95d314e6-3c72-408a-b4ec-1f2a82964a3f_video.mp4",
    description:
      "社畜牛马猝死工位前，死后觉醒地府系统穿越至大唐，看钟小小如何杀穿地府一步步变为大唐子民家喻户晓的镇魔天师钟馗",
  },
  {
    id: "e2f2c3fd-18ed-45c3-b79a-7bc8a5a36152",
    title: "玄枯界·归真潮",
    author: "15973721801",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/27ca96b6-632f-4798-9708-053d58aa94fa_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/37ee70ca-e2a-4953-ab2c-3248ec19d403_video.mp4",
    description: "林砚以身证道第三百年。",
  },
  {
    id: "8fef85a6-069e-42b0-b758-c3479195983a",
    title: "山鬼",
    author: "金金",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/5ab51678-0f37-4dee-adbc-ad99ea882c67_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/1a13276f-0a64-4677-a4e6-3e115a7b6d32_video.mp4",
    description: "网红主播刘星失恋后赴“鬼山”探险散心，偶遇神秘男孩，揭开“山鬼”真相",
  },
  {
    id: "62522151-d893-49bb-b2f7-6684c376ca22",
    title: "一剑赴山河，江湖本是客",
    author: "19806692620",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/cb31c98b-8356-40b9-8e93-5b7cec483dcd_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/fcfe6532-868d-423d-863b-fc240967914c_video.mp4",
    description: "世人总说女子该安分守于闺阁，可她偏要一身劲装，手握长剑踏遍山河。",
  },
  {
    id: "740eff2e-5b20-4c73-a0a4-52b88d4c4133",
    title: "终末地｜小猫只想睡觉",
    author: "多兰克斯",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/7dcec55f-dc98-4071-a680-c6f310a67aa1_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/82c04ec9-94c7-410e-af6d-061bbb0b0455_video.mp4",
    description: "复刻了一下小猫快跑配对打危机合约~",
  },
];

function VideoCard({ v }: { v: VideoItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  const onEnter = () => {
    setHovered(true);
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  };

  const onLeave = () => {
    setHovered(false);
    const el = videoRef.current;
    if (el) {
      el.pause();
    }
  };

  return (
    <Link
      href={`/space/${v.id}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group block text-left"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/30">
        <img
          src={v.coverUrl}
          alt={v.title}
          loading="lazy"
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
        />
        <video
          ref={videoRef}
          src={v.previewVideoUrl}
          muted
          loop
          playsInline
          preload="none"
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <PlayIcon className="size-4 text-white" />
          </div>
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="line-clamp-1 text-xs font-medium text-foreground/80">
          {v.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
          {v.author}
        </p>
      </div>
    </Link>
  );
}

export function VideoGrid() {
  return (
    <section className="mt-10 pb-12">
      <h2 className="text-base font-medium text-foreground/85">bollo 剧场</h2>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {GRID_VIDEOS.map((v) => (
          <VideoCard key={v.id} v={v} />
        ))}
      </div>
    </section>
  );
}
