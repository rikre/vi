import { updateUserStatus } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, userStatusSchema } from "@/lib/admin/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "users:status");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少用户 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const { status, reason } = userStatusSchema.parse(body);
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await updateUserStatus(id, status, reason, session, idempotencyKey));
  } catch (error) {
    return handleRouteError(error);
  }
}
