"use client";

import { HeartIcon, SparkleIcon, UserGroupIcon } from "@/components/icons";

type Skill = {
  id: number;
  title: string;
  desc?: string;
  isNew?: boolean;
  usageCount?: number;
  category?: string;
};

type SkillCardProps = {
  skill: Skill;
};

function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-black/20">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
        <img
          src={`https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
            `AI video generation skill thumbnail, ${skill.title}, cinematic animation style, dark moody background with lime green accent, professional 3D render`
          )}&image_size=landscape_4_3`}
          alt={skill.title}
          className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button
          type="button"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-md transition-all hover:bg-black/70 hover:text-brand hover:scale-110"
          aria-label="添加收藏"
        >
          <HeartIcon className="size-4" />
        </button>
        {skill.isNew && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-brand-foreground shadow-lg">
            <SparkleIcon className="size-3" />
            新
          </div>
        )}
        {skill.category && (
          <div className="absolute left-3 bottom-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            {skill.category}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-1 text-[14px] font-semibold text-white transition-colors group-hover:text-brand">
          {skill.title}
        </h3>
        {skill.desc && (
          <p className="mb-3 line-clamp-2 text-[12px] leading-relaxed text-white/50">
            {skill.desc}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-white/40">
            <div className="flex items-center gap-1">
              <SparkleIcon className="size-3.5" />
              <span className="text-[11px]">bollo</span>
            </div>
            {skill.usageCount && (
              <div className="flex items-center gap-1">
                <UserGroupIcon className="size-3.5" />
                <span className="text-[11px]">{skill.usageCount > 1000 ? `${(skill.usageCount / 1000).toFixed(1)}k` : skill.usageCount}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg bg-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-white transition-all hover:bg-brand hover:text-brand-foreground hover:shadow-md hover:shadow-brand/20"
          >
            使用
          </button>
        </div>
      </div>
    </div>
  );
}

type SkillGridProps = {
  skills: Skill[];
};

export function SkillGrid({ skills }: SkillGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
