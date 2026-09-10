import { listUsage } from "@/lib/admin/queries";
import { handleRouteError, jsonOk, requirePermission } from "@/lib/admin/http";
import { parseListQuery } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "usage:read");
    return jsonOk(await listUsage(parseListQuery(request.url)));
  } catch (error) {
    return handleRouteError(error);
  }
}
