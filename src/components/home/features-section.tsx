import Link from "next/link";

const TIMESTAMPS = ["00:10", "00:15", "00:25", "00:30"];

export function FeaturesSection() {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base font-medium text-foreground/80">亮点功能</h2>
        <Link
          href="/skill"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          全部
        </Link>
      </div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {/* a) large-card: 剧情故事创作 (storyboard with timestamps) */}
        <button
          type="button"
          className="relative flex h-[194px] w-[320px] shrink-0 flex-col justify-between overflow-hidden rounded-xl bg-surface p-3 text-left transition-colors hover:bg-white/[0.06]"
        >
          <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-3 opacity-40">
            {TIMESTAMPS.map((t) => (
              <div
                key={t}
                className="relative overflow-hidden rounded border border-white/10 bg-black/50"
              >
                <span className="absolute left-1 top-1 font-mono text-[9px] text-white/70">
                  {t}
                </span>
              </div>
            ))}
          </div>
          <h3 className="relative text-base font-medium text-foreground">
            剧情故事创作
          </h3>
          <span className="relative self-start rounded-md bg-white/15 px-2 py-0.5 text-[11px] backdrop-blur-sm">
            去创作
          </span>
        </button>

        {/* b) stack: 一键出海 + 剧本智能分集 */}
        <div className="flex h-[194px] w-[260px] shrink-0 flex-col gap-1.5">
          <SmallCard title="一键出海" isNew />
          <SmallCard title="剧本智能分集" isNew />
        </div>

        {/* c) stack: 爆款复刻 + 角色设计 */}
        <div className="flex h-[194px] w-[260px] shrink-0 flex-col gap-1.5">
          <SmallCard title="爆款复刻" />
          <SmallCard title="角色设计" />
        </div>

        {/* d) large-card: Skill · 技能制造机 (links to /skill) */}
        <Link
          href="/skill"
          className="relative flex h-[194px] w-[320px] shrink-0 flex-col justify-between overflow-hidden rounded-xl bg-surface p-3 text-left transition-colors hover:bg-white/[0.06]"
        >
          <h3 className="relative text-base font-medium text-foreground">
            技能制造机
          </h3>
          <span className="relative self-start rounded-md bg-white/15 px-2 py-0.5 text-[11px] backdrop-blur-sm">
            去制作
          </span>
        </Link>

        {/* e) stack: 我在世界杯现场 + 无人机航拍 */}
        <div className="flex h-[194px] w-[260px] shrink-0 flex-col gap-1.5">
          <SmallCard title="我在世界杯现场" />
          <SmallCard title="无人机航拍" />
        </div>

        {/* f) stack: 卡牌游戏买量 + 放置游戏买量 */}
        <div className="flex h-[194px] w-[260px] shrink-0 flex-col gap-1.5">
          <SmallCard title="卡牌游戏买量" />
          <SmallCard title="放置游戏买量" />
        </div>

        {/* g) featured-card: 搞笑故事 */}
        <button
          type="button"
          className="relative flex h-[194px] w-[320px] shrink-0 flex-col justify-between overflow-hidden rounded-xl bg-surface p-3 text-left transition-colors hover:bg-white/[0.06]"
        >
          <h3 className="relative text-base font-medium text-foreground">
            搞笑故事
          </h3>
          <span className="relative self-start rounded-md bg-white/15 px-2 py-0.5 text-[11px] backdrop-blur-sm">
            去创作
          </span>
        </button>

        {/* h) stack: 萌宠故事 + 悬疑故事 */}
        <div className="flex h-[194px] w-[260px] shrink-0 flex-col gap-1.5">
          <SmallCard title="萌宠故事" />
          <SmallCard title="悬疑故事" />
        </div>

        {/* i) stack: 贴纸设计 + 亚克力牌设计 */}
        <div className="flex h-[194px] w-[260px] shrink-0 flex-col gap-1.5">
          <SmallCard title="贴纸设计" />
          <SmallCard title="亚克力牌设计" />
        </div>
      </div>
    </div>
  );
}

function SmallCard({ title, isNew }: { title: string; isNew?: boolean }) {
  return (
    <button
      type="button"
      className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl bg-surface p-3 text-left transition-colors hover:bg-white/[0.06]"
    >
      {isNew && (
        <span className="absolute right-2 top-2 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-foreground">
          新
        </span>
      )}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <span className="self-start rounded-md bg-white/15 px-2 py-0.5 text-[11px] backdrop-blur-sm">
        去创作
      </span>
    </button>
  );
}
