"use client";

import { useState } from "react";
import type { ShortDramaProject } from "@/lib/mock-projects";
import { useProjectOverview } from "@/hooks/use-project-overview";
import {
  EditIcon,
  DocumentIcon,
  LayersIcon,
  AssetIcon,
  UserIcon,
  SceneIcon,
  PropIcon,
  CoinsIcon,
} from "@/components/icons";
import { EpisodeGrid } from "./overview/episode-grid";
import { ActivityFeed, MemberPanel } from "./overview/activity-aside";

type AssetRow = {
  label: string;
  count: number;
  Icon: React.ComponentType<{ className?: string }>;
  status: string;
};

export default function OverviewTab({
  project,
}: {
  project: ShortDramaProject;
}) {
  const [overviewText, setOverviewText] = useState(project.description);
  const {
    isEditingOverview,
    setIsEditingOverview,
    inviteOpen,
    inviteSelected,
    inviteCandidates,
    episodes,
    activities,
    memberStats,
    progress,
    completedEpisodes,
    totalEpisodes,
    saveOverview,
    markAllEpisodesDone,
    toggleInviteCandidate,
    confirmInvite,
    closeInvite,
    openInvite,
  } = useProjectOverview(project);

  const assetRows: AssetRow[] = [
    { label: "角色", count: project.assets.characters, Icon: UserIcon, status: "已就绪" },
    { label: "场景", count: project.assets.scenes, Icon: SceneIcon, status: "已就绪" },
    { label: "道具", count: project.assets.props, Icon: PropIcon, status: "部分待补" },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <div className="space-y-8 lg:col-span-3">
        {/* 全剧总览 */}
        <div className="rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
                <DocumentIcon className="size-4" />
              </span>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/70">
                全剧总览
              </h3>
            </div>
            {isEditingOverview ? (
              <button
                type="button"
                onClick={() => saveOverview(overviewText)}
                className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:brightness-110"
              >
                完成编辑
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingOverview(true)}
                className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <EditIcon className="size-3" />
                <span>编辑</span>
              </button>
            )}
          </div>

          {isEditingOverview ? (
            <textarea
              rows={4}
              value={overviewText}
              onChange={(e) => setOverviewText(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-black p-4 text-[14px] leading-relaxed text-white outline-none transition-colors focus:border-brand/40 focus:ring-1 focus:ring-brand/30"
            />
          ) : (
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-white/60">
              {project.description || "待补充全剧总览"}
            </p>
          )}
        </div>

        {/* 项目概览 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
              <LayersIcon className="size-4" />
            </span>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/70">
              项目概览
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] backdrop-blur-sm">
              <div>
                <span className="text-[12px] font-medium text-white/40">项目总进度</span>
                <h4 className="mt-2 font-mono text-[36px] font-extrabold tracking-tight text-white">
                  {progress}%
                </h4>
              </div>
              <span className="mt-4 text-[12px] font-medium text-white/50">
                完成 {completedEpisodes}/{totalEpisodes} 集
              </span>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] backdrop-blur-sm">
              <div>
                <span className="text-[12px] font-medium text-white/40">资产总数</span>
                <h4 className="mt-2 font-mono text-[36px] font-extrabold text-white">
                  {project.assets.total}
                  <span className="ml-1 text-[14px] font-normal text-white/40">个</span>
                </h4>
              </div>
              <span className="mt-4 text-[12px] font-semibold text-white/50">
                角色 {project.assets.characters} / 场景 {project.assets.scenes} / 道具 {project.assets.props}
              </span>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] backdrop-blur-sm">
              <div>
                <span className="text-[12px] font-medium text-white/40">算力消耗</span>
                <h4 className="mt-2 flex items-center gap-1.5 font-mono text-[36px] font-extrabold text-white">
                  <CoinsIcon className="size-5 text-brand" />
                  {project.computeSpent.toLocaleString()}
                </h4>
              </div>
              <span className="mt-4 text-[12px] font-semibold text-brand">
                今日 +{project.todaySpent}
              </span>
            </div>
          </div>
        </div>

        {/* 资产统计 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
              <AssetIcon className="size-4" />
            </span>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/70">
              资产统计
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {assetRows.map(({ label, count, Icon, status }) => (
              <div
                key={label}
                className="rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-white/80">
                    <Icon className="size-4 text-brand" />
                    {label}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/40">
                    <span className="inline-block size-1.5 rounded-full bg-brand" />
                    {status}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[28px] font-extrabold text-white">{count}</span>
                  <span className="text-[12px] text-white/40">个资产</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.min((count / Math.max(project.assets.total, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <EpisodeGrid episodes={episodes} onMarkAllDone={markAllEpisodesDone} />

        <ActivityFeed activities={activities} />
      </div>

      {/* Right Column: 成员统计 */}
      <div className="lg:col-span-1">
        <MemberPanel
          memberStats={memberStats}
          inviteOpen={inviteOpen}
          inviteSelected={inviteSelected}
          inviteCandidates={inviteCandidates}
          onOpenInvite={openInvite}
          onToggleInvite={toggleInviteCandidate}
          onConfirmInvite={confirmInvite}
          onCloseInvite={closeInvite}
        />
      </div>
    </div>
  );
}
