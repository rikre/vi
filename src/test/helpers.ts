import { vi } from "vitest";

type ActFn = (fn: () => void) => void;

/**
 * 分步推进链式 setTimeout，每步让 React effect flush 后再触发下一步。
 * 用于消除 vi.advanceTimersByTime 的边界时序 flake 问题。
 *
 * 用法：await advanceChain([500, 500, 500, 400], act);
 */
export async function advanceChain(
  steps: number[],
  actFn: ActFn,
): Promise<void> {
  for (const ms of steps) {
    actFn(() => vi.advanceTimersByTime(ms));
  }
}

/**
 * 提取资产专用：3 阶段 500ms + 400ms 关闭
 */
export async function advanceExtractChain(actFn: ActFn): Promise<void> {
  await advanceChain([500, 500, 500, 400], actFn);
}
