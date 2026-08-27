export type TabId = "artist" | "voice" | "character" | "scene" | "prop";

export type ArtistCategory =
  | "全部"
  | "真人演员"
  | "男性"
  | "女性"
  | "爆款领衔"
  | "实力主演"
  | "专业演员"
  | "新锐演员";

export type Artist = {
  id: number;
  name: string;
  category: ArtistCategory[];
  gender: "男" | "女";
  level: string;
  price: number;
  tags: string[];
  fitRoles: string;
  imagePrompt: string;
  video: string;
};

export type Voice = {
  id: number;
  name: string;
  desc: string;
  gender: "男" | "女";
  age: "青年" | "中年" | "老年";
  language: string;
  imagePrompt: string;
};

export type LegacyCard = {
  id: number;
  name: string;
  imagePrompt: string;
};

export const TABS: { id: TabId; label: string; count: number }[] = [
  { id: "artist", label: "数字艺人", count: 12 },
  { id: "voice", label: "音色库", count: 24 },
  { id: "character", label: "角色库", count: 4 },
  { id: "scene", label: "场景库", count: 1 },
  { id: "prop", label: "道具库", count: 0 },
];

export const TAB_LABEL_MAP: Record<TabId, string> = {
  artist: "创建艺人",
  voice: "克隆音色",
  character: "创建角色",
  scene: "创建场景",
  prop: "创建道具",
};

export const ARTIST_CATEGORIES: ArtistCategory[] = [
  "全部",
  "真人演员",
  "男性",
  "女性",
  "爆款领衔",
  "实力主演",
  "专业演员",
  "新锐演员",
];

// AI试戏：喜怒哀乐四大类表情包视频预览
export const EMOTION_PERFORMANCES = [
  {
    id: "happy",
    label: "喜",
    prompt: "joyful laughing expression, exaggerated happy face close-up, emotional acting",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: "angry",
    label: "怒",
    prompt: "angry furious expression, exaggerated angry face close-up, emotional acting",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "sad",
    label: "哀",
    prompt: "sad crying expression, exaggerated sorrowful face close-up, emotional acting",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "joy",
    label: "乐",
    prompt: "delighted gleeful expression, exaggerated joyful face close-up, emotional acting",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
];

// AI试装：四大时代代表妆造（不分男女，每个时代一款代表服饰，人物居中脸清晰）
export type EraOutfit = {
  id: string;
  label: string;
  outfitLabel: string;
  prompt: string;
};

export const ERA_OUTFITS: EraOutfit[] = [
  {
    id: "tang",
    label: "唐代",
    outfitLabel: "齐胸襦裙",
    prompt:
      "centered upper body portrait of a woman in Tang dynasty chest-high ruqun dress, face centered and clearly visible, looking at camera, elegant, soft studio lighting",
  },
  {
    id: "qing",
    label: "清代",
    outfitLabel: "旗装长袍",
    prompt:
      "centered upper body portrait of a woman in Qing dynasty Manchu qipao long robe, face centered and clearly visible, looking at camera, regal, soft studio lighting",
  },
  {
    id: "republic",
    label: "民国",
    outfitLabel: "旗袍",
    prompt:
      "centered upper body portrait of a woman in a 1930s Shanghai cheongsam, face centered and clearly visible, looking at camera, elegant, vintage tones",
  },
  {
    id: "urban",
    label: "当代",
    outfitLabel: "通勤套装",
    prompt:
      "centered upper body portrait of a professional woman in a modern commute suit, face centered and clearly visible, looking at camera, confident, studio lighting",
  },
];

export const DRAMA_THEMES = [
  { id: "urban", label: "都市情感" },
  { id: "ancient", label: "古装权谋" },
  { id: "suspense", label: "悬疑推理" },
  { id: "rebirth", label: "重生逆袭" },
];

export const ARTISTS: Artist[] = [
  {
    id: 1,
    name: "张阳阳",
    category: ["真人演员", "女性", "实力主演"],
    gender: "女",
    level: "实力主演",
    price: 500,
    tags: ["女性", "青年", "现代", "自然", "时尚", "知性"],
    fitRoles: "战斗 · 古装",
    imagePrompt:
      "professional female actor portrait, black turtleneck, neutral background, elegant Chinese woman, soft studio lighting",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: 2,
    name: "朱辰赫",
    category: ["真人演员", "男性", "新锐演员"],
    gender: "男",
    level: "新锐演员",
    price: 500,
    tags: ["男性", "青年", "阳光", "温暖"],
    fitRoles: "都市 · 甜宠",
    imagePrompt:
      "young Korean actor portrait, yellow sweater, cozy bedroom background, warm smile",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: 3,
    name: "林知微",
    category: ["女性", "爆款领衔"],
    gender: "女",
    level: "爆款领衔",
    price: 800,
    tags: ["女性", "古风", "清冷", "仙气"],
    fitRoles: "仙侠 · 玄幻",
    imagePrompt:
      "ethereal fantasy female character, flowing white robes, misty mountain background",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: 4,
    name: "周牧野",
    category: ["真人演员", "男性", "实力主演"],
    gender: "男",
    level: "实力主演",
    price: 600,
    tags: ["男性", "中年", "沉稳", "霸气"],
    fitRoles: "商战 · 悬疑",
    imagePrompt:
      "mature Chinese businessman portrait, dark suit, confident expression, modern office",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: 5,
    name: "苏晚晴",
    category: ["女性", "新锐演员"],
    gender: "女",
    level: "新锐演员",
    price: 400,
    tags: ["女性", "青年", "甜美", "活泼"],
    fitRoles: "校园 · 青春",
    imagePrompt:
      "cheerful young female character, school uniform, bright classroom background",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: 6,
    name: "赵霆骁",
    category: ["真人演员", "男性", "专业演员"],
    gender: "男",
    level: "专业演员",
    price: 700,
    tags: ["男性", "青年", "硬汉", "正义"],
    fitRoles: "警匪 · 动作",
    imagePrompt:
      "tough young male actor portrait, leather jacket, urban night background",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
];

export const VOICES: Voice[] = [
  {
    id: 1,
    name: "婆婆",
    desc: "语调舒缓、声线慈祥，自带岁月感的长辈音",
    gender: "女",
    age: "老年",
    language: "中文",
    imagePrompt: "elderly Chinese grandmother portrait, warm smile, soft lighting",
  },
  {
    id: 2,
    name: "幽默大爷",
    desc: "豁达沧桑的乐观爷爷，通透豁达又从容",
    gender: "男",
    age: "老年",
    language: "中文",
    imagePrompt: "elderly Chinese grandfather portrait, kind eyes, cheerful expression",
  },
  {
    id: 3,
    name: "和蔼奶奶",
    desc: "慈祥的老奶奶，耐心亲切，散发着岁月沉淀的温柔",
    gender: "女",
    age: "老年",
    language: "中文",
    imagePrompt: "gentle Chinese grandmother portrait, silver hair, warm lighting",
  },
  {
    id: 4,
    name: "武则天",
    desc: "声线威严、气场拉满，自带帝王霸气的御姐音",
    gender: "女",
    age: "中年",
    language: "中文",
    imagePrompt: "regal Chinese empress portrait, golden crown, imperial palace",
  },
  {
    id: 5,
    name: "邻居阿姨",
    desc: "温暖成熟的中年阿姨，兼具知性气质",
    gender: "女",
    age: "中年",
    language: "中文",
    imagePrompt: "middle-aged Chinese woman portrait, friendly smile, home background",
  },
  {
    id: 6,
    name: "女雷神",
    desc: "声线雄浑、气场拉满，充满力量感的御姐音",
    gender: "女",
    age: "青年",
    language: "中文",
    imagePrompt: "powerful female warrior portrait, lightning effects, dramatic lighting",
  },
  {
    id: 7,
    name: "温柔妈妈",
    desc: "语调舒缓、咬字温润，自带母性柔光的治愈音",
    gender: "女",
    age: "中年",
    language: "中文",
    imagePrompt: "gentle mother portrait, soft lighting, warm home background",
  },
  {
    id: 8,
    name: "胡子叔叔",
    desc: "历经风雨后变得沉稳的大叔，果敢让人信赖",
    gender: "男",
    age: "中年",
    language: "中文",
    imagePrompt: "mature bearded Chinese man portrait, confident expression",
  },
];

export const LEGACY_CARDS: Record<
  Exclude<TabId, "artist" | "voice">,
  LegacyCard[]
> = {
  character: [
    {
      id: 1,
      name: "虾兵",
      imagePrompt: "simple anime shrimp soldier, blue ocean theme, clean background",
    },
    {
      id: 2,
      name: "纪川",
      imagePrompt: "simple anime young man portrait, soft lighting, minimal background",
    },
    {
      id: 3,
      name: "霍云峥",
      imagePrompt: "simple anime ancient warrior portrait, dramatic lighting, clean design",
    },
    {
      id: 4,
      name: "萧世昌",
      imagePrompt: "simple anime antagonist portrait, dark atmosphere, minimal details",
    },
  ],
  scene: [
    {
      id: 101,
      name: "古风宫殿",
      imagePrompt: "simple anime palace interior, warm lighting, clean background",
    },
    {
      id: 102,
      name: "现代都市",
      imagePrompt: "simple anime city street at night, neon lights, minimal details",
    },
    {
      id: 103,
      name: "校园教室",
      imagePrompt: "simple anime classroom, sunlight, clean design",
    },
    {
      id: 104,
      name: "悬疑密室",
      imagePrompt: "simple anime mysterious room, shadows, minimal atmosphere",
    },
  ],
  prop: [
    {
      id: 201,
      name: "古剑",
      imagePrompt: "simple anime sword design, ornate hilt, clean background",
    },
    {
      id: 202,
      name: "魔法书",
      imagePrompt: "simple anime spellbook, glowing runes, minimal design",
    },
    {
      id: 203,
      name: "玉佩",
      imagePrompt: "simple anime jade pendant, green translucent, clean design",
    },
    {
      id: 204,
      name: "手枪",
      imagePrompt: "simple anime handgun, black metal, minimal details",
    },
    {
      id: 205,
      name: "手机",
      imagePrompt: "simple anime smartphone, slim profile, clean design",
    },
  ],
};

export function txi(
  prompt: string,
  size: "square" | "portrait_4_3" | "landscape_4_3" = "square",
) {
  return `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;
}
