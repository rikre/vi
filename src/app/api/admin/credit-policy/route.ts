import { getCreditPolicy } from "@/lib/admin/queries";
import { saveCreditPolicy } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { creditPolicyInputSchema, parseJsonBody } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "credit-policy:read");
    return jsonOk(await getCreditPolicy());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requirePermission(request, "credit-policy:write");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const input = creditPolicyInputSchema.parse(body);
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await saveCreditPolicy(input, session, idempotencyKey));
  } catch (error) {
    return handleRouteError(error);
  }
}
