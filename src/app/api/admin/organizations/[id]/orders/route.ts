import { createEnterpriseOrder } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { enterpriseOrderInputSchema, parseJsonBody } from "@/lib/admin/validation";

/**
 * 企业订单创建：线下对公收款核销后建单并即时发放企业积分。
 * 路径参数中的企业 ID 为唯一可信来源；金额按企业折扣与平台积分汇率整数分计算。
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "organizations:manage");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少企业 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = enterpriseOrderInputSchema.parse(body);
    return jsonOk(await createEnterpriseOrder(input, id, session, readIdempotencyKey(request)), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
