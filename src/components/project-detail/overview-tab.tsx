"use client";

import { useMemo, useState } from "react";
import type { ShortDramaProject } from "@/lib/mock-projects";
import {
  EditIcon,
  DocumentIcon,
  LayersIcon,
  UserGroupIcon,
  PlusIcon,
  CoinsIcon,
  AssetIcon,
  SceneIcon,
  PropIcon,
  UserIcon,
} from "@/components/icons";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

type AssetRow = {
  label: string;
  count: number;
  Icon: React.ComponentType<{ className?: string }>;
  status: string;
};

type MemberRow = {
  name: string;
  role: string;
  computeCost: number;
  avatarLetter: string;
};

export default function OverviewTab({
  project,
}: {
  project: ShortDramaProject;
}) {
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [overviewText, setOverviewText] = useState(project.description);

  const {
    progress,
    completedEpisodes,
    totalEpisodes,
  } = useMemo(() => {
    const list = project.episodeList ?? [];
    const total = list.length || project.episodes || 0;
    const completed = list.filter((e) => e.status === "已完成").length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      progress: percent,
      completedEpisodes: completed,
      totalEpisodes: total,
    };
  }, [project.episodeList, project.episodes]);

  const assetRows: AssetRow[] = [
    { label: "角色", count: project.assets.characters, Icon: UserIcon, status: "已就绪" },
    { label: "场景", count: project.assets.scenes, Icon: SceneIcon, status: "已就绪" },
    { label: "道具", count: project.assets.props, Icon: PropIcon, status: "部分待补" },
  ];

  const members: MemberRow[] = useMemo(() => {
    return project.members.map((name, idx) => {
      const computeCost = Math.round(project.computeSpent / Math.max(project.members.length, 1));
      const role = idx === 0 ? "负责人" : "协作者";
      return {
        name,
        role,
        computeCost,
        avatarLetter: name.slice(0, 1).toUpperCase(),
      };
    });
  }, [project.members, project.computeSpent]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Left Main Dashboard (3 columns wide) */}
      <div className="space-y-8 lg:col-span-3">
        {/* Section A: 全剧总览 */}
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
                onClick={() => setIsEditingOverview(false)}
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
              {overviewText || "待补充全剧总览"}
            </p>
          )}
        </div>

        {/* Section B: 项目概览 */}
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
            {/* Card 1: 进度 */}
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

            {/* Card 2: 资产 */}
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

            {/* Card 3: 算力 */}
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

        {/* Section C: 资产统计 */}
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
      </div>

      {/* Right Column: 成员统计 */}
      <div className="lg:col-span-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
                <UserGroupIcon className="size-4" />
              </span>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/70">
                成员统计
              </h3>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-black shadow-lg shadow-brand/20 transition-colors hover:brightness-110"
            >
              <PlusIcon className="size-3" />
              邀请
            </button>
          </div>

          <div className="rounded-2xl bg-[#141414] p-4 ring-1 ring-white/[0.08] backdrop-blur-sm">
            <ul className="space-y-3">
              {members.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-[12px] font-bold text-brand">
                    {m.avatarLetter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{m.name}</p>
                    <p className="text-[11px] text-white/40">{m.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[12px] font-bold text-brand">
                      +{m.computeCost}
                    </p>
                    <p className="text-[10px] text-white/30">算力</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
