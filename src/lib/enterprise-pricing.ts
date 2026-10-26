/**
 * 企业订单定价：服务端 mutation 与后台预览共用同一公式，保证金额一致。
 * 全程整数（分）运算，禁止浮点记账：
 * - 原价（分）= round(credits × 100 / creditsPerYuan)
 * - 折后价（分）= round(credits × (100 - discountPct) / creditsPerYuan)
 *   （等价于 round(credits × 100 × (100 - discountPct) / creditsPerYuan / 100)，
 *    折扣直接作用于精确积分价值而非四舍五入后的原价，避免二次舍入误差）
 * 数值范围校验：credits ≤ 1e8 时中间值 ≤ 1e12，远小于 Number.MAX_SAFE_INTEGER。
 */
export function computeEnterpriseOrderPricing(
  credits: number,
  creditsPerYuan: number,
  discountPct: number,
): { originalCent: number; amountCent: number } {
  if (!Number.isInteger(credits) || credits < 1) {
    throw new Error("企业订单积分必须为正整数");
  }
  if (!Number.isInteger(creditsPerYuan) || creditsPerYuan < 1) {
    throw new Error("积分汇率必须为正整数");
  }
  if (!Number.isInteger(discountPct) || discountPct < 0 || discountPct > 90) {
    throw new Error("折扣百分比必须在 0-90 之间");
  }
  const originalCent = Math.round((credits * 100) / creditsPerYuan);
  const amountCent = Math.round((credits * (100 - discountPct)) / creditsPerYuan);
  return { originalCent, amountCent };
}

/** 折扣显示：30 →「七折」风格换算（减免百分比 → 中式折扣）。 */
export function discountLabel(discountPct: number): string {
  if (discountPct <= 0) return "无折扣";
  const remaining = 100 - discountPct;
  if (remaining % 10 === 0) {
    const tenths = remaining / 10;
    const labels = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
    return `${labels[tenths - 1]}折`;
  }
  return `-${discountPct}%`;
}
