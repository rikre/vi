"use client";

import type { ShotItem } from "@/lib/mock-projects";
import { PlusIcon } from "@/components/icons";

export function StoryboardTableView({
  shots,
  descriptions,
  onDescriptionChange,
  onAddShot,
  onGenerateShot,
}: {
  shots: ShotItem[];
  descriptions: Record<string, string>;
  onDescriptionChange: (id: string, value: string) => void;
  onAddShot: () => void;
  onGenerateShot: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-white/50">
              <th className="w-14 p-3 font-semibold">序号</th>
              <th className="p-3 font-semibold">描述</th>
              <th className="w-20 p-3 font-semibold">时长</th>
              <th className="w-40 p-3 font-semibold">出镜角色</th>
              <th className="w-32 p-3 font-semibold">场景</th>
              <th className="w-20 p-3 font-semibold">状态</th>
              <th className="w-24 p-3 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {shots.map((shot) => {
              const isDone = shot.status === "已生成";
              const isFailed = shot.status === "失败";
              const isRunning =
                !isDone && !isFailed && shot.status !== "未开始";
              return (
                <tr key={shot.id} className="transition-colors hover:bg-white/[0.04]">
                  <td className="p-3 font-mono font-semibold text-white/80">
                    {String(shot.index).padStart(2, "0")}
                  </td>
                  <td className="p-3">
                    <textarea
                      value={descriptions[shot.id] ?? shot.description}
                      onChange={(e) =>
                        onDescriptionChange(shot.id, e.target.value)
                      }
                      rows={1}
                      className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-1.5 py-1 text-[12px] text-white/90 outline-none transition-colors placeholder:text-white/30 hover:border-white/[0.08] focus:border-brand/40 focus:bg-white/[0.02] focus:ring-1 focus:ring-brand/30"
                      placeholder="请输入分镜描述"
                    />
                  </td>
                  <td className="p-3 font-mono text-white/70">{shot.duration}</td>
                  <td className="p-3">
                    {shot.characters.length === 0 ? (
                      <span className="text-white/30">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {shot.characters.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] text-brand"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-white/70">{shot.scene}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
                        isDone
                          ? "bg-brand/15 text-brand ring-brand/20"
                          : isRunning
                            ? "bg-warning/15 text-warning ring-warning/20"
                            : "bg-white/[0.06] text-white/50 ring-white/10"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isDone
                            ? "bg-brand"
                            : isRunning
                              ? "bg-warning animate-pulse"
                              : "bg-white/40"
                        }`}
                      />
                      {shot.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onGenerateShot(shot.id)}
                      className="text-[11px] text-white/40 transition-colors hover:text-brand"
                    >
                      生成
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onAddShot}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-white/[0.12] bg-white/[0.02] py-3 text-[12px] text-white/50 transition-all hover:border-brand/40 hover:bg-brand/[0.04] hover:text-brand"
      >
        <PlusIcon className="size-3.5" />
        新增分镜
      </button>
    </div>
  );
}
