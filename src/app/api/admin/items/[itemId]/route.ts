import { deletePlacementItem, updatePlacementItem } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, placementItemPatchSchema } from "@/lib/admin/validation";

/** 更新运营位素材（含排序、上下架、定时窗口）。路径参数中的 itemId 为唯一可信来源。 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const session = await requirePermission(request, "placements:manage");
    const { itemId } = await params;
    if (!itemId) throw new AdminApiError(400, "INVALID_REQUEST", "缺少素材 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    // 链接/时间字段经 zod transform 后空对象也会输出 null，schema 层无法判定"至少一字段"，因此在这里基于原始 body 判断
    if (Object.keys(body).length === 0) {
      throw new AdminApiError(400, "VALIDATION_ERROR", "至少需要提供一个待更新字段");
    }
    const input = placementItemPatchSchema.parse(body);
    return jsonOk(await updatePlacementItem(itemId, input, session, readIdempotencyKey(request)));
  } catch (error) {
    return handleRouteError(error);
  }
}

/** 删除运营位素材。 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const session = await requirePermission(request, "placements:manage");
    const { itemId } = await params;
    if (!itemId) throw new AdminApiError(400, "INVALID_REQUEST", "缺少素材 ID");
    return jsonOk(await deletePlacementItem(itemId, session, readIdempotencyKey(request)));
  } catch (error) {
    return handleRouteError(error);
  }
}
