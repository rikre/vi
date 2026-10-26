import { addOrganizationMember } from "@/lib/admin/mutations";
import { getOrganizationMembers } from "@/lib/admin/queries";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { organizationMemberInputSchema, parseJsonBody } from "@/lib/admin/validation";

/** 企业成员列表：含主账号标记与席位占用。路径参数中的 id 为唯一可信来源。 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requirePermission(request, "organizations:read");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少企业 ID");
    return jsonOk(await getOrganizationMembers(id));
  } catch (error) {
    return handleRouteError(error);
  }
}

/** 添加企业成员：事务内校验席位、用户状态与归属冲突，写审计 + 幂等。 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "organizations:manage");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少企业 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = organizationMemberInputSchema.parse(body);
    return jsonOk(await addOrganizationMember(id, input, session, readIdempotencyKey(request)), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
