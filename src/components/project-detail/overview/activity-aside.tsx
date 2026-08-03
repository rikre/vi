"use client";

import type { Activity, ActivityType, MemberStat } from "@/lib/mock-projects";
import {
  UserGroupIcon,
  PlusIcon,
  CheckIcon,
  BellIcon,
  ImageIcon,
  MicrophoneIcon,
  ScriptIcon,
  VideoCameraIcon,
} from "@/components/icons";
import { Modal } from "@/components/ui/modal";

const ACTIVITY_META: Record<
  ActivityType,
  { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  video: { label: "视频", color: "#7dffe6", Icon: VideoCameraIcon },
  image: { label: "图片", color: "#D4FF3F", Icon: ImageIcon },
  audio: { label: "音频", color: "#c084fc", Icon: MicrophoneIcon },
  script: { label: "脚本", color: "#7dffe6", Icon: ScriptIcon },
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
          <BellIcon className="size-4" />
        </span>
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/70">
          最近动态
        </h3>
      </div>

      <div className="rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08] backdrop-blur-sm">
        <ul className="space-y-4">
          {activities.slice(0, 5).map((a) => {
            const meta = ACTIVITY_META[a.type];
            const Icon = meta.Icon;
            return (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-[12px] font-bold text-brand">
                  {a.user.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-white/85">
                    <span className="font-bold text-white">{a.user}</span>{" "}
                    <span className="text-white/55">{a.action}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {a.timeLabel}
                  </p>
                </div>
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1"
                  style={{
                    color: meta.color,
                    backgroundColor: `${meta.color}14`,
                    boxShadow: `0 0 0 1px ${meta.color}33 inset`,
                  }}
                >
                  <Icon className="size-3" />
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
          <span className="text-[11px] text-white/40">协同已连接</span>
        </div>
      </div>
    </div>
  );
}

export function MemberPanel({
  memberStats,
  inviteOpen,
  inviteSelected,
  inviteCandidates,
  onOpenInvite,
  onToggleInvite,
  onConfirmInvite,
  onCloseInvite,
}: {
  memberStats: MemberStat[];
  inviteOpen: boolean;
  inviteSelected: string[];
  inviteCandidates: string[];
  onOpenInvite: () => void;
  onToggleInvite: (name: string) => void;
  onConfirmInvite: () => void;
  onCloseInvite: () => void;
}) {
  return (
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
          onClick={onOpenInvite}
          className="flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-black shadow-lg shadow-brand/20 transition-colors hover:brightness-110"
        >
          <PlusIcon className="size-3" />
          邀请
        </button>
      </div>

      <div className="rounded-2xl bg-[#141414] p-4 ring-1 ring-white/[0.08] backdrop-blur-sm">
        <ul className="space-y-3">
          {memberStats.map((m) => {
            const isTop = m.rank === 1;
            return (
              <li
                key={m.name}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
              >
                <span
                  className={`flex h-6 w-4 shrink-0 items-center justify-center text-[11px] font-bold ${
                    isTop ? "text-brand" : "text-white/35"
                  }`}
                >
                  #{m.rank}
                </span>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold ${
                    isTop
                      ? "border-brand/40 bg-brand/15 text-brand"
                      : "border-white/15 bg-white/[0.04] text-white/70"
                  }`}
                >
                  {m.avatarLetter}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {m.name}
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {m.outputSummary}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[12px] font-bold text-brand">
                    +{m.computeCost.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-white/30">算力</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Modal
        open={inviteOpen}
        onClose={onCloseInvite}
        title="邀请成员"
        className="relative w-[min(92vw,420px)] p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
            <UserGroupIcon className="size-4" />
          </span>
          <h3 className="text-[15px] font-bold text-white">邀请成员</h3>
        </div>

        <p className="mb-4 text-[12px] text-white/45">
          选择要加入项目的成员
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {inviteCandidates.length === 0 ? (
            <span className="text-[12px] text-white/40">暂无可邀请成员</span>
          ) : (
            inviteCandidates.map((name) => {
              const selected = inviteSelected.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onToggleInvite(name)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${
                    selected
                      ? "bg-brand text-black ring-1 ring-brand"
                      : "bg-white/[0.05] text-white/70 ring-1 ring-white/10 hover:bg-white/[0.1] hover:text-white"
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                      selected
                        ? "bg-black/20 text-black"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {name.slice(0, 1)}
                  </span>
                  {name}
                  {selected ? <CheckIcon className="size-3" /> : null}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCloseInvite}
            className="rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[12px] font-semibold text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirmInvite}
            disabled={inviteSelected.length === 0}
            className="rounded-full bg-brand px-4 py-1.5 text-[12px] font-bold text-black shadow-lg shadow-brand/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            确认邀请{inviteSelected.length > 0 ? ` (${inviteSelected.length})` : ""}
          </button>
        </div>
      </Modal>
    </div>
  );
}
