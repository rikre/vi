import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  CoinsIcon,
  EyeIcon,
  PlayIcon,
  PlusIcon,
  SparkleIcon,
} from "@/components/icons";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

/* ------------------------------------------------------------------ */
/*  Design tokens — unified card language                             */
/* ------------------------------------------------------------------ */
const CARD_BASE =
  "group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20";
const CARD_IMG =
  "absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]";
const CARD_OVERLAY =
  "absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent";

/* ------------------------------------------------------------------ */
/*  Section header                                                    */
/* ------------------------------------------------------------------ */
function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
        <span className="h-3.5 w-1 rounded-full bg-gradient-to-b from-[#F0FF8C] to-[#00e5c8]" />
        {title}
      </h3>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-[12px] text-white/45 transition-colors hover:text-white/85"
      >
        查看更多
        <ChevronRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  剧本广场                                                          */
/* ------------------------------------------------------------------ */
type Poster = {
  title: string;
  tags: string;
  plays: string;
  score: string;
  prompt: string;
};

const SCRIPT_FEATURED: Poster = {
  title: "送货工逆袭：假结婚吓跑吸血鬼全家",
  tags: "标准 · 男频 · 都市",
  plays: "128.5万",
  score: "8.9",
  prompt:
    "modern chinese drama ensemble poster, woman in red qipao holding a rose, group cast, warm cinematic light, no text",
};

const SCRIPT_ITEMS: Poster[] = [
  {
    title: "饥荒年爆改砖厂",
    tags: "标准 · 男频 · 都市",
    plays: "86.2万",
    score: "8.7",
    prompt: "retro chinese drama couple portrait 1980s style, no text",
  },
  {
    title: "天王殿主竟是我儿砸",
    tags: "标准 · 男频 · 都市",
    plays: "54.1万",
    score: "8.5",
    prompt: "modern urban drama cast portrait in office, no text",
  },
  {
    title: "杂役戏神：西洋魔…",
    tags: "标准 · 男频 · 都市",
    plays: "42.8万",
    score: "8.6",
    prompt: "masquerade mask man red neon circus drama poster, no text",
  },
  {
    title: "铁拳老爸：女儿参…",
    tags: "标准 · 男频 · 都市",
    plays: "38.6万",
    score: "8.4",
    prompt: "boxing gym father and daughter dramatic monochrome drama poster, no text",
  },
];

function PosterCard({
  poster,
  big,
  href,
}: {
  poster: Poster;
  big?: boolean;
  href: string;
}) {
  return (
    <Link href={href} className={cn(CARD_BASE, "aspect-[3/4] block")}>
      <img
        src={txi(poster.prompt, "portrait_4_3")}
        alt={poster.title}
        loading="lazy"
        className={CARD_IMG}
      />
      <div className={CARD_OVERLAY} />

      {/* hover action */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-black shadow-lg">
          <EyeIcon className="size-3.5" />
          查看详情
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3">
        <div
          className={cn(
            "line-clamp-2 font-bold leading-snug text-white drop-shadow",
            big ? "text-[15px]" : "text-[12.5px]"
          )}
        >
          {poster.title}
        </div>
        <div
          className={cn(
            "mt-1 text-white/60",
            big ? "text-[11.5px]" : "text-[10.5px]"
          )}
        >
          {poster.tags}
        </div>
        <div
          className={cn(
            "mt-1.5 flex items-center gap-2 text-white/40",
            big ? "text-[11px]" : "text-[10px]"
          )}
        >
          <span className="flex items-center gap-0.5">
            <PlayIcon className="size-3" />
            {poster.plays}
          </span>
          <span>·</span>
          <span>⭐ {poster.score}</span>
        </div>
      </div>
    </Link>
  );
}

function ScriptPlaza() {
  return (
    <section>
      <SectionHeader title="剧本广场" href="/skill" />
      <div className="grid grid-cols-3 grid-rows-2 gap-2.5">
        <div className="row-span-2">
          <PosterCard poster={SCRIPT_FEATURED} big href="/skill" />
        </div>
        {SCRIPT_ITEMS.map((p) => (
          <PosterCard key={p.title} poster={p} href="/skill" />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  数字艺人                                                          */
/* ------------------------------------------------------------------ */
type Artist = {
  name: string;
  meta: string;
  kind: "real" | "virtual";
  coins?: number;
  memberFree?: boolean;
  prompt: string;
};

const ARTISTS: Artist[] = [
  {
    name: "林晚晴",
    meta: "真人 · 都市女主",
    kind: "real",
    coins: 1280,
    prompt: "elegant chinese urban woman portrait soft studio light, no text",
  },
  {
    name: "顾北辰",
    meta: "真人 · 霸总男主",
    kind: "real",
    coins: 1280,
    prompt: "handsome chinese businessman in suit confident portrait, no text",
  },
  {
    name: "萌系3D少女",
    meta: "虚拟 · 3D 形象",
    kind: "virtual",
    memberFree: true,
    prompt: "cute 3d rendered anime girl character pastel lighting, no text",
  },
  {
    name: "戏骨老生",
    meta: "真人 · 年代戏骨",
    kind: "real",
    coins: 980,
    prompt: "distinguished elderly chinese actor period drama portrait, no text",
  },
  {
    name: "奇幻精灵",
    meta: "虚拟 · 3D 形象",
    kind: "virtual",
    coins: 680,
    prompt: "fantasy 3d elf character glowing magical aura, no text",
  },
  {
    name: "欧美电影感女主",
    meta: "真人 · 欧美质感",
    kind: "real",
    coins: 1580,
    prompt: "cinematic western actress dramatic film still portrait, no text",
  },
];

function ArtistKindBadge({ kind }: { kind: "real" | "virtual" }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 backdrop-blur",
        kind === "real"
          ? "bg-white/10 text-white/80 ring-white/20"
          : "bg-[#00e5c8]/15 text-[#7dffe6] ring-[#00e5c8]/30"
      )}
    >
      {kind === "real" ? "真人" : "虚拟"}
    </span>
  );
}

function ArtistPriceBadge({ artist }: { artist: Artist }) {
  if (artist.kind === "real" && artist.coins) {
    return (
      <span className="flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[#D4FF3F] ring-1 ring-[#D4FF3F]/30 backdrop-blur">
        <CoinsIcon className="size-3" />
        {artist.coins}
      </span>
    );
  }
  if (artist.memberFree) {
    return (
      <span className="rounded-md bg-[#D4FF3F]/15 px-1.5 py-0.5 text-[10.5px] font-bold text-[#D4FF3F] ring-1 ring-[#D4FF3F]/30 backdrop-blur">
        会员免费
      </span>
    );
  }
  return (
    <span className="rounded-md bg-[#00e5c8]/15 px-1.5 py-0.5 text-[10.5px] font-bold text-[#7dffe6] ring-1 ring-[#00e5c8]/30 backdrop-blur">
      免费
    </span>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href="/library" className={cn(CARD_BASE, "aspect-[3/4] block")}>
      <img
        src={txi(artist.prompt, "portrait_4_3")}
        alt={artist.name}
        loading="lazy"
        className={CARD_IMG}
      />
      <div className={CARD_OVERLAY} />

      {/* top badges */}
      <div className="absolute left-2 top-2">
        <ArtistKindBadge kind={artist.kind} />
      </div>
      <div className="absolute right-2 top-2">
        <ArtistPriceBadge artist={artist} />
      </div>

      {/* hover actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-110"
          title="播放试镜"
        >
          <PlayIcon className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-110"
          title="查看换装"
        >
          <SparkleIcon className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-[#D4FF3F] text-black shadow-lg transition-transform hover:scale-110"
          title="使用"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <div className="line-clamp-1 text-[12.5px] font-bold text-white drop-shadow">
          {artist.name}
        </div>
        <div className="mt-0.5 line-clamp-1 text-[10.5px] text-white/55">
          {artist.meta}
        </div>
      </div>
    </Link>
  );
}

function ArtistPlaza() {
  return (
    <section>
      <SectionHeader title="数字艺人" href="/library" />
      <div className="grid grid-cols-3 gap-2.5">
        {ARTISTS.slice(0, 6).map((a) => (
          <ArtistCard key={a.name} artist={a} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                            */
/* ------------------------------------------------------------------ */
export function ContentPlazas() {
  return (
    <div className="mt-10 space-y-10">
      <div className="grid gap-x-6 gap-y-10 lg:grid-cols-2">
        <ScriptPlaza />
        <ArtistPlaza />
      </div>
    </div>
  );
}
