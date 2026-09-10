import { saveModelSecret } from "@/lib/admin/mutations";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
  readIdempotencyKey,
  requirePermission,
} from "@/lib/admin/http";
import { modelSecretSchema, parseJsonBody } from "@/lib/admin/validation";

/**
 * 模型密钥写入：仅 models:secret 权限（commercial_ops / finance / support 不具备）。
 * 响应只包含 secretRef 与 apiKeyLast4，密钥明文不落日志、不回显。
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission(request, "models:secret");
    const { id } = await params;
    if (!id) throw new AdminApiError(400, "INVALID_REQUEST", "缺少模型 ID");
    const body = await parseJsonBody(request);
    if (!body) throw new AdminApiError(400, "INVALID_REQUEST", "请求体必须是 JSON 对象");
    const { secret } = modelSecretSchema.parse(body);
    const idempotencyKey = readIdempotencyKey(request);
    return jsonOk(await saveModelSecret(id, secret, session, idempotencyKey));
  } catch (error) {
    return handleRouteError(error);
  }
}
