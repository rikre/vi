import { AppShell } from "@/components/layout/app-shell";
import { PlusIcon } from "@/components/icons";

const TEMPLATES = [
  {
    id: "story",
    title: "剧情故事创作",
    desc: "构建完整剧情，分镜到成片一键生成",
    badge: "热门",
  },
  {
    id: "overseas",
    title: "一键出海",
    desc: "多语言配音与字幕，快速触达海外观众",
    badge: "新",
  },
  {
    id: "screenplay",
    title: "剧本智能分集",
    desc: "长剧本自动拆分集数，节奏自动把控",
  },
  {
    id: "replicate",
    title: "爆款复刻",
    desc: "参考爆款结构，快速生成同款风格",
  },
  {
    id: "character",
    title: "角色设计",
    desc: "从设定到立绘，全方位构建角色形象",
  },
  {
    id: "funny",
    title: "搞笑故事",
    desc: "段子库 + 节奏控制，轻松产出爆笑内容",
  },
  {
    id: "pet",
    title: "萌宠故事",
    desc: "可爱萌宠主角，治愈系短片快速产出",
  },
  {
    id: "suspense",
    title: "悬疑故事",
    desc: "层层反转剧情，悬疑氛围自动渲染",
  },
];

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        <header className="mt-8 mb-8 pt-2">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
            新建创作
          </h1>
          <p className="mt-2 text-[14px] text-white/50">
            选择一个创作模板，开启你的动画项目
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="group relative flex flex-col gap-3 rounded-2xl bg-card p-5 text-left ring-1 ring-white/[0.06] transition-all hover:-translate-y-1 hover:bg-white/[0.1] hover:ring-brand/30"
            >
              {t.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
                  {t.badge}
                </span>
              )}
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <PlusIcon className="size-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-white">{t.title}</h3>
                <p className="mt-1 text-[13px] text-white/55">{t.desc}</p>
              </div>
              <span className="mt-auto inline-flex items-center text-[13px] font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                开始创作 →
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand/10 via-white/[0.04] to-transparent p-6 ring-1 ring-white/[0.06]">
          <h3 className="text-[15px] font-semibold text-white">从空白开始</h3>
          <p className="mt-1 text-[13px] text-white/55">
            不想套用模板？直接进入工作台，自由搭建你的项目。
          </p>
          <button
            type="button"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-[13px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20"
          >
            <PlusIcon className="size-4" />
            进入空白工作台
          </button>
        </div>
      </div>
    </AppShell>
  );
}
