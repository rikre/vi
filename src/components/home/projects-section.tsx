import Link from "next/link";

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
      <div className="flex gap-3 pb-[50px]">
        {/* Create-new card */}
        <Link
          href="/create"
          className="flex h-[152px] w-[259px] shrink-0 items-center justify-center rounded-xl bg-brand text-black transition-all hover:brightness-105 active:scale-[0.98]"
        >
          <span className="text-sm font-bold">进入创作</span>
        </Link>
      </div>
    </div>
  );
}
