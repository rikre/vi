import Link from "next/link";

type TemplateCard = {
  title: string;
  bg: string;
};

const TEMPLATES: TemplateCard[] = [
  { title: "古风历史故事", bg: "/images/skill-cases/tang_dynastic_cover.webp" },
  { title: "萌宠搞笑视频", bg: "/images/skill-cases/pet_story_cover.webp" },
  { title: "无厘头搞怪故事", bg: "/images/skill-cases/funny_story_cover.webp" },
  { title: "悬疑恐怖片", bg: "/images/skill-cases/horrible_story_cover.webp" },
];

const CREATE_GRADIENT =
  "conic-gradient(from 180deg, #f35b8b, #ff7ee3, #8e4df7, #5e8eff, #00d4ff, #00ff9d, #d2ff5e, #f35b8b)";

export function ProjectsSection() {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-end pb-3">
        <Link
          href="/project"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          全部
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-[50px]">
        {/* Create-new card */}
        <button
          type="button"
          className="flex h-[152px] w-[259px] shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: CREATE_GRADIENT }}
        >
          <span className="text-sm font-medium">进入创作</span>
        </button>
        {/* Template cards */}
        {TEMPLATES.map((t) => (
          <button
            key={t.title}
            type="button"
            className="relative h-[152px] w-[259px] shrink-0 overflow-hidden rounded-xl text-left"
            style={{
              backgroundColor: "rgb(26,26,26)",
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0)), url(${t.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
              <div>
                <p className="text-[10px] text-white/60">创作...</p>
                <p className="text-sm font-medium text-white">{t.title}</p>
              </div>
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm">
                尝试创作
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
