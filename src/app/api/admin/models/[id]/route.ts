import { saveModel } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { modelInputSchema, parseJsonBody } from "@/lib/admin/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "models:write");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少模型 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = modelInputSchema.parse(body);
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await saveModel(input, session, idempotencyKey, id));
  } catch (error) {
    return handleRouteError(error);
  }
}
