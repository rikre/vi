"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CoinsIcon,
  LayoutGridIcon,
  SparkleIcon,
} from "@/components/icons";
import type { ShortDramaProject } from "@/lib/mock-projects";
import { REMAKE_STEPS } from "@/lib/mock-projects";
import { useRemakeStudio } from "@/hooks/use-remake-studio";
import { SourceStep } from "./source-step";
import { MappingStep } from "./mapping-step";
import { StoryboardStep } from "./storyboard-step";
import { CompareStep } from "./compare-step";

const POINTS_BALANCE = "70,182";

export default function RemakeStudio({
  project,
}: {
  project: ShortDramaProject;
}) {
  const router = useRouter();
  const studio = useRemakeStudio(project);
  const {
    step,
    stepIndex,
    isLastStep,
    goNext,
    goStep,
    configSummary,
    episodes,
    retryEpisode,
    assetCategory,
    setAssetCategory,
    mappingsInCategory,
    batchGenerateMappings,
    addMapping,
    removeMapping,
    activeEpisode,
    setActiveEpisode,
    shots,
    generateShot,
    retryShot,
    batchGenerateShots,
    updateShotPrompt,
    syncTimeline,
    setSyncTimeline,
    compareSource,
    setCompareSource,
    exportFormat,
    setExportFormat,
    downloading,
    downloadVideo,
  } = studio;

  const handleBack = () => {
    router.push("/comic");
  };

  const handleComplete = () => {
    // 模拟完成：清掉持久化并返回列表
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(`vi:remake:${project.id}`);
      } catch {
        // 静默失败
      }
    }
    alert("重绘完成！已保存成片到项目列表。");
    router.push("/comic");
  };

  return (
    <div className="flex h-full flex-col bg-[#0d0d0d] text-white">
      {/* ===== 顶部栏 ===== */}
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 backdrop-blur-md bg-[#0d0d0d]/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="返回项目列表"
            title="返回项目列表"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <SparkleIcon className="size-4 text-brand" />
              <h1 className="text-[15px] font-semibold text-white">
                {project.title}
              </h1>
            </div>
            <span className="mt-0.5 text-[12px] text-white/40">
              {configSummary}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-white/80 ring-1 ring-white/[0.06] backdrop-blur-sm">
          <CoinsIcon className="size-4 text-brand" />
          <span>{POINTS_BALANCE}</span>
          <span className="ml-1 text-white/30">算力余额</span>
        </div>
      </header>

      {/* ===== 4 步 Stepper ===== */}
      <nav
        className="flex items-center justify-center gap-3 border-b border-white/[0.06] px-6 py-5"
        aria-label="重绘步骤"
      >
        {REMAKE_STEPS.map((s, i) => {
          const state: "done" | "active" | "todo" =
            i < stepIndex ? "done" : i === stepIndex ? "active" : "todo";
          return (
            <div key={s} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goStep(s)}
                disabled={state === "todo"}
                aria-current={state === "active" ? "step" : undefined}
                className={`group flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                  state === "active"
                    ? "bg-brand/10 ring-1 ring-brand/30"
                    : state === "done"
                      ? "hover:bg-white/[0.04]"
                      : "cursor-not-allowed opacity-50"
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-[12px] font-semibold transition-all ${
                    state === "done"
                      ? "bg-brand text-brand-foreground"
                      : state === "active"
                        ? "bg-brand text-brand-foreground"
                        : "bg-white/[0.06] text-white/40 ring-1 ring-white/[0.06]"
                  }`}
                >
                  {state === "done" ? <CheckIcon className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={`text-[13px] font-medium ${
                    state === "active"
                      ? "text-brand"
                      : state === "done"
                        ? "text-white/80"
                        : "text-white/40"
                  }`}
                >
                  {s}
                </span>
              </button>
              {i < REMAKE_STEPS.length - 1 && (
                <span
                  className={`h-px w-12 transition-colors ${
                    i < stepIndex
                      ? "bg-gradient-to-r from-brand/40 to-[#00e5c8]/40"
                      : "bg-white/[0.08]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* ===== 步骤内容区 ===== */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === "原片" && (
          <SourceStep
            episodes={episodes}
            onRetry={retryEpisode}
            onNext={goNext}
          />
        )}
        {step === "设定" && (
          <MappingStep
            assetCategory={assetCategory}
            onCategoryChange={setAssetCategory}
            mappings={mappingsInCategory}
            onAdd={addMapping}
            onRemove={removeMapping}
            onBatchGenerate={batchGenerateMappings}
            onNext={goNext}
          />
        )}
        {step === "分镜" && (
          <StoryboardStep
            activeEpisode={activeEpisode}
            onEpisodeChange={setActiveEpisode}
            shots={shots}
            onGenerateShot={generateShot}
            onRetryShot={retryShot}
            onBatchGenerate={batchGenerateShots}
            onPromptChange={updateShotPrompt}
            onNext={goNext}
          />
        )}
        {step === "视频" && (
          <CompareStep
            activeEpisode={activeEpisode}
            onEpisodeChange={setActiveEpisode}
            compareSource={compareSource}
            onCompareSourceChange={setCompareSource}
            syncTimeline={syncTimeline}
            onSyncTimelineChange={setSyncTimeline}
            exportFormat={exportFormat}
            onExportFormatChange={setExportFormat}
            downloading={downloading}
            onDownload={downloadVideo}
          />
        )}
      </div>

      {/* 步骤指示器（右下角辅助） */}
      <div className="border-t border-white/[0.06] px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-[12px] text-white/40">
          <div className="flex items-center gap-2">
            <LayoutGridIcon className="size-3.5" />
            <span>
              步骤 {stepIndex + 1} / {REMAKE_STEPS.length} · {step}
            </span>
          </div>
          {isLastStep ? (
            <button
              type="button"
              onClick={handleComplete}
              className="inline-flex items-center gap-1 rounded-full bg-brand text-black shadow-lg shadow-brand/20 px-4 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90"
            >
              <CheckIcon className="size-3.5" />
              完成重绘
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1 text-brand transition-opacity hover:opacity-80"
            >
              下一步：{REMAKE_STEPS[stepIndex + 1]}
              <ChevronDownIcon className="size-3.5 -rotate-90" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
