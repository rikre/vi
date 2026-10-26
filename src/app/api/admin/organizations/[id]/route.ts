import { updateOrganization } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { organizationPatchSchema, parseJsonBody } from "@/lib/admin/validation";

/** 企业配置与折扣更新（含状态）。路径参数中的 id 为唯一可信来源。 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "organizations:manage");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少企业 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = organizationPatchSchema.parse(body);
    return jsonOk(await updateOrganization(id, input, session, readIdempotencyKey(request)));
  } catch (error) {
    return handleRouteError(error);
  }
}
