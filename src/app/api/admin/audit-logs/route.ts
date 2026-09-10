import { listAuditLogs } from "@/lib/admin/queries";
import { handleRouteError, jsonOk, requirePermission } from "@/lib/admin/http";
import { parseListQuery } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "audit-logs:read");
    return jsonOk(await listAuditLogs(parseListQuery(request.url)));
  } catch (error) {
    return handleRouteError(error);
  }
}
