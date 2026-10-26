import { createOrganization } from "@/lib/admin/mutations";
import { listOrganizations } from "@/lib/admin/queries";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { organizationInputSchema, parseJsonBody, parseListQuery } from "@/lib/admin/validation";

/** 企业列表：含成员数、企业订单数与累计金额、企业管理员昵称。 */
export async function GET(request: Request) {
  try {
    await requirePermission(request, "organizations:read");
    return jsonOk(await listOrganizations(parseListQuery(request.url)));
  } catch (error) {
    return handleRouteError(error);
  }
}

/** 新建企业（企业配置 + 折扣配置）。 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission(request, "organizations:manage");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = organizationInputSchema.parse(body);
    return jsonOk(await createOrganization(input, session, readIdempotencyKey(request)), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
