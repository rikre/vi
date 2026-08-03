"use client";

import { useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  SearchIcon,
  CheckIcon,
  UploadIcon,
  PlayIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface Voice {
  id: string;
  name: string;
  gender: "女性" | "男性" | "中性";
  age: "儿童" | "青少年" | "青年" | "中年" | "老年";
  language: "中文" | "英文" | "日文";
  desc: string;
}

const MOCK_VOICES: Voice[] = [
  { id: "v1", name: "清冷碎玉音", gender: "女性", age: "青年", language: "中文", desc: "清冷高贵，适合古风女主" },
  { id: "v2", name: "温柔少女音", gender: "女性", age: "青少年", language: "中文", desc: "温柔甜美，适合校园角色" },
  { id: "v3", name: "傲娇霸总音", gender: "男性", age: "青年", language: "中文", desc: "低沉磁性，适合霸道总裁" },
  { id: "v4", name: "邻居阿姨", gender: "女性", age: "中年", language: "中文", desc: "亲切温暖，适合长辈角色" },
  { id: "v5", name: "阳光少年音", gender: "男性", age: "青少年", language: "中文", desc: "清爽活力，适合青春男主" },
  { id: "v6", name: "浣测天", gender: "男性", age: "中年", language: "中文", desc: "沉稳厚重，适合权威角色" },
  { id: "v7", name: "童声萌娃", gender: "中性", age: "儿童", language: "中文", desc: "天真烂漫，适合儿童角色" },
  { id: "v8", name: "柔美女友", gender: "女性", age: "青年", language: "中文", desc: "温柔体贴，适合女友角色" },
  { id: "v9", name: "Sweet Girl", gender: "女性", age: "青年", language: "英文", desc: "Sweet and gentle, English female" },
  { id: "v10", name: "Deep Male", gender: "男性", age: "中年", language: "英文", desc: "Deep and mature, English male" },
  { id: "v11", name: "日系少女", gender: "女性", age: "青少年", language: "日文", desc: "かわいい日系少女音" },
  { id: "v12", name: "沧桑老者", gender: "男性", age: "老年", language: "中文", desc: "饱经风霜，适合老年角色" },
];

const LANGUAGES = ["全部", "中文", "英文", "日文"] as const;
const GENDERS = ["全部", "女性", "男性", "中性"] as const;
const AGES = ["全部", "儿童", "青少年", "青年", "中年", "老年"] as const;

type Language = (typeof LANGUAGES)[number];
type Gender = (typeof GENDERS)[number];
type Age = (typeof AGES)[number];

export interface VoiceSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (voiceName: string) => void;
  characterName?: string;
}

export default function VoiceSelectorDialog({
  open,
  onClose,
  onSelect,
  characterName,
}: VoiceSelectorDialogProps) {
  const [language, setLanguage] = useState<Language>("全部");
  const [gender, setGender] = useState<Gender>("全部");
  const [age, setAge] = useState<Age>("全部");
  const [keyword, setKeyword] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    return MOCK_VOICES.filter((v) => {
      if (language !== "全部" && v.language !== language) return false;
      if (gender !== "全部" && v.gender !== gender) return false;
      if (age !== "全部" && v.age !== age) return false;
      if (keyword.trim() && !v.name.toLowerCase().includes(keyword.trim().toLowerCase())) return false;
      return true;
    });
  }, [language, gender, age, keyword]);

  const reset = () => {
    setLanguage("全部");
    setGender("全部");
    setAge("全部");
    setKeyword("");
  };

  const handleSelect = (v: Voice) => {
    setSelected(v.id);
    onSelect(v.name);
    setTimeout(() => {
      onClose();
      setSelected(null);
    }, 120);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledby="voice-selector-title"
      className="relative w-[720px] max-w-[92vw] max-h-[86vh] overflow-hidden p-6 flex flex-col"
    >
      {/* 标题 */}
      <header className="pr-8">
        <h3 id="voice-selector-title" className="text-[18px] font-semibold text-white">
          选择配音音色
        </h3>
        <p className="mt-1 text-[13px] text-white/50">
          为「{characterName || "角色"}」选择配音
        </p>
      </header>

      {/* 筛选 */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {/* 语言下拉 */}
        <div className="relative">
          <button
            ref={langBtnRef}
            type="button"
            onClick={() => setLangOpen((o) => !o)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            <span>语言：{language}</span>
            <ChevronDownIcon
              className={cn("size-3.5 transition-transform", langOpen && "rotate-180")}
            />
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[110px] overflow-hidden rounded-lg border border-white/[0.08] bg-[#1a1a1a] py-1 shadow-xl">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLanguage(l);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-1.5 text-[13px] transition-colors",
                      language === l ? "bg-brand/15 text-brand" : "text-white/70 hover:bg-white/[0.05]"
                    )}
                  >
                    {l}
                    {language === l && <CheckIcon className="size-3.5" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 搜索框 */}
        <div className="flex h-9 flex-1 min-w-[180px] items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3">
          <SearchIcon className="size-3.5 text-white/40" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索音色名称"
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 outline-none"
          />
        </div>
      </div>

      {/* 性别/年龄胶囊 */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-all",
                gender === g
                  ? "bg-brand text-black"
                  : "text-white/60 hover:text-white/80"
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1">
          {AGES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAge(a)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-all",
                age === a
                  ? "bg-brand text-black"
                  : "text-white/60 hover:text-white/80"
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* 音色卡片网格 */}
      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
              <SearchIcon className="size-5" />
            </div>
            <p className="mt-3 text-[14px] text-white/70">未找到匹配的音色</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08]"
            >
              重置筛选条件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((v) => {
              const active = selected === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelect(v)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-brand/40 bg-brand/[0.08]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  )}
                >
                  {/* 播放按钮 */}
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                      active
                        ? "border-brand bg-brand text-black"
                        : "border-white/[0.12] bg-white/[0.04] text-white/70 group-hover:border-brand/40 group-hover:text-brand"
                    )}
                  >
                    <PlayIcon className="size-3.5 translate-x-[1px]" />
                  </span>

                  {/* 中间信息 */}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "truncate text-[14px] font-medium",
                          active ? "text-brand" : "text-white"
                        )}
                      >
                        {v.name}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-1">
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                        {v.gender}
                      </span>
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                        {v.age}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-white/40">
                      {v.desc}
                    </span>
                  </span>

                  {/* 选中勾 */}
                  {active && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-black">
                      <CheckIcon className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 自定义音色上传 */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-white/70">或上传自定义音色</p>
          <p className="text-[11px] text-white/40">MP3/WAV，≤10MB，超过 5 秒自动裁剪</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 text-[12px] text-white/80 transition-colors hover:border-brand/40 hover:text-brand"
        >
          <UploadIcon className="size-3.5" />
          上传音频文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // eslint-disable-next-line no-console
              console.log("upload voice file:", file);
            }
            e.target.value = "";
          }}
        />
      </div>
    </Modal>
  );
}
