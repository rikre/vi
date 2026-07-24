"use client";

import { useRef, useState, useEffect } from "react";
import { PlayIcon, CloseIcon } from "@/components/icons";

type VideoItem = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  previewVideoUrl: string;
  subtitle: string;
  description?: string;
  stats?: string;
  plot?: string;
  link?: string;
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
    subtitle: "一纸宣纸，道断两相倾心",
    description:
      "国内首部全 AIGC 非遗古装中剧，上线两周站内累计播放9200万+；非遗古风分类稳居第2，全站热播榜稳定前12。",
    stats:
      "7月3日上线红果，国内首部全 AIGC 非遗古装中剧，上线两周站内累计播放9200万+；非遗古风分类稳居第2，全站热播榜稳定前12，完播、收藏数据优于同期古风短剧，同步登陆央视频双平台引流持续走高。",
    plot:
      "明万历泾县，纸匠苏阿坚守古法宣纸技艺，暗烛侍卫王景明潜伏纸坊追查藩王篡位阴谋，二人以宣纸为证，联手对抗贪官豪强，护非遗、守家国，互生相守深情。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "5b050f1f-f9b3-42f6-8610-29b3d91e767b",
    title: "九州明君录",
    author: "霓凰",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/78405b19-a92f-49d2-911a-7c660449bb8b_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/4391f239-64e2-4a50-88a1-b6f8507b9b17_video.mp4",
    subtitle: "乱世烽烟，谁主沉浮",
    description:
      "大周历372年，开国明君姬文渊于牧野之战力竭崩殂，临终命重臣裴守约将轩辕剑沉入洛水，以待后世明君。",
    stats:
      "上线首周播放量突破3500万，古风权谋类短剧TOP3，用户完播率42%，收藏转化率达18%。",
    plot:
      "大周历372年，开国明君姬文渊于牧野之战力竭崩殂，临终命重臣裴守约将轩辕剑沉入洛水，以待后世明君。三百年后，边关小将沈知远意外拔出轩辕剑，卷入皇权更迭与九洲纷争，踏上明君之路。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "6cac390c-0a29-41da-9f7e-47cfc18c7856",
    title: "天降绝症：我反手整顿全世界",
    author: "文化火焰AIGC",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/f16a2c9f-0bc9-411b-ba02-3c8d0f03a737_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/afcd1905-a7be-4b49-b992-26f5ce1b2786_video.mp4",
    subtitle: "生命倒计时，开启疯狂反击",
    description:
      "当一张肺癌晚期的诊断书彻底撕碎了社畜林默三十年的懦弱，他决定用生命最后的倒计时，向油腻的上司、势利的亲属和霸凌的社会发起最疯狂的还击。",
    stats:
      "现代都市逆袭题材黑马，全平台播放量1.2亿+，单集点赞峰值86万，连续两周霸榜都市短剧榜TOP1。",
    plot:
      "当一张肺癌晚期的诊断书彻底撕碎了社畜林默三十年的懦弱，他决定用生命最后的倒计时，向油腻的上司、势利的亲属和霸凌的社会发起最疯狂的还击，在绝境中活出最后的尊严。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "34622f24-4c8a-4e2c-8643-1c628fea40a8",
    title: "终末地丨在超市后门喝酒的二人",
    author: "多兰克斯",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/5c989b5c-8609-4fc7-a0b3-ab39bb8eb5ae_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/4e9d3dde-4f46-4c0d-a21b-015c2fcc0f53_video.mp4",
    subtitle: "末日废墟里，一杯酒的温度",
    description: "ed的风格是这样，主要是图片处理麻烦一点，视频生成用到的较少~",
    stats: "二次元末日题材佳作，站内播放量2800万，评论区互动率35%，被誉为最治愈的末世短片。",
    plot:
      "末日降临后的第三年，便利店店员阿九和流浪者老白每晚在超市后门分一瓶酒。两个被世界抛弃的人，在废墟里守护着彼此最后的人性微光。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "76c68868-eed6-4eec-904d-8d4e9c643539",
    title: "人间善话",
    author: "17716637375",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/24fc3c6c-4424-4e82-bfac-6462dd9a2cf2_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/1739e482-1c18-4030-9b2d-d33923f9556a_video.mp4",
    subtitle: "一群人温暖一座城",
    description: "一群人温暖一座城",
    stats: "温情纪实风格短剧，播放量4500万+，多次登上平台正能量内容推荐位。",
    plot:
      "城市角落里，普通人们用自己的方式传递着善意。外卖骑手、早餐摊主、夜班护士，一群陌生人的善意接力，温暖了整个寒冬。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "e836eafc-dca3-4a00-bfdb-8b045964328a",
    title: "牛马鬼差之天师钟馗",
    author: "18687122002",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/63fe6915-3638-4fe2-9ab8-4c80862394a7_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/95d314e6-3c72-408a-b4ec-1f2a82964a3f_video.mp4",
    subtitle: "死后觉醒，杀穿地府",
    description:
      "社畜牛马猝死工位前，死后觉醒地府系统穿越至大唐，看钟小小如何杀穿地府一步步变为大唐子民家喻户晓的镇魔天师钟馗",
    stats: "玄幻穿越题材爆款，上线15天播放量突破8000万，衍生二创视频超2万条。",
    plot:
      "社畜牛马猝死工位前，死后觉醒地府系统穿越至大唐。面对魑魅魍魉横行的人间，钟小小一路斩妖除魔，最终成为家喻户晓的镇魔天师钟馗。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "e2f2c3fd-18ed-45c3-b79a-7bc8a5a36152",
    title: "玄枯界·归真潮",
    author: "15973721801",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/27ca96b6-632f-4798-9708-053d58aa94fa_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/37ee70ca-e2a-4953-ab2c-3248ec19d403_video.mp4",
    subtitle: "以身证道，问道归真",
    description: "林砚以身证道第三百年。",
    stats: "仙侠玄幻题材口碑之作，站内评分9.1，深度用户占比达58%。",
    plot:
      "林砚以身证道第三百年，却在渡劫之时发现天地法则早已腐朽。为求真正的归真大道，他决定打破桎梏，重塑玄枯界的修行规则。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "8fef85a6-069e-42b0-b758-c3479195983a",
    title: "山鬼",
    author: "金金",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/5ab51678-0f37-4dee-adbc-ad99ea882c67_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/1a13276f-0a64-4677-a4e6-3e115a7b6d32_video.mp4",
    subtitle: "鬼山探险，揭开山鬼真相",
    description: "网红主播刘星失恋后赴“鬼山”探险散心，偶遇神秘男孩，揭开“山鬼”真相",
    stats: "悬疑探险短剧，播放量6200万，剧情反转引发全网热议。",
    plot:
      "网红主播刘星失恋后赴“鬼山”探险散心，偶遇神秘男孩。随着二人深入山林，一段被遗忘的古老传说逐渐浮出水面，山鬼的真相竟与刘星的身世息息相关。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "62522151-d893-49bb-b2f7-6684c376ca22",
    title: "一剑赴山河，江湖本是客",
    author: "19806692620",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/cb31c98b-8356-40b9-8e93-5b7cec483dcd_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/fcfe6532-868d-423d-863b-fc240967914c_video.mp4",
    subtitle: "女子仗剑，踏遍山河",
    description: "世人总说女子该安分守于闺阁，可她偏要一身劲装，手握长剑踏遍山河。",
    stats: "古风武侠女性向短剧，播放量3800万+，女性用户占比76%。",
    plot:
      "世人总说女子该安分守于闺阁，可她偏要一身劲装，手握长剑踏遍山河。为追查师门灭门真相，女侠沈青辞独行江湖，却在途中卷入一场足以改变天下的阴谋。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
  {
    id: "740eff2e-5b20-4c73-a0a4-52b88d4c4133",
    title: "终末地｜小猫只想睡觉",
    author: "多兰克斯",
    coverUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/7dcec55f-dc98-4071-a680-c6f310a67aa1_cover.webp",
    previewVideoUrl:
      "https://static-oiioii-sg.hogiai.cn/home_recommends_v2/82c04ec9-94c7-410e-af6d-061bbb0b0455_video.mp4",
    subtitle: "末日危机，小猫只想躺平",
    description: "复刻了一下小猫快跑配对打危机合约~",
    stats: "萌系末日题材创意短片，站内播放量2100万，萌宠类目周榜TOP2。",
    plot:
      "末日世界里，其他生物都在为生存厮杀，只有小猫一心只想找个暖和的地方睡觉。然而命运偏偏不让它如愿，一次次被卷入危机合约的漩涡。",
    link: "发现更多精彩视频 · 抖音搜索",
  },
];

function VideoCard({
  v,
  onClick,
}: {
  v: VideoItem;
  onClick: (video: VideoItem) => void;
}) {
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
    <button
      type="button"
      onClick={() => onClick(v)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group block w-full text-left"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 group-hover:ring-white/20">
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
    </button>
  );
}

function VideoPlayerDialog({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (video && el) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
    return () => {
      if (el) el.pause();
    };
  }, [video]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[1200px] overflow-hidden rounded-2xl bg-black ring-1 ring-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-white/60 ring-1 ring-white/10 transition-colors hover:bg-black/80 hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>

        {/* Left: video player */}
        <div className="relative flex flex-1 items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={video.previewVideoUrl}
            controls
            autoPlay
            className="max-h-[80vh] w-full"
          />
        </div>

        {/* Right: info panel */}
        <div className="hidden w-[360px] shrink-0 flex-col border-l border-white/[0.08] bg-[#0a0a0a] p-5 lg:flex">
          <div className="shrink-0">
            <div className="flex items-start gap-3">
              <img
                src={video.coverUrl}
                alt={video.title}
                className="size-16 rounded-xl object-cover ring-1 ring-white/10"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-bold leading-tight text-white">
                  {video.title}
                </h3>
                <p className="mt-1 text-[12px] text-white/50">{video.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
            <div>
              <h4 className="mb-2 text-[13px] font-bold text-white">作品介绍</h4>
              <p className="text-[12px] leading-relaxed text-white/55">
                {video.description}
              </p>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-white">
                <span className="h-3 w-1 rounded-full bg-[#D4FF3F]" />
                播放数据
              </h4>
              <p className="text-[12px] leading-relaxed text-white/55">
                {video.stats}
              </p>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-white">
                <span className="h-3 w-1 rounded-full bg-[#00e5c8]" />
                剧情概要
              </h4>
              <p className="text-[12px] leading-relaxed text-white/55">
                {video.plot}
              </p>
            </div>
          </div>

          <div className="mt-4 shrink-0 border-t border-white/[0.08] pt-4">
            <a
              href="#"
              className="text-[12px] text-[#00e5c8] transition-colors hover:text-[#7dffe6]"
            >
              {video.link}
            </a>
            <p className="mt-3 text-[11px] text-white/30">灵犀星科文化</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoGrid() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  return (
    <section className="mt-10 pb-12">
      <h2 className="text-base font-medium text-foreground/85">bollo 剧场</h2>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {GRID_VIDEOS.map((v) => (
          <VideoCard key={v.id} v={v} onClick={setSelectedVideo} />
        ))}
      </div>

      <VideoPlayerDialog
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}
