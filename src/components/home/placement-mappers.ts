// 运营位 DB 素材 → 首页组件现有 props 类型的映射。
// extra JSON 还原静态数据富字段（TrendCard 统计、TheaterItem 标签、轮播 highlights 等）。
import type { PlacementView } from "@/lib/placements";
import type {
  ArtistItem,
  CampaignSlide,
  IpItem,
  QuickAction,
  TheaterItem,
  TrendCard,
} from "./home-data";

function extraOf(item: PlacementView): Record<string, unknown> {
  return item.extra ?? {};
}

function str(extra: Record<string, unknown>, key: string): string {
  return typeof extra[key] === "string" ? (extra[key] as string) : "";
}

function num(extra: Record<string, unknown>, key: string): number {
  return typeof extra[key] === "number" ? (extra[key] as number) : 0;
}

function strArray(extra: Record<string, unknown>, key: string): string[] {
  return Array.isArray(extra[key]) ? (extra[key] as unknown[]).filter((v): v is string => typeof v === "string") : [];
}

/** 轮播：extra.staticId 保留静态 id（趋势卡热榜特判、React key 稳定）。 */
export function toCampaignSlides(items: PlacementView[]): CampaignSlide[] {
  return items.map((item) => {
    const extra = extraOf(item);
    const highlights = Array.isArray(extra.highlights)
      ? (extra.highlights as unknown[])
          .filter(
            (entry): entry is { label: string; value: string } =>
              typeof entry === "object" &&
              entry !== null &&
              typeof (entry as { label?: unknown }).label === "string" &&
              typeof (entry as { value?: unknown }).value === "string",
          )
          .map((entry) => ({ label: entry.label, value: entry.value }))
      : [];
    return {
      id: str(extra, "staticId") || item.id,
      href: item.linkUrl ?? "#",
      title: item.title,
      highlights,
      countdownDays: typeof extra.countdownDays === "number" ? (extra.countdownDays as number) : undefined,
    };
  });
}

/** 通栏横幅（single 类型，取第一条）。 */
export function toWideBanner(items: PlacementView[]): { text: string; img: string; character: string; href: string } | null {
  const item = items[0];
  if (!item) return null;
  return {
    text: item.title,
    img: item.imageUrl ?? "",
    character: str(extraOf(item), "character"),
    href: item.linkUrl ?? "#",
  };
}

export function toQuickActions(items: PlacementView[]): QuickAction[] {
  return items.map((item) => ({
    title: item.title,
    desc: item.subtitle ?? "",
    img: item.imageUrl ?? "",
    href: item.linkUrl ?? "#",
  }));
}

export function toTrendCards(items: PlacementView[]): TrendCard[] {
  return items.map((item) => {
    const extra = extraOf(item);
    return {
      id: str(extra, "staticId") || item.id,
      title: item.title,
      date: str(extra, "date"),
      percent: str(extra, "percent"),
      direction: extra.direction === "down" ? "down" : "flat",
      hotCount: num(extra, "hotCount"),
      newCount: num(extra, "newCount"),
      tags: strArray(extra, "tags"),
      href: item.linkUrl ?? "#",
    };
  });
}

export function toIpItems(items: PlacementView[]): IpItem[] {
  return items.map((item) => {
    const extra = extraOf(item);
    return {
      title: item.title,
      level: str(extra, "level"),
      channel: str(extra, "channel"),
      genre: str(extra, "genre"),
      img: item.imageUrl ?? "",
      href: item.linkUrl ?? "#",
    };
  });
}

export function toArtistItems(items: PlacementView[]): ArtistItem[] {
  return items.map((item) => ({
    name: item.title,
    desc: item.subtitle ?? "",
    img: item.imageUrl ?? "",
  }));
}

export function toTheaterItems(items: PlacementView[]): TheaterItem[] {
  return items.map((item) => ({
    title: item.title,
    author: item.subtitle ?? "",
    img: item.imageUrl ?? "",
  }));
}
