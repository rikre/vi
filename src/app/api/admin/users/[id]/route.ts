import { getUser } from "@/lib/admin/queries";
import { AdminApiError, handleRouteError, jsonOk, requirePermission } from "@/lib/admin/http";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requirePermission(request, "users:read");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少用户 ID");
    return jsonOk(await getUser(id));
  } catch (error) {
    return handleRouteError(error);
  }
}
