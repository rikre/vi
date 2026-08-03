"use client";

import { useMemo, useState, useCallback } from "react";
import type {
  ShortDramaProject,
  Episode,
  Activity,
  MemberStat,
} from "@/lib/mock-projects";
import {
  getProjectActivities,
  getMemberStats,
  ALL_MEMBERS,
} from "@/lib/mock-projects";
import { updateProject } from "@/lib/project-store";

function buildPlaceholderEpisodes(total: number): Episode[] {
  return Array.from({ length: total }, (_, i) => ({
    id: `ep-${i + 1}`,
    number: i + 1,
    title: `第${i + 1}集`,
    status: "未开始" as const,
    progress: 0,
  }));
}

export function useProjectOverview(project: ShortDramaProject) {
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSelected, setInviteSelected] = useState<string[]>([]);

  const episodes: Episode[] = useMemo(() => {
    if (project.episodeList && project.episodeList.length > 0) {
      return project.episodeList;
    }
    return buildPlaceholderEpisodes(project.episodes ?? 0);
  }, [project.episodeList, project.episodes]);

  const activities: Activity[] = useMemo(
    () => getProjectActivities(project),
    [project],
  );

  const memberStats: MemberStat[] = useMemo(
    () => getMemberStats(project),
    [project],
  );

  const inviteCandidates = useMemo(
    () => ALL_MEMBERS.filter((m) => !project.members.includes(m)),
    [project.members],
  );

  const { progress, completedEpisodes, totalEpisodes } = useMemo(() => {
    const total = episodes.length;
    const completed = episodes.filter(
      (e) => e.progress >= 100 || e.status === "已完成",
    ).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      progress: percent,
      completedEpisodes: completed,
      totalEpisodes: total,
    };
  }, [episodes]);

  const saveOverview = useCallback(
    (text: string) => {
      updateProject(project.id, { description: text });
      setIsEditingOverview(false);
    },
    [project.id],
  );

  const markAllEpisodesDone = useCallback(() => {
    const updatedEpisodes = episodes.map((e) => ({
      ...e,
      progress: 100,
      status: "已完成" as const,
    }));
    updateProject(project.id, { episodeList: updatedEpisodes });
  }, [episodes, project.id]);

  const toggleInviteCandidate = useCallback((name: string) => {
    setInviteSelected((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    );
  }, []);

  const confirmInvite = useCallback(() => {
    if (inviteSelected.length === 0) return;
    const newMembers = [...project.members, ...inviteSelected];
    updateProject(project.id, { members: newMembers });
    setInviteSelected([]);
    setInviteOpen(false);
  }, [inviteSelected, project.members, project.id]);

  const closeInvite = useCallback(() => {
    setInviteOpen(false);
    setInviteSelected([]);
  }, []);

  const openInvite = useCallback(() => {
    setInviteSelected([]);
    setInviteOpen(true);
  }, []);

  return {
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
  };
}
