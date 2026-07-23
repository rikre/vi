"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SkillGrid } from "@/components/skill/skill-grid";
import { PlusIcon, SearchIcon, HeartIcon } from "@/components/icons";

const SKILL_CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "social", label: "自媒体" },
  { id: "ad", label: "广告营销" },
  { id: "game", label: "游戏" },
  { id: "merch", label: "周边设计" },
];

const SKILLS = [
  { id: 1, title: "故事板做视频", desc: "将故事板一键转化为流畅动画视频", isNew: true, category: "social", usageCount: 12500 },
  { id: 2, title: "我在世界杯现场", desc: "沉浸式体育赛事现场体验生成", isNew: false, category: "social", usageCount: 8900 },
  { id: 3, title: "世界杯大乱斗", desc: "趣味体育竞技动画", isNew: false, category: "game", usageCount: 6200 },
  { id: 4, title: "无人机航拍", desc: "震撼航拍视角镜头生成", isNew: false, category: "social", usageCount: 15600 },
  { id: 5, title: "水果短剧", desc: "可爱水果角色趣味短剧", isNew: false, category: "social", usageCount: 9800 },
  { id: 6, title: "人生故事蒙太奇", desc: "人生回忆蒙太奇动画风格", isNew: true, category: "social", usageCount: 4500 },
  { id: 7, title: "万物拟人化", desc: "物体拟人化创意短片", isNew: true, category: "social", usageCount: 7300 },
  { id: 8, title: "萌宠故事", desc: "宠物主角温馨搞笑动画", isNew: false, category: "social", usageCount: 21000 },
  { id: 9, title: "搞笑故事", desc: "喜剧段子趣味动画化", isNew: false, category: "social", usageCount: 18700 },
  { id: 10, title: "悬疑故事", desc: "紧张悬疑氛围叙事动画", isNew: false, category: "social", usageCount: 11200 },
  { id: 11, title: "今敏视听美学", desc: "大师级梦幻转场与视觉风格", isNew: false, category: "social", usageCount: 5600 },
  { id: 12, title: "泡面番", desc: "3分钟轻松短动画制作", isNew: false, category: "social", usageCount: 13400 },
  { id: 13, title: "世奇小故事", desc: "奇妙物语反转故事", isNew: false, category: "social", usageCount: 8100 },
  { id: 14, title: "无厘头短片", desc: "无逻辑爆笑短视频", isNew: false, category: "social", usageCount: 16800 },
  { id: 15, title: "短剧带货广告", desc: "剧情式商品植入广告", isNew: false, category: "ad", usageCount: 23000 },
  { id: 16, title: "真人带货广告", desc: "真人主播风格带货视频", isNew: false, category: "ad", usageCount: 19500 },
  { id: 17, title: "通用商品展示广告", desc: "精美商品3D展示", isNew: false, category: "ad", usageCount: 14200 },
  { id: 18, title: "家居建材展示广告", desc: "家居场景化展示", isNew: false, category: "ad", usageCount: 7800 },
  { id: 19, title: "食品饮料展示广告", desc: "诱人美食饮品特写", isNew: false, category: "ad", usageCount: 11600 },
  { id: 20, title: "日化母婴商品展示", desc: "温馨母婴用品广告", isNew: false, category: "ad", usageCount: 6900 },
  { id: 21, title: "服装饰品展示广告", desc: "时尚穿搭展示", isNew: false, category: "ad", usageCount: 9300 },
  { id: 22, title: "3C 数码展示广告", desc: "科技产品炫酷展示", isNew: false, category: "ad", usageCount: 10400 },
  { id: 23, title: "美妆个护商品展示", desc: "美妆产品精致展示", isNew: false, category: "ad", usageCount: 8700 },
  { id: 24, title: "通用剧情类游戏买量", desc: "通用剧情游戏买量视频", isNew: false, category: "game", usageCount: 25000 },
  { id: 25, title: "卡牌游戏买量视频", desc: "卡牌对战抽卡爽感", isNew: false, category: "game", usageCount: 17800 },
  { id: 26, title: "休闲放置游戏买量", desc: "轻松解压休闲游戏", isNew: false, category: "game", usageCount: 22100 },
  { id: 27, title: "乙游浪漫情感买量", desc: "唯美恋爱乙女游戏", isNew: false, category: "game", usageCount: 13600 },
  { id: 28, title: "休闲益智游戏买量", desc: "益智解谜游戏展示", isNew: false, category: "game", usageCount: 15900 },
  { id: 29, title: "模拟经营建造类买量", desc: "建造经营爽感展示", isNew: false, category: "game", usageCount: 11300 },
  { id: 30, title: "塔防游戏创意买量", desc: "塔防策略失败反转", isNew: false, category: "game", usageCount: 9700 },
  { id: 31, title: "肉鸽类游戏买量视频", desc: "Roguelike 随机关卡", isNew: false, category: "game", usageCount: 7200 },
  { id: 32, title: "SLG 游戏买量视频", desc: "策略战争宏大场面", isNew: false, category: "game", usageCount: 14500 },
  { id: 33, title: "MOBA 类游戏买量", desc: "竞技对战高光时刻", isNew: false, category: "game", usageCount: 12800 },
  { id: 34, title: "RPG 游戏买量视频", desc: "史诗角色剧情展示", isNew: false, category: "game", usageCount: 18200 },
  { id: 35, title: "体育竞速游戏买量", desc: "极速竞速激情体验", isNew: false, category: "game", usageCount: 8400 },
  { id: 36, title: "知识科普", desc: "轻松有趣知识科普动画", isNew: false, category: "social", usageCount: 19200 },
  { id: 37, title: "历史故事", desc: "历史事件生动还原", isNew: false, category: "social", usageCount: 10800 },
  { id: 38, title: "火柴人心理学", desc: "火柴人趣味心理学科普", isNew: false, category: "social", usageCount: 27000 },
  { id: 39, title: "吧唧", desc: "徽章周边设计生成", isNew: false, category: "merch", usageCount: 5300 },
  { id: 40, title: "亚克力牌", desc: "亚克力立牌设计", isNew: false, category: "merch", usageCount: 6100 },
  { id: 41, title: "贴纸", desc: "可爱贴纸设计", isNew: false, category: "merch", usageCount: 8900 },
  { id: 42, title: "手办模型", desc: "手办原型设计预览", isNew: false, category: "merch", usageCount: 4700 },
  { id: 43, title: "拼豆", desc: "拼豆图案设计", isNew: false, category: "merch", usageCount: 3200 },
  { id: 44, title: "钥匙扣", desc: "钥匙扣挂件设计", isNew: false, category: "merch", usageCount: 5800 },
  { id: 45, title: "痛包", desc: "痛包装饰设计方案", isNew: false, category: "merch", usageCount: 4100 },
  { id: 46, title: "手机壳", desc: "个性手机壳图案设计", isNew: false, category: "merch", usageCount: 7600 },
  { id: 47, title: "CP拍立得", desc: "CP主题拍立得风格设计", isNew: false, category: "merch", usageCount: 6700 },
  { id: 48, title: "鼠标垫", desc: "大尺寸鼠标垫图案设计", isNew: false, category: "merch", usageCount: 4500 },
  { id: 49, title: "周边墙", desc: "周边展示墙效果图", isNew: false, category: "merch", usageCount: 2900 },
];

export default function SkillPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSkills = SKILLS.filter((skill) => {
    const matchesCategory =
      activeCategory === "all" || skill.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skill.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        <div className="mt-8 flex items-center justify-between pt-2 pb-6">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
              技能广场
            </h1>
            <p className="mt-2 text-[14px] text-white/50">
              选择 AI 技能，一键生成精彩内容
            </p>
          </div>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20"
            aria-label="创建我的 Skill"
          >
            <PlusIcon className="size-4" />
            创建我的 Skill
          </button>
        </div>

        <nav aria-label="技能分类" className="mb-5 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-brand/15 px-4 text-[14px] font-medium text-brand"
          >
            <HeartIcon className="size-4" />
            我的技能
          </button>
          <div className="mx-1 h-5 w-px shrink-0 bg-white/10" />
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={
                activeCategory === cat.id
                  ? "flex h-9 shrink-0 items-center rounded-xl bg-white/[0.1] px-4 text-[14px] font-medium text-white"
                  : "flex h-9 shrink-0 items-center rounded-xl px-4 text-[14px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
              }
            >
              {cat.label}
            </button>
          ))}
        </nav>

        <div className="relative mb-6">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <SearchIcon className="size-[18px]" />
          </div>
          <input
            type="text"
            aria-label="搜索技能"
            placeholder="搜索技能名称、标签、描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border-0 bg-white/[0.06] pl-12 pr-4 text-[15px] text-white placeholder:text-white/40 transition-all focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
              <SearchIcon className="size-7" />
            </div>
            <p className="text-[15px] font-medium text-white/60">未找到匹配的技能</p>
            <p className="mt-1 text-[13px] text-white/40">尝试更换关键词或切换分类</p>
          </div>
        ) : (
          <SkillGrid skills={filteredSkills} />
        )}
      </div>
    </AppShell>
  );
}
