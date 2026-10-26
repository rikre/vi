import { removeOrganizationMember } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";

/**
 * 移除企业成员：主账号必须先更换（400 ADMIN_MEMBER_REQUIRED）。
 * 幂等语义：目标不是本企业成员时返回 404 MEMBER_NOT_FOUND（天然幂等，重复调用以 404 表示已完成）。
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  try {
    const session = await requirePermission(request, "organizations:manage");
    const { id, userId } = await params;
    if (!id || !userId) throw new AdminApiError(400, "INVALID_REQUEST", "缺少企业或用户 ID");
    return jsonOk(await removeOrganizationMember(id, userId, session, readIdempotencyKey(request)));
  } catch (error) {
    return handleRouteError(error);
  }
}
