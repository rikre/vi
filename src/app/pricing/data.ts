// 商业化定价数据（会员体系参考「跳跃视界」重构，UI 对齐 DESIGN.md）

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
  monthlyPrice: number; // 连续包月价 /月（个人价）
  bonusCredits: number; // 限时赠送积分
  monthlyCredits: number; // 每月下发积分（含赠送）
  conversion: string; // 换算：¥10=N 积分
  maxImages: number; // 最多约 N 张图片
  maxSeconds: number; // 最多约 N 秒视频
  storageGb: number; // 云存储空间
  concurrency: number; // 同时生成任务数
  projects: number; // 可创建独立创作项目数
  channel: string; // 加速生成通道
  commercialLicense: string; // 商用授权
};

// 5 档个人创作会员（对齐参考站月度体验/标准/进阶/高级/专业）
export const MEMBER_PLANS: MemberPlan[] = [
  {
    id: "trial",
    name: "体验版",
    tagline: "轻量体验",
    monthlyPrice: 69,
    bonusCredits: 34,
    monthlyCredits: 724,
    conversion: "¥10=104",
    maxImages: 724,
    maxSeconds: 144,
    storageGb: 60,
    concurrency: 8,
    projects: 10,
    channel: "基础级加速生成通道",
    commercialLicense: "个体户商用授权",
  },
  {
    id: "standard",
    name: "标准版",
    tagline: "独立创作",
    monthlyPrice: 249,
    bonusCredits: 249,
    monthlyCredits: 2739,
    conversion: "¥10=110",
    maxImages: 2739,
    maxSeconds: 558,
    storageGb: 100,
    concurrency: 12,
    projects: 20,
    channel: "标准级加速生成通道",
    commercialLicense: "个体户商用授权",
  },
  {
    id: "advanced",
    name: "进阶版",
    tagline: "稳定更新",
    monthlyPrice: 599,
    bonusCredits: 599,
    monthlyCredits: 6589,
    conversion: "¥10=110",
    maxImages: 6589,
    maxSeconds: 1317,
    storageGb: 300,
    concurrency: 20,
    projects: 30,
    channel: "标准级加速生成通道",
    commercialLicense: "企业商用授权",
  },
  {
    id: "premium",
    name: "高级版",
    tagline: "高频交付",
    monthlyPrice: 999,
    bonusCredits: 999,
    monthlyCredits: 10989,
    conversion: "¥10=110",
    maxImages: 10989,
    maxSeconds: 2197,
    storageGb: 600,
    concurrency: 30,
    projects: 50,
    channel: "旗舰级加速生成通道",
    commercialLicense: "企业商用授权",
  },
  {
    id: "pro",
    name: "专业版",
    tagline: "专业生产",
    monthlyPrice: 2299,
    bonusCredits: 3678,
    monthlyCredits: 26668,
    conversion: "¥10=115",
    maxImages: 26668,
    maxSeconds: 5333,
    storageGb: 900,
    concurrency: 60,
    projects: 80,
    channel: "旗舰级加速生成通道",
    commercialLicense: "企业商用授权",
  },
];

// ─── 团队席位加购 ────────────────────────────────────────────────────────────
// 定价策略：团队版基础含 3 席位（= 个人价 ×2），
// 第 4 席起每席加收个人版当前周期月价的 1/2（积分池同步 +50% 基础额度）
export const TEAM_BASE_SEATS = 3;
export const TEAM_MAX_SEATS = 10;

/** 个人当前周期月价：包季 85 折 round，包年按年付折合月价 */
export function cycleMonthlyPrice(plan: MemberPlan, cycle: MemberCycle): number {
  if (cycle === "month") return plan.monthlyPrice;
  if (cycle === "quarter") return Math.round(plan.monthlyPrice * 0.85);
  return yearlyMonthlyPrice(plan);
}

/** 加席单价：个人版当前周期月价 × 1/2（round 取整，与周期联动） */
export function extraSeatPrice(plan: MemberPlan, cycle: MemberCycle): number {
  return Math.round(cycleMonthlyPrice(plan, cycle) * 0.5);
}

/** 团队 N 席位的积分池：基础 ×2 + 每加一席 +0.5 基础 */
export function teamCredits(plan: MemberPlan, seats: number): number {
  return Math.round(plan.monthlyCredits * (2 + 0.5 * (seats - TEAM_BASE_SEATS)));
}

/** 年付折合月价：月价 × 0.67（与参考站年付力度对齐，取整） */
export function yearlyMonthlyPrice(plan: MemberPlan): number {
  return Math.round(plan.monthlyPrice * 0.67);
}

export const CYCLES: {
  id: MemberCycle;
  label: string;
  discount: string;
}[] = [
  { id: "month", label: "连续包月", discount: "" },
  { id: "quarter", label: "连续包季", discount: "85折" },
  { id: "year", label: "连续包年", discount: "67折" },
];

// 数据驱动的年付折扣文案（取最低档，如「低至67折」），
// 供定价页 tab 徽标、个人中心会员引导等处复用，避免文案硬编码
export function yearlyDiscountLabel() {
  const min = Math.min(
    ...MEMBER_PLANS.map((p) => yearlyMonthlyPrice(p) / p.monthlyPrice),
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
    a: "积分是平台统一算力货币，1 元 = 10 积分。可通过开通会员、单独购买积分包、每日登录赠送获得，也可参与平台不定期活动获得。所有模型与功能消耗统一扣积分，积分不可提现、不可转赠。",
  },
  {
    q: "积分的计费规则，具体是怎么扣除的？",
    a: "提交任务时扣除对应积分，不同模型、不同参数消耗不同，提交前可在生成位置查看预估消耗。生成失败被扣的积分将在 24 小时内返还至原账户。",
  },
  {
    q: "我有赠送、会员、充值的积分，扣除顺序是什么？",
    a: "扣除顺序为：赠送积分（登录/活动）→ 会员积分 → 充值积分。同类型积分按先进先出消耗，尽量为您保留付费充值积分。",
  },
  {
    q: "各类积分的有效期是多久？",
    a: "个人会员积分按月下发，自到账起 30 天有效，到期重置；团队会员积分一次性到账，有效期以所购套餐为准；充值通用积分 365 天有效；每日登录积分仅限当日使用，次日清零。",
  },
  {
    q: "订阅后切换套餐，积分及权益会怎么变化？",
    a: "升级套餐即时生效，差价按剩余天数折算补缴；降级套餐于当前周期结束后生效。已发放积分按各自有效期规则执行，权益按新套餐执行。",
  },
  {
    q: "关于自动续费与取消自动续费？",
    a: "个人会员默认连续订阅，可在支付渠道取消自动续费，取消后当前计费周期内仍可继续使用，到期后不再扣费；团队会员为单次购买，无自动续费。",
  },
  {
    q: "如何申请退款？",
    a: "会员与积分属于虚拟数字商品，开通后权益即时生效，一经购买不支持无理由退款或转让。如遇重复扣款或系统异常，请联系客服处理。",
  },
  {
    q: "账单凭证下载与企业开发票服务",
    a: "点击头像进入「账户管理 - 账单发票」即可自助申请；支持增值税普通/专用发票，3 个工作日内开具。",
  },
];
