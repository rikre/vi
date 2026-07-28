"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScriptChapter, ShortDramaProject } from "@/lib/mock-projects";
import {
  PlusIcon,
  EditIcon,
  ScriptIcon,
  CheckIcon,
  SparkleIcon,
} from "@/components/icons";

type AspectRatio = "16:9" | "9:16" | "4:3" | "3:4";
type CreateMode = "AI真人剧" | "AI漫剧" | "自定义";

const ASPECT_OPTIONS: AspectRatio[] = ["16:9", "9:16", "4:3", "3:4"];
const MODE_OPTIONS: CreateMode[] = ["AI真人剧", "AI漫剧", "自定义"];

export default function ScriptTab({
  project,
}: {
  project: ShortDramaProject;
}) {
  const initialChapters = useMemo<ScriptChapter[]>(() => {
    return (
      project.scriptChapters ?? [
        { id: "chapter-1", title: "第1章", content: project.scriptContent ?? "" },
      ]
    );
  }, [project.scriptChapters, project.scriptContent]);

  const [chapters, setChapters] = useState<ScriptChapter[]>(initialChapters);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    initialChapters[0]?.id ?? ""
  );
  const [isAnalyzingScript, setIsAnalyzingScript] = useState(true);
  const [aspect, setAspect] = useState<AspectRatio>("16:9");
  const [mode, setMode] = useState<CreateMode>("AI漫剧");
  const [styleRef, setStyleRef] = useState("现代短剧");
  const [directorNote, setDirectorNote] = useState("");

  // 1.1 秒后自动关闭解析中状态
  useEffect(() => {
    const t = setTimeout(() => setIsAnalyzingScript(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) ?? chapters[0],
    [chapters, activeChapterId]
  );

  const updateActiveChapter = (content: string) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === activeChapterId ? { ...c, content } : c))
    );
  };

  const addChapter = () => {
    const id = `chapter-${chapters.length + 1}`;
    const newChapter: ScriptChapter = {
      id,
      title: `第${chapters.length + 1}章`,
      content: "",
    };
    setChapters([...chapters, newChapter]);
    setActiveChapterId(id);
  };

  const wordCount = activeChapter?.content.length ?? 0;
  const isOverLimit = wordCount > 2000;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_240px] h-[600px]">
      {/* 左侧：章节列表 */}
      <aside className="flex min-h-0 flex-col rounded-2xl bg-[#1b1b1b]/90 p-4 ring-1 ring-white/10 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
              <ScriptIcon className="size-4" />
            </span>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-white/70">
              章节
            </h3>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/50">
              {chapters.length}
            </span>
          </div>
          <button
            type="button"
            onClick={addChapter}
            aria-label="新增章节"
            className="flex size-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-brand"
          >
            <PlusIcon className="size-3" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar">
          {chapters.length === 0 ? (
            <p className="px-2 py-6 text-center text-[12px] text-white/30">
              暂无章节，点击+新增
            </p>
          ) : (
            <ul className="space-y-1">
              {chapters.map((chapter) => {
                const active = chapter.id === activeChapterId;
                return (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      onClick={() => setActiveChapterId(chapter.id)}
                      className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                        active
                          ? "bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] text-black shadow-lg shadow-brand/20"
                          : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex-1 truncate">{chapter.title}</span>
                      <EditIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>

      {/* 中间：剧本编辑区 */}
      <section className="flex min-h-0 flex-col rounded-2xl bg-[#1b1b1b]/90 ring-1 ring-white/10 backdrop-blur-sm">
        {/* 顶部信息栏 */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2">
            <strong className="text-[14px] font-semibold text-white">
              {activeChapter?.title ?? "未选择章节"}
            </strong>
            {isAnalyzingScript ? (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 ring-1 ring-amber-500/20">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
                解析中...
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand ring-1 ring-brand/20">
                <CheckIcon className="size-3" />
                章节解析完成
              </span>
            )}
          </div>
          <span
            className={`font-mono text-[11px] ${
              isOverLimit ? "text-red-400" : "text-white/40"
            }`}
          >
            {wordCount} / 2000 字
          </span>
        </header>

        {/* 编辑器 */}
        <textarea
          value={activeChapter?.content ?? ""}
          onChange={(e) => updateActiveChapter(e.target.value)}
          spellCheck={false}
          placeholder="请输入剧本内容..."
          className="h-full w-full resize-none bg-transparent p-5 text-[14px] leading-relaxed text-white/80 outline-none placeholder:text-white/30"
        />

        {/* 底部状态条 */}
        <footer className="flex items-center gap-1.5 border-t border-white/[0.06] px-5 py-2 text-[11px] text-white/40">
          <CheckIcon className="size-3 text-brand" />
          内容已自动保存
        </footer>
      </section>

      {/* 右侧：全局设定 */}
      <aside className="flex min-h-0 flex-col rounded-2xl bg-[#1b1b1b]/90 p-4 ring-1 ring-white/10 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand/15 p-1.5 text-brand ring-1 ring-brand/20">
            <SparkleIcon className="size-4" />
          </span>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-white/70">
            全局设定
        </h3>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
          {/* 视频比例 */}
          <section>
            <h4 className="mb-2 text-[12px] font-semibold text-white/60">视频比例</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {ASPECT_OPTIONS.map((opt) => {
                const active = aspect === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAspect(opt)}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                      active
                        ? "border-transparent bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] text-black shadow-lg"
                        : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:bg-white/[0.06]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 创作模式 */}
          <section>
            <h4 className="mb-2 text-[12px] font-semibold text-white/60">创作模式</h4>
            <div className="space-y-1.5">
              {MODE_OPTIONS.map((opt) => {
                const active = mode === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMode(opt)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors ${
                      active
                        ? "border-transparent bg-gradient-to-br from-[#00e5c8] to-[#7dff8c] text-black shadow-lg"
                        : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`flex size-3.5 items-center justify-center rounded-full border ${
                        active ? "border-black/30 bg-black/20" : "border-white/30"
                      }`}
                    >
                      {active && <CheckIcon className="size-2.5 text-black" />}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 风格参考 */}
          <section>
            <h4 className="mb-2 text-[12px] font-semibold text-white/60">风格参考</h4>
            <input
              type="text"
              value={styleRef}
              onChange={(e) => setStyleRef(e.target.value)}
              placeholder="如：现代短剧"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white outline-none backdrop-blur-sm transition-colors focus:border-brand/40 focus:ring-1 focus:ring-brand/30 placeholder:text-white/30"
            />
          </section>

          {/* 导演设定 */}
          <section>
            <h4 className="mb-2 text-[12px] font-semibold text-white/60">导演设定</h4>
            <textarea
              value={directorNote}
              onChange={(e) => setDirectorNote(e.target.value)}
              rows={4}
              placeholder="镜头语言、节奏、情绪基调..."
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[12px] leading-relaxed text-white outline-none backdrop-blur-sm transition-colors focus:border-brand/40 focus:ring-1 focus:ring-brand/30 placeholder:text-white/30"
            />
          </section>
        </div>

        {/* 底部按钮 */}
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2 text-[12px] font-semibold text-black shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover"
        >
          <SparkleIcon className="size-3.5" />
          提取资产
        </button>
      </aside>
    </div>
  );
}
