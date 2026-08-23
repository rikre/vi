// 商业化定价数据（见 docs/research/components/monetization.spec.md）

export type RechargeTier = {
  id: string;
  price: number;
  credits: number;
  bonusLabel?: string;
  note?: string;
  recommended?: boolean;
};

// 积分充值锚定 6 档（1 元 = 10 积分）
export const RECHARGE_TIERS: RechargeTier[] = [
  { id: "first", price: 10, credits: 150, bonusLabel: "+50%", note: "首充专享 · 终身一次" },
  { id: "t50", price: 50, credits: 500 },
  { id: "t100", price: 100, credits: 1100, bonusLabel: "+10%" },
  { id: "t300", price: 300, credits: 3450, bonusLabel: "+15%" },
  { id: "t600", price: 600, credits: 7200, bonusLabel: "+20%", recommended: true },
  { id: "t950", price: 950, credits: 10500, bonusLabel: "送1000等值" },
];

export type MemberIdentity = "personal" | "team";
export type MemberCycle = "month" | "quarter" | "year";

export type MemberPlan = {
  id: string;
  name: string;
  tagline: string;
  monthlyOriginal: number; // 月付原价 /月（个人价；团队展示时 ×2）
  yearlyMonthly: number; // 年付折合月价 /月（个人价）
  monthlyCredits: number;
  maxImages: number; // 最多约 N 张图片
  maxSeconds: number; // 最多约 N 秒视频
  videoDiscount: string;
  imageDiscount: string;
  concurrency: number;
  watermarkFree: boolean;
  hd1080p: boolean;
  hd4k: boolean;
  queue: "标准" | "优先" | "专属";
  stableService: boolean;
};

export const MEMBER_PLANS: MemberPlan[] = [
  {
    id: "lite",
    name: "轻量版",
    tagline: "轻度创作的Oii",
    monthlyOriginal: 133,
    yearlyMonthly: 86,
    monthlyCredits: 1620,
    maxImages: 810,
    maxSeconds: 810,
    videoDiscount: "最低7折",
    imageDiscount: "6.4折",
    concurrency: 10,
    watermarkFree: true,
    hd1080p: false,
    hd4k: false,
    queue: "标准",
    stableService: true,
  },
  {
    id: "pro",
    name: "专业版",
    tagline: "星恒的Oii",
    monthlyOriginal: 399,
    yearlyMonthly: 239,
    monthlyCredits: 3920,
    maxImages: 1960,
    maxSeconds: 1960,
    videoDiscount: "最低6.7折",
    imageDiscount: "6.4折",
    concurrency: 13,
    watermarkFree: true,
    hd1080p: true,
    hd4k: false,
    queue: "优先",
    stableService: true,
  },
  {
    id: "apex",
    name: "旗舰版",
    tagline: "摩物的Oii",
    monthlyOriginal: 1064,
    yearlyMonthly: 519,
    monthlyCredits: 9240,
    maxImages: 4620,
    maxSeconds: 4620,
    videoDiscount: "最低6.4折",
    imageDiscount: "6.4折",
    concurrency: 20,
    watermarkFree: true,
    hd1080p: true,
    hd4k: true,
    queue: "专属",
    stableService: true,
  },
];

// ─── 团队席位加购（T-1 卡点修复）─────────────────────────────────────────────
// 定价策略：团队版基础含 3 席位（= 个人价 ×2），
// 第 4 席起每席加收个人版当前周期月价的 1/2（积分池同步 +50% 基础额度）
export const TEAM_BASE_SEATS = 3;
export const TEAM_MAX_SEATS = 10;

/** 加席单价：个人版当前周期月价 × 1/2（round 取整，与周期联动） */
export function extraSeatPrice(plan: MemberPlan, cycle: MemberCycle): number {
  const personal =
    cycle === "month"
      ? plan.monthlyOriginal
      : cycle === "quarter"
        ? Math.round(plan.monthlyOriginal * 0.85)
        : plan.yearlyMonthly;
  return Math.round(personal * 0.5);
}

/** 团队 N 席位的积分池：基础 ×2 + 每加一席 +0.5 基础 */
export function teamCredits(plan: MemberPlan, seats: number): number {
  return Math.round(plan.monthlyCredits * (2 + 0.5 * (seats - TEAM_BASE_SEATS)));
}

export const CYCLES: {
  id: MemberCycle;
  label: string;
  discount: string;
}[] = [
  { id: "month", label: "月付", discount: "原价" },
  { id: "quarter", label: "季付", discount: "85折" },
  { id: "year", label: "年付", discount: "最低67折" },
];

// 数据驱动的年付折扣文案（取最低档，如「低至49折」），
// 供定价页 tab 徽标、个人中心会员引导等处复用，避免文案硬编码
export function yearlyDiscountLabel() {
  const min = Math.min(
    ...MEMBER_PLANS.map((p) => p.yearlyMonthly / p.monthlyOriginal),
  );
  return `低至${Math.round(min * 100)}折`;
}

export type FaqItem = { q: string; a: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "平台活动说明",
    a: "Seedance 2.5 首发活动期间（2026.8.14 14:00 - 9.17 14:00），模型生成享限时折扣，充值积分最高加赠70%。活动结束后恢复原价，已购权益不受影响。",
  },
  {
    q: "什么是积分，如何获得积分？",
    a: "积分是平台统一算力货币，1 元 = 10 积分。可通过充值、订阅会员、每日签到获得。所有模型与功能消耗统一扣积分。",
  },
  {
    q: "积分的计费规则，具体是怎么扣除的？",
    a: "按实际生成时长/张数计费。视频按秒扣积分（如 Seedance 2.5 无参考 83 积分/秒），图片按张扣积分。生成失败不扣费。",
  },
  {
    q: "我有赠送、会员、充值的积分，扣除顺序是什么？",
    a: "扣除顺序为：赠送积分 → 会员积分 → 充值积分。优先消耗有效期短的积分，保障用户利益。",
  },
  {
    q: "订阅后切换套餐，积分及权益会怎么变化？",
    a: "升级套餐即时生效，差价按剩余天数折算补缴；降级套餐于当前周期结束后生效。已发放积分不清零，权益按新套餐执行。",
  },
  {
    q: "关于自动续费与取消自动续费？",
    a: "订阅默认开启自动续费，可在「个人中心-订阅管理」随时取消，取消后当前周期权益保留至到期，不再扣费。",
  },
  {
    q: "如何申请退款？",
    a: "充值积分未消耗部分支持 7 天内无理由退款；会员订阅 7 天内且未使用会员积分可退。退款路径：个人中心-订单-申请退款。",
  },
  {
    q: "账单凭证下载与企业开发票服务",
    a: "支持下载账单凭证；企业用户可在「个人中心-发票管理」申请增值税普通/专用发票，3 个工作日内开具。",
  },
];
