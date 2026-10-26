import type { PlacementItem } from "@prisma/client";
import { getPrisma } from "@/lib/db";

/**
 * 运营位公共消费层（前台首页）。
 * 铁律：任何 DB 错误返回 null，调用方回退静态数据，首页永不白屏。
 */

export type PlacementView = {
  id: string;
  placementId: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  iconKey: string | null;
  linkUrl: string | null;
  badge: string | null;
  sortOrder: number;
  status: "active" | "hidden";
  startAt: string | null;
  endAt: string | null;
  extra: Record<string, unknown> | null;
};

export type PlacementQueryResult =
  | { ok: true; items: PlacementView[] }
  | { ok: false; reason: "not_found" | "disabled" }
  | { ok: false; reason: "db_error" };

function mapItem(row: PlacementItem): PlacementView {
  return {
    id: row.id,
    placementId: row.placementId,
    title: row.title,
    subtitle: row.subtitle ?? null,
    imageUrl: row.imageUrl ?? null,
    iconKey: row.iconKey ?? null,
    linkUrl: row.linkUrl ?? null,
    badge: row.badge ?? null,
    sortOrder: row.sortOrder,
    status: row.status === "hidden" ? "hidden" : "active",
    startAt: row.startAt ? row.startAt.toISOString() : null,
    endAt: row.endAt ? row.endAt.toISOString() : null,
    extra: (row.extra ?? null) as Record<string, unknown> | null,
  };
}

/** 查询运营位当前生效素材：placement 存在且启用 + status=active + 当前时间在 [startAt, endAt] 窗口内。 */
export async function queryPlacementItems(key: string): Promise<PlacementQueryResult> {
  try {
    const now = new Date();
    const placement = await getPrisma().placement.findUnique({ where: { id: key } });
    if (!placement) return { ok: false, reason: "not_found" };
    if (!placement.enabled) return { ok: false, reason: "disabled" };
    const rows = await getPrisma().placementItem.findMany({
      where: {
        placementId: key,
        status: "active",
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return { ok: true, items: rows.map(mapItem) };
  } catch {
    // DB 不可用 / 未配置：让调用方走静态兜底，不抛错
    return { ok: false, reason: "db_error" };
  }
}

/**
 * 首页 server 组件取数入口：
 * 返回 null（不存在 / 停用 / DB 错误 / 空素材）时，调用方使用静态数据兜底。
 */
export async function getActivePlacementItems(key: string): Promise<PlacementView[] | null> {
  const result = await queryPlacementItems(key);
  if (!result.ok || result.items.length === 0) return null;
  return result.items;
}
