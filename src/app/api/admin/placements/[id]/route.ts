import { updatePlacement } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, placementPatchSchema } from "@/lib/admin/validation";

/** 运营位整位启停 / 改名。路径参数中的 id 为唯一可信来源。 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "placements:manage");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少运营位 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = placementPatchSchema.parse(body);
    return jsonOk(await updatePlacement(id, input, session, readIdempotencyKey(request)));
  } catch (error) {
    return handleRouteError(error);
  }
}
