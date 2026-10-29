import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { CampaignCarousel } from "@/components/home/campaign-carousel";
import { HomeHero } from "@/components/home/home-hero";
import {
  ArtistSection,
  InsightSection,
  IpLibrarySection,
  QuickActions,
  TheaterSection,
} from "@/components/home/home-sections";
import {
  toArtistItems,
  toCampaignSlides,
  toIpItems,
  toQuickActions,
  toTheaterItems,
  toTrendCards,
  toWideBanner,
} from "@/components/home/placement-mappers";
import {
  ARTISTS,
  CAMPAIGN_SLIDES,
  IP_LIBRARY,
  QUICK_ACTIONS,
  THEATERS,
  TREND_CARDS,
  WIDE_BANNER,
} from "@/components/home/home-data";
import { getActivePlacementItems } from "@/lib/placements";

/**
 * 首页：7 个运营位逐一从 DB 拉取当前生效素材；
 * 返回 null（不存在 / 停用 / DB 错误 / 空）时回退静态数据，永不白屏。
 */
export default async function HomePage() {
  const [
    carouselItems,
    bannerItems,
    quickActionItems,
    trendCardItems,
    ipItems,
    artistItems,
    theaterItems,
  ] = await Promise.all([
    getActivePlacementItems("home_carousel"),
    getActivePlacementItems("home_banner"),
    getActivePlacementItems("home_quick_actions"),
    getActivePlacementItems("home_trend_cards"),
    getActivePlacementItems("home_ip_library"),
    getActivePlacementItems("home_artists"),
    getActivePlacementItems("home_theaters"),
  ]);

  const slides = carouselItems ? toCampaignSlides(carouselItems) : CAMPAIGN_SLIDES;
  const banner = bannerItems ? toWideBanner(bannerItems) ?? WIDE_BANNER : WIDE_BANNER;

  return (
    <AppShell banner={<CampaignCarousel slides={slides} />}>
      <div className="workspace-background h-full overflow-y-auto">
        <div className="mx-auto max-w-[1360px] px-4 pb-16 md:px-6 xl:px-0">
          <HomeHero />
          <QuickActions items={quickActionItems ? toQuickActions(quickActionItems) : QUICK_ACTIONS} />
          <InsightSection
            trendCards={trendCardItems ? toTrendCards(trendCardItems) : TREND_CARDS}
            banner={banner}
          />
          <IpLibrarySection items={ipItems ? toIpItems(ipItems) : IP_LIBRARY} />
          <ArtistSection items={artistItems ? toArtistItems(artistItems) : ARTISTS} />
          <TheaterSection items={theaterItems ? toTheaterItems(theaterItems) : THEATERS} />
          <Footer />
        </div>
      </div>
    </AppShell>
  );
}
