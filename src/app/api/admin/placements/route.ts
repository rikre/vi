import { listPlacements } from "@/lib/admin/queries";
import { handleRouteError, jsonOk, requirePermission } from "@/lib/admin/http";

/** 全部运营位 + 素材（含隐藏），供后台配置视图一次性拉取。 */
export async function GET(request: Request) {
  try {
    await requirePermission(request, "placements:read");
    return jsonOk(await listPlacements());
  } catch (error) {
    return handleRouteError(error);
  }
}
