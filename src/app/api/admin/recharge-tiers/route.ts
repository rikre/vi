import { listRechargeTiers } from "@/lib/admin/queries";
import { saveRechargeTier } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { parseJsonBody, rechargeTierInputSchema } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "recharge-tiers:read");
    return jsonOk({ items: await listRechargeTiers() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission(request, "recharge-tiers:write");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = rechargeTierInputSchema.parse(body);
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await saveRechargeTier(input, session, idempotencyKey), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
