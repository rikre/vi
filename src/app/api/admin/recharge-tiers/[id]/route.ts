import { saveRechargeTier } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, rechargeTierInputSchema } from "@/lib/admin/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "recharge-tiers:write");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少档位 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = rechargeTierInputSchema.parse({ ...body, id });
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await saveRechargeTier(input, session, idempotencyKey, id));
  } catch (error) {
    return handleRouteError(error);
  }
}
