import { savePlan } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, planInputSchema } from "@/lib/admin/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "plans:write");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少套餐 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = planInputSchema.parse({ ...body, id });
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await savePlan(input, session, idempotencyKey, id));
  } catch (error) {
    return handleRouteError(error);
  }
}
