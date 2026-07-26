"use client";

import Link from "next/link";
import { MoreIcon, PlayCircleIcon, FolderIcon } from "@/components/icons";

type Project = {
  id: number;
  title: string;
  updatedAt: string;
  thumbnail?: string;
  status?: "draft" | "processing" | "completed";
  duration?: string;
};

type ProjectCardProps = {
  project?: Project;
  isNew?: boolean;
};

function ProjectCard({ project, isNew }: ProjectCardProps) {
  if (isNew || !project) {
    return (
      <Link
        href="/new"
        className="group flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] text-white/40 transition-all hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:scale-110"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="text-[14px] font-medium">新建项目</span>
      </Link>
    );
  }

  const statusConfig = {
    draft: { label: "草稿", color: "bg-white/20 text-white/80" },
    processing: { label: "生成中", color: "bg-brand/20 text-brand" },
    completed: { label: "已完成", color: "bg-green-500/20 text-green-400" },
  };

  const status = project.status || "completed";

  return (
    <Link
      href={`/project/${project.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={
            project.thumbnail ||
            `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
              `AI animation video project thumbnail, ${project.title}, cinematic anime style, dark moody atmosphere with bollo lime green accent, professional storyboard frame`
            )}&image_size=landscape_16_9`
          }
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand/90 text-brand-foreground shadow-xl shadow-brand/30 transition-transform group-hover:scale-100">
            <PlayCircleIcon className="size-7" />
          </div>
        </div>

        <div className="absolute left-3 top-3">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm ${statusConfig[status].color}`}>
            {statusConfig[status].label}
          </span>
        </div>

        <button
          type="button"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 backdrop-blur-md transition-all hover:bg-black/70 hover:text-white group-hover:opacity-100"
          aria-label="更多操作"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("项目更多操作", project.title);
          }}
        >
          <MoreIcon className="size-4" />
        </button>

        {project.duration && (
          <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur-sm">
            {project.duration}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-1.5 line-clamp-1 text-[14px] font-semibold text-white transition-colors group-hover:text-brand">
          {project.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-white/40">{project.updatedAt}</p>
          <div className="flex items-center gap-1 text-white/30">
            <FolderIcon className="size-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <ProjectCard isNew />
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
