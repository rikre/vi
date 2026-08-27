"use client";

import { cn } from "@/lib/utils";
import { AgentDockTrigger } from "./agent-dock";

type TopBarProps = {
  className?: string;
  onToggleAgent?: () => void;
  agentOpen?: boolean;
};

export function TopBar({ className, onToggleAgent, agentOpen }: TopBarProps) {
  return (
    <div
      className={cn(
        "flex h-14 shrink-0 items-center justify-end gap-2 px-6",
        className
      )}
    >
      {onToggleAgent && (
        <AgentDockTrigger
          onClick={onToggleAgent}
          active={!!agentOpen}
        />
      )}
    </div>
  );
}
