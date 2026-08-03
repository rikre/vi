"use client";

import { MicrophoneIcon, PropIcon, SceneIcon, UserGroupIcon } from "@/components/icons";
import type { TabId } from "./data";

export function EmptyState({ type }: { type: TabId }) {
  const config: Record<
    TabId,
    { icon: React.ReactNode; title: string; action: string }
  > = {
    artist: {
      icon: <UserGroupIcon className="size-7" />,
      title: "暂无数字艺人",
      action: "创建艺人",
    },
    voice: {
      icon: <MicrophoneIcon className="size-7" />,
      title: "暂无音色",
      action: "克隆音色",
    },
    character: {
      icon: <UserGroupIcon className="size-7" />,
      title: "暂无角色资产",
      action: "创建角色",
    },
    scene: {
      icon: <SceneIcon className="size-7" />,
      title: "暂无场景资产",
      action: "创建场景",
    },
    prop: {
      icon: <PropIcon className="size-7" />,
      title: "暂无道具资产",
      action: "创建道具",
    },
  };

  const { icon, title, action } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
        {icon}
      </div>
      <p className="text-[15px] font-medium text-white/60">{title}</p>
      <p className="mt-1 text-[13px] text-white/40">
        点击右上角{action}开始创建
      </p>
    </div>
  );
}
