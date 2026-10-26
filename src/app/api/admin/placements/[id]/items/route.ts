import { createPlacementItem } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, placementItemInputSchema } from "@/lib/admin/validation";

/** 在指定运营位下新建素材。路径参数中的 id 为唯一可信来源。 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "placements:manage");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少运营位 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = placementItemInputSchema.parse(body);
    return jsonOk(await createPlacementItem(id, input, session, readIdempotencyKey(request)), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
