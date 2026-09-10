import { randomUUID } from "node:crypto";
import { listModels } from "@/lib/admin/queries";
import { saveModel } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { modelInputSchema, parseJsonBody } from "@/lib/admin/validation";
import { z } from "zod";

const modelCreateSchema = modelInputSchema.extend({
  id: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,63}$/).optional(),
});

export async function GET(request: Request) {
  try {
    await requirePermission(request, "models:read");
    return jsonOk({ items: await listModels() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission(request, "models:write");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const { id, ...input } = modelCreateSchema.parse(body);
    const modelId = id ?? `model-${randomUUID().slice(0, 12)}`;
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await saveModel(input, session, idempotencyKey, modelId), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
