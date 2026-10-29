"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ChevronLeftIcon, FolderIcon } from "@/components/icons";
import { ImmersivePlayer } from "@/components/watch/immersive-player";
import { getProject, subscribeToProjects } from "@/lib/project-store";
import { getProjectById } from "@/lib/mock-projects";

/** 沉浸播放页：不进 AppShell，整屏黑底播放，返回入口在工作台「成片」Tab */
export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params?.id);

  const project = useSyncExternalStore(
    subscribeToProjects,
    () => (Number.isFinite(projectId) ? getProject(projectId) : undefined),
    () => (Number.isFinite(projectId) ? getProjectById(projectId) : undefined)
  );

  if (!project || project.type !== "short") {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <div className="flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
          <FolderIcon className="size-8" />
        </div>
        <div>
          <p className="text-[16px] font-semibold text-white/80">无法播放该项目</p>
          <p className="mt-1 text-[13px] text-white/40">
            {project ? "当前项目不是短剧类型" : "项目可能已被删除或 ID 错误"}
          </p>
        </div>
        <Link
          href="/project"
          className="flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          <ChevronLeftIcon className="size-4" />
          返回项目列表
        </Link>
      </div>
    );
  }

  return <ImmersivePlayer project={project} />;
}
