"use client";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

export type Writer = {
  id: string;
  name: string;
  avatar: string;
  level: string;
  works: number;
  sold: number;
  tags: string[];
};

export const WRITERS: Writer[] = [
  { id: "1", name: "墨染青衣", avatar: "elegant chinese writer portrait", level: "金牌编剧", works: 23, sold: 18, tags: ["都市", "甜宠", "复仇"] },
  { id: "2", name: "北风知我", avatar: "cool chinese male writer portrait", level: "资深编剧", works: 41, sold: 32, tags: ["男频", "逆袭", "玄幻"] },
  { id: "3", name: "小楼听雨", avatar: "gentle chinese female writer portrait", level: "银牌编剧", works: 15, sold: 9, tags: ["古言", "权谋", "虐恋"] },
  { id: "4", name: "青锋照影", avatar: "determined chinese screenwriter portrait", level: "金牌编剧", works: 36, sold: 28, tags: ["悬疑", "刑侦", "短剧"] },
];

export function WriterCard({ writer }: { writer: Writer }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#141414] p-4 ring-1 ring-white/[0.08] transition-all duration-300 hover:ring-white/20">
      <img
        src={txi(writer.avatar, "square")}
        alt={writer.name}
        loading="lazy"
        className="size-14 rounded-xl object-cover ring-1 ring-white/10"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-white">
            {writer.name}
          </span>
          <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand">
            {writer.level}
          </span>
        </div>
        <div className="mt-1 flex gap-3 text-[11px] text-white/50">
          <span>作品 {writer.works}</span>
          <span>售出 {writer.sold}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {writer.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => console.log("view profile")}
        className="shrink-0 rounded-lg bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/15"
      >
        查看主页
      </button>
    </div>
  );
}
