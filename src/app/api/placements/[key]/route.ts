import { NextResponse } from "next/server";
import { queryPlacementItems } from "@/lib/placements";

/**
 * 公共运营位素材接口（无鉴权）：
 * - placement 不存在或停用 → 404
 * - DB 错误 → 503（客户端走兜底）
 * - 正常 → { data: items }，dev 阶段不缓存
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const result = await queryPlacementItems(key);
  if (!result.ok) {
    if (result.reason === "db_error") {
      return NextResponse.json(
        { error: { code: "DATABASE_UNAVAILABLE", message: "运营位数据暂不可用" } },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { error: { code: "PLACEMENT_NOT_FOUND", message: "运营位不存在或已停用" } },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { data: result.items },
    { headers: { "Cache-Control": "no-store" } },
  );
}
