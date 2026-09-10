import { getDashboard } from "@/lib/admin/queries";
import { handleRouteError, jsonOk, requirePermission } from "@/lib/admin/http";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "dashboard:view");
    return jsonOk(await getDashboard());
  } catch (error) {
    return handleRouteError(error);
  }
}
