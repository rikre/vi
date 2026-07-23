import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

const SKILLS = [
  "我在世界杯现场",
  "无人机航拍",
  "卡牌游戏买量",
  "放置游戏买量",
  "搞笑故事",
  "萌宠故事",
  "悬疑故事",
  "贴纸设计",
  "亚克力牌设计",
];

export function SkillSection() {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="text-base font-medium text-foreground/80">技能制造机</h2>
        <Link
          href="/skill"
          className="inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          去制作
          <ArrowRightIcon className="ml-1 size-3" />
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {SKILLS.map((s) => (
          <button
            key={s}
            type="button"
            className="group flex h-[120px] w-[180px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:bg-white/[0.08]"
          >
            <div className="size-10 rounded-lg bg-gradient-to-br from-brand/30 to-cyan/30" />
            <span className="text-sm text-foreground">{s}</span>
            <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
              去创作
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
