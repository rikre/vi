import { listOrders } from "@/lib/admin/queries";
import { handleRouteError, jsonOk, requirePermission } from "@/lib/admin/http";
import { parseListQuery } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "orders:read");
    return jsonOk(await listOrders(parseListQuery(request.url)));
  } catch (error) {
    return handleRouteError(error);
  }
}
