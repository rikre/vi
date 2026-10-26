"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  CoinsIcon,
  ImageIcon,
  LayoutGridIcon,
  MicrophoneIcon,
  SearchIcon,
  SparkleIcon,
  TrashIcon,
  UploadIcon,
  VideoCameraIcon,
} from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

type CreationMode = "video" | "image" | "music" | "subtitle" | "upscale";
type ReferenceKind = "image" | "audio" | "video";
type AssetCategory = "角色" | "场景" | "道具";
type RecordKind = "视频" | "图片" | "音频";

type MenuOption = {
  value: string;
  label: string;
  description?: string;
};

type ReferenceItem = {
  id: string;
  name: string;
  kind: ReferenceKind;
  src?: string;
  isLocal?: boolean;
};

type ToolRecord = {
  id: string;
  title: string;
  prompt: string;
  tag: string;
  mode: CreationMode;
  kind: RecordKind;
  model: string;
  owner: string;
  createdAt: string;
  src?: string;
};

const MODE_OPTIONS: MenuOption[] = [
  { value: "video", label: "多参视频生成" },
  { value: "image", label: "图片生成" },
  { value: "music", label: "音乐生成" },
  { value: "subtitle", label: "去字幕" },
  { value: "upscale", label: "视频超分" },
];

const VIDEO_MODELS = [
  "Seedance 2.0 多参（特惠版）",
  "Seedance 2.0 多参",
  "Seedance 2.5 多参（特惠版）",
  "Seedance 2.5 多参",
  "海螺 H3 多参",
  "Seedance 2.0 Mini 多参",
];

const IMAGE_MODELS = [
  { name: "Seedream 4.5", label: "Seedream 4.5 (2K-3 / 张)", credits: 3, description: "效果均衡，色彩艳丽。" },
  { name: "Seedream 5.0 Lite", label: "Seedream 5.0 Lite (2K-3 / 张)", credits: 3, description: "善于改图，文字绘制能力强。" },
  { name: "Seedream 5.0 Pro", label: "Seedream 5.0 Pro (2K-8 / 张)", credits: 8, description: "编辑可控，效果自然。" },
  { name: "Nano Banana", label: "Nano Banana (2K-4 / 张)", credits: 4, description: "语义理解强，控制力强。" },
  { name: "Nano Banana 2", label: "Nano Banana 2 (2K-8 / 张)", credits: 8, description: "理解能力强，改图准确。" },
  { name: "Nano Banana Pro", label: "Nano Banana Pro (2K-10 / 张)", credits: 10, description: "语义理解更强，控制力更强。" },
  { name: "GPT Image 2 Low", label: "GPT Image 2 Low (2K-1 / 张)", credits: 1 },
  { name: "GPT Image 2 Medium", label: "GPT Image 2 Medium (2K-8 / 张)", credits: 8 },
  { name: "GPT Image 2 High", label: "GPT Image 2 High (2K-32 / 张)", credits: 32 },
  { name: "GPT Image 2.5 High", label: "GPT Image 2.5 High (2K-7 / 张)", credits: 7 },
  { name: "混元生图3", label: "混元生图3 (1K-2 / 张)", credits: 2, description: "高质量文生图，暂不支持图生图。" },
  { name: "Midjourney 7", label: "Midjourney 7 (1K-3 / 张)", credits: 3, description: "艺术风格突出，暂不支持图生图。" },
];

const UPSCALE_MODELS = ["腾讯 720P 超分", "腾讯 1080P 超分", "火山720P超分", "火山1080P超分"];
const VIDEO_RATIOS = ["9:16", "16:9", "21:9", "1:1"];
const IMAGE_RATIOS = ["21:9", "9:16", "4:3", "1:1", "16:9", "3:4"];

const ASSETS: Array<{
  id: string;
  name: string;
  category: AssetCategory;
  image: string;
}> = [
  { id: "shen-qingci-chang", name: "沈青瓷 · 常服装", category: "角色", image: "/images/tools/shen-qingci-chang.png" },
  { id: "shen-qingci-xing", name: "沈青瓷 · 行路装", category: "角色", image: "/images/tools/shen-qingci-xing.png" },
  { id: "sales", name: "地产销售员 · 默认造型", category: "角色", image: "/images/tools/sales.jpg" },
  { id: "xie-changan", name: "谢长安 · 儒生装", category: "角色", image: "/images/tools/xie-changan.jpg" },
  { id: "zhao-heng", name: "赵珩 · 夜行装", category: "角色", image: "/images/tools/zhao-heng.png" },
  { id: "scene-garden", name: "园林厅堂", category: "场景", image: "/images/tools/scene-garden.jpg" },
  { id: "prop-bracelet", name: "素镯&玉镯", category: "道具", image: "/images/tools/prop-bracelet.png" },
];

const PROMPT_PLACEHOLDERS: Partial<Record<CreationMode, string>> = {
  video: "在此描述视频内容，包括情节、运镜、对白、音效或者背景音乐等，上方可选择参考的视频（最多3个）、图片（最多9张）、音频（最多3个），也可直接@参考内容",
  image: "在此描述图片内容，包括主体、场景和风格等；上方可添加参考图片。",
  music: "在此描述音乐内容，包括风格、情绪和节奏等。",
};

const CONTROL_CLASS =
  "h-[34px] rounded-[9px] border border-white/[0.11] bg-white/10 px-3 text-xs text-foreground outline-none transition-colors hover:bg-white/[0.14] focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none";

function localDateKey(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function Dropdown({
  ariaLabel,
  value,
  options,
  onChange,
  direction = "down",
  displayLabel,
  className,
  buttonClassName,
}: {
  ariaLabel: string;
  value: string;
  options: MenuOption[];
  onChange: (value: string) => void;
  direction?: "up" | "down";
  displayLabel?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(CONTROL_CLASS, "flex items-center justify-between gap-2 text-left", buttonClassName)}
      >
        <span className="truncate">{displayLabel ?? selected?.label ?? value}</span>
        <ChevronDownIcon className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={`${ariaLabel}选项`}
          className={cn(
            "absolute left-0 z-40 max-h-80 min-w-full overflow-y-auto rounded-xl border border-white/10 bg-surface-elevated p-1.5 shadow-2xl",
            direction === "up" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-start justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-white/[0.07]",
                option.value === value ? "text-brand" : "text-foreground",
              )}
            >
              <span>
                <span className="block">{option.label}</span>
                {option.description ? <span className="mt-1 block text-[11px] text-muted-foreground">{option.description}</span> : null}
              </span>
              {option.value === value ? <CheckIcon className="mt-0.5 size-3.5 shrink-0" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SpecificationMenu({
  mode,
  ratio,
  resolution,
  durationIndex,
  onRatioChange,
  onResolutionChange,
  onDurationChange,
}: {
  mode: "video" | "image";
  ratio: string;
  resolution: string;
  durationIndex: number;
  onRatioChange: (value: string) => void;
  onResolutionChange: (value: string) => void;
  onDurationChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const ratios = mode === "video" ? VIDEO_RATIOS : IMAGE_RATIOS;
  const resolutions = mode === "video" ? ["720p", "1080p"] : ["2K", "4K"];
  const summary = mode === "video" ? `${ratio} | ${resolution} | ${durationIndex + 4}s` : `${ratio} | ${resolution}`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="生成规格"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(CONTROL_CLASS, "flex items-center gap-2 whitespace-nowrap")}
      >
        <span>{summary}</span>
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </button>
      {open ? (
        <div className="absolute bottom-[calc(100%+8px)] left-0 z-40 w-[280px] max-w-[calc(100vw-112px)] rounded-xl border border-white/10 bg-surface-elevated p-4 shadow-2xl" role="group" aria-label="生成规格选项">
          <p className="mb-2 text-xs text-muted-foreground">画面比例</p>
          <div className="flex flex-wrap gap-2">
            {ratios.map((item) => (
              <button key={item} type="button" aria-pressed={ratio === item} onClick={() => onRatioChange(item)} className={cn("rounded-lg border px-3 py-2 text-xs", ratio === item ? "border-brand bg-brand/10 text-brand" : "border-white/10 text-foreground hover:bg-white/[0.06]")}>{item}</button>
            ))}
          </div>
          <p className="mb-2 mt-4 text-xs text-muted-foreground">分辨率</p>
          <div className="flex gap-2">
            {resolutions.map((item) => (
              <button key={item} type="button" aria-pressed={resolution === item} onClick={() => onResolutionChange(item)} className={cn("rounded-lg border px-3 py-2 text-xs", resolution === item ? "border-brand bg-brand/10 text-brand" : "border-white/10 text-foreground hover:bg-white/[0.06]")}>{item}</button>
            ))}
          </div>
          {mode === "video" ? (
            <div className="mt-4">
              <label htmlFor="tool-video-duration" className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>视频时长</span>
                <span className="text-foreground">{durationIndex + 4}s</span>
              </label>
              <input id="tool-video-duration" type="range" min="0" max="11" step="1" value={durationIndex} onChange={(event) => onDurationChange(Number(event.target.value))} className="w-full accent-brand" />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>4s</span><span>15s</span></div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function UploadBlock({
  label,
  accept,
  multiple,
  onFiles,
}: {
  label: string;
  accept: string;
  multiple: boolean;
  onFiles: (files: File[]) => void;
}) {
  return (
    <label className="flex size-[68px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl bg-white/20 text-[11px] text-white/75 transition-colors hover:bg-white/25 focus-within:ring-2 focus-within:ring-brand motion-reduce:transition-none">
      <UploadIcon className="size-5" />
      <span>{label.replace("上传", "")}</span>
      <input
        type="file"
        aria-label={label}
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </label>
  );
}

export function ToolsStudio() {
  const [mode, setMode] = useState<CreationMode>("video");
  const [prompt, setPrompt] = useState("");
  const [tag, setTag] = useState("");
  const [videoModel, setVideoModel] = useState(VIDEO_MODELS[0]);
  const [imageModel, setImageModel] = useState(IMAGE_MODELS[0].name);
  const [upscaleModel, setUpscaleModel] = useState(UPSCALE_MODELS[0]);
  const [videoRatio, setVideoRatio] = useState("9:16");
  const [videoResolution, setVideoResolution] = useState("720p");
  const [durationIndex, setDurationIndex] = useState(1);
  const [imageRatio, setImageRatio] = useState("9:16");
  const [imageResolution, setImageResolution] = useState("2K");
  const [references, setReferences] = useState<Record<CreationMode, ReferenceItem[]>>({ video: [], image: [], music: [], subtitle: [], upscale: [] });
  const [preview, setPreview] = useState<ReferenceItem | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [assetQuery, setAssetQuery] = useState("");
  const [assetCategory, setAssetCategory] = useState<"全部" | AssetCategory>("全部");
  const [records, setRecords] = useState<ToolRecord[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const nextRecordId = useRef(0);
  const nextReferenceId = useRef(0);
  const localUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = localUrls.current;
    return () => {
      urls.forEach((url) => {
        if (typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
      });
      urls.clear();
    };
  }, []);

  const currentReferences = references[mode];
  const currentImageModel = IMAGE_MODELS.find((model) => model.name === imageModel) ?? IMAGE_MODELS[0];
  const filteredAssets = ASSETS.filter((asset) => {
    const matchesCategory = assetCategory === "全部" || asset.category === assetCategory;
    return matchesCategory && asset.name.toLowerCase().includes(assetQuery.trim().toLowerCase());
  });
  const filteredRecords = records.filter((record) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${record.title} ${record.prompt} ${record.tag}`.toLowerCase().includes(query);
    const matchesDate = !dateFilter || localDateKey(record.createdAt) === dateFilter;
    const matchesUser = userFilter === "all" || record.owner === userFilter;
    const matchesType = typeFilter === "all" || record.kind === typeFilter;
    return matchesSearch && matchesDate && matchesUser && matchesType;
  });

  const releaseReference = (reference: ReferenceItem) => {
    if (!reference.isLocal || !reference.src) return;
    if (typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(reference.src);
    localUrls.current.delete(reference.src);
  };

  const addReferences = (items: ReferenceItem[]) => {
    if (items.length === 0) return;
    const kind = items[0].kind;
    const limit = mode === "music" ? 0 : mode === "video" ? (kind === "image" ? 9 : 3) : mode === "image" ? (kind === "image" ? 9 : 0) : kind === "video" ? 1 : 0;
    if (limit === 0) {
      setError("当前创作模式不支持此类型参考素材");
      return;
    }
    const existing = references[mode];
    const occupied = existing.filter((item) => item.kind === kind).length;
    const uniqueItems = items.filter((item) => !existing.some((reference) => reference.id === item.id));
    const accepted = uniqueItems.slice(0, Math.max(0, limit - occupied));
    const rejected = items.filter((item) => !accepted.includes(item));
    rejected.forEach(releaseReference);
    if (accepted.length === 0) {
      setError(uniqueItems.length === 0 ? "该素材已添加到参考项" : "当前类型参考素材数量已达上限");
      return;
    }
    setReferences((current) => ({ ...current, [mode]: [...current[mode], ...accepted] }));
    setError("");
    setNotice(`已添加 ${accepted.length} 个参考素材`);
  };

  const handleFiles = (kind: ReferenceKind, files: File[]) => {
    const items = files.map((file) => {
      nextReferenceId.current += 1;
      const src = typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : undefined;
      if (src) localUrls.current.add(src);
      return { id: `upload-${nextReferenceId.current}`, name: file.name, kind, src, isLocal: true };
    });
    addReferences(items);
  };

  const removeReference = (reference: ReferenceItem) => {
    setReferences((current) => ({ ...current, [mode]: current[mode].filter((item) => item.id !== reference.id) }));
    releaseReference(reference);
    setNotice(`已删除参考素材 ${reference.name}`);
  };

  const handleGenerate = () => {
    const needsPrompt = mode === "video" || mode === "image" || mode === "music";
    if (needsPrompt && !prompt.trim()) {
      setError("请输入提示词后再生成");
      setNotice("");
      return;
    }
    if ((mode === "subtitle" || mode === "upscale") && !currentReferences.some((item) => item.kind === "video")) {
      setError("请先上传需要处理的视频");
      setNotice("");
      return;
    }

    nextRecordId.current += 1;
    const modeLabel = MODE_OPTIONS.find((option) => option.value === mode)?.label ?? "工具";
    const model = mode === "video" ? videoModel : mode === "image" ? imageModel : mode === "upscale" ? upscaleModel : modeLabel;
    const referenceImage = currentReferences.find((item) => item.kind === "image" && !item.isLocal)?.src;
    const record: ToolRecord = {
      id: `tool-record-${nextRecordId.current}`,
      title: prompt.trim().slice(0, 32) || `${modeLabel} ${nextRecordId.current}`,
      prompt: prompt.trim(),
      tag: tag.trim(),
      mode,
      kind: mode === "image" ? "图片" : mode === "music" ? "音频" : "视频",
      model,
      owner: "Phone User 7767",
      createdAt: new Date().toISOString(),
      src: referenceImage,
    };
    setRecords((current) => [record, ...current]);
    setError("");
    setNotice("已创建本地模拟记录，不会消耗积分");
  };

  const changeMode = (value: string) => {
    setMode(value as CreationMode);
    setError("");
    setNotice("");
  };

  const cost = mode === "video" ? "42" : mode === "image" ? String(currentImageModel.credits) : mode === "music" ? "10" : mode === "subtitle" ? "0.5 积分/秒" : "1 积分/秒";

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-surface px-[18px] pb-5 pt-[33px] [font-family:HarmonyOS_Sans_SC_Regular,sans-serif] xl:px-6">
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col">
        <section aria-label="历史记录筛选" className="flex flex-col items-stretch justify-end gap-2 min-[901px]:flex-row min-[901px]:items-center">
          <label className="relative block w-full min-[901px]:w-[240px]">
            <span className="sr-only">搜索历史记录</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索标题、提示词或标签" className={cn(CONTROL_CLASS, "w-full pl-9 pr-3 placeholder:text-muted-foreground")} />
          </label>
          <div className="flex flex-wrap items-center gap-2 max-[900px]:w-full">
            <input aria-label="按日期筛选" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className={cn(CONTROL_CLASS, "w-[115px] [color-scheme:dark] max-[390px]:flex-1")} />
            <Dropdown ariaLabel="按用户筛选" value={userFilter} onChange={setUserFilter} options={[{ value: "all", label: "全部" }, { value: "Phone User 7767", label: "Phone User 7767" }]} buttonClassName="w-[128px] max-[390px]:flex-1" className="max-[390px]:flex-1" />
            <Dropdown ariaLabel="按类型筛选" value={typeFilter} onChange={setTypeFilter} options={[{ value: "all", label: "全部" }, { value: "视频", label: "视频" }, { value: "图片", label: "图片" }, { value: "音频", label: "音频" }]} buttonClassName="w-[128px] max-[390px]:flex-1" className="max-[390px]:flex-1" />
            <a href="https://bollo.video/zh/tools?legacy=1&tab=multi-reference" target="_blank" rel="noreferrer" className={cn(CONTROL_CLASS, "flex w-[74px] items-center justify-center whitespace-nowrap")}>切换旧版</a>
          </div>
        </section>

        <section aria-label="创作记录" className="flex min-h-[180px] flex-1 flex-col py-6">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <SparkleIcon className="size-9 text-brand" />
              <h1 className="mt-4 text-base font-medium text-foreground">暂时没有内容</h1>
              <p className="mt-2 text-sm text-muted-foreground">在下方工具模块中开始创作</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRecords.map((record) => (
                <article key={record.id} className="overflow-hidden rounded-xl border border-white/10 bg-background/50">
                  <div className="relative flex aspect-video items-center justify-center bg-white/[0.04]">
                    {record.src ? <Image src={record.src} alt={record.title} fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover" loading="lazy" /> : record.kind === "图片" ? <ImageIcon className="size-9 text-brand" /> : record.kind === "音频" ? <MicrophoneIcon className="size-9 text-brand" /> : <VideoCameraIcon className="size-9 text-brand" />}
                    <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white">本地模拟 · {record.kind}</span>
                  </div>
                  <div className="p-3">
                    <h2 className="truncate text-sm font-medium text-foreground">{record.title}</h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{record.model}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span>{localDateKey(record.createdAt)}</span>
                      {record.tag ? <span className="truncate rounded bg-white/[0.07] px-2 py-0.5">{record.tag}</span> : <span>{record.owner}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-label="创作工具" className="sticky bottom-0 z-20 mx-auto w-full max-w-[896px] shrink-0 rounded-2xl border border-white/20 bg-surface-elevated/80 p-3 shadow-2xl backdrop-blur-lg">
          <div className="flex flex-wrap items-center gap-2">
            {mode === "video" ? (
              <>
                <UploadBlock label="上传图片" accept="image/*" multiple onFiles={(files) => handleFiles("image", files)} />
                <UploadBlock label="上传音频" accept="audio/mpeg,audio/mp3,.mp3" multiple onFiles={(files) => handleFiles("audio", files)} />
                <UploadBlock label="上传视频" accept="video/mp4,video/quicktime,.mp4,.mov" multiple onFiles={(files) => handleFiles("video", files)} />
              </>
            ) : null}
            {mode === "image" ? <UploadBlock label="上传图片" accept="image/*" multiple onFiles={(files) => handleFiles("image", files)} /> : null}
            {mode === "subtitle" || mode === "upscale" ? <UploadBlock label="上传视频" accept="video/mp4,video/quicktime,.mp4,.mov" multiple={false} onFiles={(files) => handleFiles("video", files)} /> : null}
          </div>

          {currentReferences.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="已添加参考素材">
              {currentReferences.map((reference) => (
                <div key={reference.id} className="w-[112px] shrink-0 rounded-lg border border-white/10 bg-black/20 p-1.5">
                  <div className="relative flex h-16 items-center justify-center overflow-hidden rounded-md bg-white/[0.05]">
                    {reference.kind === "image" && reference.src ? <Image src={reference.src} alt={reference.name} fill sizes="112px" unoptimized={reference.isLocal} className="object-cover" loading="lazy" /> : reference.kind === "audio" ? <MicrophoneIcon className="size-6 text-brand" /> : <VideoCameraIcon className="size-6 text-brand" />}
                  </div>
                  <p className="mt-1.5 truncate text-[11px] text-foreground" title={reference.name}>{reference.name}</p>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    {reference.kind === "image" && reference.src ? <button type="button" onClick={() => setPreview(reference)} className="text-[10px] text-brand hover:underline">预览图片</button> : <span className="text-[10px] text-muted-foreground">{reference.kind === "audio" ? "音频" : "视频"}</span>}
                    <button type="button" aria-label={`删除 ${reference.name}`} onClick={() => removeReference(reference)} className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-white/10 hover:text-danger"><TrashIcon className="size-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {PROMPT_PLACEHOLDERS[mode] ? (
            <div className="relative mt-3">
              <textarea aria-label="提示词" value={prompt} maxLength={8000} onChange={(event) => setPrompt(event.target.value)} placeholder={PROMPT_PLACEHOLDERS[mode]} className="h-[133px] w-full resize-none rounded-xl border border-white/10 bg-black/10 p-3 pb-7 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/60" />
              <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] text-muted-foreground">{prompt.length}/8000</span>
            </div>
          ) : null}

          {mode === "image" ? (
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => {
                if (!prompt.trim()) {
                  setError("请先输入提示词，再进行优化");
                  return;
                }
                setPrompt((current) => `${current.trim()}，电影感光影，主体清晰，镜头构图精致`);
                setError("");
              }} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-brand"><SparkleIcon className="size-3.5" />优化提示词</button>
              <button type="button" onClick={() => {
                setPrompt("一位身着素雅古装的人物站在园林厅堂中，柔和晨光，电影感构图，细腻材质，东方美学");
                setError("");
              }} className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-brand">模板提示词</button>
            </div>
          ) : null}

          {error ? <p role="alert" className="mt-2 text-xs text-danger">{error}</p> : null}
          {notice ? <p role="status" className="mt-2 text-xs text-brand">{notice}</p> : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Dropdown ariaLabel="创作模式" value={mode} onChange={changeMode} options={MODE_OPTIONS} direction="up" buttonClassName="w-[112px] min-w-0 px-2" />
            {mode === "video" || mode === "image" ? <SpecificationMenu mode={mode} ratio={mode === "video" ? videoRatio : imageRatio} resolution={mode === "video" ? videoResolution : imageResolution} durationIndex={durationIndex} onRatioChange={mode === "video" ? setVideoRatio : setImageRatio} onResolutionChange={mode === "video" ? setVideoResolution : setImageResolution} onDurationChange={setDurationIndex} /> : null}
            {mode === "video" ? <Dropdown ariaLabel="视频模型" value={videoModel} onChange={setVideoModel} options={VIDEO_MODELS.map((model) => ({ value: model, label: model }))} direction="up" buttonClassName="w-[160px] min-w-0 px-2" /> : null}
            {mode === "image" ? <Dropdown ariaLabel="图片模型" value={imageModel} onChange={setImageModel} options={IMAGE_MODELS.map((model) => ({ value: model.name, label: model.label, description: model.description }))} direction="up" displayLabel="模型 (1)" buttonClassName="min-w-[100px]" className="[&_[role=menu]]:w-[360px] [&_[role=menu]]:max-w-[calc(100vw-112px)]" /> : null}
            {mode === "upscale" ? <Dropdown ariaLabel="超分模型" value={upscaleModel} onChange={setUpscaleModel} options={UPSCALE_MODELS.map((model) => ({ value: model, label: model }))} direction="up" /> : null}
            {mode !== "subtitle" && mode !== "upscale" ? <input aria-label="历史标签" value={tag} maxLength={64} onChange={(event) => setTag(event.target.value)} placeholder="可选，用于筛选历史" className={cn(CONTROL_CLASS, "w-[88px] min-w-0 flex-none px-2 placeholder:text-muted-foreground")} /> : null}
            <button type="button" onClick={handleGenerate} title="创建本地模拟记录，不消耗积分" className="ml-auto flex h-[38px] min-w-[72px] items-center justify-center gap-1.5 rounded-xl bg-brand px-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none">
              {mode === "subtitle" || mode === "upscale" ? <span>{cost}</span> : <><CoinsIcon className="size-4" /><span>{cost}</span></>}
            </button>
          </div>
        </section>
      </div>

      <button type="button" aria-label="打开素材库" onClick={() => setLibraryOpen(true)} className="fixed right-6 top-[136px] z-30 flex size-14 items-center justify-center rounded-full bg-brand max-[900px]:top-[190px] text-brand-foreground shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none">
        <LayoutGridIcon className="size-5" />
      </button>

      <Modal open={libraryOpen} onClose={() => setLibraryOpen(false)} title="素材库" className="fixed inset-y-0 right-0 h-screen w-full max-w-sm overflow-y-auto rounded-none border-y-0 border-r-0 bg-background p-5">
        <div className="pr-10">
          <h2 className="text-lg font-semibold text-foreground">素材库</h2>
          <p className="mt-1 text-xs text-muted-foreground">Bollo 精选</p>
        </div>
        <label className="relative mt-5 block">
          <span className="sr-only">搜索素材</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="搜索素材..." className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand/60" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="素材分类">
          {(["全部", "角色", "场景", "道具"] as const).map((category) => (
            <button key={category} type="button" aria-pressed={assetCategory === category} onClick={() => setAssetCategory(category)} className={cn("rounded-lg px-3 py-2 text-xs", assetCategory === category ? "bg-brand text-brand-foreground" : "bg-white/[0.06] text-muted-foreground hover:text-foreground")}>{category}</button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {filteredAssets.map((asset) => {
            const added = currentReferences.some((reference) => reference.id === asset.id);
            return (
              <button key={asset.id} type="button" disabled={mode === "music"} onClick={() => addReferences([{ id: asset.id, name: asset.name, kind: "image", src: asset.image }])} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-left transition-colors hover:border-brand/50 disabled:cursor-not-allowed disabled:opacity-50">
                <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.04]">
                  <Image src={asset.image} alt={asset.name} fill sizes="180px" className="object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none" loading="lazy" />
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-2 min-h-8 text-xs leading-4 text-foreground">{asset.name}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]"><span className="text-muted-foreground">{asset.category}</span><span className={added ? "text-brand" : "text-muted-foreground group-hover:text-brand"}>{mode === "music" ? "当前模式不可用" : added ? "已添加" : "加入参考"}</span></div>
                </div>
              </button>
            );
          })}
        </div>
        {filteredAssets.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">没有找到匹配素材</p> : null}
      </Modal>

      <Modal open={preview !== null} onClose={() => setPreview(null)} title={preview?.name ?? "参考图片预览"} className="w-[720px] max-w-[calc(100vw-32px)] bg-surface p-4">
        {preview?.src ? (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-black/30">
            <Image src={preview.src} alt={preview.name} fill sizes="(max-width: 768px) 100vw, 720px" unoptimized={preview.isLocal} className="object-contain" />
          </div>
        ) : null}
        {preview ? <p className="mt-3 text-center text-sm text-foreground">{preview.name}</p> : null}
      </Modal>
    </div>
  );
}
