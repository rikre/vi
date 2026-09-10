import { listPlans } from "@/lib/admin/queries";
import { savePlan } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, planInputSchema } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "plans:read");
    return jsonOk({ items: await listPlans() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission(request, "plans:write");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = planInputSchema.parse(body);
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await savePlan(input, session, idempotencyKey), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
