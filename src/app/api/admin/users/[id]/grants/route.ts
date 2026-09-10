import { grantEntitlement } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { grantInputSchema, parseJsonBody } from "@/lib/admin/validation";

/**
 * 定向权益发放（加积分 / 配会员 / 配算力）。
 * 路径参数中的 userId 为唯一可信来源，请求体中的 userId 会被覆盖。
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "users:grant");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少用户 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = grantInputSchema.parse({ ...body, userId: id });
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await grantEntitlement(input, session, idempotencyKey), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
